
function bind(el, data) {

    function parseEl(el) {
        var empty = true;
        var tpl = {};
        var replace = function(text) {
            return text.replace(/\{([^{}]*)\}/g, function(math, p) {
                empty = false;
                return '"+context.' + p + '+"';
            })
        };

        tpl.textContent = replace(el.textContent);
        tpl.attributes = {};

        var attributes = el.attributes;
        for(var j = 0; j<attributes.length; j++) {
            var attr = attributes[j];
            tpl.attributes[attr.name] = replace(attr.value);
        }

        if(!empty) {

            var body = [];
            body.push('el.textContent = "' + tpl.textContent + '"');

            for(var j = 0; j<attributes.length; j++) {
                var attr = attributes[j];
                body.push('el.setAttribute("' + attr.name + '", "' + tpl.attributes[attr.name] + '")');
            };

            var render = new Function('el', 'context', body.join(';'));

            el.addEventListener('bind', function(event) {
                render(el, event.detail);
            }, false);
        };
    }

    Object.observe(data, function(changes) {
        changes.forEach(function(change) {
            el.dispatchEvent(new CustomEvent('bind', {detail: change.object}));
        })
    }, ['update']);

    parseEl(el);
    el.dispatchEvent(new CustomEvent('bind', {detail: data}));
}


var el = document.querySelector('#el');
var data = {
    name: 'Name',
    title: 'Title',
    cls: 'class'
};

bind(el, data);


//console.log(document.querySelector('#tpl').childNodes)

document.querySelector('#span').addEventListener('click', function(event) {
    console.log(event);
}, true)


//document.querySelector('#tpl').dispatchEvent(new CustomEvent('bind', {
//    bubbles : true,
//    cancelable : true
//}));
