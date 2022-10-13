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
    const span = D.createElement('span')
    span.className = 'badge badge-pill '
    span.className += isError ? 'badge-error' : 'badge-primary'
    span.innerText = exists ? 'true' : 'null'
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
