(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE
  const SW = W.navigator.serviceWorker

  await BU.insertTestFramesWithScript([
    '/static/js/frames/dom-properties-controlled.js'
  ])

  const workerScriptUrl = './static_js_service-workers_dom-properties-controlled.js'

  const testDomPropsInWin = async win => {
    return await BU.sendPostMsg(win, 'dom-properties::read')
  }

  const updateTestResults = (frameDesc, testDesc, testResults) => {
    const sel = `#row-${testDesc} .col-${frameDesc} code`
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
      for (const [testName, testValue] of Object.entries(msg.data.navigator)) {
        updateTestResults(workerType, testName, testValue)
      }
    }
  }

  const onClick = async event => {
    const elm = event.target
    const initialText = elm.textContent
    disablePage()
    elm.textContent = 'Running test'
    for (const [frameDesc, frameWin] of BU.getTestWindowNamesAndValues()) {
      const testRs = await testDomPropsInWin(frameWin)
      for (const [testName, testValue] of Object.entries(testRs)) {
        updateTestResults(frameDesc, testName, testValue)
      }
    }

    SW.controller.postMessage('read')

    const worker = new W.Worker(workerScriptUrl)
    worker.addEventListener('message', onWorkerMessage.bind(undefined, 'web-worker'))

    elm.textContent = initialText
    enablePage()
  }
  startButtonElm.addEventListener('click', onClick, false)

  SW.addEventListener('message', onWorkerMessage.bind(undefined, 'service-worker'))
  SW.ready.then(reg => {
    console.log(SW.controller)
    enablePage()
  })

  if (SW.controller !== null) {
    enablePage()
    return
  }

  await SW.register(workerScriptUrl)
})()
