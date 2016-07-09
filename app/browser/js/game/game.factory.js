tsuro.factory('gameFactory', function ($firebaseAuth, $state, $rootScope) {
    return {
        markers: ["red", "purple", "yellow", "pink", "jade", "sky", "ocean", "green"],
        tiles: {
            1: {
                id: 1,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_01.png?alt=media&token=ffcfa546-f1cf-4bbe-9cf0-ac067aa3c406',
                paths: [5, 6, 4, 7, 2, 0, 1, 3],
                rotation: 0
            },
            2: {
                id: 2,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_02.png?alt=media&token=89b2f893-0c61-4257-9e24-c5c0f34da9b4',
                paths: [1, 0, 4, 7, 2, 6, 5, 3],
                rotation: 0
            },
            3: {
                id: 3,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_03.png?alt=media&token=c17c6ddf-39c8-4a7b-a912-427284fa7e3e',
                paths: [1, 0, 4, 6, 2, 7, 3, 5],
                rotation: 0
            },
            4: {
                id: 4,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_04.png?alt=media&token=0c752582-8949-47f7-8bfc-90c8a4b2308f',
                paths: [2, 5, 0, 7, 6, 1, 4, 3],
                rotation: 0
            },
            5: {
                id: 5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_05.png?alt=media&token=aaf16e79-05e4-4423-bb9c-0327962934ba',
                paths: [4, 2, 1, 6, 0, 7, 3, 5],
                rotation: 0
            },
            6: {
                id: 6,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_06.png?alt=media&token=6d190fdb-8d17-460b-b787-d1414aaae097',
                paths: [1, 0, 5, 7, 6, 2, 4, 3],
                rotation: 0
            },
            7: {
                id: 7,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_07.png?alt=media&token=0c1e9b3c-307a-4c36-8fa5-d21e9f385292',
                paths: [2, 4, 0, 6, 1, 7, 3, 5],
                rotation: 0
            },
            8: {
                id: 8,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_08.png?alt=media&token=0084c7f0-c4a6-40c5-b8b5-587c7ba73fef',
                paths: [4, 7, 5, 6, 0, 2, 3, 1],
                rotation: 0
            },
            9: {
                id: 9,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_09.png?alt=media&token=0f898f82-bbc0-4edf-ae8a-953ec4c63a43',
                paths: [1, 0, 7, 6, 5, 4, 3, 2],
                rotation: 0
            }
            ,
            10: {
                id: 10,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_10.png?alt=media&token=17252a8a-365e-4c8d-847f-1e96de7ae695',
                paths: [4, 5, 6, 7, 0, 1, 2, 3],
                rotation: 0
            },
            11: {
                id: 11,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_11.png?alt=media&token=239eb887-5e2c-4bf5-9065-1aa0bf0528da',
                paths: [7, 2, 1, 4, 3, 6, 5, 0],
                rotation: 0
            },
            12: {
                id: 12,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_12.png?alt=media&token=cfbcca24-6ace-4533-885d-6b10181d5355',
                paths: [2, 7, 0, 5, 6, 3, 4, 1],
                rotation: 0
            },
            13: {
                id: 13,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_13.png?alt=media&token=2e6d55aa-93a0-42ef-8450-8f2180ce85cc',
                paths: [5, 4, 7, 6, 1, 0, 3, 2],
                rotation: 0
            },
            14: {
                id: 14,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_14.png?alt=media&token=9ddaf26d-1187-4236-9741-83b08a4803e5',
                paths: [3, 2, 1, 0, 7, 6, 5, 4],
                rotation: 0
            },
            15: {
                id: 15,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_15.png?alt=media&token=aefd8d1e-2981-4ab2-a0cb-e2d5ff911d84',
                paths: [1, 0, 7, 4, 3, 6, 5, 2],
                rotation: 0
            },
            16: {
                id: 16,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_16.png?alt=media&token=c04fae4b-9b52-4972-b570-f46790adad44',
                paths: [1, 0, 5, 6, 7, 2, 3, 4],
                rotation: 0
            },
            17: {
                id: 17,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_17.png?alt=media&token=a61b34c9-61b9-4e53-8910-ba84763666f9',
                paths: [3, 5, 6, 0, 7, 1, 2, 4],
                rotation: 0
            },
            18: {
                id: 18,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_18.png?alt=media&token=53aca221-8524-47b1-9c4b-1650c383587a',
                paths: [2, 7, 0, 4, 3, 6, 5, 1],
                rotation: 0
            },
            19: {
                id: 19,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_19.png?alt=media&token=ae135f90-46a6-42da-b166-73b035d6fd5d',
                paths: [4, 3, 6, 1, 0, 7, 2, 5],
                rotation: 0
            },
            20: {
                id: 20,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_20.png?alt=media&token=1bf02f10-766b-4645-b758-e5fcbe3b440d',
                paths: [3, 7, 4, 0, 2, 6, 5, 1],
                rotation: 0
            },
            21: {
                id: 21,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_21.png?alt=media&token=94d8a157-472e-4692-8d2e-815d1a4aabc3',
                paths: [2, 3, 0, 1, 7, 6, 5, 4],
                rotation: 0
            },
            22: {
                id: 22,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_22.png?alt=media&token=314c48e4-7efe-44fb-904a-b9e4f6e8107c',
                paths: [2, 6, 0, 5, 7, 3, 1, 4],
                rotation: 0
            },
            23: {
                id: 23,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_23.png?alt=media&token=b3cd6be7-b544-4840-bef5-ada615f4197d',
                paths: [1, 0, 6, 4, 3, 7, 2, 5],
                rotation: 0
            },
            24: {
                id: 24,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_24.png?alt=media&token=fd85dd7d-7c06-4bfb-8efb-240976eb7346',
                paths: [5, 6, 7, 4, 3, 0, 1, 2],
                rotation: 0
            },
            25: {
                id: 25,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_25.png?alt=media&token=6d025e9b-7aaf-439f-9646-4f75b3a690f1',
                paths: [1, 0, 3, 2, 7, 6, 5, 4],
                rotation: 0
            },
            26: {
                id: 26,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_26.png?alt=media&token=2b46be55-d0cf-4454-96a7-fca82e66bb07',
                paths: [1, 0, 6, 7, 5, 4, 2, 3],
                rotation: 0
            },
            27: {
                id: 27,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_27.png?alt=media&token=42466d8d-e81a-4057-a1f1-a104d8cfa56b',
                paths: [2, 4, 0, 7, 1, 6, 5, 3],
                rotation: 0
            },
            28: {
                id: 28,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_28.png?alt=media&token=974fd5de-b521-49d0-a3b2-e1ad9062146d',
                paths: [4, 2, 1, 7, 0, 6, 5, 3],
                rotation: 0
            },
            29: {
                id: 29,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_29.png?alt=media&token=e5951b29-e169-401d-a3cd-6a0f6b020c39',
                paths: [1, 0, 3, 2, 5, 4, 7, 6],
                rotation: 0
            },
            30: {
                id: 30,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_30.png?alt=media&token=ada2217d-5c7e-48f8-a815-87aabbd5e8ad',
                paths: [2, 3, 0, 1, 6, 7, 4, 5],
                rotation: 0
            },
            31: {
                id: 31,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_31.png?alt=media&token=53443bed-f1cf-44a1-bf3b-dbcafa56f40a',
                paths: [3, 6, 5, 0, 7, 2, 1, 4],
                rotation: 0
            },
            32: {
                id: 32,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_32.png?alt=media&token=97a95751-e663-4659-8354-aed05f2063f4',
                paths: [1, 0, 6, 5, 7, 3, 2, 4],
                rotation: 0
            },
            33: {
                id: 33,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_33.png?alt=media&token=38d30d0f-fed4-4204-809d-15940b98a488',
                paths: [1, 0, 3, 2, 6, 7, 4, 5],
                rotation: 0
            },
            34: {
                id: 34,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_34.png?alt=media&token=301fcf7b-4e37-4234-b5dc-81b3dacbc06b',
                paths: [4, 5, 7, 6, 0, 1, 3, 2],
                rotation: 0
            },
            35: {
                id: 35,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_35.png?alt=media&token=1fba1d07-44da-46aa-b85b-4c1b53e4f7cd',
                paths: [1, 0, 7, 5, 6, 3, 4, 2],
                rotation: 0
            }
        },
        rotateTile: function (tile, rotation) {
            console.log("rotate tile inside factory", tile, rotation);
            if (rotation > 0) {
                for (var i = 1; i <= rotation; i++) {
                    console.log("original pathes", tile.paths);

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
                }
                return tile;
            } else {
                return tile;
            }
        },
        logInWithGoogle: function () {
            var auth = $firebaseAuth();
            auth.$signInWithPopup("google").then(function (authData) {
                console.log("Logged in as:", authData);
                $rootScope.currentUser = authData;
                $state.go('pickGame');
            }).catch(function (error) {
                console.error("Authentication failed:", error);
            });
        }
    };
});
