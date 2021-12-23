#version 300 es

layout(location = 0) in vec3 i_position;

out vec3 o_position;

uniform float u_speed;

// interpolation factors
uniform float lorenz_multiplier;
uniform float arneodo_multiplier;
uniform float burke_shaw_multiplier;
uniform float chen_lee_multiplier;
uniform float aizawa_multiplier;
uniform float thomas_multiplier;
uniform float lorenz_mod_2_multiplier;
uniform float hadley_multiplier;
uniform float halvorsen_multiplier;
uniform float three_scrolls_multiplier;
uniform float coullet_multiplier;
uniform float dadras_multiplier;

void main() {
  // extract inidividual values for cleaner math below
  float x = i_position.x;
  float y = i_position.y;
  float z = i_position.z;

  // each attractor has it's own "sweet spot" time delta
  float dt;

  // constants used in attractor formulas
  float a;
  float b;
  float c;
  float d;
  float f;
  float g;

  vec3 temp_delta = vec3(0.);
  vec3 total_delta = vec3(0.);

  // lorenz attractor ///////////////////////////////////////////////////////////////////
  dt = 0.005 * u_speed;
  a = 10.;
  b = 28.;
  c = 8. / 3.;

  temp_delta.x += dt * (a * (y - x));
  temp_delta.y += dt * (x * (b - z) - y);
  temp_delta.z += dt * (x * y - c * z);
  total_delta += temp_delta * lorenz_multiplier;

  // arneodo attractor ///////////////////////////////////////////////////////////////////
  dt = 0.015 * u_speed;
  a = -5.5;
  b = 3.5;
  c = -1.;

  temp_delta.x = dt * y;
  temp_delta.y = dt * z;
  temp_delta.z = dt * (-a * x - b * y - z + c * (x * x * x));
  total_delta += temp_delta * arneodo_multiplier;

  // burke-shaw attractor ///////////////////////////////////////////////////////////////////
  dt = 0.003 * u_speed;
  a = 10.;
  b = 4.272;

  temp_delta.x = dt * (-a * (x + y));
  temp_delta.y = dt * (-y - a * x * z);
  temp_delta.z = dt * (a * x * y + b);
  total_delta += temp_delta * burke_shaw_multiplier;

  // chen-lee attractor ///////////////////////////////////////////////////////////////////
  dt = 0.002 * u_speed;
  a = 5.;
  b = -10.;
  c = -0.38;

  temp_delta.x = dt * (a * x - y * z);
  temp_delta.y = dt * (b * y + x * z);
  temp_delta.z = dt * (c * z + x * (y / 3.));
  total_delta += temp_delta * chen_lee_multiplier;

  // aizawa attractor ///////////////////////////////////////////////////////////////////
  dt = 0.01 * u_speed;
  a = 0.95;
  b = 0.7;
  c = 0.1;
  d = 3.5;
  f = 0.25;
  g = 0.6;

  temp_delta.x = dt * ((z - b) * x - d * y);
  temp_delta.y = dt * (d * x + (z - b) * y);
  temp_delta.z = dt * (g + a * z - (z * z * z) / 3. - (x * x + y * y) * (1. + f * z) + c * z * (x * x * x));
  total_delta += temp_delta * aizawa_multiplier;

  // thomas attractor ///////////////////////////////////////////////////////////////////
  dt = 0.05 * u_speed;
  a = 0.19;

  temp_delta.x = dt * (-a * x + sin(y));
  temp_delta.y = dt * (-a * y + sin(z));
  temp_delta.z = dt * (-a * z + sin(x));
  total_delta += temp_delta * thomas_multiplier;

  // lorenz mod2 attractor ///////////////////////////////////////////////////////////////////
  dt = 0.005 * u_speed;
  a = 0.9;
  b = 5.;
  c = 9.9;
  d = 1.;

  temp_delta.x = dt * (-a * x + (y * y) - (z * z) + a * c);
  temp_delta.y = dt * (x * (y - b * z) + d);
  temp_delta.z = dt * (-z + x * (b * y + z));
  total_delta += temp_delta * lorenz_mod_2_multiplier;

  // hadley attractor ///////////////////////////////////////////////////////////////////
  dt = 0.005 * u_speed;
  a = 0.2;
  b = 4.;
  c = 8.;
  d = 1.;

  temp_delta.x = dt * (-(y * y) - (z * z) - a * x + a * c);
  temp_delta.y = dt * (x * y - b * x * z - y + d);
  temp_delta.z = dt * (b * x * y + x * z - z);
  total_delta += temp_delta * hadley_multiplier;

  // halvorsen attractor ///////////////////////////////////////////////////////////////////
  dt = 0.005 * u_speed;
  a = 1.4;

  temp_delta.x = dt * (-a * x - 4. * y - 4. * z - y * y);
  temp_delta.y = dt * (-a * y - 4. * z - 4. * x - z * z);
  temp_delta.z = dt * (-a * z - 4. * x - 4. * y - x * x);
  total_delta += temp_delta * halvorsen_multiplier;

  // Three-Scroll Unified chaotic System attractor ////////////////////////////////////////
  dt = 0.002 * u_speed;
  a = 40.;
  b = 0.833;
  c = 20.;
  d = 0.5;
  f = 0.65;

  temp_delta.x = dt * (a * (y - x) + d * x * z);
  temp_delta.y = dt * (c * y - x * z);
  temp_delta.z = dt * (b * z + x * y - f * (x * x));
  total_delta += temp_delta * three_scrolls_multiplier;

  // coullet attractor ///////////////////////////////////////////////////////////////////
  dt = 0.04 * u_speed;
  a = 0.8;
  b = -1.1;
  c = -0.45;
  d = -1.;

  temp_delta.x = dt * (y);
  temp_delta.y = dt * (z);
  temp_delta.z = dt * (a * x + b * y + c * z + d * (x * x * x));
  total_delta += temp_delta * coullet_multiplier;

  // dadras attractor ///////////////////////////////////////////////////////////////////
  dt = 0.01 * u_speed;
  a = 3.;
  b = 2.7;
  c = 1.7;
  d = 2.;
  f = 9.;

  temp_delta.x = dt * (y - a * x + b * y * z);
  temp_delta.y = dt * (c * y - x * z + z);
  temp_delta.z = dt * (d * x * y - f * z);
  total_delta += temp_delta * dadras_multiplier;

  // update position
  vec3 updated_position = i_position + total_delta;

  o_position = updated_position;
}