var ColorClock = function (canvas, img, speed) {
	var that = this;	
	var rainbow = ['R+', 'G+', 'R-', 'B+', 'G-', 'R+', 'B-', 'R-'];
    this.phaseIndex = 0;
	
    this.context = canvas.getContext('2d');
    this.context.drawImage(img, 0, 0, img.width, img.height);

    this.increment = speed || 2;

    this.clampUpper = 255;
    this.clampLower = 0;

	this.color = { R: this.clampLower, G: this.clampLower, B: this.clampLower };

    this.draw = function () {
        var frame = this.context.getImageData(0, 0, img.width, img.height);

        var pix = frame.data;

        for (var i = 0; i < pix.length; i += 4) {
            if (pix[i + 3] != 0) {
                pix[i] = this.color.R;
                pix[i + 1] = this.color.G;
                pix[i + 2] = this.color.B;
            }
        }

        this.context.putImageData(frame, 0, 0);
    };

    this.clamp = function (value, upper, lower) {
        if (value > upper) {
            return { value: upper, limit: true };
        } else if (value < lower) {
            return { value: lower, limit: true };
        }

        return { value: value, limit: false };
    };

    this.increment_color = function () {
        var phase = rainbow[this.phaseIndex % rainbow.length];

        var result = this.clamp(this.color[phase[0]] + (phase[1] == '-' ? this.increment * -1 : this.increment), this.clampUpper, this.clampLower);
        this.color[phase[0]] = result.value;

        if (result.limit)
            this.phaseIndex++;
    };

    this.step = function () {
        this.increment_color();
        this.draw();
    };
}
