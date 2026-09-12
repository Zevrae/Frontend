// @ts-nocheck
// This project is on fabric v7 (see package.json — "fabric": "^7.4.0").
// Fabric v6/v7 replaced the old v5 callback-based API with a Promise-based
// one (most notably `fabric.Image.fromURL`), and restructured its exports.
// This hook targets that v7 API directly.
import { useEffect, useRef } from 'react';
import * as fabricNS from 'fabric';

// fabric v7's ESM build exports everything as named exports on the module
// namespace (Canvas, Image/FabricImage, etc.) rather than a single default
// `fabric` object, but some bundler/interop configurations still wrap it
// under `.default`. Unwrapping defensively here works either way.
const fabric: any = (fabricNS as any).default ?? fabricNS;

export const STAGE_WIDTH = 380;
export const STAGE_HEIGHT = 460;

// Target export resolution: ~2K on the longer edge (stage is portrait, so
// that's the height). Everything exported for the final product image —
// both the transparent design layer and the composited garment+design
// PNG — is rendered at this multiplier rather than at on-screen
// (380x460) resolution, so the on-screen editor stays small/fast while
// the file that actually gets uploaded as the product image is print
// quality.
const TARGET_LONG_EDGE_PX = 2048;
export const EXPORT_MULTIPLIER = TARGET_LONG_EDGE_PX / STAGE_HEIGHT;

/**
 * Owns one Fabric.js canvas sized to a garment's print area only — the
 * "limited transparent canvas" design constraint. It has no background of
 * its own (fully transparent) and sits absolutely positioned over a static
 * garment photo; the gold border is pure CSS. Because the canvas element
 * itself is print-area sized, Fabric naturally clips content to that area
 * and mouse interaction can't drag a design past its edges.
 */
export function usePrintCanvas(canvasEl: React.RefObject<HTMLCanvasElement>, width: number, height: number) {
  const fabricRef = useRef<any>(null);
  const designRef = useRef<any>(null);
  const api = useRef<any>({});

  useEffect(() => {
    if (!canvasEl.current) return;
    const canvas = new fabric.Canvas(canvasEl.current, {
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      width,
      height,
    });
    fabricRef.current = canvas;
    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  api.current.addImage = (dataUrl: string, onDone?: () => void) => {
    // If the Fabric canvas isn't ready yet (e.g. garment data still loading),
    // retry once after a short delay so the upload isn't silently dropped.
    if (!fabricRef.current) {
      setTimeout(() => api.current.addImage(dataUrl, onDone), 150);
      return;
    }
    // fabric v7's Image.fromURL is Promise-based (it no longer takes a
    // (img, isError) callback as its second argument — that's the v5 API).
    // Passing a callback there silently does nothing: it gets treated as
    // the `{crossOrigin, signal}` options object instead, the returned
    // promise is never awaited, and the image never gets added to the
    // canvas — which is exactly why uploaded designs weren't showing up.
    fabric.Image.fromURL(dataUrl, { crossOrigin: 'anonymous' })
      .then((img: any) => {
        // Always read the *live* canvas ref inside the async callback — the
        // canvas may have been recreated (width/height change) between the
        // fromURL call and this callback firing.
        const liveCanvas = fabricRef.current;
        if (!liveCanvas || !img) return;
        if (designRef.current) liveCanvas.remove(designRef.current);
        const targetWidth = Math.min(width, height) * 0.8;
        img.scaleToWidth(targetWidth);
        img.set({ left: width / 2, top: height / 2, originX: 'center', originY: 'center' });
        liveCanvas.add(img);
        liveCanvas.setActiveObject(img);
        designRef.current = img;
        liveCanvas.requestRenderAll();
        if (onDone) onDone();
      })
      .catch((err: any) => {
        console.error('[usePrintCanvas] failed to load uploaded design image:', err);
      });
  };

  api.current.removeImage = () => {
    const canvas = fabricRef.current;
    if (!canvas || !designRef.current) return;
    canvas.remove(designRef.current);
    designRef.current = null;
    canvas.requestRenderAll();
  };

  api.current.centerImage = () => {
    const canvas = fabricRef.current;
    if (!canvas || !designRef.current) return;
    designRef.current.set({ left: width / 2, top: height / 2 });
    designRef.current.setCoords();
    canvas.requestRenderAll();
  };

  api.current.hasImage = () => !!designRef.current;

  // Design layer only (transparent PNG, print-area sized) — used internally
  // by the compositor. Rendered at `multiplier`x the on-screen print-area
  // size (default: full EXPORT_MULTIPLIER, i.e. ~2K on the final
  // composite's long edge) so the exported design isn't limited to the
  // small on-screen canvas resolution. Fabric re-renders from each
  // object's original source image at export time, so the uploaded
  // artwork's own resolution (not the tiny on-screen preview) is what
  // actually gets used here.
  api.current.exportDesignLayer = (multiplier: number = EXPORT_MULTIPLIER) => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    return canvas.toDataURL({ format: 'png', multiplier });
  };

  return api;
}

/**
 * Composites a static garment photo (full stage size) with a print-area
 * sized design layer into a single PNG. This is what gets uploaded and
 * turned into the generated Product's image, so it's rendered at
 * `multiplier`x the on-screen stage size (default: EXPORT_MULTIPLIER,
 * i.e. ~2K on the long edge) rather than at the tiny 380x460 on-screen
 * stage resolution — the editor UI stays compact while the actual
 * uploaded product image is print/display quality.
 */
export function compositeStagePNG({
  garmentImgSrc,
  designDataUrl,
  printArea,
  multiplier = EXPORT_MULTIPLIER,
}: {
  garmentImgSrc: string;
  designDataUrl: string | null;
  printArea: { left: number; top: number; width: number; height: number };
  multiplier?: number;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const outWidth = Math.round(STAGE_WIDTH * multiplier);
    const outHeight = Math.round(STAGE_HEIGHT * multiplier);

    const canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    // @ts-ignore — not in older lib.dom typings, but supported everywhere
    // this app targets; improves upscaling quality for the garment photo.
    ctx.imageSmoothingQuality = 'high';

    const garmentImg = new Image();
    garmentImg.crossOrigin = 'anonymous';
    garmentImg.onload = () => {
      ctx.drawImage(garmentImg, 0, 0, outWidth, outHeight);

      if (!designDataUrl) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }
      const designImg = new Image();
      designImg.onload = () => {
        // The design layer PNG was itself already exported at `multiplier`
        // resolution (see exportDesignLayer), so it's drawn at the same
        // scaled-up print-area rect here — everything lines up exactly as
        // it did on-screen, just at higher resolution.
        ctx.drawImage(
          designImg,
          Math.round(printArea.left * multiplier),
          Math.round(printArea.top * multiplier),
          Math.round(printArea.width * multiplier),
          Math.round(printArea.height * multiplier),
        );
        resolve(canvas.toDataURL('image/png'));
      };
      designImg.onerror = reject;
      designImg.src = designDataUrl;
    };
    garmentImg.onerror = reject;
    garmentImg.src = garmentImgSrc;
  });
}
