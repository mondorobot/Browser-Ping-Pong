var canvas = document.getElementById('mondorobot');

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
