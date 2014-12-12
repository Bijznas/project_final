var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Card = require('./public/models/card.js');
var CardDeck = require('./public/models/CardDeck.js');
var Player = require('./public/models/player.js');

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
		console.log(players.length + '  lengths');
		
		
		if (players.length < 2) {
			io.emit("logging", {message: "Waiting for other players to join." });
			//io.sockets.emit("waiting", {message: "Waiting for other player to join."});
      } else {
			io.sockets.emit("logging", {message: "Play will commence shortly." });
			var deck = new CardDeck();
			deck.setupCardsDeck();
			console.log(deck.cards[0])
			//emit counter
			var countdown = 10; //3 seconds in reality...
			var idCounter = setInterval(function() {
				if(countdown == 0){
					clearInterval(idCounter);
					io.sockets.emit('distribute_cards', { player: players });
					
				}else{
					countdown--;
					io.sockets.emit('timer', { countdown: 'The game will start in '+countdown+' secs' });
				}
			}, 1000);
      }
		
		
		
		
  
  	});	
	
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




