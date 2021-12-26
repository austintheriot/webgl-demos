#version 300 es

precision highp float;

layout(location = 0) in float i_prime;

uniform mat4 u_matrix;

void main() {
  // float theta = i_prime * (180. / 3.14159);
  // create spiral using polar coordinates
  float x = i_prime * cos(i_prime);
  float y = i_prime * sin(i_prime);
  float z = 1.;

  vec3 position = vec3(x, y, z) / 10000.;

  gl_Position = u_matrix * vec4(position, 1.0);
  gl_PointSize = 3.0;
}