import type { CustomizableGarment, GarmentColor } from '../../api/customization';
import { STAGE_WIDTH, STAGE_HEIGHT } from './hooks/usePrintCanvas';

export function findGarment(garments: CustomizableGarment[], clothType: string) {
  return garments.find((g) => g.cloth_type === clothType) ?? null;
}

export function findColor(garment: CustomizableGarment | null, colorId: string): GarmentColor | null {
  return garment?.colors.find((c) => c.id === colorId) ?? null;
}

export function getPrintAreaPx(garment: CustomizableGarment | null, view: 'front' | 'back') {
  const area = garment?.print_areas?.[view];
  if (!area) return { left: 0, top: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT };
  return {
    left: Math.round(area.left * STAGE_WIDTH),
    top: Math.round(area.top * STAGE_HEIGHT),
    width: Math.round(area.width * STAGE_WIDTH),
    height: Math.round(area.height * STAGE_HEIGHT),
  };
}

export function getGarmentImages(garment: CustomizableGarment | null, colorId: string) {
  const color = findColor(garment, colorId);
  return {
    frontImg: color?.images?.front ?? null,
    backImg: color?.images?.back ?? null,
  };
}
