(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const testIterations = 100

  const startButtonElm = D.getElementById('button-start-test')

  const testElms = D.querySelectorAll('section.frame-test')
  const testSelectionMapping = Object.create(null)
  for (const anElm of testElms) {
    testSelectionMapping[anElm.dataset.test] = anElm
  }

  await BU.insertTestFramesWithScript(['/static/js/frames/dom-properties-performance.js'])

  const addResultToElm = (elm, result) => {
    const spanElm = D.createElement('span')
    spanElm.classList.add('badge')
    spanElm.classList.add('badge-pill')
    spanElm.innerText = result
    const isSuccess = result === parseInt(result, 10)
    spanElm.classList.add(isSuccess ? 'badge-success' : 'badge-danger')
    elm.appendChild(spanElm)
    return isSuccess
  }

  const onClick = async event => {
    startButtonElm.setAttribute('disabled', 'disabled')
    for (const [frameDesc, frameWin] of BU.getTestWindowNamesAndValues()) {
      const sectionElm = testSelectionMapping[frameDesc]
      const alertElm = sectionElm.querySelector('div.alert')
      const resultsElm = sectionElm.querySelector('div.results')
      alertElm.classList.remove('d-none')
      alertElm.innerText = 'Running test'

      let numTests = 0
      let isOverAllSuccess = true
      while (numTests < testIterations) {
        const rs = await BU.sendPostMsg(frameWin, 'dom-properties-performance::read')
        const isSuccess = addResultToElm(resultsElm, rs)
        isOverAllSuccess = isOverAllSuccess && isSuccess
        numTests += 1
      }

      alertElm.classList.remove('alert-secondary')
      if (isOverAllSuccess) {
        alertElm.classList.add('alert-success')
        alertElm.innerText = 'Test succeeded'
      } else {
        alertElm.classList.add('alert-danger')
        alertElm.innerText = 'Test failed'
      }
    }
    startButtonElm.removeAttribute('disabled')
  }
  startButtonElm.addEventListener('click', onClick, false)
  startButtonElm.removeAttribute('disabled')
})()
