/** Gradientes e filtros compartilhados pela arte em SVG (renderizado uma única vez no App). */
export function SvgDefs() {
  const lg = (id: string, a: string, b: string, x2 = 0, y2 = 1) => (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  )
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
      <defs>
        <radialGradient id="g-plate" cx=".4" cy=".35" r=".85">
          <stop offset="0" stopColor="#2a2a2a" />
          <stop offset=".6" stopColor="#0e0e0e" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <radialGradient id="g-rice" cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4d9c8" />
        </radialGradient>
        {lg('g-salmon', '#ffb184', '#ff5535', 0.3, 1)}
        {lg('g-tuna', '#e8455b', '#8a0f24', 0.3, 1)}
        {lg('g-shrimp', '#ffd2ae', '#ff8a56', 0.3, 1)}
        {lg('g-kani', '#ffffff', '#f2e4da')}
        {lg('g-eel', '#8a4e26', '#2a1207')}
        {lg('g-egg', '#ffe885', '#f2b632')}
        {lg('g-white', '#fffdf8', '#e6dfd0')}
        {lg('g-nori', '#24362b', '#07110b')}
        {lg('g-avocado', '#b9dd7a', '#5f9a3a')}
        {lg('g-cucumber', '#c6e59b', '#6aa84f')}
        {lg('g-mango', '#ffd860', '#ffa01c')}
        {lg('g-panko', '#f6c36a', '#bf7a22')}
        {lg('g-fry', '#efb25a', '#a9611a')}
        {lg('g-tare', '#6a2412', '#260805')}
        {lg('g-chili', '#ff4a35', '#b1100c')}
        {lg('g-dough', '#fbf0d2', '#e3c98d')}
        {lg('g-leaf', '#4f9a45', '#1f5a2a')}
        {lg('g-broth', '#d9a158', '#a56a28')}
        {lg('g-wood', '#2b1b14', '#0d0705')}
        <filter id="f-soft" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#000" floodOpacity=".55" />
        </filter>
        <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <pattern id="p-seigaiha" width="48" height="24" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="0" cy="24" r="24" /><circle cx="0" cy="24" r="17" /><circle cx="0" cy="24" r="10" />
            <circle cx="48" cy="24" r="24" /><circle cx="48" cy="24" r="17" /><circle cx="48" cy="24" r="10" />
            <circle cx="24" cy="12" r="24" /><circle cx="24" cy="12" r="17" /><circle cx="24" cy="12" r="10" />
          </g>
        </pattern>
      </defs>
    </svg>
  )
}
