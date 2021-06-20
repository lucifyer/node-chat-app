const socket = io()

socket.on('message', (text) => {
    console.log(text)
})

const sendMessage = () => {
    const message = document.getElementById('message')
    const button = document.getElementById('sendButton')
    button.setAttribute('disabled', true)

    // last parameter is always a function which is called upon acknowledgment
    socket.emit('sendMessage', message.value, (error) => {
        if (error) {
            return console.log(error)
        }
        message.value = '';
        message.focus()
        console.log('Delivered!')
        button.removeAttribute('disabled')
    })
}

const sendLocation = () => {
    const button = document.getElementById('locationButton')
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
            console.log('Location shared!')
        })
        button.removeAttribute('disabled')
    })
}