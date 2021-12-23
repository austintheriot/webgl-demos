#version 300 es

layout(location = 0) in vec3 i_position;

out vec3 o_position;

uniform float u_speed;

// interpolation factors
uniform float u_a;
uniform float u_b;
uniform float u_c;
uniform float u_d;
uniform float u_e;
uniform float u_f;
uniform float u_g;
uniform float u_h;
uniform float u_i;
uniform float u_j;
uniform float u_k;
uniform float u_l;

void main() {
  float x = i_position.x;
  float y = i_position.y;
  float z = i_position.z;

  float a;
  float b;
  float c;
  float d;
  float f;
  float g;

  // a --- lorenz attractor 
  float dta = 0.005 * u_speed;
  a = 10.;
  b = 28.;
  c = 8. / 3.;

  float dxa = dta * (a * (y - x));
  float dya = dta * (x * (b - z) - y);
  float dza = dta * (x * y - c * z);

  // b --- arneodo attractor

  float dtb = 0.015 * u_speed;
  a = -5.5;
  b = 3.5;
  c = -1.;

  float dxb = dtb * y;
  float dyb = dtb * z;
  float dzb = dtb * (-a * x - b * y - z + c * (x * x * x));

  // c --- burke - Shaw attractor
  float dtc = 0.003 * u_speed;
  a = 10.;
  b = 4.272;

  float dxc = dtc * (-a * (x + y));
  float dyc = dtc * (-y - a * x * z);
  float dzc = dtc * (a * x * y + b);

  // d --- chen - lee attractor
  float dtd = 0.002 * u_speed;
  a = 5.;
  b = -10.;
  c = -0.38;

  float dxd = dtd * (a * x - y * z);
  float dyd = dtd * (b * y + x * z);
  float dzd = dtd * (c * z + x * (y / 3.));

  // e --- aizawa attractor
  float dte = 0.01 * u_speed;
  a = 0.95;
  b = 0.7;
  c = 0.1;
  d = 3.5;
  f = 0.25;
  g = 0.6;

  float dxe = dte * ((z - b) * x - d * y);
  float dye = dte * (d * x + (z - b) * y);
  float dze = dte * (g + a * z - (z * z * z) / 3. - (x * x + y * y) * (1. + f * z) + c * z * (x * x * x));

  // f --- Thomas attractor
  float dtf = 0.05 * u_speed;
  a = 0.19;

  float dxf = dtf * (-a * x + sin(y));
  float dyf = dtf * (-a * y + sin(z));
  float dzf = dtf * (-a * z + sin(x));

  // g --- lorenz mod2 attractor
  float dtg = 0.005 * u_speed;
  a = 0.9;
  b = 5.;
  c = 9.9;
  d = 1.;

  float dxg = dtg * (-a * x + (y * y) - (z * z) + a * c);
  float dyg = dtg * (x * (y - b * z) + d);
  float dzg = dtg * (-z + x * (b * y + z));

  // h --- hadley attractor
  float dth = 0.005 * u_speed;
  a = 0.2;
  b = 4.;
  c = 8.;
  d = 1.;

  float dxh = dth * (-(y * y) - (z * z) - a * x + a * c);
  float dyh = dth * (x * y - b * x * z - y + d);
  float dzh = dth * (b * x * y + x * z - z);

  // i --- halvorsen attractor
  float dti = 0.005 * u_speed;
  a = 1.4;

  float dxi = dti * (-a * x - 4. * y - 4. * z - y * y);
  float dyi = dti * (-a * y - 4. * z - 4. * x - z * z);
  float dzi = dti * (-a * z - 4. * x - 4. * y - x * x);

  // j --- Three-Scroll Unified chaotic System attractor
  float dtj = 0.002 * u_speed;
  a = 40.;
  b = 0.833;
  c = 20.;
  d = 0.5;
  f = 0.65;

  float dxj = dtj * (a * (y - x) + d * x * z);
  float dyj = dtj * (c * y - x * z);
  float dzj = dtj * (b * z + x * y - f * (x * x));

  // k --- coullet attractor
  float dtk = 0.04 * u_speed;
  a = 0.8;
  b = -1.1;
  c = -0.45;
  d = -1.;

  float dxk = dtk * (y);
  float dyk = dtk * (z);
  float dzk = dtk * (a * x + b * y + c * z + d * (x * x * x));

  // l --- dadras attractor
  float dtl = 0.01 * u_speed;
  a = 3.;
  b = 2.7;
  c = 1.7;
  d = 2.;
  f = 9.;

  float dxl = dtl * (y - a * x + b * y * z);
  float dyl = dtl * (c * y - x * z + z);
  float dzl = dtl * (d * x * y - f * z);

  vec3 finalforce = (vec3(u_a) * vec3(dxa, dya, dza)) +
    (vec3(u_b) * vec3(dxb, dyb, dzb)) +
    (vec3(u_c) * vec3(dxc, dyc, dzc)) +
    (vec3(u_d) * vec3(dxd, dyd, dzd)) +
    (vec3(u_e) * vec3(dxe, dye, dze)) +
    (vec3(u_f) * vec3(dxf, dyf, dzf)) +
    (vec3(u_g) * vec3(dxg, dyg, dzg)) +
    (vec3(u_h) * vec3(dxh, dyh, dzh)) +
    (vec3(u_i) * vec3(dxi, dyi, dzi)) +
    (vec3(u_j) * vec3(dxj, dyj, dzj)) +
    (vec3(u_k) * vec3(dxk, dyk, dzk)) +
    (vec3(u_l) * vec3(dxl, dyl, dzl));

  // update position
  vec3 updated_position = i_position + finalforce;

  // wrap position to box
  // updated_position = mod(updated_position + 1.0, 2.0) - 1.0;

  o_position = updated_position;
}