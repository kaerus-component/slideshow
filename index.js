/*global require module setTimeout clearTimeout */
var Emitter = require('emitter'),
    Prefix = require('prefix'),
    prefixProp = {};


module.exports = (function(){
    var SLIDE_CLASS = 'slide', ACTIVE_SLIDE = 'show', NEXT_SLIDE = 'next', PREVIOUS_SLIDE = 'prev';

    var template = '';

    template+='<div class="slides" id="{id}-slides">{slides}</div>';
    template+='<div class="nextSlide" id="{id}-next">{next}</div>';
    template+='<div class="prevSlide" id="{id}-prev">{prev}</div>';
    template+='<div class="navSlide" id="{id}-nav"><ul>{nav}</ul></div>';
    
    /* helper for adding class */
    function addClass(node,type){  
	if(typeof type === 'string') type = [type];

	if(Array.isArray(node)){
	    for(var i = 0; i < node.length; i++)
		addClass(node[i],type);
	} else {
	    node.className = node.className
		.split(' ').filter(function(f){ return type.indexOf(f) < 0; })
		.concat(type).join(' ');
	}                        
    }

    /* helper for removing class */
    function clearClass(node,type){

	if(typeof type === 'string') type = [type];

	if(Array.isArray(node)){
	    for(var i = 0; i < node.length; i++)
		clearClass(node[i],type);
	} else {
	    node.className = node.className
		.split(' ')
		.filter(function(f){ return type.indexOf(f) < 0; })
		.reduce(function(a,b){
                    return a ? a + (b ? ' ' + b : '') : b||'';
		},'');
	}                        
    }


    /* cap the index */
    function cap(max,value){
	value = value % max;
	
	if(value < 0) value = max + value;

	return value;
    }
    
    function Slideshow(container,options){
	if(!(this instanceof Slideshow))
	    return new Slideshow(container,options);

	/* mixin emitter */
	Emitter(this);
	
	var self = this;
	
	if(typeof container === 'string')
	    container = document.getElementById(container);

	if(!container) throw new Error("invalid slideshow container");

	var id = container.id || 'slideshow';
	
	this.settings = {
	    id: id,
	    template: template,
	    next:'&rang;',
	    prev:'&lang;',
	    auto: true,
	    time: 4000,
	    transition: ['all','1s', 'linear']
	};

	for(var key in options) {
	    this.settings[key] = options[key];
	}

	var wrapper = '\n',
	    navItems = '\n',
	    navId = id + '-nav',
	    nextId = id + '-next',
	    prevId = id + '-prev',
	    slideId = id + '-slides',
	    childs = container.childNodes;

	/* get slides from parent container */
	for(var i = 0, n = 0, l = childs.length; i < l; i++){
	    if(childs[i].nodeType === 1){
		wrapper+= '<div id="'+ id + '-s' + n + '">' + childs[i].outerHTML + '</div>\n';
		navItems+='<li class="navItem" id="' + navId + n + '"></li>\n';
		n++;
	    }
	}

	/* create dom structure from template */
	var slider = template.replace(/{\w+}/mg,function(m){
            switch(m){
            case "{id}": return id;
            case "{slides}": return wrapper;
            case "{next}": return self.settings.next;
            case "{prev}": return self.settings.prev;
            case "{nav}": return navItems;
            }
        });

	/* apply slider template */
	container.innerHTML = slider;
	
	/* add slideshow class to target container */
	if(!container.className) container.className = 'slideshow';
	else container.className+= ' slideshow';

	this.settings.height = container.clientHeight;
	this.settings.width = container.clientWidth;

	this.id = slideId;
	this.navId = '#' + navId;
	this.slideId = '#' + slideId;
	this.nextId = '#' + nextId;
	this.prevId = '#' + prevId;

	var tag = this.settings['tag'];

	if(tag) tag = tag.toUpperCase();

	var slides_container = document.getElementById(slideId);
	
	var slideNodes = slides_container.childNodes;
	
	this.slides = [];
	
	/* get slides from container */
	for(i = 0, l = slideNodes.length; i < l; i++){
	    if(slideNodes[i].nodeType === 1 && (!tag || slideNodes[i].nodeName === tag)){ 
		this.slides.push(slideNodes[i]);
	    }    
	}

	/* clone some nodes if we have to few slides */
	var min_slides;
	if(this.slides.length === 3) min_slides = 6;
	else min_slides = 4;
	
	for(i = 0; this.slides.length < min_slides; i++){
	    this.slides[this.slides.length] = this.slides[i].cloneNode(true);
	    container.appendChild(this.slides[this.slides.length-1]);
	}

	/* adds slide class to every element */
	addClass(this.slides,SLIDE_CLASS);

	var index;

	/* manages index updates */
	Object.defineProperty(this,'index',{
	    enumerable:false,
	    get: function(){
		return index;
	    },
	    set: function(to_index){    

		if(index === to_index) return index;

		to_index = cap(self.slides.length,to_index);

		/* allows user to handle transitions */
		if(typeof self.onChange === 'function'){
		    self.onChange(to_index,index);
		} else self.transit(to_index,index);

		return index = to_index;
	    }
	});

	transitionHandler(document.getElementById(navId),
                          document.getElementById(slideId),
                          this);

	this.inTransition = false;

	/* initialize slideshow */
	this.init();
    }

    Slideshow.prototype = {
	init: function(){
	    var self = this;
	    
	    /* autostart on initialization */
	    if(this.settings.auto !== false){
		this.start(this.settings.auto === true ? 0 : this.settings.auto);
	    }

	    setTimeout(function(){
		self.emit('init');
            }, 0 );

	    return this;
	},
	getSlide: function(offset, pos){
	    var index = pos !== undefined ? offset : this.index,
		slide = cap(this.slides.length,offset+pos);

	    return this.slides[slide];
	},
	start: function(index,interval){
	    interval = interval || this.settings.time;
	    
	    this.paused = undefined;
	    this.setInterval(interval);
	    this.show(index);
            this.emit('start');

            return this;
        },
	stop: function(){
	    this.startTime = null;

	    if(this.timer){
		clearTimeout(this.timer);
		this.timer = null;
	    }    

	    this.emit('stop');

	    return this;
	},
	pause: function(skipPauseInterval){
	    this.paused = true;

	    if(this.startTime && !skipPauseInterval) {
		this.pauseInterval = new Date() - this.startTime;
	    }

	    this.stop().emit('pause');

            return this;
	},
	next: function(){
	    this.action('next');

	    return this;
	},
	prev: function(){
            this.action('prev');

            return this;
        },
	setInterval: function(interval){
	    this.interval = isNaN(interval) ? (this.interval||4000): interval;

	    return this;
	},
	nextInterval: function(){ 
	    var self = this; 
	    
	    if(!this.timer){
		this.startTime = new Date();

		this.timer = setTimeout(function(){
		    self.timer = null;
		    self.next();
		},this.interval);
	    }    

	    return this;
	},
	resume: function(skipPauseInterval){
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
	    this.emit('resume');
	    
	    return this;
	},
	show: function(x){

	    if(typeof x === 'string'){
		x = x.match(/\d+$/)[0];
		x = x ? parseInt(x,10) : 0;
	    }

	    this.action('show',x);

	    return this;
	},
	display: function(value){
	    var slides = document.getElementById(this.settings.id);

	    if(typeof value === 'string') slides.style.display = value;
	    else if(!!value) slides.style.display = 'block';
	    else slides.style.display = 'none';

	    return this;
	},
	action: function(action,value){
            var self = this;

            if(!this.inTransition) {
		switch(action){
		case 'next':
		    this.stop().index++;
		    break;
		case 'prev':
		    this.stop().index--;
		    break;
		case 'show':
		    value = isNaN(value) ? this.index : value;
		    this.stop().index = value; 
		    break;
		}

                this.emit(action,value);
            } else {
                this.once('transition-end', this[action], value);
            }
        },
	transit: function(index,from){
	    
	    clearClass(this.slides,[ACTIVE_SLIDE,NEXT_SLIDE,PREVIOUS_SLIDE]);

	    var prev = cap(this.slides.length,index-1),
		next = cap(this.slides.length,index+1);

	    addClass(this.slides[prev], PREVIOUS_SLIDE);
	    addClass(this.slides[index], ACTIVE_SLIDE);
	    addClass(this.slides[next], NEXT_SLIDE);

	    if(!this.paused) this.nextInterval();

	    return this;
	}

    };


    function applyStyle(elem,prop,attr){
	var style = '';

	if(typeof elem === 'string')
	    elem = document.getElementById(elem);

	if(!elem || !prop) return;

	prop = Prefix.dash(prop);

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
		return !a ? attr[b] : a + ' ' + attr[b];
	    },null);
	} else if(typeof attr === 'function'){
	    style = attr(elem.id);
	}

	elem.style[prop] = style;
    }

    function transitionHandler(nav,slides,slideshow){
	var settings = slideshow.settings,
	    navItems = nav.getElementsByTagName('li'),
	    timer, durationProp, s = 0,
	    ix, fx, lx = navItems.length, slide = [], node;

	durationProp = 'transition-duration';

	for(var x in slides.childNodes){
	    node = slides.childNodes[x];
	    if(node && node.id && node.id.indexOf(settings.id + '-s') === 0)
		slide[s++] = node;
	}

	applyStyle(slide,'transition',settings.transition);

	slideshow.onChange = function(index,from){
	    var current;

            ix = index % lx;
	    fx = from % lx;

	    slideshow.emit('transition',slide[ix],ix);

	    if(from !== undefined){
		slideshow.inTransition = true;

		navItems[fx].className = "navItem";

		s = window.getComputedStyle(slide[ix],null).getPropertyValue(durationProp);

		if(s.indexOf('s') > 0) s = parseInt(s,10) * 1000;
		else s = parseInt(s,10);

		current = ix;

		if(s){
		    /* note: workaround for problematic transition-end event */
		    timer = setTimeout(function(){
                        slideshow.inTransition = false;
                        slideshow.emit('transition-end',slide[current],current);
                    },s);
		}
	    }

	    navItems[ix].className = "active navItem";

	    slideshow.transit(index,from);
	};
    }

    return Slideshow;
}(this));
