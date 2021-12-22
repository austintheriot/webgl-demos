#version 300 es

layout (location = 0) in vec3 i_position;

out vec3 o_position;

uniform float u_dt;

void main() {
  // update position
  vec3 updated_position = i_position + 0.01;

  // wrap position to box
  updated_position = mod(updated_position + 1.0, 2.0) - 1.0;

  o_position = updated_position;
}