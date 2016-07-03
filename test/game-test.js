'use strict';

var expect = require('chai').expect

//LA: copying the functions because requiring is taking too long to debug
function rotateTile (tile) {
	let rotationDifference = tile.rotation;
	if (rotationDifference<0)throw new Error;
	//add rotationDifference
	let	toRotate = tile.paths.map((path)=>{
		return path= (path +(2*rotationDifference))%8; //add the rotation difference and wrap around 8
	});
	// wrap around
	let result =  toRotate.slice(-2*rotationDifference).concat(toRotate.slice(0, -2*rotationDifference))
	tile.paths = result
	console.log(result, tile.paths);
return tile;
}

//TODO: TEST GAMEPLAY
describe('Game', () => {

});

///TILES TESTER
describe('Tiles', () => {
	let tile;
	beforeEach(() => {
		tile = {
			id: 1,
			imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_01.png?alt=media&token=dc2e553b-f4da-442e-97e8-d0d808c2d5c0",
			paths: [5, 6, 3, 2, 7, 0, 1, 4],
			rotation: 0
		}
	});

	it('should have a path', () => {
		expect(tile.paths).to.be.a('array');
		expect(tile.paths.length).to.equals(8);

	});

	it('should rotate when rotateTile is called', () => {
		let rotated = rotateTile(tile);
		expect(rotated.paths).to.equal(tile.paths);
		tile.rotation = 2;
		// console.log(tile);
		rotated = rotateTile(tile);
		// console.log(rotated);
		expect(rotated.paths).to.equal([3,4,5,0,1,2,7,6])
	});

});
