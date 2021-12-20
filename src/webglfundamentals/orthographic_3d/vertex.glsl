attribute vec4 a_position;

uniform mat4 u_matrix;
 
void main() {
  // transform position using matrix transformation
  gl_Position = a_position * u_matrix;
}