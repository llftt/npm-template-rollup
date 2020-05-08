const commonRollup = require('./config/rollup.base.config');

const uglify = process.env.NODE_ENV === 'production';

const config = {
    input: './src/index.js',
    name: 'Test',
    uglify: uglify,
    babel: {
        runtimeHelpers: true
    },
};
module.exports = commonRollup(config);
