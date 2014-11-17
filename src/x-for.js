data = {
    users: [
        {name: 'user 1', age: 1},
        {name: 'user 2', age: 1},
        {name: 'user 3', age: 1},
        {name: 'user 4', age: 1},
        {name: 'user 5', age: 1}
    ]
};


(function(window, document) {

    var element = Object.create(HTMLElement.prototype);

    element.createdCallback = function() {
        var el = this;
        el.template = el.querySelector('template').content;

        console.log(el.parentNode)
    };

    element.attachedCallback = function() {
        var el = this;

        console.log(el)

        el.compile();
    };

    element.attributeChangedCallback = function(attr, oldVal, newVal) {
        if (attr === 'repeat') {
            this.compile();
        }
    };

    element.compile = function() {
        var el = this;
        if (el.hasAttribute('condition')) {
            var value = el.getAttribute('condition');
            var itemName, itemsName;

            value.replace(/\s*(\w+)\sin\s([\w\.]+)\s*/g, function(math, item, items) {
                itemName = item;
                itemsName = items;
            });

            var fragment = document.createDocumentFragment();
            var node = document.importNode(el.template, true);

            fragment.appendChild(node)

            el.clear();
            el.appendChild(fragment);

            console.log(itemName, itemsName)


//            var node = document.importNode(el.template, true);
//            var fragment = document.createDocumentFragment();
//
//            for(var i=0; i<value; i++) {
//                fragment.appendChild(node.cloneNode(true));
//            };
//
//            el.clear();
//            el.appendChild(fragment);
        };
    };

    element.clear = function() {
        var el = this;
        while ( el.firstChild ) {
            el.removeChild( el.firstChild );
        };
    };

    var XFor = document.registerElement('x-for', {
        prototype: element
    });

})(window, document);
