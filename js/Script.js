/*----------------------------------------- gameLib.js ------------------------------
	gamelib merupakan kumpulan kode yang digunakan untuk mempermudah pembuatan game menggunakan kode HTML 5
	Programer 		: Mikail Abdullah Nasro
	Lisensi			: CC, SA, BY (Creative Common, Share Alike, Credit)
	LOG :
	2 juli	2021	: penambahan fitur mobile
	5 Juli 2021		: menghapus fitur lain, tinggal fitur dasar saja
	20 juli 2021	: penambahan fitur platformer buildmap
//----------------------------------------------------------------------------------*/
	var version = "0.22.1";
	var dataGambar = {};
	var dataSuara = {};
	var konten;
	var canvas;
	var gameArea;
	var touchScale;
	var smoothing = false;
	var warnaBG;
	var funcDB = [];
	var isMobile = false;
	var joyStick = {stat:true, out:false, px:0, py:0, sx:0, sy:0, id: 0, rad:100, pos:"left", angle:0, kanan:false, atas:false, kiri:false, bawah:false, spasi:true, spx:1000, spy:400};
	var isTouch = false;
	//---mouse
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var canvasX = 0;
	var canvasY = 0;
	var currentElement;
	var newWidth;
	var newHeight;
	var arena = {};
	var game = {};
	var gravitasi = 0.5;
	var screenW = 0;
	var screenH = 0;
	var dialog = {};
	var vkAktif = 0;
	var vkDown = 0;
	var vkTeks = "";
	var vkCounter = 0;
	
	var npc_1,npc_2,npc_3,npc_4,npc_5,npc_6,npc_7,npc_8,npc_9,npc_10,npc_11,npc_12,npc_13,npc_14,npc_15,npc_16,npc_17,npc_18,npc_19;
	
	var enpc_1,enpc_2,enpc_3,enpc_4,enpc_5,enpc_6,enpc_7,enpc_8,enpc_9,enpc_10,enpc_11,enpc_12,enpc_13,enpc_14,enpc_15,enpc_16,enpc_17,enpc_18,enpc_19;
	
	var sizeBtn;
	//-----------------preload-------------------------------
	function loading(img, snd, func){	
		trace("loading...")
		//siapkanGambar(img, func);
		siapkanGambar(img, function(images) {
			dataGambar = images;
			console.log("gfx loaded");
			siapkanSuara(snd, function(sound){
				dataSuara = sound;
				console.log("sfx loaded");
				jalankan(func);
			});
		});
	}
	//--------------------audio------------------------------
	function Sound(src) {
		  this.sound = document.createElement("audio");
		  this.sound.src = src;
		  this.sound.setAttribute("preload", "auto");
		  this.sound.setAttribute("controls", "none");
		  this.sound.style.display = "none";
		  document.body.appendChild(this.sound);
		  this.play = function(){
			this.sound.play();
		  }
		  this.stop = function(){
			this.sound.pause();
		  }
		  this.loop = function(){
			  this.sound.setAttribute("loop", "loop");
			  this.sound.play();
		  }
		  this.volume = function(vol){
			this.sound.volume = vol;
		  }
	}
	function siapkanSuara(sources, callback) 
	{
		var sound = {};
		var loadedSound = 0;
		var numSound = 0;
		// get num of sources
		for (var src in sources) {
			numSound++;
		}
		if (numSound > 0){
			//gambar preloader
			hapusLayar();
			teks("loading sound", canvas.width/2, canvas.height/2-20);
			kotakr(canvas.width/2-150, canvas.height/2-10, 300, 15, 4, 2, "white", "none");
			for (var src in sources) {
				sound[src] = game.folder+"/"+sources[src];
				trace("loading -> "+sources[src]);
				hapusLayar();
				teks("loading sound", canvas.width/2, canvas.height/2-20);
				var persen = loadedSound/numSound*300; //300 = panjang preloader
				kotakr(canvas.width/2-150, canvas.height/2-10, persen, 15, 4, 2, "white", "white");
				kotakr(canvas.width/2-150, canvas.height/2-10, 300, 15, 4, 2, "white", "none");
				if (++loadedSound >= numSound) {
					callback(sound);
				}			
			}
		}else{
			callback(sound);
		}
	}
	
	function siapkanGambar(sources, callback) 
	{
		var images = {};
		var loadedImages = 0;
		var numImages = 0;
		konten.webkitImageSmoothingEnabled = smoothing;
		konten.mozImageSmoothingEnabled = smoothing;
		konten.imageSmoothingEnabled = smoothing;
		// get num of sources
		for (var src in sources) {
			numImages++;
		}
		//gambar preloader
		hapusLayar();
		teks("loading graphic", canvas.width/2, canvas.height/2-20);
		kotakr(canvas.width/2-150, canvas.height/2-10, 300, 15, 4, 2, "white", "none");
		
		for (var src in sources) {
			images[src] = new Image();
			images[src].onload = function() {
				//tampilkan preloading baris
				hapusLayar();
				
				teks("loading graphic", canvas.width/2, canvas.height/2-20);
				var persen = loadedImages/numImages*300; //300 = panjang preloader
				kotakr(canvas.width/2-150, canvas.height/2-10, persen, 15, 4, 2, "white", "white");
				kotakr(canvas.width/2-150, canvas.height/2-10, 300, 15, 4, 2, "white", "none");
				if (++loadedImages >= numImages) {
					callback(images);
				}
			};
			//images[src].src = game.folder+"//"+sources[src];
			images[src].src = game.folder+"/"+sources[src];
			trace("loading -> "+sources[src]);
		}
	}
	//--------------------
function animasi(data){
	sprite(data);
	if (data.frameRate == undefined) {
		data.frameRate = 3;
		data.frameTimer = 0;
	}
	if (!game.pause) data.frameTimer++;
	if (data.frameTimer>data.frameRate){
		data.frameTimer = 0;
		data.frame++;
		if (data.frame > data.maxFrame) data.frame = 1;
	} 
}

function setSprite(img, lebar=0, tinggi=0){
	var ob = {};
	var imgW = img.width;
	var imgH = img.height;
	ob.img = img;
	if (lebar == 0 || tinggi == 0){
		ob.lebar = img.width;
		ob.tinggi = img.height;
	}else{
		ob.lebar = lebar;
		ob.tinggi = tinggi;
	}
	var divX = Math.floor(imgW/ob.lebar);
	var divY = Math.floor(imgH/ob.tinggi);
	var maxFrame = divX * divY;
	ob.x = 0;
	ob.y = 0;
	ob.frame = 1;
	ob.skalaX = 1;	
	ob.skalaY = 1;
	ob.rotasi = 0;
	ob.timer = 0;
	ob.playOnce = false;
	ob.mati = false;
	ob.maxFrame = maxFrame;
	ob.offsetX = 2; //tepat ditengah
	ob.offsetY = 2;
	ob.animJalan = 0;
	ob.animLompat = 0;
	ob.animJatuh = 0;
	ob.animMati = 0;
	ob.animKena = 0;
	ob.animTangga = 0;
	ob.animDiam = 0;	
	return ob;
}
	
