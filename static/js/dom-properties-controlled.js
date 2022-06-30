(_ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const testDomPropsInWin = async win => {
    return await BU.sendPostMsg(win, 'dom-properties::read')
  }

  const updateTestResults = (frameDesc, testDesc, testResults) => {
    const sel = `#row-${testDesc} .col-${frameDesc} code`
    const elm = D.querySelector(sel)
    elm.textContent = testResults.toString()
  }

  const startButtonElm = D.getElementById('button-start-test')
  const onClick = async event => {
    const elm = event.target
    const initialText = elm.textContent
    elm.setAttribute('disabled', 'disabled')
    elm.textContent = 'Running test'
    for (const [frameDesc, frameWin] of BU.getTestWindowNamesAndValues()) {
      const testRs = await testDomPropsInWin(frameWin)
      for (const [testName, testValue] of Object.entries(testRs)) {
        updateTestResults(frameDesc, testName, testValue)
      }
    }
    elm.textContent = initialText
    elm.removeAttribute('disabled')
  }
  startButtonElm.addEventListener('click', onClick, false)
})()
