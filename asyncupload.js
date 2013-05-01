Async = (function() {
    'use strict';

    var defaultConfig = {
        cancelled   : ignore,
        changed     : ignore,
        completed   : ignore,
        started     : ignore
    },
        flux = 0,
        Async = function(formElement, config) {
            var preppedConfig = fallback(config, defaultConfig),
                fileElement = findInputElements('file')[0],
                submitElement = findInputElements('submit')[0];
    
            addEventListener(fileElement, 'change', preppedConfig.changed);
            addEventListener(formElement, 'submit', function(event) {
                preppedConfig.started(formElement);
                event.preventDefault();
                postForm();
            });
    
            function findInputElements(elementType) {
                return findChilds(formElement, 'input', function(element) {
                    return element.type === elementType;
                });
            }
    
            function postForm() {
                var hiddenFrame = document.createElement('iframe'),
                    iframeId = generateUid('iframe'),
                    previousTarget = formElement.target,
                    submit = formElement.submit;
    
                hiddenFrame.id = iframeId;
                hiddenFrame.name = iframeId;
                hiddenFrame.style.display = 'none';
                document.body.appendChild(hiddenFrame);
                formElement.target = iframeId;
                hiddenFrame.onload = function() {
                    formElement.target = previousTarget;
                    preppedConfig.completed(this.contentDocument.body.innerText);
                    this.parentNode.removeChild(this);
                };
                
                delete formElement.submit;
                formElement.submit();
                formElement.submit = submit;
            }
    
            this.form = formElement;
        };

    Async.debugConfig = {
        cancelled   : log('submit cancelled'),
        changed     : log('file changed'),
        completed   : log('submit completed'),
        started     : log('submit started')
    };

    Async.prototype.deregister = function() {
        var submitElement = findSubmitElement(this.form);

        removeEventListener(submitElement, 'change');
        throw new Error('unregister not implemented yet');
    };

    return Async;

    /* helper functions
     */
    function addEventListener(element, event, action) {
        if (element.addEventListener) {
            element.addEventListener(event, action, false);
        } else {
            element.attachEvent(event, action);
        }

        return element;
    }

    function fallback(object, templateObject) {
        var res = {};

        for (var item in templateObject)
        if (templateObject.hasOwnProperty(item)) {
            res[item] = object[item] || templateObject[item];
        }

        return res;
    }

    function findChilds(parentElement, elementType, predicate) {
        var i,
            inputElements = parentElement.getElementsByTagName(elementType),
            res = [];

        for (i = 0; i < inputElements.length; i++) {
            if (predicate(inputElements[i])) {
                res.push(inputElements[i]);
            }
        }

        return res;
    }

    function generateUid(prefix) {
        return [prefix, (new Date).getTime(), flux++].join('-');
    }

    function ignore() {}

    function log(message) {
        return function() {
            console.log(message);
        }
    }

    function removeEventListener(element, event, action) {
        if (element.removeEventListener) {
            element.removeEventListener(event, action, false);
        } else {
            element.detachEvent(event, action);
        }

        return element;
    }
    
}());

