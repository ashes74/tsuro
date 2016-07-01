// makeBoard(width: Int? ?? 6, height: Int? ?? 6) -> Space[height][width]
//
// Returns a 2D array of Spaces.
function makeBoard(width, height) {
    width = width || 6
    height = height || 6
    board = new Array(height)
    for (var y = 0; y < height; y++) {
        if (!board[y]) board[y] = new Array(width)
        for (var x = 0; x < width; x++) {
            board[y][x] = new Space(x, y, board)
        }
    }
    return board
}

function Space(x, y, board) {
    this.x = x;
    this.y = y;
    this.image = "n";
    this.tileUrl = "n";
    this.tileId = "n";

    // Fetch the subdivided coordinates of our points
    const coords = this.pointCoordinates()
    
    // We assume that spaces are created right to left, top to bottom.
    // We'll wire our points up with our top and left neighbors points.
    // If we don't have a top or left neighbor, we must be an edge, so we
    // create a new edge point there.
    const topNeighbor = board.spaces[y - 1][x], leftNeighbor = board.spaces[y][x - 1]
    this.top = {
        left: topNeighbor? topNeighbor.bottom.left : new Point(true, this, coords.top.left)
        right: topNeighbor? topNeighbor.bottom.right : new Point(true, this, coords.top.right)
    }
    this.left = {
        top: leftNeighbor? leftNeighbor.right.top : new Point(true, this, coords.left.top)
        right: leftNeighbor? leftNeighbor.right.bottom : new Point(true, this, coords.right.top)
    }

    // Now create our bottom and right points, checking to see if we're on the edge
    const iAmTheRightEdge = x === board[0].length - 1,
          iAmTheBottomEdge = y === board.length - 1
    this.right = {
        top: new Point(iAmTheRightEdge, this, coords.right.top),
        bottom: new Point(iAmTheRightEdge, this, coords.right.bottom),
    }
    this.bottom = {
        left: new Point(iAmTheBottomEdge, this, coords.bottom.left),
        right: new Point(iAmTheBottomEdge, this, coords.bottom.right),
    }
    
    this.points = [
        this.top.left, this.top.right,
        this.right.top, this.right.bottom,
        this.bottom.right, this.bottom.left,
        this.left.bottom, this.left.top
    ]

    // Attach ourself to each point we're connected to.
    this.points.forEach(point => point.spaces.push(this))
}

// It seems like using the coordinates of the space can't possibly be right
// for the points, since they are by their nature around the edge of the space.
// I'd recommend subdividing the coordinate system to make the Point -> screen transform
// in the view easier. ~ ak
const POINT_SPACING = 1 / 3
Space.prototype.pointCoordinates = function() {
    const left = this.x
    const right = this.x + 1
    const top = this.y
    const bottom = this.y + 1
    let coords = {}
    coords.top = {
        left: {x: this.x + POINT_SPACING, y: top},
        right: {x: this.x + 2 * POINT_SPACING, y: top},
    }
    coords.right = {
        top: {x: right, y: this.y + POINT_SPACING},
        bottom: {x: right, y: this.y + 2 * POINT_SPACING},
    }
    coords.bottom = {
        left: {x: coords.top.left.x, y: bottom},
        right: {x: coords.top.right.x, y: bottom},
    }
    coords.left = {
        top: {x: left, y: coords.right.top.y},
        bottom: {x: right, y: coords.right.bottom.y},
    }
    return coords
}

// new Point(edge: Boolean, coordinates: {x: Number, y: Number})
function Point(edge, coordinates) {
    this.edge = edge;
    this.neighbors = ["n"];
    this.travelled = false;
    this.spaces = []
    this.coordinates = coordinates
}
