

function bind(el) {

    var values = {};

    parseEl(el);
    parseData(data);

    function parseEl(el) {
        if(el.nodeType === window.Node.TEXT_NODE) {
            parseTextNode(el);
        }

        if(el.nodeType === window.Node.ELEMENT_NODE) {
            parseElementNode(el);
        }

        var nodes = el.childNodes;
        for(var i=0; i<nodes.length; i++) {
            parseEl(nodes[i]);
        }
    }

    function parseElementNode(el) {

        var empty = true;
        var tpl = {};
        var replace = function(text) {
            text = text.replace(/[\t\n\r]*/g, '');
            return text.replace(/\{([^{}]*)\}/g, function(math, p) {
                values[p] = values[p] || [];
                values[p].push(el);
                empty = false;
                return '"+context.' + p + '+"';
            })
        };

        var attributes = el.attributes;
        for(var j = 0; j<attributes.length; j++) {
            var attr = attributes[j];
            tpl[attr.name] = replace(attr.value);
        };

        if(!empty) {

            var body = [];

            for(var j = 0; j<attributes.length; j++) {
                var attr = attributes[j];
                body.push('el.setAttribute("' + attr.name + '", "' + tpl[attr.name] + '")');
            };

            var render = new Function('el', 'context', body.join('\n'));

            el.addEventListener('bind', function(event) {
                render(el, event.detail);
            }, true);
        };
    }

    function parseTextNode(el) {

        var empty = true;
        var replace = function(text) {
            text = text.replace(/[\t\n\r]*/g, '');
            return text.replace(/\{([^{}]*)\}/g, function(math, p) {
                values[p] = values[p] || [];
                values[p].push(el);
                empty = false;
                return '"+context.' + p + '+"';
            })
        };

        var tpl = replace(el.textContent);

        if(!empty) {
            var render = new Function('el', 'context', 'el.textContent = "' + tpl + '"');
            el.addEventListener('bind', function(event) {
                render(el, event.detail);
            }, false);
        };
    };

    function dispatchEvent(path, data) {
        if(values[path]) {
            values[path].forEach(function(el) {
                el.dispatchEvent(new CustomEvent('bind', {detail: data}));
            })
        }
    }

    function parseData(data, o, path) {

        o = o || data;
        path = path || '';

        Object.observe(o, function(changes) {
            changes.forEach(function(change) {
                var name = path ? path + '.' + change.name : change.name
                dispatchEvent(name, data);
            })
        }, ['update']);

        Object.getOwnPropertyNames(o).forEach(function(name) {
            var myPath = path ? path + '.' + name : name;

            if(typeof o[name] === 'object') {
                parseData(data, o[name], myPath);
            } else {
                dispatchEvent(myPath, data);
            }
        })
    }


}


var el = document.querySelector('#tpl');
var data = {
    name: 'Name',
    title: 'title',
    cls: 'class',
    user: {
        name: 'Jon'
    }
};

bind(el, data);