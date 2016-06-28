tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function ($scope,$firebaseAuth,firebaseUrl, $stateParams, $firebaseObject) {

    var auth = $firebaseAuth();
    var firebaseUser = $scope.authObj.$getAuth();
    var gameRef = firebaseUrl + 'games/' + $stateParams.gameName;
    var deckRef = new Firebase(gameRef + '/initialDeck');
    var playersRef = new Firebase(gameRef + '/players');

    //intialize game
    $scope.game = new Game($stateParams.gameName);
    $scope.game.deck = $firebaseObject(deckRef);
    var board = $scope.game.board;

    //take all players on firebase and turn them into local player
    playersRef.on("child_added", function(player){
        var newPlayer = new Player(player.uid);
        newPlayer.marker = player.marker;

        var x = player.startingPosition[0];
        var y = player.startingPosition[1];
        var pointsIndex = player.startingPosition[2];

        newPlayer.point = board[y][x].points[pointsIndex];
        newplayer.nextSpace = board[y][x];
        newPlayer.nextSpacePointsIndex = player.startingPosition[2];

        newPlayer.tiles = $scope.game.deck.dealThree();

        $scope.game.players.push(newPlayer);
    });

    //get 'me'
    $scope.me = $scope.game.players.filter(function(player){
        return player.uid === firebaseUser.uid;
    })[0];


    //Have player pick the marker
    $scope.pickMarker = function (board, marker) {
        $scope.player.marker = marker;
    };

    //Have player pick their start point
    $scope.placeMarker = function (board, point) {
        $scope.player.placeMarker(point);
        $scope.game.players.push($scope.player);

        gameRef.child('players').child(player.uid).push({ 'marker': player.marker, 'startingPosition': player.startingPosition });
    };


    ////GAME MOVE LOOP/UPDATE    
    //if something is added to moves
    //watcher for added children
    //ref.on child added



    //For synchronizingGame...
    // var synchRef = new Firebase(gameRef + '/moves');
    // var synchronizedObj = $firebaseObject(synchRef);
    // //This returns a promise... you can .then() and assign value to $scope.variable
    // synchronizedObj
    // .$bindTo($scope, game.moves); //do we need this?


    // TODO: how to re-do the moves?
    // $scope.game.moves;




    // TODO: how do we show the tiles for player?

    // TODO: how to show the rotated tile?

    // CMT: assuming we use new Game() for each game
    $scope.currentPlayer = $scope.game.getCurrentPlayer();

    // CMT: assuming we use new Game() for each game, holds all the players still on the board.
    $scope.turnOrderArray = $scope.game.getCanPlay();

    // TODO: need this info for firebase, already shuffled tiles. Is it from new Game() ?
    $scope.deck;

    // QUESTION: do we need master to be stored in firebase?
    // TODO: get who's the master
    $scope.master;

    // TODO: need a function to assign dragon
    $scope.dragon;

    // TODO: we probably need this on firebase so other people can't pick what's been picked
    $scope.availableMarkers;


    // CMT: assuming we are using new Game() for $scope.game
    $scope.start = function () {
        // TODO: add game init state with shuffled deck

        // TODO: need to add to firebase (?)
        $scope.game.turnOrderArray.forEach(function (player) {
            player.tiles = $scope.game.deck.dealThree();
        })
    };

    $scope.myTurn = function () {
        $scope.player === $scope.currentPlayer;
    };

    $scope.rotateTileCw = function (tile) {
        var addTwo = tile.map(function (connection) {
            return connection + 2;
        });
        addTwo.unshift(addTwo.pop());
        addTwo.unshift(addTwo.pop());
        return Player.placeTile(addTwo);
    };

    $scope.rotateTileCcw = function (tile) {
        var minusTwo = tile.map(function (connection) {
            return connection - 2;
        });
        minusTwo.push(minusTwo.shift());
        minusTwo.push(minusTwo.shift());
        return Player.placeTile(minusTwo);
    };

    // CMT: assuming we use new Game()
    // CMT: use player's and game's prototype function to place tile and then move all players
    $scope.placeTile = function (tile) {
        // TODO: send this state to firebase every time it's called


        $scope.player.placeTile(tile);
        $scope.game.moveAllplayers();

        if ($scope.game.checkOver()) {
            // TODO: need to tell the player she won
            $scope.winner = $scope.game.checkOver().winner;

            // TODO: make a gameOver function on Game contructor
            $scope.gameOver();

        } else {
            // CMT: draw one tile and push it to the player.tiles array
            $scope.player.tiles.push($scope.game.deck.deal(1))

            $scope.game.goToNextPlayer();
        }
    };

    // TODO: firebase game.players slice $scope.player out
    $scope.leaveGame;

    // TODO: do we remove this game room's moves from firebase?
    $scope.reset = $scope.game.reset;


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


       