function sprite(data, frm=0){
	var imgW = data.img.width;
	var imgH = data.img.height;
	if (data.lebar == undefined) data.lebar = imgW;
	if (data.tinggi == undefined) data.tinggi = imgH;
	var divX = Math.floor(imgW/data.lebar);
	var divY = Math.floor(imgH/data.tinggi);
	var maxFrame = divX * divY;
	data.maxFrame = maxFrame;
	var fr;
	if (frm == 0) {
		if (data.frame == undefined){
			data.frame = 1;
		}		
	}else{
		data.frame = frm;		
	}
	if (data.frame>data.maxFrame) data.frame = data.maxFrame;
	fr = data.frame;	
	var frameY = Math.floor((fr-1)/divX);
	var frameX = (fr-1)-frameY*divX;
	if (data.x == undefined || data.y == undefined){
		data.x = 0;
		data.y = 0;
	}
	if (data.skalaX == undefined || data.skalaX == null) data.skalaX = 1;
	if (data.skalaY == undefined || data.skalaY == null) data.skalaY = 1;
	if (data.rotasi == undefined) data.rotasi = 0;
	if (data.mati == undefined || data.mati == false){
		if (data.rotasi == 0) {	
			if (data.skalaX == 1 && data.skalaY == 1){
				konten.drawImage(data.img, frameX * data.lebar, frameY * data.tinggi, data.lebar, data.tinggi, data.x-(data.lebar*game.skalaSprite)/data.offsetX, data.y-(data.tinggi*game.skalaSprite)/data.offsetY, data.lebar*game.skalaSprite, data.tinggi*game.skalaSprite);
			}else{
				konten.save();
				konten.translate(data.x, data.y);
				konten.scale(data.skalaX, data.skalaY);
				konten.drawImage(data.img, frameX * data.lebar, frameY * data.tinggi, data.lebar, data.tinggi, -(data.lebar*game.skalaSprite)/data.offsetX, -(data.tinggi*game.skalaSprite)/data.offsetY, data.lebar*game.skalaSprite, data.tinggi*game.skalaSprite);
				konten.restore();
			}
		}else{
			//gambar berotasi
			konten.save();
			konten.translate(data.x, data.y);
			konten.rotate(data.rotasi*Math.PI/180.0);
			konten.translate(-data.x, -data.y);
			konten.drawImage(data.img, frameX * data.lebar, frameY * data.tinggi, data.lebar, data.tinggi, data.x-(data.lebar*game.skalaSprite)/data.offsetX, data.y-(data.tinggi*game.skalaSprite)/data.offsetY, data.lebar*game.skalaSprite, data.tinggi*game.skalaSprite);
			konten.restore();
		}
	}
}

function tampilkanGambar(img, px = 0, py = 0, stat=""){
	if (stat == ""){
		konten.drawImage(img, px - img.width/2, py - img.height/2);
	}else{		
		if (stat.indexOf("skala=")>-1){
			var skl = Number(stat.substr(6))/100;
			konten.drawImage(img, 0, 0, img.width, img.height, px - img.width*skl/2, py - img.height*skl/2, img.width*skl, img.height*skl);
		}else if (stat.indexOf("rotasi=")>-1){
			var rot = Number(stat.substr(7));
			konten.save();
			konten.translate(px, py);
			konten.rotate(rot*Math.PI/180.0);
			konten.translate(-px, -py);
			konten.drawImage(img, px - img.width/2, py - img.height/2);
			konten.restore();
		}else if (stat.indexOf("alpha=")>-1){
			var alp = Number(stat.substr(6));
			konten.save();
			konten.globalAlpha = alp/100;
			konten.drawImage(img, px - img.width/2, py - img.height/2);
			konten.globalAlpha = 1;
			konten.restore();
		}else{
			konten.drawImage(img, px - img.width/2, py - img.height/2);
		}
	}
}

function gambarFull(img){
	konten.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
}

function loopSprite(data){
	data.timer++;
	if (data.maxFrame == 1) {
		data.frame = 1;
	}else {
		if (data.timer>2){
			data.timer = 0;
			data.frame++;
			//karakter
			if (data.playOnce){
				data.frame = data.maxFrame;
			}else{
				if (data.frame >data.maxFrame) {
					data.frame = 1;
				}
			}
		}
	}
	sprite(data);
}


	function hapusLayar(wrn=warnaBG, ob = {}){
		warnaBG = wrn;
		game.timer++;
		konten.clearRect(0, 0, canvas.width, canvas.height);
		konten.fillStyle = warnaBG;
		konten.fillRect(0, 0, canvas.width, canvas.height);
		if (ob.stat == "run") {
			funcDB.push(ob.func);
		}
		if (ob.stat == "clear") {
			funcDB = [];
		}
		if (funcDB.length>0) jalankan(funcDB[0]);
		
	}
	
