
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("kaerus-component-carousel/index.js", function(exports, require, module){
// CAROUSEL ////////////////////////////////////////////////////////
/* element class mappings */
var CAROUSEL_SLIDE = 'slide', ACTIVE_SLIDE = 'show', NEXT_SLIDE = 'next', PREVIOUS_SLIDE = 'prev';

function Carousel(container,tag) {

    if(!container) container = "carousel";

    if(typeof container === 'string')
        container = document.getElementById(container);

    if(!container) throw new Error("invalid carousel container");

    if(tag) tag = tag.toUpperCase();

    var childs = container.childNodes;

    var nodes = this.slides = [];

    /* get child nodes from parent container */
    for(var i = 0, l = childs.length; i < l; i++){
        if(childs[i].nodeType === 1 && (!tag || childs[i].nodeName === tag)){ 
            nodes.push(childs[i]);
        }    
    }

    /* clone nodes if we have less than three childs */
    for(var i = 0; nodes.length < 3; i++){
        nodes[nodes.length] = nodes[i].cloneNode(true);
        container.appendChild(nodes[nodes.length-1]);
    }

    /* adds slide class to every element */
    addClass(nodes,CAROUSEL_SLIDE);

    var index, carousel = this;

    /* manages index updates */
    Object.defineProperty(this,'index',{
        enumerable:false,
        get: function(){
            return index;
        },
        set: function(to_index){    

            if(index === to_index) return index;

            to_index = cap(nodes.length,to_index);

            /* allows user to handle transitions */
            if(typeof carousel.onChange === 'function'){
                carousel.onChange(to_index,index);
            } else carousel.transit(to_index,index);

            return index = to_index;
        }
    })
}

/* cap the index */
function cap(max,value){
    value = value % max;
    if(value < 0) value = max + value;

    return value;
}

function addClass(node,type){  
    if(typeof type === 'string') type = [type];

    if(Array.isArray(node)){
        for(var i = 0; i < node.length; i++)
            addClass(node[i],type);
    } else {
        node.className = node.className
                            .split(' ').filter(function(f){ return type.indexOf(f) < 0 })
                            .concat(type).join(' ');
    }                        
}

function clearClass(node,type){

    if(typeof type === 'string') type = [type];

    if(Array.isArray(node)){
        for(var i = 0; i < node.length; i++)
            clearClass(node[i],type);
    } else {
        node.className = node.className
                            .split(' ')
                            .filter(function(f){ return type.indexOf(f) < 0 })
                            .reduce(function(a,b){
                                return a ? a + (b ? ' ' + b : '') : b||'';
                            },'');
    }                        
}

Carousel.prototype.next = function(){
    
    this.stop();

    this.index++;  

    return this;
}

Carousel.prototype.prev = function(){
 
    this.stop();

    this.index--;

    return this;
}

Carousel.prototype.transit = function(index,from){
    
    clearClass(this.slides,[ACTIVE_SLIDE,NEXT_SLIDE,PREVIOUS_SLIDE]);

    var prev = cap(this.slides.length,index-1),
        next = cap(this.slides.length,index+1);

    addClass(this.slides[prev], PREVIOUS_SLIDE);
    addClass(this.slides[index], ACTIVE_SLIDE);
    addClass(this.slides[next], NEXT_SLIDE);

    if(!this.paused) this.nextInterval();

    return this;
}

Carousel.prototype.nextInterval = function(){ 
    var self = this; 
    
    if(!this.timer){
        this.startTime = new Date();

        this.timer = setTimeout(function(){
            self.timer = null;
            self.next();
        },this.interval);
    }    

    return this;
}

Carousel.prototype.setInterval = function(interval){
    
    this.interval = isNaN(interval) ? (this.interval||4000): interval;

    return this;
}

Carousel.prototype.show = function(index){
    index = isNaN(index) ? this.index : index;
    
    this.stop();

    this.index = index; 

    return this;
};

Carousel.prototype.start = function(index,interval){  
    
    this.paused = undefined;

    this.setInterval(interval);

    this.show(index);
    
    return this;
};

Carousel.prototype.stop = function(){

    this.startTime = null;

    if(this.timer){
        clearTimeout(this.timer);
        this.timer = null;
    }    

    return this;
}

Carousel.prototype.pause = function(skipPauseInterval){

    this.paused = true;

    if(this.startTime && !skipPauseInterval) {
        this.pauseInterval = new Date() - this.startTime;
    }

    this.stop();

    return this;
}

Carousel.prototype.resume = function(skipPauseInterval){
    
    this.paused = false;

    if(skipPauseInterval || !this.pausesInterval) {
        this.nextInterval();
    } else {
        var interval = this.interval;

        /* resume from paused interval */
        this.setInterval(this.pauseInterval).nextInterval();

        this.interval = interval;
    }

    this.pauseInterval = null;

    return this;
}

module.exports = Carousel;
});
require.register("slideshow/index.js", function(exports, require, module){
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
});
require.register("slideshow/template.js", function(exports, require, module){
module.exports = '<div class="slides" id="{id}">{slides}</div>\n<div class="nextSlide" id="{id}next">{next}</div>\n<div class="prevSlide" id="{id}prev">{prev}</div>\n<div class="navSlide" id="{id}nav"><ul>{nav}</ul></div>\n	';
});
require.alias("kaerus-component-carousel/index.js", "slideshow/deps/carousel/index.js");
require.alias("kaerus-component-carousel/index.js", "carousel/index.js");
