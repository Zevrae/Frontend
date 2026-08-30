import { createContext, useContext, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { CustomizableGarment } from '../../api/customization';

export type Screen = 'home' | 'upload' | 'editor' | 'summary';
export type Flow = 'upload' | 'scratch' | null;

export interface GeneratedProduct {
  clothType: string;
  colorId: string;
  size: string;
  quantity: number;
  frontImg: string;
  backImg: string | null;
}

export interface CustomizeState {
  screen: Screen;
  flow: Flow;
  clothType: string;
  colorId: string;
  size: string | null;
  quantity: number;
  uploadedImage: string | null;
  generatedProduct: GeneratedProduct | null;
  submitting: boolean;
  submitError: string | null;
  createdProductId: string | null;
}

type Action =
  | { type: 'GO_TO'; screen: Screen }
  | { type: 'START_FLOW'; flow: Exclude<Flow, null> }
  | { type: 'SET_CLOTH'; clothType: string; garments: CustomizableGarment[] }
  | { type: 'SET_COLOR'; colorId: string }
  | { type: 'SET_SIZE'; size: string }
  | { type: 'SET_QUANTITY'; quantity: number }
  | { type: 'SET_UPLOADED_IMAGE'; dataUrl: string | null }
  | { type: 'SET_GENERATED_PRODUCT'; product: GeneratedProduct }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_ERROR'; message: string }
  | { type: 'SUBMIT_SUCCESS'; productId: string }
  | { type: 'RESET'; garments: CustomizableGarment[] };

function firstColorFor(garments: CustomizableGarment[], clothType: string) {
  return garments.find((g) => g.cloth_type === clothType)?.colors[0]?.id ?? '';
}

export function initialStateFor(garments: CustomizableGarment[]): CustomizeState {
  const clothType = garments[0]?.cloth_type ?? '';
  return {
    screen: 'home',
    flow: null,
    clothType,
    colorId: firstColorFor(garments, clothType),
    size: null,
    quantity: 1,
    uploadedImage: null,
    generatedProduct: null,
    submitting: false,
    submitError: null,
    createdProductId: null,
  };
}

function resetSelectionFields(): Partial<CustomizeState> {
  return { uploadedImage: null, generatedProduct: null, submitError: null, createdProductId: null };
}

function reducer(state: CustomizeState, action: Action): CustomizeState {
  switch (action.type) {
    case 'GO_TO':
      return { ...state, screen: action.screen };
    case 'START_FLOW':
      return {
        ...state,
        flow: action.flow,
        screen: action.flow === 'upload' ? 'upload' : 'editor',
        ...resetSelectionFields(),
      };
    case 'SET_CLOTH':
      return {
        ...state,
        clothType: action.clothType,
        colorId: firstColorFor(action.garments, action.clothType),
        size: null,
        quantity: 1,
        ...resetSelectionFields(),
      };
    case 'SET_COLOR':
      return { ...state, colorId: action.colorId, size: null, quantity: 1, ...resetSelectionFields() };
    case 'SET_SIZE':
      return { ...state, size: action.size, quantity: 1 };
    case 'SET_QUANTITY':
      return { ...state, quantity: action.quantity };
    case 'SET_UPLOADED_IMAGE':
      return { ...state, uploadedImage: action.dataUrl, generatedProduct: null };
    case 'SET_GENERATED_PRODUCT':
      return { ...state, generatedProduct: action.product, screen: 'summary', submitError: null };
    case 'SUBMIT_START':
      return { ...state, submitting: true, submitError: null };
    case 'SUBMIT_ERROR':
      return { ...state, submitting: false, submitError: action.message };
    case 'SUBMIT_SUCCESS':
      return { ...state, submitting: false, createdProductId: action.productId };
    case 'RESET':
      return initialStateFor(action.garments);
    default:
      return state;
  }
}

const CustomizeCtx = createContext<{ state: CustomizeState; dispatch: Dispatch<Action> } | null>(null);

export function CustomizeProvider({ garments, children }: { garments: CustomizableGarment[]; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, garments, initialStateFor);
  return <CustomizeCtx.Provider value={{ state, dispatch }}>{children}</CustomizeCtx.Provider>;
}

export function useCustomize() {
  const ctx = useContext(CustomizeCtx);
  if (!ctx) throw new Error('useCustomize must be used within a CustomizeProvider');
  return ctx;
}
