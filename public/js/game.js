'use strict';
var width = 81;
var height = 112;
var socket = io.connect('http://localhost');
var clientID = -1;
var positions = [{top:180, left:10, rot:10},{top:350, left:170, rot:10}];
var glClientBoard = {};
var glClientInfo = {};
var info;
var cardThrowSpeed = 300;
var butJoin = document.getElementById('joinBut');
var txtInput = document.getElementById('name');
var playerLists = document.getElementById('playerlist');
var infoArea = document.getElementById('showinfo');
var gameMenu = document.getElementById('game-menu');
var gamePlay = document.getElementById('game-play');
var gameTable = document.getElementById('game-table');

var game;

socket.on('id', function(data) {
	clientID = data.id;
	game = new StartGame();
	game.gamerid = data.id;
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

socket.on('joined', function(player) {
	info = player;
	var anim = new Animator();
	anim.animate(gameMenu,{left:1200},2000, 0,function(){console.log('kljkljlkj')},gamePlay);
	console.log(info);
	
	//socket.emit('logging', txtInput.value);
});

socket.on('addToView', function(data) {
	game.players.push(data.players);
	game.addView();
});

socket.on("logging", function(data) {
	
	infoArea.innerHTML = data.message;
  
});
socket.on("logid", function(playerid) {
	console.log('playerid'+playerid);
	game.gamerid = playerid;
  
});
socket.on("timer", function(data) {
	
	infoArea.innerHTML = data.countdown;
  
});

socket.on("distribute_cards", function(data) {
	
	infoArea.innerHTML = 'Distributing Cards';
	game.cardDeck = data.deck;
	game.start(); 
  
});

socket.on("notifyTurn", function(data) {
	
	infoArea.innerHTML = data.pos+1+' Turn';
	 
  
});

socket.on("timeout", function(data) {
	var pos = data.pos;
	
	 game.timer(data);
  
});





function StartGame(){
	var that = this;
	var pos;
	this.cardDeck;
	this.players=[];
	this.gamerid;	
	
	this.table;
	
	this.start = function(){
		console.log('started');	
		that.distributeCards(0);
		
	}
	
	this.timer = function(data){
		that.players[data.pos].node.children[0].style.width = data.countdown + 'px';
	}
	
	this.addView = function(){
		var size = that.players.length;
		that.players[size-1].node = makePlayerNode(positions[size-1]);
		that.players[size-1].node.innerHTML = that.players[size-1].name;
		
		var child = document.createElement("div");
		child.className='childtimer';
		that.players[size-1].node.appendChild(child);
		
		
		gameTable.appendChild(that.players[size-1].node);
	}
	
	
	
	this.distributeCards = function(pos){
		if(pos<that.players.length*3){
			that.cardDeck.cards[0].divNode = makeNode();
			gameTable.appendChild(that.cardDeck.cards[0].divNode);
			
			
			var anims = new Animator();
			anims.animate(that.cardDeck.cards[0].divNode,positions[pos%that.players.length],cardThrowSpeed,pos+1,that.distributeCards);
			var card = that.cardDeck.cards.shift();
			that.players[pos%that.players.length].hand.push(card);
		}
		
		if(pos == that.players.length*3){
			//console.log(that.getFlushResult(that.players[0].cards)+"    "+that.getFlushResult(that.players[1].cards)+"      "+that.getFlushResult(that.players[2].cards));
			console.log('playerid:'+that.gamerid);
			console.log('next please');
			
			that.showButSeeCards();
			socket.emit('round', that.gamerid);
			//that.collectBoatAmount(that.currentBoat);
			//ind.innerHTML="Collecting boat amount";
		}
	
	}
	
	this.showButSeeCards = function(){
		var ppos =  that.recognizePlayer().pos;
		console.log(ppos);
		var but = document.createElement('button');
		but.innerHTML = 'Look at the cards';
		but.className = 'buttons';
		but.style.left = positions[ppos].left-20 + 'px';
		but.style.top = positions[ppos].top+50 + 'px';
		gameTable.appendChild(but);
		
		
		//console.log(ppos);
		but.onclick = function(){
			for(var i = 0;i<that.players[ppos].hand.length;i++){
				setCardFront(that.players[ppos].hand[i]);
			}
			
			gameTable.removeChild(but);	
		}
	}
	
	this.recognizePlayer = function(){
		for(var i =0;i<that.players.length;i++){
			if(that.players[i].id == that.gamerid){
					return {player:that.players[i],pos:i};
			}	
		}
		return false;
	}
	
}