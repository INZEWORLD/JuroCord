import { Schema, model } from 'mongoose';

let JuroSetup = new Schema({
    Guild : String,
    Channel: String,
    Message: String,
    voiceChannel: String,
})

export default model('JuroSetup', JuroSetup);