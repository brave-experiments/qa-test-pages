(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE
  const SW = W.navigator.serviceWorker

  await BU.insertTestFramesWithScript([
    '/static/js/frames/fingerprinting-exceptions.js'
  ])

  const workerScriptUrl = './static_js_frames_fingerprinting-exceptions.js'

  const testInWindow = async (win, lang) => {
    return await BU.sendPostMsg(win, 'fingerprinting-exceptions::read', lang)
  }

  const updateTestResults = (frameDesc, testDesc, testResults) => {
    const sel = `#row-test-case-${testDesc} .col-${frameDesc} code`
    const elm = D.querySelector(sel)
    if (testResults === undefined || testResults === null) {
      elm.textContent = 'null'
    } else {
      elm.textContent = testResults.toString()
    }
  }

  const startButtonElm = D.getElementById('button-start-test')
  const enablePage = _ => {
    startButtonElm.removeAttribute('disabled')
  }
  const disablePage = _ => {
    startButtonElm.setAttribute('disabled', 'disabled')
  }

  const onWorkerMessage = (workerType, msg) => {
    if (msg.data.action === 'read') {
      for (const [testName, testValue] of Object.entries(msg.data.headers)) {
        updateTestResults(workerType, `${testName}-${msg.data.case}`, testValue)
      }
    }
  }

  const onClick = async event => {
    const elm = event.target
    const initialText = elm.textContent
    disablePage()
    elm.textContent = 'Running test'
    const langCases = {
      controlled: 'br-AVE',
      default: undefined
    }
    for (const [frameDesc, frameWin] of BU.getTestWindowNamesAndValues()) {
      for (const [langCaseName, langCaseVal] of Object.entries(langCases)) {
        const testRs = await testInWindow(frameWin, langCaseVal)
        for (const [testName, testValue] of Object.entries(testRs)) {
          updateTestResults(frameDesc, `${testName}-${langCaseName}`, testValue)
        }
      }
    }

    const worker = new W.Worker(workerScriptUrl)
    worker.addEventListener('message', onWorkerMessage.bind(undefined, 'web-worker'))

    for (const [langCaseName, langCaseVal] of Object.entries(langCases)) {
      const msg = {
        action: 'read',
        case: langCaseName,
        lang: langCaseVal
      }
      SW.controller.postMessage(msg)
      worker.postMessage(msg)
    }

    elm.textContent = initialText
    enablePage()
  }
  startButtonElm.addEventListener('click', onClick, false)

  SW.addEventListener('message', onWorkerMessage.bind(undefined, 'service-worker'))
  SW.ready.then(reg => {
    enablePage()
  })

  if (SW.controller !== null) {
    enablePage()
    return
  }

  await SW.register(workerScriptUrl)
})()
