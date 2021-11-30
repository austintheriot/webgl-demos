export const err = <D extends Record<string, unknown>>(msg: string, data: D) => {
  console.error(msg, data);
  return new Error(msg);
}

/** compiles a shader from source code and returns it if successful */
export const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw err('error creating shader', { shader });
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;

  // if fail:
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

export const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
  const program = gl.createProgram();
  if (!program) throw err('error creating program', { program });
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  // if fail:
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

export const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const canvasElWidth = canvas.clientWidth;
  const canvasElHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width !== canvasElWidth || canvas.height !== canvasElHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = canvasElWidth;
    canvas.height = canvasElHeight;
  }

  return needResize;
}