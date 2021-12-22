#version 300 es

layout (location = 0) in vec4 i_position;

uniform float u_dt;

out vec4 o_position;

void main() {
  o_position = i_position + u_dt;
}