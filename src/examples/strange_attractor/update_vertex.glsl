#version 300 es

layout (location = 0) in vec3 i_position;

out vec3 o_position;

uniform float u_dt;

void main() {
  float a = 40.;
  float b = 0.833;
  float c = 20.;
  float d = 0.5;
  float f = 0.65;

  float dx = u_dt * (a * (i_position.y - i_position.x) + d * i_position.x * i_position.z);
  float dy = u_dt * (c * i_position.y - i_position.x * i_position.z);
  float dz = u_dt * (b * i_position.z + i_position.x * i_position.y - f * (i_position.x * i_position.x));

  // update position
  vec3 updated_position = vec3(i_position.x + dx, i_position.y + dy, i_position.z + dz);

  // wrap position to box
  // updated_position = mod(updated_position + 1.0, 2.0) - 1.0;

  o_position = updated_position;
}