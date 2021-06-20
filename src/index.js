const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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
    // socket.emit('message', generateMessage('Welcome moon walker!'))

    // broadcasting means emit to all except the current socket connection
    // socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('join', ({ username, room}, callback) => {
        // makes user join the specific room
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', `Welcome ${user.username}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    // catching events
    // callback parameter is used to send acknlowdgements
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('Profanity is unacceptable!')
        }

        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    // socket calls this automatically when the client connection is disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has disconnected!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })        
        }
    })

    // Receiving location and broadcasting to all.
    socket.on('emitLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://www.google.com/maps/@${location.latitude},${location.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on port', port)
})
