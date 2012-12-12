# Initial Feature #
Mondo Robot logo rendered inside a canvas. Modifying the color of the image data based on alpha channels over a period of time. 

This was done using the canvas api. getImageData will give you a reference object that can be modified and updated with 'putImageData'. The pixel data comes in a giant array with every 4 consecutive elements representing RGBA respectively. 

# Mouse Line Blasts #
Lines shooting out from logo when mouse gets near.

This was done with basic canvas line draws and clears. I had intended to do a better particle emmitter, but ran out of time. The fundamentals are working.

# Nebula Background #
Logo is floating through space now, hell yeah.

Found this online and tweaked it a bit and incorporated it in.

# More Cowbell #
Wanted to randomly rotate the logos but don't want to slow down the battle anymore than I already have. Rotating an image on the canvas isn't as easy as one would think :o)


# MMMMMondo BBBBreakout #
Added several framework pieces including animation timer, scenes, layers, sprites, sprite effects, sprite renderers, input handler, and some rudimentary math.

The framework is utilized to create a breakout type game including simple collision detection/response, animated sprites, 
The paddle can intially be moved by holding down the MIDDLE mouse button and dragging the mouse. Then pressing the LEFT mouse button to
launch the ball. The distance between the ball's starting position and mouse are used to calculate the initial velocity on launch. After
the game is started the paddle will follow the mouse movement.

The collision detection isn't perfect and there are a few bugs like the ball going through the paddle every once in a while, keeps it interesting!