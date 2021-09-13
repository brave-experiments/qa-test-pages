(async _ => {
  const W = window
  const D = document
  const isDebug = false

  const braveSoftwareOrigin = 'dev-pages.bravesoftware.com'
  const braveSoftwareComOrigin = 'dev-pages.brave.software'

  const thisOrigin = document.location.host
  const bodyElm = document.body
  let otherOrigin

  const showElementsWithClass = className => {
    const elementsWithClassName = D.getElementsByClassName(className)
    for (const elm of elementsWithClassName) {
      elm.style.display = 'block'
    }
  }

  switch (thisOrigin) {
    case braveSoftwareOrigin:
      otherOrigin = braveSoftwareComOrigin
      bodyElm.className += ' brave-software-com'
      showElementsWithClass('show-on-brave-software-com')
      break

    case braveSoftwareComOrigin:
    default: // Test server configs
      otherOrigin = braveSoftwareOrigin
      bodyElm.className += ' brave-software'
      showElementsWithClass('show-on-brave-software')
      break
  }

  const classToOrigin = {
    'other-origin': otherOrigin,
    'this-origin': thisOrigin
  }

  for (const [aClass, anOrigin] of Object.entries(classToOrigin)) {
    const elms = D.getElementsByClassName(aClass)
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

  const objectToSerializableObject = rs => {
    try {
      return JSON.parse(JSON.stringify(rs))
    } catch (_) {
      try {
        return rs.toString()
      } catch (_) {
        const stringSafeRs = Object.create(null)
        for (const [key, value] of Object.items(rs)) {
          stringSafeRs[key] = String(value)
        }
        return JSON.parse(JSON.stringify(stringSafeRs))
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

  const thisOriginUrlInsecure = path => {
    return 'http:' + thisOriginUrl(path)
  }

  const thisOriginUrlSecure = path => {
    return 'https:' + thisOriginUrl(path)
  }

  const otherOriginUrl = path => {
    return '//' + otherOrigin + path
  }

  const switchOriginElm = D.querySelector('.breadcrumb .other-origin')
  // Frames will run this code, but not have breadcrumbs or links
  if (switchOriginElm) {
    switchOriginElm.href = otherOriginUrl(W.location.pathname)
  }

  const sendPostMsg = async (windowElm, action, msg) => {
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

        resolve(payload)
      }
      W.addEventListener('message', onResponseCallback, false)

      const outMsg = {
        nonce: messageNonce,
        payload: msg,
        direction: 'sending',
        action
      }
      windowElm.postMessage(outMsg, '*')
    })
  }

  const receivePostMsg = async handler => {
    const onMessage = async msg => {
      const { action, payload, direction, nonce } = msg.data
      if (direction !== 'sending') {
        return
      }

      const receivedResult = await handler(action, payload)

      if (receivedResult === undefined) {
        logger(`No result for action: ${action}`)
        return
      }

      const response = {
        direction: 'response',
        payload: objectToSerializableObject(receivedResult),
        nonce
      }

      msg.source.postMessage(response, '*')
    }

    W.addEventListener('message', onMessage, false)
  }

  if (W.isSecureContext === false) {
    D.location = 'https:' + thisOriginUrl(D.location.pathname)
  }

  // Frequently we have three window's we want to run tests against,
  // the local window, a frame with the same origin, and a remote frame.
  // Instead of copy-pasting so much, make a fail-friendly guess here.
  const getFrameMapping = (_ => {
    const frameMapping = Object.create(null)
    let hasFired = false
    return _ => {
      if (hasFired === true) {
        return frameMapping
      }
      const localFrame = D.querySelector('iframe.this-origin')
      const remoteFrame = D.querySelector('iframe.other-origin')
      frameMapping['this-frame'] = W
      frameMapping['local-frame'] = localFrame?.contentWindow
      frameMapping['remote-frame'] = remoteFrame?.contentWindow
      hasFired = true
      return frameMapping
    }
  })()

  const getTestWindow = windowRefName => {
    return getFrameMapping()[windowRefName]
  }

  const getTestWindowNamesAndValues = _ => {
    return Object.entries(getFrameMapping())
  }

  let hasInjectedFrames = false
  const _insertTestFrames = async (frameUrl, scriptUrls) => {
    if (hasInjectedFrames === true) {
      throw new Error('Cannot call "insertTestFrames" twice on the same page.')
    }
    hasInjectedFrames = true

    const allFramesLoadedPromiseHandler = (resolve) => {
      let numFramesLoaded = 0
      const onFrameLoad = async event => {
        const iframeElm = event.target
        if (scriptUrls !== undefined) {
          for (const aUrl of scriptUrls) {
            await sendPostMsg(iframeElm.contentWindow, 'script-inject::url', {
              value: aUrl
            })
          }
        }
        numFramesLoaded += 1
        if (numFramesLoaded === 1) {
          return resolve()
        }
      }

      const frameClassToFuncMap = {
        'this-origin': thisOriginUrl,
        'other-origin': otherOriginUrl
      }

      for (const [frameClass, urlFunc] of Object.entries(frameClassToFuncMap)) {
        const frameElm = D.createElement('iframe')
        frameElm.addEventListener('load', onFrameLoad, false)
        frameElm.classList.add(frameClass)
        frameElm.src = urlFunc(frameUrl)
        frameElm.style.display = 'none'
        D.body.appendChild(frameElm)
      }
    }

    return new Promise(allFramesLoadedPromiseHandler)
  }

  const insertTestFrames = async frameUrl => {
    return await _insertTestFrames(frameUrl)
  }

  const insertTestFramesWithScript = async scriptUrls => {
    return await _insertTestFrames('/frames/script-injection.html', scriptUrls)
  }

  W.BRAVE = {
    getTestWindow,
    getTestWindowNamesAndValues,
    insertTestFrames,
    insertTestFramesWithScript,
    logger,
    thisOriginUrl,
    thisOriginUrlInsecure,
    thisOriginUrlSecure,
    otherOriginUrl,
    sendPostMsg,
    receivePostMsg
  }
})()
