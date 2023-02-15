(_ => {
  const W = window
  const N = W.navigator
  const BU = W.BRAVE

  const readDomProperties = _ => {
    return {
      isbrave: !!(N.brave && N.brave.isBrave),
      gpc: N.globalPrivacyControl,
      connection: !!(N.connection)
    }
  }

  const onMessage = (action, _) => {
    if (action === 'dom-properties::read') {
      return readDomProperties()
    }
  }

  BU.receivePostMsg(onMessage)
})()