//kotak rounded
	function kotakr(x, y, width, height, radius=5, tbl = 1, stroke="#000", fill="#fff") {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
		konten.beginPath();
		konten.moveTo(x + radius.tl, y);
		konten.lineTo(x + width - radius.tr, y);
		konten.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
		konten.lineTo(x + width, y + height - radius.br);
		konten.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
		konten.lineTo(x + radius.bl, y + height);
		konten.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
		konten.lineTo(x, y + radius.tl);
		konten.quadraticCurveTo(x, y, x + radius.tl, y);
		konten.closePath();
		if (fill!="none"){
			konten.fillStyle = fill;
			konten.fill();
		}
		if (stroke!="none"){
			konten.lineWidth = tbl;
			konten.strokeStyle = stroke;
			konten.stroke();
		}	
	}
	
	function setGame(res = ""){
		canvas = document.getElementById("canvas");
		konten = canvas.getContext("2d");
		gameArea = document.getElementById("gameArea").getBoundingClientRect();
		score = 0;
		if (res == ""){
			konten.canvas.width = window.innerWidth;
			konten.canvas.height = window.innerHeight;
			screenW = window.innerWidth;
			screenH = window.innerHeight;
		}else{
			var sz = res.split("x");
			screenW = parseInt(sz[0]);
			screenH = parseInt(sz[1]);
			konten.canvas.width = screenW;
			konten.canvas.height = screenH;
		}
		game = {};
		game.aktif = true;
		game.lebar = screenW;
		game.tinggi = screenH;
		game.oriW = screenW;
		game.oriH = screenH;
		game.areaW = gameArea.width;
		game.areaH = gameArea.height;
		game.font = "Calibri-normal-20pt-left-hitam-normal-1.6";		
		game.smoothing = false;
		game.pause = false;
		game.folder = "assets";
		game.orient = "landscape";
		game.fullscreen = false;
		game.isMobile = false;
		game.lompat = false;
		game.suaraAktif = true;
		game.musikAktif = false;
		game.transisi = false;
		game.lastAktif = game.aktif;
		game.debug = true;
		game.mouse = {x:0, y:0};
		game.score = 0;
		game.top = 0;
		game.die = 0;
		game.hiScore = 0;
		game.fps = 30;
		game.timer = 0;
		game.level = 1;
		game.skalaSprite = 1;
		game.tileUI = 32;
		game.sensitif = 1.5; //untuk mobile biar tidak terlalu cepat
		//rpg
		game.charW = 16;
		game.charH = 32;
		game.numNPC = 0;
		game.isAction = false;
		game.just_talk = 0;
		game.isActive = true;
		game.warnaTransisi = "#000";
		game.vMenu = [];
		game.namaPemain = "Izzan";
		game.vk = false;
		game.vkTeks = "";
		game.vkDone = false;
		trace("versi gamelib = "+version);
		trace("ukuran layar = "+konten.canvas.width+" x "+konten.canvas.height);
		trace("ukuran canvas = "+canvas.width+" x "+canvas.height);
		trace("ukuran game Area = "+gameArea.width+" x "+gameArea.height);
		trace("ukuran display  = "+game.oriW+" x "+game.oriH);
		
		touchScale = {x:gameArea.width/konten.canvas.width, y:gameArea.height/konten.canvas.height};
		aktifkanKeyboard();
		trace("input keyboard & mouse aktif");
		hapusLayar("#333");
		//mouse
		canvas.onmousedown = mouseDown;
		canvas.onmouseup = mouseUp;
		canvas.onmousemove = mouseMove;
		canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }
		//updateOffset();		
	}
	
	function updateOffset(){
		//mouse pos
		currentElement = canvas;
		totalOffsetX = 0;
		totalOffsetY = 0;
		do {
			totalOffsetX += currentElement.offsetLeft;
			totalOffsetY += currentElement.offsetTop;
		}
		while (currentElement = currentElement.offsetParent)
	}
		
	//mouse
	function mousePos(e){
		updateOffset();
		canvasX = e.pageX - totalOffsetX;
		canvasY = e.pageY - totalOffsetY;
		
		// Fix for variable canvas width
		canvasX = Math.round( canvasX * (canvas.width / canvas.offsetWidth) );
		canvasY = Math.round( canvasY * (canvas.height / canvas.offsetHeight) );
		
		//return {x:canvasX, y:canvasY}
	}
	function mouseDown(e){
		updateOffset();
		game.mouseDitekan = true;
		mousePos(e);
		game.mouse = {x:canvasX, y:canvasY}
		game.dragX = game.mouse.x;
		game.dragY = game.mouse.y;
		game.clickX = game.mouse.x;
		game.clickY = game.mouse.y;
		//trace(game.clickX+" "+game.clickY);
		//trace(touchScale.x+" "+touchScale.y);
	}
	function mouseUp(e){
		game.mouseDitekan = false;
		mousePos(e);
		game.mouse = {x:canvasX, y:canvasY}
		game.dragX = game.mouse.x;
		game.dragY = game.mouse.y;
		game.clickX = game.mouse.x;
		game.clickY = game.mouse.y;
	}
	function mouseMove(e){
		mousePos(e);
		game.dragX = game.mouse.x;
		game.dragY = game.mouse.y;
	}
	
	
	//---------------------- keyboard --------------------
	var atas=false;
	var bawah=false;
	var kiri=false;
	var kanan=false;
	var spasi=false;
	var tombolP = false;
	//-----------------keyboard listener -------------------------
	function tombolditekan(event) {
			game.keyCode = event.keyCode;
			game.kodeTombol = event.keyCode;
			if (!game.pause && game.aktif){
				if (event.keyCode == 65) {kiri = true; game.kiri = true;}
				if (event.keyCode == 87) {atas = true; game.atas = true;}
				if (event.keyCode == 68) {kanan = true; game.kanan = true;}
				if (event.keyCode == 83) {bawah = true; game.bawah = true;}
				if (event.keyCode == 32) {spasi = true; game.spasi = true;}
			}
			if (event.keyCode == 80) {
				tombolP = true;					
			}
			//hp minimize
			if (event.keyCode === 'Backspace' || event.keyCode === 'Escape') {
				event.preventDefault();
				closeFullscreen();
			}
		  }
	function tomboldilepas(event) {
			if (event.keyCode == 65) {kiri = false; game.kiri = false;}
			if (event.keyCode == 87) {atas = false; game.atas = false;}
			if (event.keyCode == 68) {kanan = false; game.kanan = false;}
			if (event.keyCode == 83) {bawah = false; game.bawah = false;}
			if (event.keyCode == 32) {spasi = false; game.spasi = false;}
			if (event.keyCode == 80) {
				tombolP = false;
				game.pause = !game.pause;
			}			
			//rpg
			//if (event.keyCode == 32 && game.type == "RPG"){
			//	RPGspace();
			//}
			game.keyCode = null;
	}
	function aktifkanKeyboard(){
		addEventListener("keydown", tombolditekan);		
		addEventListener("keyup", tomboldilepas);
		isMobile = deteksiMobile();
		trace("mobile mode = "+isMobile);
		game.isMobile = isMobile;
		if (isMobile){
			//set touch
			console.log("touch active");
			canvas.addEventListener("touchend", touchEnd, false);
			canvas.addEventListener("touchmove", touchMove, false);
			canvas.addEventListener("touchstart", touchStart, false);
			window.addEventListener('orientationchange', resizeMobile, false);
			window.addEventListener('resize', resizeMobile, false);
		}
	}
	
	//------------- tombol------
	function tombol(img, px = 0, py = 0){
		tampilkanGambar(img, px, py);
		var rx = px;
		var ry = py;
		var obx = {x:rx, y:ry, lebar:img.width, tinggi:img.height};	
		//kotakr(rx,ry, img.width,img.height, 5, 1, "#000", "none");		
		return obx;
	}
	
	function tekan(tom){
		var res = false;
		if (game.mouseDitekan){
			if (game.mouse.x > tom.x-tom.lebar/2 && game.mouse.x < tom.x+tom.lebar/2 && game.mouse.y > tom.y-tom.tinggi/2 && game.mouse.y < tom.y+tom.tinggi/2){
				game.mouseDitekan = false;
				res = true;
			}
		}
		return res;
	}
	
	function trace(str){
		if (game.debug) console.log(str);
	}
	//---------------------- GAME RUNNING ----------------
	var loopFunc = null;
	var fpsInterval = 1000 / 30;
    var then = Date.now();
    var startTime = then;
	function jalankan(func){
		/*movingOb = {};
		clearInterval(game.loop);
		var speed = 900/game.fps;
		game.loop = setInterval(func, speed);
		*/
		loopFunc = func;
		fpsInterval = 900 / game.fps;
		cancelAnimationFrame(game.loop);
		setTimeout(rafLoops, 1);
	}
	
	function rafLoops(){		
		game.loop = requestAnimationFrame(rafLoops);
		//var now = Date.now();
		//var elapsed = now - then;	
		//if (elapsed > fpsInterval) {
		//	then = now - (elapsed % fpsInterval);
			loopFunc();
		//}
	}
		
	function grid(){
		var totalX = screenW/100;
		var totalY = screenH/100;
		garis (3,3, screenW, 3, 3, "#ff6969");
		garis (3,3, 3, screenH, 3, "#4d94ff");
		for (var i = 0; i <= totalX; i++){
			if (i > 0){
			teks(i*100, i*100, 20,"Calibri-bold-15pt-center-#ff6969");
			garis(i*100, 25, i*100, screenH, 0.8, "#ff6969");			
			}
			for (var j=0; j<10; j++){
				garis(i*100+j*10, 3, i*100+j*10, screenH, 0.3, "#ffffff");				
			}
		}
		for (i = 0; i <= totalY; i++){
			if (i > 0){
			teks(i*100, 8, i*100+3, "Calibri-bold-15pt-left-#4d94ff"); 
			garis(40, i*100, screenW, i*100, 0.8, "#4d94ff");
			}
			for (j=0; j<10; j++){
				garis(3, i*100+j*10, screenW, i*100+j*10, 0.3, "#ffffff");
			}
		}
		
	}
	function garis(x1,y1, x2, y2, tbl=1, clr="#000", st=""){
		if (st.length>0){
			var stx = st.split("-");
			if (stx[0] == "dash"){
				if (stx[1] == undefined || stx[1] == null) stx[1] = 5;
				if (stx[2] == undefined || stx[2] == null) stx[2] = 3;
				var dashArr = [];				
				for (var i=1;i<stx.length;i++){
					dashArr.push(stx[i]);
				}
				konten.setLineDash(dashArr);
			}
		}
		konten.strokeStyle = clr;
		konten.lineWidth = tbl;
		konten.beginPath();
		konten.moveTo(x1,y1);
		konten.lineTo(x2,y2);
		konten.stroke();
		konten.setLineDash([]);
	}
	
	var kedip = 0;
	function cekAlign(txt){
		var res = txt;
		if (txt == "tengah") res = "center";
		if (txt == "kiri") res = "left";
		if (txt == "kanan") res = "kanan";
		return res;
	}
	function cekWarna(txt){
		var res = txt;
		var cl = txt.split("|");
		if (cl[0] == "hitam") res = "black";
		if (cl[0] == "putih") res = "white";
		if (cl[0] == "biru") res = "#0066ff";
		if (cl[0] == "hijau") res = "#39f43e";
		if (cl[0] == "merah") res = "#ed2d2d";
		if (cl[0] == "jingga") res = "#ffd146";
		if (cl[0] == "kuning") res = "#ffea00";
		if (cl[0] == "ungu") res = "#b026ff";
		if (cl[0] == "pink") res = "#ff7e7e";
		if (cl[0] == "tosca") res = "#0faf9a";
		if (cl[0] == "abuabu") res = "#7a7a7a";
		var res2 = "none";
		if (cl.length>1){
			if (cl[1] == "hitam") res2 = "black";
			if (cl[1] == "putih") res2 = "white";
			if (cl[1] == "biru") res2 = "#0066ff";
			if (cl[1] == "hijau") res2 = "#39f43e";
			if (cl[1] == "merah") res2 = "#ed2d2d";
			if (cl[1] == "jingga") res2 = "#ffd146";
			if (cl[1] == "kuning") res2 = "#ffea00";
			if (cl[1] == "ungu") res2 = "#b026ff";
			if (cl[1] == "pink") res2 = "#ff7e7e";
			if (cl[1] == "tosca") res2 = "#0faf9a";
			if (cl[1] == "abuabu") res2 = "#7a7a7a";
		}
		var ob = {c1:res, c2:res2}
		return ob;
	}
	function teks(txt, px, py, stl=""){
		var efek = 0;
		var st = stl; 
		if (stl == ""){
			//Calibri-normal-30pt-left-hitam-normal-1.6
			st = game.font;
		}
		st = st.split("-");
			//konten.font = "bold 14pt Calibri";
			//konten.fillStyle = '#000';
			//konten.textAlign = 'center';
		//}else{		
			//parsing dulu font nya
			//"Calibri-bold-30pt-left-biru|hitam-kedip
			var fnt = ""
			if (st.length == 1){
				konten.font = "bold 14pt "+st[0];
				konten.fillStyle = '#000';
				konten.textAlign = 'center';
			}
			if (st.length == 2){
				konten.font = st[1]+" 14pt "+st[0];
				konten.fillStyle = '#000';
				konten.textAlign = 'center';
			}
			if (st.length == 3){
				konten.font = st[1]+" "+st[2]+" "+st[0];
				konten.fillStyle = '#000';
				konten.textAlign = 'center';
			}
			if (st.length == 4){
				konten.font = st[1]+" "+st[2]+" "+st[0];
				konten.fillStyle = '#000';
				konten.textAlign = cekAlign(st[3]);
			}
			if (st.length == 5){
				konten.font = st[1]+" "+st[2]+" "+st[0];
				konten.fillStyle = cekWarna(st[4]).c1;
				konten.textAlign = cekAlign(st[3]);
				//stroke
				if (cekWarna(st[4]).c2 != "none"){
					konten.strokeStyle = cekWarna(st[4]).c2;
				}
			}
			if (st.length >= 6){
				konten.font = st[1]+" "+st[2]+" "+st[0];
				konten.fillStyle = cekWarna(st[4]).c1;
				konten.textAlign = cekAlign(st[3]);
				//stroke
				if (cekWarna(st[4]).c2 != "none"){
					konten.strokeStyle = cekWarna(st[4]).c2;
				}
				//kedip
				if (st[5] == "kedip"){
					efek = 1;
					kedip++;
					if (kedip > 30) kedip = 0;
				}
			}
		//}
		if (efek == 1 && kedip < 13) {
			if (st.length>4 && cekWarna(st[4]).c2 != "none") konten.strokeText(txt, px, py);
			konten.fillText(txt, px, py);
		}   
		if (efek == 0){
			if (st.length>4 && cekWarna(st[4]).c2 != "none") konten.strokeText(txt, px, py);
			konten.fillText(txt, px, py);
		}
		return txt;
	}
	
	function teksHTML(s, x0, y0,  maxW, fnt="") {
		//parsing dulu font nya
		//Calibri-normal-20pt-left-hitam-1.6
		//"Calibri-30pt-left-col-1.6
		if (fnt == "") fnt = game.font;
		var jenisF = fnt.split("-");
		var font = jenisF[0]; 
		var fontsize = Number(jenisF[2].substring(0,2));		
		var align = jenisF[3];
		konten.textAlign = "left";
		var col = cekWarna(jenisF[4]).c1;
		var spasi = 1.5;
		if (jenisF[6] != undefined || jenisF[6]!= null){
			spasi = Number(jenisF[6]);			
		}
		//console.log("font = "+font+"  "+spasi+" "+align);
		// 2d canvas context, string, pos.x, pos.y, left/right/center, font, font height, color
		// Convert html code to a series of individual strings, each displayable by fillText().
		font = 'px '+font;
		var lines = []
		var line = [0]
		var part = '' // the text element preceding a '<'
		var cmd = ''
		var bold = false
		var italic = false
		var sup = false
		var sub = false
		var x = 0, y = 0
		var dx, start
		var legal = ['b', 'strong', 'i', 'em', 'sup', 'sub']
		var rx = 0;
		var words = "";
		var temp = "";
		var otemp = "";
		var sisa = part;
		var potong = "";
		
		function add_part() {
			var style = '';
			var fs = fontsize;
			if (bold) style += 'bold ';
			if (italic) style += 'italic ';
			if (sup || sub) {
				fs = 0.8*fontsize;
				if (sup) y -= 0.3*fontsize // y increases downward in 2D canvas
				else y += 0.3*fontsize
			}
			konten.font = style+fs+font;
			words = part.split(" ");
			temp = "";
			otemp = "";
			sisa = part;
			potong = "";
			rx = 0;
			for (var i=0; i<words.length;i++){
				otemp = temp;
				temp+=words[i]+" ";
				dx = x+konten.measureText(temp).width;
				rx = x+konten.measureText(otemp).width;
				if (dx > maxW){
					potong+=otemp;
					//console.log("temp >>>" +otemp);
					line.push([x,y,konten.font,otemp, rx]);
					//sisa yang belum ke push
					sisa = part.substring(potong.length);
					//netralkan semua
					i--;
					x = 0;
					y = 0;
					temp = "";
					//ganti baris
					lines.push(line);
					line = [0];				
				}
			}
			if (sisa.length > 0){
				//console.log("sisa >>" +sisa);
				dx = konten.measureText(sisa).width;
				rx = x+dx;
				line.push([x, y, konten.font, sisa, rx]);			
				part = '';			
				x += dx;
			}
			//diubah disini*/
			
		}

		function end_line() {
			if (part !== '') add_part()
			line[0] = x
			lines.push(line)
			line = [0]
			x = y = 0
		}

		for (var i=0; i<s.length; i++) {
			var c = s[i]
			if (c == '\n') {
				end_line()
			} else if (c != '<') {
				part += c // a part of the text
			} else { // encountered '<'
				//if (part !== '') add_part()
				start = i+1
				i++
				cmd = s[i]
				var end = false
				if (cmd == '/') {
					cmd = ''
					end = true
				}
				var ok = true
				for (i=i+1; i<s.length; i++) {
					if (s[i] == '<') { // This means that the intial '<' did not start a command
						i = i-1 // back up
						part += '<'+cmd
						add_part()
						ok = false // signal that we encountered '<'
						break
					}
					if (s[i] == '>') break
					cmd += s[i]
				}
				if (!ok) continue
				if (cmd == 'br' || cmd == 'br/') {
					end_line()
				} else {
					if (legal.indexOf(cmd) >= 0 && part !== '') add_part()
					switch (cmd) {
						case 'b':
						case 'strong':
							bold = !end
							break
						case 'i':
						case 'em':
							italic = !end
							break
						case 'sup':
							sup = !end
							if (end) y = 0
							break
						case 'sub':
							sub = !end
							if (end) y = 0
							break
						default:
							part += '<'+cmd+'>'
					}
				}
			}
		}
		//sisa text yang masih belum keparsing
		//console.log("sisa t = "+part);
		if (part.length > 0) {
			words = part.split(" ");
			temp = "";
			otemp = "";
			sisa = part;
			potong = "";
			konten.font = fontsize+font;
			for (i=0; i<words.length;i++){
				otemp = temp;
				temp+=words[i]+" ";
				dx = x+konten.measureText(temp).width;
				rx = x+konten.measureText(otemp).width;
				if (dx > maxW){
					potong+=otemp;
					//console.log("temp >>>" +temp);
					line.push([x,y,konten.font,otemp, rx]);
					//sisa yang belum ke push
					sisa = part.substring(potong.length);
					//netralkan semua
					x = 0;
					y = 0;
					i--;
					temp = "";
					//ganti baris
					lines.push(line);
					line = [0];				
				}
			}
			if (sisa.length > 0){
				//console.log("sisa >>" +sisa);
				dx = konten.measureText(sisa).width;
				rx = x+dx;
				line.push([x, y, konten.font, sisa, rx]);	
				lines.push(line);
				part = '';			
				x += dx;
			}
			/*line.push([x, y, fontsize+font, part])
			//console.log(part);
			konten.font = fontsize+font
			line[0] = x + konten.measureText(part).width
			lines.push(line)*/
		}
		var width, L
		var nline = 0
		// Each line in lines starts with the total width of the line, followed by
		// elements of the form {x, y, font, text}, where x and y start at zero.
		var maxwidth = -1	
		for (L in lines) {
			if (lines[L][0] > maxwidth) maxwidth = lines[L][0]
			//console.log(">>"+lines[L]);
		}
		for (L in lines) {
			//console.log("y before = "+y0);
			y0 += spasi*fontsize;
			nline++		
			//console.log("y before = "+y0+ "   >> "+nline);
			for (var p in lines[L]) {
				var k = lines[L][p]
				
				if (k[1] === undefined) {
					width = k
					continue
				}
				var ta = lines[L][lines[L].length-1];
				if (ta.length>1){
					rx = ta[4];
					//console.log("rx = "+rx);
				}
				konten.font = k[2]
				konten.fillStyle = col;
				switch (align) {
					case 'left':
						x = x0 + k[0]
						y = y0 + k[1]
						break
					case 'center':
						x = x0 +  maxW/2+ k[0] - rx/2;
						y = y0 + k[1]
						break
					case 'right':
						x = x0 + k[0]+maxW - rx;
						y = y0 + k[1]
						break
					default:
						throw new Error(align+' is not a possible alignment option.')
				}
				//console.log(maxW+" "+k[3]);
				konten.fillText(k[3], x, y)
			}
		}
	}
	function mainkanSuara(snd, vol=100){
		if (game.suaraAktif){
			var sa = new Sound(snd);
			
			sa.volume(vol/100);
			sa.play();
		}
	}
	
	function musik(snd, vol=50){		
		if (!game.musikAktif){
			game.musikAktif = true;
			game.musik = new Sound(snd);
			game.musik.loop();
			game.musik.volume(vol/100);
		}
	}
	
	function acak(num){
		return Math.floor(Math.random()*num);
	}
	
	function jarak(x1, y1, x2, y2){
		var res = 0;
		res = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
		return res;
	}
	
	function setGameOver(kondisi, func){
		game.gameOver = kondisi;
		game.func = func;
	}
	
	//bg 
	var bgx = 0;
	var bgy = 0;
	function latar(img, sx=0, sy=0){
		if (!game.pause) bgx += sx;
		if (bgx > img.width) bgx -= img.width;
		if (bgx < 0) bgx += img.width;
		if (!game.pause) bgy += sy;
		if (bgy > img.height) bgy -= img.height;
		if (bgy < 0) bgy += img.height;
		//tile 
		var tx = Math.ceil(screenW/img.width);
		var ty = Math.ceil(screenH/img.height);
		for (var i = -1; i < tx;i++){
			for (var j = -1; j < ty; j++){
				konten.drawImage(img, 0, 0, img.width, img.height, i*img.width+bgx, j*img.height+bgy, img.width, img.height);
			}
		}		
	}
	
	function tambahScore(nl){
		game.score+=nl;
		if (game.score>game.hiScore) game.hiScore = game. score;
	}
	
	
	//-------- add to game lib
