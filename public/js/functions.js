
//--------------User Functions----------------

function cardNum(ranks) {

	var rank;

	switch (ranks) {
		case "A" :
		  rank = 14;
		  break;
		case "2" :
		  rank = 2;
		  break;
		case "3" :
		  rank = 3;
		  break;
		case "4" :
		  rank = 4;
		  break;
		case "5" :
		  rank = 5;
		  break;
		case "6" :
		  rank = 6;
		  break;
		case "7" :
		  rank = 7;
		  break;
		case "8" :
		  rank = 8;
		  break;
		case "9" :
		  rank = 9;
		  break;
		case "10" :
		  rank = 10;
		  break;
		case "J" :
		  rank = 11;
		  break;
		case "Q" :
		  rank = 12;
		  break;
		case "K" :
		  rank = 13
		  break;
		default :
		  rank = null;
		  break;
	}
	return rank;
}



function isAllSame(cards){
	for(var j=0;j<cards.length-1;j++){
		
		if(cardNum(cards[j].rank) != cardNum(cards[j+1].rank)){
			return false;		
		}
		
		
	}
	
	

	return cards;	
}

function isRun(cards){
	cards = sortMax(cards);
	for(var j=1;j<cards.length-1;j++){
		
		if(cardNum(cards[0].rank) != 14 || cardNum(cards[1].rank) != 3 || cardNum(cards[j].rank) != cardNum(cards[j+1].rank)+1){
			break;		
		}
		
		if(j == cards.length-2){
			return cards;
		}
	}
	
	for(var j=0;j<cards.length-1;j++){
		if(cardNum(cards[j].rank) != cardNum(cards[j+1].rank)+1){
			return false;		
		}	
		
	}

	return cards;	
}



function isDouble(cards){
	var n = 13;
	cards = sortMax(cards);
	for(var i=0;i<cards.length;i++){
		for(var j=i+1;j<cards.length;j++){
			if(cardNum(cards[i].rank)==cardNum(cards[j].rank)){
				if(i!=0){
					var temp = cards[i-1];
					cards[i-1] = cards[j];
					cards[j] = temp;
				}
				return cards;
			}
		}
	}
	return false;	
}

function sortMax(cards){
	for(var i=0;i<cards.length;i++){
		for(var j=i+1;j<cards.length;j++){
			if(cardNum(cards[i].rank)<cardNum(cards[j].rank)){
				var temp = cards[i];
				cards[i] = cards[j];
				cards[j] = temp;
			}
		}
	}
	
	return cards;	
}

getFlushResult = function(cards){
		
	var card1=cards[0];
	var card2=cards[1];
	var card3=cards[2];
	
	if(card1.rank == card2.rank && card2.rank == card3.rank){
		return 'Three of a kind '+ card1.rank;	
	}else if(isRun([card1, card2, card3])){
		if(card1.suit == card2.suit && card2.suit == card3.suit){
			return 'Double Run';
		}else{
			return 'You got Run';
		}
	}else if(card1.suit == card2.suit && card2.suit == card3.suit){
		return 'You got Color';
	}else if(isDouble([card1, card2, card3])){
		return 'You got Two of a kind'+ card1.rank;
	}else{
		return 'You got Top'+ sortMax([card1, card2, card3])[0];
	}
	
	return 'Not Yet Defined' + playerCards.length;
}

getFlushJson = function(cards){
		
	var card1=cards[0];
	var card2=cards[1];
	var card3=cards[2];
	var result = {};
	
	if(isAllSame(cards)){
		result = {priority:1, decide:[cardNum(cards[0].rank)]};	
	}else if(isRun(cards)){
		if(card1.suit == card2.suit && card2.suit == card3.suit){
			result = {priority:2, decide:[cardNum(cards[0].rank),cardNum(cards[1].rank),cardNum(cards[2].rank)]};
		}else{
			result = {priority:3, decide:[cardNum(cards[0].rank),cardNum(cards[1].rank),cardNum(cards[2].rank)]};
		}
	}else if(card1.suit == card2.suit && card2.suit == card3.suit){
		cards = sortMax(cards);
		result = {priority:4, decide:[cardNum(cards[0].rank),cardNum(cards[1].rank),cardNum(cards[2].rank)]};
	}else if(isDouble([card1, card2, card3])){
		cards=isDouble(cards);
		
		result = {priority:5, decide:[cardNum(cards[0].rank),cardNum(cards[1].rank),cardNum(cards[2].rank)]};
		//console.log(result);
		
	}else{
		cards = sortMax(cards);
		result = {priority:6, decide:[cardNum(cards[0].rank),cardNum(cards[1].rank),cardNum(cards[2].rank)]};
	}
	
	return result;
}


