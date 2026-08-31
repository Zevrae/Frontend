// @ts-nocheck
// Fabric.js v5 has no first-party types in this project, and adding them
// isn't worth it for one small hook — this file mirrors the standalone
// Zeurae editor's hook almost verbatim (see the original zeurae-app repo)
// so its already-proven canvas/compositing behavior carries over exactly.
import { useEffect, useRef } from 'react';
import * as fabricNS from 'fabric';

// fabric v5's CJS bundle does `exports.fabric = fabric`, but that
// assignment is wrapped in an `if (typeof exports !== 'undefined')` guard —
// esbuild's dependency pre-bundler (which Vite uses) only reliably detects
// unconditional top-level `exports.x = ...` assignments as named exports,
// so `import { fabric } from 'fabric'` fails at runtime with "does not
// provide an export named 'fabric'" even though it works fine under plain
// Node/CommonJS. Importing the whole namespace and unwrapping it here
// works no matter which shape the bundler produces (namespace object with
// a `.fabric` property, a `.default.fabric`, or — under some resolutions —
// the fabric object itself).
const fabric: any =
  (fabricNS as any).fabric ?? (fabricNS as any).default?.fabric ?? (fabricNS as any).default ?? fabricNS;

export const STAGE_WIDTH = 380;
export const STAGE_HEIGHT = 460;

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
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(dataUrl, (img: any) => {
      if (designRef.current) canvas.remove(designRef.current);
      const targetWidth = Math.min(width, height) * 0.8;
      img.scaleToWidth(targetWidth);
      img.set({ left: width / 2, top: height / 2, originX: 'center', originY: 'center' });
      canvas.add(img);
      canvas.setActiveObject(img);
      designRef.current = img;
      canvas.requestRenderAll();
      if (onDone) onDone();
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
  // by the compositor.
  api.current.exportDesignLayer = () => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    return canvas.toDataURL({ format: 'png', quality: 1 });
  };

  return api;
}

/**
 * Composites a static garment photo (full stage size) with a print-area
 * sized design layer into a single stage-sized PNG. This is what gets
 * uploaded and turned into the generated Product's image.
 */
export function compositeStagePNG({
  garmentImgSrc,
  designDataUrl,
  printArea,
}: {
  garmentImgSrc: string;
  designDataUrl: string | null;
  printArea: { left: number; top: number; width: number; height: number };
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = STAGE_WIDTH;
    canvas.height = STAGE_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    const garmentImg = new Image();
    garmentImg.crossOrigin = 'anonymous';
    garmentImg.onload = () => {
      ctx.drawImage(garmentImg, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);

      if (!designDataUrl) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }
      const designImg = new Image();
      designImg.onload = () => {
        ctx.drawImage(designImg, printArea.left, printArea.top, printArea.width, printArea.height);
        resolve(canvas.toDataURL('image/png'));
      };
      designImg.onerror = reject;
      designImg.src = designDataUrl;
    };
    garmentImg.onerror = reject;
    garmentImg.src = garmentImgSrc;
  });
}
