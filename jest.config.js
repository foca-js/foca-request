module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  bail: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts?(x)'],
  verbose: true,
  testMatch: ['<rootDir>/test/**/*.test.ts?(x)'],
};
