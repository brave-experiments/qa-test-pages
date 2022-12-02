(_ => {
  const W = window
  const BU = W.BRAVE

  const onMessage = (action, _) => {
    if (action === 'dom-properties-performance::read') {
      return W.performance.now()
    }
  }

  BU.receivePostMsg(onMessage)
})()
