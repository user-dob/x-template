document.registerElement('x-for', {
    prototype: Object.create(HTMLElement.prototype)
});



function bind(el, data) {

    var values = {}

    function parse(el) {

        if(el.nodeType === 3) {
            parseEl(el);
        }

        var nodes = el.childNodes;

        for(var i=0; i<nodes.length; i++) {
            parse(nodes[i]);
        };
    };

    function parseEl(el) {
        var empty = true;
        var tpl = {};
        var replace = function(text) {
            return text.replace(/\{([^{}]*)\}/g, function(math, p) {
                values[p] = values[p] || [];
                values[p].push(el.parentNode);
                empty = false;
                return '"+context.' + p + '+"';
            })
        };

        tpl.textContent = replace(el.textContent);
        tpl.attributes = {};

        var attributes = el.parentNode.attributes;
        for(var j = 0; j<attributes.length; j++) {
            var attr = attributes[j];
            tpl.attributes[attr.name] = replace(attr.value);
        }

        if(!empty) {

            var body = [];
            body.push('el.textContent = "' + tpl.textContent + '"');

            for(var j = 0; j<attributes.length; j++) {
                var attr = attributes[j];
                body.push('el.parentNode.setAttribute("' + attr.name + '", "' + tpl.attributes[attr.name] + '")');
            };

            var render = new Function('el', 'context', body.join('\n'));

            el.parentNode.addEventListener('bind', function(event) {
                render(el, event.detail);
                console.log(el);
            }, true);
        };
    }

    function buildObject(data, o, path) {


        Object.getOwnPropertyNames(o).forEach(function(name) {
            var myPath = path ? path + '.' + name : name;
            var dispatchEvent = function() {
                if(values[myPath]) {
                    values[myPath].forEach(function(el) {
                        el.dispatchEvent(new CustomEvent('bind', {detail: data}));
                    })
                };
            };

            switch (typeof o[name]) {
                case 'object':
                    buildObject(data, o[name], myPath);
                    break;
                default :
                    o['_' + name] = o[name];

                    dispatchEvent();

                    Object.defineProperty(o, name, {
                        get: function() {
                            return this['_' + name];
                        },
                        set: function(value) {
                            this['_' + name] = value;
                            dispatchEvent();
                        }
                    });
                    break;
            }
        })
    };

    parse(el);
    buildObject(data, data, '');

}

var el = document.querySelector('#tpl');
var data = {
    user: {
        detail: {
            name: 'Jon'
        }
    },
    cls: 'class',
    age: 34,
    name: 'Name',
    title: 'Title'
};

bind(el, data);

Object.observe(data.user.detail, function(changes){
    changes.forEach(function(change) {
        console.log(change);
    });

});