// Builds the app icons from the Shass mark the live site serves as its
// favicon (/storage/shass-loog.png, a 500x500 PNG).
//
// Next's file conventions in src/app apply to every route, so the storefront,
// the admin console and the embedded Studio all pick these up:
//   icon.png        -> <link rel="icon">
//   apple-icon.png  -> <link rel="apple-touch-icon">
//   favicon.ico     -> /favicon.ico for clients that ask for it by name
//
//   node scripts/generate-icons.mjs

import {writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const appDir = path.join(root, 'src', 'app')
const SOURCE = 'https://www.shassgift.com/storage/shass-loog.png'

const res = await fetch(SOURCE)
if (!res.ok) throw new Error(`Could not fetch the source icon: HTTP ${res.status}`)
const source = Buffer.from(await res.arrayBuffer())

// The mark is dark, so it disappears on a dark browser tab strip: flatten
// onto white rather than leaving transparency. ensureAlpha puts the alpha
// channel back afterwards — Next's .ico decoder rejects a non-RGBA PNG
// payload with "The PNG is not in RGBA format!", which 500s every page.
const render = (size) =>
  sharp(source)
    .resize(size, size, {fit: 'contain', background: {r: 255, g: 255, b: 255, alpha: 1}})
    .flatten({background: '#ffffff'})
    .ensureAlpha()
    .png()
    .toBuffer()

const icon = await render(512)
writeFileSync(path.join(appDir, 'icon.png'), icon)
console.log(`icon.png        512x512  ${icon.length} bytes`)

const apple = await render(180)
writeFileSync(path.join(appDir, 'apple-icon.png'), apple)
console.log(`apple-icon.png  180x180  ${apple.length} bytes`)

// An .ico may hold a PNG payload directly, so the container is just a
// 6-byte header plus one 16-byte directory entry in front of the PNG.
const png32 = await render(32)
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(1, 4) // one image
const entry = Buffer.alloc(16)
entry[0] = 32 // width
entry[1] = 32 // height
entry[2] = 0 // palette colours
entry[3] = 0 // reserved
entry.writeUInt16LE(1, 4) // colour planes
entry.writeUInt16LE(32, 6) // bits per pixel
entry.writeUInt32LE(png32.length, 8)
entry.writeUInt32LE(header.length + entry.length, 12)
const ico = Buffer.concat([header, entry, png32])
writeFileSync(path.join(appDir, 'favicon.ico'), ico)
console.log(`favicon.ico     32x32    ${ico.length} bytes`)
