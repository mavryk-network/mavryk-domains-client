module.exports = {
    extends: ['@commitlint/config-conventional', '@commitlint/config-lerna-scopes'],
    rules: {
        'type-enum': [2, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'release']],
    },
};
