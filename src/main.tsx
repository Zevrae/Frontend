import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { CartProvider } from './CartContext.tsx';
import { AuthModalProvider } from './AuthModalContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { PreloaderProvider } from './features/PreloaderContext.tsx';
import { PageTransitionProvider } from './features/PageTransitionContext.tsx';
import { ThemeProvider } from './theme/ThemeProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PreloaderProvider>
          <PageTransitionProvider>
            <AuthProvider>
              <CartProvider>
                <AuthModalProvider>
                  <App />
                </AuthModalProvider>
              </CartProvider>
            </AuthProvider>
          </PageTransitionProvider>
        </PreloaderProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
