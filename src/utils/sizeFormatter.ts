/**
 * Helper to identify if a product or category string is a soft toy.
 */
export function isSoftToy(category?: string, type?: string): boolean {
  const cat = (category || '').toLowerCase();
  const t = (type || '').toLowerCase();
  return cat === 'soft toys' || cat === 'soft toy' || t === 'soft toys' || t === 'soft toy';
}

/**
 * Formats a soft toy size string (e.g. "10 Inch" or "10") to include its metric value in centimeters.
 * Example: "10" -> "10 Inch / 25.4 cm"
 */
export function formatSoftToySize(size: string, force: boolean = false): string {
  if (!size) return '';
  
  // If size already contains cm/CM or a slash, don't format it again
  if (size.includes('/') || size.toLowerCase().includes('cm')) {
    return size;
  }
  
  // Check if size already specifies inches suffix (like "10 Inch" or "10\"")
  const hasInchSuffix = /inch|"/i.test(size);
  
  // Format if it has an explicit inch suffix, or if we force it (because we know it's a soft toy category)
  if (hasInchSuffix || force) {
    const match = size.match(/([\d.]+)/);
    if (!match) return size;
    
    const inches = parseFloat(match[1]);
    if (isNaN(inches)) return size;
    
    const cm = parseFloat((inches * 2.54).toFixed(1));
    const suffix = hasInchSuffix ? '' : ' Inch';
    
    return `${size}${suffix} / ${cm} cm`;
  }
  
  return size;
}
