/**
 * Traitement d'image **côté navigateur** (Canvas) — la brique « sortie » de l'éditeur,
 * volontairement **indépendante de la lib de crop** : react-easy-crop ne fournit que la
 * géométrie (`Area` + rotation), et c'est ici qu'on produit le fichier final. Changer un
 * jour de lib de crop ne touche donc PAS ce fichier. Voir `@/shared/ui/image-editor`.
 */

/** Rectangle de recadrage en pixels natifs (même forme que `Area` de react-easy-crop). */
export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface RenderOptions {
  /** Plus grand côté maximal du rendu (px) — au-delà, on réduit. */
  maxDimension: number
  /** Taille max du fichier (octets) — on baisse la qualité jusqu'à passer dessous. */
  maxBytes: number
  /** Type MIME de sortie (ex. `image/webp`). */
  outputType: string
  fileName: string
  /** Découpe un cercle (coins transparents) — la forme « ronde » est alors DANS l'image. */
  round?: boolean
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () =>
      reject(new Error('image-load-failed'))
    )
    image.src = src
  })
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-2d-context-unavailable')
  return ctx
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('to-blob-failed'))),
      type,
      quality
    )
  })
}

/** Baisse la qualité par paliers jusqu'à passer sous `maxBytes` (sans dépasser un plancher). */
async function compress(
  canvas: HTMLCanvasElement,
  type: string,
  maxBytes: number
): Promise<Blob> {
  let quality = 0.92
  let blob = await toBlob(canvas, type, quality)
  while (blob.size > maxBytes && quality > 0.4) {
    quality -= 0.12
    blob = await toBlob(canvas, type, quality)
  }
  return blob
}

/**
 * Produit le fichier final : **recadrage** (`crop`) + **rotation** + **réduction** au plus grand
 * côté `maxDimension` + **compression** sous `maxBytes`, au type `outputType`.
 */
export async function renderCrop(
  imageSrc: string,
  crop: CropArea,
  rotation: number,
  options: RenderOptions
): Promise<File> {
  const image = await loadImage(imageSrc)
  const radians = (rotation * Math.PI) / 180
  const { width: iw, height: ih } = image

  // 1) Dessine l'image pivotée sur un canvas à la taille de sa boîte englobante.
  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))
  const bboxW = iw * cos + ih * sin
  const bboxH = iw * sin + ih * cos
  const rotated = document.createElement('canvas')
  rotated.width = Math.ceil(bboxW)
  rotated.height = Math.ceil(bboxH)
  const rctx = context2d(rotated)
  rctx.translate(bboxW / 2, bboxH / 2)
  rctx.rotate(radians)
  rctx.drawImage(image, -iw / 2, -ih / 2)

  // 2) Extrait la zone recadrée.
  const cropW = Math.max(1, Math.round(crop.width))
  const cropH = Math.max(1, Math.round(crop.height))
  const cropped = document.createElement('canvas')
  cropped.width = cropW
  cropped.height = cropH
  context2d(cropped).drawImage(
    rotated,
    Math.round(crop.x),
    Math.round(crop.y),
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH
  )

  // 3) Réduit si le plus grand côté dépasse `maxDimension`.
  let output = cropped
  const maxSide = Math.max(cropW, cropH)
  if (maxSide > options.maxDimension) {
    const scale = options.maxDimension / maxSide
    const scaled = document.createElement('canvas')
    scaled.width = Math.round(cropW * scale)
    scaled.height = Math.round(cropH * scale)
    context2d(scaled).drawImage(cropped, 0, 0, scaled.width, scaled.height)
    output = scaled
  }

  // 4) Forme ronde : masque un cercle (coins transparents). La forme est alors DANS
  // l'image → elle s'affiche ronde partout, sans classe CSS ni métadonnée à stocker.
  if (options.round) {
    const masked = document.createElement('canvas')
    masked.width = output.width
    masked.height = output.height
    const mctx = context2d(masked)
    mctx.beginPath()
    mctx.ellipse(
      output.width / 2,
      output.height / 2,
      output.width / 2,
      output.height / 2,
      0,
      0,
      Math.PI * 2
    )
    mctx.clip()
    mctx.drawImage(output, 0, 0)
    output = masked
  }

  // 5) Compresse sous la limite de taille.
  const blob = await compress(output, options.outputType, options.maxBytes)
  return new File([blob], options.fileName, { type: blob.type })
}

/**
 * **Auto-trim** : rogne une bordure uniforme ou transparente. Le fond de référence est le
 * pixel du coin haut-gauche ; le transparent compte comme fond. Renvoie un PNG (sans perte,
 * conserve l'alpha, ré-éditable) ou `null` s'il n'y a rien à rogner. Idéal pour un logo à fond
 * uni/transparent ; sur une photo pleine, il n'y a simplement rien à retirer.
 */
export async function trimImage(
  imageSrc: string,
  fileName: string
): Promise<File | null> {
  const image = await loadImage(imageSrc)
  const width = image.width
  const height = image.height
  const source = document.createElement('canvas')
  source.width = width
  source.height = height
  const ctx = context2d(source)
  ctx.drawImage(image, 0, 0)
  const data = ctx.getImageData(0, 0, width, height).data

  const bgR = data[0] ?? 0
  const bgG = data[1] ?? 0
  const bgB = data[2] ?? 0
  const bgA = data[3] ?? 0
  const tolerance = 12
  const isBackground = (i: number): boolean => {
    const a = data[i + 3] ?? 0
    if (a < 10) return true // transparent = fond
    return (
      Math.abs((data[i] ?? 0) - bgR) <= tolerance &&
      Math.abs((data[i + 1] ?? 0) - bgG) <= tolerance &&
      Math.abs((data[i + 2] ?? 0) - bgB) <= tolerance &&
      Math.abs(a - bgA) <= tolerance
    )
  }

  let top = height
  let left = width
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isBackground((y * width + x) * 4)) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }

  if (right < left || bottom < top) return null // tout est du fond
  const w = right - left + 1
  const h = bottom - top + 1
  if (w === width && h === height) return null // rien à rogner

  const trimmed = document.createElement('canvas')
  trimmed.width = w
  trimmed.height = h
  context2d(trimmed).drawImage(source, left, top, w, h, 0, 0, w, h)
  const blob = await toBlob(trimmed, 'image/png', 1)
  return new File([blob], fileName, { type: 'image/png' })
}
