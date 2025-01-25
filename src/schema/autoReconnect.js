import { Schema, model } from 'mongoose';

let autoReconnect = new Schema({
    Guild : {
        type: String,
        required: true
    },
    TextId : {
        type: String,
        required: true
    },
    VoiceId : {
        type: String,
        required: true
    }, 
});
export default model('autoreconnect ', autoReconnect );