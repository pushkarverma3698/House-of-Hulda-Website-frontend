uniform float uTime;
uniform float uScroll;
uniform vec3 uCameraPosition;
uniform float uMistDensity;
uniform vec3 uMistColor;       // Cool nocturnal blue/violet (#1a1d2e)
uniform vec3 uEmberGlowColor;  // Warm Kath-Kuni window light accent (#ff8c42)

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;

// 3D Simplex noise generator
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + vec4(ns.yyyy);
  vec4 y = y_ *ns.x + vec4(ns.yyyy);
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractional Brownian Motion for multi-scale rolling mist layers
float fBm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.05;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec3 rayOrigin = uCameraPosition;
  vec3 rayDir = normalize(vWorldPosition - uCameraPosition);

  // Time-animated rolling motion across Naggar ridge (slow drifting speed)
  vec3 samplePos = vWorldPosition * 0.15 + vec3(uTime * 0.04, uTime * 0.015, uTime * 0.03);

  // Add scroll influence: mist clears as guest ascends from 1,420m to 2,000m
  float mistScrollFactor = smoothstep(0.0, 0.7, 1.0 - uScroll * 0.6);

  // Compute noise density
  float noiseVal = fBm(samplePos);
  float mistDensity = smoothstep(-0.2, 0.8, noiseVal) * uMistDensity * mistScrollFactor;

  // Height attenuation: mist stays denser in lower valley Y coordinates
  float heightFactor = exp(-vWorldPosition.y * 0.35);
  mistDensity *= heightFactor;

  // Scattering lighting: Warm Kath-Kuni hearth light scattering inside mist
  vec3 lightPos = vec3(0.0, 1.5, 0.0); // Homestay hearth position
  float distToLight = length(vWorldPosition - lightPos);
  float hearthLightScatter = exp(-distToLight * 0.4) * 1.5;

  vec3 finalColor = mix(uMistColor, uEmberGlowColor, hearthLightScatter);

  // Output translucent volumetric mist alpha
  float alpha = clamp(mistDensity * 0.75, 0.0, 0.85);

  gl_FragColor = vec4(finalColor, alpha);
}
