import { useWindowDimensions } from 'react-native';
import { spacing } from './spacing';

export interface ResponsiveDimensions {
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isSmallPhone: boolean;
  isTablet: boolean;
  isLargeTablet: boolean;
  gridColumns: number;
  getCardWidth: (columns?: number, horizontalPadding?: number, gap?: number) => number;
  maxContentWidth: number;
}

/**
 * Custom hook providing reactive screen dimensions, orientation flags,
 * and adaptive column & card width calculations.
 * Updates automatically whenever the user rotates the device or resizes the window.
 */
export const useResponsive = (): ResponsiveDimensions => {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isPortrait = !isLandscape;
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;

  // Responsive grid columns based on width
  let gridColumns = 2;
  if (width >= 1024) {
    gridColumns = 4;
  } else if (width >= 600) {
    gridColumns = 3;
  } else {
    gridColumns = 2;
  }

  // Calculate card width dynamically for product and category grids
  const getCardWidth = (
    columns: number = gridColumns,
    horizontalPadding: number = spacing.lg * 2,
    gap: number = spacing.md
  ): number => {
    const totalGaps = (columns - 1) * gap;
    const availableWidth = width - horizontalPadding - totalGaps;
    return Math.floor(availableWidth / columns);
  };

  // Safe max width for forms, auth cards, and details on wide displays (tablets/landscape)
  const maxContentWidth = isTablet ? 720 : isLandscape ? 640 : width;

  return {
    width,
    height,
    isLandscape,
    isPortrait,
    isSmallPhone,
    isTablet,
    isLargeTablet,
    gridColumns,
    getCardWidth,
    maxContentWidth,
  };
};
