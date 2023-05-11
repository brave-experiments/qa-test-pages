(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const startBtn = D.getElementById('button-start-test')
  const idTextArea = D.getElementById('css-ids-text-area')

  const tableBodyElm = D.querySelector('tbody')

  let isFirstPartyCase = false

  const addIdTest = idName => {
    const rowElm = D.createElement('tr')

    const idCell = D.createElement('th')
    idCell.scope = 'row'
    const codeElm = D.createElement('code')
    codeElm.innerText = idName

    idCell.appendChild(codeElm)
    rowElm.appendChild(idCell)

    let createOriginFunc
    let cellLabel
    if (isFirstPartyCase) {
      createOriginFunc = BU.thisOriginUrl
      cellLabel = 'first'
    } else {
      createOriginFunc = BU.otherOriginUrl
      cellLabel = 'third'
    }
    isFirstPartyCase = !isFirstPartyCase

    const labelCellElm = D.createElement('td')
    labelCellElm.innerText = cellLabel

    const imgCellElm = D.createElement('td')

    const divElm = D.createElement('div')
    divElm.setAttribute('id', idName.slice(1))
    const imgElm = D.createElement('img')
    imgElm.src = createOriginFunc('/static/images/brave-favicon.png')

    divElm.appendChild(imgElm)
    imgCellElm.appendChild(divElm)
    rowElm.appendChild(labelCellElm)
    rowElm.appendChild(imgCellElm)

    tableBodyElm.prepend(rowElm)
  }

  const setupBtnAsStartBtn = btn => {
    btn.classList.add('btn-primary')
    btn.classList.remove('btn-warning')
    btn.innerText = btn.dataset.initText
  }

  const setupBtnAsStopBtn = btn => {
    btn.classList.remove('btn-primary')
    btn.classList.add('btn-warning')
    startBtn.innerText = 'Stop test'
  }

  let timeoutIntervalId
  const stopTheTest = _ => {
    W.clearInterval(timeoutIntervalId)
    timeoutIntervalId = undefined
  }

  const onClick = event => {
    const btnElm = event.target
    const isTestRunning = timeoutIntervalId !== undefined

    if (isTestRunning === false) {
      setupBtnAsStopBtn(btnElm)

      for (const aChildElm of Array.from(tableBodyElm.childNodes)) {
        tableBodyElm.removeChild(aChildElm)
      }

      const idsToInsert = idTextArea.value.trim().split('\n')
      idTextArea.setAttribute('disabled', 'disabled')

      timeoutIntervalId = W.setInterval(_ => {
        if (timeoutIntervalId === undefined) {
          // test was already cancelled.
          return
        }
        const anIdToInsert = idsToInsert.pop()
        if (anIdToInsert === undefined) {
          stopTheTest()
          setupBtnAsStartBtn(btnElm)
          return
        }
        addIdTest(anIdToInsert)
      }, 500)
      return
    }

    // Otherwise, we received a click to stop the test, so we set up
    // the button to be a "start the test" button, and stop the currently
    // running test.
    setupBtnAsStartBtn(btnElm)
    stopTheTest()
  }
  startBtn.addEventListener('click', onClick)
  startBtn.dataset.initText = startBtn.innerText
  startBtn.removeAttribute('disabled')
  idTextArea.removeAttribute('disabled')
})()
