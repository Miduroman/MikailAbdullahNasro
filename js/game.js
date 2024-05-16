setGame("1200x600");
game.folder = "assets";
//file gambar yang dipakai dalam game
var gambar = {
	logo:"logo.png",
	startBtn:"tombolStart.png",
	cover:"cover.jpg",
	playBtn:"btn-play.png",
	maxBtn:"maxBtn.png",
	minBtn:"minBtn.png"	,
	idle:"Idle.png",
	run: "Run.png",
	jump: "Jump.png",
	fall: "Fall.png",
	hit: "hit.png",
	tileset: "Terrain.png",
	bg: "bg.png",
	item1: "Strawberry.png",
	item2: "Kiwi.png",
	musuh1Idle:"enemy1Idle.png",
	musuh1Run: "enemy1Run.png",
	musuh1HIt: "enemy1Hit.png",
	bendera: "Flag.png",
	mainlagi: "mainlagi.png"
}
//file suara yang dipakai dalam game
var suara = {
	bgm:"musik.mp3"
}


//load gambar dan suara lalu jalankan startScreen
loading(gambar, suara, startScreen);

function startScreen(){	
	hapusLayar("#67d2d6");
	tampilkanGambar(dataGambar.logo, 600, 250);
	var startBtn = tombol(dataGambar.startBtn, 600, 350);
	if (tekan(startBtn)){
		jalankan(halamanCover);
	}else if (game.spasi){
		jalankan(halamanCover);
	}
}
function halamanCover(){
	hapusLayar("#67d2d6");
	gambarFull(dataGambar.cover);
	var playBtn = tombol(dataGambar.playBtn, 1100, 500);
	if (tekan(playBtn)){
		setAwal();
		jalankan(gameLoop);
	}
	resizeBtn(1150,50);
	
}

function setAwal(){
	game.hero = setSprite(dataGambar.idle, 32, 32);
	game.skalaSprite = 2;
	game.hero.animDiam = dataGambar.idle;
	game.hero.animLompat = dataGambar.jump;
	game.hero.animJalan = dataGambar.run;
	game.hero.animJatuh = dataGambar.fall;
	game.hero.animMati = dataGambar.hit;
	game.skalaSprite = 2;
	setPlatform(this["map_"+game.level], dataGambar.tileset, 32, game.hero);
	game.gameOver = ulangiPermainan;
	//set item
	setPlatformItem(1, dataGambar.item1);
	setPlatformItem(2, dataGambar.item2);
	//set musuh
	var musuh1 = {};
	musuh1.animDiam = dataGambar.musuh1Idle;
	musuh1.animJalan = dataGambar.musuh1Run;
	musuh1.animMati = dataGambar.musuh1HIt;
	setPlatformEnemy(1, musuh1);
	//trigger
	setPlatformTrigger(1, dataGambar.bendera);
	musik(dataSuara.bgm);
}

function ulangiPermainan(){
	game.aktif = true;
	setAwal();
	jalankan(gameLoop);
}

function gameLoop(){
	hapusLayar();
	if (game.kanan){
		gerakLevel(game.hero, 3, 0);
	}else if (game.kiri){
		gerakLevel(game.hero, -3, 0);
	}
	if (game.atas){
		gerakLevel (game.hero, 0, -10);
	}
	latar(dataGambar.bg, 0, 0);
	buatLevel(); 
	cekItem();
	teks (game.score, 40, 60);
	resizeBtn(1150,50);
	
	}

function gameOver(){
	latar(dataGambar.bg, 0, 0);
	teks ("Game Over", 550, 250,);
	teks ("Score Anda = " + game.score, 520, 300);
	var mainlagi = tombol(dataGambar.mainlagi, 629, 330);
	if (tekan(mainlagi)){
		setAwal();
		jalankan(gameLoop);
		game.aktif = true;
		game.score = 0;
	}
}

function cekItem(){
	if (game.itemID > 0){
		tambahScore(10);
		game.itemID = 0;
	}
	if (game.musuhID != 0){
		tambahScore(25);
		game.musuhID = 0;
	}
	if (game.triggerID == 1){
		game.triggerID = 0;
		game.level++;
		setTimeout(ulangiPermainan, 0);
	}
	
	if (game.aktif == 0){
		jalankan(gameOver);
	}



}