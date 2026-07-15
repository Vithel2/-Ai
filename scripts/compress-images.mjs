import sharp from "sharp"
import { readdirSync, statSync, renameSync } from "node:fs"
import { join } from "node:path"

const dir = "public/img"

for (const file of readdirSync(dir)) {
  if (!file.endsWith(".png")) continue
  const src = join(dir, file)
  const before = statSync(src).size
  const tmp = src + ".tmp"
  const meta = await sharp(src).metadata()
  let pipeline = sharp(src)
  if (meta.width > 512) pipeline = pipeline.resize(512, 512, { fit: "inside" })
  await pipeline.png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(tmp)
  const after = statSync(tmp).size
  if (after < before) {
    renameSync(tmp, src)
    console.log(`${file}: ${(before / 1024).toFixed(0)}K -> ${(after / 1024).toFixed(0)}K`)
  } else {
    const { unlinkSync } = await import("node:fs")
    unlinkSync(tmp)
    console.log(`${file}: kept original (${(before / 1024).toFixed(0)}K)`)
  }
}
