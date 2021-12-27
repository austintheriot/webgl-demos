#version 300 es

precision highp float;

layout(location = 0) in float i_prime;

uniform mat4 u_matrix;

uniform float u_a;

const float PI = 3.141592653589793;
const float E = 2.718281828459045;

const float MIN_POINT_SIZE = 0.5;
const float MAX_POINT_SIZE = 3.;

void main() {
  float x = i_prime * sin(i_prime) * cos((PI + u_a) * i_prime);
  float y = i_prime * sin(i_prime) * sin((PI + u_a) * i_prime);
  float z = i_prime * cos(i_prime);

  vec3 position = vec3(x, y, z) / 10000.;
  vec4 final_position = u_matrix * vec4(position, 1.0);

  gl_Position = final_position;
  // points further away are smaller (no smaller than 0.5), while points up close are 
  
  gl_PointSize = clamp(1. / (final_position.z * 0.1), MIN_POINT_SIZE, MAX_POINT_SIZE);
}