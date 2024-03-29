module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@tezos-domains/core$': '<rootDir>/../core/public_api.ts',
        '^@tezos-domains/manager$': '<rootDir>/../manager/public_api.ts',
        '^@tezos-domains/resolver$': '<rootDir>/../resolver/public_api.ts',
        '^@tezos-domains/conseil-client$': '<rootDir>/public_api.ts',
    },
    globals: {
        'ts-jest': {
        },
    },
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]]
};
