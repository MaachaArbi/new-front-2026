import * as React from 'react'
import Cropper, { type Area, type MediaSize, type Point } from 'react-easy-crop'
import {
  Circle,
  Maximize2,
  RectangleHorizontal,
  RectangleVertical,
  RotateCw,
  Scissors,
  Square,
  type LucideIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { renderCrop, trimImage } from '@/shared/lib/image-processing'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

type Shape = 'original' | 'round' | 'square' | 'portrait' | 'landscape'

/**
 * Formes à ratio **fixe**. « Original » n'est pas ici : son ratio = **celui de l'image**
 * (tout le logo tient, rien n'est coupé) et se calcule au chargement. « Rond » découpe en
 * plus un cercle à l'export.
 */
const FIXED_ASPECT: Record<Exclude<Shape, 'original'>, number> = {
  round: 1,
  square: 1,
  portrait: 3 / 4,
  landscape: 4 / 3,
}
const SHAPES: { key: Shape; icon: LucideIcon }[] = [
  { key: 'original', icon: Maximize2 },
  { key: 'round', icon: Circle },
  { key: 'square', icon: Square },
  { key: 'portrait', icon: RectangleVertical },
  { key: 'landscape', icon: RectangleHorizontal },
]

/**
 * Éditeur d'image **partagé** — l'utilisateur choisit la **forme** (rond, carré, portrait,
 * paysage) en connaissance de cause, recadre (zoom, rotation), **rogne les marges**, puis
 * Applique. La forme se **fabrique dans l'image** (ratio recadré ; rond = cercle découpé,
 * coins transparents) → l'affichage n'a qu'à faire `object-contain`, rien à stocker.
 *
 * react-easy-crop est **encapsulé ici** ; le rendu final est notre Canvas
 * (`@/shared/lib/image-processing`), donc changer de lib de crop ne touche que ce fichier.
 * L'appelant donne un `File`, reçoit un `File` retouché via `onDone`. Réutilisable partout.
 */
export function ImageEditor({
  file,
  open,
  onOpenChange,
  onDone,
  maxDimension = 1024,
  maxBytes = 2 * 1024 * 1024,
  outputType = 'image/webp',
  t,
}: {
  file: File | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: (edited: File) => void
  maxDimension?: number
  maxBytes?: number
  outputType?: string
  t: Translate
}) {
  const [workingUrl, setWorkingUrl] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [area, setArea] = React.useState<Area | null>(null)
  const [shape, setShape] = React.useState<Shape>('original')
  const [naturalAspect, setNaturalAspect] = React.useState(1)
  const [busy, setBusy] = React.useState(false)

  // Object URL du fichier source, révoqué à la fermeture / changement (pas de fuite mémoire).
  React.useEffect(() => {
    if (!open || !file) {
      setWorkingUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setWorkingUrl(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setArea(null)
    setShape('original')
    return () => URL.revokeObjectURL(url)
  }, [open, file])

  const cropShape = shape === 'round' ? 'round' : 'rect'
  // « Original » = ratio réel de l'image → tout tient, rien n'est coupé (le défaut).
  const aspect = shape === 'original' ? naturalAspect || 1 : FIXED_ASPECT[shape]

  const extensionOf = (type: string) =>
    type === 'image/png' ? 'png' : type === 'image/jpeg' ? 'jpg' : 'webp'

  const onMediaLoaded = (media: MediaSize) => {
    if (media.naturalHeight > 0) {
      setNaturalAspect(media.naturalWidth / media.naturalHeight)
    }
  }

  const handleTrim = async () => {
    if (!workingUrl || !file) return
    setBusy(true)
    try {
      const trimmed = await trimImage(workingUrl, file.name)
      if (trimmed) {
        const url = URL.createObjectURL(trimmed)
        URL.revokeObjectURL(workingUrl)
        setWorkingUrl(url)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotation(0)
      }
    } finally {
      setBusy(false)
    }
  }

  const handleApply = async () => {
    if (!workingUrl || !area || !file) return
    setBusy(true)
    try {
      const base = file.name.replace(/\.[^.]+$/, '')
      const edited = await renderCrop(workingUrl, area, rotation, {
        maxDimension,
        maxBytes,
        outputType,
        fileName: `${base}.${extensionOf(outputType)}`,
        round: shape === 'round',
      })
      onDone(edited)
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('imageEditor.title')}</DialogTitle>
        </DialogHeader>

        <div className="bg-muted relative h-72 w-full overflow-hidden rounded-md">
          {workingUrl ? (
            <Cropper
              image={workingUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={cropShape}
              objectFit="contain"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, areaPixels) => setArea(areaPixels)}
              onMediaLoaded={onMediaLoaded}
            />
          ) : null}
        </div>

        {/* Forme — l'utilisateur choisit en connaissance de cause. */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground me-1 text-xs">
            {t('imageEditor.shape')}
          </span>
          {SHAPES.map(({ key, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={shape === key ? 'primary' : 'outline'}
              onClick={() => setShape(key)}
            >
              <Icon />
              {t(`imageEditor.shape.${key}`)}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-1 items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {t('imageEditor.zoom')}
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="flex-1"
              aria-label={t('imageEditor.zoom')}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            <RotateCw />
            {t('imageEditor.rotate')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTrim}
            disabled={busy}
          >
            <Scissors />
            {t('imageEditor.trim')}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('imageEditor.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={busy || !area}
          >
            {t('imageEditor.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
