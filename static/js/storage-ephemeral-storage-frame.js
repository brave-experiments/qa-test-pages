(_ => {
  const W = window
  const C = W.Cookies
  const exceptionEncoding = '*exception*'

  const clearStorage = key => {
    const result = Object.create(null)
    try {
      C.remove(key)
      result.cookies = true
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
      result.cookies = C.get(key)
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
      C.set(key, value)
      result.cookies = true
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
    const { nonce, data } = msg
    const response = { nonce }

    switch (data.action) {
      case 'storage::clear':
        response.data = clearStorage(data.key)
        break

      case 'storage::read':
        response.data = readStorageAction(data.key)
        break

      case 'storage::write':
        response.data = writeStorageAction(data.key, data.value)
        break

      default:
        return
    }

    W.postMessage(response, '*')
  }

  W.addEventListener('message', onMessage, false)
})()
