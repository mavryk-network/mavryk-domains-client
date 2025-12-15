module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@mavrykdynamics/mavryk-domains-core$': '<rootDir>/../core/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-manager$': '<rootDir>/../manager/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-resolver$': '<rootDir>/../resolver/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-taquito$': '<rootDir>/../taquito/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-taquito-client$': '<rootDir>/public_api.ts',
    },
    globals: {
        'ts-jest': {
        },
    },
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]]
};
