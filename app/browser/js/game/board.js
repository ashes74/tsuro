function Board() {
    this.board = [];
}

Board.prototype.drawBoard = function () {
    for (var y = 0; y < 6; y++) {
        if (!this.board[y]) this.board[y] = [];
        for (var x = 0; x < 6; x++) {
            this.board[y].push(new Space(x, y, this.board));
        }
    }
    return this.board;
}

function Space(x, y, board) {
    this.x = x;
    this.y = y;
    this.tile;
    // this.image = "n";
    this.points = [null, null, null, null, null, null, null, null];
    // this.tileUrl = "n";
    // this.tileId = "n";

    for (var i = 0; i < 8; i++) {
        let corresponding;

        if (i < 2) { //top
            corresponding = i === 0 ? 5 : 4; // 0 -> 5 & 1 -> 4
            if (y === 0) this.points[i] = new Point([{
                x: x,
                y: y,
                i: i
            }]);
            else {
                this.points[i] = board[y - 1][x].points[corresponding];
            }
        } else if (i < 4) { //right
            corresponding = i === 2 ? 7 : 6;
            if (x === 5) this.points[i] = new Point([{
                x: x,
                y: y,
                i: i
            }]);
            else {
                this.points[i] = new Point([{
                    x: x,
                    y: y,
                    i: i
                }, {
                    x: x + 1,
                    y: y,
                    i: corresponding
                }]);
            }
        } else if (i < 6) { //bottom
            corresponding = i === 4 ? 1 : 0;
            if (y === 5) this.points[i] = new Point([{
                x: x,
                y: y,
                i: i
            }]);
            else {
                this.points[i] = new Point([{
                    x: x,
                    y: y,
                    i: i
                }, {
                    x: x,
                    y: y + 1,
                    i: corresponding
                }]);
            }
        } else { //left
            corresponding = i === 6 ? 3 : 2; // 6 -> 3 & 7 -> 2
            if (x === 0) this.points[i] = new Point([{
                x: x,
                y: y,
                i: i
            }]);
            else {
                this.points[i] = board[y][x - 1].points[corresponding];
            }
        }
    }
}


// edge = boolean
function Point(space) {
    if (space[0].y === 0) {
        if (space[0].i === 0 || space[0].i === 1) this.edge = true;
        else this.edge = false;
    } else if (space[0].y === 5) {
        if (space[0].i === 4 || space[0].i === 5) this.edge = true;
        else this.edge = false;
    } else if (space[0].x === 0) {
        if (space[0].i === 6 || space[0].i === 7) this.edge = true;
        else this.edge = false;
    } else if (space[0].x === 5) {
        if (space[0].i === 2 || space[0].i === 3) this.edge = true;
        else this.edge = false;
    }
    this.spaceId = 'space' + space[0].y + space[0].x + space[0].i;
    this.neighbors = [{"n": 0}];
    this.travelled = false;
    this.spaces = space;
}
