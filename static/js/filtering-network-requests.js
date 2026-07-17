(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  // Unique per-load token so reloads re-request (not cache-served, which hides blocking).
  for (const img of D.querySelectorAll('img')) {
    const token = Date.now().toString(36) + Math.random().toString(36).slice(2)
    img.src = img.src.split('?')[0] + '?' + token
  }

  const startBtn = D.getElementById('button-start-test')

  const testScript = '/filtering/static_js_combo_filtering-network-requests.js'
  const runComboTest = await BU.setupComboTest(testScript)

  const onClick = async _ => {
    startBtn.setAttribute('disabled', 'disabled')

    const testRowElms = D.querySelectorAll('[data-test-origin]')
    for (const aRowElm of testRowElms) {
      const originTestCase = aRowElm.dataset.testOrigin
      const urlTestCase = aRowElm.dataset.testCase
      const testResults = await runComboTest('filtering::network-requests::read', {
        originTestCase,
        urlTestCase
      })
      for (const [aTestName, aTestResult] of Object.entries(testResults)) {
        const codeElm = aRowElm.querySelector(`.col-${aTestName} code`)
        codeElm.innerText = aTestResult ? 'blocked' : 'loaded'
      }
    }
  }

  startBtn.removeAttribute('disabled')
  startBtn.addEventListener('click', onClick)
})()
