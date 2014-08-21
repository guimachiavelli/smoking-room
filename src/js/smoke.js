(function(){
	'use strict';

	var FluidField = require('./fluid')

	var Smoke = function(canvas_id) {
		var shape_int = null;
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

		function makeLine(start, len, axis, dir) {
			var i, arr = [];

			for (i = 0; i < len; i+=2) {
				if (axis === 'x') {
					if (dir === '-') {
						arr.push([start[0]+i, start[1]])
					} else {
						arr.push([start[0]-i, start[1]])
					}
				} else if (axis === 'y') {
					if (dir === '-') {
						arr.push([start[0], start[1]+i])
					} else {
						arr.push([start[0], start[1]-i])
					}
				} else if (axis === 'both') {
					if (dir === '-') {
						arr.push([start[0]+i, start[1]+i])
					} else if (dir === '+ -'){
						arr.push([start[0]-i, start[1]+i])
					} else if (dir === '- +'){
						arr.push([start[0]+i, start[1]-i])
					} else if (dir === '+'){
						arr.push([start[0]-i, start[1]-i])
					}
				}

			}

			return arr;

		}

		function circle(centerX, centerY, radius) {

			// an array to save your points
			var points=[], degree;

			for(degree = 0; degree < 360; degree++){
				var radians = degree * Math.PI/180;
				var x = centerX + radius * Math.cos(radians);
				var y = centerY + radius * Math.sin(radians);
				points.push([x, y]);
			}

			return points;

		}

		function halfcircle(centerX, centerY, radius) {

			// an array to save your points
			var points=[], degree;

			for(degree = 0; degree < 180; degree++){
				var radians = degree * Math.PI/-180;
				var x = centerX + radius * Math.cos(radians);
				var y = centerY + radius * Math.sin(radians);
				points.push([x, y]);
			}

			return points;

		}




		this.lol = function() {
			var temp, temp2, temp3, temp4, temp5;
			mouseIsDown = true;
			omx = mx = 70;
			omy = my = 80;
			iter = 0;
			shape = [[omx, omy]];
			temp = makeLine([100, 80], 100, 'y', '-');
			temp2 = makeLine([100, 180], 50, 'x', '-');
			temp3 = circle(210, 125, 50);
			temp4 = makeLine([280, 80], 100, 'y', '-');
			temp5 = makeLine([280, 180], 50, 'x', '-');

			while (temp.length) {
				shape.push(temp.shift());
			}

			while (temp2.length) {
				shape.push(temp2.shift());
			}

			while (temp3.length) {
				shape.push(temp3.shift());
			}

			while (temp4.length) {
				shape.push(temp4.shift());
			}

			while (temp5.length) {
				shape.push(temp5.shift());
			}




			shape_int = setInterval(function(){
				if (iter < shape.length) {
					sources.push([mx, my]);
					mx = shape[iter][0];
					my = shape[iter][1];
					iter++;
				}
			}, 10);
		};


		this.start = function() {
			mouseIsDown = true;
			omx = mx = 70;
			omy = my = 80;
			var _this = this;


			var temp = makeLine([50, 150], Math.random() * 100, 'y', '+'), shape2 = [], i = 0,
				temp2 = makeLine([0, 350], Math.random() * 100, 'y', '-'),
				temp3 = circle(455, Math.random() * 20 + 15, 10);

			while (temp.length) {
				shape2.push(temp.shift());
			}

			while (temp2.length) {
				shape2.push(temp2.shift());
			}

			while (temp3.length) {
				shape2.push(temp3.shift());
			}




			setInterval(function(){
				if (i < shape2.length) {
					sources.push([mx, my]);
					mx = shape2[i][0];
					my = shape2[i][1];
					i++;
				}
			}, 10);

			setTimeout(function(){

				_this.reset();
				_this.start();
			}, 30000);

		};

		this.heart = function() {

			mouseIsDown = true;
			omx = mx = 70;
			omy = my = 80;
			var _this = this;


			var temp = makeLine([220, 250], 100, 'both', '+'), shape2 = [], i = 0,
				temp4 = halfcircle(170, 150, 50),
				temp3 = halfcircle(270, 150, 50),
				temp2 = makeLine([220, 250], 100, 'both', '- +');


			while (temp.length) {
				shape2.push(temp.shift());
			}

			while (temp2.length) {
				shape2.push(temp2.shift());
			}

			while (temp3.length) {
				shape2.push(temp3.shift());
			}

			while (temp4.length) {
				shape2.push(temp4.shift());
			}

			setInterval(function(){
				if (i < shape2.length) {
					sources.push([mx, my]);
					mx = shape2[i][0];
					my = shape2[i][1];
					i++;
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
			window.interval = setTimeout(updateFrame, 10);
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
				window.interval = setTimeout(updateFrame, 10);
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

	module.exports = Smoke;

}());
