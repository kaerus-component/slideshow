# Kaerus::Component::Slideshow

TODO: Write a gem description

## Installation

Add this line to your application's Gemfile:

    gem 'kaerus-component-slideshow'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install kaerus-component-slideshow

## Usage
Include the javascript and stylesheet into the rails assets pipeline by ```//=require kaerus_component_slideshow```
Then somewhere in your view you create the slideshow markup and apply the Slideshow.js component.

Typical markup for a slideshow.
```html
	<div id="mySlides">
		<div><img src="s1.jpg"><span class="caption">Slide#1</span></div>
		<div><img src="s2.jpg"><span class="caption">Slide#2</span></div>
		<div><img src="s3.jpg"><span class="caption">Slide#3</span></div>
		<div><img src="s4.jpg"><span class="caption">Slide#4</span></div>
	</div>	
```

Create the slideshow.
```
$(document).ready(function(){
    try { 
    	new Slideshow('mySlides',{
    		time:8000,		
    		next:'&#xf054;',
    		prev:'&#xf053;',
    		beforeTransit: function(index,slideshow){ console.log("transition start", index)},
    		transition: ['left','1s']  
    	}).start();	  
	} catch (err) {
    	console.log("err");
    }    
});
```

You can use ```beforeTransit(index, slideshow)``` callback as a hook to your application.

## Customization
Override stylesheet rules.
```css
.slideshow {
    height: 24em;
}

.slideshow .nextSlide,
.slideshow .prevSlide {
    font-family: 'fontawesome';
}
```
You may override these ```.prev .next .show```classes to change the slider behaviour, i.e to make it go in different directions.
```css
	.slideshow .slides .slide.prev { left:0; top:-100%; }
	.slideshow .slides .slide.next { left:0; top:100%; }
	.slideshow .slides .slide.show { left:0; top:0%; }
```

You may also target a specific slide by its slide id.
```
	#slideshow0s1 { color:red; }
```


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
