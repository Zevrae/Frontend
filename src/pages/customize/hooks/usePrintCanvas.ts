// @ts-nocheck
// The installed fabric package is v5.x (node_modules/fabric — "version":"5.5.2").
// Fabric v5 API:
//   new fabric.Canvas(el, options)
//   new fabric.Image(htmlImageElement, options)
//   fabric.Image.fromURL(url, callback, options)  ← callback, NOT Promise
//
// StrictMode note: React 18 StrictMode runs effects twice (mount → cleanup → mount).
// fabric v5's dispose() removes the canvas element from its wrapper div, leaving it
// detached. The second mount would then attach fabric to a detached node — invisible,
// not interactive. We guard against this with a `disposed` flag and re-attach the
// canvas to the wrapper div if it has been detached.
import { useEffect, useRef } from 'react';

export const STAGE_WIDTH = 380;
export const STAGE_HEIGHT = 460;

const TARGET_LONG_EDGE_PX = 2048;
export const EXPORT_MULTIPLIER = TARGET_LONG_EDGE_PX / STAGE_HEIGHT;

/** Resolves the fabric v5 namespace from whatever Vite's interop gives us. */
function resolveFabricNS(mod: any): any {
  if (mod?.fabric?.Canvas) return mod.fabric;
  if (mod?.Canvas)           return mod;
  if (mod?.default?.fabric?.Canvas) return mod.default.fabric;
  if (mod?.default?.Canvas)  return mod.default;
  if (typeof window !== 'undefined' && (window as any).fabric?.Canvas) {
    return (window as any).fabric;
  }
  return null;
}

// Cache the fabric namespace after the first successful import so we
// don't re-do the async work on every effect re-run.
let _cachedFabric: any = null;

function loadFabric(): Promise<any> {
  if (_cachedFabric) return Promise.resolve(_cachedFabric);
  return import('fabric').then((mod: any) => {
    const fb = resolveFabricNS(mod);
    if (!fb) {
      console.error('[usePrintCanvas] Cannot resolve fabric namespace. mod keys:', Object.keys(mod || {}));
      throw new Error('fabric namespace not found');
    }
    console.log('[usePrintCanvas] fabric loaded, version:', fb.version);
    _cachedFabric = fb;
    return fb;
  });
}

/**
 * Owns one Fabric.js v5 canvas sized to a garment's print area only.
 * Fully transparent, absolutely positioned over the static garment photo.
 */
