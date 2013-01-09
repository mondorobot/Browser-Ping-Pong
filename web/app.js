
// helper function for binding an object with 
// a callback
function bind(scope, fn) {
  return function() {
    fn.apply(scope, arguments);
  }
}

// grab the canvas we are going to use and create
// the breakout game
var canvas = document.getElementById("breakout");
var breakout = new Breakout(canvas);


$(document).ready(function () 
{
  
    $(document).keyup(function(e) 
    {
        if (e.keyCode == 27) // esc
        { 
             breakout.stop();
             $.colorbox({
                onComplete:function()
                {
                    $('#btn-save-settings').click(function(evt)
                    {
                        var controller_url = $('#controller-url').val();
                        breakout.setInputControllerAddress(controller_url);
                        $.colorbox.close();
                        breakout.start();
                    });
                },
                // Chome will not do ajax locally without turning it on.
                html:'<div id="breakout-settings">' +
                     '    <H1>Settings</H1>' +
                     '    <form id="the-settings-form" onsubmit="return false">' +
                     '        <label for="controller-ip">Controller Address:</label>' +
                     '        <!-- input type="text" name="controller-url" id="controller-url" value="ws://192.168.4.110:7001/"/ -->' +
                     '        <input type="text" name="controller-url" id="controller-url" value="ws://10.0.1.147:7001/"/>' +
                     '        <br/>' +
                     '        <input type="button" id="btn-save-settings" name="btn-save-settings" value="Save"/>' +
                     '        <div class="clear"/>' + 
                     '    </form>' +
                     '</div>'
            });
        }   
    });
});