function acakArray(arr){
	for (var i=0;i<arr.length;i++){
		var temp = arr[i];
		var ac = acak(arr.length)
		arr[i] = arr[ac];
		arr[ac] = temp;
	}
	return arr;
}

//-------- mouse ------
function cekHit(ob1, ob2){
	var res = false;
	if (ob1.x > ob2.x-ob2.lebar/2 && ob1.x < ob2.x+ob2.lebar/2 && ob1.y > ob2.y-ob2.tinggi/2 && ob1.y < ob2.y+ob2.tinggi/2)res = true;
	return res;
}

function hitPoint(px, py, ob2){
	var res = false;
	if (ob2 != undefined){
		if (px > ob2.x-ob2.lebar/2 && px < ob2.x+ob2.lebar/2 && py > ob2.y-ob2.tinggi/2 && py < ob2.y+ob2.tinggi/2)res = true;
	}
	return res;
}

function tabrakan(ob1, ob2){
	var res = false;
	if (ob1 != undefined && ob2 != undefined){
		if (hitPoint(ob1.x - ob1.lebar/2, ob1.y - ob1.tinggi/2, ob2)) return true;
		if (hitPoint(ob1.x + ob1.lebar/2, ob1.y - ob1.tinggi/2, ob2)) return true;
		if (hitPoint(ob1.x - ob1.lebar/2, ob1.y + ob1.tinggi/2, ob2)) return true;
		if (hitPoint(ob1.x + ob1.lebar/2, ob1.y + ob1.tinggi/2, ob2)) return true;
	}
	return res;
}


