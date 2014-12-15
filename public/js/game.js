'use strict';
var width = 81;
var height = 112;
var socket = io.connect('http://localhost');
var clientID = -1;
var positions = [{top:180, left:10, rot:10},{top:350, left:200, rot:10},{top:350, left:450, rot:10},{top:350, left:700, rot:10},{top:180, left:810, rot:10}];
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
var buttonControls = document.getElementById('controls');

var stakeHolder = document.getElementById('showStake');

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
	for(var i =0;i<data.players.length;i++){
		if(!game.isPlayerPresent(data.players[i])){
			game.players.push(data.players[i]);
			game.addView();
		}
	}
	
	
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


socket.on("collect_boat", function(data) {
	
	game.currentStake = data.stake;
		
	for(var i=0;i<game.players.length;i++){
		game.players[i].cash = game.players[i].cash - game.currentStake ;
		var cashDiv = document.createElement('div');
		cashDiv.className = 'cash-div';
		cashDiv.style.left = positions[i].left + 'px';
		cashDiv.style.top = positions[i].top + 'px';
		cashDiv.innerHTML = game.currentStake;
		gameTable.appendChild(cashDiv);
		
		game.animateMoney({element:cashDiv,pos:i});
		
	} 
	
  
});


socket.on("distribute_cards", function(data) {
	
	infoArea.innerHTML = 'Distributing Cards';
	game.cardDeck = data.deck;
	game.start(); 
  
});

socket.on("notifyTurn", function(data) {
	console.log('notified');
	game.decideTurn(data);
  
});

socket.on("timeout", function(data) {
	var pos = data.pos;
	
	 game.timer(data);
  
});

socket.on("cardseen", function(data) {
	var pos = data.pos;
	game.players[pos].isBlind = false;
	game.players[pos].node.innerHTML += 'card seen';
  
});

socket.on("folded", function(data) {
	var pos = data.pos;
	
	game.players[pos].isFolded = true;
	game.createResultNode(pos, 'folded');
	
});

socket.on("disconnected", function(data) {
	var pos = data.pos;
	
	game.players[pos].isDisconnected = true;
	game.createResultNode(pos, 'Disconnected');
	
});





