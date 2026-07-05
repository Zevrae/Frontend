import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { CartProvider } from './CartContext.tsx';
import { AuthModalProvider } from './AuthModalContext.tsx';
import { PreloaderProvider } from './features/PreloaderContext.tsx';
import { PageTransitionProvider } from './features/PageTransitionContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PreloaderProvider>
        <PageTransitionProvider>
          <CartProvider>
            <AuthModalProvider>
              <App />
            </AuthModalProvider>
          </CartProvider>
        </PageTransitionProvider>
      </PreloaderProvider>
    </BrowserRouter>
  </StrictMode>,
);
