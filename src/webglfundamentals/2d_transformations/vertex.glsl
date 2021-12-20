attribute vec2 a_position;

uniform mat3 u_matrix;
 
void main() {
  // transform position using matrix transformation
  vec2 transformed_position = vec2(u_matrix * vec3(a_position, 1)).xy;
  gl_Position = vec4(transformed_position, 0, 1);
}