export function usePrintCanvas(
  canvasEl: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number,
) {
  const fabricRef = useRef<any>(null);  // fabric.Canvas instance
  const designRef = useRef<any>(null);  // current design fabric.Image
  const api = useRef<any>({});

  useEffect(() => {
    if (!canvasEl.current) return;

    // Keep a local reference to know which canvas this effect run "owns".
    // This lets the cleanup ignore canvas instances created by a later effect run.
    let ownCanvas: any = null;
    let cancelled = false;

    loadFabric().then((fb) => {
      if (cancelled) return; // effect was cleaned up before import finished
      if (!canvasEl.current) return; // component unmounted

      // Fabric v5 dispose() pulls the canvas element out of its wrapper div.
      // If StrictMode ran cleanup before we get here, canvasEl.current may be
      // a detached node. Re-attach it to the document before handing it to Fabric.
      if (!canvasEl.current.isConnected) {
        // Find the nearest connected ancestor (the .print-area div) and re-add
        // the canvas to it so Fabric can wrap it properly.
        // We do this by looking at the canvas's last known parent via dataset.
        const parent = (canvasEl.current as any)._printAreaEl as HTMLElement | undefined;
        if (parent && parent.isConnected) {
          // Remove any leftover canvas-container wrapper first
          const leftover = parent.querySelector('.canvas-container');
          if (leftover) parent.removeChild(leftover);
          parent.appendChild(canvasEl.current);
        } else {
          // No known parent — can't recover, bail out.
          console.warn('[usePrintCanvas] canvas element is detached and parent unknown; skipping init');
          return;
        }
      }

      try {
        ownCanvas = new fb.Canvas(canvasEl.current, {
          backgroundColor: '',
          preserveObjectStacking: true,
          width,
          height,
          selection: true,
        });
        fabricRef.current = ownCanvas;
        console.log('[usePrintCanvas] Canvas ready', width, 'x', height);
      } catch (err) {
        console.error('[usePrintCanvas] Canvas init error:', err);
      }
    }).catch((err: any) => {
      console.error('[usePrintCanvas] loadFabric() failed:', err);
    });

    return () => {
      cancelled = true;
      if (ownCanvas) {
        try { ownCanvas.dispose(); } catch (e) {}
      }
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  api.current.addImage = (dataUrl: string, onDone?: () => void) => {
    const attemptAdd = (retries = 0) => {
      const liveCanvas = fabricRef.current;

      if (!liveCanvas) {
        if (retries < 25) {
          setTimeout(() => attemptAdd(retries + 1), 150);
        } else {
          console.error('[usePrintCanvas] Canvas never became ready after retries');
        }
        return;
      }

      // Double-check that fabric's upper-canvas is actually in the DOM
      // (the StrictMode double-dispose issue could leave us with a zombie canvas)
      const upperCanvas = liveCanvas.upperCanvasEl;
      if (upperCanvas && !upperCanvas.isConnected) {
        console.warn('[usePrintCanvas] upper-canvas is detached; retrying…');
        if (retries < 25) {
          setTimeout(() => attemptAdd(retries + 1), 150);
        }
        return;
      }

      const fb = _cachedFabric;
      if (!fb?.Image) {
        console.error('[usePrintCanvas] fabric.Image not available');
        return;
      }

      const placeImageOnCanvas = (img: any) => {
        if (!img) { console.warn('[usePrintCanvas] placeImageOnCanvas: null img'); return; }

        if (designRef.current) {
          try { liveCanvas.remove(designRef.current); } catch (e) {}
        }

        // Scale to 65% of the smaller canvas dimension so corner handles
        // always have room within the canvas bounds
        const targetWidth = Math.min(width, height) * 0.65;
        if (typeof img.scaleToWidth === 'function') img.scaleToWidth(targetWidth);

        img.set({
          left: width / 2,
          top: height / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          lockUniScaling: false,
          cornerSize: 14,
          transparentCorners: false,
          cornerColor: '#c5a059',
          cornerStrokeColor: '#12100c',
          borderColor: '#c5a059',
          borderScaleFactor: 2,
        });
        if (typeof img.setCoords === 'function') img.setCoords();

        liveCanvas.add(img);
        liveCanvas.setActiveObject(img);
        designRef.current = img;
        liveCanvas.renderAll();

        console.log('[usePrintCanvas] Design placed ✓', img.width, 'x', img.height,
          '| scale:', img.scaleX?.toFixed(3));
        if (onDone) onDone();
      };

      const isDataUrl = dataUrl.startsWith('data:');

      // Primary path: load with HTML Image, wrap with new fabric.Image(htmlEl)
      const htmlImg = new Image();
      if (!isDataUrl) htmlImg.crossOrigin = 'anonymous';

      htmlImg.onload = () => {
        console.log('[usePrintCanvas] HTML img loaded:', htmlImg.naturalWidth, 'x', htmlImg.naturalHeight);
        try {
          const fabricImg = new fb.Image(htmlImg);
          placeImageOnCanvas(fabricImg);
        } catch (e) {
          console.warn('[usePrintCanvas] new fabric.Image(el) failed, falling back to fromURL:', e);
          fb.Image.fromURL(
            dataUrl,
            (img: any) => {
              if (img) placeImageOnCanvas(img);
              else console.error('[usePrintCanvas] fromURL callback: null img');
            },
            isDataUrl ? {} : { crossOrigin: 'anonymous' },
          );
        }
      };

      htmlImg.onerror = () => {
        console.error('[usePrintCanvas] HTML Image load error');
        if (fb.Image?.fromURL) {
          fb.Image.fromURL(
            dataUrl,
            (img: any) => { if (img) placeImageOnCanvas(img); },
            isDataUrl ? {} : { crossOrigin: 'anonymous' },
          );
        }
      };

      htmlImg.src = dataUrl;
    };

    attemptAdd();
  };

  api.current.removeImage = () => {
    const canvas = fabricRef.current;
    if (!canvas || !designRef.current) return;
    try { canvas.remove(designRef.current); } catch (e) {}
    designRef.current = null;
    canvas.renderAll();
  };

  api.current.centerImage = () => {
    const canvas = fabricRef.current;
    if (!canvas || !designRef.current) return;
    try {
      designRef.current.set({ left: width / 2, top: height / 2 });
      designRef.current.setCoords();
      canvas.renderAll();
    } catch (e) {}
  };

  api.current.hasImage = () => !!designRef.current;

  api.current.exportDesignLayer = (multiplier: number = EXPORT_MULTIPLIER) => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    try {
      canvas.discardActiveObject();
      canvas.renderAll();
      return canvas.toDataURL({ format: 'png', multiplier });
    } catch (e) {
      console.error('[usePrintCanvas] exportDesignLayer error:', e);
      return null;
    }
  };

  return api;
}

/**
 * Composites a garment photo with a print-area design layer into a
 * single high-resolution PNG for the final product image.
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
    const outW = Math.round(STAGE_WIDTH * multiplier);
    const outH = Math.round(STAGE_HEIGHT * multiplier);

    const offscreen = document.createElement('canvas');
    offscreen.width = outW;
    offscreen.height = outH;
    const ctx = offscreen.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    // @ts-ignore
    ctx.imageSmoothingQuality = 'high';

    const garmentImg = new Image();
    garmentImg.crossOrigin = 'anonymous';
    garmentImg.onload = () => {
      ctx.drawImage(garmentImg, 0, 0, outW, outH);
      if (!designDataUrl) { resolve(offscreen.toDataURL('image/png')); return; }

      const designImg = new Image();
      designImg.onload = () => {
        ctx.drawImage(
          designImg,
          Math.round(printArea.left   * multiplier),
          Math.round(printArea.top    * multiplier),
          Math.round(printArea.width  * multiplier),
          Math.round(printArea.height * multiplier),
        );
        resolve(offscreen.toDataURL('image/png'));
      };
      designImg.onerror = reject;
      designImg.src = designDataUrl;
    };
    garmentImg.onerror = reject;
    garmentImg.src = garmentImgSrc;
  });
}
