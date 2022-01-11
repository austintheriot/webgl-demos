precision highp float;

varying vec4 v_color;
 
void main() {
  // Just set the output to a constant reddish-purple
  gl_FragColor = v_color;
}