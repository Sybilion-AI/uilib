module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|sass|scss|styl)$': 'identity-obj-proxy',
    '^#uilib/.*\\.md$': '<rootDir>/tests/mocks/mdMock.js',
    '^#uilib/(.*)$': '<rootDir>/src/$1',
    '^uilib(.*)$': '<rootDir>/src$1',
    '^@homecode/ui$': '<rootDir>/tests/mocks/homecodeUiMock.ts',
    '^lightweight-charts$': '<rootDir>/tests/mocks/lightweightChartsMock.ts',
    '\\.svg$': '<rootDir>/tests/mocks/svgMock.js',
    '\\.(png|jpe?g|gif|webp|avif)$': '<rootDir>/tests/mocks/fileMock.js',
    '\\.md$': '<rootDir>/tests/mocks/mdMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/tests/setup.tsx',
  ],
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
