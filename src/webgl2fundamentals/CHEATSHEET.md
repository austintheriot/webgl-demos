# Terms
- Buffers 
  - arrays of binary data that is read from within the shaders via attributes.

- Attributes
  - provides information on how to extract data from buffers -- i.e. what type of data, how many elements to pull from the bugger each time the shader is run, etc.
  - Attributes can ONLY be supplied to the vertex shader, NOT the fragment shader. However, attribute data can be copied as a varying and supplied to the fragment shader that way.

- VAO (Vertex Array Object)
  -  collects information about the state of attributes, which attributes pull data from which buffers, etc.

- Uniforms 
  - values that stay the same for all vertices of a single draw call
  - could also be thought of as global variables you set before executing shaders.
  - Once a shader is being executed, the uniform is not mutable.

- Varyings 
  - data passed directly from the vertex shader to the fragment shader. This data can be interpolated when rasterizing triangles.

- Textures 
  - 2d array of 4 channels (i.e. rgba), but can hold really any data. 
  - can be used as random access from within shaders.

- Texel 
  - pixel within a texture image

- Components of a vector:
  - These are all equivalent when indexing from a vector:
    - .xyzw (position / direction)
    - .rgba (colors)
    - .stpq (texture coordinates)