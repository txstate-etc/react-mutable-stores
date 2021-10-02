module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  testMatch: ['**/test/**/*.(ts|tsx)'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  }
}
