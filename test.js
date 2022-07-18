// $() is a shortcut to the function document.getElementById()
// ${} string template literals DON'T FORGET TO WRAP IN BACKTICKS ``
// "const" variables can't be reassigned 

let userLeft = false
let userPlayingFortnite = false

// Promises accept a function with 2 parameters: resolve and reject
// Promises are good for doing stuff that may take a while, letting it
// happen in the background
// let p = new Promise((resolve, reject) => {
//     let a = 2 + 1
//     if(a == 2){
//         resolve('Success')
//     }
//     else{
//         reject('Failed')
//     }
// })

// What happens after a Promise along with how to catch
// p.then((message) => {
//     console.log('This is in the then ' + message)
// }).catch((message) => { 
//     console.log('This is in the catch ' + message)
// })

function watchPromise(){
    return new Promise((resolve, reject) => {
        if(userPlayingFortnite){
            resolve('Epic Fortnite gaming')
        }
        else{
            reject({
                name: 'User not playing Fortnite!!',
                message: 'This is unacceptable. Please, play Fornite.'
            })
        }
    })
}

watchPromise().then((message) => {
    console.log('Success: ' + message)
}).catch((error) => { 
    console.log(error.name + ' ' + error.message)
})

// Run multiple Promises
const rv1 = new Promise((resolve, reject) => {
    resolve('Vid 1 recorded')
})

const rv2 = new Promise((resolve, reject) => {
    resolve('Vid 2 recorded')
})

const rv3 = new Promise((resolve, reject) => {
    resolve('Vid 3 recorded')
})

// "all" takes in an array of Promises
// "then" returns an array of messages
Promise.all([rv1, rv2, rv3]).then((messages) => {
    console.log(messages)
})

// Waits for just 1 Promise to complete
// Returns just a single message
Promise.race([rv1, rv2, rv3]).then((message) => {
    console.log(message)
})

function makeRequest(location) {
    return new Promise((resolve, reject) => {
        console.log(`Making Request to ${location}`)
        if(location === 'Google'){
            resolve('Google says hi')
        }
        else{
            reject('We can only talk to Google')
        }
    })
}

function processRequest(response){
    return new Promise((resolve, reject) => {
        console.log('Processing response')
        resolve(`Extra Information + ${response}`)
    })
}

makeRequest('Google').then(response => {
    console.log('Response Received')
    return processRequest(response)
}).then(processResponse => {
    console.log(processResponse)
}).catch(err => {
    console.log(err)
})

// If you want async functions, mark with "async"
async function doWork(){
    // Putting "await" makes sure that line has finished execution before
    // moving on to the rest of the code. Leaves the function to
    // do other stuff while this await line is executing

    try{
        const response = await makeRequest('Facebook')
        console.log('Response received baby')
        const processedResponse = await processRequest(response)
        console.log(processedResponse)        
    }
    catch (err){
        console.log(err)
    }
}
doWork()