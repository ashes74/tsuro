var tsuro = angular.module('Tsuro', ['ui.router', 'firebase']);

tsuro.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    // $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});

tsuro.constant('fb',{
	url: "https://path-of-the-dragon.firebaseio.com"
});
tsuro.config(function ($stateProvider) {
	$stateProvider.state('game', {
		// url: '/game/:gameName/',
		url: '/game',
		templateUrl: '/js/game/game.html',
		controller: 'gameCtrl',
		// resolve: {
		// 	game: function($stateParams){
		// 		//lookup in firebase by $stateParams.gameName
		// 	},
		// 	player: function(){
		// 		//get player object for logged in user
		// 	}
		// }
	});
});

tsuro.controller('gameCtrl', function ($scope) {
	$scope.spaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

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

	$scope.availableMarkers = ["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"];
	$scope.markerPicked = false;
	
	$scope.pickMarker = function (marker) {
		$scope.markerPicked = true;
		$scope.availableMarkers = $scope.availableMarkers.filter(function (m) {
			return m !== marker;
		});
	};
});

var spaces = new Array(36);

tsuro.config(function ($stateProvider) {
	$stateProvider.state('gamelist', {
		url: '/gamelist',
		templateUrl: '/js/gamelist/gamelist.html',
		controller: 'gameList',
		resolve: {
			allGames: function () {
				//lookup gamelist with players included
			}
		}
	});
});

tsuro.controller('gameList', function($scope){ //inject game factory here!!! 
	$scope.gamelist = [{name:'best game ever', players:'kimber, lori'},{name:'this game is awesome', players:'taffy, jennifer, biru'}];

	// $scope.joinRoom = function(){
	// 	//add player to game
	// 	//state.go to that game url
	// };
});
tsuro.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/js/home/home.html'
    });
});
tsuro.config(function ($stateProvider) {
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: '/js/login/login.html',
    controller: 'loginCtrl'
  });
});

