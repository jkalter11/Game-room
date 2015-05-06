function Tictactoe(opponent, myPiece){

	this.board = [[],[],[]];     	//Holds the board for the current User

	this.nextTurn = 'X';				//The next turn in this users game

	this.myPiece = myPiece;				//The playing Piece of this User. either an x or an o

	this.opponent = opponent;		//Stores the opponent to this player for this game


	$('#chat').remove();

    $('#message').remove();



    this.prepareGame = function(){

    myFirebaseRef.child('game' + myGame).update({'nextTurn': 'X'});

    for (var r = 0; r < 3; r++) {

        for(var c = 0; c < 3; c++){

			var current = document.getElementById("r" + r + "_c" + c).style; 

            current.top = (33 * r) + "%";

            current.left = (33 * c) + "%";

			current.width = "33%";

			current.height = "33%";

			current.position = "absolute";

			current.border = "solid black 10px";

			current.textAlign = "center";

            this.board[r][c] = " ";

        }

    }

    //Sets the board on the database to be empty-cells

    myFirebaseRef.child("game" + myGame + "/board").set(this.board);




    $(".tick").click(function(){

        if (currentGame.nextTurn == currentGame.myPiece) {

            if ($(this).html().indexOf("X") == -1 && $(this).html().indexOf("O") == -1) {

                var id = $(this).attr('id');

                var x = parseInt(id.substring(1,2));

                var y = parseInt(id.substring(4));

                myFirebaseRef.child("game" + myGame +"/board/" + x + "/" + y).set(currentGame.nextTurn);

						

				if (!(currentGame.checkWin(x,y) || currentGame.checkTie())) {
         
					if (currentGame.nextTurn == "X") {

						myFirebaseRef.child("game" + myGame).update({'nextTurn': 'O'});

					}

					else{

						myFirebaseRef.child("game" + myGame).update({'nextTurn': 'X'});

					}

				}

            }

            else{

                alert("That block is already occupied. Try again!");

            }

        }

        else alert("Its not your Turn");

    });
		
	//When a value was changed check which one and check for a win and a tie

    myFirebaseRef.child("game" + myGame +"/board").on("value",function(snapshot){

		var x;

		var y;

        for(var r = 0; r < 3; r++){

            for(var c = 0; c < 3; c++){

                currentGame.board[r][c] = snapshot.val()[r][c];
						
                if(document.getElementById("r" + r + "_c" + c).innerHTML != "<br><br><br><b> " + currentGame.board[r][c] + "</b>"){
							
					x = r; y = c;

				}

				document.getElementById("r" + r + "_c" + c).innerHTML = "<br><br><br><b> " + currentGame.board[r][c] + "</b>";

            }

        }
				
		if(currentGame.checkTie() || currentGame.checkWin(x,y)){
					
			currentGame.resetGame();
            loadChatRoom();

		}
				
    });

			

    myFirebaseRef.child("game" +myGame+"/nextTurn").on("value", function(snapshot){

        currentGame.nextTurn = snapshot.val();

    });

}

//These functions all check for a win by accepting the x and y value of the piece that was just added and checking its surroundings
//These functions do not change the database. Only the board variable

	this.checkWin = function(x,y) {
		return this.checkRow(x,y) || this.checkCol(x,y) || this.checkDiag(x,y);
	}

	this.checkRow = function(x,y){

    	var tmp = this.board[x][0];

		if(tmp == " ") return false;

    	if(tmp == this.board[x][1] && tmp == this.board[x][2]){
			this.announceWinner(tmp);
			return true;
		}
		else return false;

	}

	this.checkCol = function(x,y){

    	var tmp = this.board[0][y];

		if(tmp == " ") return false;

    	if(tmp == this.board[1][y] && tmp == this.board[2][y]){

			this.announceWinner(tmp);
			return true;

		}
		return false;

	}	

	this.checkDiag = function(x,y){

		if (this.board[1][1] == " ") {
        	return false;
    	}

    	var tmp = this.board[1][1];

    	if((tmp == this.board[0][0] && tmp == this.board[2][2]) || (tmp == this.board[2][0] && tmp == this.board[0][2])){
			this.announceWinner(tmp);
			return true;
		}
		return false;

	}

	this.resetGame = function(){

    	for(var r = 0; r < 3; r++){

        	for (var c = 0; c < 3; c++) {

            	document.getElementById("r" + r + "_c" + c).innerHTML = " ";

            	this.board[r][c] = " ";

        	}

		}
		myFirebaseRef.child("game" + myGame + "/nextTurn").off();
		myFirebaseRef.child("game" + myGame + "/board").off();
		myFirebaseRef.child("game" + myGame).off();
		myFirebaseRef.child("game" + myGame).remove();
				
		myGame = "";

	}

	// Returns true if board is full and false otherwise

	this.checkTie = function(){

		for(var r = 0; r < 3; r++){

			for(var c = 0; c < 3; c++){

				if(this.board[r][c] == " "){

					return false;

				}

			}

		}

		alert("It was a tie!");

		return true;

	}

	this.announceWinner = function(winningPiece){		//Announces the winner of the tic tac toe game when a game is over as well as alert the players
		alert(winningPiece + " Won!");
		if(this.myPiece == winningPiece){
			myFirebaseRef.child('chatroom').push({name: 'server', text: user + ' beat ' + this.opponent });
		}
	}



}