function StartGame(){
	var that = this;
	var pos;
	this.cardDeck;
	this.players=[];
	this.gamerid;
	
	var butContinue = document.getElementById('continue');
	var butFold = document.getElementById('foldBut');
	var butCall = document.getElementById('callBut');
	
	var butincStake = document.getElementById('incrStake');
	var butdcrStake = document.getElementById('dcrStake');
	butdcrStake.disabled = true;
	butincStake.disabled = false;
	
	this.currentStake = 0;
	this.totalSum = 0;
	
	var positionmoneyCollector = {top:100, left:470}	
	this.moneyCollector;
	this.table;
	
	this.start = function(){
		console.log('started');	
		that.distributeCards(0);
		
	}
	
	this.distributeCards = function(pos){
		if(pos<that.players.length*3){
			that.cardDeck.cards[0].divNode = makeNode();
			gameTable.appendChild(that.cardDeck.cards[0].divNode);
			
			
			var anims = new Animator();
			anims.animate(that.cardDeck.cards[0].divNode,positions[pos%that.players.length],cardThrowSpeed,pos+1,that.distributeCards,null,that.players.length);
			var card = that.cardDeck.cards.shift();
			that.players[pos%that.players.length].hand.push(card);
		}
		
		if(pos == that.players.length*3){
			//console.log(that.getFlushResult(that.players[0].cards)+"    "+that.getFlushResult(that.players[1].cards)+"      "+that.getFlushResult(that.players[2].cards));
			console.log('playerid:'+that.gamerid);
			console.log('next please');
			
			that.showButSeeCards();
			var ppos = that.recognizePlayer().pos;
			socket.emit('round', {id:that.gamerid,cards:that.players[ppos].hand, pos:ppos});
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
			socket.emit('cardseen', {pos:ppos});
			for(var i = 0;i<that.players[ppos].hand.length;i++){
				setCardFront(that.players[ppos].hand[i]);
			}
			
			gameTable.removeChild(but);	
		}
	}
	
	this.timer = function(data){
		var childTimer=that.players[data.pos].node.children[0];
		if(childTimer.offsetWidth == 30){
			childTimer.style.backgroundColor = '#f00';
		}
		childTimer.style.width = data.countdown + 'px';
	}
	
	this.animateMoney = function(data){
		var anim = new Animator();
		anim.animate(data.element,{top:positions[data.pos].top-100}, 1000, 0 , function(){
			console.log('finished');
			gameTable.removeChild(data.element);
			
		},null,true);
	}
	
	this.showTotalCash = function(isFirst){
		if(isFirst){
			that.moneyCollector = document.createElement('div');
			that.moneyCollector.className = 'cash-div';
			that.moneyCollector.innerHTML = that.totalSum;
			that.moneyCollector.style.left = positionmoneyCollector.left + 'px';
			that.moneyCollector.style.top = positionmoneyCollector.top + 'px';
			gameTable.appendChild(that.moneyCollector);
		}
	}
	
	this.decideTurn = function(data){
		infoArea.innerHTML = that.players[data.pos].name+"'s Turn";
		console.log(that.players[data.pos].id +"    " + that.gamerid);
		 if(that.players[data.pos].id == that.gamerid){
			buttonControls.style.visibility='visible';	 
		}
	}
	
	this.isPlayerPresent = function(player){
		for(var i =0;i< that.players.length;i++){
			if(that.players[i].id == player.id){
				return true;	
			}	
		}
		return false;
	}
	
	this.addView = function(){
		var size = that.players.length;
		that.players[size-1].node = makePlayerNode(positions[size-1]);
		that.players[size-1].node.innerHTML = that.players[size-1].name +"(Rs."+that.players[size-1].cash+")";
		
		var child = document.createElement("div");
		child.className='childtimer';
		that.players[size-1].node.appendChild(child);
		
		
		gameTable.appendChild(that.players[size-1].node);
	}
	
	
	
	
	
	
	
	this.recognizePlayer = function(){
		for(var i =0;i<that.players.length;i++){
			if(that.players[i].id == that.gamerid){
					return {player:that.players[i],pos:i};
			}	
		}
		return false;
	}
	
	butContinue.onclick = function(){that.response('continue')};
	foldBut.onclick = function(){that.response('fold')};
	callBut.onclick = function(){
		var pos = that.recognizePlayer().pos;
		if(that.players[pos].isBlind || isBlindRemaining(that.players)){
			socket.emit('call', {pos:pos});
		}else{
			infoArea.innerHTML = 'Cannot perform the action Call';	
		}
	};
	
	butincStake.onclick = function(){
		console.log('clkd');
		that.currentStake += 5;
		stakeHolder.innerHTML='Current Stake:Rs '+that.currentStake;
		butincStake.disabled = true;
		butdcrStake.disabled = false;
	};
	butdcrStake.onclick = function(){
		that.currentStake -= 5;
		stakeHolder.innerHTML='Current Stake:Rs '+that.currentStake;
		
		butdcrStake.disabled = true;
		butincStake.disabled = false;	
	};
	
	this.createResultNode = function(pos, msg){
		game.players[pos].infoNode = document.createElement('div'); 
		game.players[pos].infoNode.className = 'divInfo';
		game.players[pos].infoNode.style.left = positions[pos].left-50 + 'px';
		game.players[pos].infoNode.style.top = positions[pos].top+100 + 'px';
		game.players[pos].infoNode.innerHTML = msg;
		
		gameTable.appendChild(game.players[pos].infoNode);
	}
	
	
	this.response = function(type){
		buttonControls.style.visibility = 'hidden';
		socket.emit('response', {pos:that.recognizePlayer().pos,type:type});	
	}
	
	
	
}