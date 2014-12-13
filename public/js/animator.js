// JavaScript Document
function Animator(){
	var that = this;
	this.element;
	this.element2;
	this.props;
	this.duration;
	this.callback;
	this.intervalId;
	
	var frequency = 50;
	var counter = 0;
	this.ydirection=false;
	this.xdirection=false;
	var posi;
	var val=0;
	var numPlayers=2;
	
	
	this.animate = function(el,props,duration,pos,clb_function,el2){
		that.element = el;
		that.element2 = el2;
		that.props = props;
		that.props.left = that.props.left + 10;
		that.duration = duration;
		that.callback = clb_function;
		posi = pos;
		if(that.element.offsetLeft>that.props.left && that.props.left){
			that.xdirection=false;
		}else{
			that.xdirection=true;
		}
		
		if(that.element.offsetTop>that.props.top && that.props.top){
			that.ydirection=false;
		}else{
			that.ydirection=true;
		}
		
		that.intervalId = setInterval(that.move, frequency);
		
	}	
	
	this.move = function(){
			counter++;
			if(that.xdirection && that.props.left){
				
				if(counter >= (that.duration/frequency)){
					//console.log(that.element.offsetLeft);
					clearInterval(that.intervalId);
					that.callback(posi);
				}else{
					var valleft = (that.props.left-that.element.offsetLeft)/(that.duration/frequency)*counter;
					that.element.style.left = that.element.offsetLeft + valleft + 'px';	
					if(that.element2){
						that.element2.style.left = that.element2.offsetLeft + valleft + 'px';	
					}
					
				}
			
			
			}else{
				if(counter >= (that.duration/frequency)){
					clearInterval(that.intervalId);
					//console.log(that.element.offsetLeft);
					that.callback(posi);
				}else{
					var valleft = (that.element.offsetLeft-that.props.left)/(that.duration/frequency)*counter;
					that.element.style.left = that.element.offsetLeft - valleft + 'px';	
					if(that.element2){
						that.element2.style.left = that.element2.offsetLeft - valleft + 'px';	
					}
					
				}
				
				
			}
			
			////for moving along
			if(that.ydirection && that.props.top){
				if(counter >= (that.duration/frequency)){
					//console.log(that.element.offsetTop);
					clearInterval(that.intervalId);
				}else{
					var valtop = (that.props.top-that.element.offsetTop)/(that.duration/frequency)*counter;
					that.element.style.top = that.element.offsetTop + valtop + 'px';	
					
				}
			
			
			}else{
				if(counter >= (that.duration/frequency)){
					clearInterval(that.intervalId);
					//console.log(that.element.offsetTop);
				}else{
					var valtop = (that.element.offsetTop-that.props.top)/(that.duration/frequency)*counter;
					that.element.style.top = that.element.offsetTop - valtop + 'px';	
					
				}
				
				
			}
			
			if(that.props.rot && ((posi-1)<numPlayers || (posi-1)>= 2*numPlayers)){
				var valrot;
				if((posi-1)<numPlayers){
					valrot = -(that.props.rot)/(that.duration/frequency)*counter;
				}else{
					valrot = (that.props.rot)/(that.duration/frequency)*counter;
				}
				
				//console.log(valrot)
				that.element.style.webkitTransform = 'rotate('+valrot+'deg)'; 
				that.element.style.mozTransform    = 'rotate('+valrot+'deg)'; 
				that.element.style.msTransform     = 'rotate('+valrot+'deg)'; 
				that.element.style.oTransform      = 'rotate('+valrot+'deg)'; 
				that.element.style.transform       = 'rotate('+valrot+'deg)';
			}
			
			
		
		
	}
	
	this.stops = function(){
		clearInterval(that.intervalId);
		counter=0;
		that.cmargin = parseInt(that.element.style.marginLeft.split('px')[0]);
	}
	
	this.finish = function(){
		that.element.style.marginLeft = that.props.marginLeft+'px';
		that.cmargin = that.props.marginLeft;
		//console.log(that.props.marginLeft+'px');
		clearInterval(that.intervalId);
	}
	
}

//module.exports = Animator;