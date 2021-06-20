const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('Socket connection initiated')
    // socket is the socket object that handles the connection with the single client
    // io is like the whole connection object, can be used to work with all clients as a whole

    // emitting events
    socket.emit('message', 'Welcome moon walker!')

    // broadcasting means emit to all except the current socket connection
    socket.broadcast.emit('message', 'A new user has joined!')

    // catching events
    // callback parameter is used to send acknlowdgements
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('Profanity is unacceptable!')
        }
        io.emit('message', message)
        callback()
    })

    // socket calls this automatically when the client connection is disconnected
    socket.on('disconnect', () => {
        io.emit('message', 'A user has disconnected!')
    })

    // Receiving location and broadcasting to all.
    socket.on('emitLocation', (location, callback) => {
        io.emit('message', `https://www.google.com/maps/@${location.latitude},${location.longitude}`)
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on port', port)
})
