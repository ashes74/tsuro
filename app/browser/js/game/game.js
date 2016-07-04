tsuro.config(function($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray, $state, gameFactory, boardFactory) {

    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var gameArr = gameRef.child($stateParams.gameName);

    var deckRef = gameRef.child('deck');
    var deckArr = $firebaseArray(deckRef);

    var currPlayerRef = gameRef.child('currentPlayerIdx');
    var currPlayerArr = $firebaseArray(currPlayerRef);

    var playersRef = gameRef.child('players');
    var firebasePlayersArr = $firebaseArray(playersRef);

    var markersRef = gameRef.child('availableMarkers');
    var markersArr = $firebaseArray(markersRef);

    var spaceRef = gameRef.child('spaces');
    var spaceObj = $firebaseObject(spaceRef);

    var initialMarkersRef = gameRef.child('availableMarkers');

    var player = Object.create(Player.prototype);

    /****************
    INITIALIZING GAME
    ****************/

    //new local game with game name defined by url
    $scope.game = new Game($stateParams.gameName);

    $scope.spaces = _.flatten($scope.game.board);

    //when the deck is loaded...
    deckArr.$loaded().then(function(data) {

        $scope.game.deck = deckArr; //add the deck to the local game ?

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
        firebasePlayersArr.$loaded()
            .then(function(players) {
                if (user) {
                    var meIdx;
                    players.find(function(e, i) {
                        if (e.uid === user.uid) meIdx = i;
                    });
                    console.log($scope.game.players);
                    $scope.game.players = players;
                    $scope.me = $scope.game.players[meIdx];

                    $scope.me.myidx = meIdx;
                    if (!$scope.me.marker){
                        $scope.me.marker = null;
                    }
                    $scope.game.currentPlayer = $scope.game.players[0];
                    $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
                    console.log("IS IT MY TURN?", $scope.myTurn);
                }

            });
    });

    currPlayerRef.on('value', function(snap) {
        $scope.game.currentPlayerIdx = snap.val();
        console.log(snap.val());
        $scope.game.currentPlayer = $scope.game.players[$scope.game.currentPlayerIdx];
        console.log($scope.game.players);

        if ($scope.game.count < 35) {
            $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
            console.log("IS IT MY TURN?", $scope.myTurn);
        }
    });

    /****************
    AVAILABLE PLAYER ACTIONS AT GAME START
    ****************/

    $scope.pickMarker = function(marker) {
        pickMarkerFn($scope.game.board, marker);
    };

    function pickMarkerFn(board, marker) {
        $scope.me.marker = marker;
        firebasePlayersArr[$scope.me.myidx].marker = marker;
        firebasePlayersArr.$save($scope.me.myidx);

        var idx = $scope.game.availableMarkers.indexOf(marker);
        markersArr[0].splice(idx, 1);
        markersArr.$save(0)
            .then(function(ref) {
                console.log("removed the picked marker");
                console.log(ref.key);
            });
    }

    // once placed the marker, cannot place again
    $scope.clicked = false;

    $scope.placeMarker = function(point) {
        placeMarkerFn($scope.game.board, point);
    };

    //  Have player pick their start point
    var placeMarkerFn = function(board, point) {
        console.log("point in ctrl", point);
        player.placeMarker(board, point, $scope.me);

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
                console.log($scope.me);
                firebasePlayersArr.$save(meIdx); //save it.
            });
        return false;
    };

    /****************
    GAMEPLAY ACTIONS
    ****************/

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


    // TODO: need a function to assign dragon
    $scope.dragon;
    var awaitingDragonHolders = [];

    $scope.start = function() {
        //
    };

    // $scope.myTurn = function() {
    //     return $scope.me === $scope.currentPlayer;
    // };

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

    $scope.placeTile = function(tile) {
        var spacex = $scope.me.nextSpace.x;
        var spacey = $scope.me.nextSpace.y;

        var tileId = tile.id;
        var tileImg = tile.imageUrl;
        var rotation = tile.rotation;

        //do we need to save this to firebase?
        $scope.game.count--;
        placeTileOnSpace(spacex, spacey, tileId, tileImg, rotation);
    };

    var placeTileOnSpace = function(x, y, tileId, img, rotate) {
        var spaceId = 'space' + x + y;
        spaceObj[spaceId] = { 'tileId': tileId, 'img': img, 'rotation': rotate };
        spaceObj.$save();
    };

    spaceRef.on('child_added', function(snapshot) {
        var addedTile = snapshot.val();
        var spaceKey = snapshot.key;
        var x = +spaceKey.slice(-2, -1);
        var y = +spaceKey.slice(-1);

        var space = $scope.game.board[y][x]; //look space up in game.board
        console.log($scope.game.board);

        space.image = addedTile.img;
        space.rotation = addedTile.rotation;

        var tile = gameFactory.tiles[addedTile.tileId]; //look up tile by id

        var rotatedTile = gameFactory.rotateTile(tile); //rotate tile

        //make neighbor connections in game.board[y][x]
        for (var i = 0; i < rotatedTile.paths.length; i++) {
            if (!space.points[i].neighbors) space.points[i].neighbors = []; //if the point doesn't have neighbors... set to empty array
            space.points[i].neighbors.push(space.points[rotatedTile.paths[i]]); //set each point's neighbors to it's corresponding point           
        };

        console.log(firebasePlayersArr.length);
        console.log(currPlayerArr.length);
        console.log(currPlayerArr);

        var nextPlayerIdx = $scope.game.currentPlayerIdx + 1 >= firebasePlayersArr.length ? 0 : $scope.game.currentPlayerIdx + 1;
        gameRef.update({"currentPlayerIdx" :nextPlayerIdx});
    });

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
                console.log("removed the initialDeck", ref.key);
            })

        //JC: Clear out the spaces

        var deck = new Deck(tiles).shuffle().tiles;
        initialDeckArr.$add(deck);
        deckArr.$add(deck);

        currPlayerArr.$remove(0)
            .then(function() {
                currPlayerArr.$add([0])
            })

        $firebaseArray(initialMarkersRef).$add();

        firebasePlayersArr.$loaded().then(function(data) {
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

        $state.reload();
        console.log($scope.me);
    };

    $scope.starttop = boardFactory.starttop;
    $scope.startleft = boardFactory.startleft;
    $scope.startbottom = boardFactory.startbottom;
    $scope.startright = boardFactory.startright;
});

tsuro.directive('tile', function() {
    return {
        templateUrl: 'browser/js/game/tile.directive.html',
        scope: {
            'thisTile': '=',
            'tryTile': '&tryTile',
            'rotateccw': '&rotateccw',
            'rotatecw': '&rotatecw',
            'place': '&place',
            'myTurn': '&myTurn'
        }
    };
});