(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const testKey = 'network-state::request-otr'
  const testScript = '/network-state/static_js_combo_network-state-request-otr.js'
  const runComboTest = await BU.setupComboTest(testScript, {
    omitWorkers: true
  })

  const updateTable = async _ => {
    const testResults = await runComboTest('network-state::request-otr::read', {
      key: testKey
    })
    for (const [aTestName, aTestResult] of Object.entries(testResults)) {
      const codeElm = D.querySelector(`.cell-${aTestName} code`)
      codeElm.innerText = aTestResult
    }
  }

  const startBtnElm = D.getElementById('button-start-test')
  const onClick = async _ => {
    startBtnElm.setAttribute('disabled', 'disabled')
    await runComboTest('network-state::request-otr::write', {
      key: testKey,
      value: (new Date()).toString()
    })

    await updateTable()
    startBtnElm.removeAttribute('disabled')
  }

  // First populate the initial state of storage, before we let the tester
  // interact with the page.
  await updateTable()

  startBtnElm.removeAttribute('disabled')
  startBtnElm.addEventListener('click', onClick)
})()
