module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    ignorePatterns: ['**/coverage', '**/dist', '**/node_modules', '**/*.config.ts', '**/*.config.js', '.eslintrc.js'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./packages/**/tsconfig.eslint.json', './integration-tests/tsconfig.eslint.json'],
        sourceType: 'module',
    },
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
    rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-unsafe-return': 0,
        '@typescript-eslint/unbound-method': 0,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/restrict-template-expressions': 0,
        '@typescript-eslint/explicit-module-boundary-types': [
            2,
            {
                allowArgumentsExplicitlyTypedAsAny: true,
            },
        ],
        indent: ['error', 4, { SwitchCase: 1 }],
    },
};
