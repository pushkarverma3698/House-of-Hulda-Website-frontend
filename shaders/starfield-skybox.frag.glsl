uniform float uTime;
uniform float uScroll;
uniform vec2 uResolution;
uniform vec3 uSkyBaseColor;  // Deep indigo/night sky (#070814)
uniform vec3 uStarColor;     // Crystalline starlight (#e8f0fe)

varying vec2 vUv;
varying vec3 vWorldPosition;

// Hash function for pseudo-random star placements
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Procedural starfield layer generator
float starLayer(vec2 uv, float scale, float threshold) {
  vec2 id = floor(uv * scale);
  vec2 gv = fract(uv * scale) - 0.5;

  float n = hash21(id);
  if (n < threshold) return 0.0;

  // Star position jitter within cell
  vec2 starPos = vec2(hash21(id + 1.0), hash21(id + 2.0)) - 0.5;
  float dist = length(gv - starPos * 0.6);

  // Twinkle intensity driven by sine time wave and unique cell seed
  float twinkle = sin(uTime * (1.5 + n * 4.0) + n * 6.28) * 0.5 + 0.5;
  twinkle = pow(twinkle, 2.0); // Sharpen twinkle pulse

  // Crisp pin-point core + subtle radial halo
  float core = smoothstep(0.06, 0.0, dist);
  float halo = smoothstep(0.25, 0.0, dist) * 0.25;

  return (core + halo) * (0.4 + 0.6 * twinkle);
}

void main() {
  vec3 normPos = normalize(vWorldPosition);

  // Convert 3D world position to spherical UV mapping
  vec2 sphereUv = vec2(
    atan(normPos.z, normPos.x) / (2.0 * 3.14159265) + 0.5,
    asin(clamp(normPos.y, -1.0, 1.0)) / 3.14159265 + 0.5
  );

  // Combine multiple star density layers (dense background micro-stars + bright hero stars)
  float stars = 0.0;
  stars += starLayer(sphereUv, 180.0, 0.94) * 0.7;
  stars += starLayer(sphereUv, 340.0, 0.97) * 0.5;
  stars += starLayer(sphereUv, 600.0, 0.99) * 0.3;

  // Fade stars near horizon where mist and atmosphere obscure them
  float horizonFade = smoothstep(0.0, 0.35, normPos.y);
  stars *= horizonFade;

  // Base sky atmosphere gradient
  vec3 skyColor = mix(uSkyBaseColor * 0.4, uSkyBaseColor, normPos.y * 0.5 + 0.5);

  // Add twinkling starlight to sky
  vec3 finalColor = skyColor + uStarColor * stars;

  gl_FragColor = vec4(finalColor, 1.0);
}
