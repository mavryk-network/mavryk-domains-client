module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@tezos-domains/core$': '<rootDir>/../packages/core/public_api.ts',
        '^@tezos-domains/resolver$': '<rootDir>/../packages/resolver/public_api.ts',
        '^@tezos-domains/manager$': '<rootDir>/../packages/manager/public_api.ts',
        '^@tezos-domains/client$': '<rootDir>/../packages/client/public_api.ts',
    },
    globals: {
        'ts-jest': {
            tsconfig: '../tsconfig.json',
        },
    },
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]]
};
