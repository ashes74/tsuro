var board = [];

function drawBoard() {
    for (var y = 0; y < 6; y++) {
        board[y] = [];
        for (var x = 0; x < 6; x++) {
            board[y].push(new Space(x, y));
        }
    }
}

function Space(x, y) {
    this.x = x;
    this.y = y;
    this.image = null;
    this.points = [null,null,null,null,null,null,null,null];

    for (var i = 0; i < 8 ; i++) {
        let corresponding;

        if(i < 2){ //top
            corresponding = i === 0 ? 5 : 4; // 0 -> 5 & 1 -> 4
            if(y === 0) this.points[i] = new Point(true);
            this.points[i] = board[y-1][x].points[corresponding];
        } else if (i < 4){ //right
            if(x === 5) this.points[i] = new Point(true);
            this.points[i] = new Point(false);
        } else if (i < 6){ //bottom
            if(y === 5) this.points[i] = new Point(true);
            this.points[i] = new Point(false);
        } else { //left
            corresponding = i === 6 ? 3 : 2; // 6 -> 3 & 7 -> 2
            if(x === 0) this.points[i] = new Point(true);
            this.points[i] = board[y][x-1].points[corresponding];
        }
    }
}

//edge = boolean
function Point(edge){
    this.edge = edge;
    this.neighbors = [];
}

