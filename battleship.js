function battleShip(opponent){

	//The ships for this user. Contains the length of this ship as well as the coordinates it occupies. By default in top right corner
	this.myShips = [ 
					{'numSpots': 2 ,  'coordinates': [ [0,0],[0,1] ] }, 
					{'numSpots': 3 ,  'coordinates':[ [1,0],[1,1],[1,2] ] },
					{'numSpots': 3 ,  'coordinates':[ [2,0],[2,1],[2,2] ] },
					{'numSpots': 4 ,  'coordinates':[ [3,0],[3,1],[3,2],[3,3] ] },
					{'numSpots': 5 ,  'coordinates':[ [4,0],[4,1],[4,2],[4,3],[4,4] ] }   
					];
	this.lastShot = [];						//Keeps track of the last location this user shot
	this.opponent = opponent;				//Stores the name of the opponent
	this.selectedBoat = [0,0];				//Stores the last boat you clicked on in the form of [boat, the exact spot on that boat]
	this.bsize = 1000/10;
	this.isReady = false;
	this.myTurn = false;
	
	this.prepareGame = function(){
		var c = document.getElementById('myCanvas');
		var ctx = c.getContext('2d');
		var ctx1 = document.getElementById('enemyBoard').getContext('2d');
		
		ctx.fillStyle = "#0000FF";
		ctx1.fillStyle = "#0000FF";
		ctx.fillRect(0,0,1000,1000);
		ctx1.fillRect(0,0,1000,1000);
		ctx.fillStyle = "#000000";
		ctx1.fillStyle = "#000000";
		
		for(var i = this.bsize; i <= 1000; i+=this.bsize){
			ctx.fillRect(i,0,10,1000);
			ctx.fillRect(0,i,1000,10);
			ctx1.fillRect(i,0,10,1000);
			ctx1.fillRect(0,i,1000,10);
		}
		
		
		//Colors all the coordinates in the myships variable grey.
		ctx.fillStyle = "#999999";
		for(var i in this.myShips){
			for(var ii in this.myShips[i]['coordinates']){
				ctx.fillRect(this.bsize * this.myShips[i]['coordinates'][ii][0] + 10,this.bsize * this.myShips[i]['coordinates'][ii][1]+10, this.bsize-10, this.bsize-10)
			}
		}

		document.getElementById('myCanvas').addEventListener("click", this.shipSet)
		document.addEventListener("keydown", this.rotateSelected)

		
	}

	this.rotateSelected = function(evt){
		
		if(evt.which == 13){						//When user presses enter you will lock the gameboard and let other player know they are ready
			document.getElementById('myCanvas').removeEventListener('click', tmp.shipSet);
			document.removeEventListener('keydown', tmp.rotateSelected);
			tmp.isReady = true;
			myFirebaseRef.child('battleLog').push({name: user, text: 'ready'});
			document.getElementById('enemyBoard').addEventListener('click', tmp.shoot);
			alert("Ships locations locked!");
		}
		
		else{
			var isHorizontal = tmp.myShips[tmp.selectedBoat[0]]["coordinates"][0][1] == tmp.myShips[tmp.selectedBoat[0]]["coordinates"][1][1];
			var sx = tmp.myShips[tmp.selectedBoat[0]]["coordinates"][tmp.selectedBoat[1]][0];
			var sy = tmp.myShips[tmp.selectedBoat[0]]["coordinates"][tmp.selectedBoat[1]][1];
			var canvas = document.getElementById('myCanvas');
			var ctx = canvas.getContext('2d');
			var tmpArray = [];

			

			if(isHorizontal){
				for(var i in tmp.myShips[tmp.selectedBoat[0]]["coordinates"]){
					var d = tmp.selectedBoat[1] - i;
					tmpArray.push([sx, sy - d]);
				}
			}
			else{
				for(var i in tmp.myShips[tmp.selectedBoat[0]]["coordinates"]){
					var d = tmp.selectedBoat[1] - i;
					tmpArray.push([sx - d, sy]);
				}
			}

			if(tmp.validRotation(tmpArray)){

				ctx.fillStyle = "#0000FF";
				for(var i in tmp.myShips[tmp.selectedBoat[0]]['coordinates']){
					ctx.fillRect(tmp.bsize * tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][0] + 10,tmp.bsize * tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][1]+10, tmp.bsize-10, tmp.bsize-10);
				}
				

				tmp.myShips[tmp.selectedBoat[0]]["coordinates"] = tmpArray;

				ctx.fillStyle = "#999999";
				for(var i in tmp.myShips[tmp.selectedBoat[0]]['coordinates'])
					ctx.fillRect(tmp.bsize * tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][0] + 10,tmp.bsize * tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][1]+10, tmp.bsize-10, tmp.bsize-10);
			}
			
		}

	}

	this.validRotation = function(arr){
		console.log(arr);
		for(var i in arr){
			var x = arr[i][0];
			var y = arr[i][1];

			if(x < 0 || x > 9 || y < 0 || y > 9 || this.checkCollision(x,y,false).isHit){

				return false;
			}
		}
		return true;

	}

	this.shipSet = function(evt){
		var canvas = document.getElementById('myCanvas');
		var ctx = canvas.getContext('2d');
		//Test if the user clicked on a boat
		//If they did then set the value of selected boat
		var mousePos = getMousePos(document.getElementById('myCanvas'),evt);
		var collisionStat = tmp.checkCollision(parseInt(mousePos.x / tmp.bsize), parseInt(mousePos.y/tmp.bsize),true);
		if(collisionStat.isHit) tmp.selectedBoat = [collisionStat.boatIndex,collisionStat.coordinateIndex];
		else if(!collisionStat.isHit){
			var dx = parseInt(mousePos.x/tmp.bsize) - tmp.myShips[tmp.selectedBoat[0]]['coordinates'][tmp.selectedBoat[1]][0];
			var dy = parseInt(mousePos.y/tmp.bsize) - tmp.myShips[tmp.selectedBoat[0]]['coordinates'][tmp.selectedBoat[1]][1];
			if(tmp.validMove(dx,dy)){
				ctx.fillStyle = "#0000FF";
				for(var i in tmp.myShips[tmp.selectedBoat[0]]['coordinates']){
					ctx.fillRect(tmp.bsize * tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][0] + 10,tmp.bsize * tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][1]+10, tmp.bsize-10, tmp.bsize-10);
					tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][0] += dx;
					tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][1] += dy;
				}

				ctx.fillStyle = "#999999";
				for(var i in tmp.myShips[tmp.selectedBoat[0]]['coordinates'])
					ctx.fillRect(tmp.bsize * tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][0] + 10,tmp.bsize * tmp.myShips[tmp.selectedBoat[0]]['coordinates'][i][1]+10, tmp.bsize-10, tmp.bsize-10);
			}


		}

	}

	this.validMove = function(dx,dy){
		for(var i in this.myShips[this.selectedBoat[0]]['coordinates']){
			var c = this.myShips[this.selectedBoat[0]]['coordinates'][i];
			var x = c[0] + dx;
			var y = c[1] + dy;
			if(x < 0 || x > 9 || y < 0 || y > 9 || this.checkCollision(x,y,false).isHit){
				return false;
			}
		}

		return true;
	}

	this.checkCollision = function(x,y,checkSelected){

		for(var i in this.myShips){
			if(!checkSelected && i == this.selectedBoat[0]) continue;
			for(var ii in this.myShips[i]['coordinates']){
				var bx = this.myShips[i]['coordinates'][ii][0];
				var by = this.myShips[i]['coordinates'][ii][1];
				if(x == bx && y == by){
					return {
						isHit: true,
						boatIndex: i,
						coordinateIndex: ii
					};
				}
			}
		}

		return{
			isHit: false
		};
	}
	/*
			Display board method:
			
				-Fill rect to color the canvas blue like the water
				-Draw black lines horizontally and vertically
	
	
	DONE
	
	*/
	
	/*

			DONE

			Preparing the game which includes having the player choose where he would like his boats to be placed. 
				Briefly you would need to:
					-Allow the user to rotate the ships ([x,y] ==> [-y,x] )
					-Make sure that the boats never leave the map
					-Make sure that the boats never overlap
					-Make sure that the boats move as a whole boat and not one coordinate. 

	*/

		myFirebaseRef.child('battleLog').on('child_added', function(snapshot){
			n = snapshot.val()['name'];
			t = snapshot.val()['text'];

			if(n == user) return;
			
			if(typeof t == 'string' && t == 'ready' && tmp.isReady){ 
				myFirebaseRef.child('battleLog').push({name: user, text: 'start'});
				tmp.myTurn = true;
				return;
			}

			var canvas = document.getElementById('myCanvas');
			var ctx = canvas.getContext('2d');

			if(t instanceof Array){
				var collide = tmp.checkCollision(t[0],t[1],true);
				if(collide.isHit){
					tmp.myShips[collide.boatIndex]['coordinates'].splice(collide.coordinateIndex,1);
					if(tmp.myShips[collide.boatIndex]['coordinates'].length == 0){
						tmp.myShips.splice(collide.boatIndex, 1)
					}
					if(tmp.myShips.length == 0){
						myFirebaseRef.child('battleLog').push({name: user, text: 'gameOver'});
						alert(opponent + " beat you!");
					}
					ctx.fillStyle = "#FF0000";
					ctx.fillRect(t[0] * tmp.bsize, t[1] * tmp.bsize, tmp.bsize, tmp.bsize);

					myFirebaseRef.child('battleLog').push({name: user, text: true});
					tmp.myTurn = true;
					return;
				}
				myFirebaseRef.child('battleLog').push({name: user, text: false});
				tmp.myTurn = true;
				return;
			}

			if( typeof t == 'boolean'){
				var c = document.getElementById('enemyBoard');
				var cx = c.getContext('2d');
				if(t == true){
					cx.fillStyle = "#FF0000";
				}
				else if (t == false){
					cx.fillStyle = "#FFFFFF";
				}
				cx.fillRect(tmp.lastShot[0] * tmp.bsize, tmp.lastShot[1] * tmp.bsize, tmp.bsize, tmp.bsize);
				return;
			}

			if(t == 'gameOver'){
				//End game and return to chat room
			}

		})


		

		this.shoot = function(evt){
			alert('shooting');
			if(tmp.myTurn){
				var canvas = document.getElementById('enemyBoard');
				var ctx = canvas.getContext('2d');
				var mousePos = getMousePos(canvas, evt);

				x = parseInt(mousePos.x/tmp.bsize)
				y = parseInt(mousePos.y/tmp.bsize)
				tmp.lastShot = [x,y]
				myFirebaseRef.child('battleLog').push({name: user, text: [x,y] });
				tmp.myTurn = false;
			}
		}

	/*

			
			
			KEEPING THE GAME UPDATED BELOW -- ALL THE EVENT LISTENERS


		Add event listener on canvas. 
		When canvas is clicked on:

			-Get Coordinates the user clicked on
			-Submit the coordinates and the username to firebase.game... .gameLog. 




		Add Event listener on the firebase child of the game(...)/ gamelog.
		when child_added to game log:
			If the person who sent it equals this persons username: 
				return;
			else:
				if its a coordinate: 
					check if one of my boats is on that coordinate. If a boat is on that coordinate:
						Turn that coordinate Red and remove the coordinate from the myShips array
						post on game log (name, true)
						if all the coordinates were shot post on game log(name, 'GameOver')
							announce that opponent beat user

					else if no boat:
						post on game log(name, false)

				else if its a boolean value:
					if its true:
						color the coordinate Green
					else:
						color the coordinate Red

				else if its 'GameOver':
					end the game and return to the chat room

	*/

}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}  