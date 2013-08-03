

(function( $, undefined ) {

    "use strict";

    function round( a, b ) {
        b = b || 0;
        return Math.round(a*Math.pow(10,b))/Math.pow(10,b);
    }

    $.widget( "adjustablegraph.polyline", {
        options: {
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
            stroke_text_font_style: "bold",
            stroke_text_font_name: "sans-serif",
            stroke_text_font_size: 14,
            stroke_text_hshift: 5,
            stroke_text_vshift: 18,
            stroke_text_precision: 2,
            line_width: 2,
            axis_width: 1,
            dot_radius: 4,
            dot_pick_radius_addition: 3,
            dots: []
        },
        _create: function() {
            this.element.addClass( "polyline" );
            this._update();
            this.activemove = null;
            this._on(this.element[0],{
                mousemove: "_mousemove",
                mousedown: "_mousedown",
                mouseup: "_mouseup",
                mouseout: "_mouseout",
                dblclick: "_dblclick" });
        },
        _setOption: function( key, value ) {
            this.options[ key ] = value;
            this._update();
        },
        translate_coords: function(event) {
            var canvas = this.element[0];
            var offset = $(canvas).offset();
            return [ ( event.pageX - offset.left - this.options.padding_left )
                     * this.options.max_x / (canvas.width - this.options.padding_left - this.options.padding_right) ,
                     ( canvas.height - (event.pageY - offset.top) - this.options.padding_bottom ) 
                     * this.options.max_y / (canvas.height - this.options.padding_top - this.options.padding_bottom) ];
        },
        _mousemove: function(event) {
            if (this.activemove === null)
                return
            var coords = this.translate_coords(event);
            var move = this.activemove;
            move.dot[0] = Math.max(Math.min( coords[0] + move.to_center[0] ,move.next_x-this.options.min_dot_diff),move.prev_x+this.options.min_dot_diff);
            move.dot[1] = Math.max(Math.min( coords[1] + move.to_center[1] ,this.options.max_y),0);
            this._update();
        },
        closestdot: function(coords, handler) {
            var max_x = this.element[0].width - this.options.padding_right - this.options.padding_left;
            var max_y = this.element[0].height - this.options.padding_top - this.options.padding_bottom;
            var dots = this.options.dots;
            var len = dots.length;
            var chosen = null;
            var chosen_dist = this.options.dot_radius + this.options.dot_pick_radius_addition;
            for (var i = 0; i < len; i++) {
                var dot = dots[i];
                var dist = Math.sqrt( Math.pow((dot[0]-coords[0])*max_x/this.options.max_x,2)
                                    + Math.pow((dot[1]-coords[1])*max_y/this.options.max_y,2) );
                if (dist <= chosen_dist) {
                    chosen_dist = dist;
                    chosen = { dot: dot, index: i };
                }
            }
            handler(chosen);
        },
        _mousedown: function(event) {
            var mouse = this.translate_coords(event);
            var self = this;
            this.closestdot(mouse, function(chosen){
                if (chosen !== null)
                    self.activemove = {
                        dot: chosen.dot,
                        index: chosen.index,
                        to_center: [chosen.dot[0]-mouse[0], chosen.dot[1]-mouse[1]],
                        prev_x: chosen.index === 0 ? 0 : self.options.dots[chosen.index-1][0],
                        next_x: chosen.index === self.options.dots.length-1 ? self.options.max_x + self.options.min_dot_diff : self.options.dots[chosen.index+1][0]
                    };
            });
        },
        _mouseup: function(event) {
            this._mousemove(event);
            if (this.activemove === null)
                return;
            var chosen = { dot: this.activemove.dot, index: this.activemove.index };
            this.activemove = null;
            this._trigger('change', event, [false, chosen]);
        },
        _mouseout: function() {
            if (this.activemove === null)
                return;
            this.options.dots.splice(this.activemove.index,1);
            this.activemove = null
            this._update();                
        },
        _dblclick: function(event) {
            var mouse_unbounded = this.translate_coords(event);
            var mouse = [ Math.max(Math.min( mouse_unbounded[0] ,this.options.max_x),this.options.min_dot_diff),
                          Math.max(Math.min( mouse_unbounded[1] ,this.options.max_y),0) ];
            var dots = this.options.dots;
            for (var i = 0, len = dots.length; i < len; i++) {
                var dot = dots[i];
                if (dot[0] > mouse[0] - this.options.min_dot_diff) {
                    if (dot[0] > mouse[0] + this.options.min_dot_diff)
                        break;
                    var self = this;
                    this.closestdot(mouse_unbounded, function(chosen){
                        if (chosen !== null) {
                            self.options.dots.splice(chosen.index,1);
                            self._update();
                            self._trigger('change', event, [null, chosen]);
                        }
                    });
                    return;
                }
            }
            this.options.dots.splice(i, 0, mouse);
            this._update();
            this._trigger('change', event, [true, { dot: mouse, index: i }]);
        },
        _update: function() {

            if ( this.element[0].getContext ) {
                var ctx = this.element[0].getContext('2d');
                ctx.save();
                
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.lineJoin = "bevel";
                
                ctx.strokeStyle = "black";

                ctx.translate(this.options.padding_left, ctx.canvas.height - this.options.padding_bottom);
                ctx.scale(1, -1);

                var max_x = ctx.canvas.width - this.options.padding_right - this.options.padding_left;
                var max_y = ctx.canvas.height - this.options.padding_top - this.options.padding_bottom;


                ctx.beginPath(); // axes

                ctx.lineWidth = this.options.axis_width;

                ctx.moveTo(0,0);
                ctx.lineTo(max_x,0);

                ctx.moveTo(0,0);
                ctx.lineTo(0,max_y);

                ctx.stroke(); // axes

                ctx.beginPath(); // axes strokes

                ctx.lineWidth = this.options.stroke_width;
                ctx.font = this.options.stroke_text_font_style + " " + this.options.stroke_text_font_size + "px " + this.options.stroke_text_font_name;

                for (var i = 0; i <= this.options.stroke_count; i++) {
                    ctx.moveTo( i * max_x / this.options.stroke_count, this.options.stroke_shift );
                    ctx.lineTo( i * max_x / this.options.stroke_count, this.options.stroke_shift - this.options.stroke_size );
                    ctx.moveTo( this.options.stroke_shift, i * max_y / this.options.stroke_count );
                    ctx.lineTo( this.options.stroke_shift - this.options.stroke_size, i * max_y / this.options.stroke_count );
                    var x = round( i * this.options.max_x / this.options.stroke_count , this.options.stroke_text_precision );
                    var y = round( i * this.options.max_y / this.options.stroke_count , this.options.stroke_text_precision );
                    ctx.scale(1,-1);
                    ctx.fillText(x, i * max_x / this.options.stroke_count - ctx.measureText(x).width / 2 , this.options.stroke_text_vshift);
                    ctx.fillText(y, - this.options.stroke_text_hshift - ctx.measureText(y).width , - ( i * max_y / this.options.stroke_count - this.options.stroke_text_font_size / 2 + 1 ) );
                    ctx.scale(1,-1);
                }
                
                ctx.stroke(); // axes strokes

                var one_x_length = max_x/this.options.max_x;
                var one_y_length = max_y/this.options.max_y;
                var dots = this.options.dots;

                ctx.beginPath(); // path

                ctx.lineWidth = this.options.line_width;

                var prev_dot = [-max_x, -max_y];
                var cur_dot = [0, 0];
                ctx.moveTo(0,0);
                for (var i = 0, len = dots.length; i < len; i++) {
                    prev_dot = cur_dot;
                    cur_dot = dots[i];
                    ctx.lineTo(cur_dot[0]*one_x_length, cur_dot[1]*one_y_length);
                }
                if (cur_dot[0] == prev_dot[0]) {
                    var x = cur_dot[0];
                    var y = this.options.max_y;
                } else {
                    var y = (prev_dot[1]-cur_dot[1])*(this.options.max_x-cur_dot[0])/(prev_dot[0]-cur_dot[0]) + cur_dot[1];
                    if (y >= 0 && y <= this.options.max_y)
                        var x = this.options.max_x;
                    else {
                        var y = Math.max(Math.min(y,this.options.max_y),0);
                        var x = (prev_dot[0]-cur_dot[0])*(y-cur_dot[1])/(prev_dot[1]-cur_dot[1]) + cur_dot[0];
                    }
                }
                ctx.lineTo(x*one_x_length, y*one_y_length);
                
                ctx.stroke(); // path
                
                // begin dots
                
                ctx.lineWidth = 0;
                ctx.fillStyle = "black";
                for (var i = 0, len = dots.length; i < len; i++) {
                    var cur_dot = dots[i];
                    ctx.beginPath();
                    ctx.arc(cur_dot[0]*one_x_length, cur_dot[1]*one_y_length, this.options.dot_radius, 0, 2 * Math.PI, false);
                    ctx.fill();
                }

                // end dots
                
                ctx.restore();
            }
        }
    });

})( jQuery );
