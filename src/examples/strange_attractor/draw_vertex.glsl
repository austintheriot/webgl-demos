#version 300 es

precision highp float;

layout (location = 0) in vec4 i_position;
layout (location = 1) in vec4 i_color;

uniform mat4 u_matrix;

// pass color from buffer to fragment shader
out vec4 v_color;

void main() {
  // transform position using matrix transformation
  gl_Position = u_matrix * i_position;

  gl_PointSize = 1.0;

  v_color = i_color;
}