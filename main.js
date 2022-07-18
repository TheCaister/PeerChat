// In JavaScript, forEach(function) calls "function" on every element 
// Each peer connection has 2 descriptions: A local and a remote one

let APP_ID = ""
let token = null;
let uid = String(Math.floor(Math.random() * 10000))

// The 2 users join this channel
let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

// Testing with STUN server
const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}


// Anonymous async
let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({ uid, token })

    // index.html?room=324223
    channel = client.createChannel('main')
    await channel.join()

    // Listen for any members that have joined and call the function
    channel.on('MemberJoined', handleUserJoined)

    // Usually, Agora checks if a user has left every 20-30 seconds
    // What if we want to do something the moment a user leaves?
    channel.on('MemberLeft', handleUserLeft)

    // Listen for messages being sent from others
    client.on('MessageFromPeer', handleMessageFromPeer)

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    document.getElementById('user-1').srcObject = localStream

}

let handleMessageFromPeer = async (message, MemberId) => {
    message = JSON.parse(message.text)

    // If receiving an offer, create an answer
    if(message.type === 'offer'){
        createAnswer(MemberId, message.offer)
    }

    // If receiving an answer, add it. MemberId is not needed
    // since we won't be sending anything back
    if(message.type === 'answer'){
        addAnswer(message.answer)
    }

    // Handling candidate messages and adding them
    if(message.type === 'candidate'){
        if(peerConnection){
            peerConnection.addIceCandidate(message.candidate)
        }
    }

    console.log('Message: ', message)
}

let handleUserJoined = async (MemberId) => {
    console.log('A new user joined the channel: ', MemberId)
    createOffer(MemberId)

}

let handleUserLeft = (MemberId) => {
    document.getElementById('user-2').style.display = 'none'
}

/**
 * Creates a peer connection. Will be used in the methods for
 * creating offers and answers
 * @param {*} MemberId 
 */
let createPeerConnection = async (MemberId) => {
    // Can optionally pass in STUN servers 
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream
    // When peer joins, display as block element
    document.getElementById('user-2').style.display = 'block'


    // Check if local stream is present
    if(!localStream){
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        document.getElementById('user-1').srcObject = localStream
    }

    // Get all our tracks and add it to peerConnection
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    // Check for stuff added by the peer and adding it to
    // our remoteStream
    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    // Listen for generated ICE candidates
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            console.log('New ICE candidate: ', event.candidate)

            client.sendMessageToPeer({
                // Implementing the trickling ICE technique
                text: JSON.stringify({
                    'type': 'candidate',
                    'candidate': event.candidate
                })
            }, MemberId)
        }
    }
}

/**
 * Creating an offer
 * @param {*} MemberId 
 */
let createOffer = async (MemberId) => {
    await createPeerConnection(MemberId)

    let offer = await peerConnection.createOffer()

    // When we set the local description, ICE will be made (requests)
    // will be sent to the STUN server
    await peerConnection.setLocalDescription(offer)

    console.log('Offer: ', offer)
    // Actually sending a message to the peer
    // client.sendMessageToPeer({ text: JSON.stringify({'type':''})}, MemberId)

    client.sendMessageToPeer({
        // Set type to "offer" so we know what we're dealing with.
        text: JSON.stringify({
            'type': 'offer',
            'offer': offer
        })
    }, MemberId)
}

/**
 * Creating an answer
 * @param {*} MemberId 
 * @param {*} offer 
 */
let createAnswer = async (MemberId, offer) => {
    await createPeerConnection(MemberId)

    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    // Sending the answer
    client.sendMessageToPeer({
        text: JSON.stringify({
            'type': 'answer',
            'answer': answer
        })
    }, MemberId)
}

/**
 * Once an answer has been received, set that as the remote description
 * @param {*} answer 
 */
let addAnswer = async (answer) => {
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer)
    }
}

/**
 * Handling when a user leaves
 */
let leaveChannel = async () => {
    await channel.leave()
    await client.logout()
}

/**
 * Handles leaving when user closes the window
 */
window.addEventListener('beforeunload', leaveChannel)

init()