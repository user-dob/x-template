

function bind(el) {

    var values = {};

    parseEl(el);
    parseData(data, data, '');

    function parseEl(el) {
        if(el.nodeType === window.Node.TEXT_NODE) {
            parseTextNode(el);
        }

        var nodes = el.childNodes;
        for(var i=0; i<nodes.length; i++) {
            parseEl(nodes[i]);
        }
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

    function parseData(data, o, path) {

        Object.observe(o, function(changes) {
            changes.forEach(function(change) {
                var name = path ? path + '.' + change.name : change.name
                if(values[name]) {
                    values[name].forEach(function(el) {
                        el.dispatchEvent(new CustomEvent('bind', {detail: data}));
                    })
                }
            })
        }, ['update']);

        Object.getOwnPropertyNames(o).forEach(function(name) {
            if(typeof o[name] === 'object') {
                parseData(data, o[name], path ? path + '.' + name : name);
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