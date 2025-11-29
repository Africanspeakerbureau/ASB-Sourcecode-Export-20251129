export function initSpeedInsights() {
  if (!import.meta.env.PROD || typeof window === 'undefined') {
    return;
  }

  const moduleName = '@vercel/speed-insights';

  import(/* @vite-ignore */ moduleName)
    .then(mod => {
      const injector = mod?.injectSpeedInsights || mod?.default;
      if (typeof injector === 'function') {
        injector();
      }
    })
    .catch(error => {
      if (import.meta.env.DEV) {
        console.info('Vercel speed insights unavailable, continuing without instrumentation.', error);
      }
    });
}
