module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@mavrykdynamics/mavryk-domains-core$': '<rootDir>/../packages/core/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-resolver$': '<rootDir>/../packages/resolver/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-manager$': '<rootDir>/../packages/manager/public_api.ts',
        '^@mavrykdynamics/mavryk-domains-client$': '<rootDir>/../packages/client/public_api.ts',
    },
    globals: {
        'ts-jest': {
            tsconfig: '../tsconfig.json',
        },
    },
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]]
};
