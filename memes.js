// memes.js — small pack of reveal images (SVG data URIs)
const memes = [
  // stylized glitch face svg (simple but effective)
  `data:image/svg+xml;utf8,
  <svg xmlns='http://www.w3.org/2000/svg' width='1080' height='600'>
    <defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='%23ff6b6b'/><stop offset='1' stop-color='%238d6bff'/></linearGradient></defs>
    <rect width='100%' height='100%' fill='%23080b10'/>
    <g transform='translate(60,30)'>
      <rect x='0' y='0' width='960' height='540' rx='20' fill='url(%23g)' opacity='0.12'/>
      <text x='480' y='120' font-size='48' fill='%23ffffff' text-anchor='middle' font-family='Impact,Arial'>BRAINROT</text>
      <g transform='translate(220,160)'>
        <circle cx='120' cy='120' r='100' fill='%23fff' opacity='0.12'/>
        <circle cx='85' cy='100' r='10' fill='%23000'/>
        <rect x='80' y='150' width='80' height='14' rx='6' fill='%23000'/>
      </g>
      <text x='480' y='480' font-size='28' fill='%23ffe680' text-anchor='middle' font-family='Arial'>REVEAL: WHAT YOU DIDN'T EXPECT</text>
    </g>
  </svg>`,

  // creepy glitch panel
  `data:image/svg+xml;utf8,
  <svg xmlns='http://www.w3.org/2000/svg' width='1080' height='600'>
    <rect width='100%' height='100%' fill='%2300060b'/>
    <text x='540' y='140' font-size='52' fill='%23ffef5f' text-anchor='middle' font-family='Impact'>WHAT THEY DIDN'T SEE</text>
    <rect x='120' y='200' width='840' height='320' rx='12' fill='%2318222a'/>
    <text x='540' y='360' font-size='32' fill='%23ffffff' text-anchor='middle' font-family='Arial'>⋯AND THEN IT ALL CHANGED ⋯</text>
  </svg>`,

  // surreal face
  `data:image/svg+xml;utf8,
  <svg xmlns='http://www.w3.org/2000/svg' width='1080' height='600'>
    <rect width='100%' height='100%' fill='%23020b0f'/>
    <g transform='translate(120,60)'>
      <ellipse cx='420' cy='180' rx='260' ry='160' fill='%23ffd5ff' opacity='0.06'/>
      <circle cx='350' cy='160' r='46' fill='%23fff' />
      <circle cx='490' cy='160' r='46' fill='%23000000' />
      <rect x='350' y='240' width='220' height='28' rx='12' fill='%23ff8c66' />
      <text x='460' y='440' font-size='28' fill='%23fff' text-anchor='middle' font-family='Arial'>I SAW SOMETHING</text>
    </g>
  </svg>`
];

window.__BR_MEMES = memes;
