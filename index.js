var Carousel = require('carousel'),
	template = require('./template'),
	id = 0;

function Slideshow(container,options){
	
	if(!(this instanceof Slideshow))
		return new Slideshow(container,options);

	this.id = 'slideshow' + id++;

	this.init(container,options);
}

Slideshow.prototype = (function(){
	var slideshow = {
		id: undefined,
		template: template,
		next:'&rang;',
		prev:'&lang;',
		speed: 4000
	}, carousel;

	SSproto = {
		init: function(container,options){
			slideshow.id = this.id;

			if(typeof container === 'string')
        		container = document.getElementById(container);

        	if(!container) throw new Error("invalid slideshow container");

        	mergeOptions(slideshow,options);

        	setup(container);
       	
        	return this;		
		},
		start: function(){
			carousel.start(0,slideshow.speed);

			return this;
		}

	}

	function setup(container){
		var slides = '\n', 
			dots = '\n', 
			navId = slideshow.id + 'nav';

		var childs = container.childNodes;

		/* get slides from parent container */
	    for(var i = 0, n = 0, l = childs.length; i < l; i++){
	        if(childs[i].nodeType === 1){ 
	            slides+= '<div id="'+ slideshow.id + 's' + n + '">' + childs[i].outerHTML + '</div>\n';
				dots+='<li class="dot" id="' + navId + n + '"></li>\n';
				n++;
	        }    
	    }

		var template = slideshow.template.replace(/{\w+}/mg,function(m){
			switch(m){
				case "{id}": return slideshow.id;
				case "{slides}": return slides;
				case "{next}": return slideshow.next;
				case "{prev}": return slideshow.prev; 
				case "{nav}": return dots;
			}
		});

		/* apply slider template */
		container.innerHTML = template;
		container.className = 'slideshow';
		
		/* create carousel */
		carousel = new Carousel(slideshow.id);

		/* add UI handlers */
		addNavHandler(document.getElementById(navId));
		addButtonHandler(document.getElementById(slideshow.id+'next'),'next');
		addButtonHandler(document.getElementById(slideshow.id+'prev'),'prev');
		addPauseHandler(document.getElementById(slideshow.id));
	}

	/* add click handlers to next prev buttons */
	function addButtonHandler(elem,button){
		elem.addEventListener('click',function(event){
			carousel[button]();
			event.stopPropagation();
		});	
	}

	/* add click handler to nav dots */
	function addNavHandler(elem){
		var nav = document.getElementById(slideshow.id+'nav');
		var matchNav = new RegExp(elem.id + '(\\d+)');

		elem.addEventListener('click', function(event){
			event = event ? event : window.event;
			var target = event.target || event.srcElement;
			var ix = matchNav.exec(target.id);
			
			if(ix) {
				carousel.show(ix[1]);
				event.stopPropagation();
			}	
		});

		var dots = elem.getElementsByTagName('li');

		/* display active dot */
		carousel.onChange = function(index,from){
			
			if(from !== undefined){
				dots[from].className = "dot";
			}

			dots[index].className = "active dot";

			carousel.transit(index,from);
		}
	}

	/* adds click handler on slide to toggle pause */
	function addPauseHandler(elem){
		elem.addEventListener('click',function(event){
			if(carousel.paused) {
				carousel.resume();
			} else {
				carousel.pause();
			}
		});
	}

	return SSproto;
}());

function mergeOptions(target,source){
    for(var key in source) {
        target[key] = source[key];
    }
    
    return target;
}


module.exports = Slideshow;