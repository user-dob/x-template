function bind(el, data) {

    var values = {};

    parseEl(el);
    parseData(data);

    function parseEl(el) {
        if(el.nodeType === document.TEXT_NODE) {
            parseTextNode(el);
        }

        if(el.nodeType === document.ELEMENT_NODE) {
            switch (el.nodeName) {
                case 'X-FOR':
                    parseElementXFor(el);
                    break;

                case 'X-CODE':
                    parseElementXCode(el);
                    break;

                case 'X-IF':
                    parseElementXIf(el);
                    break;

                default:
                    parseElementNode(el);
            }
        }

        var nodes = el.childNodes;
        for(var i=0; i<nodes.length; i++) {
            parseEl(nodes[i]);
        }
    }

    function parseElementXIf(el) {
        var condition = el.getAttribute('condition');
        var o ={};

        var body = []

        o.condition = new Function('data', body.join('\n'));

        console.log(o.condition())
    }

    function parseElementXCode(el) {
        var code = el.firstChild.textContent;
        while(el.firstChild) {el.removeChild(el.firstChild);}
        var render = new Function('scope', code);
        render(data);
    }

    function parseElementXFor(el) {

        var condition = el.getAttribute('condition');
        var item, items;

        condition.replace(/\s*(\w+)\sin\s([\w\.]+)\s*/g, function(math, p1, p2) {
            item = p1;
            items = p2;
        });

        var tpl = el.cloneNode(true).childNodes;
        while(el.firstChild) {el.removeChild(el.firstChild);}

        // bind
        var body = [
            'while(el.firstChild) {el.removeChild(el.firstChild);}',
            'if(Array.isArray(context.' + items + ')) {',
                'context.' + items + '.forEach(function(' + item + ') {',
                    'var frag = document.createDocumentFragment();',
                    'for(var i=0; i<tpl.length; i++) {',
                        'frag.appendChild(tpl[i].cloneNode(true));',
                    '}',
                    'var o = {"' + item + '": ' + item + '}',
                    'bind(frag, o);',
                    'el.appendChild(frag);',
                '})',
            '}',
        ];

        values[items] = values[items] || [];
        values[items].push(el);

        var render = new Function('el', 'tpl', 'context', body.join('\n'));

        el.addEventListener('bind', function(event) {
            render(el, tpl, event.detail);
        }, false);

        // bind.push
        var body = [
            'if(Array.isArray(context)) {',
                'context.forEach(function(' + item + ') {',
                    'var frag = document.createDocumentFragment();',
                    'for(var i=0; i<tpl.length; i++) {',
                        'frag.appendChild(tpl[i].cloneNode(true));',
                    '}',
                    'var o = {"' + item + '": ' + item + '}',
                    'bind(frag, o);',
                    'el.appendChild(frag);',
                '})',
            '}'
        ];

        var renderPush = new Function('el', 'tpl', 'context', body.join('\n'));

        el.addEventListener('bind.push', function(event) {
            renderPush(el, tpl, event.detail);
        }, false);

        // bind.shift
        var body = [
            'el.removeChild(el.firstChild)'
        ];

        var renderShift = new Function('el', 'tpl', 'context', body.join('\n'));

        el.addEventListener('bind.shift', function(event) {
            renderShift(el, tpl, event.detail);
        }, false);

        // bind.pop
        var body = [
            'el.removeChild(el.lastChild)'
        ];

        var renderPop = new Function('el', 'tpl', 'context', body.join('\n'));

        el.addEventListener('bind.pop', function(event) {
            renderPop(el, tpl, event.detail);
        }, false);

    }

    function replace(text, el) {
        var empty = true;
        text = text.replace(/[\t\n\r]*/g, '');
        text = text.replace(/\{([^{}]*)\}/g, function(math, p) {
            values[p] = values[p] || [];
            values[p].push(el);
            empty = false;
            return '"+context.' + p + '+"';
        });

        return empty ? null : text;
    }

    function parseElementNode(el) {
        var attributes = el.attributes;
        var tpl = {};
        var body = [];

        for(var j = 0; j<attributes.length; j++) {
            var attr = attributes[j];
            tpl[attr.name] = replace(attr.value, el);
            if(tpl[attr.name]) {
                body.push('el.setAttribute("' + attr.name + '", "' + tpl[attr.name] + '")');
            }
        };

        if(body.length) {
            var render = new Function('el', 'context', body.join('\n'));
            el.addEventListener('bind', function(event) {
                render(el, event.detail);
            }, false);
        };
    }

    function parseTextNode(el) {
        var tpl = replace(el.textContent, el);

        if(tpl) {
            var render = new Function('el', 'context', 'el.textContent = "' + tpl + '"');
            el.addEventListener('bind', function(event) {
                render(el, event.detail);
            }, false);
        };
    };

    function dispatchEvent(path, data, eventName) {
        if(values[path]) {
            values[path].forEach(function(el) {
                el.dispatchEvent(new CustomEvent(eventName || 'bind', {detail: data}));
            })
        }
    }

    function _typeof(o) {
        return ({}).toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
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

            switch (_typeof(o[name])) {
                case 'object':
                    parseData(data, o[name], myPath);
                    break;

                case 'array':
                    /*
                    Array.observe(o[name], function(changes) {
                        changes.forEach(function(change) {
                            switch (change.type) {
                                case 'splice':
                                    if(change.addedCount) {
                                        var data = change.object.splice(change.index, change.addedCount);
                                        dispatchEvent(myPath, data, 'bind.push');
                                    } else {
                                        if(change.index) {
                                            dispatchEvent(myPath, data, 'bind.shift');
                                        }
                                        if(change.index === change.object.length) {
                                            dispatchEvent(myPath, data, 'bind.pop');
                                        }
                                    }
                                    break;

                                case 'update':
                                    break;

                                case 'delete':
                                    break;
                            }

                            console.log(change)
                        })
                    });
                    */

                    dispatchEvent(myPath, data);
                    break;

                default :
                    dispatchEvent(myPath, data);
                    break;
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
    },
    users: [
        {name: 'user 1', posts: [ {title: 'tile 1'}, {title: 'tile 1'} ]},
        {name: 'user 2', posts: [ {title: 'tile 3'}, {title: 'tile 4'} ]},
        {name: 'user 3'},
        {name: 'user 4'}
    ]
};

data.users.push({name: 'user 5'});

bind(el, data);

data.users.push({name: 'user 6'});

var a = [1,2,3];

Array.observe(a, function(changes) {
    changes.forEach(function(change) {
        console.log(change)
    })
});
