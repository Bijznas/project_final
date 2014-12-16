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
		if(!game.players[i].isDisconnected){
			game.players[i].cash = game.players[i].cash - game.currentStake ;
			game.players[i].node.children[0].innerHTML = game.players[i].name +": <strong>Rs "+game.players[i].cash+"</strong>(Blind)";
			game.animateMoney({pos:i,money:game.currentStake});
		}
	} 
	
	pot.innerHTML = 'Rs '+data.sum;
	game.totalSum = data.sum;
	
  
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

socket.on("runtimer", function(data) {
	var pos = data.pos;
	
	 game.timer(data);
  
});

socket.on("cardseen", function(data) {
	var pos = data.pos;
	
	game.players[pos].isBlind = false;
	game.players[pos].node.children[0].innerHTML = game.players[pos].name +": <strong>Rs "+game.players[pos].cash+"</strong>(Card Seen)";
  
});

socket.on("folded", function(data) {
	var pos = data.pos;
	game.players[pos].node.children[1].style.width = '0px';
	game.players[pos].isFolded = true;
	game.createResultNode(pos, 'folded');
	
});
socket.on("continueresponse", function(data) {
	var pos = data.pos;
	var blind;
	game.currentStake = data.stake;
	game.players[pos].cash = data.cash;
	game.updatePotMoney(data.pot);
	game.updateStakeHolder(data.stake);
	
	
	if(game.players[pos].isBlind){
		blind='Blind';
	}else{
		blind='Card Seen';
	}
	
	game.updateUserInfo(pos,data.cash,blind);
	game.animateMoney({pos:pos,money:data.money});
	game.players[pos].node.children[1].style.width = '0px';
	
});

socket.on("callresponse", function(data) {
	var pos = data.pos;
	var blind;
	game.players[pos].cash = data.cash;
	game.updatePotMoney(data.pot);
	
	
	if(game.players[pos].isBlind){
		blind='Blind';
	}else{
		blind='Card Seen';
	}
	
	game.updateUserInfo(pos,data.cash,blind);
	game.animateMoney({pos:pos,money:game.currentStake});
	game.players[pos].node.children[1].style.width = '0px';
	
});

socket.on("player-timeout", function(data) {
	var pos = data.pos;
	game.players[pos].node.children[1].style.width = '0px';
	game.players[pos].isTimeout = true;
	game.createResultNode(pos, 'Out of time');
	
});

socket.on("show-winner", function(data) {
	var pos = data.pos;
	if(data.opens){
		game.showAllValidCards();////show all hands of the player only if it is called but not when the player wins automatically by being only player playing
	}
	
	game.players[pos].node.children[1].style.width = '0px';
	game.players[pos].cash = data.cash;
	game.createResultNode(pos, 'Winner (+Rs '+data.cash+")");
	game.updateUserInfo(pos,game.players[pos].cash,'Winner');
	game.updatePotMoney(0);
	infoArea.innerHTML = game.players[pos].name+' wins the game';
	
});

socket.on("disconnected", function(data) {
	var pos = data.pos;
	
	game.players[pos].isDisconnected = true;
	game.createResultNode(pos, 'Disconnected');
	
});
socket.on("restart", function(data) {
	var pos = data.pos;
	game.removeViewsFormRestart();
	
});





