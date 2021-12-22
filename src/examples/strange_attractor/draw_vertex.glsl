#version 300 es

precision highp float;

layout (location = 0) in vec3 i_position;
layout (location = 1) in vec3 i_color;


// pass color from buffer to fragment shader
out vec3 v_color;

uniform mat4 u_matrix;

void main() {
  // transform position using matrix transformation
  gl_Position = u_matrix * vec4(i_position, 1.0);

  gl_PointSize = 1.0;

  v_color = i_color;
}