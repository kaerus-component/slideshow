var Carousel = require('carousel'),
    template = require('./template'),
    Prefix = require('prefix'),
    prefixProp = {};

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
        auto: true,
        time: 4000,
        transition: ['all','1s', 'linear'],
        beforeTransit: undefined,
        afterTransit: undefined
    };
 
    for(var key in options) {
        if(options.hasOwnProperty(key))
            this.settings[key] = options[key];
    }

    Object.defineProperty(this,'paused',{
        get: function() {
            return this.carousel.paused;
        }
    });

	this.init(container);
}

(function(){
    Slideshow.prototype = {
        init: function(container,options){
            var settings = this.settings,
                id = settings.id,
                slides = '\n', 
                navItems = '\n', 
                navId = id + '-nav',
                childs = container.childNodes;

            /* get slides from parent container */
            for(var i = 0, n = 0, l = childs.length; i < l; i++){
                if(childs[i].nodeType === 1){ 
                    slides+= '<div id="'+ id + '-s' + n + '">' + childs[i].outerHTML + '</div>\n';
                    navItems+='<li class="navItem" id="' + navId + n + '"></li>\n';
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
                    case "{nav}": return navItems;
                }
            });

            /* apply slider template */
            container.innerHTML = template;
            /* add slideshow class to target container */
            if(!container.className) container.className = 'slideshow';
            else container.className+= ' slideshow';

            settings.height = container.clientHeight;
            settings.width = container.clientWidth;

            /* create newcarousel instance */
            this.carousel = new Carousel(id+'-slides');

            this.slides = this.carousel.slides;

            attachHandlers(this);  

            /* autostart on initialization */
            if(this.settings.auto !== false){
                this.start(this.settings.auto === true ? 0 : this.settings.auto);
            }      

            return this;        
        },
        start: function(index){
            this.carousel.start(index,this.settings.time);

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

        if(!elem || !prop) return;

        prop = getStyleProperty(prop,true);

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
            navItems = nav.getElementsByTagName('li'), 
            ix, fx, lx = navItems.length;

        slideshow.carousel.onChange = function(index,from){
            ix = index % lx;
            fx = from % lx;

            if(typeof beforeTransit === 'function') 
                beforeTransit(ix, slideshow);

            if(from !== undefined){
                navItems[fx].className = "navItem";
                /* apply transitions after first slide */
                /* to avoid animations on startup */
                if(!slideshow.hasTransitions){
                    applyTransitions(document.getElementById(settings.id + '-slides'));
                    slideshow.hasTransitions = true;
                }
            }
            
            navItems[ix].className = "active navItem";

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

            applyStyle(elems,'transition',transition);
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

    function getStyleProperty(prop){
        if(!prefixProp.hasOwnProperty(prop))
            prefixProp[prop] = Prefix(prop,true);

        return prefixProp[prop];
    }

    function hasTransitionEndEvent(){
        var transitionEndEvents = ['transitionend', 'webkitTransitionEnd', 'otransitionend'], e;

        e = transitionEndEvents.filter(function(m){
            return ('on'+m.toLowerCase()) in window
        });

        return e[0];
    }

    function addEvent(el,ev,fn,cap){
        if(el.addEventListener){
            el.addEventListener(ev, fn, !!cap);
        } else if (el.attachEvent){
            el.attachEvent('on' + ev, fn);
        }  else el['on' + ev] = fn;

        return el;
    }
}());

module.exports = Slideshow;