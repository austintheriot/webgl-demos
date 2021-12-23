precision highp float;

uniform vec4 burke_shaw_multiplierolor;
 
void main() {
  // Just set the output to a constant reddish-purple
  gl_FragColor = burke_shaw_multiplierolor;
}