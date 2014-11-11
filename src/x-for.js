(function(window, document) {

    var element = Object.create(HTMLElement.prototype);

    element.createdCallback = function() {
        var el = this;

        //console.log(this.childNodes)

        //el.template = el.querySelector('template').content;
        el.template = {}
    };

    element.attachedCallback = function() {
        var el = this;
        el.compile();
    };

    element.attributeChangedCallback = function(attr, oldVal, newVal) {
        if (attr === 'repeat') {
            this.compile();
        }
    };

    element.compile = function() {
        var el = this;
        if (el.hasAttribute('repeat')) {
            var value = el.getAttribute('repeat');
            var node = document.importNode(el.template, true);
            var fragment = document.createDocumentFragment();

            for(var i=0; i<value; i++) {
                fragment.appendChild(node.cloneNode(true));
            };

            el.clear();
            el.appendChild(fragment);
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
