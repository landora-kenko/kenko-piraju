// Gera src/fonts-jp.css com só as fatias (unicode-range) das fontes japonesas que o site realmente usa.
// Rode `node scripts/subset-fonts.mjs` sempre que adicionar kanji/kana novos em src/.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const used = new Set()
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|css)$/.test(f) && f !== 'fonts-jp.css')
      for (const ch of readFileSync(p, 'utf8')) {
        const c = ch.codePointAt(0)
        if ((c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef)) used.add(c)
      }
  }
}
walk('src')

const inRange = (ranges, cp) => ranges.some(([a, b]) => cp >= a && cp <= b)
let out = '/* gerado por scripts/subset-fonts.mjs, não edite à mão */\n'
let files = 0
for (const w of [500, 700, 800]) {
  const css = readFileSync(`node_modules/@fontsource/shippori-mincho/${w}.css`, 'utf8')
  for (const m of css.matchAll(/@font-face\s*\{[^}]*\}/g)) {
    const block = m[0]
    const ur = /unicode-range:\s*([^;]+);/.exec(block)?.[1] ?? ''
    const ranges = ur.split(',').map((s) => s.trim().replace('U+', '').split('-').map((h) => parseInt(h, 16))).map(([a, b]) => [a, b ?? a])
    if ([...used].some((cp) => inRange(ranges, cp))) {
      out += block.replace(/url\(\.\/files\//g, 'url(../node_modules/@fontsource/shippori-mincho/files/').replace(/,\s*url\([^)]*\.woff\)\s*format\("woff"\)/g, '') + '\n'
      files++
    }
  }
}
writeFileSync('src/fonts-jp.css', out)
console.log(`${used.size} caracteres japoneses, ${files} fatias de fonte`)
