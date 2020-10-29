module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@tezos-domains/core$': '<rootDir>/public_api.ts',
    },
    globals: {
        'ts-jest': {
        },
    },
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]]
};
