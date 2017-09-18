javascript: (function() {
	var info = {
		 name        : 'Hold Click'
		,tag_id      : '__bk_HoldClick'  /* The special class added to new tags (for easier cleanup of the DOM on close) */
		,description : 'Bookmarklet to continuously auto-click on an element when the left mouse button is held down.'
	};
	
	var resources = [
		{
			 name     : "jQuery"
			,version  : "3.2.1"
			,source   : "//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"
			,type     : "script"
			,isLoaded : function (resource) {return window.jQuery !== undefined && window.jQuery.fn.jquery >= resource.version;}
		}
		,{
			 name     : "jQuery UI"
			,version  : "1.12.1"
			,source   : "//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"
			,type     : "script"
			,isLoaded : function (resource) {return window.jQuery.ui !== undefined && window.jQuery.ui.version >= resource.version;}
		}
		,{
			 name     : "jQuery UI CSS"
			,version  : "1.12.1"
			,source   : "//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/flick/jquery-ui.css"
			,type     : "css"
			,isLoaded : function (resource) {return true;}
		}
		,{
			 name    : "jQuery Inject CSS"
			,version : "0.1"
			,source  : "//cdn.rawgit.com/kajic/jquery-injectCSS/0323ad70/jquery.injectCSS.js"
			,type    : "script"
			,isLoaded : function (resource) {return window.jQuery.injectCSS !== undefined}
		}
	];
	
	var css = {
		/* CSS for jQuery UI */
		
		 '.ui-widget' : {
			 'font-family' : 'Verdana,Arial,sans-serif'
			,'font-size'   : '1em'
		}
		,'.ui-widget-content' : {
			 'background' : '#ffffff'
			,'color'      : '#111111'
		}
		
		,'.ui-widget.ui-dialog' : {
			 'position'   : 'fixed'
			,'box-shadow' : '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
			,'padding'    : '0 !important'
			,'border'     : 'none'
		}
		,'.ui-dialog .ui-dialog-content' : {
			 'position'   : 'relative'
			,'overflow'   : 'hidden'
			,'border'     : 'none'
			,'text-align' : 'center'
			,'padding'    : '2px !important'
		}
		,'.ui-dialog .ui-dialog-content p' : {
			 'margin'  : '0px'
			,'padding' : '3px 0px 10px'
		}
		,'.ui-dialog .ui-dialog-titlebar' : {
			 'position'   : 'relative'
			,'padding'    : '3px'
			,'background' : '#665577'
			,'color'      : '#ffffff'
			,'border'     : 'none'
		}
		,'.ui-dialog .ui-dialog-titlebar.ui-corner-all' : {
			 'border-bottom-left-radius'  : '0px'
			,'border-bottom-right-radius' : '0px'
		}
		,'.ui-dialog-titlebar-close' : {
			 'background' : '#665577'
			,'color'      : '#ffffff'
		}
		,'.ui-dialog-titlebar-close:hover, .ui-dialog-titlebar-close:focus, .ui-dialog-titlebar-close:active' : {
			 'background' : '#ffffff'
			,'color'      : '#665577'
			,'outline'    : 'none !important'
			,'border'     : 'none'
		}
		,'.ui-dialog-titlebar-close .ui-button-icon' : {
			 'filter' : 'brightness(0%) invert(100%)'
		}
		,'.ui-dialog-titlebar-close:hover .ui-button-icon, .ui-dialog-titlebar-close:focus .ui-button-icon, .ui-dialog-titlebar-close:active .ui-button-icon' : {
			 'filter'  : 'brightness(40%) sepia(100%) hue-rotate(227deg) brightness(75.5%) saturate(130.75%) brightness(97.56%)'
			,'outline' : 'none !important'
		}
		,'.ui-dialog .ui-dialog-titlebar .ui-dialog-title' : {
			 'font-size'   : '1.25em'
			,'font-weight' : 'bold'
			,'text-align'  : 'center'
			,'width'       : '100%'
		}
		
		,'.ui-dialog .ui-dialog-content .ui-slider' : {
			 'margin'   : '5px 0px 20px 0px'
			,'position' : 'relative'
		}
		,'.ui-dialog .ui-dialog-content .ui-slider .ui-slider-handle' : {
			'background' : '#665577'
		}
		,'.ui-dialog .ui-dialog-content .ui-slider .ui-slider-handle.ui-state-hover, .ui-slider-handle.ui-state-focus, .ui-slider-handle.ui-state-active' : {
			 'outline' : 'none'
			,'border' : '1px solid #665577'
		}
	};
	
	function loadNextResource() {
		var res = resources.shift();
		 
		if (res) {
			console.log("Loading Resource [" + res.name + " v" + res.version + "]");
			var loaded = res.isLoaded(res)
				&& (res.type != 'script' || document.querySelector('script[src="' + res.source + '"]') !== null)
				&& (res.type != 'css'    || document.querySelector('link[href="'  + res.source + '"]') !== null);
			
			if (!loaded) {
				var tag;
				
				if (res.type == "script") {
					tag     = document.createElement("script");
					tag.src = res.source;
				} else if (res.type == "css") {
					tag      = document.createElement("link");
					tag.rel  = "stylesheet";
					tag.href = res.source;
				} else {
					console.log("  Unsupported resource type [" + res.type + "]");
					loadNextResource();
					return;
				}
				
				tag.classList.add(info.class_id);
				
				document.head.appendChild(tag);
				
				tag.onload = tag.onreadystatechange = function () {
					if (!loaded && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
						console.log("  Resource finished loading");
						loadNextResource();
					}
				};
			} else {
				console.log("  Resource already loaded");
				loadNextResource();
			}
		} else {
			console.log("Finished loading resources");
			
			$.injectCSS(css);
			initBookmarket();
		}
	}
	
	loadNextResource();
	
	/* BOOKMARKLET IMPLEMENTATION */
	var MS_PER_SEC  = 1000.0;
	var INIT_DELAY  = 100;
	
	var MIN_CPS     = 1;
	var MAX_CPS     = 200;
	var DEFAULT_CPS = 50;
	
	var __timeout   = null;
	
	function initBookmarket() {
		__ui = createUI();
		
		$(document).on('mousedown.' + info.tag_id, function(event) {
			if (__ui.parent().has(event.target).length == 0 && isAutoClickable(event.target)) {
				/* Not part of this bookmarklet's UI */
				var cps   = __ui.getValue();
				var delay = Math.round(MS_PER_SEC / cps);
				__timeout   = setTimeout(autoClick, INIT_DELAY, event.target, delay);
			} else {
				/* Not autoclickable, so just send one click */
				clickTag(event.target);
			}
		});
		
		$(document).on('mouseup.' + info.tag_id, function(event) {
			stopAutoClick();
		});
	}
	
	function teardownBookmarklet() {
		$(document).off('mousedown.' + info.tag_id);
		$(document).off('mouseup.' + info.tag_id);
		
		stopAutoClick();
	}
	
	function isAutoClickable(tag) {
		return tag
			&& (tag.click || (tag.nodeName == "BUTTON" && !tag.disabled))
			&& window.getComputedStyle(tag) !== "none";
	}
	
	function autoClick(tag, delay) {
		if (isAutoClickable(tag) && __timeout) {
			clickTag(tag);
			__timeout = setTimeout(autoClick, delay, tag, delay);
		} else {
			stopAutoClick();
		}
	}
	
	function stopAutoClick() {
		if (__timeout) {
			clearTimeout(__timeout);
			__timeout = null;
		}
	}
	
	function clickTag(tag) {
		tag.dispatchEvent(new MouseEvent('click', {
			 'view'       : window
			,'bubbles'    : true
			,'cancelable' : true
		}));
	}
	
	function createUI() {
		var ui_tag = $('#ui' + info.tag_id);
		if (!ui_tag.length) {
			ui_tag = $('<div/>', {'id' : 'ui' + info.tag_id}).appendTo('body');
		}
		
		var ui = ui_tag.dialog(
			{
				 'title'      : 'Hold Click'
				,'draggable'  : true
				,'modal'      : false
				,'autoresize' : true
				,'minHeight'  : 0
				,'close'      : teardownBookmarklet
			}
		);
		
		var label_tag = ui_tag.find('#label' + info.tag_id);
		if (!label_tag.length) {
			label_tag  = $('<p/>', {'id' : 'label' + info.tag_id})
				.text('Clicks per Second')
				.appendTo(ui_tag);
		}
		
		var slider_tag = ui_tag.find('#slide' + info.tag_id);
		if (!slider_tag.length) {
			slider_tag = $('<div/>', {
				 'css' : {
					'width' : '90%'
				}
				,'id' : 'slide' + info.tag_id
			}).insertAfter(label_tag);
		}
		
		var value_tag = slider_tag.find('#value' + info.tag_id);
		if (!value_tag.length) {
			value_tag = $('<p/>', {
				 'css' : {
					'display' : 'inline-block'
				}
				,'id' : 'value' + info.tag_id
			}).appendTo(slider_tag);
		}
		
		var slider = configureSlider(slider_tag, value_tag, MIN_CPS, MAX_CPS, DEFAULT_CPS, 1)
			.position({
				 'my'     : 'center top'
				,'at'     : 'center bottom'
				,'of'     : label_tag
				,'within' : ui_tag
			});
		
		ui.getValue = function() {
			return slider.slider('value');
		};
		
		return ui;
	}
	
	function configureSlider(slider_tag, value_tag, min, max, value, step) {
		var slide;
		
		if (slider_tag.slider('instance')) {
			slide = slider_tag.slider('widget');
		} else {
			slide = slider_tag.slider({
				 'min'   : min
				,'max'   : max
				,'value' : value
				,'step'  : step
			});
		}
		
		slide.slider('option', 'slide', function(event, ui) {
			/* Wait for the UI to finish setting the position */
			setTimeout(function() {
				value_tag.html(ui.value).position({
					 'my' : 'center top'
					,'at' : 'center bottom'
					,'of' : ui.handle
				});
			}, 5);
		});
		
		/* Call the slide method in order to display the value of the default position */
		slide.slider('option', 'slide')
			.call(slide, null, {
				 'handle' : $('.ui-slider-handle', slide)
				,'value'  : slide.slider('value')
			});
		
		return slide;
	}
	
})();
