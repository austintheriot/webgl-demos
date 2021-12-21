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

export const radiansToDegrees = (r: number) => {
  return r * 180 / Math.PI;
}

export const degreesToRadians = (d: number) => {
  return d * Math.PI / 180;
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

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

/** Calculates the cross product of two vec3s */
export const crossVec3 = (a: Vec3, b: Vec3): Vec3 => {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
};

/** Subtracts two vec3s */
export const subtractVec3 = (a: Vec3, b: Vec3): Vec3 => {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
};

/** Normalizes a vector to length of 1 */
export const normalizeVec3 = (v: Vec3): Vec3 => {
  const length = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

export const matrix4x4 = {
  createProjectionMatrix: function (width: number, height: number, depth: number): Matrix4x4 {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  createIdentityMatrix: (): Matrix4x4 => {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  createTranslationMatrix: (tx: number, ty: number, tz: number): Matrix4x4 => {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
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

  createScalingMatrix: function (sx: number, sy: number, sz: number): Matrix4x4 {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ];
  },

  /** Converts frustum into clip-space coordinates */
  createPerspectiveMatrix(fieldOfViewInRadians: number, aspect: number, near: number, far: number): Matrix4x4 {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    const rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  },

  createLookAtMatrix: (cameraPosition: Vec3, target: Vec3, up: Vec3): Matrix4x4 => {
    var zAxis = normalizeVec3(subtractVec3(cameraPosition, target));
    var xAxis = normalizeVec3(crossVec3(up, zAxis));
    var yAxis = normalizeVec3(crossVec3(zAxis, xAxis));
 
    return [
       xAxis[0], xAxis[1], xAxis[2], 0,
       yAxis[0], yAxis[1], yAxis[2], 0,
       zAxis[0], zAxis[1], zAxis[2], 0,
       cameraPosition[0],
       cameraPosition[1],
       cameraPosition[2],
       1,
    ];
  },

  /** Multiply two 4x4 matrixes together */
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

  translate: (m: Matrix4x4, tx: number, ty: number, tz: number): Matrix4x4 => {
    return matrix4x4.multiply(m, matrix4x4.createTranslationMatrix(tx, ty, tz));
  },

  scale: (m: Matrix4x4, sx: number, sy: number, sz: number): Matrix4x4 => {
    return matrix4x4.multiply(m, matrix4x4.createScalingMatrix(sx, sy, sz));
  },

  rotateX: (m: Matrix4x4, angleInRadians: number): Matrix4x4 => {
    return matrix4x4.multiply(m, matrix4x4.createXRotationMatrix(angleInRadians));
  },

  rotateY: (m: Matrix4x4, angleInRadians: number): Matrix4x4 => {
    return matrix4x4.multiply(m, matrix4x4.createYRotationMatrix(angleInRadians));
  },

  rotateZ: (m: Matrix4x4, angleInRadians: number): Matrix4x4 => {
    return matrix4x4.multiply(m, matrix4x4.createZRotationMatrix(angleInRadians));
  },

  /** Calculates the inverse of a 4x4 matrix */
  inverse: (m: Matrix4x4): Matrix4x4 => {
    const MATRIX_SIZE = 4;
    const m00 = m[0 * MATRIX_SIZE + 0];
    const m01 = m[0 * MATRIX_SIZE + 1];
    const m02 = m[0 * MATRIX_SIZE + 2];
    const m03 = m[0 * MATRIX_SIZE + 3];
    const m10 = m[1 * MATRIX_SIZE + 0];
    const m11 = m[1 * MATRIX_SIZE + 1];
    const m12 = m[1 * MATRIX_SIZE + 2];
    const m13 = m[1 * MATRIX_SIZE + 3];
    const m20 = m[2 * MATRIX_SIZE + 0];
    const m21 = m[2 * MATRIX_SIZE + 1];
    const m22 = m[2 * MATRIX_SIZE + 2];
    const m23 = m[2 * MATRIX_SIZE + 3];
    const m30 = m[3 * MATRIX_SIZE + 0];
    const m31 = m[3 * MATRIX_SIZE + 1];
    const m32 = m[3 * MATRIX_SIZE + 2];
    const m33 = m[3 * MATRIX_SIZE + 3];
    const tmp_0 = m22 * m33;
    const tmp_1 = m32 * m23;
    const tmp_2 = m12 * m33;
    const tmp_3 = m32 * m13;
    const tmp_4 = m12 * m23;
    const tmp_5 = m22 * m13;
    const tmp_6 = m02 * m33;
    const tmp_7 = m32 * m03;
    const tmp_8 = m02 * m23;
    const tmp_9 = m22 * m03;
    const tmp_10 = m02 * m13;
    const tmp_11 = m12 * m03;
    const tmp_12 = m20 * m31;
    const tmp_13 = m30 * m21;
    const tmp_14 = m10 * m31;
    const tmp_15 = m30 * m11;
    const tmp_16 = m10 * m21;
    const tmp_17 = m20 * m11;
    const tmp_18 = m00 * m31;
    const tmp_19 = m30 * m01;
    const tmp_20 = m00 * m21;
    const tmp_21 = m20 * m01;
    const tmp_22 = m00 * m11;
    const tmp_23 = m10 * m01;

    const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
      (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
      (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
      (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
      (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0, d * t1, d * t2, d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
    ];
  },
}