/*
var tile = {
	this.image = http://placehold.it/100x100
	this.paths = [5,2,1,6,7,0,3,4]
}
*/

//player = nextSpace = x, y

//activeSpace = currentPlayer.nextSpace

//name [string], marker [obj{image, id, color}], startingPont [ Point ]
//starting points must be 1-6, 



//tile is tile obj
function placeTile(tile){
	//need to know space on board
	//tile.paths
	const currentSpace = board[activeSpace.y][activeSpace.x];

	//for each point on this space = board[y][x]

	for(var i = 0; i < 8; i++){
		currentSpace.points[i].neighbors.push( currentSpace.points[tile.paths[i]] );
	}

	currentSpace.image = tile.image;
}

