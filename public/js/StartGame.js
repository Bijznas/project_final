function StartGame(data, table){
	
	this.cardDeck = data.dec;
	this.players = data.players;	
	this.table = table;
	
	this.start = function(){
		console.log('started');	
	}
	
}

module.exports = StartGame;