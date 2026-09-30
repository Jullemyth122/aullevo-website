import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface GlassWaterShaderProps {
  className?: string;
  rippleTrigger?: { x: number; y: number; timestamp: number } | null;
}

const vsSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision highp float;

  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec4 iMouse;
  uniform float uTheme; // 0.0 = dark, 1.0 = light
  uniform vec4 uRipple0; // (rx, ry, rStartTime, rIntensity)
  uniform vec4 uRipple1;
  uniform vec4 uRipple2;
  varying vec2 vUv;

  // Hash function for random cell jitter
  vec2 hash22(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453123);
  }

  // Directional Trochoidal wave octave with steep peak sharpening
  float trochoidalWave(vec2 p, vec2 dir, float freq, float speed, float t, float steepness) {
      float phase = dot(p, dir) * freq + t * speed;
      float s = sin(phase);
      return pow(s * 0.5 + 0.5, steepness) * 2.0 - 1.0;
  }

  // Physical wave packet calculation for concentric expanding water ripples
  float evalRipple(vec4 rip, vec2 suv, float aspect, float t) {
      if (rip.w < 0.001) return 0.0;
      float rAge = t - rip.z;
      if (rAge <= 0.0 || rAge > 3.2) return 0.0;
      
      vec2 ripSuv = vec2(rip.x * aspect, rip.y);
      float dist = length(suv - ripSuv);
      
      float waveSpeed = 0.52;
      float waveFront = rAge * waveSpeed;
      float delta = dist - waveFront;
      
      // Expanding Gaussian wave envelope centered around waveFront
      float envelope = exp(-pow(delta / 0.048, 2.0));
      // Ring oscillations with capillary dispersion
      float osc = sin(delta * 34.0 - rAge * 6.5);
      // Radial 1/sqrt(r) energy conservation & time damping
      float radAtten = 1.0 / (sqrt(dist) * 2.6 + 0.18);
      float timeDecay = exp(-rAge * 1.45) * rip.w;
      
      // Secondary cavity rebound ripple
      float echoAge = rAge - 0.24;
      float echo = 0.0;
      if (echoAge > 0.0) {
          float echoFront = echoAge * 0.44;
          float echoDelta = dist - echoFront;
          echo = exp(-pow(echoDelta / 0.038, 2.0)) * sin(echoDelta * 40.0) * exp(-echoAge * 2.2) * 0.32;
      }
      
      return (envelope * osc + echo) * radAtten * timeDecay * 0.45;
  }

  // Fluid heightmap combining directional swells, capillary waves, ripples, and mouse wake
  float waterHeight(vec2 suv, float aspect, float t) {
      // Fluid domain warping to break cartesian grid alignment
      vec2 p = suv * 3.4;
      p += vec2(
          sin(p.y * 1.7 + t * 0.65),
          cos(p.x * 1.7 - t * 0.55)
      ) * 0.18;

      float h = 0.0;
      
      // Harmonic wave superposition at organic, non-aligned directional vectors
      h += 0.36 * trochoidalWave(p, normalize(vec2(0.84, 0.54)), 1.35, 0.82, t, 1.25);
      h += 0.24 * trochoidalWave(p, normalize(vec2(-0.66, 0.75)), 2.20, -0.92, t, 1.35);
      h += 0.14 * trochoidalWave(p, normalize(vec2(0.38, -0.92)), 3.60, 1.28, t, 1.45);
      h += 0.07 * trochoidalWave(p, normalize(vec2(-0.90, -0.42)), 6.20, -1.65, t, 1.60);
      h += 0.035 * sin(dot(p, vec2(9.8, -7.6)) + t * 2.4);

      // Multi-ripple superposition
      h += evalRipple(uRipple0, suv, aspect, t);
      h += evalRipple(uRipple1, suv, aspect, t);
      h += evalRipple(uRipple2, suv, aspect, t);

      // Interactive mouse pointer wake & fluid depression
      if (iMouse.z > 0.5) {
          vec2 mSuv = vec2(iMouse.x * aspect, iMouse.y);
          float mDist = length(suv - mSuv);
          float mDepress = -exp(-mDist * 13.0) * 0.14;
          float mWake = exp(-mDist * 6.0) * sin(mDist * 22.0 - t * 3.8) * 0.10;
          h += (mDepress + mWake);
      }

      return h;
  }

  // Worley F2 - F1 Voronoi cell boundary distance metric
  // Returns vec2(sqrt(d1), sqrt(d2) - sqrt(d1))
  vec2 voronoiEdges(vec2 p, float t) {
      vec2 n = floor(p);
      vec2 f = fract(p);
      
      float f1 = 8.0;
      float f2 = 8.0;
      
      for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
              vec2 g = vec2(float(i), float(j));
              vec2 o = hash22(n + g);
              // Harmonic circular cell motion simulating turbulent liquid eddies
              vec2 pos = g + 0.5 + 0.40 * sin(t + 6.2831853 * o);
              vec2 r = pos - f;
              float d = dot(r, r);
              
              if (d < f1) {
                  f2 = f1;
                  f1 = d;
              } else if (d < f2) {
                  f2 = d;
              }
          }
      }
      return vec2(sqrt(f1), sqrt(f2) - sqrt(f1));
  }

  // Caustic light intensity curve from Voronoi boundary distance
  float causticIntensity(vec2 vor, float sharpness, float brightness) {
      float edge = vor.y; // sqrt(d2) - sqrt(d1) -> 0 at cell boundaries
      float c = 1.0 / (edge * edge * sharpness + 0.13);
      return pow(c * brightness, 1.55);
  }

  // Multi-scale Voronoi caustics with dual-frequency interference
  float evaluateCaustics(vec2 p, float t) {
      // Macro caustic network (broad swimming pool bands)
      vec2 v1 = voronoiEdges(p * 5.4 + vec2(t * 0.16, -t * 0.12), t * 0.65);
      float c1 = causticIntensity(v1, 46.0, 0.22);
      
      // Micro caustic filaments (fine counter-drifting filaments)
      vec2 v2 = voronoiEdges(p * 10.2 + vec2(-t * 0.20, t * 0.15), t * 0.90);
      float c2 = causticIntensity(v2, 58.0, 0.18);
      
      // Multi-layer interference creates natural caustic webbing
      return min(c1, c2 * 1.35) + c1 * 0.58 + c2 * 0.32;
  }

  void main() {
      float aspect = iResolution.x / iResolution.y;
      vec2 suv = vec2(vUv.x * aspect, vUv.y);
      float t = iTime * 0.58;
      
      // Calculate surface normal via central differences on aspect-corrected fluid heightmap
      float eps = 0.0032;
      float hC = waterHeight(suv, aspect, t);
      float hR = waterHeight(suv + vec2(eps * aspect, 0.0), aspect, t);
      float hT = waterHeight(suv + vec2(0.0, eps), aspect, t);
      
      vec3 normal = normalize(vec3((hC - hR) * 18.0, (hC - hT) * 18.0, 1.0));
      
      // Directional light vector (sun origin top-left)
      vec3 lightDir = normalize(vec3(-0.40, 0.65, 0.65));
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      vec3 halfVec = normalize(lightDir + viewDir);
      
      // Dual-lobe specular reflections
      float NdotH = max(dot(normal, halfVec), 0.0);
      float specSharp = pow(NdotH, 88.0) * 1.8;
      float specSoft = pow(NdotH, 16.0) * 0.32;
      
      // Fresnel reflection factor (Schlick approximation)
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.4);
      
      // Subsurface scattering (SSS) glowing through wave crests facing light
      float sss = pow(max(dot(lightDir, -normal), 0.0), 2.2) * 0.65;
      
      // Optical domain warping: caustics refract through water surface curvature
      vec2 causticCoord = suv * 1.30 + normal.xy * 0.34;
      
      // Prismatic chromatic dispersion (RGB refract at slightly different angles)
      float dispersion = 0.022;
      float cR = evaluateCaustics(causticCoord + normal.xy * dispersion, t);
      float cG = evaluateCaustics(causticCoord, t);
      float cB = evaluateCaustics(causticCoord - normal.xy * dispersion, t);
      vec3 caustics = vec3(cR, cG, cB);
      
      vec3 waterColor;
      
      if (uTheme < 0.5) {
          // ══════════════════════════════════════════════════════
          // DARK MODE: Cosmic Obsidian Abyss & Electric Cyan Caustics
          // ══════════════════════════════════════════════════════
          vec3 deepAbyss = vec3(0.015, 0.038, 0.098);    // Deep midnight sapphire abyss
          vec3 royalCobalt = vec3(0.065, 0.20, 0.46);    // Rich cobalt mid-depth
          vec3 electricCyan = vec3(0.02, 0.88, 1.0);     // Luminous electric cyan caustic core
          vec3 neonBlue = vec3(0.14, 0.46, 0.95);        // Deep sapphire caustic wash
          vec3 chromaticPink = vec3(0.95, 0.30, 0.68);   // Prismatic dispersion fringe
          vec3 skySheen = vec3(0.18, 0.40, 0.78);        // Midnight sky Fresnel reflection
          
          // Organic fluid depth gradient
          float depthGrad = suv.y * 0.65 + (aspect - suv.x) * 0.35;
          vec3 base = mix(deepAbyss, royalCobalt, clamp(depthGrad * 0.72 + hC * 0.32, 0.0, 1.0));
          
          // Translucent wave crest glow (subsurface scattering)
          base += neonBlue * (sss * 0.45);
          
          // Caustic radiance with chromatic dispersion
          vec3 causticRadiance = caustics.r * chromaticPink * 0.24 +
                                 caustics.g * electricCyan * 0.78 +
                                 caustics.b * neonBlue * 0.85;
          
          // White-cyan peak nodes where caustic webs intersect
          float causticAvg = (caustics.r + caustics.g + caustics.b) * 0.333;
          float peakNode = clamp(causticAvg - 0.75, 0.0, 2.0);
          causticRadiance += vec3(0.92, 0.98, 1.0) * (peakNode * 1.3);
          
          // Compose dark mode water
          waterColor = base + causticRadiance;
          
          // Sparkling diamond sun/moon specular highlights
          waterColor += vec3(1.0) * specSharp;
          waterColor += electricCyan * specSoft;
          
          // Glassy Fresnel surface sheen
          waterColor += skySheen * (fresnel * 0.78);
      } else {
          // ══════════════════════════════════════════════════════
          // LIGHT MODE: Sun-Drenched Tropical Lagoon & White-Gold Caustics
          // ══════════════════════════════════════════════════════
          vec3 shallowLagoon = vec3(0.85, 0.94, 0.99);   // Clear sunlit water bed
          vec3 tropicalAqua = vec3(0.24, 0.72, 0.94);    // Vibrant turquoise volume
          vec3 deepAzure = vec3(0.08, 0.42, 0.76);       // Deep lagoon floor
          vec3 sunCaustic = vec3(1.0, 0.99, 0.95);       // Crisp white-gold sunlight caustics
          vec3 aquaGlow = vec3(0.32, 0.84, 0.98);        // Aquamarine caustic halo
          vec3 skyFresnel = vec3(0.72, 0.88, 0.98);      // Daylight sky reflection
          
          // Clear turquoise water depth gradient
          float depthGrad = suv.y * 0.60 + (aspect - suv.x) * 0.40;
          vec3 base = mix(shallowLagoon, mix(tropicalAqua, deepAzure, 0.48), clamp(depthGrad * 0.65 + hC * 0.25, 0.0, 1.0));
          
          // Caustic contrast shadows: light concentrated into bright lines leaves subtle darker borders
          float causticVal = (caustics.r + caustics.g + caustics.b) * 0.333;
          float causticShadow = smoothstep(0.10, 0.36, causticVal) * 0.16;
          base *= (1.0 - causticShadow);
          
          // Sunlit caustics with warm core and aquamarine halo
          vec3 causticColor = caustics.g * aquaGlow * 0.62 +
                              pow(causticVal, 1.5) * sunCaustic * 0.88;
          
          // Brilliant sunlight node reflections
          float peakNode = clamp(causticVal - 0.75, 0.0, 2.0);
          causticColor += vec3(1.0, 1.0, 1.0) * (peakNode * 1.55);
          
          // Subsurface wave illumination
          base += tropicalAqua * (sss * 0.38);
          
          // Compose light mode water
          waterColor = base + causticColor;
          
          // Diamond sunlight glints
          waterColor += vec3(1.0) * (specSharp * 1.5);
          waterColor += tropicalAqua * specSoft;
          
          // Translucent sky Fresnel sheen
          waterColor += skyFresnel * (fresnel * 0.58);
      }
      
      gl_FragColor = vec4(waterColor, 1.0);
  }
