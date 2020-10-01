module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/test/**/*.(ts|tsx)'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  }
}
