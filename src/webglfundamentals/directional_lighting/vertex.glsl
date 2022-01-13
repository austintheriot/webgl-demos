attribute vec4 a_position;

attribute vec4 a_color;

attribute vec3 a_normal;

varying vec4 v_color;

varying vec3 v_normal;

uniform mat4 u_world_view_projection;

void main() {
  // transform position using matrix transformation
  gl_Position = u_world_view_projection * a_position;

  v_color = a_color;
  v_normal = a_normal;
}