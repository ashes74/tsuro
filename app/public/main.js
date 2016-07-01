'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tsuro = angular.module('Tsuro', ['ui.router', 'firebase']);

tsuro.config(function () {
				var config = {
								apiKey: "AIzaSyCLm3jkk5ppMqeQxKoH-dZ9CdYMaDGWWqU",
								authDomain: "the-paths-of-dragons.firebaseapp.com",
								databaseURL: "https://the-paths-of-dragons.firebaseio.com",
								storageBucket: "the-paths-of-dragons.appspot.com"
				};
				firebase.initializeApp(config);
});

tsuro.constant('firebaseUrl', 'https://path-of-the-dragon.firebaseio.com/');

tsuro.config(function ($urlRouterProvider) {
				$urlRouterProvider.otherwise('/');
});

tsuro.config(function ($stateProvider) {
				$stateProvider.state('gamelist', {
								url: '/gamelist',
								templateUrl: '/browser/js/gamelist/gamelist.html',
								controller: 'gameList'
				});
});

tsuro.controller('gameList', function ($scope, firebaseUrl, $firebaseObject, $state, $firebaseAuth, $firebaseArray) {
				//For synchronizingGameList...
				var ref = firebase.database().ref();
				var obj = $firebaseObject(ref);

				var auth = $firebaseAuth();
				var firebaseUser = auth.$getAuth();

				var synchRef = ref.child("games");
				var synchronizedObj = $firebaseObject(synchRef);

				// This returns a promise...you can.then() and assign value to $scope.variable
				// gamelist is whatever we are calling it in the angular html.
				synchronizedObj.$bindTo($scope, "gamelist").then(function () {
								var gamelist = [];
								for (var i in $scope.gamelist) {
												gamelist.push([i, $scope.gamelist[i]]);
								}
								$scope.gameNames = gamelist.slice(2);
				});

				$scope.join = function (gameName) {
								var gameNameRef = ref.child('games').child(gameName);
								var playersRef = gameNameRef.child('players');

								firebase.auth().onAuthStateChanged(function (user) {
												var firebasePlayersArr = $firebaseArray(playersRef);

												firebasePlayersArr.$loaded().then(function (data) {
																var FBplayers = data;

																if (user) {
																				if (!FBplayers.filter(function (player) {
																								return player.uid === user.uid;
																				}).length) {
																								var newPlayer = new Player(user.uid);
																								$firebaseArray(playersRef).$add(newPlayer);
																				}
																} else {
																				// No user is signed in.
																				console.log("nothing");
																}
												}).then(function () {
																$state.go('game', {
																				"gameName": gameName
																});
												});
								});
				};
});

function Board() {
				this.board = [];
}

Board.prototype.drawBoard = function () {
				for (var y = 0; y < 6; y++) {
								if (!this.board[y]) this.board[y] = [];
								for (var x = 0; x < 6; x++) {
												this.board[y].push(new Space(x, y, this.board));
								}
				}
				return this.board;
};

function Space(x, y, board) {
				this.x = x;
				this.y = y;
				this.image = "n";
				this.points = [null, null, null, null, null, null, null, null];
				this.tileUrl = "n";
				this.tileId = "n";

				for (var i = 0; i < 8; i++) {
								var corresponding = void 0;

								if (i < 2) {
												//top
												corresponding = i === 0 ? 5 : 4; // 0 -> 5 & 1 -> 4
												if (y === 0) this.points[i] = new Point(true);else this.points[i] = board[y - 1][x].points[corresponding];
								} else if (i < 4) {
												//right
												if (x === 5) this.points[i] = new Point(true);else this.points[i] = new Point(false);
								} else if (i < 6) {
												//bottom
												if (y === 5) this.points[i] = new Point(true);else this.points[i] = new Point(false);
								} else {
												//left
												corresponding = i === 6 ? 3 : 2; // 6 -> 3 & 7 -> 2
												if (x === 0) this.points[i] = new Point(true);else {
																this.points[i] = board[y][x - 1].points[corresponding];
												}
								}
				}
}

// edge = boolean
function Point(edge) {
				this.edge = edge;
				this.neighbors = ["n"];
				this.travelled = false;
}

'use strict';

var Deck = function () {
				function Deck(tiles) {
								_classCallCheck(this, Deck);

								this.tiles = tiles;
				}

				_createClass(Deck, [{
								key: 'shuffle',
								value: function shuffle() {
												this.tiles = _.shuffle(this.tiles);
												return this;
								}
				}, {
								key: 'dealThree',
								value: function dealThree() {
												return this.tiles.splice(0, 3);
								}
				}, {
								key: 'deal',
								value: function deal(num) {
												return this.tiles.splice(0, num);
								}
				}, {
								key: 'reload',
								value: function reload(tiles) {
												this.tiles.push(tiles);
												return this;
								}
				}]);

				return Deck;
}();

'use strict';

//GAME///

var Game = function () {
				function Game(name) {
								_classCallCheck(this, Game);

								this.name = name;
								this.count = 35;
								this.board = new Board().drawBoard();
								this.players = [];
								this.availableMarkers = ["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"];

								this.currPlayer; //index of the currentPlayer in the turnOrderArray
								this.turnOrderArray = []; //holds all the players still on the board.
								this.dragon = ""; // Player.Marker
								this.moves;
				}

				_createClass(Game, [{
								key: 'getCurrentPlayer',
								value: function getCurrentPlayer() {
												if (this.currPlayer === -1) return;
												return this.turnOrderArray[this.currPlayer];
								}
				}, {
								key: 'moveAllPlayers',
								value: function moveAllPlayers() {
												this.players.forEach(function (player) {
																return player.keepMoving(player);
												});
								}
				}, {
								key: 'deadPlayers',
								value: function deadPlayers() {
												var deadPlayersTiles = [];
												this.players.forEach(function (player) {
																if (!player.canPlay && player.tiles.length > 0) {
																				deadPlayersTiles.push(player.tiles);
																				isDeadPlayer = true;
																}
												});
												return deadPlayersTiles;
								}
				}, {
								key: 'checkOver',
								value: function checkOver() {
												return getCanPlay().length <= 1;
								}

								//to be called at the end of a turn to set the currPlayer to the next eligible player in the turnOrderArray

				}, {
								key: 'goToNextPlayer',
								value: function goToNextPlayer() {
												if (getCanPlay(this.turnOrderArray).length > 1) {
																var newIdx = this.currPlayer + 1;
																while (!this.turnOrderArray[newIdx % 8].canPlay) {
																				newIdx++;
																}
																this.currPlayer = newIdx;
												} else {
																this.currPlayer = -1;
												}
												return this.getCurrentPlayer();
								}
				}, {
								key: 'deal',
								value: function deal(num) {
												var tiles = [];
												for (var i = 0; i < num; i++) {
																var tile = this.deck[0].splice(0, 1);
																this.deck.$save(0).then(function (ref) {
																				console.log('dealt a card!');
																});
																tiles = tiles.concat(tile);
												}
												return tiles;
								}

								//restart the game

				}, {
								key: 'reset',
								value: function reset() {
												var _this = this;

												this.players.forEach(function (player) {
																//retrieve all tiles
																//return player's tiles to the deck and shuffle
																_this.deck.reload(player.tiles).shuffle();
																player.tiles = [];
																//reset all players playability
																player.canPlay = true;
												});
								}
				}]);

				return Game;
}();

/////END OF GAME CLASS/////

//get Eligible players


var getCanPlay = function getCanPlay(players) {
				return players.filter(function (player) {
								return player.canPlay;
				});
};

