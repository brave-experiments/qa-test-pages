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

  const onClick = _ => {
    startBtn.setAttribute('disabled', 'disabled')
    const idsToInsert = idTextArea.value.trim().split('\n')
    idTextArea.setAttribute('disabled', 'disabled')

    for (const aChildElm of tableBodyElm.childNodes) {
      tableBodyElm.removeChild(aChildElm)
    }

    const intervalId = W.setInterval(() => {
      const anIdToInsert = idsToInsert.pop()
      if (anIdToInsert === undefined) {
        W.clearInterval(intervalId)
        startBtn.removeAttribute('disabled')
        idTextArea.removeAttribute('disabled')
        return
      }
      addIdTest(anIdToInsert)
    }, 500)
  }
  startBtn.addEventListener('click', onClick)
  startBtn.removeAttribute('disabled')
  idTextArea.removeAttribute('disabled')
})()
