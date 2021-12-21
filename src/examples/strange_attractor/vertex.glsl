attribute vec4 a_position;

attribute vec4 a_color;

varying vec4 v_color;

uniform mat4 u_matrix;

void main() {
  // transform position using matrix transformation
  gl_Position = u_matrix * a_position;
  gl_PointSize = 2.0;

  v_color = a_color;
}