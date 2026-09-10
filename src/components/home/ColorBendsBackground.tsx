'use client';

import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
#define MAX_COLORS 6
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / max(uCanvas.y, 1.0)), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  for (int j = 0; j < 4; j++) {
    if (j >= uIterations - 1) break;
    vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
    q += (rr - q) * 0.15;
  }

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  }

  col *= uIntensity;

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

interface ColorBendsProps {
  className?: string;
  colors?: string[];
  speed?: number;
  rotation?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  intensity?: number;
  bandWidth?: number;
  opacity?: number;
}

export default function ColorBendsBackground({
  className = '',
  colors = ['#E94F9F'],
  speed = 0.2,
  rotation = 44,
  scale = 2.1,
  frequency = 1.0,
  warpStrength = 1.0,
  intensity = 1.05,
  bandWidth = 7.0,
  opacity,
}: ColorBendsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const pointerRef = useRef<[number, number]>([0, 0]);
  const smoothPointerRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });

    if (!gl) return;

    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uCanvasLoc = gl.getUniformLocation(program, 'uCanvas');
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uSpeedLoc = gl.getUniformLocation(program, 'uSpeed');
    const uRotLoc = gl.getUniformLocation(program, 'uRot');
    const uColorCountLoc = gl.getUniformLocation(program, 'uColorCount');
    const uColorsLoc = gl.getUniformLocation(program, 'uColors');
    const uTransparentLoc = gl.getUniformLocation(program, 'uTransparent');
    const uScaleLoc = gl.getUniformLocation(program, 'uScale');
    const uFrequencyLoc = gl.getUniformLocation(program, 'uFrequency');
    const uWarpStrengthLoc = gl.getUniformLocation(program, 'uWarpStrength');
    const uPointerLoc = gl.getUniformLocation(program, 'uPointer');
    const uMouseInfluenceLoc = gl.getUniformLocation(program, 'uMouseInfluence');
    const uParallaxLoc = gl.getUniformLocation(program, 'uParallax');
    const uNoiseLoc = gl.getUniformLocation(program, 'uNoise');
    const uIterationsLoc = gl.getUniformLocation(program, 'uIterations');
    const uIntensityLoc = gl.getUniformLocation(program, 'uIntensity');
    const uBandWidthLoc = gl.getUniformLocation(program, 'uBandWidth');

    const parsedColors: number[] = [];
    colors.slice(0, 6).forEach((hex) => {
      const clean = hex.replace('#', '');
      const r = parseInt(clean.substring(0, 2), 16) / 255;
      const g = parseInt(clean.substring(2, 4), 16) / 255;
      const b = parseInt(clean.substring(4, 6), 16) / 255;
      parsedColors.push(r, g, b);
    });

    gl.uniform1i(uColorCountLoc, colors.length);
    gl.uniform3fv(uColorsLoc, new Float32Array(parsedColors));
    gl.uniform1i(uTransparentLoc, 1);
    gl.uniform1f(uSpeedLoc, speed);
    gl.uniform1f(uScaleLoc, scale);
    gl.uniform1f(uFrequencyLoc, frequency);
    gl.uniform1f(uWarpStrengthLoc, warpStrength);
    gl.uniform1f(uMouseInfluenceLoc, 1.0);
    gl.uniform1f(uParallaxLoc, 0.55);
    gl.uniform1f(uNoiseLoc, 0.0);
    gl.uniform1i(uIterationsLoc, 1);
    gl.uniform1f(uIntensityLoc, intensity);
    gl.uniform1f(uBandWidthLoc, bandWidth);

    const isHidden = () => {
      if (!container) return true;
      return container.clientWidth === 0 || container.clientHeight === 0;
    };

    let isVisible = true;
    let isScrolling = false;
    let scrollDebounceTimer: any = null;
    let startTime = performance.now();

    const render = () => {
      if (!isVisible || isHidden() || isScrolling) {
        animFrameRef.current = null;
        return;
      }

      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      gl.uniform1f(uTimeLoc, elapsed);

      const rotAngle = ((rotation % 360) * Math.PI) / 180;
      gl.uniform2f(uRotLoc, Math.cos(rotAngle), Math.sin(rotAngle));

      smoothPointerRef.current[0] += (pointerRef.current[0] - smoothPointerRef.current[0]) * 0.05;
      smoothPointerRef.current[1] += (pointerRef.current[1] - smoothPointerRef.current[1]) * 0.05;
      gl.uniform2f(uPointerLoc, smoothPointerRef.current[0], smoothPointerRef.current[1]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (!container || !canvas || !gl) return;
      if (isHidden()) return;

      const isMobile = window.innerWidth < 768;
      // High-performance fillrate: 0.35 DPR on mobile, 0.55 DPR on desktop
      const dpr = isMobile ? 0.35 : 0.55;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      canvas.width = Math.max(160, Math.floor(width * dpr));
      canvas.height = Math.max(120, Math.floor(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      const simWidth = isMobile ? Math.max(width, height * 1.25) : width;
      gl.uniform2f(uCanvasLoc, simWidth, height);

      if (!animFrameRef.current && isVisible && !isScrolling) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    handleResize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    let lastPointerTime = 0;
    const handlePointerMove = (e: PointerEvent) => {
      if (window.innerWidth < 768) return;
      const now = performance.now();
      if (now - lastPointerTime < 40) return;
      lastPointerTime = now;
      if (!container || isHidden()) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
      pointerRef.current = [x, y];
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const onScrollStart = () => {
      isScrolling = true;
      if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
      scrollDebounceTimer = setTimeout(() => {
        isScrolling = false;
        if (isVisible && !isHidden() && !animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(render);
        }
      }, 140);
    };

    window.addEventListener('scroll', onScrollStart, { passive: true });
    window.addEventListener('touchmove', onScrollStart, { passive: true });

    let intersectionObserver: IntersectionObserver | null = null;

    // Initial render
    if (!isHidden()) {
      render();
    }

    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          isVisible = entry.isIntersecting;
          if (isVisible && !isHidden() && !isScrolling) {
            if (!animFrameRef.current) {
              animFrameRef.current = requestAnimationFrame(render);
            }
          } else {
            if (animFrameRef.current) {
              cancelAnimationFrame(animFrameRef.current);
              animFrameRef.current = null;
            }
          }
        },
        { threshold: 0.02 }
      );
      intersectionObserver.observe(container);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', onScrollStart);
      window.removeEventListener('touchmove', onScrollStart);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [colors, speed, rotation, scale, frequency, warpStrength, intensity, bandWidth]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-90 dark:opacity-85"
      />
    </div>
  );
}