var movingOb = {};
function efekMasuk(nama, img, px, py, asal){
	if (movingOb[nama] == undefined){		
		movingOb[nama] = new Object();
		if (asal == "kiri"){
			movingOb[nama].x = -img.width*2;
			movingOb[nama].y = py;
		}
		if (asal == "kanan"){
			movingOb[nama].x = game.lebar+img.width*2;
			movingOb[nama].y = py;
		}
		if (asal == "atas"){
			movingOb[nama].x = game.lebar/2;
			movingOb[nama].y = -img.height*2;
		}
		if (asal == "bawah"){
			movingOb[nama].x = game.lebar/2;
			movingOb[nama].y = game.tinggi+img.height*2;
		}
		movingOb[nama].img = img;
	}else{
		//gerakkan
		if (jarak(movingOb[nama].x, movingOb[nama].y, px, py)<2){
			movingOb[nama].x = px;
			movingOb[nama].y = py;
		}else{
			movingOb[nama].x+=(px-movingOb[nama].x)/10;
			movingOb[nama].y+=(py-movingOb[nama].y)/10;
		}
	}
	sprite(movingOb[nama]);
}

function acakAngka(str){
	var res = [];
	var res2 = [];
	var ang = str.split("-");
	if (ang.length == 1) res2.push(acak(parseInt(ang[0])));
	if (ang.length > 1){
		var a1 = parseInt(ang[0]);
		var a2 = parseInt(ang[1]);
		for (var i=a1;i<=a2;i++){
			res.push(i);
		}
		//acak
		res2 = acakArray(res);
	}
	return res2;
}
/* View in fullscreen */
	function openFullscreen() {
		 var scene = document.getElementById("gameArea");
		 // if (scene.requestFullscreen) {
		//	scene.requestFullscreen();
		//  } else if (scene.webkitRequestFullscreen) { /* Safari */
		//	scene.webkitRequestFullscreen();
		//  } else if (scene.msRequestFullscreen) { /* IE11 */
		//	scene.msRequestFullscreen();
		// }
		// Supports most browsers and their versions.
			var requestMethod = scene.requestFullScreen || scene.webkitRequestFullScreen || scene.mozRequestFullScreen || scene.msRequestFullScreen;

			if (requestMethod) { // Native full screen.
				requestMethod.call(scene);
			} else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
				var wscript = new ActiveXObject("WScript.Shell");
				if (wscript !== null) {
					wscript.SendKeys("{F11}");
				}
			}		
		resize(true);
		
	}	
	function closeFullscreen() {
	  if (document.exitFullscreen) {
		document.exitFullscreen();
	  } else if (document.webkitExitFullscreen) { /* Safari */
		document.webkitExitFullscreen();
	  } else if (document.msExitFullscreen) { /* IE11 */
		document.msExitFullscreen();
	  }
	  resize(false);
	}
	function screenSize(full){
		if (full){
			newWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
			newHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);			
		}else{
			newWidth = game.oriW;
			newHeight = game.oriH;
		}
	}
	function resize(full = true){
		screenSize(full);
		var gA = document.getElementById("gameArea");
		if (full){
			gameArea.width = newWidth;	
			gameArea.height = newHeight;
			setTimeout(function() {						
				screenSize(true);
				gameArea.height = newHeight;
				getOrient();
				trace("area full = "+gameArea.width+" x "+gameArea.height);	
				//portrait atau landscape
				if (game.orient == "portrait"){
					trace("Portrait mode");
					if (isMobile) gA.style.transform = "rotate(0deg)";
					gA.style.width = newWidth + 'px';
					gA.style.height = newHeight + 'px';
					canvas.style.width = "100%";
					canvas.style.height = "100%";					
				}else{
					//landscape
					trace("Landscape mode");
					if (isMobile) gA.style.transform = "rotate(-90deg)";
					gA.style.width = newWidth + 'px';
					gA.style.height = newHeight + 'px';
					canvas.style.width = "100%";
					canvas.style.height = "100%";
				}
			}, 10);
		}else{	
			//setTimeout(function() {
				gameArea.width = game.areaW;			
				screenSize(false);
				gameArea.height = game.areaH;
				getOrient();
				trace("area = "+gameArea.width+" x "+gameArea.height);
				canvas.style.width = "100%";
				canvas.style.height = "100%";
				gA.style.width = game.areaW + 'px';
				gA.style.height = game.areaH + 'px';
			//}, 1000);
		}
		
	}
	
	function forceFullscreen(){
		var gA = document.getElementById("gameArea");
		if (isMobile && game.fullscreen){
			newWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
			newHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
			if (gameArea.height != newHeight){
				gameArea.height = newHeight;

			}			
		}		
	}
	
	function getOrient(){
	//orientasi
	game.orient = "landscape";
		if (isMobile){
			/*if (window.innerWidth<window.innerHeight){
				game.orient = "portrait";
			}else{
				game.orient = "landscape";
			}*/
			var orientation = window.orientation;

			if (orientation === 0 || orientation === 180) {
				// Portrait orientation
				game.orient = "portrait";
			} else if (orientation === 90 || orientation === -90) {
				// Landscape orientation
				game.orient = "landscape";
			}
		}
	}
	
	function resizeMobile(){
		if (game.fullscreen){
			resize(true);
		}else{
			resize(false);
		}
	}
