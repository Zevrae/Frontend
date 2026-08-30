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
  if (!product) return null;

  const garment = findGarment(garments, state.clothType);
  const color = findColor(garment, state.colorId);

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

  return (
    <div className="flow-screen">
      <button
        className="back-link"
        onClick={() => dispatch({ type: 'GO_TO', screen: state.flow === 'upload' ? 'upload' : 'editor' })}
      >
        ← Back to editing
      </button>

      <div className="summary-page">
        <p className="summary-title">Your design</p>

        <div className="summary-row">
          <span>Flow</span>
          <span>{state.flow === 'upload' ? 'Upload a design' : 'Start from scratch'}</span>
        </div>
        <div className="summary-row">
          <span>Cloth type</span>
          <span>{garment?.label ?? state.clothType}</span>
        </div>
        <div className="summary-row">
          <span>Color</span>
          <span>{color?.label ?? state.colorId}</span>
        </div>
        <div className="summary-row">
          <span>Size</span>
          <span>{state.size}</span>
        </div>
        <div className="summary-row">
          <span>Quantity</span>
          <span>{state.quantity}</span>
        </div>
        {garment && (
          <div className="summary-row">
            <span>Price</span>
            <span>{formatPrice(garment.price)} each</span>
          </div>
        )}

        <div className="summary-thumbs">
          <a href={product.frontImg} download="zevrae-custom-front.png">
            <img src={product.frontImg} alt="Generated front design" />
            <span>Front · PNG</span>
          </a>
          {product.backImg && (
            <a href={product.backImg} download="zevrae-custom-back.png">
              <img src={product.backImg} alt="Generated back design" />
              <span>Back · PNG</span>
            </a>
          )}
        </div>

        <div className="pay-note">Online payment only. Cash on Delivery (COD) is not available for custom designs.</div>

        {!state.createdProductId ? (
          <>
            <button className="place-order" disabled={state.submitting} onClick={handleAddToBag}>
              {state.submitting ? 'Adding to bag…' : user ? 'Add to bag' : 'Log in to add to bag'}
            </button>
            {state.submitError && <p className="hint hint--error">{state.submitError}</p>}
          </>
        ) : (
          <>
            <div className="placed-note">Added to your bag — checkout whenever you're ready.</div>
            <button className="place-order" style={{ marginTop: 12 }} onClick={() => navigate('/bag')}>
              Go to bag
            </button>
          </>
        )}
      </div>
    </div>
  );
}
