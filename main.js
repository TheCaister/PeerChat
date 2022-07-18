// In JavaScript, forEach(function) calls "function" on every element 

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
    iceServers:[
        {
            urls:['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}


// Anonymous async
let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid, token})

    // index.html?room=324223
    channel = client.createChannel('main')
    await channel.join()

    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    document.getElementById('user-1').srcObject = localStream

    createOffer()
}

let createOffer = async () => {
    // Can optionally pass in STUN servers 
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

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
        if(event.candidate){
            console.log('New ICE candidate: ', event.candidate)
        }
    }


    let offer = await peerConnection.createOffer()

    // When we set the local description, ICE will be made (requests)
    // will be sent to the STUN server
    await peerConnection.setLocalDescription(offer)

    console.log('Offer: ', offer)
}

init()