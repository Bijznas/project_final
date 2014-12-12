var Card = require('./card.js');
//--------------Card Object----------------
function CardDeck() {
	var that = this;
	this.cards;
	
	this.toString   = cardToString;
	//this.divNode = makeNode();
	this.setupCardsDeck = function(){
		var ranks = new Array("A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K");
		var suits = new Array("C", "D", "H", "S");
		var i, j, k;
		var m;
	
		m = ranks.length * suits.length;
	
		// Set array of cards.
		that.cards = new Array(m);
	
		// Fill the array with '1' packs of cards.
		for (j = 0; j < suits.length; j++){
		  for (k = 0; k < ranks.length; k++){
			that.cards[j * ranks.length + k] = new Card(ranks[k], suits[j]);
			//this.cards[j * ranks.length + k].stateFront();
		  }
		}
		
		that.cardShuffle(1);
	
	}
	
	
	
	//--------------Shuffling the cards Deck	
	this.cardShuffle = function(n) {
	
		var i, j, k;
		var temp;
	
	  // Shuffle the stack 'n' times.
		for (i = 0; i < n; i++)
			for (j = 0; j < that.cards.length; j++) {
				k = Math.floor(Math.random() * that.cards.length);
				temp = that.cards[j];
				that.cards[j] = that.cards[k];
				that.cards[k] = temp;
			}
	}
	//--------------End Shuffling the cards Deck
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
  
  //this function create a div node for the card
	function makeNode(){
		var tempNode = document.createElement("div");
		tempNode.className='card-layout';
		tempNode.style.background='url(images/backs.png) 0px 0px no-repeat';
		return tempNode;

	}
	
	
	this.stateBack = function (){
		that.divNode.background='url(images/back.png) 0px 0px no-repeat';
	}
	
	
	function cardToString() {
		var rank, suit;

		switch (this.rank) {
			case "A" :
      		  rank = "Ace";
      		  break;
			case "2" :
			  rank = "Two";
			  break;
			case "3" :
			  rank = "Three";
			  break;
			case "4" :
			  rank = "Four";
			  break;
			case "5" :
			  rank = "Five";
			  break;
			case "6" :
			  rank = "Six";
			  break;
			case "7" :
			  rank = "Seven";
			  break;
			case "8" :
			  rank = "Eight";
			  break;
			case "9" :
			  rank = "Nine";
			  break;
			case "10" :
			  rank = "Ten";
			  break;
			case "J" :
			  rank = "Jack"
			  break;
			case "Q" :
			  rank = "Queen"
			  break;
			case "K" :
			  rank = "King"
			  break;
			default :
      		  rank = null;
      		  break;
  		}

		switch (this.suit) {
			case "C" :
			  suit = "Clubs";
			  break;
			case "D" :
			  suit = "Diamonds"
			  break;
			case "H" :
			  suit = "Hearts"
			  break;
			case "S" :
			  suit = "Spades"
			  break;
			default :
			  suit = null;
			  break;
		}

		if (rank == null || suit == null)
			return "";

		return rank + " of " + suit;
	}
}
module.exports = CardDeck;
//--------------End Card Object----------------
