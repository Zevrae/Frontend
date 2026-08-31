import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomize } from '../CustomizeContext';
import { ClothTypeSelector, ColorSelector, SizeSelector, StepLabel } from './Selectors';
import GarmentCanvas, { type GarmentCanvasHandle } from './GarmentCanvas';
import { findGarment, findColor } from '../garmentHelpers';
import type { CustomizableGarment } from '../../../api/customization';

const formatPrice = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function Designer({ garments }: { garments: CustomizableGarment[] }) {
  const { state, dispatch } = useCustomize();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const frontRef = useRef<GarmentCanvasHandle>(null);
  const backRef = useRef<GarmentCanvasHandle>(null);
  const [hasImage, setHasImage] = useState({ front: false, back: false });
  const [generating, setGenerating] = useState(false);

  const garment = findGarment(garments, state.clothType);
  const color = findColor(garment, state.colorId);
  const activeRef = activeView === 'front' ? frontRef : backRef;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      activeRef.current?.addImage(evt.target?.result as string, () => {
        setHasImage((prev) => ({ ...prev, [activeView]: true }));
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleRemove() {
    activeRef.current?.removeImage();
    setHasImage((prev) => ({ ...prev, [activeView]: false }));
  }

  const hasAnyDesign = hasImage.front || hasImage.back;
  const canGenerate = hasAnyDesign && !!state.size && !!garment && !!color;

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const [frontImg, backImg] = await Promise.all([
        frontRef.current?.exportComposite(),
        backRef.current?.exportComposite(),
      ]);
      dispatch({
        type: 'SET_GENERATED_PRODUCT',
        product: {
          clothType: state.clothType,
          colorId: state.colorId,
          size: state.size!,
          quantity: state.quantity,
          frontImg: frontImg!,
          backImg: backImg ?? null,
        },
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flow-screen">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="layout">
        <div className="panel">
          <StepLabel>01 — Cloth type</StepLabel>
          <ClothTypeSelector
            garments={garments}
            value={state.clothType}
            onChange={(clothType) => dispatch({ type: 'SET_CLOTH', clothType, garments })}
          />

          <StepLabel>02 — Color</StepLabel>
          <ColorSelector
            colors={garment?.colors ?? []}
            value={state.colorId}
            onChange={(colorId) => dispatch({ type: 'SET_COLOR', colorId })}
          />

          <StepLabel>03 — Size &amp; quantity</StepLabel>
          <SizeSelector
            sizes={garment?.sizes ?? []}
            sizeStock={color?.size_stock ?? {}}
            size={state.size}
            quantity={state.quantity}
            onSizeChange={(size) => dispatch({ type: 'SET_SIZE', size })}
            onQuantityChange={(quantity) => dispatch({ type: 'SET_QUANTITY', quantity })}
          />

          <StepLabel>04 — Your artwork</StepLabel>
          <label className="upload-btn" htmlFor="designUpload">
            ＋ Add image to canvas
          </label>
          <input id="designUpload" type="file" accept="image/*" onChange={handleFile} />
          <p className="hint">
            Drops onto the active view ({activeView}), inside the gold print-area outline. Drag it or use the
            corner handles to scale — it can't leave the print area.
          </p>
        </div>

        <div className="canvas-wrap">
          <div className="view-toggle">
            <button className={activeView === 'front' ? 'active' : ''} onClick={() => setActiveView('front')}>
              Front
            </button>
            <button className={activeView === 'back' ? 'active' : ''} onClick={() => setActiveView('back')}>
              Back
            </button>
          </div>

          <GarmentCanvas ref={frontRef} garment={garment} colorId={state.colorId} view="front" label="Front" hidden={activeView !== 'front'} />
          <GarmentCanvas ref={backRef} garment={garment} colorId={state.colorId} view="back" label="Back" hidden={activeView !== 'back'} />

          <div className="toolbar">
            <button onClick={handleRemove}>Remove design</button>
            <button onClick={() => activeRef.current?.centerImage()}>Center in print area</button>
          </div>
        </div>

        <div className="panel right">
          <StepLabel>Ready when you are</StepLabel>
          <p className="hint" style={{ marginTop: 0 }}>
            Place your artwork on the front, back, or both, pick a size, then generate to see the final product
            and add it to your bag.
          </p>
          {garment && (
            <div className="summary-row" style={{ marginTop: 18 }}>
              <span>Price</span>
              <span>{formatPrice(garment.price)}</span>
            </div>
          )}
          <button className="generate-btn" disabled={!canGenerate || generating} onClick={handleGenerate}>
            {generating ? 'Generating…' : 'Generate the design'}
          </button>
          {!state.size && <p className="hint hint--warn">Pick a size to continue.</p>}
          {state.size && !hasAnyDesign && <p className="hint hint--warn">Add artwork to the front or back to continue.</p>}
        </div>
      </div>
    </div>
  );
}
