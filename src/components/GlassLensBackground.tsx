import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

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
  uniform sampler2D iChannel0;
  uniform float uTheme; // 0.0 for dark, 1.0 for light
  varying vec2 vUv;

  void mainImage(out vec4 fragColor, in vec2 fragCoord)
  {
    // Physical & Optical Constants
    const float NUM_ZERO = 0.0;
    const float NUM_ONE = 1.0;
    const float NUM_HALF = 0.5;
    const float NUM_TWO = 2.0;
    const float POWER_EXPONENT = 6.0;
    const float MASK_MULTIPLIER_1 = 10000.0;
    const float MASK_MULTIPLIER_2 = 9500.0;
    const float MASK_MULTIPLIER_3 = 11000.0;
    const float LENS_MULTIPLIER = 5000.0;
    const float MASK_STRENGTH_1 = 8.0;
    const float MASK_STRENGTH_2 = 16.0;
    const float MASK_STRENGTH_3 = 2.0;
    const float MASK_THRESHOLD_1 = 0.95;
    const float MASK_THRESHOLD_2 = 0.9;
    const float MASK_THRESHOLD_3 = 1.5;
    const float SAMPLE_RANGE = 4.0;
    const float SAMPLE_OFFSET = 0.5;
    const float GRADIENT_RANGE = 0.2;
    const float GRADIENT_OFFSET = 0.1;
    const float GRADIENT_EXTREME = -1000.0;
    const float LIGHTING_INTENSITY = 0.35;

    vec2 uv = fragCoord / iResolution.xy;
    vec2 mouse = iMouse.xy;
    if (length(mouse) < NUM_ONE) {
      mouse = iResolution.xy / NUM_TWO;
    }
    vec2 m2 = (uv - mouse / iResolution.xy);

    // Aspect-ratio corrected power-6 squircle (Apple superellipse)
    float aspect = iResolution.x / iResolution.y;
    float roundedBox = pow(abs(m2.x * aspect), POWER_EXPONENT) + pow(abs(m2.y), POWER_EXPONENT);

    // Three mask layers: body, edge rim, and outer glow
    float rb1 = clamp((NUM_ONE - roundedBox * MASK_MULTIPLIER_1) * MASK_STRENGTH_1, NUM_ZERO, NUM_ONE);
    float rb2 = clamp((MASK_THRESHOLD_1 - roundedBox * MASK_MULTIPLIER_2) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE) -
      clamp(pow(MASK_THRESHOLD_2 - roundedBox * MASK_MULTIPLIER_2, NUM_ONE) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);
    float rb3 = clamp((MASK_THRESHOLD_3 - roundedBox * MASK_MULTIPLIER_3) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE) -
      clamp(pow(NUM_ONE - roundedBox * MASK_MULTIPLIER_3, NUM_ONE) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);

    fragColor = vec4(NUM_ZERO);
    float transition = smoothstep(NUM_ZERO, NUM_ONE, rb1 + rb2);

    if (transition > NUM_ZERO) {
      vec2 mouseUv = mouse / iResolution.xy;
      // Optical refraction centered around mouse position
      vec2 lens = ((uv - mouseUv) * (NUM_ONE - roundedBox * LENS_MULTIPLIER) + mouseUv);
      
      // Chromatic dispersion vector (wavelength splitting through glass edge)
      vec2 chromaVec = normalize(m2 + vec2(0.0001, 0.0001)) * 0.004 * (NUM_ONE - roundedBox * 3000.0);

      // 9x9 Gaussian/Box blur sampling kernel
      vec4 blurredColor = vec4(NUM_ZERO);
      float total = NUM_ZERO;

      for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x += 1.0) {
        for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y += 1.0) {
          vec2 offset = vec2(x, y) * SAMPLE_OFFSET / iResolution.xy;
          vec2 samplePos = offset + lens;
          
          // Authentic chromatic aberration (R diverging positive, B diverging negative)
          float r = texture2D(iChannel0, samplePos + chromaVec).r;
          float g = texture2D(iChannel0, samplePos).g;
          float b = texture2D(iChannel0, samplePos - chromaVec).b;
          float a = texture2D(iChannel0, samplePos).a;
          
          blurredColor += vec4(r, g, b, a);
          total += NUM_ONE;
        }
      }
      blurredColor /= total;

      // 3D Glass bevel & vertical directional lighting
      float gradient = clamp((clamp(m2.y, NUM_ZERO, GRADIENT_RANGE) + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE) +
        clamp((clamp(-m2.y, GRADIENT_EXTREME, GRADIENT_RANGE) * rb3 + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE);

      // Brand-tuned iridescent specular edge tint
      vec4 rimColor = mix(
        vec4(0.38, 0.68, 1.0, 1.0), // Royal cobalt-cyan rim in dark mode
        vec4(0.18, 0.45, 0.88, 1.0), // Deep royal cobalt rim in light mode
        uTheme
      );

      vec4 lighting = clamp(
        blurredColor + vec4(rb1) * gradient * 0.35 + rimColor * (rb2 * LIGHTING_INTENSITY),
        NUM_ZERO,
        NUM_ONE
      );

      vec4 baseColor = texture2D(iChannel0, uv);
      fragColor = mix(baseColor, lighting, transition);
    } else {
      fragColor = texture2D(iChannel0, uv);
    }
  }

  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
