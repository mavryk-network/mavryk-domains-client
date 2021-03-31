const commonRules = {
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/cognitive-complexity': 'off',
    'sonarjs/no-element-overwrite': 'off',
    '@typescript-eslint/explicit-module-boundary-types': [
        2,
        {
            allowArgumentsExplicitlyTypedAsAny: true,
        },
    ],
    indent: ['error', 4, { SwitchCase: 1 }],
};

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    ignorePatterns: ['**/coverage', '**/dist', '**/node_modules', '**/*.config.ts', '**/*.js', '.eslintrc.js', '/scripts'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./packages/**/tsconfig.eslint.json', './integration-tests/tsconfig.eslint.json'],
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'jest', 'sonarjs'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking', 'plugin:sonarjs/recommended'],
    rules: {
        ...commonRules
    },
    overrides: [
        {
            files: ['*.spec.ts'],
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking', 'plugin:jest/recommended'],
            rules: {
                ...commonRules,
                '@typescript-eslint/unbound-method': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/restrict-template-expressions': 'off',
            },
        },
    ],
};
