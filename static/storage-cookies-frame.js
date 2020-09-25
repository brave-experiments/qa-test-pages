(_ => {

  const isCookieSet = cookieName => {
    try {
      return document.cookie.includes(cookieName)
    } catch (_) {
      return false
    }
  }

  const setCookie = cookieValue => {
    document.cookie = cookieValue
    return String(document.cookie)
  }

  const onMessage = msg => {
    const frameId = msg.data.frameId
    const cookieValue = msg.data.cookieValue

    switch (msg.data.action) {
      case 'read':
        const rs = isCookieSet(cookieValue)
        msg.source.postMessage({
          action: msg.data.action,
          frameId: frameId,
          rs: rs
        }, '*')
        return

      case 'set':
        const rs = setCookie(cookieValue)
        msg.source.postMessage({
          action: msg.data.action,
          frameId: frameId,
          rs: rs
        }, '*')
        return
    }
  }
})