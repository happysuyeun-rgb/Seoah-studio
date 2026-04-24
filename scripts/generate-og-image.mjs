import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const svgPath = path.join(root, 'public', 'og-image.svg')
const pngPath = path.join(root, 'public', 'og-image.png')

const svg = await fs.readFile(svgPath)

await sharp(svg, { density: 240 })
  .resize(1200, 630, { fit: 'cover' })
  .png({ quality: 100 })
  .toFile(pngPath)

console.log('Wrote', pngPath)