tsuro.controller("loginCtrl", function ($scope, $firebaseAuth) {
 // var ref = firebase.database().ref();
 //  // var ref = new Firebase(fb.url);
  var auth = $firebaseAuth();

  $scope.logInWithGoogle = function(){
    auth.$signInWithPopup("google").then(function(authData) {
      console.log("Logged in as:", authData);
    }).catch(function(error) {
      console.error("Authentication failed:", error);
    });
  };


});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwiaG9tZS9ob21lLmpzIiwibG9naW4vbG9naW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgLy8gJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG50c3Vyby5jb25zdGFudCgnZmInLHtcblx0dXJsOiBcImh0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tXCJcbn0pOyIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG5cdFx0Ly8gdXJsOiAnL2dhbWUvOmdhbWVOYW1lLycsXG5cdFx0dXJsOiAnL2dhbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnL2pzL2dhbWUvZ2FtZS5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnZ2FtZUN0cmwnLFxuXHRcdC8vIHJlc29sdmU6IHtcblx0XHQvLyBcdGdhbWU6IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcyl7XG5cdFx0Ly8gXHRcdC8vbG9va3VwIGluIGZpcmViYXNlIGJ5ICRzdGF0ZVBhcmFtcy5nYW1lTmFtZVxuXHRcdC8vIFx0fSxcblx0XHQvLyBcdHBsYXllcjogZnVuY3Rpb24oKXtcblx0XHQvLyBcdFx0Ly9nZXQgcGxheWVyIG9iamVjdCBmb3IgbG9nZ2VkIGluIHVzZXJcblx0XHQvLyBcdH1cblx0XHQvLyB9XG5cdH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuXHQkc2NvcGUuc3BhY2VzID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxNywgMTgsIDE5LCAyMCwgMjEsIDIyLCAyMywgMjQsIDI1LCAyNiwgMjcsIDI4LCAyOSwgMzAsIDMxLCAzMiwgMzMsIDM0LCAzNSwgMzZdO1xuXG5cdCRzY29wZS5zdGFydHRvcCA9IFtcblx0XHRbMCwgMCwgMF0sXG5cdFx0WzAsIDAsIDFdLFxuXHRcdFsxLCAwLCAwXSxcblx0XHRbMSwgMCwgMV0sXG5cdFx0WzIsIDAsIDBdLFxuXHRcdFsyLCAwLCAxXSxcblx0XHRbMywgMCwgMF0sXG5cdFx0WzMsIDAsIDFdLFxuXHRcdFs0LCAwLCAwXSxcblx0XHRbNCwgMCwgMV0sXG5cdFx0WzUsIDAsIDBdLFxuXHRcdFs1LCAwLCAxXVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuXHRcdFswLCAwLCA3XSxcblx0XHRbMCwgMCwgNl0sXG5cdFx0WzAsIDEsIDddLFxuXHRcdFswLCAxLCA2XSxcblx0XHRbMCwgMiwgN10sXG5cdFx0WzAsIDIsIDZdLFxuXHRcdFswLCAzLCA3XSxcblx0XHRbMCwgMywgNl0sXG5cdFx0WzAsIDQsIDddLFxuXHRcdFswLCA0LCA2XSxcblx0XHRbMCwgNSwgN10sXG5cdFx0WzAsIDUsIDZdXG5cdF07XG5cdCRzY29wZS5zdGFydGJvdHRvbSA9IFtcblx0XHRbMCwgNSwgMF0sXG5cdFx0WzAsIDUsIDFdLFxuXHRcdFsxLCA1LCAwXSxcblx0XHRbMSwgNSwgMV0sXG5cdFx0WzIsIDUsIDBdLFxuXHRcdFsyLCA1LCAxXSxcblx0XHRbMywgNSwgMF0sXG5cdFx0WzMsIDUsIDFdLFxuXHRcdFs0LCA1LCAwXSxcblx0XHRbNCwgNSwgMV0sXG5cdFx0WzUsIDUsIDBdLFxuXHRcdFs1LCA1LCAxXVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRyaWdodCA9IFtcblx0XHRbNSwgMCwgMl0sXG5cdFx0WzUsIDAsIDNdLFxuXHRcdFs1LCAxLCAyXSxcblx0XHRbNSwgMSwgM10sXG5cdFx0WzUsIDIsIDJdLFxuXHRcdFs1LCAyLCAzXSxcblx0XHRbNSwgMywgMl0sXG5cdFx0WzUsIDMsIDNdLFxuXHRcdFs1LCA0LCAyXSxcblx0XHRbNSwgNCwgM10sXG5cdFx0WzUsIDUsIDJdLFxuXHRcdFs1LCA1LCAzXVxuXHRdO1xuXG5cdCRzY29wZS5hdmFpbGFibGVNYXJrZXJzID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl07XG5cdCRzY29wZS5tYXJrZXJQaWNrZWQgPSBmYWxzZTtcblx0XG5cdCRzY29wZS5waWNrTWFya2VyID0gZnVuY3Rpb24gKG1hcmtlcikge1xuXHRcdCRzY29wZS5tYXJrZXJQaWNrZWQgPSB0cnVlO1xuXHRcdCRzY29wZS5hdmFpbGFibGVNYXJrZXJzID0gJHNjb3BlLmF2YWlsYWJsZU1hcmtlcnMuZmlsdGVyKGZ1bmN0aW9uIChtKSB7XG5cdFx0XHRyZXR1cm4gbSAhPT0gbWFya2VyO1xuXHRcdH0pO1xuXHR9O1xufSk7XG5cbnZhciBzcGFjZXMgPSBuZXcgQXJyYXkoMzYpO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZWxpc3QnLCB7XG5cdFx0dXJsOiAnL2dhbWVsaXN0Jyxcblx0XHR0ZW1wbGF0ZVVybDogJy9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnZ2FtZUxpc3QnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGFsbEdhbWVzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vbG9va3VwIGdhbWVsaXN0IHdpdGggcGxheWVycyBpbmNsdWRlZFxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUxpc3QnLCBmdW5jdGlvbigkc2NvcGUpeyAvL2luamVjdCBnYW1lIGZhY3RvcnkgaGVyZSEhISBcblx0JHNjb3BlLmdhbWVsaXN0ID0gW3tuYW1lOidiZXN0IGdhbWUgZXZlcicsIHBsYXllcnM6J2tpbWJlciwgbG9yaSd9LHtuYW1lOid0aGlzIGdhbWUgaXMgYXdlc29tZScsIHBsYXllcnM6J3RhZmZ5LCBqZW5uaWZlciwgYmlydSd9XTtcblxuXHQvLyAkc2NvcGUuam9pblJvb20gPSBmdW5jdGlvbigpe1xuXHQvLyBcdC8vYWRkIHBsYXllciB0byBnYW1lXG5cdC8vIFx0Ly9zdGF0ZS5nbyB0byB0aGF0IGdhbWUgdXJsXG5cdC8vIH07XG59KTsiLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9ob21lL2hvbWUuaHRtbCdcbiAgICB9KTtcbn0pOyIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgIHVybDogJy9sb2dpbicsXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcbiAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcihcImxvZ2luQ3RybFwiLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoKSB7XG4gLy8gdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gLy8gIC8vIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoZmIudXJsKTtcbiAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uKCl7XG4gICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24oYXV0aERhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIGluIGFzOlwiLCBhdXRoRGF0YSk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICB9KTtcbiAgfTtcblxuXG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
