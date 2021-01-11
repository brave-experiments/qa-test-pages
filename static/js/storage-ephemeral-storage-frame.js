(_ => {
  const W = window
  const C = W.Cookies
  const exceptionEncoding = '*exception*'

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
      W.localStorage.clear(key)
      result['local-storage'] = true
    } catch (_) {
      result['local-storage'] = exceptionEncoding
    }

    try {
      W.sessionStorage.clear(key)
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
        C.set(key, value)
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

  const onMessage = msg => {
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

      default:
        console.log(`unexpected action ${payload.action}`)
        return
    }

    msg.source.postMessage(response, '*')
  }

  W.addEventListener('message', onMessage, false)
})()
