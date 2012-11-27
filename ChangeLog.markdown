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