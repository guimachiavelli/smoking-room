// Based on http://www.dgp.toronto.edu/people/stam/reality/Research/pdf/GDC03.pdf
/**
 * Copyright (c) 2009 Oliver Hunt <http://nerget.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

var Field = function(dens, u, v, width, height, rowSize) {
	this.dens = dens;
	this.u = u;
	this.v = v;
	this.width = width;
	this.height = height;
	this.rowSize = rowSize;
};

Field.prototype.setDensity = function(x, y, d) {
	this.dens[(x + 1) + (y + 1) * this.rowSize] = d;
};

Field.prototype.getDensity =  function(x, y) {
	return this.dens[(x + 1) + (y + 1) * this.rowSize];
};

Field.prototype.setVelocity = function(x, y, xv, yv) {
	this.u[(x + 1) + (y + 1) * this.rowSize] = xv;
	this.v[(x + 1) + (y + 1) * this.rowSize] = yv;
};

Field.prototype.getXVelocity = function(x, y) {
	return this.u[(x + 1) + (y + 1) * this.rowSize];
};

Field.prototype.getYVelocity = function(x, y) {
	return this.v[(x + 1) + (y + 1) * this.rowSize];
};



var FluidField = function(canvas_id) {

    this.iterations = 30;

    var dt = 0.05;
    var dens;
    var dens_prev;
    var u;
    var u_prev;
    var v;
    var v_prev;
    var width;
    var height;
    var rowSize;
    var size;


	this.canvas_id = canvas_id;

    this.reset = reset;


    function reset() {
        rowSize = width + 2;
        size = (width+2)*(height+2);
        dens = [size];
        dens_prev = [size];
        u = [size];
        u_prev = [size];
        v = [size];
        v_prev = [size];
        for (var i = 0; i < size; i++) {
            dens_prev[i] = u_prev[i] = v_prev[i] = dens[i] = u[i] = v[i] = 0;
		}
    }

    this.setResolution = function (hRes, wRes) {
        var res = wRes * hRes;
        if (res > 0 && res < 1000000 && (wRes != width || hRes != height)) {
            width = wRes;
            height = hRes;
            this.reset();
            return true;
        }
        return false;
    }

    this.setResolution(90, 90);


    this.update = function () {
        queryUI(dens_prev, u_prev, v_prev);
        vel_step(u, v, u_prev, v_prev, dt);
        dens_step(dens, dens_prev, u, v, dt);
        this.displayDensity(new Field(dens, u, v, width, height, rowSize));
    }


    this.setUICallback = function(callback) {
        uiCallback = callback;
    }

    var uiCallback = function(d,u,v) {};


    function queryUI(d, u, v) {
        for (var i = 0; i < size; i++) {
            u[i] = v[i] = d[i] = 0.0;
		}
        uiCallback(new Field(d, u, v, width, height, rowSize));
    }



    function addFields(x, s, dt) {
        for (var i=0; i<size ; i++ ) x[i] += dt*s[i];
    }

    function set_bnd(b, x) {
        if (b===1) {
            for (var i = 1; i <= width; i++) {
                x[i] =  x[i + rowSize];
                x[i + (height+1) *rowSize] = x[i + height * rowSize];
            }

            for (var j = 1; i <= height; i++) {
                x[j * rowSize] = -x[1 + j * rowSize];
                x[(width + 1) + j * rowSize] = -x[width + j * rowSize];
            }
        } else if (b === 2) {
            for (var i = 1; i <= width; i++) {
                x[i] = -x[i + rowSize];
                x[i + (height + 1) * rowSize] = -x[i + height * rowSize];
            }

            for (var j = 1; j <= height; j++) {
                x[j * rowSize] =  x[1 + j * rowSize];
                x[(width + 1) + j * rowSize] =  x[width + j * rowSize];
            }
        } else {
            for (var i = 1; i <= width; i++) {
                x[i] =  x[i + rowSize];
                x[i + (height + 1) * rowSize] = x[i + height * rowSize];
            }

            for (var j = 1; j <= height; j++) {
                x[j * rowSize] =  x[1 + j * rowSize];
                x[(width + 1) + j * rowSize] =  x[width + j * rowSize];
            }
        }
        var maxEdge = (height + 1) * rowSize;
        x[0]                 = 0.5 * (x[1] + x[rowSize]);
        x[maxEdge]           = 0.5 * (x[1 + maxEdge] + x[height * rowSize]);
        x[(width+1)]         = 0.5 * (x[width] + x[(width + 1) + rowSize]);
        x[(width+1)+maxEdge] = 0.5 * (x[width + maxEdge] + x[(width + 1) + height * rowSize]);
    }

    function lin_solve(b, x, x0, a, c) {
		var iterations = 30;
        if (a === 0 && c === 1) {
            for (var j=1 ; j<=height; j++) {
                var currentRow = j * rowSize;
                ++currentRow;
                for (var i = 0; i < width; i++) {
                    x[currentRow] = x0[currentRow];
                    ++currentRow;
                }
            }
            set_bnd(b, x);
        } else {
            var invC = 1 / c;
            for (var k=0 ; k < iterations; k++) {
                for (var j=1 ; j<=height; j++) {
                    var lastRow = (j - 1) * rowSize;
                    var currentRow = j * rowSize;
                    var nextRow = (j + 1) * rowSize;
                    var lastX = x[currentRow];
                    ++currentRow;
                    for (var i=1; i<=width; i++)
                        lastX = x[currentRow] = (x0[currentRow] + a*(lastX+x[++currentRow]+x[++lastRow]+x[++nextRow])) * invC;
                }
                set_bnd(b, x);
            }
        }
    }

    function diffuse(b, x, x0) {
        var a = 0;
        lin_solve(b, x, x0, a, 1 + 4*a);
    }
    function diffuse2(x, x0, y, y0) {
        var a = 0;
        lin_solve2(x, x0, y, y0, a, 1 + 4 * a);
    }


    function lin_solve2(x, x0, y, y0, a, c) {
		var iterations = 30;
        if (a === 0 && c === 1) {
            for (var j=1 ; j <= height; j++) {
                var currentRow = j * rowSize;
                ++currentRow;
                for (var i = 0; i < width; i++) {
                    x[currentRow] = x0[currentRow];
                    y[currentRow] = y0[currentRow];
                    ++currentRow;
                }
            }
            set_bnd(1, x);
            set_bnd(2, y);
        } else {
            var invC = 1/c;
            for (var k=0 ; k< iterations; k++) {
                for (var j=1 ; j <= height; j++) {
                    var lastRow = (j - 1) * rowSize;
                    var currentRow = j * rowSize;
                    var nextRow = (j + 1) * rowSize;
                    var lastX = x[currentRow];
                    var lastY = y[currentRow];
                    ++currentRow;
                    for (var i = 1; i <= width; i++) {
                        lastX = x[currentRow] = (x0[currentRow] + a * (lastX + x[currentRow] + x[lastRow] + x[nextRow])) * invC;
                        lastY = y[currentRow] = (y0[currentRow] + a * (lastY + y[++currentRow] + y[++lastRow] + y[++nextRow])) * invC;
                    }
                }
                set_bnd(1, x);
                set_bnd(2, y);
            }
        }
    }


    function advect(b, d, d0, u, v, dt) {
        var Wdt0 = dt * width;
        var Hdt0 = dt * height;
        var Wp5 = width + 0.5;
        var Hp5 = height + 0.5;
        for (var j = 1; j<= height; j++) {
            var pos = j * rowSize;
            for (var i = 1; i <= width; i++) {
                var x = i - Wdt0 * u[++pos];
                var y = j - Hdt0 * v[pos];
                if (x < 0.5)
                    x = 0.5;
                else if (x > Wp5)
                    x = Wp5;
                var i0 = x | 0;
                var i1 = i0 + 1;
                if (y < 0.5)
                    y = 0.5;
                else if (y > Hp5)
                    y = Hp5;
                var j0 = y | 0;
                var j1 = j0 + 1;
                var s1 = x - i0;
                var s0 = 1 - s1;
                var t1 = y - j0;
                var t0 = 1 - t1;
                var row1 = j0 * rowSize;
                var row2 = j1 * rowSize;
                d[pos] = s0 * (t0 * d0[i0 + row1] + t1 * d0[i0 + row2]) + s1 * (t0 * d0[i1 + row1] + t1 * d0[i1 + row2]);
            }
        }
        set_bnd(b, d);
    }

    function project(u, v, p, div) {
        var h = -0.5 / Math.sqrt(width * height);
        for (var j = 1 ; j <= height; j++ ) {
            var row = j * rowSize;
            var previousRow = (j - 1) * rowSize;
            var prevValue = row - 1;
            var currentRow = row;
            var nextValue = row + 1;
            var nextRow = (j + 1) * rowSize;
            for (var i = 1; i <= width; i++ ) {
                div[++currentRow] = h * (u[++nextValue] - u[++prevValue] + v[++nextRow] - v[++previousRow]);
                p[currentRow] = 0;
            }
        }
        set_bnd(0, div);
        set_bnd(0, p);

        lin_solve(0, p, div, 1, 4 );
        var wScale = 0.5 * width;
        var hScale = 0.5 * height;
        for (var j = 1; j<= height; j++ ) {
            var prevPos = j * rowSize - 1;
            var currentPos = j * rowSize;
            var nextPos = j * rowSize + 1;
            var prevRow = (j - 1) * rowSize;
            var currentRow = j * rowSize;
            var nextRow = (j + 1) * rowSize;

            for (var i = 1; i<= width; i++) {
                u[++currentPos] -= wScale * (p[++nextPos] - p[++prevPos]);
                v[currentPos]   -= hScale * (p[++nextRow] - p[++prevRow]);
            }
        }
        set_bnd(1, u);
        set_bnd(2, v);
    }

    function dens_step(x, x0, u, v, dt) {
        addFields(x, x0, dt);
        diffuse(0, x0, x, dt );
        advect(0, x, x0, u, v, dt );
    }

    function vel_step(u, v, u0, v0, dt) {
        addFields(u, u0, dt );
        addFields(v, v0, dt );
        var temp = u0; u0 = u; u = temp;
        var temp = v0; v0 = v; v = temp;
        diffuse2(u,u0,v,v0, dt);
        project(u, v, u0, v0);
        var temp = u0; u0 = u; u = temp;
        var temp = v0; v0 = v; v = temp;
        advect(1, u, u0, u0, v0, dt);
        advect(2, v, v0, u0, v0, dt);
        project(u, v, u0, v0 );
    }

}

FluidField.prototype.reset = function() {
	this.rowSize = this.width + 2;
	this.size = (this.width+2)*(this.height+2);
	this.dens = [this.size];
	this.dens_prev = [this.size];
	this.u = [this.size];
	this.u_prev = [this.size];
	this.v = [this.size];
	this.v_prev = [this.size];
	for (var i = 0; i < size; i++) {
		dens_prev[i] = u_prev[i] = v_prev[i] = dens[i] = u[i] = v[i] = 0;
	}
}








FluidField.prototype.displayDensity = function (field) {
        prepareBuffer(field, this.canvas_id);
		var canvas = document.getElementById(this.canvas_id);
        var context = canvas.getContext("2d");
        var width = field.width;
        var height = field.height;

        if (bufferData) {
            var data = bufferData.data;
            var dlength = data.length;
            var j = -3;
            if (clampData) {
                for (var x = 0; x < width; x++) {
                    for (var y = 0; y < height; y++) {
                        var d = field.getDensity(x, y) * 255 / 1;
                        d = d | 0;
                        if (d > 255)
                            d = 255;
                        data[4*(y * height + x) + 1] = d;
                    }
                }
            } else {

                for (var x = 0; x < width; x++) {
                    for (var y = 0; y < height; y++) {
						var r = 250;
						var g = 250;
						var b = 250;
                        data[4*(y * height + x)] = r;
						data[4*(y * height + x) + 1] =  g;
                        data[4*(y * height + x) + 2] =  b;
                        data[4*(y * height + x) + 3] =  field.getDensity(x, y) * 15 / 4;
					}
                }
            }
            context.putImageData(bufferData, 0, 0);
        } else {
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    var d = field.getDensity(x, y) / 5;
                    context.setFillColor(220, 220, 210, 1);
                    context.fillRect(x, y, 1, 1);
                }
            }
        }
    }




if (this.CanvasRenderingContext2D && !CanvasRenderingContext2D.createImageData) {
    CanvasRenderingContext2D.prototype.createImageData = function (w,h) {
        return this.getImageData(0,0,w,h);
    }
}
    var buffer;
    var bufferData;
    var canvas;
    var clampData = false;

    function prepareBuffer(field, canvas_id) {
        canvas = canvas || document.getElementById(canvas_id);
        if (buffer && buffer.width == field.width && buffer.height == field.height)
            return;
        buffer = document.createElement("canvas");
        buffer.width = field.width;
        buffer.height = field.height;
        var context = buffer.getContext("2d");
        try {
            bufferData = context.createImageData(field.width, field.height);
        } catch(e) {
            return null;
        }
        if (!bufferData)
            return null;
        var max = field.width * field.height * 4;
        for (var i=3; i<max; i+=4) {
            bufferData.data[i] = 255;
		}
        bufferData.data[0] = 256;

        if (bufferData.data[0] > 255)
            clampData = true;
        bufferData.data[0] = 0;
    }