//--------------------touch ----------------------------
	function deteksiMobile() {
		const toMatch = [
			/Android/i,
			/webOS/i,
			/iPhone/i,
			/iPad/i,
			/iPod/i,
			/BlackBerry/i,
			/Windows Phone/i
		];

		return toMatch.some((toMatchItem) => {
			return navigator.userAgent.match(toMatchItem);
		});
	}
	//--------------touch ------------------
	function touchMove(e){
		 e.preventDefault();
		 checkTouchMove(e.targetTouches);
	}
	function touchEnd(e){
		isTouch = false;
		game.mouseDitekan = false;
		e.preventDefault();
		checkTouchEnd(e.targetTouches);
	}
	function touchStart(e){
		 e.preventDefault();
		 game.mouseDitekan = true;
		 isTouch = true;
		 //trace("joy");
		 checkTouchStart(e.targetTouches);
	}
	var out="";
	function checkTouchStart(tt){	
		updateOffset();
		for (index1 = tt.length - 1; index1 > -1; -- index1) {
			touch = tt[index1];
			var tx = (touch.pageX-totalOffsetX);
			var ty = (touch.pageY-totalOffsetY);
			tx = Math.round( tx * (canvas.width / canvas.offsetWidth) );
			ty = Math.round( ty * (canvas.height / canvas.offsetHeight) );
			doTouchStart(tx, ty, index1);
			game.mouse = {x:tx, y:ty};
			//trace(touch.pageX+" "+totalOffsetX);
		}		
	}
	function checkTouchMove(tt){	
		updateOffset();	
		for (index1 = tt.length - 1; index1 > -1; -- index1) {
			touch = tt[index1];
			var tx = (touch.pageX-totalOffsetX);
			var ty = (touch.pageY-totalOffsetY);
			tx = Math.round( tx * (canvas.width / canvas.offsetWidth) );
			ty = Math.round( ty * (canvas.height / canvas.offsetHeight) );
			doTouchMove(tx, ty, index1);
			game.mouse = {x:tx, y:ty};
		}		
	}
	function checkTouchEnd(tt){	
		var id = document.getElementById("canvas");			
		doTouchEnd();
				
	}
	function doTouchStart(tx, ty, id){
		//console.log(id);
		//vMenu
		if (game.vMenu.length>0){
			game.selectMenu = false;
			for (var i=0;i<game.vMenu.length;i++){
				var ob = game.vMenu[i];
				if (tx>ob[1] && tx<ob[1]+ob[3] && ty>ob[2] && ty<ob[2]+ob[4]){
					if (game.selectID == ob[0]){
						game.selectMenu = true;
						return;
					}else{
						game.selectID = ob[0];
						return;
					}					
				}
			}
		}
		//joyStick
		if (joyStick.stat && !joyStick.out){
			//virtual joy
			var okpos = false;
			if (joyStick.pos == "left" && tx<screenW/2 ) okpos = true;
			if (joyStick.pos == "right" && tx>screenW/2 ) okpos = true;
			if (okpos){
				joyStick.out = true;
				joyStick.px = tx;
				joyStick.py = ty;
				joyStick.sx = tx;
				joyStick.sy = ty;
				joyStick.id = id;
			}			
		}	
		//spasi
		if (joyStick.spasi){
			var spj = jarak(joyStick.spx, joyStick.spy, tx, ty);
			if (spj<joyStick.rad*2) {
				game.spasi = true;
			}			
		}
	}
	function doTouchMove(tx, ty, id){
		if (joyStick.stat){
			//virtual joy
			if (joyStick.out && joyStick.id == id){
				//var rad =  -Math.atan2((joyStick.px - tx), (joyStick.py - ty)); 
				var rad =  -Math.atan2((tx-joyStick.px), (ty-joyStick.py)); 
				var ang =  rad * 180 / 3.14159265359+90;
				var jarak_titik = Math.sqrt((joyStick.px - tx)*(joyStick.px - tx)+(joyStick.py - ty)*(joyStick.py - ty));
				if (jarak_titik > joyStick.rad) jarak_titik = joyStick.rad;
				joyStick.sx = jarak_titik*Math.cos(ang*3.14159265359/180);
				joyStick.sy = jarak_titik*Math.sin(ang*3.14159265359/180);
				joyStick.angle = ang;
				//arah
				joyStick.atas = false;
				joyStick.bawah = false;
				joyStick.kiri = false;
				joyStick.kanan = false;
				game.atas = false;
				game.bawah = false;
				game.kiri = false;
				game.kanan = false;
				if (ang<-68 && ang>-23){
					joyStick.kanan = true;
					joyStick.atas = true;
					game.kanan = true;
					game.atas = true;
				}else if (ang>-23 && ang<23) {
					joyStick.kanan = true;
					game.kanan = true;
				}else if (ang>23 && ang<68){
					joyStick.kanan = true;
					joyStick.bawah = true;
					game.kanan = true;
					game.bawah = true;
				}else if (ang>68 && ang<113){
					joyStick.bawah = true;
					game.bawah = true;
				}else if (ang>113 && ang<158){
					joyStick.kiri = true;
					joyStick.bawah = true;
					game.kiri = true;
					game.bawah = true;
				}else if (ang>158 && ang<203) {
					joyStick.kiri = true;
					game.kiri = true;
				}else if (ang>203 && ang<248){
					joyStick.kiri = true;
					joyStick.atas = true;
					game.kiri = true;
					game.atas = true;
				}else if (ang>248 || ang<-68) {
					joyStick.atas = true;
					game.atas = true;
				}
			}
		}
	}
	function doTouchEnd(){
		if (joyStick.stat){
			//virtual joy
			if (joyStick.out){
				game.atas = false;
				game.bawah = false;
				game.kiri = false;
				game.kanan = false;
				joyStick.out = false;
				joyStick.atas = false;
				joyStick.bawah = false;
				joyStick.kiri = false;
				joyStick.kanan = false;				
			}
		}
		game.spasi = false;
	}
	//draw joyStick
	function gambarJoyStick(){
		if (!game.isMobile) return;
		konten.globalAlpha = 0.5;
		if (joyStick.stat && joyStick.out){
			konten.lineWidth = 5;
			konten.strokeStyle = "#03fcf0";
			konten.beginPath();
			konten.arc(joyStick.px, joyStick.py, joyStick.rad, 0, 2 * Math.PI, false);
			konten.stroke();
			konten.beginPath();
			konten.lineWidth = 3;
			konten.arc(joyStick.px+joyStick.sx, joyStick.py+joyStick.sy, joyStick.rad/2, 0, 2 * Math.PI, false);
			konten.stroke();			
		}
		if (joyStick.spasi && game.isActive){
			konten.beginPath();
			konten.arc(joyStick.spx, joyStick.spy, joyStick.rad/2, 0, 2 * Math.PI, false);
			konten.stroke();
		}
		konten.globalAlpha = 1;
	}
	function resizeBtn(px, py){
		if (dataGambar.maxBtn != undefined && dataGambar.minBtn !=undefined){
			if (!game.fullscreen){
				sizeBtn = tombol(dataGambar.maxBtn, px, py);
				if (tekan(sizeBtn)){
					game.fullscreen = true;
					game.mouseDitekan = false;
					openFullscreen();			
				}
				if (document.fullscreenElement != null){
					game.fullscreen = true;
					resize(true);
				}
			}else{		
				sizeBtn = tombol(dataGambar.minBtn, px, py);
				if (tekan(sizeBtn)){
					game.fullscreen = false;
					game.mouseDitekan = false;
					closeFullscreen();			
				}
				//escape
				if (document.fullscreenElement === null){
					game.fullscreen = false;
					resize(false);
				}
			}
		}
	}

	function tiltWarn(){
		gambarFull(dataGambar.tilt);	
	}
	
	function isOK(){
	var res = true;
	if (isMobile){		
		if (game.fullscreen && game.orient != "landscape"){
			res = false;
		}
	}
	return res;
}

