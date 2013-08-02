jquery-polyline
=======================================================================
A jQuery UI widget for drawing polylines. Uses HTML5 canvas. __[Live demo](http://cyberic.github.io/jquery-polyline)__.

Requirements
-----------------------------------------------------------------------
* jQuery (version 2.0 or higher is recommended).
* jQuery UI (version 1.10 is recommended).
* A modern browser that supports HTML5 canvas.

Usage
-----------------------------------------------------------------------
1. Include jQuery and jQuery UI. Example:
```
	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
```

2. Include the plugin after jQuery and jQuery UI: 
```
	<script src="jquery.polyline.js"></script>
```
Please do __not__ include the script directly from GitHub.

3. Create a canvas:
```
<canvas width="420" height="420" id="polyline">Your browser does not support HTML5 Canvas.</canvas>
```
	
4. Call the plugin from your `document.ready` call. Example with the default settings:
```
$(document).ready(function() { 
	$('#polyline').polyline();
});
```

Options
-----------------------------------------------------------------------
The following options can be passed to the plugin:

```
$(...).polyline({
	max_x: 10,
	max_y: 10,
	min_dot_diff: 0.1,
	padding_top: 15,
	padding_right: 15,
	padding_bottom: 25,
	padding_left: 25,
	stroke_count: 10,
	stroke_size: 7,
	stroke_width: 1,
	stroke_shift: 4,
	stroke_text_font_style: 'bold',
	stroke_text_font_name: 'sans-serif',
	stroke_text_font_size: 14,
	stroke_text_hshift: 5,
	stroke_text_vshift: 18,
	stroke_text_precision: 2,
	line_width: 2,
	axis_width: 1,
	dot_radius: 4,
	dot_pick_radius_addition: 3,
	dots: []
});
```

Callbacks
-----------------------------------------------------------------------
`change` — a function to call whenever the user changes the polyline. See [demo.html](demo.html) for usage example.

Credits & license
-------------------------------------------------------------------------
Written by [@Forkest](https://github.com/Forkest) for [Cyberic](http://cyberic.eu).

Freely distributable under the terms of the MIT license.