`;

export const GlassWaterShader: React.FC<GlassWaterShaderProps> = ({ className, rippleTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  // Ring buffer for up to 3 simultaneous ripple wave fronts
  const ripplesRef = useRef<Array<{ x: number; y: number; time: number; intensity: number }>>([
    { x: 0.5, y: 0.5, time: -10, intensity: 0 },
    { x: 0.5, y: 0.5, time: -10, intensity: 0 },
    { x: 0.5, y: 0.5, time: -10, intensity: 0 },
  ]);
  const rippleIndexRef = useRef(0);

  const addRipple = (normX: number, normY: number, intensity = 1.0) => {
    const timeSec = performance.now() / 1000;
    const idx = rippleIndexRef.current;
    ripplesRef.current[idx] = {
      x: normX,
      y: normY,
      time: timeSec,
      intensity,
    };
    rippleIndexRef.current = (idx + 1) % 3;
  };

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Handle external ripple triggers (e.g. from sample pill clicks, test bench buttons)
  useEffect(() => {
    if (rippleTrigger && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const normX = Math.max(0, Math.min(1, (rippleTrigger.x - rect.left) / rect.width));
        const normY = Math.max(0, Math.min(1, 1.0 - (rippleTrigger.y - rect.top) / rect.height));
        addRipple(normX, normY, 1.0);
      }
    }
  }, [rippleTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl2', { alpha: true, antialias: true }) ||
      canvas.getContext('webgl', { alpha: true, antialias: true })) as WebGLRenderingContext | null;

    if (!gl) {
      console.warn('WebGL not supported for GlassWaterShader');
      return;
    }

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'iResolution'),
      time: gl.getUniformLocation(program, 'iTime'),
      mouse: gl.getUniformLocation(program, 'iMouse'),
      theme: gl.getUniformLocation(program, 'uTheme'),
      ripple0: gl.getUniformLocation(program, 'uRipple0'),
      ripple1: gl.getUniformLocation(program, 'uRipple1'),
      ripple2: gl.getUniformLocation(program, 'uRipple2'),
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    updateSize();

    // Local pointer tracking relative to the stage/parent container
    let localMouseX = 0.5;
    let localMouseY = 0.5;
    let isHovered = false;

    // Attach listeners to parent container so pointer interactions work even if canvas is overlaid
    const targetEl = canvas.parentElement || canvas;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        localMouseX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        localMouseY = Math.max(0, Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height));
        isHovered = true;
      }
    };

    const handlePointerLeave = () => {
      isHovered = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const normY = Math.max(0, Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height));
        addRipple(normX, normY, 1.0);
      }
    };

    targetEl.addEventListener('pointermove', handlePointerMove as EventListener, { passive: true });
    targetEl.addEventListener('pointerleave', handlePointerLeave as EventListener, { passive: true });
    targetEl.addEventListener('pointerdown', handlePointerDown as EventListener, { passive: true });
    window.addEventListener('resize', updateSize, { passive: true });

    const startTime = performance.now();
    let animationFrameId: number;

    const render = () => {
      updateSize();
      const now = performance.now();
      const currentTime = (now - startTime) / 1000;
      const isLight = themeRef.current === 'light';

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
      gl.uniform1f(uniforms.time, currentTime);
      gl.uniform4f(uniforms.mouse, localMouseX, localMouseY, isHovered ? 1.0 : 0.0, 0.0);
      gl.uniform1f(uniforms.theme, isLight ? 1.0 : 0.0);

      const rips = ripplesRef.current;
      gl.uniform4f(uniforms.ripple0, rips[0].x, rips[0].y, rips[0].time, rips[0].intensity);
      gl.uniform4f(uniforms.ripple1, rips[1].x, rips[1].y, rips[1].time, rips[1].intensity);
      gl.uniform4f(uniforms.ripple2, rips[2].x, rips[2].y, rips[2].time, rips[2].intensity);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      targetEl.removeEventListener('pointermove', handlePointerMove as EventListener);
      targetEl.removeEventListener('pointerleave', handlePointerLeave as EventListener);
      targetEl.removeEventListener('pointerdown', handlePointerDown as EventListener);
      window.removeEventListener('resize', updateSize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`demo-glass-water-canvas ${className || ''}`}
      aria-hidden="true"
    />
  );
};

export default GlassWaterShader;

