import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2  u_resolution;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p  = p * 2.3 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t  = u_time * 0.10;

  vec2 q = vec2(
    fbm(uv + vec2(0.0, 0.0) + t * 0.25),
    fbm(uv + vec2(5.2, 1.3))
  );
  vec2 r = vec2(
    fbm(uv + 4.0 * q + vec2(1.7 + t, 9.2)),
    fbm(uv + 4.0 * q + vec2(8.3,     2.8))
  );
  float f = fbm(uv + 3.5 * r);

  // Coral brand palette
  vec3 offwhite = vec3(0.980, 0.961, 0.929); // #FAF5ED
  vec3 bege     = vec3(0.929, 0.910, 0.882); // #EDE8E1
  vec3 begemd   = vec3(0.871, 0.839, 0.749); // #DED6BF
  vec3 pink     = vec3(1.000, 0.678, 0.635); // #FFADA2
  vec3 coral    = vec3(0.992, 0.431, 0.369); // #FD6E5E

  float f2 = f * f;
  float f3 = f2 * f;

  vec3 col = offwhite;
  col = mix(col, bege,   clamp(f  * 1.6, 0.0, 1.0));
  col = mix(col, begemd, clamp(f2 * 2.0, 0.0, 1.0));
  col = mix(col, pink,   clamp(length(q) * 0.55, 0.0, 1.0));
  col = mix(col, coral,  clamp(f3 * 0.9, 0.0, 1.0));

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    function compileShader(type: number, source: string): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const vert = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");

    // ── Desempenho ──────────────────────────────────────────────────────
    // Antes: desenhava a cada quadro, em densidade 2x (cerca de 3,9 mi de
    // pixels a 1440 px), inclusive com o hero fora da tela. A GPU acumulava
    // fila e, ao voltar ao hero, a página travava segundos esperando
    // (CommandBufferHelper::Finish no trace). Agora:
    //   - resolução interna de ESCALA x o tamanho em CSS (o padrão é um
    //     degradê suave; o navegador amplia sem diferença visível), com teto
    //     de MAX_PIXELS;
    //   - só anima com o hero visível (IntersectionObserver) e a aba ativa;
    //   - no máximo 30 quadros por segundo (o movimento é lento);
    //   - com prefers-reduced-motion, desenha um quadro só.
    const ESCALA = 0.5;
    const MAX_PIXELS = 520_000;
    const INTERVALO_MS = 1000 / 30;
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let animationId = 0;
    let visivel = true;
    let tempo = 0;            // segundos de animação acumulados (não pula ao pausar)
    let ultimo = 0;

    function resize() {
      if (!canvas) return;
      let w = canvas.clientWidth * ESCALA;
      let h = canvas.clientHeight * ESCALA;
      const px = w * h;
      if (px > MAX_PIXELS) {
        const k = Math.sqrt(MAX_PIXELS / px);
        w *= k;
        h *= k;
      }
      canvas.width = Math.max(1, Math.round(w));
      canvas.height = Math.max(1, Math.round(h));
      gl!.viewport(0, 0, canvas.width, canvas.height);
      desenhar();
    }

    function desenhar() {
      gl!.uniform1f(uTime, tempo);
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function render(agora: number) {
      animationId = 0;
      if (!visivel || document.hidden || reduzir) return;
      if (ultimo === 0) ultimo = agora;
      const dt = agora - ultimo;
      if (dt >= INTERVALO_MS) {
        tempo += Math.min(dt, 100) / 1000;
        ultimo = agora;
        desenhar();
      }
      animationId = requestAnimationFrame(render);
    }

    function iniciar() {
      if (animationId || reduzir || !visivel || document.hidden) return;
      ultimo = 0;
      animationId = requestAnimationFrame(render);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const io = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting;
      if (visivel) iniciar();
    });
    io.observe(canvas);

    const onVisibilidade = () => { if (!document.hidden) iniciar(); };
    document.addEventListener("visibilitychange", onVisibilidade);

    iniciar();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      observer.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilidade);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none z-0"
    />
  );
}
