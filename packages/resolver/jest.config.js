module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@tezos-domains/core$': '<rootDir>/../core/public_api.ts',
        '^@tezos-domains/resolver$': '<rootDir>/public_api.ts',
    },
    globals: {
        'ts-jest': {
            packageJson: 'package.json',
        },
    },
    collectCoverage: true
};
