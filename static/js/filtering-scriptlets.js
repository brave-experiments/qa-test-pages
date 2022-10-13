(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const frameMapping = {
    'this-frame': W,
    'local-frame': D.querySelector('iframe.this-origin').contentWindow,
    'remote-frame': D.querySelector('iframe.other-origin').contentWindow
  }

  const makeResultSpan = (exists, isError) => {
    const spanElm = D.createElement('span')
    spanElm.className = 'badge badge-pill '
    spanElm.className += isError ? 'badge-error' : 'badge-primary'
    spanElm.innerText = exists ? 'true' : 'null'
    return spanElm
  }

  const testRows = D.querySelectorAll('tr[data-property]')
  for (const aTestRow of testRows) {
    const testProp = aTestRow.dataset.property
    const testMsg = 'filtering-scriptlets::read'
    for (const [aFrameLabel, aFrame] of Object.entries(frameMapping)) {
      const isPropTrue = await BU.sendPostMsg(aFrame, testMsg, {
        path: testProp.split('.')
      })
      const testCell = D.querySelector(`tr[data-property=${testProp}] td.${aFrameLabel}`)
      testCell.appendChild(makeResultSpan(isPropTrue, !isPropTrue))
    }
  }
})()
