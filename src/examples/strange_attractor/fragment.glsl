#version 300 es

precision highp float;

in vec4 v_color;

out vec4 out_color;
 
void main() {
  // Just set the output to a constant reddish-purple
  out_color = vec4(v_color.rgb, 0.5);
}