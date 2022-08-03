(_ => {
  const W = window
  const D = W.document

  const btnElm = D.getElementById('start')
  const preElm = D.getElementsByTagName('pre')[0]
  const styleElm = D.getElementById('src-local-style')

  const testString = 'mmmmmmmmmmlli'
  const tests = ['control-section', 'test-section']

  preElm.innerText = styleElm.outerHTML

  const runTest = testId => {
    const testSpanElm = D.querySelector(`#${testId} span.badge`)
    const testCodeElm = D.querySelector(`#${testId} code`)

    testSpanElm.innerText = testString
    testCodeElm.innerText = testSpanElm.offsetWidth
  }

  const onClick = _ => {
    btnElm.setAttribute('disabled', true)
    for (const aSectionId of tests) {
      runTest(aSectionId)
    }
    btnElm.removeAttribute('disabled')
  }
  btnElm.addEventListener('click', onClick, false)

  btnElm.removeAttribute('disabled')
})()
