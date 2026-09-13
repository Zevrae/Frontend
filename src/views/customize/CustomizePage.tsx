import { useEffect, useState } from 'react';
import { customizableGarmentsApi, type CustomizableGarment } from '../../api/customization';
import { CustomizeProvider, useCustomize } from './CustomizeContext';
import Designer from './components/Designer';
import OrderSummary from './components/OrderSummary';
import './customize.css';

function Screen({ garments }: { garments: CustomizableGarment[] }) {
  const { state } = useCustomize();
  return state.screen === 'summary' ? <OrderSummary garments={garments} /> : <Designer garments={garments} />;
}

export default function CustomizePage() {
  const [garments, setGarments] = useState<CustomizableGarment[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    customizableGarmentsApi
      .list({ status: 'active' })
      .then(({ data }) => setGarments(data.filter((g) => g.colors.length > 0)))
      .catch((err) => {
        setError(err?.response?.data?.message || err.message || 'Could not load the customization catalog.');
        setGarments([]);
      });
  }, []);

  if (garments === null) {
    return (
      <div className="zv-customize">
        <div className="zc-topbar">
          <h1>
            ZEVRAE <span>/ custom designs</span>
          </h1>
        </div>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--zc-muted)', fontSize: 13 }}>
          Loading the customization studio…
        </div>
      </div>
    );
  }

  if (garments.length === 0) {
    return (
      <div className="zv-customize">
        <div className="zc-topbar">
          <h1>
            <span>custom designs</span>
          </h1>
        </div>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--zc-muted)', fontSize: 13, maxWidth: 480, margin: '0 auto' }}>
          {error || 'Customization isn\u2019t available right now — check back soon.'}
        </div>
      </div>
    );
  }

  return (
    <div className="zv-customize">
      <div className="zc-topbar">
        <h1>
          <span>CUSTOM DESIGNS</span>
        </h1>
      </div>
      <CustomizeProvider garments={garments}>
        <Screen garments={garments} />
      </CustomizeProvider>
    </div>
  );
}