function cloneArray(arr){
	return JSON.parse(JSON.stringify(arr));
}
/*------------------platformer tiling-------------------------
Kode di bawah ini digunakan khusus untuk membuat tiling game platformer
untuk membuat peta gunakan map editor yang bisa diunduh pada situs https://www.wandah.org/tiling-editor
//------------------------------------------------------------*/
	function setPlatform(map, img, tileW, hero){
		game.map = cloneArray(map);
		game.tilesetSize = img.width;
		game.tileset = img;
		game.tileW = tileW;
		game.tile_num = Math.floor(game.tilesetSize/game.tileW);
		game.charX = 1;
		game.charY = 5;
		game.screenW = Math.floor(game.lebar/(game.tileW*game.skalaSprite))+2;
		game.screenH = Math.floor(game.tinggi/(game.tileW*game.skalaSprite))+2;
		trace("tile setup = "+game.screenW+" x "+game.screenH);
		game.cameraX = 0;
		game.cameraY = 0;
		game.posX = 0;
		game.posY = 0;
		game.arenaX = -game.charX*game.tileW;
		game.arenaY = -game.charY*game.tileW;
		game.lompatY = 0;
		game.karakter = hero;
		game.itemID = 0;
		game.musuhID = 0;
		game.triggerID = 0;
		game.gravitasi = 0.5;
		game.type = "platformer";
		game.deadAnim = false;
		game.platformItems = {};
		game.platformTrigger = {};
		game.platformEnemies = [];
	}
	function setPlatformItem(id, img){
		game.platformItems["item_"+id] = img;
		game.platformItems["frame_"+id] = Math.floor(img.width/game.tileW);
	}
	function setPlatformTrigger(id, img){
		game.platformTrigger["item_"+id] = img;
		game.platformTrigger["frame_"+id] = Math.floor(img.width/img.height);
	}
	
	
	function sisa(num1, num2){
		var res = num1 - Math.floor(num1/num2)*num2;
		return res;
	}
	
	function buatLevel(){		
		var ox, oy, cx, cy;
		var minX = Math.floor(game.charX - (game.screenW/2));
		var minY = Math.floor(game.charY - (game.screenH/2));
		for (var i = 0; i < game.screenW+2; i++){
			for (var j = 0; j < game.screenH+2; j++){
				var tx = i+minX;
				var ty = j+minY;
				if (tx>= 0 && ty >= 0 && tx<game.map.length && ty < game.map[0].length){
					var t_type = game.map[tx][ty][1];
					var t_mode = game.map[tx][ty][0];
					var px = -(game.posX*game.skalaSprite)+game.cameraX+(i-1)*game.tileW*game.skalaSprite;
					var py = -(game.posY*game.skalaSprite)+game.cameraY+(j-1)*game.tileW*game.skalaSprite;
					//background
					if (t_type > -1){
						var sy = Math.floor(t_type / game.tile_num);
						var sx = t_type-(sy*game.tile_num);
						konten.drawImage(game.tileset, sx*game.tileW, sy*game.tileW, game.tileW, game.tileW, px, py, game.tileW*game.skalaSprite, game.tileW*game.skalaSprite);					
					}
					var i_type = game.map[tx][ty][2];
					//foreground
					if (i_type > 0){
						var iy = Math.floor(i_type / game.tile_num);
						var ix = i_type-(iy*game.tile_num);
						konten.drawImage(game.tileset, ix*game.tileW, iy*game.tileW, game.tileW, game.tileW, px, py, game.tileW*game.skalaSprite, game.tileW*game.skalaSprite);					
					}
					//karakter
					if (tx == game.charX && ty == game.charY && !game.deadAnim){
						game.karakter.x = game.cameraX+(i-1)*game.tileW*game.skalaSprite;
						game.karakter.y = game.cameraY+(j-1)*game.tileW*game.skalaSprite+(game.karakter.tinggi*game.skalaSprite/2);									
					}					
					//items
					if (t_mode == 3){
						var item_type = game.map[tx][ty][3];
						if (item_type != undefined){
							if (game.platformItems["item_"+item_type] != undefined){
								var itemImg = game.platformItems["item_"+item_type];
								var itemFrm = sisa(game.timer, game.platformItems["frame_"+item_type]);
								konten.drawImage(itemImg, itemFrm*game.tileW, 0, game.tileW, game.tileW, px, py, game.tileW*game.skalaSprite, game.tileW*game.skalaSprite);
								//hero dapat item
								if (jarak(game.karakter.x, game.karakter.y, px+game.tileW*game.skalaSprite/2, py+game.tileW*game.skalaSprite/2) < game.tileW){
									game.itemID = item_type;
									game.map[tx][ty][0] = 0;
								}
							}
						}
					}
					//trigger 7
					if (t_mode == 7){
						var trigger_type = game.map[tx][ty][3];
						if (trigger_type != undefined){
							if (game.platformTrigger["item_"+trigger_type] != undefined){
								var itemImg = game.platformTrigger["item_"+trigger_type];
								var itemFrm = sisa(game.timer, game.platformTrigger["frame_"+trigger_type]);								
								//mencari mana yang lebih besar tinggi sprite atau lebar tile
								//digunakan untuk sprite yang ukurannya beda
								var itemW = Math.max(game.tileW, itemImg.height);
								var gsr = (game.tileW-itemW)*game.skalaSprite;
								konten.drawImage(itemImg, itemFrm*itemW, 0, itemW, itemW, px+gsr, py+gsr, itemW*game.skalaSprite, itemW*game.skalaSprite);
								//hero sampai di trigger
								if (tx == game.charX && ty == game.charY && game.aktif){
									game.triggerID = trigger_type;
								}
							}
						}
					}
					//musuh
					if (t_mode == 5){
						var m_id = game.map[tx][ty][4];
						if (m_id != undefined){
							var musuh = game.platformEnemies[m_id];
							if (musuh != undefined){
								musuh.x = px+musuh.posX*game.skalaSprite+game.tileW*game.	skalaSprite/2;
								musuh.y = py+musuh.posY*game.skalaSprite+game.tileW*game.skalaSprite/2;
								loopSprite(musuh);
							}
						}
					}
					//grid
					//kotak(px, py, 64, 64);
				}
			}
		}
		//musuh
		gerakMusuh();
		//loopSprite karakter
		loopSprite(game.karakter);
		if (game.aktif && game.type == "platformer"){		
			//jatuh
			game.lompatY+= game.gravitasi;
			//naik
			if (game.lompatY<0){
				if (game.karakter.animLompat != 0) game.karakter.img = game.karakter.animLompat;
				oy = game.posY+game.lompatY+game.karakter.tinggi/2*game.skalaSprite;;
				cy = game.charY;
				if (oy<0){
					cy = game.charY - 1;
				}
				if (cy > 0){
					//naik bisa 0 atau cloud = 8 atau item = 3 musuh = 5 triger = 7
					if (game.map[game.charX][cy][0] == 0 || game.map[game.charX][cy][0] == 8 || game.map[game.charX][cy][0] == 3 || game.map[game.charX][cy][0] == 5  || game.map[game.charX][cy][0] == 7){
						game.posY+=game.lompatY;
						if (game.posY<0){
							game.posY+=game.tileW;
							game.charY--;
						}	
					}
					//wall
					if (game.map[game.charX][cy][0] == 1) game.lompatY = 0;
					//dead
					if (game.map[game.charX][cy][0] == 10) heroDead();
				}
			}
			if (game.lompatY>0){				
				if (game.karakter.animJatuh != 0) game.karakter.img = game.karakter.animJatuh;
				game.lompat = true;
				oy = game.posY+game.lompatY+game.karakter.tinggi/2*game.skalaSprite;
				cy = game.charY;
				if (oy>game.tileW){
					cy = game.charY + 1;
				}
				if (cy < game.map[0].length){
					if (game.map[game.charX][cy][0] == 0 || game.map[game.charX][cy][0] == 3  || game.map[game.charX][cy][0] == 5 || game.map[game.charX][cy][0] == 7){
						game.posY+=game.lompatY;
						if (game.posY>game.tileW){
							game.posY-=game.tileW;
							game.charY++;
						}	
					}
					//wall / cloud
					if (game.map[game.charX][cy][0] == 1 || game.map[game.charX][cy][0] == 8){
						game.lompatY = 0;
						game.lompat = false;
						game.posY = 0;
						if (game.karakter.animDiam != 0) game.karakter.img = game.karakter.animDiam;
				
					}
					//dead
					if (game.map[game.charX][cy][0] == 10) heroDead();
				}
			}
		}
		//dead anim
		if (game.deadAnim && game.type == "platformer"){
			game.lompatY+= game.gravitasi;
			game.karakter.y += game.lompatY;
			game.karakter.rotasi+=2;
			if (game.karakter.y > game.tinggi){
				jalankanFungsi(game.gameOver);
			}
		}
	}
	
	function jalankanFungsi(func){
		if (func!= null) func();
	}
	
	function heroDead(){
		game.aktif = false;
		game.karakter.playOnce = true;
		if (game.karakter.animMati != 0) {
			game.karakter.img = game.karakter.animMati;
			game.karakter.frame = 1;			
		}
		game.deadAnim = true;
		game.lompatY = -10;
	}
	
	function gerakLevel(ob, sx, sy){
		var ox, oy, cx, cy;
		if (game.aktif){
			if (sx>0) {
				//kanan
				if (!game.lompat){
					if (ob.animJalan != 0) ob.img = ob.animJalan;
				}
				ox = game.posX+(ob.lebar/2)+sx-5;
				ob.skalaX = 1;
				cx = game.charX;
				if (ox > game.tileW){
					cx = game.charX + 1;
				}
				if (cx < game.map.length){
					if (game.map[cx][game.charY][0] == 0 || game.map[cx][game.charY][0] == 3 || game.map[cx][game.charY][0] == 5 || game.map[cx][game.charY][0] == 8 || game.map[cx][game.charY][0] == 7){
						game.posX+=sx;
						if (game.posX>game.tileW){
							game.posX-=game.tileW;
							game.charX++;
						}	
					}
					//dead
					if (game.map[cx][game.charY][0] == 10) heroDead();
				}
			}
			if (sx<0) {
				//kiri
				if (!game.lompat){
					if (ob.animJalan != 0) ob.img = ob.animJalan;
				}
				ox = game.posX+sx-(ob.lebar/2)+5;
				ob.skalaX = -1;
				cx = game.charX;
				if (ox < 0){
					cx = game.charX - 1;
				}
				if (cx > 0){
					if (game.map[cx][game.charY][0] == 0 || game.map[cx][game.charY][0] == 3  || game.map[cx][game.charY][0] == 5 || game.map[cx][game.charY][0] == 8 || game.map[cx][game.charY][0] == 7){
						game.posX+=sx;
						if (game.posX<0){
							game.posX+=game.tileW;
							game.charX--;
						}	
					}
				}
				//dead
				if (game.map[cx][game.charY][0] == 10) heroDead();
			}
			//lompat
			if (sy<0 && !game.lompat){
				game.lompat = true;
				game.lompatY = sy;
			}
		}
	}
	
	function setPlatformEnemy(id, ob){
		//loop cari posisi musuh tile id = 5
		for (var i = 0; i < game.map.length; i++){
			for (var j = 0; j < game.map[0].length; j++){
				if (game.map[i][j][0] == 5 && game.map[i][j][3] == id){
					var musuh = setSprite(ob.animDiam, 32, 32);
					musuh.dataGambar = ob;
					musuh.charX = i;
					musuh.charY = j;
					musuh.posX = 0;
					musuh.posY = 0;
					musuh.stat = 0;
					musuh.sx = 0;
					musuh.sy = 0;
					musuh.eTipe = id;
					musuh.count = 0;
					musuh.id = game.platformEnemies.length;
					game.platformEnemies.push(musuh);
					//tambahkan id baru ke peta
					game.map[i][j][4] = musuh.id;
				}
			}
		}
	}
	
	function gerakMusuh(){
		//musuh
		var ox, oy, cx, cy;
		for (var m=0; m<game.platformEnemies.length;m++){
			var musuh = game.platformEnemies[m];
			//masih hidup
			if (musuh.stat < 2){
				if (acak(300) == 134) {
					musuh.stat = 0;
					musuh.sx = 0;
					musuh.img = musuh.dataGambar.animDiam;
				}
				if (acak(100) == 14 && musuh.stat == 0) {
					musuh.stat = 1;
					musuh.img = musuh.dataGambar.animJalan;
					if (acak(12)>5){
						musuh.sx = 0.5;					
					}else{
						musuh.sx = -0.5;					
					}
				}
			}
			//musuh jalan
			if (musuh.stat == 1){
				//netralisir peta
				game.map[musuh.charX][musuh.charY][0] = 0;
				game.map[musuh.charX][musuh.charY][3] = 0;
				game.map[musuh.charX][musuh.charY][4] = 0;
				if (musuh.sx>0){
					ox = musuh.posX+(musuh.lebar/2)+musuh.sx;
					cx = musuh.charX;
					musuh.skalaX = 1;
					if (ox > game.tileW){
						cx = musuh.charX + 1;
					}
					if (cx < game.map.length){
						if (game.map[cx][musuh.charY][0] == 0 || game.map[cx][musuh.charY][0] == 5){
							musuh.posX+=musuh.sx;
							if (musuh.posX>game.tileW){
								musuh.posX-=game.tileW;
								musuh.charX++;
							}	
						}
						//tembok / lubang
						if (game.map[cx][musuh.charY][0] == 1 || game.map[cx][musuh.charY+1][0] == 0) musuh.sx *= -1;
					}
				}
				if (musuh.sx<0){
					ox = musuh.posX-(musuh.lebar/2)+musuh.sx;
					cx = musuh.charX;
					musuh.skalaX = -1;
					if (ox < 0){
						cx = musuh.charX - 1;
					}
					if (cx > 0){
						if (game.map[cx][musuh.charY][0] == 0 || game.map[cx][musuh.charY][0] == 5){
							musuh.posX+=musuh.sx;
							if (musuh.posX<0){
								musuh.posX+=game.tileW;
								musuh.charX--;
							}	
						}
						//tembok / lubang
						if (game.map[cx][musuh.charY][0] == 1 || game.map[cx][musuh.charY+1][0] == 0) musuh.sx *= -1;
					}
				}				
				//kembalikan peta ke mode tile 5
				game.map[musuh.charX][musuh.charY][0] = 5;
				game.map[musuh.charX][musuh.charY][3] = musuh.eTipe;
				game.map[musuh.charX][musuh.charY][4] = musuh.id;
			}	
			//kena pemain
			if (musuh.stat<2 && game.aktif){
				if (jarak(game.karakter.x, game.karakter.y, musuh.x, musuh.y)<game.tileW){
					if (game.lompatY>0){
						//injak musuh
						musuh.stat = 2;
						game.lompatY = -5;
						game.musuhID = musuh.eTipe;
					}else{
						heroDead();
					}
				}
			}
			if (musuh.stat == 2){
				musuh.img = musuh.dataGambar.animMati;
				musuh.count++;
				if (musuh.count>20){
					//hapus musuh dari map
					musuh.stat = 3;
					game.map[musuh.charX][musuh.charY][0] = 0;
					game.map[musuh.charX][musuh.charY][3] = 0;
					game.map[musuh.charX][musuh.charY][4] = 0;
				}
			}
		}
	}