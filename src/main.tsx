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
import { CollectionTransitionProvider } from './features/CollectionTransitionContext.tsx';
import { ActiveCollectionProvider } from './features/ActiveCollectionContext.tsx';
import SmoothScroll from "./components/SmoothScroll";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CollectionTransitionProvider>
          <ActiveCollectionProvider>
            <PreloaderProvider>
              <PageTransitionProvider>
                <AuthProvider>
                  <CartProvider>
                    <AuthModalProvider>
                      <SmoothScroll>
                      <App />
                      </SmoothScroll>
                    </AuthModalProvider>
                  </CartProvider>
                </AuthProvider>
              </PageTransitionProvider>
            </PreloaderProvider>
          </ActiveCollectionProvider>
        </CollectionTransitionProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
