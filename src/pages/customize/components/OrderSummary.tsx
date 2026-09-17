import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomize } from '../CustomizeContext';
import { findGarment, findColor } from '../garmentHelpers';
import { customProductsApi } from '../../../api/customization';
import { useCart } from '../../../CartContext';
import { useAuthModal } from '../../../AuthModalContext';
import { useAuth } from '../../../hooks/UseAuth';
import type { CustomizableGarment } from '../../../api/customization';

const formatPrice = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function OrderSummary({ garments }: { garments: CustomizableGarment[] }) {
  const { state, dispatch } = useCustomize();
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { setIsLoginModalOpen } = useAuthModal();
  const navigate = useNavigate();

  const product = state.generatedProduct;

  // Build image array: front first, then back if present
  const images: string[] = [];
  if (product?.frontImg) images.push(product.frontImg);
  if (product?.backImg) images.push(product.backImg);

  const [activeImg, setActiveImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!product) return null;

  const garment = findGarment(garments, state.clothType);
  const color = findColor(garment, state.colorId);

  const handlePrev = () => {
    if (images.length <= 1) return;
    setImgLoaded(false);
    setActiveImg(i => (i - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    setImgLoaded(false);
    setActiveImg(i => (i + 1) % images.length);
  };

  async function handleAddToBag() {
    if (!product || !garment) return;
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    dispatch({ type: 'SUBMIT_START' });
    try {
      const created = await customProductsApi.generate({
        clothType: product.clothType,
        colorId: product.colorId,
        size: product.size,
        quantity: product.quantity,
        frontImageDataUrl: product.frontImg,
        backImageDataUrl: product.backImg,
      });
      dispatch({ type: 'SUBMIT_SUCCESS', productId: created.id });

      addToCart({
        id: created.id,
        name: created.name,
        price: created.price,
        size: product.size,
        quantity: product.quantity,
        image: created.images?.[0] ?? product.frontImg,
        category: created.category,
      });
      setIsCartOpen(true);
    } catch (err: any) {
      dispatch({
        type: 'SUBMIT_ERROR',
        message: err?.response?.data?.message || err.message || 'Could not add this design to your bag. Please try again.',
      });
    }
  }

  const imageViewLabel = activeImg === 0 ? 'Front View' : 'Back View';

  return (
    <div className="flow-screen os-root">
      {/* ── Back link ── */}
      <button
        className="back-link os-back"
        onClick={() => dispatch({ type: 'GO_TO', screen: 'design' })}
      >
        <ChevronLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
        Back to editing
      </button>

      {/* ── Two-column product layout ── */}
      <div className="os-layout">

        {/* ── LEFT: Image viewer ── */}
        <div className="os-gallery">
          {/* Main image frame */}
          <div className="os-image-frame">
            {images.length > 0 && (
              <img
                key={activeImg}
                src={images[activeImg]}
                alt={imageViewLabel}
                className="os-main-img"
                style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 350ms ease' }}
                onLoad={() => setImgLoaded(true)}
              />
            )}

            {/* Arrow navigation */}
            {images.length > 1 && (
              <>
                <button className="os-arrow os-arrow--left" onClick={handlePrev} aria-label="Previous view">
                  <ChevronLeft size={22} />
                </button>
                <button className="os-arrow os-arrow--right" onClick={handleNext} aria-label="Next view">
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Counter badge */}
            {images.length > 1 && (
              <div className="os-img-counter">
                {imageViewLabel}&nbsp;&nbsp;{String(activeImg + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </div>
            )}

            {/* Bottom vignette */}
            <div className="os-vignette" />
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="os-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setImgLoaded(false); setActiveImg(i); }}
                  className={`os-thumb${activeImg === i ? ' os-thumb--active' : ''}`}
                  aria-label={i === 0 ? 'Front view' : 'Back view'}
                >
                  <img src={img} alt={i === 0 ? 'Front' : 'Back'} />
                  <span>{i === 0 ? 'Front' : 'Back'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Details panel ── */}
        <div className="os-details">
          <p className="os-eyebrow">Custom Design</p>

          <h2 className="os-product-name">
            {garment?.label ?? state.clothType}
          </h2>

          {garment && (
            <div className="os-price-block">
              <span className="os-price">{formatPrice(garment.price)}</span>
              <span className="os-price-each">per piece</span>
            </div>
          )}

          <div className="os-sep" />

          {/* Specs */}
          <div className="os-specs">
            <div className="os-spec-row">
              <span className="os-spec-label">Size</span>
              <span className="os-spec-val">{state.size}</span>
            </div>
            <div className="os-spec-row">
              <span className="os-spec-label">Quantity</span>
              <span className="os-spec-val">{state.quantity}</span>
            </div>
            {color && (
              <div className="os-spec-row">
                <span className="os-spec-label">Color</span>
                <span className="os-spec-val os-spec-color-val">
                  {(color as any).hex && (
                    <span className="os-color-dot" style={{ background: (color as any).hex }} />
                  )}
                  {color.label}
                </span>
              </div>
            )}
            {garment && (
              <div className="os-spec-row os-spec-row--total">
                <span className="os-spec-label">Total</span>
                <span className="os-spec-val os-spec-val--accent">{formatPrice(garment.price * state.quantity)}</span>
              </div>
            )}
          </div>

          <div className="os-sep" />

          {/* COD notice */}
          <div className="os-pay-note">
            <span className="os-pay-note-icon">⚡</span>
            Online payment only — Cash on Delivery (COD) is not available for custom designs.
          </div>

          {/* CTA */}
          {!state.createdProductId ? (
            <>
              <button
                className="os-add-btn"
                disabled={state.submitting}
                onClick={handleAddToBag}
              >
                {state.submitting ? 'Adding to Bag…' : user ? 'Add to Bag' : 'Log in to Add to Bag'}
              </button>
              {state.submitError && (
                <p className="hint hint--error" style={{ marginTop: 12, fontSize: 12 }}>
                  {state.submitError}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="os-added-note">
                ✓ Added to your bag — checkout whenever you're ready.
              </div>
              <button className="os-add-btn os-add-btn--ghost" onClick={() => navigate('/bag')}>
                Go to Bag
              </button>
            </>
          )}

          {/* Download PNG links */}
          <div className="os-downloads">
            <span className="os-dl-label">Download your design</span>
            <div className="os-dl-links">
              <a href={product.frontImg} download="zevrae-custom-front.png" className="os-dl-link">
                Front PNG ↓
              </a>
              {product.backImg && (
                <a href={product.backImg} download="zevrae-custom-back.png" className="os-dl-link">
                  Back PNG ↓
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
