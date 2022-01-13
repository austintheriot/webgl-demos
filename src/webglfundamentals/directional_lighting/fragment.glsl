precision highp float;

varying vec4 v_color;

varying vec3 v_normal;

uniform vec3 u_reverse_light_direction;
 
void main() {
  // convert interpolated varying back to unit vector
  vec3 normal = v_normal;
  float light = dot(normal, u_reverse_light_direction);
  vec3 light_adjusted_color = v_color.rgb * light;

  // Just set the output to a constant reddish-purple
  gl_FragColor = vec4(light_adjusted_color, 1.);
}