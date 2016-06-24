// var assert = require('assert');
var expect = require('chai').expect;
var Game = require('../game.js');

describe('Game', function(){

	let newGame;
	beforeEach(() => {
		newGame = new Game()
	});
  it('should create a Game object', function(){
    expect(newGame.count).to.equal(35);
		expect(newGame.board).to.be.undefined
		// TODO: add other tests
		
  });
})
