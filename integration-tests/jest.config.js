module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            packageJson: 'package.json',
        },
    },
    reporters: ['default', ['jest-junit', { outputDirectory: 'coverage' }]]
};
