#version 300 es

precision highp float;

layout(location = 0) in float i_index;

uniform mat4 u_matrix;
uniform float u_t;
uniform float u_a;
uniform float u_b;
uniform float u_c;
uniform float u_d;
uniform float u_e;
uniform float u_f;

void main() {
  float x = cos(u_a * i_index) + sin(u_b * i_index);
  float y = cos(u_c * i_index) + sin(u_d * i_index);
  float z = cos(u_e * i_index) + sin(u_f * i_index);

  // transform position using matrix transformation
  gl_Position = u_matrix * vec4(x, y, z, 1.0);

  gl_PointSize = 1.0;
}