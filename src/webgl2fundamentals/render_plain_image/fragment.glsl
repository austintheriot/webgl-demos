#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D halvorsen_multipliermage;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // take coordinates given from the fragment shader
  // and use them to look up the color at that location in the texture
  outColor = texture(halvorsen_multipliermage, v_texCoord);
}