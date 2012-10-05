$(function () {
    var canvas = document.getElementById('mondorobot');
    var rainbow = ['R+', 'G+', 'R-', 'B+', 'G-', 'R+', 'B-', 'R-'];

    var ColorClock = function (canvas, img, speed) {
        this.context = canvas.getContext('2d');

        this.context.drawImage(img, 0, 0, img.width, img.height);

        this.color = 0;
        this.increment = speed;
        this.phaseIndex = 0;
        this.clampUpper = 255;
        this.clampLower = 0;

        var that = this;

        this.getRGB = function () {
            var r = (this.color) >> 16;
            var g = (this.color - (r << 16)) >> 8;
            var b = (this.color - (r << 16) - (g << 8));

            return { R: r, G: g, B: b };
        };

        this.set_color = function () {
            var frame = this.context.getImageData(0, 0, img.width, img.height);

            var pix = frame.data;

            var rgb = this.getRGB();

            for (var i = 0; i < pix.length; i += 4) {
                if (pix[i + 3] != 0) {
                    pix[i] = rgb.R;         //r
                    pix[i + 1] = rgb.G;     //g
                    pix[i + 2] = rgb.B;     //b
                }
            }

            this.context.putImageData(frame, 0, 0);
        };

        this.clamp = function (value, upper, lower) {
            if (value > upper) {
                return {
                    value: upper,
                    limit: true
                };
            } else if (value < lower) {
                return {
                    value: lower,
                    limit: true
                };
            }

            return {
                value: value,
                limit: false
            };
        };

        this.increment_color = function () {
            var c = this.getRGB();
            var phase = rainbow[this.phaseIndex % rainbow.length];
            console.log(c.R, c.G, c.B);

            var result = this.clamp(c[phase[0]] + (phase[1] == '-' ? this.increment * -1 : this.increment), this.clampUpper, this.clampLower);
            c[phase[0]] = result.value;
            console.log('result', result);
            if (result.limit)
                this.phaseIndex++;

            this.color = ((c.R << 16) + (c.G << 8) + c.B);
        };

        this.step = function () {
            this.increment_color();
            this.set_color();
        };
    }

    var update = function (clock) {
        window.setTimeout(function () {
            clock.step();
            update(clock);
        }, 1);
    };

    var img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        update(new ColorClock(canvas, img));
    };
    img.src = 'MR.png';
});