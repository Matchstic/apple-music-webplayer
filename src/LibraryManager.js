import Raven from 'raven-js';
import EventBus from './event-bus';

var LibraryManager = {
    artists: null,
    albums: null,
    tracks: null,
    hasInitiallyLoaded: false,
    getRecentlyAddedAlbums: function() {
        return [];
    },
    getTracksForAlbum: function (albumId) {
        return [];
    },
    getAlbumsForArtist: function (artistId) {
        return [];
    },
    refreshLibrary: function(musickit, progressHandlerFunction, callbackFunction) {
        // Artists first.
        
        console.log("Fetching artists...");
        var self = this;
        _fetchArtists(0, musickit, undefined, function(artistList) {
            self.artists = artistList;
            progressHandlerFunction(0.33); // 33%
            
            // Albums next
            console.log("Fetching albums...");
            _fetchAlbums(0, musickit, undefined, function(albumList) {
                self.albums = albumList;
                progressHandlerFunction(0.50); // 50%
                
                // Finally, songs
                /*console.log("Fetching songs...");
                _fetchSongs(0, musickit, undefined, function(songsList) {
                    self.tracks = songsList;
                    progressHandlerFunction(1.0); // 100%
                
                    // Callback!
                    self.hasInitiallyLoaded = true;
                    callbackFunction(true);
                });*/
                
                progressHandlerFunction(1.0); // 100%
            
                // Callback!
                self.hasInitiallyLoaded = true;
                callbackFunction(true);
            });
        });
    }
};

export function getLibraryManager() {
    return LibraryManager;
}

function _fetchArtists(offset, musickit, artistList, callbackFunction) {
    if (window.localStorage.hasOwnProperty("library-artists")) {
        callbackFunction(JSON.parse(window.localStorage.getItem("library-artists")));
        return;
    }
    
    if (!offset) {
        offset = 0;
    }
    
    musickit.api.library.artists(null, { offset: offset, limit: 100 })
    .then(r => {
        console.log(r[0]);
        if (!artistList) {
            artistList = r;
        } else {
            artistList = artistList.concat(r);
        }

        if (r.length !== 0) {
            _fetchArtists(offset + 100, musickit, artistList, callbackFunction);
        } else {
            // TODO: Now, fill in the album relationships for these artists.
            
            window.localStorage.setItem("library-artists", JSON.stringify(artistList));
            callbackFunction(artistList);
        }
    }, err => {
        console.log(err);
        // Raven.captureException(err);
        
        EventBus.$emit('alert', {
            type: 'danger',
            message: 'An unexpected error occurred: ' + err.title + ' (' + err.code + ')'
        });
    });
}

function _fetchAlbums(offset, musickit, albumList, callbackFunction) {
    if (window.localStorage.hasOwnProperty("library-albums")) {
        callbackFunction(JSON.parse(window.localStorage.getItem("library-albums")));
        return;
    }
    
    if (!offset) {
        offset = 0;
    }

    musickit.api.library.albums(null, { offset: offset, limit: 100 })
    .then(r => {
        if (!albumList) {
            albumList = r;
        } else {
            albumList = albumList.concat(r);
        }

        if (r.length !== 0) {
            _fetchAlbums(offset + 100, musickit, albumList, callbackFunction);
        } else {
            window.localStorage.setItem("library-albums", JSON.stringify(albumList));
            callbackFunction(albumList);
        }
    }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
            type: 'danger',
            message: `An unexpected error occurred.`
        });
    });
}

function _fetchSongs(offset, musickit, songsList, callbackFunction) {
    if (window.localStorage.hasOwnProperty("library-tracks")) {
        callbackFunction(JSON.parse(window.localStorage.getItem("library-tracks")));
        return;
    }
    
    if (!offset) {
        offset = 0;
    }

    musickit.api.library.songs(null, { offset: offset, limit: 100 })
    .then(r => {
        console.log(r);
        if (!songsList) {
            songsList = r;
        } else {
            songsList = songsList.concat(r);
        }

        if (r.length !== 0) {
            _fetchSongs(offset + 100, musickit, songsList, callbackFunction);
        } else {
            window.localStorage.setItem("library-tracks", JSON.stringify(songsList));
            callbackFunction(songsList);
        }
    }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
            type: 'danger',
            message: `An unexpected error occurred.`
        });
    });
}
