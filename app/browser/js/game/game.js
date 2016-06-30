tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray) {
    $scope.tile = {
        id: 2,
        imageUrl: "",
        paths: [1, 0, 4, 7, 2, 6, 5, 3],
        rotation: 0
    };

    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var movesRef = gameRef.child('moves');
    var movesArr = $firebaseArray(movesRef);
    var deckRef = gameRef.child('initialDeck');
    var playersRef = gameRef.child('players');
    var markersRef = gameRef.child('availableMarkers');
    var deckArr = $firebaseArray(deckRef);

    var player = Object.create(Player.prototype);

    // intialize game
    $scope.game = new Game($stateParams.gameName, $stateParams.deck);
    $scope.game.deck = $firebaseObject(deckRef);

    var markersArr = $firebaseArray(markersRef);
    markersArr.$loaded().then(function (data) {
        $scope.game.availableMarkers = data[0];
        $scope.game.availableMarkers = $scope.game.availableMarkers.filter(function (elem) {
            return typeof elem === "string";
        });
    });

    markersRef.on('child_changed', function (data) {
        $scope.game.availableMarkers = data.val();
    });

    firebase.auth().onAuthStateChanged(function (user) {
        var firebasePlayersArr = $firebaseArray(playersRef);

        firebasePlayersArr.$loaded().then(function (data) {
            var FBplayers = data;

            if (user) {
                var userAuthId = user.uid;
                var me = FBplayers.filter(player => player.uid === userAuthId)[0];
                if (me) {
                    $scope.me = me;
                }
                if ($scope.me.marker === "n") $scope.me.marker = null;
            } else {
                // No user is signed in.
                console.log("nothing");
            }
        });
    });

    $scope.pickMarker = function (board, marker) {
        $scope.me.marker = marker;
        var firebasePlayersArr = $firebaseArray(playersRef);

        firebasePlayersArr.$loaded()
            .then(function (players) {
                var meIdx;

                players.find(function (e, i) {
                    if (e.$id === $scope.me.$id) meIdx = i;
                });

                firebasePlayersArr[meIdx].marker = marker;
                firebasePlayersArr.$save(meIdx);
            });

        var idx = $scope.game.availableMarkers.indexOf(marker);

        $scope.game.availableMarkers.splice(idx, 1);
        markersArr[0].splice(idx, 1);

        markersArr.$save(0)
            .then(function (ref) {
                console.log("removed the picked marker");
                console.log(ref.key);
            });
    };

    //Have player pick their start point

    $scope.placeMarker = function (board, point) {
        var firebasePlayersArr = $firebaseArray(playersRef);

        firebasePlayersArr.$loaded()
            .then(function (players) {
                var meIdx;

                players.find(function (e, i) {
                    if (e.$id === $scope.me.$id) meIdx = i;
                });

                firebasePlayersArr[meIdx].tiles = [{
                    id: 1,
                    imageUrl: "",
                    paths: [3, 4, 6, 0, 1, 7, 2, 5],
                    rotation: 0
                }, {
                    id: 2,
                    imageUrl: "",
                    paths: [1, 0, 4, 7, 2, 6, 5, 3],
                    rotation: 0
                }, {
                    id: 3,
                    imageUrl: "",
                    paths: [1, 0, 4, 6, 2, 7, 3, 5],
                    rotation: 0
                }]

                player.placeMarker(board, point, firebasePlayersArr[meIdx]);

                $scope.game.players.push(firebasePlayersArr[meIdx]);

                firebasePlayersArr.$save(meIdx);
                console.log("place marker firebae me", firebasePlayersArr[meIdx])
            });

    };

    //take all players on firebase and turn them into local player
    playersRef.on("child_added", function (player) {
        var newPlayer = new Player(player.uid);
        newPlayer.marker = player.marker;

        var x = player.startingPosition[0];
        var y = player.startingPosition[1];
        var pointsIndex = player.startingPosition[2];

        newPlayer.point = board[y][x].points[pointsIndex];
        newPlayer.nextSpace = board[y][x];
        newPlayer.nextSpacePointsIndex = player.startingPosition[2];

        newPlayer.tiles = $scope.game.deck.dealThree();

        $scope.game.players.push(newPlayer);
    });







    // TODO: we probably need this on firebase so other people can't pick what's been picked

    //For synchronizingGame...
    var syncRef = gameRef.child('moves');
    syncRef.on('child_added', function (childSnapshot, prevChildKey) {
        //NEED TO DOUBLE CHECK!! What does childSnap returns?
        console.log('childSnapshot_SyncGame', childSnapshot);
        //depending on what childSnapshot gives me...I think it's one child per on call? It doesn't return an array of changes...I believe!
        if (childSnapshot.type === 'updateDeck') {
            $scope.game.deck = childSnapshot.updateDeck;
        } else {
            $scope.placeTile(childSnapshot.tile);
        }
    });

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
        console.log("rotate to right")
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
        firebasePlayersArr.$loaded()
            .then(function (players) {
                var meIdx;
                players.find(function (e, i) {
                    if (e.$id === $scope.me.$id) meIdx = i;
                });

                player.placeTile(tile, firebasePlayersArr[meIdx], firebasePlayersArr, meIdx);

                for (var i = 0; i < tile.paths.length; i++) {
                    if (firebasePlayersArr[meIdx].nextSpace.points[i].neighbors[0] === "n") {
                        firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.splice(0, 1)
                    }
                    firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.push(firebasePlayersArr[meIdx].nextSpace.points[tile.paths[i]]);
                    firebasePlayersArr.$save(meIdx);
                }

                firebasePlayersArr[meIdx].point = firebasePlayersArr[meIdx].nextSpace.points[firebasePlayersArr[meIdx].nextSpacePointsIndex];
                firebasePlayersArr.$save(meIdx);
            })


        // CMT: this should send the rotated tile to firebase
        movesArr.$add({
            'type': 'placeTile',
            'tile': tile,
            'playerUid': $scope.me.uid
        });


        firebasePlayersArr.$loaded()
            .then(function (players) {
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
                })
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
        markersArr.$remove(0)
            .then(function (ref) {
                console.log("removed all markers", ref.key)
            });

        deckArr.$remove(0)
            .then(function (ref) {
                console.log("removed the deck", ref.key)
            });

        obj.$loaded().then(function (data) {
            var tiles = data.tiles
            var deck = new Deck(tiles).shuffle().tiles;
            var initialDeckRef = ref.child('games').child($stateParams.gameName).child('initialDeck');
            $firebaseArray(initialDeckRef).$add(deck);
        })



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
        })

        console.log($scope.me)

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
        [0, 5, 0],
        [0, 5, 1],
        [1, 5, 0],
        [1, 5, 1],
        [2, 5, 0],
        [2, 5, 1],
        [3, 5, 0],
        [3, 5, 1],
        [4, 5, 0],
        [4, 5, 1],
        [5, 5, 0],
        [5, 5, 1]
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
