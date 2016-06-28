'use strict';
var expect = require('chai').expect;
var Player = require('../player.js');
var Marker = require('../marker.js');


describe('Player class', function() {

    var player;

    beforeEach(function() {
        player = new Player('Jen');
    });

    it('should take name as a parameter', function() {
        expect(player.name).toEqual('Jen');
    });

    it('should have a marker property, which represents the point that the player is on the board (post-move), initally equal to null', function() {
        expect(player.marker).toEqual('null');
    });

    it('should have a nextSpace property, which is the space on the board the player will move on next turn, initially equal to null', function() {
        expect(player.nextSpace).toEqual('null');
    });

    it('should have a nextSpacePointsIndex, which is the index of the point of the nextSpace, initially equal to null', function() {
        expect(player.nextSpacePointsIndex).toEqual('null');
    });

    it('should have an array called tiles', function() {
        expect(player.tiles).toEqual([]);
    });

    it('should have a canPlay property, which is set to true until the player dies', function() {
        expect(player.canPlay).toEqual('true');
    });

    it('should have a pickMarker function on it\'s prototype, which allows a player to select a marker, but no 2 players can have the same marker', function() {

        var markers = Marker;
        var randomlySelectAMarkerIndex = Math.floor(Math.random() * markers.length)
        playerWithFirstMarker = player.pickMarker(markers[randomlySelectAMarkerIndex]);
        expect(playerWithFirstMarker.marker).toEqual(markers[randomlySelectAMarkerIndex]);

        markers.splice(randomlySelectAMarkerIndex, 1);
        expect(markers.indexOf(randomlySelectAMarkerIndex)).toEqual(-1);
    });

    it('should have a placeMarker function on it\'s prototype, which have the player place the marker at their starting point', function() {

        //Not sure if this is how this should be written as angular will be determining where the player is placing it's marker on it's first move.
        player.placeMarker(pointChoosen, nextSpace);

        expect(player.point).to.be.an('object');
        expect(player.point.edge).to.equal(true);
        expect(player.point).to.equal(pointChoosen);
    });

    it('should have a placeTitle function on it\'s prototype', function() {
        player.placeTile(tile);

        describe('the player places a tile on a viable space', function() {

            it('the space the tile is placed is not already taken', function() {
                //player places a tile on a space that isn't already taken
            });

            it('the space the tile is placed is the player\'s nextSpace', function() {
                //player is placing a tile on its nextSpace
            });
        });

        describe('players should be checked if they should be moved after each placed tile', function(){
              it('each player that can play should call keepMoving function', function() {
                //once player has placed the tile, make sure all players who is still in the game moves, if the newly placed tile permits them.
            });
          });
    });
});