"use strict";

function bind(el, data) {
    var tpl = '"' + el.textContent.replace(/\{([^{}]*)\}/g, '" + context.$1 + "') + '"';
    var render = new Function('context', 'return ' + tpl);

    el.addEventListener('bind', function(event) {
        el.textContent = render(event.detail);
    }, false);


    function buildObject(o, data) {
        Object.getOwnPropertyNames(o).forEach(function(name) {

            if(typeof o[name] === 'object') {
                buildObject(o[name], data);
            } else {
                o['_' + name] = o[name];

                Object.defineProperty(o, name, {
                    get: function() {
                        return this['_' + name];
                    },
                    set: function(value) {
                        this['_' + name] = value;
                        el.dispatchEvent(new CustomEvent('bind', {detail: data}));
                    }
                });
            }

        })
    }

    buildObject(data, data);

    el.dispatchEvent(new CustomEvent('bind', {detail: data}));
}

var el = document.querySelector('#span');
var data = {
    user: {
        detail: {
            name: 'Jon'
        }
    },
    age: 23
};

bind(el, data);