tsuro.config(function($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray, $state, gameFactory) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var gameArr = gameRef.child($stateParams.gameName);

    var initialDeckRef = ref.child('games').child($stateParams.gameName).child('initialDeck');
    var initialDeckArr = $firebaseArray(initialDeckRef);

    var deckRef = gameRef.child('deck');
    var deckArr = $firebaseArray(deckRef);

    var playersRef = gameRef.child('players');
    var firebasePlayersArr = $firebaseArray(playersRef);

    var markersRef = gameRef.child('availableMarkers');
    var markersArr = $firebaseArray(markersRef);

    var movesRef = gameRef.child('moves');
    var movesArr = $firebaseArray(movesRef);

    var boardRef = gameRef.child('board');
    var boardArr = $firebaseArray(boardRef);

    var player = Object.create(Player.prototype);

    /****************
    INITIALIZING GAME
    ****************/

    //new local game with game name defined by url
    $scope.game = new Game($stateParams.gameName);

    //when the board is loaded...
    boardArr.$loaded().then(function(data) {
        if (!data.length) {
            boardArr.$add($scope.game.board);
        }
        $scope.game.board = boardArr[0];

        //watching board for changes
        boardRef.on('child_changed', function(snap) {
            //NEED TO RETURN TO CHECK BOARD
            console.log(snap);
            $scope.game.board = snap.val();
        });
    });

    $scope.spaces = _.flatten($scope.game.board);

    //when the deck is loaded...
    deckArr.$loaded().then(function(data) {

        $scope.game.deck = deckArr; //add the deck to the local game ? Try this as firebase DeckArr????

        //don't start watching players until there is a deck in the game
        playersRef.on("value", function(snap) {
            var snapPlayers = snap.val(); //grab the value of the snapshot (all players in game in Firebase)

            //for each player in this collection...
            for (var thisPlayer in snapPlayers) {
                var existingPlayerIndex, thisIsANewPlayer;

                //find this 'snap' player's index in local game. find returns that value.
                var localPlayer = $scope.game.players.find(function(plyr, plyrIdx) {
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
                if (thisIsANewPlayer) $scope.game.players.push(localPlayer);
                else $scope.game.players[existingPlayerIndex] = localPlayer;
            }
        });

    });



    //when that markers array is loaded, update the available markers array on scope
    markersArr.$loaded().then(function(data) {
        $scope.game.availableMarkers = data[0];
    });

    //if someone else picks a marker, update your view
    markersRef.on('child_changed', function(data) {
        $scope.game.availableMarkers = data.val();
    });

    //on login, find me in the firebase players array
    firebase.auth().onAuthStateChanged(function(user) {
        firebasePlayersArr.$loaded().then(function(players) {

            if (user) {
                var meIdx;
                players.find(function(e, i) {
                    if (e.uid === user.uid) meIdx = i;
                });

                $scope.me = players[meIdx];
                $scope.game.currPlayer = meIdx;


                if ($scope.me.marker === "n") $scope.me.marker = null;

            } else {
                // No user is signed in.
                console.log("no one is logged in");
            }
            console.log('im here!!!!!!!!')
        });
    });


    /****************
    AVAILABLE PLAYER ACTIONS AT GAME START
    ****************/

    $scope.pickMarker = function(marker) {
        boardArr.$loaded().then(function(data) {
            pickMarkerFn(data, marker);
        });
    }

    function pickMarkerFn(board, marker) {
        $scope.me.marker = marker;

        firebasePlayersArr.$loaded()
            .then(function(players) {
                var meIdx;
                //find my index in the players array
                players.find(function(e, i) {
                    if (e.$id === $scope.me.$id) meIdx = i;
                });
                //give me a marker and save me in firebase
                firebasePlayersArr[meIdx].marker = marker;
                firebasePlayersArr.$save(meIdx);
            });

        var idx = $scope.game.availableMarkers.indexOf(marker);

        markersArr[0].splice(idx, 1);

        markersArr.$save(0)
            .then(function(ref) {
                console.log("removed the picked marker");
                console.log(ref.key);
            });
    };



    // once placed the marker, cannot place again
    $scope.clicked = false


    $scope.placeMarker = function(point) {
        boardArr.$loaded().then(function(data) {
            placeMarkerFn(data, point);
        });
    };

    //  Have player pick their start point
    var placeMarkerFn = function(data, point) {
        console.log("point in ctrl", point)
        player.placeMarker(data[0], point, $scope.me);

        // deal me three cards
        $scope.me.tiles = $scope.game.deal(3);
        $scope.clicked = true;

        // when the firebase players are loaded....
        firebasePlayersArr.$loaded()
            .then(function(players) {
                //find me in the firebase players array
                var meIdx;
                players.find(function(e, i) {
                    if (e.uid === $scope.me.uid) meIdx = i;
                });

                firebasePlayersArr[meIdx] = $scope.me; //set firebase me to local me

                firebasePlayersArr.$save(meIdx); //save it.
            });
        return false;
    };




    /****************
    GAMEPLAY ACTIONS
    ****************/
    $scope.tryTile = function(tile) {
        console.log('trying tile');
        console.log("board in try tile", $scope.me.nextSpace.y, $scope.me.nextSpace.x)

        $scope.game.board[$scope.me.nextSpace.y][$scope.me.nextSpace.x].image = tile.imageUrl;
        $scope.game.board[$scope.me.nextSpace.y][$scope.me.nextSpace.x].rotation = tile.rotation;
        console.log("paths", tile.paths);

        // CMT: need this line here in order to update the $scope.spaces for the html
        $scope.spaces = _.flatten($scope.game.board);
    };




    // TODO: we probably need this on firebase so other people can't pick what's been picked

    //For synchronizingGame...
    // var syncRef = gameRef.child('moves');
    // syncRef.on('child_added', function (childSnapshot, prevChildKey) {
    //  //NEED TO DOUBLE CHECK!! What does childSnap returns?
    //  console.log('childSnapshot_SyncGame', childSnapshot);
    //  //depending on what childSnapshot gives me...I think it's one child per on call? It doesn't return an array of changes...I believe!
    //  if (childSnapshot.type === 'updateDeck') {
    //      $scope.game.deck = childSnapshot.updateDeck;
    //  } else {
    //      $scope.placeTile(childSnapshot.tile);
    //  }
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

    $scope.start = function() {
        //
    };

    $scope.myTurn = function() {
        $scope.me === $scope.currentPlayer;
    };

    //these are tied to angular ng-click buttons
    $scope.rotateTileCw = function(tile) {
        tile.rotation++;
        if (tile.rotation === 4) tile.rotation = 0;
        console.log("rotate cw", tile);
    };

    $scope.rotateTileCcw = function(tile) {
        tile.rotation--;
        if (tile.rotation === -4) tile.rotation = 0;
        console.log('rotate ccw', tile);
    };

    // CMT: use player's and game's prototype function to place tile and then move all players
    $scope.placeTile = function(tile) {
        //this is the board load
        boardArr.$loaded()
            .then(function() {
                return firebasePlayersArr.$loaded()
            })
            .then(function(players) {
                var key = boardArr.$keyAt(0);
                var meIdx;
                players.find(function(e, i) {
                    if (e.$id === $scope.me.$id) meIdx = i;
                });

                firebasePlayersArr[meIdx].tiles = firebasePlayersArr[meIdx].tiles.filter(function(t) {
                    return t.id !== tile.id
                });

                var playerY = firebasePlayersArr[meIdx].nextSpace.y;
                var playerX = firebasePlayersArr[meIdx].nextSpace.x;

                //Storing the tile on a space on the board
                var spaceRef = boardRef.child(key).child(playerY).child(playerX);
                var spaceArr = $firebaseArray(spaceRef);
                spaceArr.$add(tile);

                //Storing the points on board based on tile placed
                var pointsRef = spaceRef.child("points");
                var pointsArr = $firebaseArray(pointsRef);

                var promiseForEachPointNeighborsUpdate = function(idx) {
                    var neighborRef = pointsRef.child(idx).child('neighbors');
                    var neighborArr = $firebaseArray(neighborRef);
                    neighborArr.$add(pointsArr[tile.paths[idx]]);
                };
                var allPromises = pointsArr.map(function(point, idx) {
                    promiseForEachPointNeighborsUpdate(idx);
                });

                Promise.all(allPromises).then(function(data) {

                    firebasePlayersArr.$loaded().then(function() {
                        var player = firebasePlayersArr[meIdx];
                        player.point = boardArr[0][player.nextSpace.y][player.nextSpace.x].points[player.nextSpacePointsIndex];
                        firebasePlayersArr.$save(meIdx);
                        return firebasePlayersArr[meIdx];
                    }).then(function(FBme) {
                        $scope.me = FBme;
                    }).then(function() {
                        console.log("my next space", $scope.me.nextSpace);
                        console.log("scope game board", $scope.game.board);
                        $scope.game.board[$scope.me.nextSpace.y][$scope.me.nextSpace.x].image = tile.imageUrl;
                        $scope.game.board[$scope.me.nextSpace.y][$scope.me.nextSpace.x].rotation = tile.rotation;

                        $scope.spaces = _.flatten($scope.game.board);
                        tile = gameFactory.rotateTile(tile);
                    }).then(function() {
                        // console.log("now change all players")
                        // firebasePlayersArr.forEach(function(p) {
                        //     console.log("point before change", p.point)
                        //     p.point.travelled = true;
                        //     console.log(p.point);
                        //     let movable = player.moveTo(p.point);

                        //     console.log(movable);

                        //     console.log("1st movable", movable)
                        //     var pIdx = players.indexOf(p)

                        //     while (movable) {
                        //         console.log("movable", movable)
                        //         p.point.travelled = true;
                        //         p.point = movable;

                        //         if (p.point.travelled === true) {
                        //             p.canPlay = false;
                        //             break;
                        //         }

                        //         // Check the space that's not my current nextSpace
                        //         var newNextSpaceInfo = p.point.spaces.filter(function(space) {
                        //             return space.x !== p.nextSpace.x || space.y !== p.nextSpace.y
                        //         })[0]

                        //         console.log("newNextSpaceInfo", newNextSpaceInfo);

                        //         let oldSpace = p.nextSpace;
                        //         let newSpace = $scope.game.board[newNextSpaceInfo.y][newNextSpaceInfo.x];
                        //         p.nextSpace = newSpace;
                        //         console.log(p.nextSpacePointsIndex);
                        //         p.nextSpacePointsIndex = newNextSpaceInfo.i;
                        //         firebasePlayersArr.$save(pIdx);
                        //         // TODO: need more players to check if it works
                        //         //player.checkDeath(p);

                        //         movable = player.moveTo(p.point);
                        //         console.log("movable at the end", movable)
                        //     }
                        //     console.log("end moving")
                        // });
                    });
                });
            });

        // if ($scope.game.checkOver()) {
        //     // TODO: need to tell the player she won
        //     $scope.winner = $scope.game.getCanPlay()[0];
        //     $scope.gameOver = true;
        //     console.log("game over")
        //         // TODO: disable everything, let the players decide wether reset the game or not
        // } else {
        if ($scope.game.deadPlayers().length) {
            //with new cards & need to reshuffle

            // because the deadPlayers() returns a 2D array, use reduce to flatten it
            var deadPlayerTiles = $scope.game.deadPlayers().reduce(function(a, b) {
                return a = a.concat(b)
            })

            $scope.game.deck = $scope.game.deck.concat(deadPlayerTiles);
            $scope.game.deck = $scope.game.deck.shuffle();

            //send firebase a new move
            movesArr.$add({
                'type': 'updateDeck',
                'updateDeck': $scope.game.deck
            });
        }

        // If deck is empty & no one is dragon, set me as dragon
        if ($scope.game.deck.length === 0 && !$scope.dragon) {
            $scope.dragon = $scope.me;
            console.log("set dragon to me")
        } else if ($scope.game.deck.length === 0 && $scope.dragon) {
            awaitingDragonHolders.push($scope.me);
            console.log("I'm waiting for to be a dragon")
        } else {
            console.log("give me a tile")
            firebasePlayersArr.$loaded()
                .then(function(players) {
                    //find me in the firebase players array
                    var meIdx;
                    players.find(function(e, i) {
                        if (e.uid === $scope.me.uid) meIdx = i;
                    });

                    //set firebase me to local me
                    firebasePlayersArr[meIdx].tiles = $scope.me.tiles.concat($scope.game.deal(1));
                    console.log("dealed one tile to me!");

                    //save it
                    firebasePlayersArr.$save(meIdx);

                    $scope.me = firebasePlayersArr[meIdx];
                });

            while ($scope.dragon && $scope.game.deck.length) {
                $scope.dragon.tiles.push($scope.game.deal(1));
                firebasePlayersArr.$loaded()
                    .then(function(players) {
                        //find me in the firebase players array
                        var meIdx;
                        players.find(function(e, i) {
                            if (e.uid === $scope.dragon.uid) meIdx = i;
                        });

                        //set firebase me to local me
                        firebasePlayersArr[meIdx] = $scope.dragon;

                        //save it
                        firebasePlayersArr.$save(meIdx);
                    });

                $scope.dragon = $scope.awaitingDragonHolders.shift() || null;
            }
        }

        // TODO: still need to work on this
        // $scope.currentPlayer = $scope.game.goToNextPlayer();
        // console.log("new curr player", $scope.currentPlayer)
        // }
    }


    $scope.leaveGame = function() {
        console.log("i'm out");

        firebasePlayersArr.$loaded()
            .then(function(players) {
                //find me in the firebase players array
                var meIdx;

                players.find(function(e, i) {
                    if (e.uid === $scope.me.uid) meIdx = i;
                });

                // remove the player from firebase
                firebasePlayersArr.$remove(firebasePlayersArr[meIdx]);
            });

        $state.go('pickGame');
    };

    // TODO: need to remove this game room's moves from firebase?
    $scope.reset = function() {
        markersArr.$remove(0)
            .then(function(ref) {
                console.log("removed all markers", ref.key);
            });

        deckArr.$remove(0)
            .then(function(ref) {
                console.log("removed the deck", ref.key);
            });

        initialDeckArr.$remove(0)
            .then(function(ref) {
                console.log("reomved the initialDeck", ref.key)
            })

        movesArr.$loaded()
            .then(function(moves) {
                for (var i = 0; i < moves.length; i++) {
                    movesArr.$remove(i);
                }
            })
            .then(function() {
                console.log("removed all moves")
            })


        var tiles = [{
            id: 1,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_01.png?alt=media&token=dc2e553b-f4da-442e-97e8-d0d808c2d5c0",
            paths: [5, 6, 4, 7, 2, 0, 1, 3],
            rotation: 0
        }, {
            id: 2,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_02.png?alt=media&token=bbb0b596-74ea-49a8-9f6c-b42627ccd873",
            paths: [1, 0, 4, 7, 2, 6, 5, 3],
            rotation: 0
        }, {
            id: 3,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_03.png?alt=media&token=4dd1ff85-0204-4895-8957-3b7073559117",
            paths: [1, 0, 4, 6, 2, 7, 3, 5],
            rotation: 0
        }, {
            id: 4,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_04.png?alt=media&token=90dd2de8-9c99-4cb7-86ff-7863b0a5641c",
            paths: [2, 5, 0, 7, 6, 1, 4, 3],
            rotation: 0
        }, {
            id: 5,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_05.png?alt=media&token=5912a47b-854a-46d0-bfeb-005913d24158",
            paths: [4, 2, 1, 6, 0, 7, 3, 5],
            rotation: 0
        }, {
            id: 6,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_06.png?alt=media&token=056b8938-6e1f-481e-9d34-b6b27f2cd9e3",
            paths: [1, 0, 5, 7, 6, 2, 4, 3],
            rotation: 0
        }, {
            id: 7,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_07.png?alt=media&token=b5ddbaf6-f061-4206-9f9b-92bc863bb484",
            paths: [2, 4, 0, 6, 1, 7, 3, 5],
            rotation: 0
        }, {
            id: 8,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_08.png?alt=media&token=8ad6340e-f8a5-4ff2-bdaf-0a85e2bbc630",
            paths: [4, 7, 5, 6, 0, 2, 3, 1],
            rotation: 0
        }, {
            id: 9,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_09.png?alt=media&token=6a1a62b8-1872-460d-9276-5b48f3a38a39",
            paths: [1, 0, 7, 6, 5, 4, 3, 2],
            rotation: 0
        }, {
            id: 10,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_10.png?alt=media&token=63e8a214-3aef-4da6-8827-133db9b9b4ef",
            paths: [4, 5, 6, 7, 0, 1, 2, 3],
            rotation: 0
        }, {
            id: 11,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_11.png?alt=media&token=57869682-5c4d-4f80-832b-ebc46080a4c5",
            paths: [7, 2, 1, 4, 3, 6, 5, 0],
            rotation: 0
        }, {
            id: 12,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_12.png?alt=media&token=e505f22b-9d52-49d1-9b71-4dcdce56853f",
            paths: [2, 7, 0, 5, 6, 3, 4, 1],
            rotation: 0
        }, {
            id: 13,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_13.png?alt=media&token=f0ac4eb9-7b81-4dfb-b0cb-aecc0290ae3b",
            paths: [5, 4, 7, 6, 1, 0, 3, 2],
            rotation: 0
        }, {
            id: 14,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_14.png?alt=media&token=7ff24e77-6737-412b-bacd-414bf4f643c9",
            paths: [3, 2, 1, 0, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 15,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_15.png?alt=media&token=a1ad7c0c-8e6d-4474-9fde-0b47d04104c1",
            paths: [1, 0, 7, 4, 3, 6, 5, 2],
            rotation: 0
        }, {
            id: 16,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_16.png?alt=media&token=e33b3cd9-9207-4cb8-969b-5ce60f91537f",
            paths: [1, 0, 5, 6, 7, 2, 3, 4],
            rotation: 0
        }, {
            id: 17,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_17.png?alt=media&token=200d6cab-df31-49b8-ba95-ad52d7c79e8b",
            paths: [3, 5, 6, 0, 7, 1, 2, 4],
            rotation: 0
        }, {
            id: 18,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_18.png?alt=media&token=1c7bf515-9941-47cd-9ecb-479d66f2612b",
            paths: [2, 7, 0, 4, 3, 6, 5, 1],
            rotation: 0
        }, {
            id: 19,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_19.png?alt=media&token=f5cc625c-73c0-49f7-932c-0e65d31d2bf7",
            paths: [4, 3, 6, 1, 0, 7, 2, 5],
            rotation: 0
        }, {
            id: 20,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_20.png?alt=media&token=5b9b4455-2c09-41e4-a2f2-f60bedc470ad",
            paths: [3, 7, 4, 0, 2, 6, 5, 1],
            rotation: 0
        }, {
            id: 21,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_21.png?alt=media&token=6d5646d7-b1b1-49c9-bf87-00be9e7b8e2c",
            paths: [2, 3, 0, 1, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 22,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_22.png?alt=media&token=5a587359-831c-4dcd-a9c5-e7085c5a3079",
            paths: [2, 6, 0, 5, 7, 3, 1, 4],
            rotation: 0
        }, {
            id: 23,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_23.png?alt=media&token=4cb9750b-0f50-429d-9367-170b0855c6c4",
            paths: [1, 0, 6, 4, 3, 7, 2, 5],
            rotation: 0
        }, {
            id: 24,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_24.png?alt=media&token=a80b7f5b-c572-4430-ab8a-3d3656e4c643",
            paths: [5, 6, 7, 4, 3, 0, 1, 2],
            rotation: 0
        }, {
            id: 25,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_25.png?alt=media&token=9b8e853d-962b-4d32-b679-622e8ae7be6a",
            paths: [1, 0, 3, 2, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 26,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_26.png?alt=media&token=d84cb7d3-4bd5-4a17-8b7a-6df857975c45",
            paths: [1, 0, 6, 7, 5, 4, 2, 3],
            rotation: 0
        }, {
            id: 27,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_27.png?alt=media&token=d0eaf631-8a0e-4aa9-8dd2-778e9be1fec6",
            paths: [2, 4, 0, 7, 1, 6, 5, 3],
            rotation: 0
        }, {
            id: 28,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_28.png?alt=media&token=ee42cc11-19d2-4476-887b-7a29817430fc",
            paths: [4, 2, 1, 7, 0, 6, 5, 3],
            rotation: 0
        }, {
            id: 29,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_29.png?alt=media&token=a60766a5-5e0c-49ad-9240-20b1d539fa2f",
            paths: [1, 0, 3, 2, 5, 4, 7, 6],
            rotation: 0
        }, {
            id: 30,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_30.png?alt=media&token=dea26808-d49d-43b0-b81c-174c1e098c1e",
            paths: [2, 3, 0, 1, 6, 7, 4, 5],
            rotation: 0
        }, {
            id: 31,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_31.png?alt=media&token=4cb9edd7-95ab-4e2f-aeda-d251f7015a0d",
            paths: [3, 6, 5, 0, 7, 2, 1, 4],
            rotation: 0
        }, {
            id: 32,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_32.png?alt=media&token=4f19788f-ad85-4e6f-82ac-7fef4c8f0419",
            paths: [1, 0, 6, 5, 7, 3, 2, 4],
            rotation: 0
        }, {
            id: 33,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_33.png?alt=media&token=0914028d-ea25-4613-82f6-eab574e69f70",
            paths: [1, 0, 3, 2, 6, 7, 4, 5],
            rotation: 0
        }, {
            id: 34,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_34.png?alt=media&token=3714e87a-942e-436e-ae5b-bc0a23de33d1",
            paths: [4, 5, 7, 6, 0, 1, 3, 2],
            rotation: 0
        }, {
            id: 35,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_35.png?alt=media&token=aa9dda97-edee-472a-8b24-8bb0b69dfa9a",
            paths: [1, 0, 7, 5, 6, 3, 4, 2],
            rotation: 0
        }]

        var deck = new Deck(tiles).shuffle().tiles;
        initialDeckArr.$add(deck);
        deckArr.$add(deck);




        var initialMarkersRef = ref.child('games').child($stateParams.gameName).child('availableMarkers');
        $firebaseArray(initialMarkersRef).$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);


        var players = $firebaseArray(playersRef);
        players.$loaded().then(function(data) {
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

        $state.reload()
        console.log($scope.me);

    };


    $scope.starttop = [
        [0, 0, 0],
        [0, 0, 1],
        [1, 0, 0],
        [1, 0, 1],
        [2, 0, 0],
        [2, 0, 1],
        [3, 0, 0],
        [3, 0, 1],
        [4, 0, 0],
        [4, 0, 1],
        [5, 0, 0],
        [5, 0, 1]
    ];
    $scope.startleft = [
        [0, 0, 7],
        [0, 0, 6],
        [0, 1, 7],
        [0, 1, 6],
        [0, 2, 7],
        [0, 2, 6],
        [0, 3, 7],
        [0, 3, 6],
        [0, 4, 7],
        [0, 4, 6],
        [0, 5, 7],
        [0, 5, 6]
    ];
    $scope.startbottom = [
        [0, 5, 5],
        [0, 5, 4],
        [1, 5, 5],
        [1, 5, 4],
        [2, 5, 5],
        [2, 5, 4],
        [3, 5, 5],
        [3, 5, 4],
        [4, 5, 5],
        [4, 5, 4],
        [5, 5, 5],
        [5, 5, 4]
    ];
    $scope.startright = [
        [5, 0, 2],
        [5, 0, 3],
        [5, 1, 2],
        [5, 1, 3],
        [5, 2, 2],
        [5, 2, 3],
        [5, 3, 2],
        [5, 3, 3],
        [5, 4, 2],
        [5, 4, 3],
        [5, 5, 2],
        [5, 5, 3]
    ];
});

tsuro.directive('tile', function() {
    return {
        templateUrl: 'browser/js/game/tile.directive.html',
        scope: {
            thisTile: '=',
            'tryTile': '&tryTile',
            'rotateccw': '&rotateccw',
            'rotatecw': '&rotatecw',
            'place': '&place'
        },
        link: function(s, e, a) {
            // e.on('click', function(event){
            //     s.tryTile(s.thisTile);
            //     // console.log('clicked me!', s.thisTile);
            // });
        }
    };
});