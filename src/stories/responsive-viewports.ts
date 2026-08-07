export const RESPONSIVE_VIEWPORTS = {
  mobile: {
    name: 'Mobile (390px)',
    styles: { width: '390px', height: '844px' },
    type: 'mobile' as const,
  },
  tablet: {
    name: 'Tablet (768px)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet' as const,
  },
  desktop: {
    name: 'Desktop (1280px)',
    styles: { width: '1280px', height: '800px' },
    type: 'desktop' as const,
  },
};

export const RESPONSIVE_DEFAULT_VIEWPORT = 'desktop';
