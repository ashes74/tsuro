tsuro.config(function($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray, $state, gameFactory, $window) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var gameArr = gameRef.child($stateParams.gameName);

    var initialDeckRef = ref.child('games').child($stateParams.gameName).child('initialDeck');
    var initialDeckArr = $firebaseArray(initialDeckRef);

    var deckRef = gameRef.child('deck');
    var deckArr = $firebaseArray(deckRef);

    var currPlayerRef = gameRef.child('currentPlayerIndex');

    var playersRef = gameRef.child('players');
    var firebasePlayersArr = $firebaseArray(playersRef);
    var deadPlayersRef = gameRef.child('deadPlayers');

    var markersRef = gameRef.child('availableMarkers');
    var markersArr = $firebaseArray(markersRef);

    var spaceRef = ref.child('games').child($stateParams.gameName).child('spaces');
    var spaceObj = $firebaseObject(spaceRef);
    var spaceArr = $firebaseArray(spaceRef);


    /****************
    INITIALIZING GAME
    ****************/

    // new local game with game name defined by url
    $scope.game = new Game($stateParams.gameName);

    // Start with first player in the array, index 0
    $scope.game.currentPlayerIndex = 0;

    // when the deck is loaded, local deck is the firebase deck
    deckArr.$loaded().then(function() {
        $scope.game.deck.tiles = deckArr[0];
    });

    // don't start watching players until there is a deck in the game
    playersRef.on("value", function(snap) {
        // grab the value of the snapshot (all players in game in Firebase)
        var snapPlayers = snap.val();

        // for each player in this collection...
        for (var thisPlayer in snapPlayers) {
            var existingPlayerIndex, thisIsANewPlayer;

            // find this 'snap' player's index in local game. find returns that value.
            var localPlayer = $scope.game.players.find(function(plyr, plyrIdx) {
                existingPlayerIndex = plyrIdx;
                return plyr.uid === snapPlayers[thisPlayer].uid;
            });

            // if not found, create new player
            if (!localPlayer) {
                localPlayer = new Player(snapPlayers[thisPlayer].uid);
                thisIsANewPlayer = true;
            }

            // for each key in the snapPlayer's keys, add that key and value to local player
            for (var playerproperty in snapPlayers[thisPlayer]) {
                //if there is no 'me' (this is the beginning of the game) assign properties like normal
                if (!$scope.me) localPlayer[playerproperty] = snapPlayers[thisPlayer][playerproperty];
                //if there is a me and this snapplayer is me, don't update my tiles
                else if ($scope.me && snapPlayers[thisPlayer].uid !== $scope.me.uid && playerproperty !== 'tiles') localPlayer[playerproperty] = snapPlayers[thisPlayer][playerproperty];
            }

            //push local player to game.players
            if (thisIsANewPlayer) $scope.game.players.push(localPlayer);
            else $scope.game.players[existingPlayerIndex] = localPlayer;
        }
        // on login, find me in the $scope.game players array
        firebase.auth().onAuthStateChanged(function(user) {
            firebasePlayersArr.$loaded()
                .then(function(player) {
                    if (user) {
                        $scope.me = $scope.game.players.find((player) => player.uid === user.uid);
                        $scope.meIdx;
                        player.find((player, i) => {
                            if (player.uid === user.uid) $scope.meIdx = i;
                        });
                        $scope.me.marker = player[$scope.meIdx].marker;
                        $scope.me.x = player[$scope.meIdx].x;
                        $scope.me.y = player[$scope.meIdx].y;
                        $scope.me.i = player[$scope.meIdx].i;
                        $scope.game.currentPlayer = $scope.game.players[$scope.game.currentPlayerIndex];
                        $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
                    } else {
                        $state.go('login');
                    }
                });
        });
    });
    // when that markers array is loaded, update the available markers array on scope
    markersArr.$loaded().then(function(data) {
        $scope.game.availableMarkers = data[0];
    });
    //if someone else picks a marker, update available markers view
    markersRef.on('child_changed', function(data) {
        $scope.game.availableMarkers = data.val();
    });

    $scope.spaces = _.flatten($scope.game.board);

    //current player index has be updated in firebase and sending back changes to players boards
    currPlayerRef.on('value', function(snapshot) {
        $scope.game.currentPlayerIndex = snapshot.val();
        $scope.game.currentPlayer = $scope.game.players[$scope.game.currentPlayerIndex];
        if (spaceArr.length >= 1 && $scope.game.getCanPlay().length) {
            $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid && $scope.me.canPlay === true;
        }

    });
    //possible starting point options listed in arrays on the board 
    $scope.starttop = gameFactory.starttop;
    $scope.startleft = gameFactory.startleft;
    $scope.startbottom = gameFactory.startbottom;
    $scope.startright = gameFactory.startright;

    //for assigning the dragon (if the deck runs out of cards)
    $scope.dragon;
    $scope.dragonQueue = [];

    /****************
    AVAILABLE PLAYER ACTIONS AT GAME START
    ****************/
    $scope.pickMarker = function(marker) {
        pickMarkerFn(marker);
    };
    $scope.placeMarker = function(point) {
        placeMarkerFn(point);
    };

    /****************
    GAMEPLAY ACTIONS
    ****************/
    $scope.tryTile = function(tile) {
        if ($scope.game.board[$scope.me.y][$scope.me.x].image !== tile.imageUrl) {
            $scope.game.board[$scope.me.y][$scope.me.x].image = tile.imageUrl;
        }
        $scope.game.board[$scope.me.y][$scope.me.x].rotation = tile.rotation;
        $scope.chosenTile = tile;

        //This is to update the $scope.spaces in the html
        $scope.spaces = _.flatten($scope.game.board);
    };

    $scope.playersOnThisSpace = function(space) {
        var gamePlayers = $scope.game.players;
        var playersOnThisSpace = gamePlayers.filter(function(player) {
            if (player.x === space.x && player.y === space.y) return player;
        });

        if (playersOnThisSpace.length === 0) return null;
        return playersOnThisSpace;
    };

    $scope.playerOnThisStartingPoint = function(start) {
        var playerOnThisStart = $scope.game.players.find(function(player) {
            return player.x === start[0] && player.y === start[1] && player.i === start[2];
        });
        if (playerOnThisStart) return true;
        else return false;
    };

    $scope.playerIndex = function(player) {
        if (player) {
            switch (player.i) {
                case 0:
                    return "zero";
                case 1:
                    return "one";
                case 2:
                    return "two";
                case 3:
                    return "three";
                case 4:
                    return "four";
                case 5:
                    return "five";
                case 6:
                    return "six";
                case 7:
                    return "seven";
                default:
                    break;
            }
        }
    };

    $scope.markerColor = function(player) {
        if (player) return player.marker;
    };
    $scope.myTurn = function() {
        $scope.me === $scope.currentPlayer;
    };
    $scope.rotateTileCw = function(tile) { // these are tied to angular ng-click buttons
        tile.rotation++;
        if (tile.rotation === 4) tile.rotation = 0; //set rotation to be between 0 and 3
        $scope.tryTile(tile);
    };
    $scope.rotateTileCcw = function(tile) {
        tile.rotation--;
        if (tile.rotation === -4) tile.rotation = 0; //set rotation to be between -0 and -3
        if (tile.rotation < 0) tile.rotation += 4; //set it to be between +0 and +3
        $scope.tryTile(tile);
    };
    $scope.placeTile = function(tile) {
        if (!$scope.me.canPlay) return;
        var rotation = tile.rotation;
        var spacex = $scope.me.x;
        var spacey = $scope.me.y;
        var tileImg = tile.imageUrl;
        var tileId = tile.id;
        $scope.me.tiles = $scope.me.tiles.filter(t => t.id !== tile.id);
        firebasePlayersArr[$scope.meIdx].tiles = $scope.me.tiles;
        firebasePlayersArr.$save($scope.meIdx);
        placeTileOnSpace(spacex, spacey, tileImg, rotation, tileId);
    };

    var placeTileOnSpace = function(x, y, img, rotate, tileId) {
        var spaceId = 'space' + x + y;
        spaceObj[spaceId] = {
            'img': img,
            'rotation': rotate,
            'tileId': tileId
        };
        spaceObj.$save();
    };

    spaceRef.on('child_added', function(snapshot) {
        var addedTile = snapshot.val();
        var spaceKey = snapshot.key;
        var x = +spaceKey.slice(-2, -1);
        var y = +spaceKey.slice(-1);
        var space = $scope.game.board[y][x]; // look space up in game.board

        space.image = addedTile.img;
        space.rotation = addedTile.rotation;
        var tile = gameFactory.tiles[addedTile.tileId]; // look up tile by id
        var rotatedTile = gameFactory.rotateTile(tile, snapshot.val().rotation); // rotate tile

        for (var i = 0; i < rotatedTile.paths.length; i++) {
            // if the point doesn't have neighbors... set to empty array
            if (!space.points[i].neighbors) space.points[i].neighbors = [];

            // set each point's neighbors to it's corresponding point
            space.points[i].neighbors.push(space.points[rotatedTile.paths[i]]);
        }

        if (!$scope.me) {
            firebasePlayersArr.$loaded()
                .then(function(players) {
                    players.forEach(function(player) {
                        var playerCurrentPoint = $scope.game.board[player.y][player.x].points[player.i];
                        if (playerCurrentPoint.neighbors) {
                            var neighborSpace = {
                                y: +playerCurrentPoint.neighbors[0].spaceId.slice(5, -2),
                                x: +playerCurrentPoint.neighbors[0].spaceId.slice(6, -1),
                                i: +playerCurrentPoint.neighbors[0].spaceId.slice(-1),
                            };
                            $scope.game.board[neighborSpace.y][neighborSpace.x].points[neighborSpace.i].travelled = true;
                        }
                    });
                });
        }

        //each player is responsible of moving themselves along the board after each tile placement...this triggers the move
        if ($scope.me) {
            if ($scope.me.x === x && $scope.me.y === y) {
                $scope.me.move($scope.game.board);

                firebasePlayersArr[$scope.meIdx].x = $scope.me.x;
                firebasePlayersArr[$scope.meIdx].y = $scope.me.y;
                firebasePlayersArr[$scope.meIdx].i = $scope.me.i;
                firebasePlayersArr[$scope.meIdx].canPlay = $scope.me.canPlay;
                firebasePlayersArr.$save($scope.meIdx);

                //if "me" dies...
                if (!$scope.me.canPlay) {
                    $scope.myTurn = false;

                    //adding self to dead player array
                    $firebaseArray(gameRef.child('deadPlayers')).$add({
                            'name': $scope.me.name
                        })
                        .then(function() {
                            //if there isn't any cards in the local deck...
                            if (!$scope.game.deck.tiles) {
                                $scope.game.deck.tiles = [];
                                $scope.game.deck.reload($scope.me.tiles);
                                //updating this deck in firebase
                                deckArr.$add($scope.game.deck.tiles);
                            } else {
                                //if there is cards in the local deck...  
                                $scope.game.deck.reload($scope.me.tiles);
                                //Due to ghosts in the arrays b/c of removal of cards in the deck, we are going to remove the current deck and assigned it to a new deck with the reloaded cards
                                deckArr.$remove(0).then(function(ref) {
                                    deckArr.$add($scope.game.deck.tiles);
                                });
                            }
                            //update players' tiles to be empty in firebase
                            firebasePlayersArr[$scope.meIdx].tiles = $scope.me.tiles;
                            firebasePlayersArr.$save($scope.meIdx);
                        })
                        .then(function() { //Note: this only handles the winner/game over state if a player was ever set dead
                            // this might be better since we should wait for all the players declaring their play state so that we can proceed with determining if there is or isn't going ot be a winner
                            if ($scope.game.getCanPlay().length <= 1) {
                                $scope.winner = $scope.game.getCanPlay();
                                winningState();
                            }
                        });
                } else { // deal me a card if I dont have three cards
                    if ($scope.me.tiles.length < 3 && $scope.game.deck.tiles) {
                        let newTile = $scope.game.deal(1);
                        $scope.me.tiles = $scope.me.tiles.concat(newTile);
                        firebasePlayersArr[$scope.meIdx].tiles = $scope.me.tiles;
                        firebasePlayersArr.$save($scope.meIdx);
                        syncDeck();
                    }
                }
                gameRef.update({
                    "currentPlayerIndex": $scope.game.nextCanPlay()
                });
            }
        }

        // if a dead player is added and changes the deck...make sure all the players refresh their deck to the newly created deck (this resolves the ghosts in array issue)
        deckRef.on("child_added", function(snap) {
            deckArr.$loaded()
                .then(function(deck) {
                    $scope.game.deck.tiles = deck[0];
                });
        });

        //this handles the winner/game over state if a player has not been dead before and if the board is all covered with tiles
        if (spaceArr.length === 35 && $scope.game.getCanPlay().length > 0) {
            $scope.winner = $scope.game.getCanPlay();
            winningState();
        }

        if (!$scope.gameOver) {
            let firebaseDragonArr = $firebaseArray(gameRef.child('dragonQueue'));
            let dragonRef = gameRef.child('dragon');
            if (!$scope.game.deck.tiles && $scope.me.tiles.length < 3) {
                // this is necessary b/c we only want the players to push their uid into firebase and dragon queue if they aren't already in there
                $scope.dragonQueue.forEach(function(awaitingDragon) {
                    if (awaitingDragon.uid !== $scope.me.uid) {
                        $scope.dragonQueue.push($scope.me);
                        firebaseDragonArr.$add($scope.me.uid);
                    }
                })

                $scope.dragon = $scope.dragon || $scope.dragonQueue.shift();
                dragonRef.set({
                    'uid': $scope.me.uid
                });
            } else {
                // if deck and dragon deal to dragonQueue first until players have 3 tiles
                while ($scope.dragon && $scope.game.deck.tiles.length > 0) {
                    if ($scope.dragon.tiles.length < 3) {
                        $scope.dragon.tiles = $scope.dragon.tiles.concat($scope.game.deal(1));
                    }
                    $scope.dragon = $scope.dragonQueue.shift();
                };
            }
        }
    });

    $scope.leaveGame = function() {
        firebasePlayersArr.$remove(firebasePlayersArr[$scope.meIdx]);
        $state.go('pickGame');
    };

    var resetRef = gameRef.child('reset');
    resetRef.on('value', function(snapshot) {
        if (snapshot.val() === true) {
            gameRef.update({
                'reset': false
            });
            $window.location.reload();
        }
    });

    $scope.reset = function() {
        spaceObj.$remove();
        markersArr.$remove(0);
        markersArr.$add(gameFactory.markers);
        deckArr.$remove(0);

        var tiles = gameFactory.tiles;
        var deck = new Deck(tiles).shuffle().tiles;
        deckArr.$add(deck);
        gameRef.update({
            'currentPlayerIndex': 0,
            'reset': true
        });

        firebasePlayersArr.$loaded().then(function(data) {
            for (var i = 0; i < data.length; i++) {
                data[i].clicked = false;
                data[i].marker = null;
                data[i].i = null;
                data[i].x = null;
                data[i].y = null;
                data[i].canPlay = null;
                data[i].tiles = null;
                firebasePlayersArr.$save(i);
            }
        });
        $firebaseObject(gameRef.child('winners')).$remove();
        $firebaseObject(gameRef.child('deadPlayers')).$remove();
    };

    $scope.logout = function() {
        var auth = $firebaseAuth();
        auth.$signOut();

        // remove the player from firebase
        firebasePlayersArr.$remove(firebasePlayersArr[$scope.meIdx]);
        $state.go('login');

    };
    
    //broadcasting any players that dies on all boards
    gameRef.child('deadPlayers').on('value', function(losingPlayer) {
        $scope.losingPlayers = losingPlayer.val();
    });

    //broadcasting any players that wins on all boards
    gameRef.child('winners').on('value', function(winningPlayers) {
        $scope.winners = winningPlayers.val();
    });


    /****************
    HELPER FUNCTIONS
    ****************/
    function pickMarkerFn(marker) {
        $scope.me.marker = marker;

        firebasePlayersArr[$scope.meIdx].marker = marker;
        firebasePlayersArr.$save($scope.meIdx);

        var idx = $scope.game.availableMarkers.indexOf(marker);
        markersArr[0].splice(idx, 1);
        markersArr.$save(0)
            .then(function() {
                console.log("removed the picked marker");
            });
    }

    function placeMarkerFn(point) {
        $scope.me.placeMarker(point, $scope.game.board);
        $scope.me.tiles = $scope.game.deal(3);
        syncDeck();
        // Firebase does not allow us to set the firebasePlayersArr[$scope.meIdx] = $scope.me; [Possibility: firebasePlayersArr[$scope.meIdx] is an object]
        firebasePlayersArr[$scope.meIdx].tiles = $scope.me.tiles;
        firebasePlayersArr[$scope.meIdx].x = $scope.me.x;
        firebasePlayersArr[$scope.meIdx].y = $scope.me.y;
        firebasePlayersArr[$scope.meIdx].i = $scope.me.i;
        firebasePlayersArr[$scope.meIdx].canPlay = true;
        firebasePlayersArr.$save($scope.meIdx);
        return false;
    }

    function syncDeck() {
        deckArr[0] = $scope.game.deck.tiles;
        deckArr.$save(0);
    }

    function winningState() {
        if ($scope.winner) {
            $scope.winner.forEach(winner => $firebaseArray(gameRef.child('winners')).$add({
                'name': winner.name
            }));
        }
        $scope.gameOver = true;
        return "game over";
    }
});