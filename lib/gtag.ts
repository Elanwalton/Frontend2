declare global {
  interface Window {
    gtag: (command: string, id: string, config?: Record<string, any>) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-F3ZD9XTVHG';

// Basic pageview tracking
export const pageview = (url: string) => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Custom events (optional)
export const event = ({ action, params }: { action: string; params?: Record<string, any> }) => {
  window.gtag('event', action, params);
};
