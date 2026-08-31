import { useState } from 'react';
import { useCustomize } from '../CustomizeContext';
import { ClothTypeSelector, ColorSelector, SizeSelector, StepLabel } from './Selectors';
import { compositeStagePNG, STAGE_WIDTH, STAGE_HEIGHT } from '../hooks/usePrintCanvas';
import { findGarment, findColor, getGarmentImages, getPrintAreaPx } from '../garmentHelpers';
import type { CustomizableGarment } from '../../../api/customization';

export default function UploadFlow({ garments }: { garments: CustomizableGarment[] }) {
  const { state, dispatch } = useCustomize();
  const [generating, setGenerating] = useState(false);
  const previewUrl = state.uploadedImage;

  const garment = findGarment(garments, state.clothType);
  const color = findColor(garment, state.colorId);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      dispatch({ type: 'SET_UPLOADED_IMAGE', dataUrl: evt.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const canGenerate = !!previewUrl && !!state.size && !!garment && !!color;

  async function handleGenerate() {
    if (!canGenerate || !garment) return;
    setGenerating(true);
    try {
      const images = getGarmentImages(garment, state.colorId);
      const printArea = getPrintAreaPx(garment, 'front');
      const [frontImg, backImg] = await Promise.all([
        compositeStagePNG({ garmentImgSrc: images.frontImg ?? '', designDataUrl: previewUrl, printArea }),
        images.backImg
          ? compositeStagePNG({ garmentImgSrc: images.backImg, designDataUrl: null, printArea })
          : Promise.resolve(null),
      ]);
      dispatch({
        type: 'SET_GENERATED_PRODUCT',
        product: {
          clothType: state.clothType,
          colorId: state.colorId,
          size: state.size!,
          quantity: state.quantity,
          frontImg,
          backImg,
        },
      });
    } finally {
      setGenerating(false);
    }
  }

  const images = garment ? getGarmentImages(garment, state.colorId) : { frontImg: null, backImg: null };
  const printArea = getPrintAreaPx(garment, 'front');

  return (
    <div className="flow-screen">
      <button className="back-link" onClick={() => dispatch({ type: 'GO_TO', screen: 'home' })}>
        ← Back
      </button>

      <div className="layout layout--upload">
        <div className="panel">
          <StepLabel>01 — Cloth type</StepLabel>
          <ClothTypeSelector
            variant="dropdown"
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

          <StepLabel>04 — Upload image</StepLabel>
          <label className="upload-btn" htmlFor="quickUpload">
            ＋ Upload your design
          </label>
          <input id="quickUpload" type="file" accept="image/*" onChange={handleFile} />
          <p className="hint">
            Your artwork is centered automatically inside the print area. Use the full editor if you need to drag
            or scale it by hand.
          </p>

          <button className="generate-btn" disabled={!canGenerate || generating} onClick={handleGenerate}>
            {generating ? 'Generating…' : 'Generate the design'}
          </button>
          {!state.size && <p className="hint hint--warn">Pick a size to continue.</p>}
        </div>

        <div className="canvas-wrap">
          <div className="stage garment-stage" style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}>
            <span className="stage-label">Front preview</span>
            {images.frontImg && (
              <img className="garment-photo" src={images.frontImg} alt={`${state.clothType} ${state.colorId} front`} />
            )}
            <div
              className="print-area print-area--preview"
              style={{ left: printArea.left, top: printArea.top, width: printArea.width, height: printArea.height }}
            >
              {previewUrl && <img className="preview-design" src={previewUrl} alt="Uploaded design preview" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
