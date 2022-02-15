(_ => {
  const W = window
  const D = W.document

  const webSocketsUrl = 'wss://mq6xb08mii.execute-api.us-west-2.amazonaws.com/development'
  const startBtn = D.getElementById('start-button')
  const stopBtn = D.getElementById('stop-button')
  const bodyElm = D.getElementById('results-section')
  const socketOpenInterval = 2000

  const managedSockets = []

  const onWSMessage = (msgCell, msg) => {
    msgCell.textContent = msg.data
  }

  const addWebSocketErrorRow = tableBodyElm => {
    const socketRowElm = D.createElement('tr')
    const socketNumCellElm = D.createElement('td')
    socketNumCellElm.textContent = 'NA'
    socketRowElm.appendChild(socketNumCellElm)

    const socketCreatedTimeElm = D.createElement('td')
    socketCreatedTimeElm.textContent = W.Date.now()
    socketRowElm.appendChild(socketCreatedTimeElm)

    const msgElm = D.createElement('td')
    const pillElm = D.createElement('span')
    pillElm.className = 'badge badge-pill badge-danger'
    pillElm.textContent = 'Connecting error'
    msgElm.appendChild(pillElm)
    socketRowElm.appendChild(msgElm)

    tableBodyElm.appendChild(socketRowElm)
  }

  const addWebSocketRow = (tableBodyElm, socket, socketNum) => {
    const socketRowElm = D.createElement('tr')
    const socketNumCellElm = D.createElement('td')
    socketNumCellElm.textContent = socketNum

    const socketCreatedTimeElm = D.createElement('td')
    socketCreatedTimeElm.textContent = W.Date.now()

    const msgElm = D.createElement('td')
    msgElm.textContent = '-'

    socket.addEventListener('message', onWSMessage.bind(undefined, msgElm))
    socketRowElm.appendChild(socketNumCellElm)
    socketRowElm.appendChild(socketCreatedTimeElm)
    socketRowElm.appendChild(msgElm)

    tableBodyElm.appendChild(socketRowElm)
  }

  const endTest = intervalId => {
    try {
      W.clearInterval(intervalId)
    } catch (_) {
      // Handle the case were the timer is already cancelled because the
      // user manually stopped the test (or vise versa.)
    }
    for (const aSocket of managedSockets) {
      aSocket.close()
    }
    stopBtn.setAttribute('disabled', true)
  }

  const attemptToCreateWebSocket = intervalId => {
    const socket = new W.WebSocket(webSocketsUrl)
    socket.addEventListener('open', _ => {
      managedSockets.push(socket)
      addWebSocketRow(bodyElm, socket, managedSockets.length)
      socket.send('connected')
    })
    socket.addEventListener('error', _ => {
      endTest(intervalId)
      addWebSocketErrorRow(bodyElm)
    })
  }

  const startTest = _ => {
    const intervalId = W.setInterval(_ => {
      attemptToCreateWebSocket(intervalId)
    }, socketOpenInterval)

    stopBtn.addEventListener('click', _ => {
      endTest(intervalId)
    }, false)

    startBtn.setAttribute('disabled', true)
    stopBtn.removeAttribute('disabled')
  }

  startBtn.addEventListener('click', startTest, false)
  startBtn.removeAttribute('disabled')
})()
