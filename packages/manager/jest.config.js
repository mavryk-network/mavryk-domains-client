module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@tezos-domains/core$': '<rootDir>/../core/public_api.ts',
        '^@tezos-domains/taquito$': '<rootDir>/../taquito/public_api.ts',
        '^@tezos-domains/manager$': '<rootDir>/public_api.ts',
    },
    globals: {
        'ts-jest': {
        },
    },
    collectCoverage: true,
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]]
};
