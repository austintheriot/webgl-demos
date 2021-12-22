#version 300 es

in vec4 a_position;

in vec4 a_color;

out vec4 v_color;

uniform mat4 u_matrix;

void main() {
  // transform position using matrix transformation
  gl_Position = u_matrix * a_position;

  gl_PointSize = 1.;

  v_color = a_color;
}