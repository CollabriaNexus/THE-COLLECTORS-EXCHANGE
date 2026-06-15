const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-MFQBH0YJ0K';

export const pageview = (path) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: path });
  }
};

export const event = ({ action, category, label, value }) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};