function StartGame(){
	var that = this;
	var pos;
	this.cardDeck;
	this.players=[];
	this.gamerid;
	this.butSeeMyCards;
	
	var butContinue = document.getElementById('continue');
	var butFold = document.getElementById('foldBut');
	var butCall = document.getElementById('callBut');
	
	var butincStake = document.getElementById('incrStake');
	var butdcrStake = document.getElementById('dcrStake');
	var pot = document.getElementById('pot');
	
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
		that.butSeeMyCards = document.createElement('button');
		that.butSeeMyCards.innerHTML = 'Look at the cards';
		that.butSeeMyCards.className = 'buttons';
		that.butSeeMyCards.style.left = positions[ppos].left-20 + 'px';
		that.butSeeMyCards.style.top = positions[ppos].top+50 + 'px';
		gameTable.appendChild(that.butSeeMyCards);
		
		
		//console.log(ppos);
		that.butSeeMyCards.onclick = function(){
			socket.emit('cardseen', {pos:ppos});
			butContinue.innerHTML = 'Play';
			for(var i = 0;i<that.players[ppos].hand.length;i++){
				setCardFront(that.players[ppos].hand[i]);
			}
			
			gameTable.removeChild(that.butSeeMyCards);	
		}
	}
	
	this.showAllValidCards = function(){
		for(var j = 0;j<that.players.length;j++){
			if(!that.players[j].isDisconnected&&!that.players[j].isTimeout&&!that.players[j].isFolded){
				for(var i = 0;i<that.players[j].hand.length;i++){
					setCardFront(that.players[j].hand[i]);
				}
			}
		}
	}
	
	this.timer = function(data){
		var childTimer=that.players[data.pos].node.children[1];
		if(childTimer.offsetWidth >= 140){
			childTimer.style.backgroundColor = '#009933';
		}
		if(childTimer.offsetWidth == 90){
			childTimer.style.backgroundColor = 'yellow';
		}
		if(childTimer.offsetWidth == 30){
			childTimer.style.backgroundColor = '#f00';
		}
		childTimer.style.width = data.countdown + 'px';
	}
	
	this.animateMoney = function(data){
		var cashDiv = document.createElement('span');
		cashDiv.className = 'cash-div';
		cashDiv.style.left = positions[data.pos].left + 'px';
		cashDiv.style.top = positions[data.pos].top + 'px';
		cashDiv.innerHTML = '<strong>-Rs </strong>'+data.money;
		gameTable.appendChild(cashDiv);
		
		
		
		var anim = new Animator();
		anim.animate(cashDiv,{top:positions[data.pos].top-100}, 1000, 0 , function(){
			console.log('finished');
			gameTable.removeChild(cashDiv);
			
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
		//that.players[size-1].node.innerHTML = that.players[size-1].name +"(Rs."+that.players[size-1].cash+")";
		
		var childText = document.createElement("span");
		childText.innerHTML = that.players[size-1].name +": <strong>Rs "+that.players[size-1].cash+"</strong>(Blind)";
		that.players[size-1].node.appendChild(childText);
		
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
	
	butContinue.onclick = function(){
		resetButtonBehaviour();	
		that.response({type:'continue',stake:that.currentStake})
	};
	foldBut.onclick = function(){that.response({type:'fold'})};
	
	
	callBut.onclick = function(){
		var pos = that.recognizePlayer().pos;
		
		if(that.players[pos].isBlind || !isBlindRemaining(that.players)){
			socket.emit('call', {pos:pos});
			resetButtonBehaviour();
		}else{
			infoArea.innerHTML = 'Cannot perform the action Call';	
		}
	};
	
	butincStake.onclick = function(){
		console.log('clkd');
		that.currentStake += 5;
		that.updateStakeHolder(that.currentStake);
		butincStake.disabled = true;
		butdcrStake.disabled = false;
	};
	butdcrStake.onclick = function(){
		that.currentStake -= 5;
		that.updateStakeHolder(that.currentStake);
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
	
	
	this.response = function(data){
		buttonControls.style.visibility = 'hidden';
		data.pos = that.recognizePlayer().pos;
		socket.emit('response', data);	
	}
	
	this.changeBlindToSeen = function(text){
		butContinue.innerHTML = text;
	}
	this.updateUserInfo= function(pos,cash,blindStat){
		that.players[pos].node.children[0].innerHTML = that.players[pos].name +": <strong>Rs "+cash+"</strong>("+blindStat+")";
	}
	this.updatePotMoney = function(money){
		that.totalSum = money;
		pot.innerHTML = 'Rs '+money;
	}
	this.updateStakeHolder= function(money){
		stakeHolder.innerHTML='Current Stake:Rs '+money;
	}
	function resetButtonBehaviour(){
		butdcrStake.disabled = true;
		butincStake.disabled = false;
	}
	
	this.removeViewsFormRestart= function(){
		infoArea.innerHTML ='Restarting the game';
		for( var i=0;i<that.players.length;i++){
			if(that.players[i].infoNode){
				gameTable.removeChild(that.players[i].infoNode);
			}
			for( var j=0;j<that.players[i].hand.length;j++){
				console.log(that.players[i].hand[j].divNode);
				if(that.players[i].hand[j].divNode){
					gameTable.removeChild(that.players[i].hand[j].divNode);
				}
			
			}
		}
		if(isPresent(gameTable,that.butSeeMyCards)){
			
			gameTable.removeChild(that.butSeeMyCards);
		}
	}
	
	
}