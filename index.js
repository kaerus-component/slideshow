var Carousel = require('carousel'),
    template = require('./template');

function Slideshow(container,options){
	if(!(this instanceof Slideshow))
		return new Slideshow(container,options);

    if(typeof container === 'string')
        container = document.getElementById(container);

    if(!container) throw new Error("invalid slideshow container");

    this.settings = {
        id: container.id || 'slideshow',
        template: template,
        next:'&rang;',
        prev:'&lang;',
        time: 4000,
        transition: ['all','1s'],
        beforeTransit: undefined,
        afterTransit: undefined
    };
 
    mergeOptions(this.settings,options);

    Object.defineProperty(this,'paused',{
        get: function() {
            return this.carousel.paused;
        }
    });

	this.init(container);
}

Slideshow.prototype = {
        init: function(container,options){
            var settings = this.settings,
                id = settings.id,
                slides = '\n', 
                dots = '\n', 
                navId = id + '-nav',
                childs = container.childNodes;

            /* get slides from parent container */
            for(var i = 0, n = 0, l = childs.length; i < l; i++){
                if(childs[i].nodeType === 1){ 
                    slides+= '<div id="'+ id + '-s' + n + '">' + childs[i].outerHTML + '</div>\n';
                    dots+='<li class="dot" id="' + navId + n + '"></li>\n';
                    n++;
                }    
            }

            /* create dom structure from template */
            var template = settings.template.replace(/{\w+}/mg,function(m){
                switch(m){
                    case "{id}": return id;
                    case "{slides}": return slides;
                    case "{next}": return settings.next;
                    case "{prev}": return settings.prev; 
                    case "{nav}": return dots;
                }
            });

            /* apply slider template */
            container.innerHTML = template;
            /* add slideshow class to target container */
            if(!container.className) container.className = 'slideshow';
            else container.className+= ' slideshow';

            /* create newcarousel instance */
            this.carousel = new Carousel(id+'-slides');

            this.slides = this.carousel.slides;

            attachHandlers(this);        

            return this;        
        },
        start: function(){
            this.carousel.start(0,this.settings.time);

            return this;
        },
        stop: function(){
            this.carousel.stop();

            return this;
        },
        pause: function(){
            this.carousel.pause();

            return this;
        },
        next: function(){
            this.carousel.next();

            return this;
        },
        prev: function(){
            this.carousel.prev();

            return this;
        },
        resume: function(){
            this.carousel.resume();

            return this;
        },
        show: function(x){
            this.carousel.show(x);

            return this;
        },
        display: function(value){
            var slides = document.getElementById(this.settings.id);

            if(typeof value === 'string') slides.style.display = value;
            else if(!!value) slides.style.display = 'block';
            else slides.style.display = 'none';

            return this;
        }
}


    var transitionProp = ['webkitTransition','mozTransition','msTransition','oTransition'],
    transitionEndEvents = ['transitionend', 'webkitTransitionEnd', 'otransitionend'],
    transformProp = ['webkitTransform','mozTransform','msTransform','oTransform'];


    function attachHandlers(slideshow){
        var id = slideshow.settings.id,
            slides = document.getElementById(id+'-slides'),
            nav = document.getElementById(id+'-nav'),
            next = document.getElementById(id+'-next'),
            prev = document.getElementById(id+'-prev');

        /* add slidshow UI handlers */
        addNavHandler(nav,slideshow);
        addPauseHandler(slides);
        addTransitionHandler(nav, slides, slideshow);

        addEvent(next,'click',function(event){
            slideshow.next();
            event.stopPropagation();
        }); 

        addEvent(prev,'click',function(event){
            slideshow.prev();
            event.stopPropagation();
        }); 
    }

    function applyStyle(elem,prop,attr){
        var style = '';

        if(typeof elem === 'string')
            elem = document.getElementById(elem);

        if(!elem) return;

        if(Array.isArray(prop)){
            prop = getStyleProperty(prop);
        }

        if(!prop) return;

        if(Array.isArray(elem)){
            for(var i = 0, l = elem.length; i < l; i++)
                applyStyle(elem[i],prop,attr);

            return;
        }

        if(typeof attr == 'string'){
            style = attr;
        }
        if(Array.isArray(attr)){
            style = attr.join(' ');
        } else if(typeof attr === 'object'){
            style = Object.keys(attr).reduce(function(a,b){
                return !a ? attr[b] : a + ' ' + attr[b]
            },null);
        } else if(typeof attr === 'function'){
            style = attr(elem.id);
        }
          
        elem.style[prop] = style; 
    }

    function addNavHandler(elem,slideshow){
        var nav = document.getElementById(slideshow.settings.id+'-nav'),
            matchNav = new RegExp(elem.id + '(\\d+)');

        addEvent(elem,'click', function(event){
            event = event ? event : window.event;
            var target = event.target || event.srcElement,
                ix = matchNav.exec(target.id);

            if(ix) {
                slideshow.show(ix[1]);
                event.stopPropagation();
            }	
        });
    }

    /* adds click handler on slide to toggle pause */
    function addPauseHandler(elem,slideshow){
        elem.addEventListener('click',function(event){
            if(slideshow.paused) {
                slideshow.resume();
            } else {
                slideshow.pause();
            }
        });
    }

    function addTransitionHandler(nav,slides,slideshow){
        var settings = slideshow.settings,
            transition = settings.transition,
            beforeTransit = settings.beforeTransit,
            afterTransit = settings.afterTransit,
            dots = nav.getElementsByTagName('li'), 
            ix, fx, lx = dots.length;

        slideshow.carousel.onChange = function(index,from){
            ix = index % lx;
            fx = from % lx;

            if(typeof beforeTransit === 'function') 
                beforeTransit(ix, slideshow);

            if(from !== undefined){
                dots[fx].className = "dot";
                /* apply transitions after first slide */
                /* to avoid animations on startup */
                if(!slideshow.hasTransitions){
                    applyTransitions(document.getElementById(settings.id + '-slides'));
                    slideshow.hasTransitions = true;
                }
            }
            
            dots[ix].className = "active dot";

            slideshow.carousel.transit(index,from);
        }

        addTransitionEndHandler(slides);

        function applyTransitions(container){
            var childs = container.childNodes, elems = [];

            for(var i = 0, l = childs.length; i < l; i++){
                if(childs[i].nodeType === 1){
                    elems.push(childs[i]);      
                }    
            }

            applyStyle(elems,transitionProp,transition);
        }

        function addTransitionEndHandler(elem){
            var te, index = slideshow.carousel.index, x = index % lx;

            if((te = hasTransitionEndEvent())){
                addEvent(elem,te,function(event){
                    event = event ? event : window.event;
                    var target = event.target || event.srcElement,
                        target_id = slideshow.id + '-s' + index;
                    // fixme: fires twice
                    if(target.id === target_id && typeof afterTransit ==='function'){ 
                        afterTransit(x, slideshow);
                    }   
                });
                slideshow.hasTransitionEndEvent = true;
            } else {
                slideshow.hasTransitionEndEvent = false;
            }
        }

    }

    transitionProp = getStyleProperty(transitionProp);
    transformProp = getStyleProperty(transformProp);

    function getStyleProperty(props){
        var root = document.documentElement, 
            prop;

        prop = props.filter(function(p){
            return p in root.style
        });

        return prop[0]
    }

    function hasTransitionEndEvent(){
        var hasTev;

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
        } else if (el.attachEvent){
            el.attachEvent('on' + ev, fn);
        }  else el['on' + ev] = fn;

        return el;
    }


module.exports = Slideshow;