decideWinner = function(cardHands,pos){
	var maxi = cardHands[0];
	var sameCards = [];
	for(var i = 0;i < cardHands.length;i++){
		for(var j = i+1;j < cardHands.length;j++){
			var firstObj = getFlushJson(cardHands[i]);
			var secondObj = getFlushJson(cardHands[j]);
			if(secondObj.priority < firstObj.priority){
				
				var temp = cardHands[i];
				cardHands[i] = cardHands[j];
				cardHands[j] = temp;
				
				var temp_pos = pos[i];
				pos[i] = pos[j];
				pos[j] = temp_pos;
				
			}else if(secondObj.priority == firstObj.priority){
				for(var k =0;k<secondObj.decide.length;k++){
					if(secondObj.decide[k] > firstObj.decide[k]){
						//console.log(secondObj.decide[k]+"  "+k);
						//console.log(firstObj.decide[k]);
						var temp = cardHands[i];
						cardHands[i] = cardHands[j];
						cardHands[j] = temp;
						
						var temp_pos = pos[i];
						pos[i] = pos[j];
						pos[j] = temp_pos;
						break;
					}else if(secondObj.decide[k] < firstObj.decide[k]){
						break;
					}
				}
			}
		}
	}
	
	return {cards:cardHands[0],pos:pos[0]};
	
}


function makeNode(){
	var tempNode = document.createElement("div");
	tempNode.className='card-layout';
	tempNode.style.background='url(images/backs.png) 0px 0px no-repeat';
	return tempNode;

}
function makePlayerNode(pos){
	var tempNode = document.createElement("div");
	tempNode.className='player-layout';
	tempNode.style.top = pos.top +110+ 'px';
	tempNode.style.left = pos.left + 'px';
	
	
	return tempNode;

}

function setCardFront(card){
	var x,y;
	var width = 81;
	if(card.rank == 'A' || card.rank == '14'){
		x = 0;
	}else{
		x = ((1-cardNum(card.rank))*width);
	}
	if(card.suit == 'C'){
		y = 'club';	
	}else if(card.suit == 'D'){
		y = 'diamond';
	}else if(card.suit == 'H'){
		y = 'heart';
	}else if(card.suit == 'S'){
		y = 'spade';
	}
	card.divNode.style.background='url(images/'+y+'.png) '+x+'px no-repeat';
}


function isBlindRemaining(players){
	for(var i =0;i<players.length;i++){
		if(players[i].isBlind && !players[i].isDisconnected && !players[i].isTimeout){
			return true;
		}	
	}
	
	return false;
	
}

function isPresent(parentNode, childNode) {
	if('contains' in parentNode) {
		return parentNode.contains(childNode);
	}
	else {
		return parentNode.compareDocumentPosition(childNode) % 16;
	}
}



function getRandom(min, max) {
        return Math.floor((Math.random() * max) + min);

}

function getStyle(el,styleProp)
{
    var x = el;

    if (window.getComputedStyle)
    {
        var y = document.defaultView.getComputedStyle(x,null).getPropertyValue(styleProp); 
    }  
    else if (x.currentStyle)
    {
        var y = x.currentStyle[styleProp];
    }                     

    return y;
}



Node.prototype.contains = function(node) {
    return (this.compareDocumentPosition(node) & 16) !== 0 || this === node;
}

	

    function contains(a, b){
      return a.contains ?
        a != b && a.contains(b) :
        !!(a.compareDocumentPosition(b) & 16);
    }



exports.decideWinner = decideWinner;
exports.isBlindRemaining = isBlindRemaining;