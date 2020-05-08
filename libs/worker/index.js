let fs = require('fs');
let path = require('path');
let paths = new Map();

module.exports = function () {
    return {
        resolveId: function (importee, importer) {
            if (importee === 'rollup-plugin-bundle-worker') {
                return path.resolve(__dirname, 'workerhelper.js');
            }
            else if (importee.indexOf('worker!') === 0) {
                let name = importee.split('!')[1];
                let target = path.resolve(path.dirname(importer), name);

                paths.set(target, name);
                return target;
            }
        },

        /**
         * Do everything in load so that code loaded by the plugin can still be transformed by the
         * rollup configuration
         */
        load: function (id) {
            if (!paths.has(id)) {
                return;
            }

            let code = [
                `import shimWorker from 'rollup-plugin-bundle-worker';`,
                `export default new shimWorker(${JSON.stringify(paths.get(id))}, function (window, document) {`,
                `var self = this;`,
                fs.readFileSync(id, 'utf-8'),
                `\n});`
            ].join('\n');

            return code;
        }
    };
};
