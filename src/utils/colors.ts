/**
 * Color schemes and utility functions for coral visualization
 */

import { Genus } from '../types/coral';

// Increased saturation/brightness by 15-20% for better contrast on dark background
// Distinct colors that don't overlap with blue-red size gradient
export const GENUS_COLORS: Record<Genus, string> = {
  Poc: '#FF5A45', // Bright red-orange (Pocillopora)
  Por: '#5DD5F3', // Bright cyan (Porites)
  Acr: '#FFD700', // Gold/yellow (Acropora) - distinct from gradient
  Mil: '#B8621B', // Bright brown (Millepora)
};

export const FATE_COLORS: Record<string, string> = {
  Growth: '#2ECC71', // Green
  Shrinkage: '#F39C12', // Orange
  Recruitment: '#9B59B6', // Purple
  Death: '#E74C3C', // Red
  Fission: '#3498DB', // Blue
  Fusion: '#1ABC9C', // Cyan-green
  'Missing Data': '#95A5A6', // Gray
  default: '#7F8C8D', // Neutral gray
};

export const GENUS_SYMBOLS = {
  Poc: 'circle',
  Por: 'square',
  Acr: 'triangle',
  Mil: 'diamond',
} as const;

/**
 * Get color for a genus
 */
export function getGenusColor(genus: Genus): string {
  return GENUS_COLORS[genus];
}

/**
 * Get color for a fate event
 */
export function getFateColor(fate: string | null): string {
  if (!fate) return FATE_COLORS.default;

  // Match partial strings
  if (fate.includes('Recruitment')) return FATE_COLORS.Recruitment;
  if (fate.includes('Death')) return FATE_COLORS.Death;
  if (fate.includes('Growth')) return FATE_COLORS.Growth;
  if (fate.includes('Shrinkage')) return FATE_COLORS.Shrinkage;
  if (fate.includes('Fission')) return FATE_COLORS.Fission;
  if (fate.includes('Fusion')) return FATE_COLORS.Fusion;

  return FATE_COLORS.default;
}

/**
 * Get symbol shape for a genus
 */
export function getGenusSymbol(genus: Genus): string {
  return GENUS_SYMBOLS[genus];
}

/**
 * Get color scale for size visualization
 * Clean blue to red gradient without green/purple artifacts
 */
export function getSizeColor(size: number, minSize: number, maxSize: number): string {
  const normalized = (size - minSize) / (maxSize - minSize);

  // Pure blue (small) to pure red (large)
  const r = Math.round(normalized * 255);
  const g = 0; // Keep green at 0 for clean gradient
  const b = Math.round((1 - normalized) * 255);

  return `rgb(${r}, ${g}, ${b})`;
}
