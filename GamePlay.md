
__Gameplay__
----------
Start and turn
- Each Player has to have 3 tiles unless deck is empty
- Tiles unique to each player. Known only to owners
- First player places tile in the space next to current space
- Assign path based on tile paths
- Move markers to the end of any new path
- Check win/elimination conditions
- Assign new card to player


Functions
------------
Game Start()
-	Generate a board
-	Create Players
		Create turnOrderArray[player1, player2...]    
-	Shuffle deck
-	Deal Tiles
- Players pick a start point on the board -> edge Point
- Next Player picks a different start point (i.e. points must be unique)

Game Play ()  

	while(Game.players.length >0)
		iterate and wrap around turnOrderArray

- [ ]Turn()
	- Next Player placeTile();
	- All players on activeSpace move
	- Check win conditions
	- Refresh player hands

- [ ] Win Conditions - checking functions
 - If only one player left
 - If all tiles played (tiles) && Game.Players >0


> Challenges:
How to define space, tiles, paths, movement of markers



---GAME OBJECTS ----
-----------
////DECK////

	Deck = [tiles{}]
	Deck.shuffle()

////OBJECTS and methods ////
	Tile = {
	image = image
	 paths = [of 'in' paths]
	}

	Tile.rotate()
	CW = +2 -> pop (2)-> unshift (2)
	CCW = -2 -> shift(2)-> push (2)


Board{
	[{spaces}]
	- > e.g.[ {space(0,0), space(0,1)}
				{space(1,0), space(1,1)}]

}

Space
{
	coordinates : [x, y],
	points = [array of points ] -> points is array of neighbors
	path: [tile]
}

	//    0 1
	//   _____
	// 7 |    | 2
	// 6 |____|3
	//     5 4
----
Points
	{
		edge: boolean,
		neighbors = []
		travelled = false;
	}
####################################

left edge => y = 0 , space.7 and space.6 = "edge" OR this.edge= true;

top edge => x = 0, space.0 and space.1 = "edge" OR this.edge= true;

right edge => y = 5, space.2 and space.3 = "edge" OR this.edge= true;

bottom edge => x=5, space.4 = space.5 = "edge" OR this.edge= true;

----

```
Tile = {
	paths: [connections] //-> e.g. [4,7,3,2,0,6,5,1],
	image : //url
}

Game = {
	count = 35;   
	players = [array of Players]   
	activeSpace = [x,y] //The next space of the currentPlayer
	currPlayer;   
	Deck = [Tiles];   
	Dragon = Player.Marker   
}


Player = {
	this.name = String;   
	this.marker = Marker;   
	this.position = Point;   
	this.nextSpace = Space;   
	this.tiles = [Tiles]   
}

Marker = {
image,    
id: integer,    
color    
}
```




-----------

FUTURE

//AI: distributed alpha-beta minimax
