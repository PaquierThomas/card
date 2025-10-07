precision highp float;

  uniform float iTime;
  uniform vec2 iResolution;
  uniform float scrollOffset;

  void mainImage(out vec4 o, vec2 I) {
    I -= o.zw = iResolution.xy / 2.0;
    float t = iTime * 5.0 + scrollOffset * 200.0;
    float pattern = sin(atan(I.y, I.x) / 0.1) * sin(20.0 * (o.w /= length(I)) + t) - 1.0 + o.w;
    float monochrome = 1.0 - pattern * 0.5;
    float invertedMonochrome = 1.0 - monochrome;
    o = vec4(invertedMonochrome, invertedMonochrome, invertedMonochrome, 1.0);
  }

  void main() {
     gl_Position = vec4(position, 1.0);
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
  