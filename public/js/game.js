'use strict';
var socket = io.connect('http://localhost');
var clientID = -1;
var glClientBoard = {};
var glClientInfo = {};
var info;
var butJoin = document.getElementById('joinBut');
var txtInput = document.getElementById('name');
var playerLists = document.getElementById('playerlist');
var infoArea = document.getElementById('showinfo');

var gameMenu = document.getElementById('game-menu');
var gamePlay = document.getElementById('game-play');

socket.on('id', function(data) {
	clientID = data.id;
	
	var players = data.players;
	var lii = document.createElement('li');
	lii.innerHTML = '<strong>Online Players</stromg>(' +players.length+ ')';
	playerLists.appendChild(lii);
	for(var i = 0;i< players.length;i++){
		var lii = document.createElement('li');
		lii.innerHTML = players[i].name;
		playerLists.appendChild(lii);
	}
	
});



butJoin.onclick = function(){
	if(txtInput.value != ''){
		socket.emit('join_game', txtInput.value);
	}else{
		console.log('Input Your Name');	
	}
    
            
    return false;

}

socket.on('joined', function(data) {
	info = data;
	var anim = new Animator();
	anim.animate(gameMenu,{left:1200},2000, 0,function(){console.log('kljkljlkj')},gamePlay);
	console.log(data);
	socket.emit('logging', txtInput.value);
});

socket.on("logging", function(data) {
	
	infoArea.innerHTML = data.message;
  
});
socket.on("timer", function(data) {
	
	infoArea.innerHTML = data.countdown;
  
});

socket.on("distribute_cards", function(data) {
	
	infoArea.innerHTML = 'Distributing Cards';
  
});





socket.on('chat message', function(msg){
document.getElementById('info').innerHTML += msg+'<br>';


});