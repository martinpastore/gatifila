// Definición de los tipos de gatitos (incluyendo el comodín) y su dibujo en SVG.

export const JOKER_ID = 6;
export const JOKER_CHANCE = 0.04;

export const TYPES = [
  { id:0, name:'Atigrado', base:'#E8A55C', tint:'#FCE7CF', earInner:'#F6C9A0', eye:'#3A2740', nose:'#B4718A', line:'#5B4A63', whisker:'#8A5A2E', pattern:'stripes', accent:'#B96F2E' },
  { id:1, name:'Negro',    base:'#4A4458', tint:'#E4DFE8', earInner:'#6E5C77', eye:'#BFF4C0', nose:'#D68FA6', line:'#E4DFE8', whisker:'#E4DFE8', pattern:'solid',   accent:'#3A3446' },
  { id:2, name:'Blanco',   base:'#FDF6EC', tint:'#F5E9D6', earInner:'#F2C6D6', eye:'#3A2740', nose:'#E28FA6', line:'#5B4A63', whisker:'#C9B79A', pattern:'outline', accent:'#E0CBAA' },
  { id:3, name:'Gris',     base:'#9AA3B2', tint:'#E9EDF2', earInner:'#F2A6C1', eye:'#2C2A33', nose:'#B4718A', line:'#3A3A42', whisker:'#F3F5F8', pattern:'solid',   accent:'#7B8494' },
  { id:4, name:'Naranja',  base:'#FF9F5A', tint:'#FFE6D2', earInner:'#FFD3AE', eye:'#3A2740', nose:'#B4718A', line:'#5B4A63', whisker:'#C9631E', pattern:'patch',   accent:'#FFF6EC' },
  { id:5, name:'Manchado', base:'#F2A6C1', tint:'#FDEAF1', earInner:'#F7C6DA', eye:'#3A2740', nose:'#B4718A', line:'#5B4A63', whisker:'#C9789A', pattern:'spots',   accent:'#A9673D' },
  { id:6, name:'Comodín',  base:null,     tint:'#F6EFFF', earInner:'#FFFFFF', eye:'#3A2740', nose:'#B4718A', line:'#5B4A63', whisker:'#9A7FBF', pattern:'joker',   accent:'#FFFFFF' },
];

let jokerGradCounter = 0;

export function catSVG(t){
  let defs = '';
  let base = t.base;
  if(t.pattern === 'joker'){
    const gid = 'jokerGrad' + (jokerGradCounter++);
    defs = `<defs><linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9CEE"/>
      <stop offset="35%" stop-color="#B18CFF"/>
      <stop offset="70%" stop-color="#8CD9FF"/>
      <stop offset="100%" stop-color="#FFE28C"/>
    </linearGradient></defs>`;
    base = `url(#${gid})`;
  }
  const earL = `<path d="M22,34 L33,9 L43,37 Z" fill="${base}"/>`;
  const earR = `<path d="M78,34 L67,9 L57,37 Z" fill="${base}"/>`;
  const earLInner = `<path d="M27,30 L33,17 L38,32 Z" fill="${t.earInner}"/>`;
  const earRInner = `<path d="M73,30 L67,17 L62,32 Z" fill="${t.earInner}"/>`;
  const headOutline = t.pattern === 'outline' ? `stroke="${t.accent}" stroke-width="2"` : '';
  const head = `<circle cx="50" cy="56" r="34" fill="${base}" ${headOutline}/>`;

  let pattern = '';
  if(t.pattern === 'stripes'){
    pattern = `<g stroke="${t.accent}" stroke-width="3" stroke-linecap="round">
      <path d="M32,28 L38,20" fill="none"/>
      <path d="M42,24 L46,15" fill="none"/>
      <path d="M68,28 L62,20" fill="none"/>
      <path d="M58,24 L54,15" fill="none"/>
      <path d="M20,50 L28,49" fill="none"/>
      <path d="M80,50 L72,49" fill="none"/>
    </g>`;
  } else if(t.pattern === 'spots'){
    pattern = `<g fill="${t.accent}">
      <circle cx="30" cy="44" r="5"/>
      <circle cx="67" cy="62" r="6"/>
      <circle cx="62" cy="32" r="3.5"/>
      <circle cx="36" cy="70" r="4"/>
    </g>`;
  } else if(t.pattern === 'patch'){
    pattern = `<ellipse cx="50" cy="76" rx="16" ry="11" fill="${t.accent}"/>`;
  } else if(t.pattern === 'joker'){
    pattern = `<g fill="#FFFFFF" font-size="10" font-family="sans-serif">
      <text x="24" y="35">✦</text>
      <text x="63" y="30">✦</text>
      <text x="45" y="80">✦</text>
    </g>`;
  }

  const eyes = `<g>
    <ellipse cx="38" cy="53" rx="4.6" ry="6.2" fill="${t.eye}"/>
    <ellipse cx="62" cy="53" rx="4.6" ry="6.2" fill="${t.eye}"/>
    <circle cx="39.4" cy="50.4" r="1.4" fill="#fff"/>
    <circle cx="63.4" cy="50.4" r="1.4" fill="#fff"/>
  </g>`;
  const nose = `<path d="M46.5,63 L53.5,63 L50,67.5 Z" fill="${t.nose}"/>`;
  const mouth = `<path d="M50,67.5 Q45,73 39,69.5 M50,67.5 Q55,73 61,69.5" stroke="${t.line}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const whiskers = `<g stroke="${t.whisker}" stroke-width="1.5" stroke-linecap="round">
    <line x1="10" y1="56" x2="28" y2="54"/>
    <line x1="10" y1="63" x2="28" y2="61.5"/>
    <line x1="90" y1="56" x2="72" y2="54"/>
    <line x1="90" y1="63" x2="72" y2="61.5"/>
  </g>`;

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${defs}
    <circle cx="50" cy="56" r="46" fill="${t.tint}"/>
    ${earL}${earR}${earLInner}${earRInner}
    ${head}
    ${pattern}
    ${eyes}${nose}${mouth}${whiskers}
  </svg>`;
}
