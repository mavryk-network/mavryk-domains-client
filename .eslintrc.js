module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    ignorePatterns: ['**/coverage', '**/dist', '**/node_modules', '**/*.config.ts', '.eslintrc.js'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./packages/**/tsconfig.eslint.json'],
        sourceType: "module"
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
    rules: {
        '@typescript-eslint/no-non-null-assertion': 0
    }
};
