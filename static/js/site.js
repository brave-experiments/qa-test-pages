/* eslint-env worker,serviceworker */

(async _ => {
  const W = self
  const isFrame = !W.importScripts

  let D, SW, bodyElm
  if (isFrame) {
    D = W.document
    SW = W.navigator.serviceWorker
    bodyElm = D.body
  }

  const isDebug = false

  const braveSoftwareOrigin = 'dev-pages.bravesoftware.com'
  const braveSoftwareComOrigin = 'dev-pages.brave.software'

  const thisOrigin = W.location.host
  const onlyLocal = W.location.protocol === 'http:'
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
      if (isFrame) {
        bodyElm.className += ' brave-software-com'
        showElementsWithClass('show-on-brave-software-com')
      }
      break

    case braveSoftwareComOrigin:
    default: // Test server configs
      otherOrigin = braveSoftwareOrigin
      if (isFrame) {
        bodyElm.className += ' brave-software'
        showElementsWithClass('show-on-brave-software')
      }
      break
  }

  const classToOrigin = {
    'other-origin': otherOrigin,
    'this-origin': thisOrigin
  }

  if (isFrame) {
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

  const thisOriginUrl = (path) => {
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

  if (isFrame) {
    const switchOriginElm = D.querySelector('.breadcrumb .other-origin')
    // Frames will run this code, but not have breadcrumbs or links
    if (switchOriginElm) {
      switchOriginElm.href = otherOriginUrl(W.location.pathname)
    }
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
      if (onlyLocal === false) {
        frameMapping['remote-frame'] = remoteFrame?.contentWindow
      }
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
          await sendPostMsg(iframeElm.contentWindow, 'script-inject::url', {
            value: scriptUrls
          })
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
        if (onlyLocal === true && frameClass === 'other-origin') {
          continue
        }
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

  // A "combo" test here means one where we're testing all three frame
  // cases and workers with a single API.
  const setupComboTest = async (script, options = {}) => {
    const { omitSW, omitWorkers, omitWW } = options
    await insertTestFramesWithScript([
      '/static/js/site-combo-callee.js',
      script
    ])

    // Keep track of all the tests we have running at once, so we can know when
    // all 5 cases have been completed.
    const testMap = new WeakMap()
    let numTests = 0

    const onTestResponse = (msg) => {
      const { request, response } = msg.data
      const { handleName, testId } = request
      const testRecord = testMap[testId]
      testRecord.data[handleName] = response
      testRecord.count += 1

      if (testRecord.count === numTests) {
        testMap.delete(testId)
        testRecord.resolve(testRecord.data)
      }
    }

    const frameNamesAndHandles = getTestWindowNamesAndValues()
    const testHandles = {}
    for (const [handleName, handle] of frameNamesAndHandles) {
      testHandles[handleName] = handle
    }

    if (omitWW !== true && omitWorkers !== true) {
      const worker = new W.Worker(script)
      worker.addEventListener('message', onTestResponse)
      testHandles['web-worker'] = worker
    }

    const runTest = (action, args) => {
      return new Promise(resolve => {
        const testId = Math.random()
        const testResults = {
          count: 0,
          data: {},
          resolve
        }
        testMap[testId] = testResults

        for (const [handleName, handle] of Object.entries(testHandles)) {
          const request = {
            handleName,
            action,
            args,
            testId
          }
          if (handleName.endsWith('-frame')) {
            sendPostMsg(handle, action, request).then(onTestResponse)
          } else {
            handle.postMessage(request)
          }
        }
      })
    }

    if (omitSW === true || omitWorkers === true) {
      numTests = Object.values(testHandles).length
      return runTest
    }

    testHandles['service-worker'] = SW.controller
    numTests = Object.values(testHandles).length

    return new Promise(resolve => {
      SW.addEventListener('message', onTestResponse)
      SW.ready.then(_ => resolve(runTest))
      if (SW.controller !== null) {
        resolve(runTest)
      }
      SW.register(script)
    })
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
    receivePostMsg,
    getFrameMapping,
    setupComboTest
  }
})()
