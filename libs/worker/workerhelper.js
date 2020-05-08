/* eslint-disable no-inner-declarations */
let TARGET = typeof Symbol === 'undefined' ? '__target' : Symbol('target');
let SCRIPT_TYPE = 'application/javascript';
let BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
let URL = window.URL || window.webkitURL;
let Worker = window.Worker;

/**
 * Returns a wrapper around Web Worker code that is constructible.
 *
 * @function shimWorker
 *
 * @param { String }    filename    The name of the file
 * @param { Function }  fn          Function wrapping the code of the worker
 */
export default function shimWorker(filename, fn) {
    return function ShimWorker(forceFallback) {
        let o = this;

        if (!fn) {
            return new Worker(filename);
        }
        else if (Worker && !forceFallback) {
            // Convert the function's inner code to a string to construct the worker
            let source = fn.toString().replace(/^function.+?{/, '').slice(0, -1);

            let objURL = createSourceObject(source);
            this[TARGET] = new Worker(objURL);
            URL.revokeObjectURL(objURL);
            return this[TARGET];
        }
        else {
            // eslint-disable-next-line no-var
            var selfShim = {
                postMessage: function(m) {
                    if (o.onmessage) {
                        setTimeout(function() { o.onmessage({ data: m, target: selfShim }); });
                    }
                }
            };

            fn.call(selfShim);
            this.postMessage = function(m) {
                setTimeout(function() { selfShim.onmessage({ data: m, target: o }); });
            };
            this.isThisThread = true;
        }
    };
}

// Test Worker capabilities
if (Worker) {
    let testWorker;
    let objURL = createSourceObject('self.onmessage = function () {}');
    let testArray = new Uint8Array(1);

    try {
        // No workers via blobs in Edge 12 and IE 11 and lower :(
        if (/(?:Trident|Edge)\/(?:[567]|12)/i.test(navigator.userAgent)) {
            throw new Error('Not available');
        }
        testWorker = new Worker(objURL);

        // Native browser on some Samsung devices throws for transferables, let's detect it
        testWorker.postMessage(testArray, [testArray.buffer]);
    }
    catch (e) {
        Worker = null;
    }
    finally {
        URL.revokeObjectURL(objURL);
        if (testWorker) {
            testWorker.terminate();
        }
    }
}

function createSourceObject(str) {
    try {
        return URL.createObjectURL(new Blob([str], { type: SCRIPT_TYPE }));
    }
    catch (e) {
        let blob = new BlobBuilder();
        blob.append(str);
        return URL.createObjectURL(blob.getBlob(SCRIPT_TYPE));
    }
}
