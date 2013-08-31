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
        time: 4000,
        beforeTransit: undefined,
        afterTransit: undefined
	}, carousel;

	SSproto = {
		init: function(container,options){
			if(typeof container === 'string')
                container = document.getElementById(container);

            if(!container) throw new Error("invalid slideshow container");

            slideshow.id = this.id;

            mergeOptions(slideshow,options);

            setup(container);

            return this;		
        },
        start: function(){
            carousel.start(0,slideshow.time);

            return this.display(true);
        },
        stop: function(){
            carousel.stop();

            return this;
        },
        pause: function(){
            carousel.pause();

            return this;
        },
        resume: function(){
            carousel.resume;

            return this;
        },
        show: function(x){
            carousel.show(x);

            return this;
        },
        display: function(value){
            var slides = document.getElementById(slideshow.id);

            if(typeof value === 'string') slides.style.display = value;
            else if(!!value) slides.style.display = 'block';
            else slides.style.display = 'none';

            return this;
        }
    }

    function setup(container){
        var slides = '\n', 
            dots = '\n', 
            navId = slideshow.id + 'nav',
            childs = container.childNodes;

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

        attachHandlers();
    }

    function attachHandlers(){
        var slides = document.getElementById(slideshow.id),
            nav = document.getElementById(slideshow.id+'nav'),
            next = document.getElementById(slideshow.id+'next'),
            prev = document.getElementById(slideshow.id+'prev');
        
        /* add slidshow UI handlers */
        addNavHandler(nav);
        addPauseHandler(slides);
        addTransitionHandler(nav);
        addTransitionEndHandler(slides);
        addButtonHandler(next,'next');
        addButtonHandler(prev,'prev');
    }

    function addButtonHandler(elem,button){
        addEvent(elem,'click',function(event){
            carousel[button]();
            event.stopPropagation();
        });	
    }

    function addNavHandler(elem){
        var nav = document.getElementById(slideshow.id+'nav'),
            matchNav = new RegExp(elem.id + '(\\d+)');

        addEvent(elem,'click', function(event){
            event = event ? event : window.event;
            var target = event.target || event.srcElement,
                ix = matchNav.exec(target.id);

            if(ix) {
                carousel.show(ix[1]);
                event.stopPropagation();
            }	
        });
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

    function addTransitionHandler(nav){
        var dots = nav.getElementsByTagName('li');

        carousel.onChange = function(index,from){
            if(from !== undefined){
                dots[from].className = "dot";
            }
            
            dots[index].className = "active dot";

            if(typeof slideshow.beforeTransit === 'function') slideshow.beforeTransit();
            
            carousel.transit(index,from);
        }
    }

    function addTransitionEndHandler(elem){
        var te;

        if((te = hasTransitionEndEvent())){
            addEvent(elem,te,function(elem){
                if(typeof slideshow.afterTransit ==='function') slideshow.afterTransit();
            });
            slideshow.hasTransitionEndEvent = true;
        } else {
            slideshow.hasTransitionEndEvent = false;
        }
    }

    return SSproto;
}());

function hasTransitionEndEvent(){
    var transitionEndEvents = ['transitionend', 'webkitTransitionEnd', 'otransitionend'],
        hasTev;

    hasTev = transitionEndEvents.filter(function(m){
        return ('on'+m.toLowerCase()) in window
    });

    return hasTev[0];
}

function mergeOptions(target,source){
    for(var key in source) {
        target[key] = source[key];
    }
    
    return target;
}

function addEvent(el,ev,fn,cap){
    if(el.addEventListener){
        el.addEventListener(ev, fn, !!cap);
    } else if (elm.attachEvent){
        el.attachEvent('on' + ev, fn);
    }  else el['on' + ev] = fn;

    return el;
}


module.exports = Slideshow;