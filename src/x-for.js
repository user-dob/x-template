var users = [
    {name: 'user 1', age: 1},
    {name: 'user 2', age: 1},
    {name: 'user 3', age: 1},
    {name: 'user 4', age: 1},
    {name: 'user 5', age: 1}
];

(function (window, document, core) {

    var element = Object.create(HTMLElement.prototype);

    element.createdCallback = function () {
        var el = this;
        el.template = el.querySelector('template').content;

        console.log(el.parentNode)
    };

    element.attachedCallback = function () {
        var el = this;

        console.log(el)

        el.compile();
    };

    element.attributeChangedCallback = function (attr, oldVal, newVal) {
        if (attr === 'repeat') {
            this.compile();
        }
    };

    element.compile = function () {
        var el = this;
        if (el.hasAttribute('repeat')) {
            var value = el.getAttribute('repeat');
            var fragment = document.createDocumentFragment();
            var node = el.template;
            var item;

            window[value].forEach(function(user) {
                item = node.cloneNode(true);

                item.querySelector('p').textContent = user.name;
                fragment.appendChild(item);

            })

            //var node = document.importNode(el.template, true);
            //for(var i=0; i<value; i++) {
            //    fragment.appendChild(node.cloneNode(true));
            //};

            el.clear();
            el.appendChild(fragment);
        };
    };

    element.clear = function () {
        var el = this;
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        };
    };

    var XFor = document.registerElement('x-for', {
        prototype: element
    });

})(window, document, core);


