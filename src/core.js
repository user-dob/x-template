var core = (function(window, document) {
    'use strict';

    function get(o, path) {
        path.split('.').forEach(function(name) {
            if(o) {
                o = o[name];
            }
        });
        return o;
    };






    return {
        get: get

    };

})(window, document)
