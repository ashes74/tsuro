var tsuro = angular.module('Tsuro', ['ui.router']);

tsuro.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});
tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game',
        templateUrl: '/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function($scope){
	$scope.spaces = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36];

	$scope.starttop = [[0,0,0],[0,0,1],[1,0,0],[1,0,1],[2,0,0],[2,0,1],[3,0,0],[3,0,1],[4,0,0],[4,0,1],[5,0,0],[5,0,1]];
	$scope.startleft = [[0,0,7],[0,0,6],[0,1,7],[0,1,6],[0,2,7],[0,2,6],[0,3,7],[0,3,6],[0,4,7],[0,4,6],[0,5,7],[0,5,6]];
	$scope.startbottom = [[0,5,0],[0,5,1],[1,5,0],[1,5,1],[2,5,0],[2,5,1],[3,5,0],[3,5,1],[4,5,0],[4,5,1],[5,5,0],[5,5,1]];
	$scope.startright = [[5,0,2],[5,0,3],[5,1,2],[5,1,3],[5,2,2],[5,2,3],[5,3,2],[5,3,3],[5,4,2],[5,4,3],[5,5,2],[5,5,3]];

});

var spaces = new Array(36);
tsuro.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/js/home/home.html'
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvZ2FtZS5qcyIsImhvbWUvaG9tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlciddKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTsiLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG4gICAgICAgIHVybDogJy9nYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUpe1xuXHQkc2NvcGUuc3BhY2VzID0gWzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyLDMzLDM0LDM1LDM2XTtcblxuXHQkc2NvcGUuc3RhcnR0b3AgPSBbWzAsMCwwXSxbMCwwLDFdLFsxLDAsMF0sWzEsMCwxXSxbMiwwLDBdLFsyLDAsMV0sWzMsMCwwXSxbMywwLDFdLFs0LDAsMF0sWzQsMCwxXSxbNSwwLDBdLFs1LDAsMV1dO1xuXHQkc2NvcGUuc3RhcnRsZWZ0ID0gW1swLDAsN10sWzAsMCw2XSxbMCwxLDddLFswLDEsNl0sWzAsMiw3XSxbMCwyLDZdLFswLDMsN10sWzAsMyw2XSxbMCw0LDddLFswLDQsNl0sWzAsNSw3XSxbMCw1LDZdXTtcblx0JHNjb3BlLnN0YXJ0Ym90dG9tID0gW1swLDUsMF0sWzAsNSwxXSxbMSw1LDBdLFsxLDUsMV0sWzIsNSwwXSxbMiw1LDFdLFszLDUsMF0sWzMsNSwxXSxbNCw1LDBdLFs0LDUsMV0sWzUsNSwwXSxbNSw1LDFdXTtcblx0JHNjb3BlLnN0YXJ0cmlnaHQgPSBbWzUsMCwyXSxbNSwwLDNdLFs1LDEsMl0sWzUsMSwzXSxbNSwyLDJdLFs1LDIsM10sWzUsMywyXSxbNSwzLDNdLFs1LDQsMl0sWzUsNCwzXSxbNSw1LDJdLFs1LDUsM11dO1xuXG59KTtcblxudmFyIHNwYWNlcyA9IG5ldyBBcnJheSgzNik7IiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvaG9tZS9ob21lLmh0bWwnXG4gICAgfSk7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
