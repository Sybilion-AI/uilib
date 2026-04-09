const isProduction = process.env.NODE_ENV === 'production';

export default isProduction
  ? {
      log: () => {},
      warn: () => {},
      error: console.error,
    }
  : console;
