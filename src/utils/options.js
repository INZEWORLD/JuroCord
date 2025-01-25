import dotenv from "dotenv"
dotenv.config()

export default [{
    moveOnDisconnect: false,
    resumable: false,
    resumableTimeout: 30,
    reconnectTries: 2,
    restTimeout: 10000,
    name: 'test',
    url: process.env.NODE_URL,
    auth: process.env.NODE_AUTH,
    secure: false
}]