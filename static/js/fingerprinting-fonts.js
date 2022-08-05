(_ => {
  const W = window
  const D = W.document

  const testString = 'mmmmmmmmmmlli'

  const btnElm = D.getElementById('start')
  const fontTestSections = D.getElementsByClassName('font-test')
  const testsCases = ['control-section', 'test-section']

  for (const aTestSection of fontTestSections) {
    const preElm = aTestSection.getElementsByTagName('pre')[0]
    const styleElm = aTestSection.getElementsByTagName('style')[0]
    preElm.innerText = styleElm.outerHTML
  }

  const runTest = (fontTestSectionElm, testCaseName) => {
    const testSpanElm = fontTestSectionElm.querySelector(`.${testCaseName} span.badge`)
    const testCodeElm = fontTestSectionElm.querySelector(`.${testCaseName} code`)

    testSpanElm.innerText = testString
    testCodeElm.innerText = testSpanElm.offsetWidth
  }

  const onClick = _ => {
    btnElm.setAttribute('disabled', true)
    for (const aTestSectionElm of fontTestSections) {
      for (const aTestCase of testsCases) {
        runTest(aTestSectionElm, aTestCase)
      }
    }
    btnElm.removeAttribute('disabled')
  }
  btnElm.addEventListener('click', onClick, false)

  btnElm.removeAttribute('disabled')
})()
