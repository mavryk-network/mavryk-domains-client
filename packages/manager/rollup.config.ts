import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
    input: `public_api.ts`,
    output: [
        { file: pkg.main, name: 'tezosDomainsManager', format: 'umd', sourcemap: true },
        { file: pkg.module, format: 'es', sourcemap: true },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ['@tezos-domains/core', '@taquito/taquito', '@taquito/michelson-encoder', 'bignumber.js', 'sha.js'],
    watch: {
        include: 'src/**',
    },
    plugins: [
        // Compile TypeScript files
        typescript({ tsconfig: './tsconfig.prod.json', useTsconfigDeclarationDir: true }),

        // Resolve source maps to the original source
        sourceMaps(),
    ],
};
