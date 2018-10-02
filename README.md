slideshow
=========

Simple slideshow component

install
=======
```
component install kaerus-component/slideshow
```

build from source
=================
You need component.js to bundle the source files.
As a prerequisite run ```npm i component -g``` if you don't already have ```component``` installed.

Then run ```make``` to install the dependencies and build into ```./build```

Run ```make gem``` to build a new version of the rubygem.

To remove all the build files run ```make distclean```


usage
=====
```html
<!doctype html>
<html>
<head>
	<title>Carousel test</title>
	<link rel="stylesheet" type="text/css" href="slideshow.css">
</head>
<body>
	<div id="mySlides">
		<div><img src="s1.jpg"><span class="caption">Slide#1</span></div>
		<div><img src="s2.jpg"><span class="caption">Slide#2</span></div>
		<div><img src="s3.jpg"><span class="caption">Slide#3</span></div>
		<div><img src="s4.jpg"><span class="caption">Slide#4</span></div>
		<div><img src="s5.jpg"><span class="caption">Slide#5</span></div>
		<div><img src="s6.jpg"><span class="caption">Slide#6</span></div>
		<div><img src="s7.jpg"><span class="caption">Slide#7</span></div>
	</div>	

	<script src="build/build.js"></script>
	<script>
		var slideshow = require('slideshow');

		slideshow('mySlides').start();
	</script>
</body>
</html>
```

