#version 300 es

precision highp float;

layout(location = 0) in float i_prime;

uniform mat4 u_matrix;

uniform float u_a;

const float PI = 3.141592653589793;
const float E = 2.718281828459045;

void main() {
  float x = i_prime * sin(i_prime) * cos((PI + u_a) * i_prime);
  float y = i_prime * sin(i_prime) * sin((PI + u_a) * i_prime);
  float z = i_prime * cos(i_prime);

  vec3 position = vec3(x, y, z) / 10000.;

  gl_Position = u_matrix * vec4(position, 1.0);
  gl_PointSize = 3.0;
}