tsuro.config(function ($stateProvider) {
				$stateProvider.state('game', {
								url: '/game/:gameName',
								templateUrl: '/browser/js/game/game.html',
								controller: 'gameCtrl'
				});
});

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray) {
				$scope.tile = {
								imageUrl: "",
								paths: [3, 4, 6, 0, 1, 7, 2, 5],
								rotation: 0
				};

				var ref = firebase.database().ref();
				var obj = $firebaseObject(ref);
				var gameRef = ref.child('games').child($stateParams.gameName);

				var deckRef = gameRef.child('deck');
				var playersRef = gameRef.child('players');
				var markersRef = gameRef.child('availableMarkers');
				var deckArr = $firebaseArray(deckRef);
				var firebasePlayersArr = $firebaseArray(playersRef);

				var player = Object.create(Player.prototype);

				/****************
    INITIALIZING GAME
    ****************/

				//new local game with game name defined by url
				$scope.game = new Game($stateParams.gameName);

				//when the deck is loaded...
				deckArr.$loaded().then(function (data) {
								$scope.game.deck = deckArr; //add the deck to the local game ? Try this as firebase DeckArr????

								//don't start watching players until there is a deck in the game
								playersRef.on("value", function (snap) {
												var snapPlayers = snap.val(); //grab the value of the snapshot (all players in game in Firebase)

												//for each player in this collection...
												for (var thisPlayer in snapPlayers) {
																var existingPlayerIndex, thisIsANewPlayer;

																//find this 'snap' player's index in local game. find returns that value.
																var localPlayer = $scope.game.players.find(function (plyr, plyrIdx) {
																				existingPlayerIndex = plyrIdx;
																				return plyr.uid === snapPlayers[thisPlayer].uid;
																});

																//if not found, create new player
																if (!localPlayer) {
																				console.log('i didnt find a local player!');
																				localPlayer = new Player(snapPlayers[thisPlayer].uid);
																				thisIsANewPlayer = true;
																}

																//for each key in the snapPlayer's keys, add that key and value to local player
																for (var playerproperty in snapPlayers[thisPlayer]) {
																				localPlayer[playerproperty] = snapPlayers[thisPlayer][playerproperty];
																}

																//push local player to game.players
																if (thisIsANewPlayer) $scope.game.players.push(localPlayer);else $scope.game.players[existingPlayerIndex] = localPlayer;
												}
								});
				});

				var markersArr = $firebaseArray(markersRef); //store markers array

				//when that markers array is loaded, update the available markers array on scope
				markersArr.$loaded().then(function (data) {
								$scope.game.availableMarkers = data[0];
				});

				//if someone else picks a marker, update your view
				markersRef.on('child_changed', function (data) {
								$scope.game.availableMarkers = data.val();
				});

				//on login, find me in the firebase players array
				firebase.auth().onAuthStateChanged(function (user) {
								firebasePlayersArr.$loaded().then(function (players) {

												if (user) {
																var me = players.find(function (player) {
																				return player.uid === user.uid;
																}); //find me
																if (me) $scope.me = me; //put me on scope
																if ($scope.me.marker === "n") $scope.me.marker = null; //if i don't have a marker yet, set it to null
												} else {
																// No user is signed in.
																console.log("no one is logged in");
												}
												console.log('im still logged in!', $scope.me);
								});
				});

				/****************
    GAME START PLAYER ACTIONS
    ****************/

				$scope.pickMarker = function (board, marker) {
								$scope.me.marker = marker; //my marker is this marker

								firebasePlayersArr.$loaded().then(function (players) {
												//find my index in the players array
												var meIdx;
												players.find(function (e, i) {
																if (e.$id === $scope.me.$id) meIdx = i;
												});

												//give me a marker and save me in firebase
												firebasePlayersArr[meIdx].marker = marker;
												firebasePlayersArr.$save(meIdx);
								});

								var idx = $scope.game.availableMarkers.indexOf(marker); //find the available marker in firebase
								markersArr[0].splice(idx, 1); //take it out

								markersArr.$save(0) //save it
								.then(function (ref) {
												console.log("removed the picked marker");
												console.log(ref.key);
								});
				};

				//TODO: limit start points

				//Have player pick their start point
				$scope.placeMarker = function (board, point) {
								//place my marker
								player.placeMarker(board, point, $scope.me);
								$scope.me.tiles = $scope.game.deal(3); //deal me three cards
								console.log($scope.me);

								//when the firebase players are loaded....
								firebasePlayersArr.$loaded().then(function (players) {
												//find me in the firebase players array
												var meIdx;
												players.find(function (e, i) {
																if (e.uid === $scope.me.uid) meIdx = i;
												});

												firebasePlayersArr[meIdx] = $scope.me; //set firebase me to local me
												firebasePlayersArr.$save(meIdx); //save it.
								});
				};

				//For synchronizingGame...
				// var syncRef = gameRef.child('moves');
				// syncRef.on('child_added', function (childSnapshot, prevChildKey) {
				// 	//NEED TO DOUBLE CHECK!! What does childSnap returns?
				// 	console.log('childSnapshot_SyncGame', childSnapshot);
				// 	//depending on what childSnapshot gives me...I think it's one child per on call? It doesn't return an array of changes...I believe!
				// 	if (childSnapshot.type === 'updateDeck') {
				// 		$scope.game.deck = childSnapshot.updateDeck;
				// 	} else {
				// 		$scope.placeTile(childSnapshot.tile);
				// 	}
				// });

				// TODO: how to re-do the moves?
				// $scope.game.moves;

				// TODO: how do we show the tiles for player?

				// TODO: how to show the rotated tile?

				// CMT: assuming we use new Game() for each game
				$scope.currentPlayer = $scope.game.getCurrentPlayer();

				// TODO: need a function to assign dragon
				$scope.dragon;
				var awaitingDragonHolders = [];

				$scope.start = function () {
								//
				};

				$scope.myTurn = function () {
								$scope.me === $scope.currentPlayer;
				};

				//these are tied to angular ng-click buttons
				$scope.rotateTileCw = function (tile) {
								console.log("rotate to right");
								tile.rotation++;
								if (tile.rotation === 4) tile.rotation = 0;
				};

				$scope.rotateTileCcw = function (tile) {
								tile.rotation--;
								if (tile.rotation === -4) tile.rotation = 0;
				};

				// CMT: use player's and game's prototype function to place tile and then move all players
				$scope.placeTile = function (tile) {
								// TODO: send this state to firebase every time it's called
								if (tile.rotation > 0) {
												tile.paths = tile.paths.map(function (connection) {
																connection = connection + 2;
																if (connection === 9) connection = 1;
																if (connection === 8) connection = 0;
																return connection;
												});
												tile.paths.unshift(tile.paths.pop());
												tile.paths.unshift(tile.paths.pop());
								} else if (tile.rotation < 0) {
												tile.paths = tile.paths.map(function (connection) {
																connection = connection - 2;
																if (connection === -2) connection = 6;
																if (connection === -1) connection = 7;
																return connection;
												});
												tile.paths.push(tile.paths.shift());
												tile.paths.push(tile.paths.shift());
								}

								var firebasePlayersArr = $firebaseArray(playersRef);
								firebasePlayersArr.$loaded().then(function (players) {
												var meIdx;
												players.find(function (e, i) {
																if (e.$id === $scope.me.$id) meIdx = i;
												});

												player.placeTile(tile, firebasePlayersArr[meIdx]);

												for (var i = 0; i < tile.paths.length; i++) {
																if (firebasePlayersArr[meIdx].nextSpace.points[i].neighbors[0] === "n") {
																				firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.splice(0, 1);
																}
																firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.push(firebasePlayersArr[meIdx].nextSpace.points[tile.paths[i]]);
																firebasePlayersArr.$save(meIdx);
												}

												firebasePlayersArr[meIdx].point = firebasePlayersArr[meIdx].nextSpace.points[firebasePlayersArr[meIdx].nextSpacePointsIndex];
												firebasePlayersArr.$save(meIdx);
								});

								// CMT: this should send the rotated tile to firebase
								movesArr.$add({
												'type': 'placeTile',
												'tile': tile,
												'playerUid': $scope.me.uid
								});

								firebasePlayersArr.$loaded().then(function (players) {
												players.forEach(function (p) {
																console.log("p", p.point);

																// let movable = player.moveTo(p.point);
																// var pIdx = players.indexOf(p)

																// while (movable) {
																//     // my point is going to be current point's neighbors
																//     p.point.travelled = true;
																//     p.point = p.neighbors.filter(function (n) {
																//         return !n.travelled && neighbor !== "n";
																//     })[0]
																//     console.log(p.point, "game js p point")
																//     var pointIdx;
																//     p.nextSpace.points.forEach(function (point, idx) {
																//         if (JSON.toString(point) === JSON.toString(p.point)) {
																//             pointIdx = idx;
																//         }
																//     })
																//     p.nextSpacePointsIndex = pointIdx;
																//
																//     let oldSpace = p.nextSpace;
																//     let newSpace = player.newSpace($scope.game.board, oldSpace, p);
																//     p.nextSpace = newSpace;
																//
																//     firebasePlayersArr.$save(pIdx)
																//         // player.checkDeath(p);
																//     movable = player.moveTo(p.point);
																//
																// }
												});
								});

								// if ($scope.game.checkOver()) {
								//     // TODO: need to tell the player she won
								//     $scope.winner = $scope.game.getCanPlay()[0];
								//     $scope.gameOver = true;
								// } else {
								//     // If deck is empty & no one is dragon, set me as dragon
								//     if ($scope.game.deck.length === 0 && !$scope.dragon) {
								//         $scope.dragon = $scope.me;
								//     } else if ($scope.game.deck.length === 0 && $scope.dragon) {
								//         awaitingDragonHolders.push($scope.me);
								//     } else {
								//         // CMT: draw one tile and push it to the player.tiles array
								//         $scope.me.tiles.push($scope.game.deck.deal(1));
								//         //if dead players, then push their cards back to the deck & reshuffle
								//         if ($scope.game.deadPlayers().length) {
								//             //with new cards & need to reshuffle
								//             $scope.game.deadPlayers().forEach(function (deadPlayerTiles) {
								//                 deadPlayerTiles.forEach(function (tile) {
								//                     $scope.game.deck.push(tile);
								//                 });
								//             });
								//             $scope.game.deck = $scope.game.deck.shuffle();
								//             //send firebase a new move
								//             gameRef.child('moves').push({
								//                 'type': 'updateDeck',
								//                 'updateDeck': $scope.game.deck
								//             });
								//             if ($scope.dragon) {
								//                 $scope.dragon.tiles.push($scope.game.deck.deal(1));
								//                 $scope.dragon = null;
								//                 //NEED TO DISCUSS: Might need to modify this if we want to use up the cards and give each awaiting players' up to 3 cards
								//                 while ($scope.game.deck.length && $scope.awaitingDragonHolders.length) {
								//                     $scope.awaitingDragonHolders.shift().tiles.push($scope.game.deck.deal(1));
								//                 };
								//                 if ($scope.awaitingDragonHolders.length) {
								//                     $scope.dragon = $scope.awaitingDragonHolders.shift();
								//                 }
								//             };
								//         }
								//
								//     }
								//     $scope.game.goToNextPlayer();
								// }
				};

				// TODO: firebase game.players slice $scope.player out
				$scope.leaveGame;

				// TODO: need to remove this game room's moves from firebase?
				$scope.reset = function () {
								markersArr.$remove(0).then(function (ref) {
												console.log("removed all markers", ref.key);
								});

								deckArr.$remove(0).then(function (ref) {
												console.log("removed the deck", ref.key);
								});

								obj.$loaded().then(function (data) {
												var tiles = data.tiles;
												var deck = new Deck(tiles).shuffle().tiles;
												var initialDeckRef = ref.child('games').child($stateParams.gameName).child('initialDeck');
												$firebaseArray(initialDeckRef).$add(deck);
								});

								var initialMarkersRef = ref.child('games').child($stateParams.gameName).child('availableMarkers');
								$firebaseArray(initialMarkersRef).$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);

								var players = $firebaseArray(playersRef);
								players.$loaded().then(function (data) {
												for (var i = 0; i < data.length; i++) {
																data[i].canPlay = true;
																data[i].marker = 'n';
																data[i].nextSpace = 'n';
																data[i].nextSpacePointsIndex = 'n';
																data[i].point = 'n';
																data[i].tiles = 'n';
																players.$save(i);
												}
								});

								console.log($scope.me);
				};

				$scope.starttop = [[0, 0, 0], [0, 0, 1], [1, 0, 0], [1, 0, 1], [2, 0, 0], [2, 0, 1], [3, 0, 0], [3, 0, 1], [4, 0, 0], [4, 0, 1], [5, 0, 0], [5, 0, 1]];
				$scope.startleft = [[0, 0, 7], [0, 0, 6], [0, 1, 7], [0, 1, 6], [0, 2, 7], [0, 2, 6], [0, 3, 7], [0, 3, 6], [0, 4, 7], [0, 4, 6], [0, 5, 7], [0, 5, 6]];
				$scope.startbottom = [[0, 5, 0], [0, 5, 1], [1, 5, 0], [1, 5, 1], [2, 5, 0], [2, 5, 1], [3, 5, 0], [3, 5, 1], [4, 5, 0], [4, 5, 1], [5, 5, 0], [5, 5, 1]];
				$scope.startright = [[5, 0, 2], [5, 0, 3], [5, 1, 2], [5, 1, 3], [5, 2, 2], [5, 2, 3], [5, 3, 2], [5, 3, 3], [5, 4, 2], [5, 4, 3], [5, 5, 2], [5, 5, 3]];
});

