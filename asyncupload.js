
Async = (function() {
	'use strict';
	
	var 
	flux = 0,
	Async = function(formElement, config) {
		var config = config || Async.debugConfig,
			fileElement = findInputElement('file'),
			self = this,
			submitElement = findInputElement('submit');
			
		addEventListener(fileElement, 'change', config.changed);
		addEventListener(formElement, 'submit', function(event) {
			event.preventDefault();
			console.log('submitting form');
			postForm();
		});
		
		function findInputElement(elementType) {
			return findElement(formElement, 'input', function(element) {
				return element.getAttribute('type') === elementType;
			});
		}
		
		function postForm() {
			var hiddenFrame = document.createElement('iframe'),
				iframeId = generateUid('iframe'),
				previousTarget = formElement.getAttribute('target');
				
			config.started(formElement);
			
			hiddenFrame.id = iframeId;
			hiddenFrame.name = iframeId;
			document.body.appendChild(hiddenFrame);			
			formElement.setAttribute('target', iframeId);
			hiddenFrame.onload = function() {
				config.completed(this.contentWindow.document.body);
				//formElement.setAttribute('target', previousTarget);
			};
			
			HTMLFormElement.prototype.submit.call(formElement);		}			

		this.form = formElement;
	};
	
	Async.Config = function(cancelled, changed, completed, started) {
		this.cancelled	= cancelled	|| ignore;
		this.changed	= changed	|| ignore;
		this.completed	= function(iframe) { document.removeChild(iframe); return completed || ignore };
		this.started	= started	|| ignore;
	}
		
	Async.debugConfig = new Async.Config(
		log('submit cancelled'),
		log('file changed'),
		log('submit completed'),
		log('submit stared'));
	
	Async.defaultConfig = new Async.Config;
	
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
		
	function findElement(parentElement, elementType, predicate) {
		var i, inputElements = parentElement.getElementsByTagName(elementType);
		
		for (i = 0; i < inputElements.length; i++) {
			if (predicate(inputElements[i]))
				return inputElements[i];
		}
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





