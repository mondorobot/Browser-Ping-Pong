var canvas = document.getElementById('mondorobot');
var under = document.getElementById('underlay');

var update = function (clock,parts) {
    window.setTimeout(function () {
        clock.step();
        update(clock);
    }, 1);
};
 
var img = new Image();
img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;

    update(new ColorClock(canvas, img),parts);
};
img.src = 'MR.png';
var parts =  new particles(under);

under.onmousemove = function(event) {
    //had a few cross browser issues, not sure this was necessary tho
    if (window.event) {
      parts.add_particle(window.event.clientX,window.event.clientY);
    } else {
      parts.add_particle(event.clientX,event.clientY);
    }
}
