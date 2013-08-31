slideshow
=========

Simple slideshow component

install
=======
```
component install kaerus-component/slideshow
```

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

