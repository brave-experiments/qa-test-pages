(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const scriptsToInject = [
    '/static/js/frames/storage-dom-storage.js'
  ]
  await BU.insertTestFramesWithScript(scriptsToInject)

  const startButtonElm = D.getElementById('start-button')

  const onStartTest = async _ => {
    for (const [frameName, frameRef] of BU.getTestWindowNamesAndValues()) {
      for (const testRowElm of D.querySelectorAll('tr[data-method]')) {
        const method = testRowElm.dataset.method
        const rs = await BU.sendPostMsg(frameRef, 'dom-storage::test', method)
        const cellSel = `tr[data-method=${method}] td.${frameName}`

        const cellElm = D.querySelector(cellSel)
        cellElm.innerText = String(rs)
      }
    }
  }

  startButtonElm.addEventListener('click', onStartTest, false)
  startButtonElm.removeAttribute('disabled')
})()
