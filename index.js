var carousel = require('carousel'),
	template = require('./template'),
	plugins = {},
	id = 0;

function Slideshow(items,options){
	this.settings = {
		next:'&rang;',
		prev:'&lang;',
		nav: {
			id:'slide',
			classname:'dot'
		},
		path:'', 
		template: template
	};

	mergeOtions(settings,options);

	/* initialize plugins */
	for(var plugin in plugins )
		plugins[plugin].apply(this);

	id++;
}

Slideshow.prototype.target = function(container){
	if(!container) container = "slideshow";

    if(typeof container === 'string')
        container = document.getElementById(container);

    if(!container) throw new Error("invalid slideshow container");

	container.innerHTML = this.render();

	return this;
};

Slideshow.prototype.render = function(){
	var content = this.settings.template,
		slides = '', slideNav = '',
		nav = this.settings.nav;

	for(var i = 0; i < this.items.length; i++){
		slides = '<li>'+slideItemToHTML(this.items[i],this.settings)+'</li>\n';
		slideNav+='<li class="'+nav.classname+'" id="'+nav.id+i+'"></li>\n';
	}

	content = content.replace(/{(\w)+}/mg,function(m){
		switch(m){
			case "{slides}": return slides;
			case "{next}": return slideshow.next;
			case "{prev}": return slideshow.prev; 
			case "{nav}": return slideNav;
		}
	}

	return content;
}

function slideItemToHTML(item,settings){
	var html = '';

	if(typeof item === 'object'){
		if(item.content) html+=content
		if(item.src) html+='<img src="'+settings.path+item.src+'">';
		if(item.caption) html+='<span class="caption">'+item.caption+'</span>'; 
	} else html = item;

	return html;
}

function mergeOptions(target,source){
    for(var key in source) {
        target[key] = source[key];
    }
    
    return target;
}

Slideshow.prototype.plugin = function(plugin,name){
	plugins[name||plugin.name] = function(){ plugin.call(this) };
}

module.exports = Slideshow;