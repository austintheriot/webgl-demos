#version 300 es

layout (location = 0) in vec3 i_position;

out vec3 o_position;

uniform float u_dt;

void main() {
  o_position = i_position + u_dt;
}