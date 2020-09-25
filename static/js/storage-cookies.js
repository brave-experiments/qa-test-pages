(_ => {
  const W = window

  const testImagePath = '/static/images/test.jpg'
  const testCases = [
    {
      case: 'first-party',
      urlFunc: W.BRAVE.thisOriginUrl,
      frame: document.querySelector('iframe.this-origin')
    },
    {
      case: 'third-party',
      urlFunc: W.BRAVE.otherOriginUrl,
      frame: document.querySelector('iframe.other-origin')
    }
  ]
  const testCookie = 'storage-test=exists'
  const setTestCookie = `${testCookie}; Expires=Wed, 21 Oct 2021 07:28:00 GMT; SameSite=None`
  const fetchOptions = {
    credentials: 'include'
  }

  const callbackRegistry = Object.create(null)
  const setMsgCallback = (key, callback) => {
    if (callbackRegistry[key] !== undefined) {
      throw `Already have a callback with id ${key} registered`
    }
    callbackRegistry[key] = callback
  }

  const onMessage = msg => {
    const { action, frameId, rs } = msg
    const callbackRegKey = `${frameId}::${action}`
    const callback = callbackRegistry[callbackRegKey]
    if (callback === undefined) {
      return
    }
    delete callbackRegistry[callbackRegKey]
    callback(rs)
  }
  W.addEventListener('message', onMessage, false)

  const isCookieInHttp = async (testCase) => {
    const result = await fetch(testCase.urlFunc(testImagePath), fetchOptions)
    const cookieValue = result.headers.get('Cookie')
    return cookieValue && cookieValue.includes('storage-test=exists')
  }

  const isCookieInJs = (testCase, callback) => {
    const action = 'read'
    const callbackRegKey = `${testCase.case}::${action}`
    setMsgCallback(callbackRegKey, callback)
    testCase.frame.contentWindow.postMessage({
      frameId: testCase.case,
      cookieValue: testCookie,
      action: action
    })
  }

  const setCookieInFrame = (testCase, callback) => {
    const action = 'set'
    const callbackRegKey = `${testCase.case}::${action}`
    setMsgCallback(callbackRegKey, callback)
    testCase.frame.contentWindow.postMessage({
      frameId: testCase.case,
      cookieValue: setTestCookie,
      action: action
    })
  }

  for (const testCase of testCases) {
    reports[testCase.case] = report
    report["is initially in http"] = await isCookieInHttp(testCase)
    isCookieInJs(testCase, readCookieRs => {
      report["is initially in js"] = readCookieRs
      setCookieInFrame(testCase, _ => {
        report["is after in http"] = await isCookieInHttp(testCase)
        isCookieInJs(testCase, rs => {
          report['is after in js'] = rs
        })
      })
    })
  }

})()