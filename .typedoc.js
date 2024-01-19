module.exports = {
    mode: 'modules',
    out: 'dist/typedoc',
    readme: 'README.md',
    exclude: ['**/dist/**', '**/node_modules/**', '**/rollup*.ts', '**/test/**', 'integration-tests/**/*.ts', 'scripts/**'],
    lernaExclude: [],
    name: 'Mavryk Domains',
    excludePrivate: true,
    excludeNotExported: true,
};
