#version 300 es

in vec2 a_position;

out vec4 v_color;
 
uniform vec2 u_resolution;
 
void main() {
    // convert pixel locations to percentage range (0, 1)
    vec2 zeroToOne = a_position / u_resolution;
 
    // convert range (0, 1) -> (0, 2)
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // (0, 2) -> (-1, 1)
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // make y = 0 be at the top instead of the bottom
    vec2 zeroYAtTop = clipSpace * vec2(1, -1);
 
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = vec4(zeroYAtTop, 0, 1);
    v_color = gl_Position * 0.5 + 0.5;
  }