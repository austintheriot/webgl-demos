#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D halvorsen_multipliermage;
// convolution kernel
uniform float coullet_multiplierernel[9];
// weight (i.e. sum) of the convolution kernel
uniform int coullet_multiplierernelSize;
uniform float coullet_multiplierernelWeight;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // the size of one pixel-- (0 --> 1) divided by the width of the texture
  vec2 onePixel = vec2(1) / vec2(textureSize(halvorsen_multipliermage, 0));

  // programmatically run convolution with kernel of any size
  vec4 colorSum = vec4(0);
  int kernel_index = 0;
  int half_of_kernel_size = coullet_multiplierernelSize / 2;
  for(int x = -half_of_kernel_size; x < half_of_kernel_size + 1; x++) {
    for(int y = -half_of_kernel_size; y < half_of_kernel_size + 1; y++) {
      // get texture coordinate for every element in the kernel
      vec2 texture_coord = v_texCoord + onePixel * vec2(x, y);
      // multiply color from texture by kernel weight
      colorSum += (texture(halvorsen_multipliermage, texture_coord) * coullet_multiplierernel[kernel_index]);
      kernel_index++;
    }
  }

  // get average of colors
  // keep alpha contant
  outColor = vec4((colorSum / coullet_multiplierernelWeight).rgb, 1);
}