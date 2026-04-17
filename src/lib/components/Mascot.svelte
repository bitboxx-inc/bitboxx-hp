<script lang="ts">
  export let color: string = '#FFFFFF';
  export let eyeColor: string = '#111014';
  export let cheekColor: string = '#FFB5B5';
  export let klass: string = '';
</script>

<svg viewBox="0 0 120 120" class={`inline-block ${klass}`} aria-hidden="true">
  <defs>
    <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color={cheekColor} stop-opacity="0.85" />
      <stop offset="100%" stop-color={cheekColor} stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="28" fill={color} stroke="#111014" stroke-width="2"/>
  <circle cx="38" cy="70" r="10" fill="url(#cheek)"/>
  <circle cx="82" cy="70" r="10" fill="url(#cheek)"/>
  <g class="origin-center" style="transform-origin:center">
    <ellipse cx="44" cy="58" rx="4" ry="5.5" fill={eyeColor}>
      <animate attributeName="ry" values="5.5;0.6;5.5" keyTimes="0;0.05;0.1" dur="5s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="76" cy="58" rx="4" ry="5.5" fill={eyeColor}>
      <animate attributeName="ry" values="5.5;0.6;5.5" keyTimes="0;0.05;0.1" dur="5s" repeatCount="indefinite"/>
    </ellipse>
  </g>
  <path d="M52 78 Q60 86 68 78" fill="none" stroke={eyeColor} stroke-width="2.4" stroke-linecap="round"/>
</svg>
