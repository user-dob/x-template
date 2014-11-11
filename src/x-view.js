(function(window, document) {

    var element = Object.create(HTMLElement.prototype);

    element.createdCallback = function() {

        //el.template = el.querySelector('template').content;

        console.log( this.querySelector('template').content )
    };

    element.attachedCallback = function() {
        console.log('attachedCallback')
    };

    element.attributeChangedCallback = function(attr, oldVal, newVal) {
    };

    var XFor = document.registerElement('x-view', {
        prototype: element
    });

})(window, document);

