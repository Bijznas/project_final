
//--------------Card Object----------------
function Card(rank, suit) {
	var that = this;
	this.rank = rank;
	this.suit = suit;
	
	this.toString   = cardToString;
	//this.divNode = makeNode();
	
  
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
	
	this.stateFront = function(card){
		var x,y;
		if(that.rank == 'A' || that.rank == '14'){
			x = 0;
		}else{
			x = ((1-cardNum(that.rank))*width);
		}
		if(that.suit == 'C'){
			y = 'club';	
		}else if(that.suit == 'D'){
			y = 'diamond';
		}else if(that.suit == 'H'){
			y = 'heart';
		}else if(that.suit == 'S'){
			y = 'spade';
		}
		//that.divNode.style.background='url(images/'+y+'.png) '+x+'px no-repeat';
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
module.exports = Card;
//--------------End Card Object----------------
