(_ => {
  const W = window
  const BU = W.BRAVE

  const isGlobalTrue = path => {
    const upperName = path.map(x => x.toUpperCase).join('_')
    return W[upperName] === true
  }

  const onMessage = (action, msg) => {
    if (action === 'filtering-scriptlets::read') {
      return isGlobalTrue(msg.path)
    }
  }

  BU.receivePostMsg(onMessage)
})()