tsuro.config(function ($stateProvider) {
				$stateProvider.state('login', {
								url: '/login',
								templateUrl: '/browser/js/login/login.html',
								controller: 'loginCtrl'
				});
});

tsuro.controller('loginCtrl', function ($scope, $state, $firebaseAuth, $rootScope) {
				var auth = $firebaseAuth();

				$scope.logInWithGoogle = function () {
								auth.$signInWithPopup("google").then(function (authData) {
												console.log("Logged in as:", authData);
												$rootScope.currentUser = authData;
												$state.go('pickGame');
								}).catch(function (error) {
												console.error("Authentication failed:", error);
								});
				};
});

tsuro.config(function ($stateProvider) {
				$stateProvider.state('pickGame', {
								url: '/pickgame',
								templateUrl: '/browser/js/pickGame/pickGame.html',
								controller: 'pickGameCtrl'
				});
});

tsuro.controller('pickGameCtrl', function ($scope, $state, $firebaseArray, $firebaseObject) {
				var ref = firebase.database().ref();
				var obj = $firebaseObject(ref);

				$scope.createGame = function (gameName) {
								var gameNameRef = ref.child('games').child(gameName);
								var playersRef = gameNameRef.child('players');

								$firebaseArray(gameNameRef).$add({
												"gameName": gameName
								});

								firebase.auth().onAuthStateChanged(function (user) {
												if (user) {
																var newPlayer = new Player(user.uid);
																$firebaseArray(playersRef).$add(newPlayer);
												} else {
																console.log("no one logged in");
												}
								});

								obj.$loaded().then(function (data) {
												var tiles = data.tiles;
												var deck = new Deck(tiles).shuffle().tiles;
												var deckRef = ref.child('games').child(gameName).child('deck');
												$firebaseArray(deckRef).$add(deck);
								});

								var initialMarkersRef = ref.child('games').child(gameName).child('availableMarkers');
								$firebaseArray(initialMarkersRef).$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);

								$state.go('game', {
												"gameName": gameName
								});
				};

				$scope.goToGameList = function () {
								$state.go('gamelist');
				};
});

'use strict';

function Player(uid) {
				// TODO: get uid from firebase auth
				this.uid = uid;

				this.marker = "n";

				// should be a Point object
				this.point = "n";

				// [x, y]
				// depends on the angular Space.x, Space.y
				this.nextSpace = "n";

				// in each Space.points array, find this specific point and get the position (integer) inside this space.
				this.nextSpacePointsIndex = "n";

				// maximun 3 tiles
				this.tiles = 'n';

				// if a player dies, it will be changed to false
				this.canPlay = true;
}
Player.prototype.hi = function () {
				console.log("HI");
};
// need to use self becuse we need to change $scope.me on gameCtrl and send to firebase
Player.prototype.placeMarker = function (board, point, self) {
				// point looks like [x, y, pointsIndex] in the space
				var x = point[0];
				var y = point[1];
				var pointsIndex = point[2];

				self.point = board[y][x].points[pointsIndex];
				self.point.travelled = true;

				//[x, y] from the point
				self.nextSpace = board[y][x];

				// in each Space.points array, find this specific point and get the position (integer) inside this space.
				self.nextSpacePointsIndex = self.nextSpace.points.indexOf(self.point);
};

Player.prototype.newSpace = function (board, oldSpace, self) {
				if (self.nextSpacePointsIndex === 0 || self.nextSpacePointsIndex === 1) {
								return board[oldSpace.y - 1][oldSpace.x];
				} else if (self.nextSpacePointsIndex === 2 || self.nextSpacePointsIndex === 3) {
								return board[oldSpace.y][oldSpace.x + 1];
				} else if (self.nextSpacePointsIndex === 4 || self.nextSpacePointsIndex === 5) {
								return board[oldSpace.y + 1][oldSpace.x];
				} else {
								return board[oldSpace.y][oldSpace.x - 1];
				}
};

// need to use self becuse we need to change $scope.me on gameCtrl and send to firebase
Player.prototype.placeTile = function (tile, self) {
				self.tiles = self.tiles.filter(function (t) {
								return t.id !== tile.id;
				});

				self.nextSpace.tileUrl = tile.imageUrl;
};

Player.prototype.moveTo = function (pointer) {
				//always be returning 0 or 1 point in the array
				var nextPoint = pointer.neighbors.filter(function (neighbor) {
								return !neighbor.travelled && neighbor !== "n";
				})[0];
				console.log("nextPoint", nextPoint);
				return nextPoint;
};

// TODO: not sure how to make this keep moving with players instead of self
// Player.prototype.keepMoving = function (self) {
//     let movable = self.moveTo(self.point);
//     while (movable) {
//         self.point.travelled = true;
//         self.point = self.moveTo(self.point);
//         let oldSpace = self.nextSpace;
//         let newSpace = newSpace(oldSpace);
//         self.nextSpace = newSpace;
//         self.nextSpacePointsIndex = self.nextSpace.points.indexOf(self.point);
//         self.checkDeath();
//         movable = self.moveTo(self.point);
//     }
// };

Player.prototype.checkDeath = function (self) {
				var allTravelled = self.point.neighbors.filter(function (neighbor) {
								return neighbor.travelled;
				});

				if (self.point.edge || allTravelled.length === 2) self.die();
};

