export function createVitestConfig(options = {}) {
  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [],
      ...options
    }
  };
}
