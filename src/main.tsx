import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { CartProvider } from './CartContext';
import { AuthModalProvider } from './AuthModalContext';
import { AuthProvider } from './context/AuthContext';
import { PreloaderProvider } from './features/PreloaderContext';
import { PageTransitionProvider } from './features/PageTransitionContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { CollectionTransitionProvider } from './features/CollectionTransitionContext';
import { ActiveCollectionProvider } from './features/ActiveCollectionContext';


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
                      <App />
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
