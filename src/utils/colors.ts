/**
 * Color schemes and utility functions for coral visualization
 */

import { Genus } from '../types/coral';

export const GENUS_COLORS: Record<Genus, string> = {
  Poc: '#E64B35', // Red-orange (Pocillopora)
  Por: '#4DBBD5', // Cyan (Porites)
  Acr: '#00A087', // Teal (Acropora)
  Mil: '#8B4513', // Brown (Millepora)
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
 */
export function getSizeColor(size: number, minSize: number, maxSize: number): string {
  const normalized = (size - minSize) / (maxSize - minSize);

  // Blue (small) to Red (large)
  const r = Math.round(normalized * 255);
  const b = Math.round((1 - normalized) * 255);

  return `rgb(${r}, 100, ${b})`;
}
