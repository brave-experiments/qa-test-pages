(_ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const scriptHandleToHTMLId = handle => {
    return `injected-script-${handle}`
  }

  const removeScriptElmForHandle = scriptHandle => {
    const scriptId = scriptHandleToHTMLId(scriptHandle)
    const scriptElm = D.getElementById(scriptId)
    if (scriptElm === null) {
      return false
    }

    scriptElm.parentElement.removeChild(scriptElm)
    return true
  }

  const insertScriptElm = scriptElm => {
    const handle = Math.random().toString().split('.')[1]
    scriptElm.id = scriptHandleToHTMLId(handle)
    D.body.appendChild(scriptElm)
    return handle
  }

  const onMessage = async (action, msg) => {
    switch (action) {
      case 'script-inject::remove': {
        const handleId = msg.value
        const isScriptSuccessfullyRemoved = removeScriptElmForHandle(handleId)
        return { isSuccess: isScriptSuccessfullyRemoved }
      }

      case 'script-inject::url': {
        const scriptUrl = msg.value
        const scriptElm = D.createElement('script')
        scriptElm.src = scriptUrl
        const scriptHandle = insertScriptElm(scriptElm)
        return { handle: scriptHandle }
      }

      case 'script-inject::source': {
        const scriptText = msg.value
        const scriptElm = D.createElement('script')
        scriptElm.innerHTML = scriptText
        const scriptHandle = insertScriptElm(scriptElm)
        return { handle: scriptHandle }
      }
    }
  }
  BU.receivePostMsg(onMessage)
})()
