tsuro.factory('gameFactory', function () {
    return {
        rotateTile: function (tile) {
            if (tile.rotation > 0) {
                for (var i = 1; i <= tile.rotation; i++) {
                    console.log("original pathes", tile.paths)

                    tile.paths = tile.paths.map(function (connection) {
                        connection = connection + 2;
                        if (connection === 9) connection = 1;
                        if (connection === 8) connection = 0;
                        return connection;
                    });
                    console.log("after adding 2", tile.paths);
                    tile.paths.unshift(tile.paths.pop());
                    tile.paths.unshift(tile.paths.pop());
                    console.log("after unshift to front", tile.paths);
                    return tile;
                }
                console.log("to the right, final paths", tile.paths);
            } else if (tile.rotation < 0) {
                for (var j = -1; j >= tile.rotation; j--) {
                    console.log("original pathes", tile.paths);

                    tile.paths = tile.paths.map(function (connection) {
                        connection = connection - 2;
                        if (connection === -2) connection = 6;
                        if (connection === -1) connection = 7;
                        return connection;
                    });
                    console.log("after minusing 2", tile.paths);
                    tile.paths.push(tile.paths.shift());
                    tile.paths.push(tile.paths.shift());
                    console.log("after unshift to front", tile.paths);
                }
                console.log("to the left, final paths", tile.paths);
                return tile;
            }
        }
    }
})
