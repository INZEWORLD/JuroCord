import { Schema, model } from 'mongoose';

const Playlist = new Schema({
    Username: {
        type: String,
        required: false
    },
    UserId: {
        type: String,
        required: true
    },
    PlaylistName: {
        type: String,
        required: true
    },
    Playlist: {
        type: Array,
        required: true
    },
    CreatedOn: {
        type: Number,
        required: true
    }

});

export default model('playlist', Playlist);