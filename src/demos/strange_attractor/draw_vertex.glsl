#version 300 es

precision highp float;

layout (location = 0) in vec3 i_position;

uniform mat4 u_matrix;

void main() {
  // transform position using matrix transformation
  gl_Position = u_matrix * vec4(i_position, 1.0);

  gl_PointSize = 1.0;
}