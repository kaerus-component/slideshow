var Carousel = require('carousel'),
    Emitter = require('emitter'),
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
        transition: ['all','1s', 'linear']
    };
 
    for(var key in options) {
        this.settings[key] = options[key];
    }

    Object.defineProperty(this,'paused',{
        get: function() {
            return this.carousel.paused;
        }
    });

    /* mixin emitter */
    Emitter(this);

	this.init(container);
}

(function(){
    Slideshow.prototype = {
        init: function(container,options){
            var self = this,
                settings = this.settings,
                id = this.id = settings.id,
                slides = '\n', 
                navItems = '\n', 
                navId = id + '-nav',
                nextId = id + '-next',
                prevId = id + '-prev',
                slideId = id + '-slides',
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
            /* enable WebGL accelleration */
            applyStyle(container,'transform','translateZ(0)');
            /* add slideshow class to target container */
            if(!container.className) container.className = 'slideshow';
            else container.className+= ' slideshow';

            settings.height = container.clientHeight;
            settings.width = container.clientWidth;

            /* create newcarousel instance */
            this.carousel = new Carousel(slideId);

            this.slides = this.carousel.slides;

            this.navId = '#' + navId;

            this.slideId = '#' + slideId;

            this.nextId = '#' + nextId;

            this.prevId = '#' + prevId;

            transitionHandler(document.getElementById(navId),
                document.getElementById(slideId),
                this);  

            this.inTransition = false;

            /* autostart on initialization */
            if(this.settings.auto !== false){
                this.start(this.settings.auto === true ? 0 : this.settings.auto);
            }      

            setTimeout(function(){
                self.emit('init');
            }, 0 );

            return this;        
        },
        start: function(index){
            this.carousel.start(index,this.settings.time);
            this.emit('start');

            return this;
        },
        stop: function(){
            this.carousel.stop();
            this.emit('stop');

            return this;
        },
        pause: function(){
            this.carousel.pause();
            this.emit('pause');

            return this;
        },
        next: function(){
            this.whenReady('next');

            return this;
        },
        prev: function(){
            this.whenReady('prev');

            return this;
        },
        resume: function(){
            this.carousel.resume();
            this.emit('resume');

            return this;
        },
        show: function(x){
            if(typeof x === 'string'){
                x = x.match(/\d+$/)[0];
                x = x ? parseInt(x,10) : 0;
            }

            this.whenReady('show',x);
            
            return this;
        },
        display: function(value){
            var slides = document.getElementById(this.settings.id);

            if(typeof value === 'string') slides.style.display = value;
            else if(!!value) slides.style.display = 'block';
            else slides.style.display = 'none';

            return this;
        },
        whenReady: function(action,value){
            var self = this;

            if(!this.inTransition) {
                this.carousel[action](value);
                this.emit(action,value);
            } else {    
                this.once('transition-end', this[action], value);
            }
        }
    }


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
                return !a ? attr[b] : a + ' ' + attr[b]
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
        
        slideshow.carousel.onChange = function(index,from){
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

            function endTransition(){
                slideshow.inTransition = false;
                slideshow.emit('transition-end',slide[current],current);
            }
            
            navItems[ix].className = "active navItem";

            slideshow.carousel.transit(index,from);
        }
    }


}());

module.exports = Slideshow;