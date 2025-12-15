module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@mavrykdynamics/mavryk-domains-core$': '<rootDir>/../core/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-taquito$': '<rootDir>/../taquito/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-manager$': '<rootDir>/public_api.ts',
    },
    globals: {
        'ts-jest': {
        },
    },
    collectCoverage: true,
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]]
};
