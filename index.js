var Carousel = require('carousel'),
    template = require('./template'),
    id = 0;

var transitionProp = ['webkitTransition','mozTransition','msTransition','oTransition'],
    transformProp = ['webkitTransform','mozTransform','msTransoform','oTransform'];


function Slideshow(container,options){
	if(!(this instanceof Slideshow))
		return new Slideshow(container,options);

    if(typeof container === 'string')
        container = document.getElementById(container);

    if(!container) throw new Error("invalid slideshow container");

    var settings = {
        id: 'slideshow' + id,
        template: template,
        next:'&rang;',
        prev:'&lang;',
        time: 4000,
        transition: ['all','1s'],
        beforeTransit: undefined,
        afterTransit: undefined
    };
 
    mergeOptions(settings,options);
    mergeOptions(this,settings);

	this.init(container);
}

Slideshow.prototype = (function(){
	var carousel, slideshow;

	SSproto = {
		init: function(container,options){
            slideshow = this;

            setup(container);

            return this;		
        },
        start: function(){
            carousel.start(0,slideshow.time);

            return this;
        },
        stop: function(){
            carousel.stop();

            return this;
        },
        pause: function(){
            carousel.pause();

            return this;
        },
        next: function(){
            carousel.next();

            return this;
        },
        previous: function(){
            carousel.prev();

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

        /* create dom structure from template */
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
        /* add slideshow class to target container */
        if(!container.className) container.className = 'slideshow';
        else container.className+= ' slideshow';

        /* create newcarousel instance */
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

    function applyStyle(elem,prop,attr){
        var style = '';

        if(typeof elem === 'string')
            elem = document.getElementById(elem);

        if(!elem) return;

        if(Array.isArray.prop){
            prop = getStyleProperty(prop);
        }

        if(!prop) return;

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
            if(typeof slideshow.beforeTransit === 'function') slideshow.beforeTransit();

            if(from !== undefined){
                dots[from].className = "dot";
                /* apply transitions after first slide */
                /* to avoid animations on startup */
                if(!slideshow.hasTransitions){
                    for(var i = 0, l = carousel.slides.length; i < l; i++)
                        applyStyle(slideshow.id + 's' + i,transitionProp,slideshow.transition);
                    slideshow.hasTransitions = true;
                }
            }
            
            dots[index].className = "active dot";
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