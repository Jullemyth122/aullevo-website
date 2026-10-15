import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface AullevoLatticeShaderProps {
  className?: string;
  /** Client-space point that fires a scan pulse (e.g. sample pill clicks). */
  rippleTrigger?: { x: number; y: number; timestamp: number } | null;
}

/**
 * "Prism Lattice" — a background shader built from the Aullevo mark's vocabulary:
 * the triangular "A" becomes an isometric lattice, the "O" and "E" strokes become
 * glyphs in cobalt data-streams that rain down the lattice columns. The pointer
 * acts as a glass lens (magnifies + lights the lattice) with a triangle/ring reticle,
 * and clicks send scan pulses outward. When idle, a ghost cursor keeps it alive.
 */

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

  uniform vec2 uRes;       // canvas size in device px
  uniform float uTime;
  uniform float uCell;     // triangle side length, in canvas-height units
  uniform vec3 uMouse;     // xy = uv (0..1, y up), z = presence (0..1)
  uniform vec2 uMouseVel;  // smoothed velocity, uv per second
  uniform float uTheme;    // 0 = dark, 1 = light (animated)
  uniform vec4 uPulse0;    // (x, y, startTime, intensity)
  uniform vec4 uPulse1;
  uniform vec4 uPulse2;
  varying vec2 vUv;

  #define SQ3 1.7320508
  #define H 0.8660254
  #define TAU 6.2831853

  float hash11(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  mat2 rot(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
  }

  // Equilateral triangle SDF (apex up), r = half side length
  float sdTri(vec2 p, float r) {
    p.x = abs(p.x) - r;
    p.y = p.y + r / SQ3;
    if (p.x + SQ3 * p.y > 0.0) p = vec2(p.x - SQ3 * p.y, -SQ3 * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    return -length(p) * sign(p.y);
  }

  float sdSeg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  // Lattice coords -> world (side units)
  vec2 toW(vec2 b) { return vec2(b.x + b.y * 0.5, b.y * H); }

  float pulseRing(vec4 pl, vec2 q, float aspect, float t) {
    if (pl.w < 0.001) return 0.0;
    float age = t - pl.z;
    if (age < 0.0 || age > 3.2) return 0.0;
    float d = length(q - vec2(pl.x * aspect, pl.y));
    float band = exp(-pow((d - age * 0.62) / 0.045, 2.0));
    return band * exp(-age * 1.2) * pl.w;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime;
    float pxw = 1.0 / uRes.y;

    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    float presence = uMouse.z;
    vec2 dm = p - m;
    float md = length(dm);
    float spd = clamp(length(uMouseVel) * 0.6, 0.0, 1.0);

    // ── Glass lens: magnify the lattice around the pointer, dragged by motion ──
    float lens = exp(-md * md / 0.05) * presence;
    vec2 lp = p - dm * lens * 0.35 - uMouseVel * lens * 0.05;

    // ── Triangular lattice (the "A") ──
    vec2 g = lp / uCell;
    vec2 b = vec2(g.x - g.y / SQ3, g.y / H);
    vec2 cell = floor(b);
    vec2 f = fract(b);
    float up = step(1.0, f.x + f.y);
    vec3 e = mix(vec3(f.x, f.y, 1.0 - f.x - f.y), vec3(1.0 - f.x, 1.0 - f.y, f.x + f.y - 1.0), up);
    float edge = min(e.x, min(e.y, e.z)) * H;

    vec2 v0 = toW(cell + vec2(up, up));
    float vd = min(length(g - v0), min(length(g - toW(cell + vec2(1.0, 0.0))), length(g - toW(cell + vec2(0.0, 1.0)))));

    vec2 cw = toW(cell + mix(vec2(1.0 / 3.0), vec2(2.0 / 3.0), up));
    vec2 local = g - cw;
    local.y *= 1.0 - 2.0 * up;           // point every cell's glyph "up"
    vec2 cWorld = cw * uCell;
    float triId = hash21(cell + up * vec2(17.13, 3.71));
    float px = pxw / uCell * (1.0 - lens * 0.35);

    // ── Ambient cobalt field ──
    float n = fbm(p * 1.4 + vec2(t * 0.035, -t * 0.025));
    float n2 = fbm(p * 2.6 - vec2(t * 0.05, t * 0.02) + n * 1.5);

    // ── Data rain down the lattice columns ──
    float col = floor(cw.x * 2.0 + 0.5);
    float cH = hash11(col * 3.17);
    float rate = 2.0 + cH * 3.5;
    float len = 6.0 + hash11(col * 7.31) * 12.0;
    float per = len * (1.8 + hash11(col * 1.91) * 2.5);
    float ph = (cw.y + t * rate) / per + cH * 13.0;
    float live = step(0.35, hash11(floor(ph) * 1.13 + col * 0.71));
    float behind = fract(ph) * per;       // distance behind the stream head
    float rain = live * pow(clamp(1.0 - behind / len, 0.0, 1.0), 1.8);
    rain *= (0.3 + 0.7 * smoothstep(0.3, 0.7, n2)) * (1.0 + lens * 1.5);
    float head = live * step(behind, 0.9);

    // ── Glyphs: logo strokes (shard, outline, "O" ring, "E" bars) ──
    float gSeed = hash21(vec2(triId * 91.7, floor(t * (3.0 + triId * 9.0) + triId * 5.0)));
    float gType = floor(gSeed * 4.0);
    float d;
    if (gType < 1.0) {
      d = sdTri(local, 0.15);
    } else if (gType < 2.0) {
      d = abs(sdTri(local, 0.17)) - 0.02;
    } else if (gType < 3.0) {
      d = abs(length(local) - 0.095) - 0.022;
    } else {
      d = min(sdSeg(local, vec2(-0.12, 0.045), vec2(0.07, 0.045)),
              sdSeg(local, vec2(-0.07, -0.04), vec2(0.12, -0.04))) - 0.022;
    }
    float glyph = 1.0 - smoothstep(-px, px, d);
    float inner = smoothstep(px, px * 3.0, edge);

    // ── Pointer reveal: sparse cells flicker on near the lens ──
    float prox = exp(-dot(cWorld - m, cWorld - m) / 0.03) * presence;
    float reveal = prox * step(1.0 - prox * 0.85, triId);
    reveal *= 0.55 + 0.45 * sin(t * (3.0 + triId * 9.0) + triId * 40.0);

    // ── Scan pulses (clicks + ambient) and a slow sweep beam ──
    float pulse = pulseRing(uPulse0, cWorld, aspect, t)
                + pulseRing(uPulse1, cWorld, aspect, t)
                + pulseRing(uPulse2, cWorld, aspect, t);
    float k = floor(t / 5.0);
    pulse += pulseRing(vec4(0.15 + hash11(k * 1.7) * 0.7, 0.2 + hash11(k * 3.1) * 0.6, k * 5.0, 0.5), cWorld, aspect, t);
    float scan = exp(-pow((cWorld.y - (1.25 - fract(t / 11.0) * 1.7)) / 0.05, 2.0));
    float pick = step(0.45, triId);

    // ── Layer intensities ──
    float lineMask = 1.0 - smoothstep(0.0, px * 1.4, edge);
    float lineI = 0.06 + 0.10 * smoothstep(0.35, 0.75, n) + lens * 0.55 + pulse * 0.9 + scan * 0.25;
    float nodeMask = 1.0 - smoothstep(px, px * 2.6, vd);
    float nodeI = 0.18 + lens * 1.0 + pulse * 1.2;
    float cellEnergy = max(rain * 0.9, max(reveal, pulse * 0.8 * pick)) + scan * 0.35 * step(0.7, triId);
    float glyphI = glyph * cellEnergy;
    float fillI = inner * (rain * 0.10 + reveal * 0.14 + pulse * 0.18 * pick);
    float headI = head * glyph;
    float glow = exp(-md * md / 0.02) * presence;

    // ── Reticle: rotating triangle + dashed "O" + counter-rotating arcs ──
    float ang = atan(dm.y, dm.x);
    float triLine = 1.0 - smoothstep(pxw * 0.6, pxw * 1.8, abs(sdTri(rot(t * 0.5) * dm, 0.042)));
    float dash = step(0.35, fract(ang / TAU * 36.0 - t * 0.25));
    float ringLine = (1.0 - smoothstep(pxw * 0.6, pxw * 1.8, abs(md - 0.075))) * dash;
    float arcs = (1.0 - smoothstep(pxw * 0.8, pxw * 2.2, abs(md - 0.1))) * step(0.72, fract(ang / TAU * 3.0 + t * 0.12));
    float reticle = (triLine * 0.9 + ringLine * 0.6 + arcs * 0.5) * presence * (0.55 + spd * 0.45);

    float vig = 1.0 - 0.45 * pow(length((uv - 0.5) * vec2(1.0, 1.2)), 2.0);

    // ── Dark palette: obsidian → logo cobalt #1a5296 → #2563eb → #60a5fa ──
    vec3 dDeep = vec3(0.008, 0.020, 0.058);
    vec3 dCobalt = vec3(0.102, 0.322, 0.588);
    vec3 dBright = vec3(0.145, 0.388, 0.922);
    vec3 dGlow = vec3(0.376, 0.647, 0.980);
    vec3 dIce = vec3(0.78, 0.92, 1.0);

    vec3 dark = mix(dDeep, dCobalt * 0.42, smoothstep(0.15, 0.95, uv.y * 0.4 + n * 0.8));
    dark += dBright * 0.22 * pow(n2, 2.5);
    dark += dGlow * lineMask * lineI * 0.75;
    dark += dIce * nodeMask * nodeI * 0.35;
    dark += dBright * fillI;
    dark += mix(dGlow, dIce, head) * glyphI * 0.9;
    dark += dIce * headI * 0.5;
    dark += dBright * glow * 0.22;
    dark += dGlow * reticle * 0.7;
    dark *= vig;

    // ── Light palette: logo cobalt ink on ice paper ──
    vec3 lBase = vec3(0.925, 0.953, 0.992);
    vec3 lMist = vec3(0.80, 0.87, 0.98);
    vec3 lInk = vec3(0.102, 0.322, 0.588);
    vec3 lBright = vec3(0.145, 0.388, 0.922);

    vec3 light = mix(lBase, lMist, smoothstep(0.2, 0.9, (1.0 - uv.y) * 0.3 + n * 0.8));
    light = mix(light, vec3(0.70, 0.82, 0.99), 0.35 * pow(n2, 2.5));
    light = mix(light, lInk, clamp(lineMask * lineI * 0.55, 0.0, 1.0));
    light = mix(light, lBright, clamp(nodeMask * nodeI * 0.4, 0.0, 1.0));
    light = mix(light, lBright, clamp(fillI * 1.2, 0.0, 1.0));
    light = mix(light, mix(lInk, lBright, head), clamp(glyphI * 0.85, 0.0, 1.0));
    light = mix(light, vec3(0.62, 0.76, 1.0), glow * 0.25);
    light = mix(light, lBright, clamp(reticle * 0.8, 0.0, 1.0));
    light *= mix(1.0, vig, 0.25);

    gl_FragColor = vec4(mix(dark, light, uTheme), 1.0);
  }
`;

// Triangle side length in CSS px
const CELL_PX = 34;
const MAX_DPR = 1.5;
// Pointer still counts as "near" this far outside the canvas
const HOVER_MARGIN = 80;

export const AullevoLatticeShader: React.FC<AullevoLatticeShaderProps> = ({ className, rippleTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const timeRef = useRef(0);

  // Ring buffer of up to 3 simultaneous scan pulses (times in shader clock)
  const pulsesRef = useRef([
    { x: 0.5, y: 0.5, time: -10, intensity: 0 },
    { x: 0.5, y: 0.5, time: -10, intensity: 0 },
    { x: 0.5, y: 0.5, time: -10, intensity: 0 },
  ]);
  const pulseIndexRef = useRef(0);

  const addPulseAtClient = (clientX: number, clientY: number, intensity = 1.0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const idx = pulseIndexRef.current;
    pulsesRef.current[idx] = {
      x: (clientX - rect.left) / rect.width,
      y: 1.0 - (clientY - rect.top) / rect.height,
      time: timeRef.current,
      intensity,
    };
    pulseIndexRef.current = (idx + 1) % 3;
  };

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (rippleTrigger) addPulseAtClient(rippleTrigger.x, rippleTrigger.y, 1.0);
  }, [rippleTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Phones/tablets get a static CSS lattice instead (see .is-static): behind the frosted
    // glass it looks the same, without a GPU loop or shader compile on a mobile CPU
    if (window.matchMedia?.('(hover: none) and (pointer: coarse)').matches) {
      canvas.classList.add('is-static');
      return;
    }

    // Creating the GL context and compiling the shader blocks the main thread, so it waits
    // until the demo is near the viewport and the browser is idle (after the hero intro).
    let dispose: (() => void) | undefined;
    let cancelled = false;
    let idleId = 0;
    let delayId = 0;
    const idle = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const start = () => {
      if (!cancelled && !dispose) dispose = init(canvas);
    };
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        nearObserver.disconnect();
        // Wait out the hero intro (~2s) so GL setup never competes with it
        const sinceLoad = performance.now();
        delayId = window.setTimeout(() => {
          idleId = idle.requestIdleCallback ? idle.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 200);
        }, Math.max(0, 2200 - sinceLoad));
      },
      { rootMargin: '300px 0px' },
    );
    nearObserver.observe(canvas);

    function init(canvas: HTMLCanvasElement): (() => void) | undefined {
      const gl = (canvas.getContext('webgl2', { alpha: false, antialias: false }) ||
        canvas.getContext('webgl', { alpha: false, antialias: false })) as WebGLRenderingContext | null;

      if (!gl) {
        console.warn('WebGL not supported for AullevoLatticeShader');
        return;
      }

      const createShader = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        // No COMPILE_STATUS check here: querying it blocks until the compile finishes
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

      const setup = (): (() => void) => {
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const u = {
          res: gl.getUniformLocation(program, 'uRes'),
          time: gl.getUniformLocation(program, 'uTime'),
          cell: gl.getUniformLocation(program, 'uCell'),
          mouse: gl.getUniformLocation(program, 'uMouse'),
          mouseVel: gl.getUniformLocation(program, 'uMouseVel'),
          theme: gl.getUniformLocation(program, 'uTheme'),
          pulse0: gl.getUniformLocation(program, 'uPulse0'),
          pulse1: gl.getUniformLocation(program, 'uPulse1'),
          pulse2: gl.getUniformLocation(program, 'uPulse2'),
        };

        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        // Phones/tablets: 1x resolution and 30fps — the shader is soft, so it looks the same
        const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
        const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : MAX_DPR);
        let cssHeight = 1;

        const updateSize = () => {
          const rect = canvas.getBoundingClientRect();
          cssHeight = Math.max(1, rect.height);
          const w = Math.max(1, Math.round(rect.width * dpr));
          const h = Math.max(1, Math.round(rect.height * dpr));
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
        };
        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(canvas);

        // Pointer state: raw target → smoothed position fed to the shader
        const pointer = { x: 0.5, y: 0.5, near: false };
        const smooth = { x: 0.5, y: 0.5, presence: 0, vx: 0, vy: 0 };

        const handlePointerMove = (e: PointerEvent) => {
          const rect = canvas.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          pointer.x = (e.clientX - rect.left) / rect.width;
          pointer.y = 1.0 - (e.clientY - rect.top) / rect.height;
          pointer.near =
            e.clientX > rect.left - HOVER_MARGIN && e.clientX < rect.right + HOVER_MARGIN &&
            e.clientY > rect.top - HOVER_MARGIN && e.clientY < rect.bottom + HOVER_MARGIN;
        };
        const handlePointerLeaveWindow = () => {
          pointer.near = false;
        };
        // Clicks anywhere on the demo stage send a scan pulse
        const stageEl = canvas.parentElement || canvas;
        const handlePointerDown = (e: PointerEvent) => addPulseAtClient(e.clientX, e.clientY, 1.0);

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', handlePointerLeaveWindow);
        stageEl.addEventListener('pointerdown', handlePointerDown as EventListener, { passive: true });

        // Skip rendering while scrolled out of view
        let visible = true;
        const intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });
        intersectionObserver.observe(canvas);

        const timeScale = reducedMotion ? 0.2 : 1;
        let themeMix = themeRef.current === 'light' ? 1 : 0;
        let last = performance.now();
        let animationFrameId: number;

        const render = (now: number) => {
          animationFrameId = requestAnimationFrame(render);
          if (!visible || document.hidden) {
            last = now;
            return;
          }
          // Full rate only while the pointer is actually on the demo (30fps on touch). The idle
          // ghost cursor drifts slowly behind frosted glass, so 15fps looks identical while
          // cutting GPU work — and the backdrop blurs layered over it — by 4x
          const minFrame = pointer.near ? (coarse ? 1000 / 30 : 0) : 1000 / 15;
          if (now - last < minFrame - 2) return;
          const dt = Math.min((now - last) / 1000, 0.1);
          last = now;

          timeRef.current += dt * timeScale;
          const t = timeRef.current;

          // Idle ghost cursor wanders a slow Lissajous path so the lens never sleeps
          const targetX = pointer.near ? pointer.x : 0.5 + 0.32 * Math.sin(t * 0.23);
          const targetY = pointer.near ? pointer.y : 0.5 + 0.28 * Math.sin(t * 0.31 + 1.2);
          const targetPresence = pointer.near ? 1 : reducedMotion ? 0 : 0.35;

          const follow = 1 - Math.exp(-dt * 10);
          const prevX = smooth.x;
          const prevY = smooth.y;
          smooth.x += (targetX - smooth.x) * follow;
          smooth.y += (targetY - smooth.y) * follow;
          smooth.presence += (targetPresence - smooth.presence) * (1 - Math.exp(-dt * 4));
          if (dt > 0) {
            const velFollow = 1 - Math.exp(-dt * 6);
            smooth.vx += ((smooth.x - prevX) / dt - smooth.vx) * velFollow;
            smooth.vy += ((smooth.y - prevY) / dt - smooth.vy) * velFollow;
          }

          themeMix += ((themeRef.current === 'light' ? 1 : 0) - themeMix) * (1 - Math.exp(-dt * 6));

          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.uniform2f(u.res, canvas.width, canvas.height);
          gl.uniform1f(u.time, t);
          gl.uniform1f(u.cell, CELL_PX / cssHeight);
          gl.uniform3f(u.mouse, smooth.x, smooth.y, smooth.presence);
          gl.uniform2f(u.mouseVel, smooth.vx, smooth.vy);
          gl.uniform1f(u.theme, themeMix);

          const p = pulsesRef.current;
          gl.uniform4f(u.pulse0, p[0].x, p[0].y, p[0].time, p[0].intensity);
          gl.uniform4f(u.pulse1, p[1].x, p[1].y, p[1].time, p[1].intensity);
          gl.uniform4f(u.pulse2, p[2].x, p[2].y, p[2].time, p[2].intensity);

          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          if (!drawn) {
            drawn = true;
            canvas.classList.add('is-ready');
          }
        };
        let drawn = false;
        animationFrameId = requestAnimationFrame(render);

        return () => {
          cancelAnimationFrame(animationFrameId);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          window.removeEventListener('pointermove', handlePointerMove);
          document.documentElement.removeEventListener('pointerleave', handlePointerLeaveWindow);
          stageEl.removeEventListener('pointerdown', handlePointerDown as EventListener);
          gl.deleteProgram(program);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
          gl.deleteBuffer(buffer);
        };
      };

      // Compile in the background where supported: poll for completion once per frame rather
      // than blocking on LINK_STATUS (ANGLE/D3D shader compiles can take hundreds of ms)
      const parallel = gl.getExtension('KHR_parallel_shader_compile') as { COMPLETION_STATUS_KHR: number } | null;
      let disposed = false;
      let pollId = 0;
      let teardown: (() => void) | undefined;
      const whenLinked = () => {
        if (disposed) return;
        if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
          pollId = requestAnimationFrame(whenLinked);
          return;
        }
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error('Shader link error:', gl.getProgramInfoLog(program), gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs));
          return;
        }
        teardown = setup();
      };
      whenLinked();

      return () => {
        disposed = true;
        cancelAnimationFrame(pollId);
        if (teardown) teardown();
        else {
          gl.deleteProgram(program);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
        }
      };
    }

    return () => {
      cancelled = true;
      nearObserver.disconnect();
      if (idle.cancelIdleCallback) idle.cancelIdleCallback(idleId);
      window.clearTimeout(idleId);
      window.clearTimeout(delayId);
      dispose?.();
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

export default AullevoLatticeShader;
