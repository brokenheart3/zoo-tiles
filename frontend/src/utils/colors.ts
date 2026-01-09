// Theme color utilities
export const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Color with opacity
export const withOpacity = (hexColor: string, opacity: number): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Status colors
export const statusColors = {
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  primary: '#2196F3',
  secondary: '#9C27B0',
};

// Grid size colors
export const gridSizeColors = {
  '6x6': '#4CAF50',
  '8x8': '#FF9800',
  '10x10': '#F44336',
  '12x12': '#9C27B0',
};

// Difficulty colors
export const difficultyColors = {
  Easy: '#4CAF50',
  Medium: '#FF9800',
  Hard: '#F44336',
  Expert: '#9C27B0',
};

// Generate random color
export const getRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
    '#118AB2', '#EF476F', '#073B4C', '#7209B7'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};