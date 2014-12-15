function Player(playerID, name) {
	this.id = playerID;
	this.name = name;
	this.node='';
	this.infoNode='';
	this.seeButton;
	this.isPlaying = false;
	this.isBlind = true;
	this.isFolded = false;
	this.isTimeout = false;
	this.isDisconnected = false;
	this.tableID = "";
	this.hand = [];
	this.status = "";
	this.cash = 1000;
	this.turnFinished = "";
};

Player.prototype.setName = function(name) {
	this.name = name;
};

Player.prototype.getName = function() {
	return this.name;
};


module.exports = Player;