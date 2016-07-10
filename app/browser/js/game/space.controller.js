tsuro.controller('spaceCtrl', function($scope){

  $scope.playerOnThisSpace = function findPlayerOnThisSpace(){
    var players = $scope.game.players;
    console.log(players);
      for(var i = 0; i < players.length; i++){
        console.log('test', players[i].nextSpace.x, players[i].nextSpace.x);
        console.log($scope.space.x, $scope.space.y);
          if(players[i].nextSpace.x === $scope.space.x && players[i].nextSpace.y === $scope.space.y){
            return players[i];
          }
      }
  };
});