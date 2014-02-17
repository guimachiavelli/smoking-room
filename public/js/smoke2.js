var Smoke = function(canvas_id) {

	var frames = 0;
	var source = 10;
	var sources = [];
	var omx, omy;
	var mx, my;
	var mouseIsDown = true;
	var res;
	var displaySize = 512;
	var fieldRes;
	var canvas;
	var running = false;
	var start = new Date();
	var shape = [],
		iter = 0,
		field;

	makeSmokeWindow(canvas_id);

	function makeLine(start, len, arr) {
		var i;
		for (i = 0; i < len; i+=2) {
			arr.push([start[0]+i, start[1]])
		}
	}

	function makeLine2(start, len, arr) {
		var i;
		for (i = 0; i < len; i+=2) {
			arr.push([start[0], start[1]+i])
		}
	}

	function makeLine3(start, len, arr) {
		var i;
		for (i = 0; i < len; i+=2) {
			arr.push([start[0]-i, start[1]])
		}
	}

	function makeLine4(start, len, arr) {
		var i;
		for (i = 0; i < len; i+=2) {
			arr.push([start[0], start[1]-i])
		}
	}

	this.heart = function() {
		mouseIsDown = true;
		omx = mx = 250;
		omy = my = 260;
		iter = 0;
		shape = [];
		makeLine([50, 60], 100, shape);
		makeLine2([150, 60], 100, shape);
		makeLine3([150, 160], 100, shape);
		makeLine4([50, 160], 100, shape);

		shape_int = setInterval(function(){
			if (iter < shape.length) {
				sources.push([mx, my]);
				mx = shape[iter][0];
				my = shape[iter][1];
				iter++;
			}
		}, 10);

	}

	this.reset = function() {
		clearInterval(shape_int);
		sources = [];
		field.reset();
	};



	function prepareFrame(field)  {
		if (omx >= 0 && omx < displaySize && omy >= 0 && omy < displaySize) {
			var dx = mx - omx;
			var dy = my - omy;
			var length = (Math.sqrt(dx * dx + dy * dy) + 0.5) | 0;
			if (length < 1) length = 1;
			for (var i = 0; i < length; i++) {
				var x = (((omx + dx * (i / length)) / displaySize) * field.width) | 0
				var y = (((omy + dy * (i / length)) / displaySize) * field.height) | 0;
				field.setVelocity(x, y, dx, dy);
				field.setDensity(x, y, 50);
			}
			omx = mx;
			omy = my;
		}
		for (var i = 0; i < sources.length; i++) {
			var x = ((sources[i][0] / displaySize) * field.width) | 0;
			var y = ((sources[i][1] / displaySize) * field.height) | 0;
			field.setDensity(x, y, 30);
		}
	}

	function stopAnimation() {
		running = false;
		clearTimeout(interval);
	}
	function startAnimation() {
		if (running)
			return;
		running = true;
		interval = setTimeout(updateFrame, 10);
	}

	function updateFrame() {
		field.update();
		var end = new Date;
		frames++;
		if ((end - start) > 10) {
			start = end;
			frames=0;
		}
		if (running) {
			interval = setTimeout(updateFrame, 10);
		}
	}


	function makeSmokeWindow(canvas_id) {

		canvas = document.getElementById(canvas_id);
		field = new FluidField(canvas_id);
		field.setUICallback(prepareFrame, canvas_id);

		function getTopLeftOfElement(element) {
			var top = 0;
			var left = 0;

			do {
			  top += element.offsetTop;
			  left += element.offsetLeft;
			} while(element = element.offsetParent);

			return {left: left, top: top};
		}

		canvas.onmousedown = function(event) {
			var o = getTopLeftOfElement(canvas);
			omx = mx = event.clientX - o.left;
			omy = my = event.clientY - o.top;

			if (!event.altKey && event.button == 0)
				mouseIsDown = true;
			else
				sources.push([mx, my]);
			event.preventDefault();
			return false;
		}

		canvas.onmousemove = function(event) {
			var o = getTopLeftOfElement(canvas);
			mx = event.clientX - o.left;
			my = event.clientY - o.top;
		}

		startAnimation();

	}

}



