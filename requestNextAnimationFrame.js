// cross-browswer portable version of requestAnimationFrame
// will drop back gracefully to setTimeout when requestAnimationFrame
// is either not available or known to be buggy.
// Code pulled from Core HTML5 Canvas: Graphics, Animation, Game Development
// Section 5.1.3. A Portable Animation Loop
window.requestNextAnimationFrame =
   (function () {
      var originalWebkitMethod,
          wrapper = undefined,
          callback = undefined,
          geckoVersion = 0,
          userAgent = navigator.userAgent,
          index = 0,
          self = this;

      // Workaround for Chrome 10 bug where Chrome
      // does not pass the time to the animation function
      if (window.webkitRequestAnimationFrame) {
          // Define the wrapper
          wrapper = function (time) {
            if (time === undefined) {
               time = +new Date();
            }
            self.callback(time);
          };

          // Make the switch

         originalWebkitMethod = window.webkitRequestAnimationFrame;

         window.webkitRequestAnimationFrame =
         function (callback, element) {
            self.callback = callback;

            // Browser calls wrapper; wrapper calls callback
            originalWebkitMethod(wrapper, element);
         }
      }

      // Workaround for Gecko 2.0, which has a bug in
      // mozRequestAnimationFrame() that restricts animations
      // to 30-40 fps.
       if (window.mozRequestAnimationFrame) {
          // Check the Gecko version. Gecko is used by browsers
          // other than Firefox. Gecko 2.0 corresponds to
          // Firefox 4.0.
          index = userAgent.indexOf('rv:');

          if (userAgent.indexOf('Gecko') !=  -1) {
             geckoVersion = userAgent.substr(index + 3, 3);

             if (geckoVersion === '2.0') {
                // Forces the return statement to fall through
                // to the setTimeout() function.
                window.mozRequestAnimationFrame = undefined;
             }
          }
       }

       return window.requestAnimationFrame   ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||

          function (callback, element) {
             var start,
                 finish;

             window.setTimeout( function () {
                start = +new Date();
                callback(start);
                finish = +new Date();

                self.timeout = 1000 / 60 - (finish - start);

             }, self.timeout);
          };
       }
     )
  ();