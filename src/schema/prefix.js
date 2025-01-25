import { Schema, model } from 'mongoose';

let Prefix = new Schema({
    Guild : String,
    Prefix : String, 
    oldPrefix: String,
})

export default model('prefix', Prefix);