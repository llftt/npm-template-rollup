const { uglify } = require('rollup-plugin-uglify');
const json = require('rollup-plugin-json');
const postcss = require('rollup-plugin-postcss');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const { string } = require('rollup-plugin-string');
const context = require('rollup-plugin-require-context');
const builtins = require('rollup-plugin-node-builtins');
const bundleWorker = require('../libs/worker');
const analyzer = require('rollup-plugin-visualizer');

const defaultRollup = {
    input: 'src/index.js',
    name: 'Player',
    sourcemap: true,
    production: false,
    external: [],
    plugins: [],
    globals: {},
    commonjs: {},
    resolve: {},
    babel: {},
    watch: {}
};

const commonRollup = function (config = {}) {
    const rollupConfig = Object.assign({}, defaultRollup, config);
    return {
        input: rollupConfig.input,
        output: config.output || [
            {
                file: rollupConfig.uglify ? 'dist/index.min.js' : 'dist/index.js',
                name: rollupConfig.name,
                format: 'umd',
                sourcemap: uglify ? false : rollupConfig.sourcemap,
                globals: rollupConfig.globals
            }
        ],
        external: rollupConfig.external,
        plugins: [
            ...rollupConfig.plugins,
            bundleWorker(),
            rollupConfig.uglify ? uglify(rollupConfig.uglify) : undefined,
            json({
                compact: true
            }),
            postcss({
                extensions: ['.css', '.scss', '.sass'],
                'postcss-cssnext': {
                    browserslist: ['cover 99.5%']
                }
            }),
            babel({
                exclude: ['node_modules/**', '**/*.svg'],
                ...rollupConfig.babel
            }),
            resolve({
                preferBuiltins: true,
                extensions: ['.mjs', '.js', '.jsx', '.json'],
                ...rollupConfig.resolve
            }),
            string({
                include: '**/*.svg'
            }),
            commonjs({
                include: [/node_modules/],
                ...rollupConfig.commonjs
            }),
            builtins(),
            context(),
            process.env.ANALYZE ? analyzer() : undefined
        ],
        watch: {
            ...config.watch
        }
    };
};
module.exports = commonRollup;
