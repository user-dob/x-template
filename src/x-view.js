(function(window, document) {

    var element = Object.create(HTMLElement.prototype);

    element.createdCallback = function() {
        var el = this;
        el.template = el.querySelector('template').content;
    };

    element.attachedCallback = function() {
        var el = this;
        el.clear();
        el.appendChild(el.template);
        console.log( el.querySelector('x-for') )
    };

    element.attributeChangedCallback = function(attr, oldVal, newVal) {
    };

    element.clear = function() {
        var el = this;
        while ( el.firstChild ) {
            el.removeChild( el.firstChild );
        };
    };

    var XFor = document.registerElement('x-view', {
        prototype: element
    });

})(window, document);

