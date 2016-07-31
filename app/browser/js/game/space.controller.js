tsuro.controller('spaceCtrl', function($scope){

  $scope.playerOnThisSpace = function findPlayerOnThisSpace(){
    var players = $scope.game.players;
      for(var i = 0; i < players.length; i++){
          if(players[i].nextSpace.x === $scope.space.x && players[i].nextSpace.y === $scope.space.y){
            return players[i];
          }
      }
  };
});