var scripts = ["https://unpkg.com/axios/dist/axios.min.js", "https://unpkg.com/merge-images"];

for (index = 0; index < scripts.length; ++index) {
    var script = document.createElement('script');
    script.src = scripts[index];
    script.type='text/javascript';
    var done = false;
    script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
            done = true;
        }
    };
    document.getElementsByTagName("head")[0].appendChild(script);
}

function resize (base64, maxWidth, maxHeight){
	// Max size for thumbnail
	if(typeof(maxWidth) === 'undefined')  maxWidth = 420;
	if(typeof(maxHeight) === 'undefined')  maxHeight = 420;

	// Create and initialize two canvas
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var canvasCopy = document.createElement("canvas");
	var copyContext = canvasCopy.getContext("2d");

	// Create original image
	var img = new Image();
	img.src = base64;

	// Determine new ratio based on max size
	var ratio = 1;
	if(img.width > maxWidth)
		ratio = maxWidth / img.width;
	else if(img.height > maxHeight)
		ratio = maxHeight / img.height;

	// Draw original image in second canvas
	canvasCopy.width = img.width;
	canvasCopy.height = img.height;
	copyContext.drawImage(img, 0, 0);

	// Copy and resize second canvas to first canvas
	canvas.width = img.width * ratio;
	canvas.height = img.height * ratio;
	ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);

	return canvas.toDataURL();
}

function getImageDimensions(file) {
	return new Promise (function (resolved, rejected) {
		var i = new Image()
		i.onload = function(){
			resolved({w: i.width, h: i.height})
		};
		i.src = file
	})
}


async function HTTPCall_Actual(){
	document.getElementById("qrcodediv").style.visibility = 'hidden';
	document.getElementById("qrcode").style.visibility = 'hidden';
	await axios.get('https://sc.clenet.tech/genqr', {
		params: {
		  mob: document.getElementById("cnmob").value
		}
	})
	.then(function (response) {
		getImageDimensions(response.data.t).then((dim1)=>{
			getImageDimensions(response.data.q).then((dim2)=>{
				let img = resize(response.data.q);
				getImageDimensions(img).then((dim3)=>{
					mergeImages([
						{ src: response.data.t, x: 0, y: 0 },
						{ src: img, x: Math.floor((dim1.w-dim3.w)/2), y: Math.floor(165+((465-dim3.h)/2)) }, //y can have value anywhere between from 165 to 210. So making the QR code 420*420, the logica has been implimented
					]).then(b64 => {
							getImageDimensions(b64).then((dim4)=>{
								let img1 = resize(b64,440,685);
								document.getElementById("qrcodediv").style.visibility = 'visible';
								document.getElementById("qrcode").style.visibility = 'visible';
								document.getElementById("qrcode").src =img1
							})
						}
					);
				})
			})
		})
	})
	.catch(function (error) {
		// 
		console.log('error : ',error);
	})
}
