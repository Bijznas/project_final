var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Card = require('./public/models/card.js');
var CardDeck = require('./public/models/CardDeck.js');
var Player = require('./public/models/player.js');
var isRunning = false;
var count = 0;
app.use(express.static(__dirname + '/public'));

var players = [];  
var start = false; 



io.on('connection', function(socket){
	socket.emit('id', {
        id: socket.id, players : players
    });
	
	socket.on('join_game', function(name){
		var player = new Player(socket.id, name);
		players.push(player);
    	socket.emit('joined', player);
		io.sockets.emit('addToView', {players:player, playerid:player.id});
		//console.log(players.length + '  lengths');
		
		
		if (players.length < 2) {
			io.emit("logging", {message: "Waiting for other players to join." });
			//socket.emit("logid",player.id);
			//io.sockets.emit("waiting", {message: "Waiting for other player to join."});
      	}else if(players.length == 2) {
			io.sockets.emit("logging", {message: "Play will commence shortly."});
			//socket.emit("logid",player.id);
			var deck = new CardDeck();
			deck.setupCardsDeck();
			console.log(deck.cards[0]);
			//emit counter
			var countdown = 5; //3 seconds in reality...
			var idCounter = setInterval(function() {
				if(countdown == 1){
					isRunning = true;
					clearInterval(idCounter);
					io.sockets.emit('collect_bid', { players: players});
					count = players.length;
					io.sockets.emit('distribute_cards', { players: players, deck:deck });
					
				}else if(!isRunning){
					countdown--;
					io.sockets.emit('timer', { countdown: 'The game will start in '+countdown+' secs' });
				}
			}, 1000);
      }
		
		
		
		
  
  	});	
	
	socket.on('round', function(playerid){
		count --;
		
		if(count == 0){
			console.log('starting the game');
			loopTurn(0);
		} 
		
		
		
	});
	
	function loopTurn(pos){
		io.sockets.emit('notifyTurn', {pos:pos});
		
		//emit counter
		var countdown = 100; //3 seconds in reality...
		var idCounter = setInterval(function() {
			if(countdown == 1){
				clearInterval(idCounter);
				
			}else{
				countdown--;
				io.sockets.emit('timeout', { countdown: countdown , pos:pos});
			}
		}, 100);
	}
	
	socket.on('disconnect', function(){
		for(var i = 0;i< players.length;i++){
			if(players[i].id == socket.id){
				var index = players.indexOf(players[i]);
				console.log(index);
				players.splice(index,1);
				break;
			}
		}
		
		console.log('disconnected');
		
	});
	
	
	
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});




