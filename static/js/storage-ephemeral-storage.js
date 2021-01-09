(async _ => {
  const W = window
  const D = W.document
  const braveUtils = W.BRAVE
  const exceptionEncoding = '*exception*'

  const storageSettingSelect = D.getElementById('ephemeral-storage-setting')
  const cookieBlockingSelect = D.getElementById('cookie-blocking-setting')

  const expectedOutcomeRows = {
    initial: D.getElementById('row-initial-case'),
    'remote-page': D.getElementById('row-remote-page-case'),
    'same-page-session': D.getElementById('row-same-page-session-case'),
    'new-page-session': D.getElementById('row-new-page-session-case')
  }

  const expectedOutcomeTableValues = {
    SET: 0,
    EMPTY: 1,
    EXCEPTION: 2,
    WRONG: 4
  }

  const tableRowNames = [
    'row-cookies',
    'row-local-storage',
    'row-session-storage'
  ]
  const tableColNames = [
    'cell-this-frame',
    'cell-local-frame',
    'cell-remote-frame'
  ]

  const eotv = expectedOutcomeTableValues
  const expectedOutcomes = {
    initial: {
      on: {
        '3p': [eotv.SET, eotv.SET, eotv.SET],
        all: [eotv.EXCEPTION, eotv.EXCEPTION, eotv.EXCEPTION]
      },
      off: {
        '3p': [eotv.SET, eotv.SET, eotv.EXCEPTION],
        all: [eotv.EXCEPTION, eotv.EXCEPTION, eotv.EXCEPTION]
      }
    },
    'remote-page': {
      on: {
        '3p': [eotv.EMPTY, eotv.EMPTY, eotv.EMPTY],
        all: [eotv.EXCEPTION, eotv.EXCEPTION, eotv.EXCEPTION]
      },
      off: {
        '3p': [eotv.EMPTY, eotv.EMPTY, eotv.EXCEPTION],
        all: [eotv.EXCEPTION, eotv.EXCEPTION, eotv.EXCEPTION]
      }
    },
    'same-page-session': {
      on: {
        '3p': [eotv.SET, eotv.SET, eotv.SET],
        all: [eotv.EXCEPTION, eotv.EXCEPTION, eotv.EXCEPTION]
      },
      off: {
        '3p': [eotv.SET, eotv.EMPTY, eotv.EXCEPTION],
        all: [eotv.EXCEPTION, eotv.EXCEPTION, eotv.EXCEPTION]
      }
    },
    'new-page-session': {
      on: {
        '3p': [eotv.SET, eotv.SET, eotv.EMPTY],
        all: [eotv.EXCEPTION, eotv.EXCEPTION, eotv.EXCEPTION]
      },
      off: {
        '3p': [eotv.SET, eotv.SET, eotv.EXCEPTION],
        all: [eotv.EXCEPTION, eotv.EXCEPTION, eotv.EXCEPTION]
      }
    }
  }

  const resultCellStyles = Object.create(null)
  resultCellStyles[eotv.SET] = {
    class: 'bg-success',
    text: 'success',
    abbr: 'S'
  }
  resultCellStyles[eotv.EMPTY] = {
    class: 'bg-light',
    text: 'empty',
    abbr: 'C'
  }
  resultCellStyles[eotv.EXCEPTION] = {
    class: 'bg-warning',
    text: 'exception',
    abbr: 'E'
  }
  resultCellStyles[eotv.WRONG] = {
    class: 'bg-danger',
    text: 'wrong',
    abbr: 'W'
  }

  const styleCellForExpectedValue = (cellElm, val) => {
    const cellStyle = resultCellStyles[val]
    cellElm.classList.remove('bg-success', 'bg-light', 'bg-warning',
      'bg-danger')
    cellElm.textContent = cellStyle.abbr
    cellElm.classList.add(cellStyle.class)
  }

  const updateOutcomeTables = _ => {
    const storageVal = storageSettingSelect.value
    const cookieVal = cookieBlockingSelect.value

    for (const [rowName, rowElm] of Object.entries(expectedOutcomeRows)) {
      const tableSelector = '#' + rowElm.id + ' table'
      const tableElm = rowElm.querySelector(tableSelector)
      const expectedForRow = expectedOutcomes[rowName][storageVal][cookieVal]
      for (const tRowName of tableRowNames) {
        const rowSelector = tableSelector + ' tr.' + tRowName
        const tRowElm = tableElm.querySelector(rowSelector)
        for (const [index, tColName] of Object.entries(tableColNames)) {
          const cellSelector = rowSelector + ' td.' + tColName
          const cellElm = tRowElm.querySelector(cellSelector)
          const expectedVal = expectedForRow[index]
          styleCellForExpectedValue(cellElm, expectedVal)
        }
      }
    }
  }

  storageSettingSelect.addEventListener('change', updateOutcomeTables, false)
  cookieBlockingSelect.addEventListener('change', updateOutcomeTables, false)
  updateOutcomeTables()

  const possibleNewStorageValue = D.location.href + '::' + (+Math.random())
  const storageTestKey = 'brave-ephemeral-storage-test'
  let storageTestValue
  let isStorageEnabled = false
  try {
    storageTestValue = W.localStorage[storageTestKey]
    isStorageEnabled = true
  } catch (_) {}

  if (!storageTestValue && isStorageEnabled) {
    storageTestValue = possibleNewStorageValue
    W.localStorage[storageTestKey] = storageTestValue
  }

  const testFrameWindows = {
    'this-frame': W,
    'local-frame': D.querySelector('iframe.this-origin').contentWindow,
    'remote-frame': D.querySelector('iframe.other-origin').contentWindow
  }

  const updateResultCell = (cellElm, val) => {
    let cellComparison
    if (val === exceptionEncoding) {
      cellComparison = expectedOutcomeTableValues.EXCEPTION
    } else if (val === storageTestValue) {
      cellComparison = expectedOutcomeTableValues.SET
    } else if (val) {
      cellComparison = expectedOutcomeTableValues.EMPTY
    } else {
      cellComparison = expectedOutcomeTableValues.WRONG
    }
    const cellStyle = resultCellStyles[cellComparison]
    cellElm.classList.remove('bg-success', 'bg-light', 'bg-warning',
      'bg-danger')

    cellElm.textContent = cellStyle.text
    cellElm.classList.add(cellStyle.class)
  }

  const readStorageInFrame = async frameElm => {
    return await braveUtils.simplePostMessage(frameElm, {
      action: 'storage::read',
      key: storageTestKey
    })
  }

  const updateStorageTable = async _ => {
    for (const [frameName, frameElm] of Object.entries(testFrameWindows)) {
      const frameStorageVals = await readStorageInFrame(frameElm)
      for (const [storageKey, storageValue] of frameStorageVals) {
        const cellSel = `#storage-rs tr.row-${storageKey} td.cell-${frameName}`
        const cellElm = D.querySelector(cellSel)
        updateResultCell(cellElm, storageValue)
      }
    }
  }

  const clearStorageInFrame = async frameElm => {
    await braveUtils.simplePostMessage(frameElm, {
      action: 'storage::clear',
      key: storageTestKey
    })
  }

  const writeStorageInFrame = async (frameElm, value) => {
    const msg = {
      action: 'storage::write',
      key: storageTestKey,
      value
    }
    return await braveUtils.simplePostMessage(frameElm, msg)
  }

  const clearStorageButton = D.getElementById('button-clean-up')
  const setStorageButton = D.getElementById('button-start-test')
  const readValuesButton = D.getElementById('button-read-values')
  const buttonElms = [clearStorageButton, setStorageButton, readValuesButton]

  const freezeButtons = _ => {
    for (const buttonElm of buttonElms) {
      buttonElm.setAttribute('disabled', 'disabled')
    }
  }

  const unfreezeButtons = _ => {
    for (const buttonElm of buttonElms) {
      buttonElm.removeAttribute('disabled')
    }
  }

  clearStorageButton.addEventListener('click', async _ => {
    freezeButtons()
    for (const aFrame of Object.values(testFrameWindows)) {
      await clearStorageInFrame(aFrame)
    }
    await updateStorageTable()
    unfreezeButtons()
  }, false)

  setStorageButton.addEventListener('click', async _ => {
    freezeButtons()
    for (const aFrame of Object.values(testFrameWindows)) {
      await writeStorageInFrame(aFrame, storageTestValue)
    }
    await updateStorageTable()
    unfreezeButtons()
  }, false)

  readValuesButton.addEventListener('click', async _ => {
    freezeButtons()
    await updateStorageTable()
    unfreezeButtons()
  }, false)
})()
