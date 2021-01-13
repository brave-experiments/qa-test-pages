(_ => {
  const W = window
  const C = W.Cookies
  const D = W.document
  const BU = W.BRAVE
  const exceptionEncoding = '*exception*'

  const isImmediateRemoteChildFrame = _ => {
    // If we're the top document, were clearly not a child frame
    if (W.top === W) {
      return false
    }
    // If our parent isn't the top document, we're too nested so can't
    // be the immediate remote child frame.
    if (W.top !== W.parent) {
      return false
    }
    // Last, see if we're remote by seeing if we trigger a SOP violation
    // by reading the location of the parent.
    try {
      if (window.parent.location.href) {}
      return false
    } catch (_) {
      return true
    }
  }

  const clearStorage = key => {
    const result = Object.create(null)
    try {
      if (W.navigator.cookieEnabled === false) {
        result.cookies = exceptionEncoding
      } else {
        C.remove(key)
        result.cookies = true
      }
    } catch (_) {
      result.cookies = exceptionEncoding
    }

    try {
      W.localStorage.removeItem(key)
      result['local-storage'] = true
    } catch (_) {
      result['local-storage'] = exceptionEncoding
    }

    try {
      W.sessionStorage.removeItem(key)
      result['session-storage'] = true
    } catch (_) {
      result['session-storage'] = exceptionEncoding
    }

    return result
  }

  const readStorageAction = key => {
    const result = Object.create(null)
    try {
      if (W.navigator.cookieEnabled === false) {
        result.cookies = exceptionEncoding
      } else {
        const readCookieValue = C.get(key)
        result.cookies = readCookieValue === undefined ? null : readCookieValue
      }
    } catch (_) {
      result.cookies = exceptionEncoding
    }

    try {
      result['local-storage'] = W.localStorage.getItem(key)
    } catch (_) {
      result['local-storage'] = exceptionEncoding
    }

    try {
      result['session-storage'] = W.sessionStorage.getItem(key)
    } catch (_) {
      result['session-storage'] = exceptionEncoding
    }

    return result
  }

  const writeStorageAction = (key, value) => {
    const result = Object.create(null)
    try {
      if (W.navigator.cookieEnabled === false) {
        result.cookies = false
      } else {
        C.set(key, value, {
          secure: true,
          sameSite: 'None'
        })
        result.cookies = C.get(key) === value
      }
    } catch (_) {
      result.cookies = exceptionEncoding
    }

    try {
      W.localStorage.setItem(key, value)
      result['local-storage'] = true
    } catch (_) {
      result['local-storage'] = exceptionEncoding
    }

    try {
      W.sessionStorage.setItem(key, value)
      result['session-storage'] = true
    } catch (_) {
      result['session-storage'] = exceptionEncoding
    }

    return result
  }

  let nestedFrame
  if (isImmediateRemoteChildFrame() === true) {
    nestedFrame = D.createElement('iframe')
    D.body.appendChild(nestedFrame)
    nestedFrame.src = BU.otherOriginUrl(W.location.pathname)
  }

  const onMessage = async msg => {
    const payload = msg.data.payload
    if (msg.data.direction !== 'sending') {
      return
    }

    const response = {
      nonce: msg.data.nonce,
      direction: 'response'
    }

    switch (payload.action) {
      case 'storage::clear':
        response.payload = clearStorage(payload.key)
        break

      case 'storage::read':
        response.payload = readStorageAction(payload.key)
        break

      case 'storage::write':
        response.payload = writeStorageAction(payload.key, payload.value)
        break

      case 'storage::nested-frame':
        if (nestedFrame === undefined) {
          BU.logger(`unexpected storage::nested-frame: ${W.location.toString()}`)
          return
        }
        response.payload = await BU.simplePostMessage(nestedFrame.contentWindow, {
          action: 'storage::read',
          key: payload.key
        })
        break

      default:
        BU.logger(`unexpected action ${payload.action}`)
        return
    }

    msg.source.postMessage(response, '*')
  }

  W.addEventListener('message', onMessage, false)
})()
