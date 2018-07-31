let canvas;
let ctx;

let width = 800;
let height = 600;
let delay = 1;
let size = width*height;
let buffer0 = [],
    buffer1 = [],
    aux, texture;

for(i=0;i<size;i++){
    buffer0.push(0);
    buffer1.push(0);
}

function initCanvas() {
	canvas = document.getElementById('canvas');
	canvas.width = width
	canvas.height= height;
	ctx = canvas.getContext('2d');

	ctx.rect(0,0,width,height);
	ctx.fillStyle = '#479ee5';
	ctx.fill();

	document.addEventListener('keypress', onKeyPress);

	texture = ctx.getImageData(0,0,width,height);
	// for(let a = 0; a<30;a++){
	// 	disturb(floor(Math.random()*(width-2)), floor(Math.random()*(height-30)), Math.random()*10000);
	// }
	// for(let a = 0; a<500;a++){
	// 	draw();
	// }
	setInterval(draw, delay);
}

function draw() {
	var img = ctx.getImageData(0, 0, width, height),
        data = img.data;

    // average cells to make the surface more even
    for(let i=width+1;i<size-width-1;i+=2){
        for(let x=1;x<width-1;x++,i++){
            buffer0[i] = (buffer0[i]+buffer0[i+1]+buffer0[i-1]+buffer0[i-width]+buffer0[i+width])/5;
        }
    }

    for(let i=width+1;i<size-width-1;i+=2){
        for(let x=1;x<width-1;x++,i++){
            // wave propagation
            var waveHeight = (buffer0[i-1] + buffer0[i+1] + buffer0[i+width] + buffer0[i-width])/2-buffer1[i];
            buffer1[i] = waveHeight;
            // calculate index in the texture with some fake referaction
            var ti = i+floor((buffer1[i-2]-waveHeight)*0.08)+floor((buffer1[i-width]-waveHeight)*0.08)*width;
            // clamping
            ti = clamp (ti, 0, size);
            // some very fake lighting and caustics based on the wave height
            // and angle
            var light = waveHeight*2.0-buffer1[i-2]*0.6,
                i4 = i*4,
                ti4 = ti*4;
            // clamping
            light = clamp(light, -10, 50);
            data[i4] = texture.data[ti4]+light;
            data[i4+1] = texture.data[ti4+1]+light;
            data[i4+2] = texture.data[ti4+2]+light;
        }
    }
    // rain
    aux = buffer0;
    buffer0 = buffer1;
    buffer1 = aux;
    ctx.putImageData(img, 0, 0);
}

function disturb(x, y, z){
    if(x < 2 || x > width-2 || y < 1 || y > height-2)
        return;

    for(let j = 0; j<5;j++){
    	for(let a = 0; a<5;a++){
    		if(a==0||a==4||j==0||j==4){
    		var i = x+j+(y+a)*width;

    		buffer0[i] += z;
    		buffer0[i-1] -= z;
    	}
    	}    	
    }
      //   		var i = x+(y)*width;

    		// buffer0[i] += z;
    		// buffer0[i-1] -= z;

}

function clear() {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

var floor = Math.floor;

function clamp(x, min, max) {
    if(x < min) return min;
    if(x > max) return max-1;
    return x;
}

function onKeyPress(e) {
	var key = e.which;
	switch (key){
		case 13:
			   disturb(floor(Math.random()*(width-2)), floor(Math.random()*(height-30)), Math.random()*10000);
			break;
	}
}