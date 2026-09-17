import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { usePrintCanvas, compositeStagePNG, STAGE_WIDTH, STAGE_HEIGHT, EXPORT_MULTIPLIER } from '../hooks/usePrintCanvas';
import type { CustomizableGarment } from '../../../api/customization';
import { getPrintAreaPx, getGarmentImages } from '../garmentHelpers';

export interface GarmentCanvasHandle {
  addImage: (dataUrl: string, onDone?: () => void) => void;
  removeImage: () => void;
  centerImage: () => void;
  hasImage: () => boolean;
  exportComposite: () => Promise<string>;
}

interface Props {
  garment: CustomizableGarment | null;
  colorId: string;
  view: 'front' | 'back';
  label: string;
  hidden?: boolean;
}

const GarmentCanvas = forwardRef<GarmentCanvasHandle, Props>(function GarmentCanvas(
  { garment, colorId, view, label, hidden },
  ref,
) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const printArea = getPrintAreaPx(garment, view);
  const images = getGarmentImages(garment, colorId);
  const garmentImgSrc = view === 'front' ? images.frontImg : images.backImg;

  const printAreaRef = useRef<HTMLDivElement>(null);
  const api = usePrintCanvas(canvasEl, printArea.width, printArea.height);

  // Tag the canvas node with its parent div so usePrintCanvas can re-attach it
  // after React StrictMode's forced cleanup → remount cycle (fabric v5 dispose()
  // removes the canvas element from the DOM, so on the second mount canvasEl.current
  // is detached; this reference lets us restore it).
  useLayoutEffect(() => {
    if (canvasEl.current && printAreaRef.current) {
      (canvasEl.current as any)._printAreaEl = printAreaRef.current;
    }
  });


  useImperativeHandle(ref, () => ({
    addImage: (dataUrl: string, onDone?: () => void) => api.current.addImage(dataUrl, onDone),
    removeImage: () => api.current.removeImage(),
    centerImage: () => api.current.centerImage(),
    hasImage: () => api.current.hasImage(),
    exportComposite: () =>
      compositeStagePNG({
        garmentImgSrc: garmentImgSrc ?? '',
        designDataUrl: api.current.hasImage() ? api.current.exportDesignLayer(EXPORT_MULTIPLIER) : null,
        printArea,
        multiplier: EXPORT_MULTIPLIER,
      }),
  }));

  return (
    <div
      className="stage garment-stage"
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        ...(hidden ? { opacity: 0, visibility: 'hidden', pointerEvents: 'none', position: 'absolute', top: 0, left: 0 } : { position: 'relative' }),
      }}
    >
      <span className="stage-label">{label}</span>
      {garmentImgSrc ? (
        <img className="garment-photo" src={garmentImgSrc} alt={`${garment?.label ?? ''} ${colorId} ${view}`} />
      ) : (
        <div className="garment-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--zc-muted)' }}>
          No {view} photo yet
        </div>
      )}
      <div
        ref={printAreaRef}
        className="print-area"
        style={{ left: printArea.left, top: printArea.top, width: printArea.width, height: printArea.height }}
      >
        <canvas ref={canvasEl} width={printArea.width} height={printArea.height} />
      </div>
    </div>
  );
});

export default GarmentCanvas;
