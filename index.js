var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Card = require('./public/models/card.js');
var CardDeck = require('./public/models/CardDeck.js');
var Player = require('./public/models/player.js');
var functions = require("./public/js/functions");
var isRunning = false;
var count = 0;
app.use(express.static(__dirname + '/public'));
var gameState=0;//0->no players   1->one player wating   2->game will start in some second  3->game being played
var players = [];
var waiting_players = [];  
var start = false; 
var idTimeout;
var currentStake = 5;
var sumMoney = 0;


io.on('connection', function(socket){
	socket.emit('id', {
        id: socket.id, players : players
    });
	
	socket.on('join_game', function(name){
		var player = new Player(socket.id, name);
		
		//console.log(players.length + '  lengths');
		
		
		if (gameState == 0) {
			players.push(player);
			socket.emit('joined', player);
			io.sockets.emit('addToView', {players:players, playerid:player.id});
			
			
			io.emit("logging", {message: "Waiting for other players to join." });
			gameState=1;
			//socket.emit("logid",player.id);
			//io.sockets.emit("waiting", {message: "Waiting for other player to join."});
      	}else if(gameState == 1) {
			players.push(player);
			socket.emit('joined', player);
			io.sockets.emit('addToView', {players:players, playerid:player.id});
			
			gameState=2;
			io.sockets.emit("logging", {message: "Play will commence shortly."});
			//socket.emit("logid",player.id);
			var deck = new CardDeck();
			deck.setupCardsDeck();
			console.log(deck.cards[0]);
			//emit counter
			var countdown = 5; //3 seconds in reality...
			var idCounter = setInterval(function() {
				if(countdown == 1){
					
					gameState=3;
					clearInterval(idCounter);
					sumMoney = collectBoat(currentStake);
					io.sockets.emit('collect_boat', {stake: currentStake, sum:sumMoney});
					count = players.length;//this is for tracking the no. of players to receive ack. from them before the game can start
					io.sockets.emit('distribute_cards', { players: players, deck:deck });
					
				}else {
					countdown--;
					io.sockets.emit('timer', { countdown: 'The game will start in '+countdown+' secs' });
				}
			}, 1000);
		}else if(gameState!=3){
			players.push(player);
			socket.emit('joined', player);
			io.sockets.emit('addToView', {players:players, playerid:player.id});
		  
		}else{
			waiting_players.push(player);
			socket.emit('joined', player);
			io.sockets.emit('addToView', {players:players, playerid:player.id});
		}
		
		
		
		
  
  	});	
	
	socket.on('round', function(data){
		count --;
		players[data.pos].hand = data.cards;
		console.log('card:'+players[data.pos].hand.length)
		if(count == 0){
			console.log('starting the game');
			loopTurn(-1);
		} 
		
		
		
	});
	socket.on('response', function(data){
		clearInterval(idTimeout);
		if(data.type == 'fold'){
			players[data.pos].isFolded = true;	
			io.sockets.emit('folded', {pos:data.pos});
		}else if(data.type == 'continue'){
			var pos=data.pos;
			var moneyToCall=0;
			currentStake = data.stake;
			if(players[pos].isBlind || !isBlindRemaining(players)){
				moneyToCall = currentStake;	
			}else{
				moneyToCall = currentStake*2;
			}
			sumMoney += moneyToCall;
			players[pos].cash = players[pos].cash - moneyToCall;
			io.sockets.emit('continueresponse', {pos:data.pos,stake:data.stake,money:moneyToCall,cash:players[pos].cash, pot:sumMoney});
		}
		loopTurn(data.pos);
		
	});
	
	
	
	function loopTurn(pos){
		var dontContinue=onlyOnePlayer();
		if(!dontContinue && dontContinue !==0){
		
		
			var check=pos;
			
			if(check+1 >= players.length){check = 0}
				else{check = check+1}
			
			while(check != pos){
				console.log('check:' + check + ' pos:' + pos);
				
				console.log(players[check].isFolded + '  ' +players[check].isTimeout+'  '+ players[check].isDisconnected );
				if(players[check].isFolded == false && players[check].isTimeout == false && players[check].isDisconnected==false ){
					console.log('inside');
					
					
					io.sockets.emit('notifyTurn', {pos:check});
					
					//emit counter
					var countdown = 150; //3 seconds in reality...
					idTimeout = setInterval(function() {
						if(countdown == 0){
							clearInterval(idTimeout);
							players[check].isTimeout = true;
							io.sockets.emit('player-timeout', { pos:check});
							loopTurn(check);
						
						}else{
							countdown--;
							io.sockets.emit('runtimer', { countdown: countdown , pos:check});
						}
					}, 400);
		
					break;
				}
			
					if(check+1 >= players.length){check = 0}
						else{check = check+1}
			//if(check == data.pos)
			}
		}else{
			console.log('player'+dontContinue+1+'wins');
			players[dontContinue].cash += sumMoney;
			sumMoney =0;
			io.sockets.emit('show-winner', { pos:dontContinue , cash:players[dontContinue].cash,opens:false});	
		}
			
	}
	
	
	socket.on('call', function(data){
		clearInterval(idTimeout);
		var competing_cards = [];
		var competing_pos = [];
		var pos = data.pos;
		
		sumMoney += currentStake;
		players[pos].cash = players[pos].cash - currentStake;
		io.sockets.emit('callresponse', {pos:data.pos,cash:players[pos].cash, pot:sumMoney});
		
		
		
		var winner = {};
		for(var i=0;i < players.length;i++){
			if(!players[i].isFolded && !players[i].isTimeout && !players[i].isDisconnected){
				io.sockets.emit('show_cards', {pos:4});
				competing_cards.push(players[i].hand);
				competing_pos.push(i);
			}	
		}
		winner = functions.decideWinner(competing_cards,competing_pos);
		
		players[winner.pos].cash += sumMoney;
		sumMoney =0;
		console.log('Player ' +(winner.pos+1));
		
		io.sockets.emit('show-winner', { pos:winner.pos , cash:players[winner.pos].cash, opens:true});
		
		setTimeout(autoStart,5000);
		
	});
	socket.on('disconnect', function(){
		for(var i = 0;i< players.length;i++){
			if(players[i].id == socket.id){
				var index = players.indexOf(players[i]);
				//console.log(index);
				//players.splice(index,1);
				players[i].isDisconnected = true;
				io.sockets.emit('disconnected', {pos:index});
				break;
			}
		}
		
		for(var i = 0;i< waiting_players.length;i++){
			if(waiting_players[i].id == socket.id){
				waiting_players[i].isDisconnected = true;
				break;
			}
		}
		
		console.log('disconnected');
		
	});
	
	
	
	socket.on('cardseen', function(data){
		players[data.pos].isBlind = false;
		io.sockets.emit('cardseen', {pos:data.pos});
	});
	
	function onlyOnePlayer(){
		var pos=-1;
		var count = 0;
		for(var i =0;i<players.length;i++){
			if(players[i].isFolded == false && players[i].isTimeout == false && players[i].isDisconnected==false ){
				pos =i;
				count++;
			}	
		}
		if(count>1){
			return false;
		}else {
			return pos;	
		}
	}
	function collectBoat(money){
		var sum=0;
		for(var i =0;i<players.length;i++){
			if(!players[i].isDisconnected){
				players[i].cash -= money;
				sum = sum+money;
			}	
		}
		return sum;	
	}
	function isBlindRemaining(players){
		for(var i =0;i<players.length;i++){
			if(players[i].isBlind && !players[i].isDisconnected && !players[i].isTimeout){
				return true;
			}	
		}
		
		return false;
	
	}
	function clearCards(){
		for(var i =0;i<players.length;i++){
			players[i].hand.splice(0,players[i].hand.length);	
		}
	}
	
	function autoStart(){
		console.log('Restarting');
		
		io.sockets.emit('restart', {pos:9});
			
	}

  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});




