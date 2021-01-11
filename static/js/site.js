(async _ => {
  const W = window
  const isDebug = false

  const braveSoftwareOrigin = 'dev-pages.bravesoftware.com'
  const braveSoftwareComOrigin = 'dev-pages.brave.software'

  const thisOrigin = document.location.host
  const bodyElm = document.body
  let otherOrigin

  switch (thisOrigin) {
    case braveSoftwareOrigin:
      otherOrigin = braveSoftwareComOrigin
      bodyElm.className += ' brave-software-com'
      break

    case braveSoftwareComOrigin:
    default: // Test server configs
      otherOrigin = braveSoftwareOrigin
      bodyElm.className += ' brave-software'
      break
  }

  const classToOrigin = {
    'other-origin': otherOrigin,
    'this-origin': thisOrigin
  }

  for (const [aClass, anOrigin] of Object.entries(classToOrigin)) {
    const elms = document.getElementsByClassName(aClass)
    for (const elm of elms) {
      const elmTagName = elm.tagName.toLowerCase()
      switch (elmTagName) {
        case 'iframe':
        case 'img':
        case 'script':
          elm.src = '//' + anOrigin + elm.dataset.src
          break

        case 'a':
          elm.href = '//' + anOrigin + elm.dataset.href
          break

        default:
          elm.textContent = anOrigin
          break
      }
    }
  }

  const logger = msg => {
    if (isDebug !== true) {
      return
    }
    console.log(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }

  const thisOriginUrl = path => {
    return '//' + thisOrigin + path
  }

  const otherOriginUrl = path => {
    return '//' + otherOrigin + path
  }

  const simplePostMessage = async (windowElm, msg) => {
    return new Promise((resolve) => {
      const messageNonce = Math.random().toString()
      const onResponseCallback = response => {
        const { nonce, direction, payload } = response.data
        if (direction !== 'response') {
          return
        }
        if (nonce !== messageNonce) {
          return
        }
        W.removeEventListener('message', onResponseCallback)

        console.log(`resolving with: ${JSON.stringify(payload)}`)
        resolve(payload)
      }
      W.addEventListener('message', onResponseCallback, false)

      const outMsg = {
        nonce: messageNonce,
        payload: msg,
        direction: 'sending'
      }
      windowElm.postMessage(outMsg, '*')
    })
  }

  W.BRAVE = {
    logger,
    thisOriginUrl,
    otherOriginUrl,
    simplePostMessage
  }
})()
