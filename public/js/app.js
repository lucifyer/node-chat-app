const socket = io()

const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML
const messages = document.getElementById('messages')
const sidebar = document.getElementById('sidebar')

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // last message
    const newMessage = messages.lastElementChild

    // height of the last message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far it is scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (Math.round(containerHeight - newMessageHeight) <= Math.round(scrollOffset)) {
        console.log('asd')
        messages.scrollTop = messages.scrollHeight
    }

}
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

const sendMessage = () => {
    const message = document.getElementById('message')
    if(message.value === '') {
        return undefined
    }
    const button = document.getElementById('sendButton')
    button.setAttribute('disabled', true)

    // last parameter is always a function which is called upon acknowledgment
    socket.emit('sendMessage', message.value, (error) => {
        if (error) {
            return console.log(error)
        }
        message.value = '';
        message.focus()
        // console.log('Delivered!')
        button.removeAttribute('disabled')
    })
}

const sendLocation = () => {
    const button = document.getElementById('send-location')
    button.setAttribute('disabled', true)
    if(!navigator.geolocation) {
        return alert('Geolocation is not enabled by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('emitLocation', location, () => {
            // console.log('Location shared!')
        })
        button.removeAttribute('disabled')
    })
}

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html
})