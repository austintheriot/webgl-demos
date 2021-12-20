precision highp float;

uniform vec4 u_color;
 
void main() {
  // Just set the output to a constant reddish-purple
  gl_FragColor = u_color;
}