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
  const error = gl.getShaderInfoLog(shader) || 'Failed to create shader';
  gl.deleteShader(shader);
  throw new Error(error);
}

export const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
  const program = gl.createProgram();
  if (!program) throw err('error creating program', { program });
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
  const error = gl.getProgramInfoLog(program) || 'Failed to create program';
  gl.deleteProgram(program);
  throw new Error(error);
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

/** 3x3 matrix */
export type Matrix3x3 = [
  number, number, number,
  number, number, number,
  number, number, number
];

/** 3x3 matrix utilities (for transforming 2D coordinates) */
export const matrix3x3 = {
  /** Generate 3x3 identity matrix */
  createIdentityMatrix: (): Matrix3x3 => [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ],

  /** Generate 3x3 translation matrix */
  createTranslationMatrix: function (tx: number, ty: number): Matrix3x3 {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  /** Generate 3x3 rotation matrix */
  createRotationMatrix: function (angleInRadians: number): Matrix3x3 {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  /** Generate 3x3 scaling matrix */
  createScalingMatrix: function (sx: number, sy: number): Matrix3x3 {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  /** Multiply two 3x3 matrixes together */
  multiply: function (a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
    const MATRIX_SIZE = 3;
    // matrix coordinates
    const a00 = a[0 * MATRIX_SIZE + 0];
    const a01 = a[0 * MATRIX_SIZE + 1];
    const a02 = a[0 * MATRIX_SIZE + 2];
    const a10 = a[1 * MATRIX_SIZE + 0];
    const a11 = a[1 * MATRIX_SIZE + 1];
    const a12 = a[1 * MATRIX_SIZE + 2];
    const a20 = a[2 * MATRIX_SIZE + 0];
    const a21 = a[2 * MATRIX_SIZE + 1];
    const a22 = a[2 * MATRIX_SIZE + 2];
    const b00 = b[0 * MATRIX_SIZE + 0];
    const b01 = b[0 * MATRIX_SIZE + 1];
    const b02 = b[0 * MATRIX_SIZE + 2];
    const b10 = b[1 * MATRIX_SIZE + 0];
    const b11 = b[1 * MATRIX_SIZE + 1];
    const b12 = b[1 * MATRIX_SIZE + 2];
    const b20 = b[2 * MATRIX_SIZE + 0];
    const b21 = b[2 * MATRIX_SIZE + 1];
    const b22 = b[2 * MATRIX_SIZE + 2];

    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,

      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,

      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },

  translate: (m: Matrix3x3, tx: number, ty: number) => {
    return matrix3x3.multiply(m, matrix3x3.createTranslationMatrix(tx, ty));
  },

  scale: (m: Matrix3x3, sx: number, sy: number) => {
    return matrix3x3.multiply(m, matrix3x3.createScalingMatrix(sx, sy));
  },

  rotate: (m: Matrix3x3, angleInRadians: number) => {
    return matrix3x3.multiply(m, matrix3x3.createRotationMatrix(angleInRadians));
  },
}

export type Matrix4x4 = [
  number, number, number, number,
  number, number, number, number, 
  number, number, number, number, 
  number, number, number, number,
];

export const matrix4x4 = {
  createTranslationMatrix: (tx: number, ty: number, tz: number): Matrix4x4 => {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },
 
  createXRotationMatrix: (angleInRadians: number): Matrix4x4 => {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
 
    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },
 
  createYRotationMatrix: (angleInRadians: number): Matrix4x4 => {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
 
    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },
 
  createZRotationMatrix: (angleInRadians: number): Matrix4x4 => {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
 
    return [
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },
 
  createScalingMatrix: function(sx: number, sy: number, sz: number): Matrix4x4 {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  /** Multiply two 3x3 matrixes together */
  multiply: function (a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
    const MATRIX_SIZE = 4;

    // matrix coordinates
    const b00 = b[0 * MATRIX_SIZE + 0];
    const b01 = b[0 * MATRIX_SIZE + 1];
    const b02 = b[0 * MATRIX_SIZE + 2];
    const b03 = b[0 * MATRIX_SIZE + 3];
    const b10 = b[1 * MATRIX_SIZE + 0];
    const b11 = b[1 * MATRIX_SIZE + 1];
    const b12 = b[1 * MATRIX_SIZE + 2];
    const b13 = b[1 * MATRIX_SIZE + 3];
    const b20 = b[2 * MATRIX_SIZE + 0];
    const b21 = b[2 * MATRIX_SIZE + 1];
    const b22 = b[2 * MATRIX_SIZE + 2];
    const b23 = b[2 * MATRIX_SIZE + 3];
    const b30 = b[3 * MATRIX_SIZE + 0];
    const b31 = b[3 * MATRIX_SIZE + 1];
    const b32 = b[3 * MATRIX_SIZE + 2];
    const b33 = b[3 * MATRIX_SIZE + 3];
    const a00 = a[0 * MATRIX_SIZE + 0];
    const a01 = a[0 * MATRIX_SIZE + 1];
    const a02 = a[0 * MATRIX_SIZE + 2];
    const a03 = a[0 * MATRIX_SIZE + 3];
    const a10 = a[1 * MATRIX_SIZE + 0];
    const a11 = a[1 * MATRIX_SIZE + 1];
    const a12 = a[1 * MATRIX_SIZE + 2];
    const a13 = a[1 * MATRIX_SIZE + 3];
    const a20 = a[2 * MATRIX_SIZE + 0];
    const a21 = a[2 * MATRIX_SIZE + 1];
    const a22 = a[2 * MATRIX_SIZE + 2];
    const a23 = a[2 * MATRIX_SIZE + 3];
    const a30 = a[3 * MATRIX_SIZE + 0];
    const a31 = a[3 * MATRIX_SIZE + 1];
    const a32 = a[3 * MATRIX_SIZE + 2];
    const a33 = a[3 * MATRIX_SIZE + 3];
 
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translate: (m: Matrix4x4, tx: number, ty: number, tz: number) => {
    return matrix4x4.multiply(m, matrix4x4.createTranslationMatrix(tx, ty, tz));
  },

  scale: (m: Matrix4x4, sx: number, sy: number, sz: number) => {
    return matrix4x4.multiply(m, matrix4x4.createScalingMatrix(sx, sy, sz));
  },

  rotateX: (m: Matrix4x4, angleInRadians: number) => {
    return matrix4x4.multiply(m, matrix4x4.createXRotationMatrix(angleInRadians));
  },

  rotateY: (m: Matrix4x4, angleInRadians: number) => {
    return matrix4x4.multiply(m, matrix4x4.createYRotationMatrix(angleInRadians));
  },

  rotateZ: (m: Matrix4x4, angleInRadians: number) => {
    return matrix4x4.multiply(m, matrix4x4.createZRotationMatrix(angleInRadians));
  },
}