Player.prototype.die = function () {
				this.canPlay = false;
				// TODO: need to send an alert or message to the player who just died.
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwiZ2FtZS9ib2FyZC5qcyIsImdhbWUvZGVjay5qcyIsImdhbWUvZ2FtZS5jb250cnVjdG9yLmpzIiwiZ2FtZS9nYW1lLmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSxvQ0FGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxlQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBRUEsUUFBQSxPQUFBLGVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxRQUFBLEVBQUE7O0FBRUEsUUFBQSxXQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsa0JBQUEsZ0JBQUEsUUFBQSxDQUFBOzs7O0FBSUEsb0JBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxZQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLElBQUEsT0FBQSxRQUFBLEVBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLGVBQUEsU0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLEtBUEE7O0FBWUEsV0FBQSxJQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLGNBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLGFBQUEsWUFBQSxLQUFBLENBQUEsU0FBQSxDQUFBOztBQUVBLGlCQUFBLElBQUEsR0FBQSxrQkFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEscUJBQUEsZUFBQSxVQUFBLENBQUE7O0FBRUEsK0JBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG9CQUFBLFlBQUEsSUFBQTs7QUFFQSxvQkFBQSxJQUFBLEVBQUE7QUFDQSx3QkFBQSxDQUFBLFVBQUEsTUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsK0JBQUEsT0FBQSxHQUFBLEtBQUEsS0FBQSxHQUFBO0FBQ0EscUJBRkEsRUFFQSxNQUZBLEVBRUE7QUFDQSw0QkFBQSxZQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBO0FBQ0EsdUNBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxTQUFBO0FBQ0E7QUFDQSxpQkFQQSxNQU9BOztBQUVBLDRCQUFBLEdBQUEsQ0FBQSxTQUFBO0FBQ0E7QUFDQSxhQWRBLEVBZUEsSUFmQSxDQWVBLFlBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsZ0NBQUE7QUFEQSxpQkFBQTtBQUdBLGFBbkJBO0FBb0JBLFNBdkJBO0FBd0JBLEtBNUJBO0FBNkJBLENBdERBOztBQ1JBLFNBQUEsS0FBQSxHQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsRUFBQTtBQUNBOztBQUVBLE1BQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0E7QUFDQTtBQUNBLFdBQUEsS0FBQSxLQUFBO0FBQ0EsQ0FSQTs7QUFVQSxTQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsR0FBQTtBQUNBLFNBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsT0FBQSxHQUFBLEdBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxHQUFBOztBQUVBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLHNCQUFBOztBQUVBLFlBQUEsSUFBQSxDQUFBLEVBQUE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxNQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsU0FKQSxNQUlBLElBQUEsSUFBQSxDQUFBLEVBQUE7O0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEtBQ0EsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFNBSEEsTUFHQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0E7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBO0FBQ0EscUJBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUlBLFNBQUEsS0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQTs7QUNuREE7O0lB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Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdEQSxXQUFBLGFBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxnQkFBQSxFQUFBOzs7QUFHQSxXQUFBLE1BQUE7QUFDQSxRQUFBLHdCQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLEdBQUEsWUFBQTs7QUFFQSxLQUZBOztBQUlBLFdBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQSxPQUFBLGFBQUE7QUFDQSxLQUZBOzs7QUFLQSxXQUFBLFlBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxpQkFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsUUFBQSxHQUFBLENBQUE7QUFDQSxLQUpBOztBQU1BLFdBQUEsYUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxRQUFBO0FBQ0EsWUFBQSxLQUFBLFFBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FIQTs7O0FBTUEsV0FBQSxTQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7O0FBRUEsWUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0EsdUJBQUEsVUFBQTtBQUNBLGFBTEEsQ0FBQTtBQU1BLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxTQVRBLE1BU0EsSUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUE7QUFDQSxhQUxBLENBQUE7QUFNQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0E7O0FBRUEsWUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxLQUFBO0FBQ0Esb0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxhQUZBOztBQUlBLG1CQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsbUJBQUEsS0FBQSxDQUFBOztBQUVBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsbUJBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxFQUFBO0FBQ0EsdUNBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQTtBQUNBLG1DQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsbUNBQUEsS0FBQSxDQUFBLEtBQUE7QUFDQTs7QUFFQSwrQkFBQSxLQUFBLEVBQUEsS0FBQSxHQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLG1CQUFBLEtBQUEsRUFBQSxvQkFBQSxDQUFBO0FBQ0EsK0JBQUEsS0FBQSxDQUFBLEtBQUE7QUFDQSxTQW5CQTs7O0FBdUJBLGlCQUFBLElBQUEsQ0FBQTtBQUNBLG9CQUFBLFdBREE7QUFFQSxvQkFBQSxJQUZBO0FBR0EseUJBQUEsT0FBQSxFQUFBLENBQUE7QUFIQSxTQUFBOztBQU9BLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxvQkFBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSx3QkFBQSxHQUFBLENBQUEsR0FBQSxFQUFBLEVBQUEsS0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2QkEsYUE5QkE7QUErQkEsU0FqQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStFQSxLQXBJQTs7O0FBdUlBLFdBQUEsU0FBQTs7O0FBR0EsV0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLE9BQUEsQ0FBQSxDQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLHFCQUFBLEVBQUEsSUFBQSxHQUFBO0FBQ0EsU0FIQTs7QUFLQSxnQkFBQSxPQUFBLENBQUEsQ0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQTtBQUNBLFNBSEE7O0FBS0EsWUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxLQUFBLEtBQUE7QUFDQSxnQkFBQSxPQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLGdCQUFBLGlCQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLDJCQUFBLGNBQUEsRUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLFNBTEE7O0FBU0EsWUFBQSxvQkFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxrQkFBQSxDQUFBO0FBQ0EsdUJBQUEsaUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUdBLFlBQUEsVUFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLGdCQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsS0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLE1BQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLFNBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLG9CQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxLQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxLQUFBLEdBQUEsR0FBQTtBQUNBLHdCQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxTQVZBOztBQVlBLGdCQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFFQSxLQXZDQTs7QUEwQ0EsV0FBQSxRQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsU0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFdBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxVQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLENBMWJBOztBQ1JBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsUUFEQTtBQUVBLHFCQUFBLDhCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxRQUFBLE9BQUEsZUFBQTs7QUFFQSxXQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsYUFBQSxnQkFBQSxDQUFBLFFBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsZUFBQSxFQUFBLFFBQUE7QUFDQSx1QkFBQSxXQUFBLEdBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsU0FKQSxFQUlBLEtBSkEsQ0FJQSxVQUFBLEtBQUEsRUFBQTtBQUNBLG9CQUFBLEtBQUEsQ0FBQSx3QkFBQSxFQUFBLEtBQUE7QUFDQSxTQU5BO0FBUUEsS0FUQTtBQVdBLENBZEE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsb0NBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBLGVBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUdBLFdBQUEsVUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsWUFBQSxjQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxhQUFBLFlBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQTs7QUFFQSx1QkFBQSxXQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBOztBQUlBLGlCQUFBLElBQUEsR0FBQSxrQkFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esb0JBQUEsWUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQTtBQUNBLCtCQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsU0FBQTtBQUNBLGFBSEEsTUFHQTtBQUNBLHdCQUFBLEdBQUEsQ0FBQSxrQkFBQTtBQUNBO0FBQ0EsU0FQQTs7QUFTQSxZQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxRQUFBLEtBQUEsS0FBQTtBQUNBLGdCQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxFQUFBLE9BQUEsR0FBQSxLQUFBO0FBQ0EsZ0JBQUEsVUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsMkJBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsU0FMQTs7QUFRQSxZQUFBLG9CQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxrQkFBQSxDQUFBO0FBQ0EsdUJBQUEsaUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUdBLGVBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLHdCQUFBO0FBREEsU0FBQTtBQUdBLEtBaENBOztBQWtDQSxXQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLEtBRkE7QUFHQSxDQTFDQTs7QUNSQTs7QUFFQSxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsU0FBQSxHQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7O0FBSUEsU0FBQSxTQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsT0FBQSxHQUFBLElBQUE7QUFDQTtBQUNBLE9BQUEsU0FBQSxDQUFBLEVBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxHQUFBLENBQUEsSUFBQTtBQUNBLENBRkE7O0FBSUEsT0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7O0FBRUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxjQUFBLE1BQUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEtBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxDQWRBOztBQWdCQSxPQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FWQTs7O0FBYUEsT0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxFQUFBLEtBQUEsS0FBQSxFQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFNBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLFFBQUE7QUFFQSxDQVBBOztBQVNBLE9BQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxRQUFBLFlBQUEsUUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFNBQUEsU0FBQSxJQUFBLGFBQUEsR0FBQTtBQUNBLEtBRkEsRUFFQSxDQUZBLENBQUE7QUFHQSxZQUFBLEdBQUEsQ0FBQSxXQUFBLEVBQUEsU0FBQTtBQUNBLFdBQUEsU0FBQTtBQUNBLENBUEE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JBLE9BQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsYUFBQSxNQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQTtBQUNBLENBTkE7O0FBUUEsT0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxLQUFBOztBQUVBLENBSEEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDTG0zamtrNXBwTXFlUXhLb0gtZFo5Q2RZTWFER1dXcVVcIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWFwcC5jb21cIixcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcblxudHN1cm8uY29uc3RhbnQoJ2ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tLycpO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lbGlzdCcsIHtcbiAgICAgICAgdXJsOiAnL2dhbWVsaXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZUxpc3QuLi5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICB2YXIgZmlyZWJhc2VVc2VyID0gYXV0aC4kZ2V0QXV0aCgpO1xuXG4gICAgdmFyIHN5bmNoUmVmID0gcmVmLmNoaWxkKFwiZ2FtZXNcIik7XG4gICAgdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG5cbiAgICAvLyBUaGlzIHJldHVybnMgYSBwcm9taXNlLi4ueW91IGNhbi50aGVuKCkgYW5kIGFzc2lnbiB2YWx1ZSB0byAkc2NvcGUudmFyaWFibGVcbiAgICAvLyBnYW1lbGlzdCBpcyB3aGF0ZXZlciB3ZSBhcmUgY2FsbGluZyBpdCBpbiB0aGUgYW5ndWxhciBodG1sLlxuICAgIHN5bmNocm9uaXplZE9iai4kYmluZFRvKCRzY29wZSwgXCJnYW1lbGlzdFwiKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZ2FtZWxpc3QgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gJHNjb3BlLmdhbWVsaXN0KSB7XG4gICAgICAgICAgICAgICAgZ2FtZWxpc3QucHVzaChbaSwgJHNjb3BlLmdhbWVsaXN0W2ldXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU5hbWVzID0gZ2FtZWxpc3Quc2xpY2UoMik7XG4gICAgICAgIH0pO1xuXG5cblxuXG4gICAgJHNjb3BlLmpvaW4gPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBGQnBsYXllcnMgPSBkYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIUZCcGxheWVycy5maWx0ZXIoZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGxheWVyLnVpZCA9PT0gdXNlci51aWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcih1c2VyLnVpZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vIHVzZXIgaXMgc2lnbmVkIGluLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJub3RoaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiIsImZ1bmN0aW9uIEJvYXJkKCkge1xuICAgIHRoaXMuYm9hcmQgPSBbXTtcbn1cblxuQm9hcmQucHJvdG90eXBlLmRyYXdCb2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDY7IHkrKykge1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmRbeV0pIHRoaXMuYm9hcmRbeV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA2OyB4KyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbeV0ucHVzaChuZXcgU3BhY2UoeCwgeSwgdGhpcy5ib2FyZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJvYXJkO1xufVxuXG5mdW5jdGlvbiBTcGFjZSh4LCB5LCBib2FyZCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmltYWdlID0gXCJuXCI7XG4gICAgdGhpcy5wb2ludHMgPSBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF07XG4gICAgdGhpcy50aWxlVXJsID0gXCJuXCI7XG4gICAgdGhpcy50aWxlSWQgPSBcIm5cIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCBjb3JyZXNwb25kaW5nO1xuXG4gICAgICAgIGlmIChpIDwgMikgeyAvL3RvcFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDAgPyA1IDogNDsgLy8gMCAtPiA1ICYgMSAtPiA0XG4gICAgICAgICAgICBpZiAoeSA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gYm9hcmRbeSAtIDFdW3hdLnBvaW50c1tjb3JyZXNwb25kaW5nXTtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNCkgeyAvL3JpZ2h0XG4gICAgICAgICAgICBpZiAoeCA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNikgeyAvL2JvdHRvbVxuICAgICAgICAgICAgaWYgKHkgPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7IC8vbGVmdFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDYgPyAzIDogMjsgLy8gNiAtPiAzICYgNyAtPiAyXG4gICAgICAgICAgICBpZiAoeCA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3ldW3ggLSAxXS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuLy8gZWRnZSA9IGJvb2xlYW5cbmZ1bmN0aW9uIFBvaW50KGVkZ2UpIHtcbiAgICB0aGlzLmVkZ2UgPSBlZGdlO1xuICAgIHRoaXMubmVpZ2hib3JzID0gW1wiblwiXTtcbiAgICB0aGlzLnRyYXZlbGxlZCA9IGZhbHNlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEZWNrIHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB9XG5cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gXy5zaHVmZmxlKHRoaXMudGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRlYWxUaHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIDMpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCBudW0pO1xuICAgIH1cblxuICAgIHJlbG9hZCh0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCkuZHJhd0JvYXJkKCk7XG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXVxuXG4gICAgICAgIHRoaXMuY3VyclBsYXllcjsgLy9pbmRleCBvZiB0aGUgY3VycmVudFBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICAgICAgdGhpcy50dXJuT3JkZXJBcnJheSA9IFtdIC8vaG9sZHMgYWxsIHRoZSBwbGF5ZXJzIHN0aWxsIG9uIHRoZSBib2FyZC5cbiAgICAgICAgdGhpcy5kcmFnb24gPSBcIlwiOyAvLyBQbGF5ZXIuTWFya2VyXG4gICAgICAgIHRoaXMubW92ZXM7XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VyclBsYXllciA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybk9yZGVyQXJyYXlbdGhpcy5jdXJyUGxheWVyXTtcbiAgICB9XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcocGxheWVyKSlcbiAgICB9XG5cbiAgICBkZWFkUGxheWVycygpIHtcbiAgICAgICAgdmFyIGRlYWRQbGF5ZXJzVGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgaWYgKCFwbGF5ZXIuY2FuUGxheSAmJiBwbGF5ZXIudGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJzVGlsZXMucHVzaChwbGF5ZXIudGlsZXMpO1xuICAgICAgICAgICAgICAgIGlzRGVhZFBsYXllciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVhZFBsYXllcnNUaWxlcztcbiAgICB9XG5cbiAgICBjaGVja092ZXIoKSB7XG4gICAgICAgIHJldHVybiBnZXRDYW5QbGF5KCkubGVuZ3RoIDw9IDE7XG4gICAgfVxuXG4gICAgLy90byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIHR1cm4gdG8gc2V0IHRoZSBjdXJyUGxheWVyIHRvIHRoZSBuZXh0IGVsaWdpYmxlIHBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICBnb1RvTmV4dFBsYXllcigpIHtcbiAgICAgICAgaWYgKGdldENhblBsYXkodGhpcy50dXJuT3JkZXJBcnJheSkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbGV0IG5ld0lkeCA9IHRoaXMuY3VyclBsYXllciArIDE7XG4gICAgICAgICAgICB3aGlsZSAoIXRoaXMudHVybk9yZGVyQXJyYXlbbmV3SWR4ICUgOF0uY2FuUGxheSkge1xuICAgICAgICAgICAgICAgIG5ld0lkeCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gbmV3SWR4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKXtcbiAgICAgICAgdmFyIHRpbGVzID0gW107XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBudW07IGkrKyl7IFxuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmRlY2tbMF0uc3BsaWNlKDAsMSk7XG4gICAgICAgICAgICB0aGlzLmRlY2suJHNhdmUoMCkudGhlbihmdW5jdGlvbihyZWYpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZWFsdCBhIGNhcmQhJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGVzID0gdGlsZXMuY29uY2F0KHRpbGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICAvL3Jlc3RhcnQgdGhlIGdhbWVcbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgIC8vcmV0cmlldmUgYWxsIHRpbGVzXG4gICAgICAgICAgICAvL3JldHVybiBwbGF5ZXIncyB0aWxlcyB0byB0aGUgZGVjayBhbmQgc2h1ZmZsZVxuICAgICAgICAgICAgdGhpcy5kZWNrLnJlbG9hZChwbGF5ZXIudGlsZXMpLnNodWZmbGUoKTtcbiAgICAgICAgICAgIHBsYXllci50aWxlcyA9IFtdO1xuICAgICAgICAgICAgLy9yZXNldCBhbGwgcGxheWVycyBwbGF5YWJpbGl0eVxuICAgICAgICAgICAgcGxheWVyLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuLy8vLy9FTkQgT0YgR0FNRSBDTEFTUy8vLy8vXG5cbi8vZ2V0IEVsaWdpYmxlIHBsYXllcnNcbmxldCBnZXRDYW5QbGF5ID0gZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICByZXR1cm4gcGxheWVycy5maWx0ZXIoKHBsYXllcikgPT4ge1xuICAgICAgICByZXR1cm4gcGxheWVyLmNhblBsYXlcbiAgICB9KVxufVxuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcblx0XHR1cmw6ICcvZ2FtZS86Z2FtZU5hbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdnYW1lQ3RybCdcblx0fSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5KSB7IFxuXHQkc2NvcGUudGlsZSA9IHtcblx0XHRpbWFnZVVybDogXCJcIixcblx0XHRwYXRoczogWzMsIDQsIDYsIDAsIDEsIDcsIDIsIDVdLFxuXHRcdHJvdGF0aW9uOiAwXG5cdH07XG5cblxuXHR2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcblx0dmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXHR2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXG5cdHZhciBkZWNrUmVmID0gZ2FtZVJlZi5jaGlsZCgnZGVjaycpO1xuXHR2YXIgcGxheWVyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblx0dmFyIG1hcmtlcnNSZWYgPSBnYW1lUmVmLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG5cdHZhciBkZWNrQXJyID0gJGZpcmViYXNlQXJyYXkoZGVja1JlZik7XG5cdHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuXHR2YXIgcGxheWVyID0gT2JqZWN0LmNyZWF0ZShQbGF5ZXIucHJvdG90eXBlKTtcblxuXHQvKioqKioqKioqKioqKioqKlxuXHRJTklUSUFMSVpJTkcgR0FNRVxuXHQqKioqKioqKioqKioqKioqL1xuXG5cdC8vbmV3IGxvY2FsIGdhbWUgd2l0aCBnYW1lIG5hbWUgZGVmaW5lZCBieSB1cmxcblx0JHNjb3BlLmdhbWUgPSBuZXcgR2FtZSgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXG5cdC8vd2hlbiB0aGUgZGVjayBpcyBsb2FkZWQuLi5cblx0ZGVja0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdCRzY29wZS5nYW1lLmRlY2sgPSBkZWNrQXJyOyAvL2FkZCB0aGUgZGVjayB0byB0aGUgbG9jYWwgZ2FtZSA/IFRyeSB0aGlzIGFzIGZpcmViYXNlIERlY2tBcnI/Pz8/XG5cblxuXHRcdC8vZG9uJ3Qgc3RhcnQgd2F0Y2hpbmcgcGxheWVycyB1bnRpbCB0aGVyZSBpcyBhIGRlY2sgaW4gdGhlIGdhbWVcblx0XHRwbGF5ZXJzUmVmLm9uKFwidmFsdWVcIiwgZnVuY3Rpb24gKHNuYXApIHtcblx0XHRcdHZhciBzbmFwUGxheWVycyA9IHNuYXAudmFsKCk7IC8vZ3JhYiB0aGUgdmFsdWUgb2YgdGhlIHNuYXBzaG90IChhbGwgcGxheWVycyBpbiBnYW1lIGluIEZpcmViYXNlKVxuXG5cdFx0XHQvL2ZvciBlYWNoIHBsYXllciBpbiB0aGlzIGNvbGxlY3Rpb24uLi5cblx0XHRcdGZvciAodmFyIHRoaXNQbGF5ZXIgaW4gc25hcFBsYXllcnMpIHtcblx0XHRcdFx0dmFyIGV4aXN0aW5nUGxheWVySW5kZXgsIHRoaXNJc0FOZXdQbGF5ZXI7XG5cblx0XHRcdFx0Ly9maW5kIHRoaXMgJ3NuYXAnIHBsYXllcidzIGluZGV4IGluIGxvY2FsIGdhbWUuIGZpbmQgcmV0dXJucyB0aGF0IHZhbHVlLiBcblx0XHRcdFx0dmFyIGxvY2FsUGxheWVyID0gJHNjb3BlLmdhbWUucGxheWVycy5maW5kKGZ1bmN0aW9uIChwbHlyLCBwbHlySWR4KSB7XG5cdFx0XHRcdFx0ZXhpc3RpbmdQbGF5ZXJJbmRleCA9IHBseXJJZHg7XG5cdFx0XHRcdFx0cmV0dXJuIHBseXIudWlkID09PSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXS51aWQ7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vaWYgbm90IGZvdW5kLCBjcmVhdGUgbmV3IHBsYXllclxuXHRcdFx0XHRpZiAoIWxvY2FsUGxheWVyKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2kgZGlkbnQgZmluZCBhIGxvY2FsIHBsYXllciEnKTtcblx0XHRcdFx0XHRsb2NhbFBsYXllciA9IG5ldyBQbGF5ZXIoc25hcFBsYXllcnNbdGhpc1BsYXllcl0udWlkKTtcblx0XHRcdFx0XHR0aGlzSXNBTmV3UGxheWVyID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vZm9yIGVhY2gga2V5IGluIHRoZSBzbmFwUGxheWVyJ3Mga2V5cywgYWRkIHRoYXQga2V5IGFuZCB2YWx1ZSB0byBsb2NhbCBwbGF5ZXJcblx0XHRcdFx0Zm9yICh2YXIgcGxheWVycHJvcGVydHkgaW4gc25hcFBsYXllcnNbdGhpc1BsYXllcl0pIHtcblx0XHRcdFx0XHRsb2NhbFBsYXllcltwbGF5ZXJwcm9wZXJ0eV0gPSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXVtwbGF5ZXJwcm9wZXJ0eV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3B1c2ggbG9jYWwgcGxheWVyIHRvIGdhbWUucGxheWVyc1xuXHRcdFx0XHRpZiAodGhpc0lzQU5ld1BsYXllcikgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKGxvY2FsUGxheWVyKTtcblx0XHRcdFx0ZWxzZSAkc2NvcGUuZ2FtZS5wbGF5ZXJzW2V4aXN0aW5nUGxheWVySW5kZXhdID0gbG9jYWxQbGF5ZXI7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSk7XG5cblxuXHR2YXIgbWFya2Vyc0FyciA9ICRmaXJlYmFzZUFycmF5KG1hcmtlcnNSZWYpOyAvL3N0b3JlIG1hcmtlcnMgYXJyYXlcblxuXHQvL3doZW4gdGhhdCBtYXJrZXJzIGFycmF5IGlzIGxvYWRlZCwgdXBkYXRlIHRoZSBhdmFpbGFibGUgbWFya2VycyBhcnJheSBvbiBzY29wZVxuXHRtYXJrZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0JHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGFbMF07XG5cdH0pO1xuXG5cdC8vaWYgc29tZW9uZSBlbHNlIHBpY2tzIGEgbWFya2VyLCB1cGRhdGUgeW91ciB2aWV3XG5cdG1hcmtlcnNSZWYub24oJ2NoaWxkX2NoYW5nZWQnLCBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdCRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSBkYXRhLnZhbCgpO1xuXHR9KTtcblxuXHQvL29uIGxvZ2luLCBmaW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG5cdGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcblx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblxuXHRcdFx0aWYgKHVzZXIpIHtcblx0XHRcdFx0dmFyIG1lID0gcGxheWVycy5maW5kKHBsYXllciA9PiBwbGF5ZXIudWlkID09PSB1c2VyLnVpZCk7XHQvL2ZpbmQgbWVcblx0XHRcdFx0aWYgKG1lKSAkc2NvcGUubWUgPSBtZTsgLy9wdXQgbWUgb24gc2NvcGVcblx0XHRcdFx0aWYgKCRzY29wZS5tZS5tYXJrZXIgPT09IFwiblwiKSAkc2NvcGUubWUubWFya2VyID0gbnVsbDsgLy9pZiBpIGRvbid0IGhhdmUgYSBtYXJrZXIgeWV0LCBzZXQgaXQgdG8gbnVsbFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwibm8gb25lIGlzIGxvZ2dlZCBpblwiKTtcblx0XHRcdH1cblx0XHRcdGNvbnNvbGUubG9nKCdpbSBzdGlsbCBsb2dnZWQgaW4hJywgJHNjb3BlLm1lKTtcblx0XHR9KTtcblx0fSk7XG5cblxuXHQvKioqKioqKioqKioqKioqKlxuXHRHQU1FIFNUQVJUIFBMQVlFUiBBQ1RJT05TXG5cdCoqKioqKioqKioqKioqKiovXG5cblx0JHNjb3BlLnBpY2tNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIG1hcmtlcikge1xuXHRcdCRzY29wZS5tZS5tYXJrZXIgPSBtYXJrZXI7IC8vbXkgbWFya2VyIGlzIHRoaXMgbWFya2VyXG5cblx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuXHRcdFx0XHQvL2ZpbmQgbXkgaW5kZXggaW4gdGhlIHBsYXllcnMgYXJyYXlcblx0XHRcdFx0dmFyIG1lSWR4O1xuXHRcdFx0XHRwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcblx0XHRcdFx0XHRpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly9naXZlIG1lIGEgbWFya2VyIGFuZCBzYXZlIG1lIGluIGZpcmViYXNlXG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubWFya2VyID0gbWFya2VyO1xuXHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXHRcdFx0fSk7XG5cblxuXHRcdHZhciBpZHggPSAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzLmluZGV4T2YobWFya2VyKTsgLy9maW5kIHRoZSBhdmFpbGFibGUgbWFya2VyIGluIGZpcmViYXNlXG5cdFx0bWFya2Vyc0FyclswXS5zcGxpY2UoaWR4LCAxKTsgLy90YWtlIGl0IG91dFxuXG5cdFx0bWFya2Vyc0Fyci4kc2F2ZSgwKSAvL3NhdmUgaXRcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBwaWNrZWQgbWFya2VyXCIpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZWYua2V5KTtcblx0XHRcdH0pO1xuXHR9O1xuXG5cblx0Ly9UT0RPOiBsaW1pdCBzdGFydCBwb2ludHNcblxuXHQvL0hhdmUgcGxheWVyIHBpY2sgdGhlaXIgc3RhcnQgcG9pbnRcblx0JHNjb3BlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBwb2ludCkge1xuXHRcdC8vcGxhY2UgbXkgbWFya2VyXG5cdFx0cGxheWVyLnBsYWNlTWFya2VyKGJvYXJkLCBwb2ludCwgJHNjb3BlLm1lKTtcblx0XHQkc2NvcGUubWUudGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWFsKDMpOyAvL2RlYWwgbWUgdGhyZWUgY2FyZHNcblx0XHRjb25zb2xlLmxvZygkc2NvcGUubWUpO1xuXG5cdFx0Ly93aGVuIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFyZSBsb2FkZWQuLi4uXG5cdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblx0XHRcdFx0Ly9maW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG5cdFx0XHRcdHZhciBtZUlkeDtcblx0XHRcdFx0cGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG5cdFx0XHRcdFx0aWYgKGUudWlkID09PSAkc2NvcGUubWUudWlkKSBtZUlkeCA9IGk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0gPSAkc2NvcGUubWU7IC8vc2V0IGZpcmViYXNlIG1lIHRvIGxvY2FsIG1lXG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7IC8vc2F2ZSBpdC5cblx0XHRcdH0pO1xuXHR9O1xuXG5cblxuXG5cblxuXG5cblx0Ly9Gb3Igc3luY2hyb25pemluZ0dhbWUuLi5cblx0Ly8gdmFyIHN5bmNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuXHQvLyBzeW5jUmVmLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uIChjaGlsZFNuYXBzaG90LCBwcmV2Q2hpbGRLZXkpIHtcblx0Ly8gXHQvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuXHQvLyBcdGNvbnNvbGUubG9nKCdjaGlsZFNuYXBzaG90X1N5bmNHYW1lJywgY2hpbGRTbmFwc2hvdCk7XG5cdC8vIFx0Ly9kZXBlbmRpbmcgb24gd2hhdCBjaGlsZFNuYXBzaG90IGdpdmVzIG1lLi4uSSB0aGluayBpdCdzIG9uZSBjaGlsZCBwZXIgb24gY2FsbD8gSXQgZG9lc24ndCByZXR1cm4gYW4gYXJyYXkgb2YgY2hhbmdlcy4uLkkgYmVsaWV2ZSFcblx0Ly8gXHRpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcblx0Ly8gXHRcdCRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG5cdC8vIFx0fSBlbHNlIHtcblx0Ly8gXHRcdCRzY29wZS5wbGFjZVRpbGUoY2hpbGRTbmFwc2hvdC50aWxlKTtcblx0Ly8gXHR9XG5cdC8vIH0pO1xuXG5cdC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG5cdC8vICRzY29wZS5nYW1lLm1vdmVzO1xuXG5cdC8vIFRPRE86IGhvdyBkbyB3ZSBzaG93IHRoZSB0aWxlcyBmb3IgcGxheWVyP1xuXG5cdC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cblx0Ly8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lXG5cdCRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ2V0Q3VycmVudFBsYXllcigpO1xuXG5cdC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG5cdCRzY29wZS5kcmFnb247XG5cdHZhciBhd2FpdGluZ0RyYWdvbkhvbGRlcnMgPSBbXTtcblxuXHQkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly9cblx0fTtcblxuXHQkc2NvcGUubXlUdXJuID0gZnVuY3Rpb24gKCkge1xuXHRcdCRzY29wZS5tZSA9PT0gJHNjb3BlLmN1cnJlbnRQbGF5ZXI7XG5cdH07XG5cblx0Ly90aGVzZSBhcmUgdGllZCB0byBhbmd1bGFyIG5nLWNsaWNrIGJ1dHRvbnNcblx0JHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG5cdFx0Y29uc29sZS5sb2coXCJyb3RhdGUgdG8gcmlnaHRcIik7XG5cdFx0dGlsZS5yb3RhdGlvbisrO1xuXHRcdGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcblx0fTtcblxuXHQkc2NvcGUucm90YXRlVGlsZUNjdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG5cdFx0dGlsZS5yb3RhdGlvbi0tO1xuXHRcdGlmICh0aWxlLnJvdGF0aW9uID09PSAtNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG5cdH07XG5cblx0Ly8gQ01UOiB1c2UgcGxheWVyJ3MgYW5kIGdhbWUncyBwcm90b3R5cGUgZnVuY3Rpb24gdG8gcGxhY2UgdGlsZSBhbmQgdGhlbiBtb3ZlIGFsbCBwbGF5ZXJzXG5cdCRzY29wZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuXHRcdC8vIFRPRE86IHNlbmQgdGhpcyBzdGF0ZSB0byBmaXJlYmFzZSBldmVyeSB0aW1lIGl0J3MgY2FsbGVkXG5cdFx0aWYgKHRpbGUucm90YXRpb24gPiAwKSB7XG5cdFx0XHR0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcblx0XHRcdFx0Y29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gKyAyO1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gOSkgY29ubmVjdGlvbiA9IDE7XG5cdFx0XHRcdGlmIChjb25uZWN0aW9uID09PSA4KSBjb25uZWN0aW9uID0gMDtcblx0XHRcdFx0cmV0dXJuIGNvbm5lY3Rpb247XG5cdFx0XHR9KTtcblx0XHRcdHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcblx0XHRcdHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcblx0XHR9IGVsc2UgaWYgKHRpbGUucm90YXRpb24gPCAwKSB7XG5cdFx0XHR0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcblx0XHRcdFx0Y29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gLSAyO1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gLTIpIGNvbm5lY3Rpb24gPSA2O1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gLTEpIGNvbm5lY3Rpb24gPSA3O1xuXHRcdFx0XHRyZXR1cm4gY29ubmVjdGlvbjtcblx0XHRcdH0pO1xuXHRcdFx0dGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG5cdFx0XHR0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcblx0XHR9XG5cblx0XHR2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblx0XHRcdFx0dmFyIG1lSWR4O1xuXHRcdFx0XHRwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcblx0XHRcdFx0XHRpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cGxheWVyLnBsYWNlVGlsZSh0aWxlLCBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdKTtcblxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRpbGUucGF0aHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9yc1swXSA9PT0gXCJuXCIpIHtcblx0XHRcdFx0XHRcdGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnMuc3BsaWNlKDAsIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2goZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW3RpbGUucGF0aHNbaV1dKTtcblx0XHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5wb2ludCA9IGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZVBvaW50c0luZGV4XTtcblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcblx0XHRcdH0pO1xuXG5cblx0XHQvLyBDTVQ6IHRoaXMgc2hvdWxkIHNlbmQgdGhlIHJvdGF0ZWQgdGlsZSB0byBmaXJlYmFzZVxuXHRcdG1vdmVzQXJyLiRhZGQoe1xuXHRcdFx0J3R5cGUnOiAncGxhY2VUaWxlJyxcblx0XHRcdCd0aWxlJzogdGlsZSxcblx0XHRcdCdwbGF5ZXJVaWQnOiAkc2NvcGUubWUudWlkXG5cdFx0fSk7XG5cblxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwicFwiLCBwLnBvaW50KTtcblxuXHRcdFx0XHRcdC8vIGxldCBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcblx0XHRcdFx0XHQvLyB2YXIgcElkeCA9IHBsYXllcnMuaW5kZXhPZihwKVxuXG5cdFx0XHRcdFx0Ly8gd2hpbGUgKG1vdmFibGUpIHtcblx0XHRcdFx0XHQvLyAgICAgLy8gbXkgcG9pbnQgaXMgZ29pbmcgdG8gYmUgY3VycmVudCBwb2ludCdzIG5laWdoYm9yc1xuXHRcdFx0XHRcdC8vICAgICBwLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG5cdFx0XHRcdFx0Ly8gICAgIHAucG9pbnQgPSBwLm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG4pIHtcblx0XHRcdFx0XHQvLyAgICAgICAgIHJldHVybiAhbi50cmF2ZWxsZWQgJiYgbmVpZ2hib3IgIT09IFwiblwiO1xuXHRcdFx0XHRcdC8vICAgICB9KVswXVxuXHRcdFx0XHRcdC8vICAgICBjb25zb2xlLmxvZyhwLnBvaW50LCBcImdhbWUganMgcCBwb2ludFwiKVxuXHRcdFx0XHRcdC8vICAgICB2YXIgcG9pbnRJZHg7XG5cdFx0XHRcdFx0Ly8gICAgIHAubmV4dFNwYWNlLnBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludCwgaWR4KSB7XG5cdFx0XHRcdFx0Ly8gICAgICAgICBpZiAoSlNPTi50b1N0cmluZyhwb2ludCkgPT09IEpTT04udG9TdHJpbmcocC5wb2ludCkpIHtcblx0XHRcdFx0XHQvLyAgICAgICAgICAgICBwb2ludElkeCA9IGlkeDtcblx0XHRcdFx0XHQvLyAgICAgICAgIH1cblx0XHRcdFx0XHQvLyAgICAgfSlcblx0XHRcdFx0XHQvLyAgICAgcC5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHBvaW50SWR4O1xuXHRcdFx0XHRcdC8vXG5cdFx0XHRcdFx0Ly8gICAgIGxldCBvbGRTcGFjZSA9IHAubmV4dFNwYWNlO1xuXHRcdFx0XHRcdC8vICAgICBsZXQgbmV3U3BhY2UgPSBwbGF5ZXIubmV3U3BhY2UoJHNjb3BlLmdhbWUuYm9hcmQsIG9sZFNwYWNlLCBwKTtcblx0XHRcdFx0XHQvLyAgICAgcC5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUocElkeClcblx0XHRcdFx0XHQvLyAgICAgICAgIC8vIHBsYXllci5jaGVja0RlYXRoKHApO1xuXHRcdFx0XHRcdC8vICAgICBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vIH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXG5cdFx0Ly8gaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG5cdFx0Ly8gICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cblx0XHQvLyAgICAgJHNjb3BlLndpbm5lciA9ICRzY29wZS5nYW1lLmdldENhblBsYXkoKVswXTtcblx0XHQvLyAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcblx0XHQvLyB9IGVsc2Uge1xuXHRcdC8vICAgICAvLyBJZiBkZWNrIGlzIGVtcHR5ICYgbm8gb25lIGlzIGRyYWdvbiwgc2V0IG1lIGFzIGRyYWdvblxuXHRcdC8vICAgICBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgISRzY29wZS5kcmFnb24pIHtcblx0XHQvLyAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG5cdFx0Ly8gICAgIH0gZWxzZSBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmRyYWdvbikge1xuXHRcdC8vICAgICAgICAgYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnB1c2goJHNjb3BlLm1lKTtcblx0XHQvLyAgICAgfSBlbHNlIHtcblx0XHQvLyAgICAgICAgIC8vIENNVDogZHJhdyBvbmUgdGlsZSBhbmQgcHVzaCBpdCB0byB0aGUgcGxheWVyLnRpbGVzIGFycmF5XG5cdFx0Ly8gICAgICAgICAkc2NvcGUubWUudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuXHRcdC8vICAgICAgICAgLy9pZiBkZWFkIHBsYXllcnMsIHRoZW4gcHVzaCB0aGVpciBjYXJkcyBiYWNrIHRvIHRoZSBkZWNrICYgcmVzaHVmZmxlXG5cdFx0Ly8gICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5sZW5ndGgpIHtcblx0XHQvLyAgICAgICAgICAgICAvL3dpdGggbmV3IGNhcmRzICYgbmVlZCB0byByZXNodWZmbGVcblx0XHQvLyAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGRlYWRQbGF5ZXJUaWxlcykge1xuXHRcdC8vICAgICAgICAgICAgICAgICBkZWFkUGxheWVyVGlsZXMuZm9yRWFjaChmdW5jdGlvbiAodGlsZSkge1xuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjay5wdXNoKHRpbGUpO1xuXHRcdC8vICAgICAgICAgICAgICAgICB9KTtcblx0XHQvLyAgICAgICAgICAgICB9KTtcblx0XHQvLyAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJHNjb3BlLmdhbWUuZGVjay5zaHVmZmxlKCk7XG5cdFx0Ly8gICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcblx0XHQvLyAgICAgICAgICAgICBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpLnB1c2goe1xuXHRcdC8vICAgICAgICAgICAgICAgICAndHlwZSc6ICd1cGRhdGVEZWNrJyxcblx0XHQvLyAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG5cdFx0Ly8gICAgICAgICAgICAgfSk7XG5cdFx0Ly8gICAgICAgICAgICAgaWYgKCRzY29wZS5kcmFnb24pIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG5cdFx0Ly8gICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSBudWxsO1xuXHRcdC8vICAgICAgICAgICAgICAgICAvL05FRUQgVE8gRElTQ1VTUzogTWlnaHQgbmVlZCB0byBtb2RpZnkgdGhpcyBpZiB3ZSB3YW50IHRvIHVzZSB1cCB0aGUgY2FyZHMgYW5kIGdpdmUgZWFjaCBhd2FpdGluZyBwbGF5ZXJzJyB1cCB0byAzIGNhcmRzXG5cdFx0Ly8gICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCAmJiAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcblx0XHQvLyAgICAgICAgICAgICAgICAgfTtcblx0XHQvLyAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpO1xuXHRcdC8vICAgICAgICAgICAgICAgICB9XG5cdFx0Ly8gICAgICAgICAgICAgfTtcblx0XHQvLyAgICAgICAgIH1cblx0XHQvL1xuXHRcdC8vICAgICB9XG5cdFx0Ly8gICAgICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG5cdFx0Ly8gfVxuXHR9O1xuXG5cdC8vIFRPRE86IGZpcmViYXNlIGdhbWUucGxheWVycyBzbGljZSAkc2NvcGUucGxheWVyIG91dFxuXHQkc2NvcGUubGVhdmVHYW1lO1xuXG5cdC8vIFRPRE86IG5lZWQgdG8gcmVtb3ZlIHRoaXMgZ2FtZSByb29tJ3MgbW92ZXMgZnJvbSBmaXJlYmFzZT9cblx0JHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdG1hcmtlcnNBcnIuJHJlbW92ZSgwKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlZikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInJlbW92ZWQgYWxsIG1hcmtlcnNcIiwgcmVmLmtleSk7XG5cdFx0XHR9KTtcblxuXHRcdGRlY2tBcnIuJHJlbW92ZSgwKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlZikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInJlbW92ZWQgdGhlIGRlY2tcIiwgcmVmLmtleSk7XG5cdFx0XHR9KTtcblxuXHRcdG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0dmFyIHRpbGVzID0gZGF0YS50aWxlcztcblx0XHRcdHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcblx0XHRcdHZhciBpbml0aWFsRGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuXHRcdFx0JGZpcmViYXNlQXJyYXkoaW5pdGlhbERlY2tSZWYpLiRhZGQoZGVjayk7XG5cdFx0fSk7XG5cblxuXG5cdFx0dmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcblx0XHQkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuXHRcdHZhciBwbGF5ZXJzID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cdFx0cGxheWVycy4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGRhdGFbaV0uY2FuUGxheSA9IHRydWU7XG5cdFx0XHRcdGRhdGFbaV0ubWFya2VyID0gJ24nO1xuXHRcdFx0XHRkYXRhW2ldLm5leHRTcGFjZSA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5uZXh0U3BhY2VQb2ludHNJbmRleCA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5wb2ludCA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS50aWxlcyA9ICduJztcblx0XHRcdFx0cGxheWVycy4kc2F2ZShpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGNvbnNvbGUubG9nKCRzY29wZS5tZSk7XG5cblx0fTtcblxuXG5cdCRzY29wZS5zdGFydHRvcCA9IFtcblx0XHRbMCwgMCwgMF0sXG5cdFx0WzAsIDAsIDFdLFxuXHRcdFsxLCAwLCAwXSxcblx0XHRbMSwgMCwgMV0sXG5cdFx0WzIsIDAsIDBdLFxuXHRcdFsyLCAwLCAxXSxcblx0XHRbMywgMCwgMF0sXG5cdFx0WzMsIDAsIDFdLFxuXHRcdFs0LCAwLCAwXSxcblx0XHRbNCwgMCwgMV0sXG5cdFx0WzUsIDAsIDBdLFxuXHRcdFs1LCAwLCAxXVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuXHRcdFswLCAwLCA3XSxcblx0XHRbMCwgMCwgNl0sXG5cdFx0WzAsIDEsIDddLFxuXHRcdFswLCAxLCA2XSxcblx0XHRbMCwgMiwgN10sXG5cdFx0WzAsIDIsIDZdLFxuXHRcdFswLCAzLCA3XSxcblx0XHRbMCwgMywgNl0sXG5cdFx0WzAsIDQsIDddLFxuXHRcdFswLCA0LCA2XSxcblx0XHRbMCwgNSwgN10sXG5cdFx0WzAsIDUsIDZdXG5cdF07XG5cdCRzY29wZS5zdGFydGJvdHRvbSA9IFtcblx0XHRbMCwgNSwgMF0sXG5cdFx0WzAsIDUsIDFdLFxuXHRcdFsxLCA1LCAwXSxcblx0XHRbMSwgNSwgMV0sXG5cdFx0WzIsIDUsIDBdLFxuXHRcdFsyLCA1LCAxXSxcblx0XHRbMywgNSwgMF0sXG5cdFx0WzMsIDUsIDFdLFxuXHRcdFs0LCA1LCAwXSxcblx0XHRbNCwgNSwgMV0sXG5cdFx0WzUsIDUsIDBdLFxuXHRcdFs1LCA1LCAxXVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRyaWdodCA9IFtcblx0XHRbNSwgMCwgMl0sXG5cdFx0WzUsIDAsIDNdLFxuXHRcdFs1LCAxLCAyXSxcblx0XHRbNSwgMSwgM10sXG5cdFx0WzUsIDIsIDJdLFxuXHRcdFs1LCAyLCAzXSxcblx0XHRbNSwgMywgMl0sXG5cdFx0WzUsIDMsIDNdLFxuXHRcdFs1LCA0LCAyXSxcblx0XHRbNSwgNCwgM10sXG5cdFx0WzUsIDUsIDJdLFxuXHRcdFs1LCA1LCAzXVxuXHRdO1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJHJvb3RTY29wZSkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhczpcIiwgYXV0aERhdGEpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGF1dGhEYXRhO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGlja0dhbWUnLCB7XG4gICAgICAgIHVybDogJy9waWNrZ2FtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvcGlja0dhbWUvcGlja0dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwaWNrR2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcigncGlja0dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG5cbiAgICAkc2NvcGUuY3JlYXRlR2FtZSA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgJGZpcmViYXNlQXJyYXkoZ2FtZU5hbWVSZWYpLiRhZGQoe1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcblxuICAgICAgICBmaXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHVzZXIudWlkKVxuICAgICAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpLiRhZGQobmV3UGxheWVyKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vIG9uZSBsb2dnZWQgaW5cIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBvYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0aWxlcyA9IGRhdGEudGlsZXNcbiAgICAgICAgICAgIHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcbiAgICAgICAgICAgIHZhciBkZWNrUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnZGVjaycpO1xuICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkoZGVja1JlZikuJGFkZChkZWNrKTtcbiAgICAgICAgfSlcblxuXG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdvVG9HYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lbGlzdCcpO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5QbGF5ZXIucHJvdG90eXBlLmhpID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhJXCIpXG4gICAgfVxuICAgIC8vIG5lZWQgdG8gdXNlIHNlbGYgYmVjdXNlIHdlIG5lZWQgdG8gY2hhbmdlICRzY29wZS5tZSBvbiBnYW1lQ3RybCBhbmQgc2VuZCB0byBmaXJlYmFzZVxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQsIHNlbGYpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgc2VsZi5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgc2VsZi5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICBzZWxmLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHNlbGYubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHNlbGYucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UsIHNlbGYpIHtcbiAgICBpZiAoc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmIChzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuLy8gbmVlZCB0byB1c2Ugc2VsZiBiZWN1c2Ugd2UgbmVlZCB0byBjaGFuZ2UgJHNjb3BlLm1lIG9uIGdhbWVDdHJsIGFuZCBzZW5kIHRvIGZpcmViYXNlXG5QbGF5ZXIucHJvdG90eXBlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBzZWxmKSB7XG4gICAgc2VsZi50aWxlcyA9IHNlbGYudGlsZXMuZmlsdGVyKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0LmlkICE9PSB0aWxlLmlkXG4gICAgfSk7XG5cbiAgICBzZWxmLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxufTtcblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAocG9pbnRlcikge1xuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQgJiYgbmVpZ2hib3IgIT09IFwiblwiO1xuICAgIH0pWzBdO1xuICAgIGNvbnNvbGUubG9nKFwibmV4dFBvaW50XCIsIG5leHRQb2ludClcbiAgICByZXR1cm4gbmV4dFBvaW50O1xufTtcblxuLy8gVE9ETzogbm90IHN1cmUgaG93IHRvIG1ha2UgdGhpcyBrZWVwIG1vdmluZyB3aXRoIHBsYXllcnMgaW5zdGVhZCBvZiBzZWxmXG4vLyBQbGF5ZXIucHJvdG90eXBlLmtlZXBNb3ZpbmcgPSBmdW5jdGlvbiAoc2VsZikge1xuLy8gICAgIGxldCBtb3ZhYmxlID0gc2VsZi5tb3ZlVG8oc2VsZi5wb2ludCk7XG4vLyAgICAgd2hpbGUgKG1vdmFibGUpIHtcbi8vICAgICAgICAgc2VsZi5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuLy8gICAgICAgICBzZWxmLnBvaW50ID0gc2VsZi5tb3ZlVG8oc2VsZi5wb2ludCk7XG4vLyAgICAgICAgIGxldCBvbGRTcGFjZSA9IHNlbGYubmV4dFNwYWNlO1xuLy8gICAgICAgICBsZXQgbmV3U3BhY2UgPSBuZXdTcGFjZShvbGRTcGFjZSk7XG4vLyAgICAgICAgIHNlbGYubmV4dFNwYWNlID0gbmV3U3BhY2U7XG4vLyAgICAgICAgIHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBzZWxmLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZihzZWxmLnBvaW50KTtcbi8vICAgICAgICAgc2VsZi5jaGVja0RlYXRoKCk7XG4vLyAgICAgICAgIG1vdmFibGUgPSBzZWxmLm1vdmVUbyhzZWxmLnBvaW50KTtcbi8vICAgICB9XG4vLyB9O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrRGVhdGggPSBmdW5jdGlvbiAoc2VsZikge1xuICAgIHZhciBhbGxUcmF2ZWxsZWQgPSBzZWxmLnBvaW50Lm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG5laWdoYm9yKSB7XG4gICAgICAgIHJldHVybiBuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSk7XG5cbiAgICBpZiAoc2VsZi5wb2ludC5lZGdlIHx8IGFsbFRyYXZlbGxlZC5sZW5ndGggPT09IDIpIHNlbGYuZGllKCk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmRpZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNhblBsYXkgPSBmYWxzZTtcbiAgICAvLyBUT0RPOiBuZWVkIHRvIHNlbmQgYW4gYWxlcnQgb3IgbWVzc2FnZSB0byB0aGUgcGxheWVyIHdobyBqdXN0IGRpZWQuXG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