`;

export const GlassLensBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try WebGL2 first, fallback to standard WebGL
    const gl = (canvas.getContext('webgl2', { alpha: true, antialias: true }) ||
      canvas.getContext('webgl', { alpha: true, antialias: true })) as WebGLRenderingContext | null;

    if (!gl) {
      console.warn('WebGL not supported for GlassLensBackground');
      return;
    }

    // Helper to compile shaders
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

    // Quad buffer: [-1, -1, 1, -1, -1, 1, 1, 1]
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

    // Uniforms
    const uniforms = {
      resolution: gl.getUniformLocation(program, 'iResolution'),
      time: gl.getUniformLocation(program, 'iTime'),
      mouse: gl.getUniformLocation(program, 'iMouse'),
      texture: gl.getUniformLocation(program, 'iChannel0'),
      theme: gl.getUniformLocation(program, 'uTheme'),
    };

    // Offscreen canvas for procedural ambient cobalt chromatic background
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1024;
    offscreenCanvas.height = 576;
    const offCtx = offscreenCanvas.getContext('2d');

    // Texture setup
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Render ambient procedural background to offscreen canvas
    const renderOffscreenBackground = (t: number, isLight: boolean) => {
      if (!offCtx) return;
      const w = offscreenCanvas.width;
      const h = offscreenCanvas.height;

      // 1. Base gradient matching design tokens
      if (isLight) {
        const bgGrad = offCtx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#f1f5f9');
        bgGrad.addColorStop(1, '#e2e8f0');
        offCtx.fillStyle = bgGrad;
        offCtx.fillRect(0, 0, w, h);
      } else {
        const bgGrad = offCtx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.5, '#050b18');
        bgGrad.addColorStop(1, '#080e22');
        offCtx.fillStyle = bgGrad;
        offCtx.fillRect(0, 0, w, h);
      }

      // 2. Animated chromatic mesh blobs
      const drawBlob = (
        x: number,
        y: number,
        radius: number,
        colorInner: string,
        colorOuter: string
      ) => {
        const radGrad = offCtx.createRadialGradient(x, y, 0, x, y, radius);
        radGrad.addColorStop(0, colorInner);
        radGrad.addColorStop(0.55, colorOuter);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        offCtx.fillStyle = radGrad;
        offCtx.beginPath();
        offCtx.arc(x, y, radius, 0, Math.PI * 2);
        offCtx.fill();
      };

      if (isLight) {
        // Light mode: Royal cobalt blue, vibrant sky blue, and soft violet
        const b1x = w * 0.15 + Math.sin(t * 0.35) * 35;
        const b1y = h * 0.22 + Math.cos(t * 0.28) * 25;
        drawBlob(b1x, b1y, w * 0.45, 'rgba(26, 82, 150, 0.22)', 'rgba(37, 99, 235, 0.08)');

        const b2x = w * 0.85 + Math.cos(t * 0.3) * 35;
        const b2y = h * 0.42 + Math.sin(t * 0.4) * 30;
        drawBlob(b2x, b2y, w * 0.42, 'rgba(56, 189, 248, 0.25)', 'rgba(96, 165, 250, 0.08)');

        const b3x = w * 0.45 + Math.sin(t * 0.25) * 25;
        const b3y = h * 0.78 + Math.cos(t * 0.35) * 25;
        drawBlob(b3x, b3y, w * 0.38, 'rgba(129, 140, 248, 0.18)', 'rgba(168, 85, 247, 0.05)');

        // Prismatic caustics
        drawBlob(w * 0.06, h * 0.35, w * 0.28, 'rgba(255, 120, 150, 0.09)', 'rgba(255, 120, 150, 0)');
        drawBlob(w * 0.94, h * 0.6, w * 0.3, 'rgba(14, 165, 233, 0.12)', 'rgba(14, 165, 233, 0)');
      } else {
        // Dark mode: Deep royal cobalt (#1a5296), electric blue (#2563eb), cyan and violet caustics
        const b1x = w * 0.15 + Math.sin(t * 0.35) * 45;
        const b1y = h * 0.18 + Math.cos(t * 0.28) * 35;
        drawBlob(b1x, b1y, w * 0.5, 'rgba(26, 82, 150, 0.45)', 'rgba(37, 99, 235, 0.12)');

        const b2x = w * 0.85 + Math.cos(t * 0.3) * 45;
        const b2y = h * 0.45 + Math.sin(t * 0.4) * 35;
        drawBlob(b2x, b2y, w * 0.45, 'rgba(37, 99, 235, 0.38)', 'rgba(6, 182, 212, 0.15)');

        const b3x = w * 0.45 + Math.sin(t * 0.25) * 35;
        const b3y = h * 0.82 + Math.cos(t * 0.35) * 30;
        drawBlob(b3x, b3y, w * 0.42, 'rgba(15, 52, 96, 0.4)', 'rgba(124, 58, 237, 0.12)');

        // Prismatic caustics (red-rose on left, electric cyan on right)
        drawBlob(w * 0.05, h * 0.4, w * 0.32, 'rgba(255, 80, 120, 0.15)', 'rgba(255, 80, 120, 0)');
        drawBlob(w * 0.95, h * 0.65, w * 0.35, 'rgba(6, 182, 212, 0.18)', 'rgba(6, 182, 212, 0)');
      }

      // 3. Subtle micro-grid dots for high-tech optical feel
      const dotSpacing = 44;
      offCtx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.035)' : 'rgba(255, 255, 255, 0.04)';
      for (let x = 22; x < w; x += dotSpacing) {
        for (let y = 22; y < h; y += dotSpacing) {
          offCtx.fillRect(x, y, 1.5, 1.5);
        }
      }
    };

    // Window resize handler
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    setCanvasSize();

    // Mouse tracking with smooth lerp
    let targetX = (width * 0.5) * dpr;
    let targetY = (height * 0.5) * dpr;
    let currentX = targetX;
    let currentY = targetY;
    let hasUserMoved = false;

    const handlePointerMove = (e: PointerEvent) => {
      hasUserMoved = true;
      targetX = e.clientX * dpr;
      targetY = (height - e.clientY) * dpr; // WebGL Y is inverted
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', setCanvasSize, { passive: true });

    // Animation loop
    const startTime = performance.now();
    let animationFrameId: number;
    let lastTextureUpdate = 0;

    const render = () => {
      const now = performance.now();
      const currentTime = (now - startTime) / 1000;
      const isLight = themeRef.current === 'light';

      // Idle organic movement if user hasn't touched the mouse yet
      if (!hasUserMoved) {
        targetX = (width * 0.5 + Math.sin(currentTime * 0.8) * 120) * dpr;
        targetY = (height * 0.5 + Math.cos(currentTime * 0.6) * 80) * dpr;
      }

      // Smooth fluid lerp
      currentX += (targetX - currentX) * 0.085;
      currentY += (targetY - currentY) * 0.085;

      // Update texture at ~30 FPS for fluid ambient blob movement
      if (now - lastTextureUpdate > 33) {
        renderOffscreenBackground(currentTime, isLight);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          offscreenCanvas
        );
        lastTextureUpdate = now;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
      gl.uniform1f(uniforms.time, currentTime);
      gl.uniform4f(uniforms.mouse, currentX, currentY, 0, 0);
      gl.uniform1f(uniforms.theme, isLight ? 1.0 : 0.0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.texture, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', setCanvasSize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="glass-lens-canvas"
      aria-hidden="true"
    />
  );
};

export default GlassLensBackground;
