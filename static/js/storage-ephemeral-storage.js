(async _ => {
  const W = window
  const D = W.document
  const L = D.location
  const BU = W.BRAVE
  const exceptionEncoding = '*exception*'

  const storageSettingSelect = D.getElementById('ephemeral-storage-setting')
  const cookieBlockingSelect = D.getElementById('cookie-blocking-setting')

  const testOutcomeEnum = {
    SET: 0,
    EMPTY: 1,
    EXCEPTION: 2,
    WRONG: 4
  }
  const testCasesEnum = {
    INITIAL: 'initial',
    REMOTE_PAGE: 'remote-page',
    SAME_PAGE_SAME_SESSION: 'same-page-session',
    SAME_PAGE_NEW_SESSION: 'new-page-session'
  }
  const ephemeralStorageEnum = {
    ON: 'on',
    OFF: 'off'
  }
  const cookieSettingEnum = {
    BLOCK_THIRD_PARTY: '3p',
    BLOCK_ALL: 'all',
    ALLOW_ALL: 'allow'
  }
  const frameCaseEnum = {
    CURRENT_FRAME: 0,
    LOCAL_FRAME: 1,
    REMOTE_FRAME: 2
  }
  const apiCaseEnum = {
    COOKIE: 0,
    LOCAL_STORAGE: 1,
    SESSION_STORAGE: 2
  }

  // If the value is a number (a testOutcomeEnum value) than
  // that is the expected value for every API in every frame case.
  //
  // If values are a flat array, then each entry describes
  // the current frame, a local frame, and the remote frame.
  //
  // If values are nested arrays, then each entry describes
  // {current frame, local frame, remote frame} x
  //   {cookie, localStorage, sessionStorage}
  const expectedOutcomes = {
    [testCasesEnum.INITIAL]: {
      [ephemeralStorageEnum.ON]: {
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: testOutcomeEnum.SET,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION,
        [cookieSettingEnum.ALLOW_ALL]: testOutcomeEnum.SET
      },
      [ephemeralStorageEnum.OFF]: {
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: {
          [frameCaseEnum.CURRENT_FRAME]: testOutcomeEnum.SET,
          [frameCaseEnum.LOCAL_FRAME]: testOutcomeEnum.SET,
          [frameCaseEnum.REMOTE_FRAME]: testOutcomeEnum.EXCEPTION
        },
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION,
        [cookieSettingEnum.ALLOW_ALL]: testOutcomeEnum.SET
      }
    },
    [testCasesEnum.REMOTE_PAGE]: {
      [ephemeralStorageEnum.ON]: {
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: testOutcomeEnum.EMPTY,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION,
        [cookieSettingEnum.ALLOW_ALL]: testOutcomeEnum.SET
      },
      [ephemeralStorageEnum.OFF]: {
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: {
          [frameCaseEnum.CURRENT_FRAME]: testOutcomeEnum.EMPTY,
          [frameCaseEnum.LOCAL_FRAME]: testOutcomeEnum.EMPTY,
          [frameCaseEnum.REMOTE_FRAME]: testOutcomeEnum.EXCEPTION
        },
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION,
        [cookieSettingEnum.ALLOW_ALL]: testOutcomeEnum.SET
      }
    },
    [testCasesEnum.SAME_PAGE_SAME_SESSION]: {
      [ephemeralStorageEnum.ON]: {
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: testOutcomeEnum.SET,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION,
        [cookieSettingEnum.ALLOW_ALL]: testOutcomeEnum.SET
      },
      [ephemeralStorageEnum.OFF]: {
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: {
          [frameCaseEnum.CURRENT_FRAME]: testOutcomeEnum.SET,
          [frameCaseEnum.LOCAL_FRAME]: testOutcomeEnum.SET,
          [frameCaseEnum.REMOTE_FRAME]: testOutcomeEnum.EXCEPTION
        },
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION,
        [cookieSettingEnum.ALLOW_ALL]: testOutcomeEnum.SET
      }
    },
    [testCasesEnum.SAME_PAGE_NEW_SESSION]: {
      [ephemeralStorageEnum.ON]: {
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: {
          [frameCaseEnum.CURRENT_FRAME]: {
            [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
            [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.SET,
            [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY
          },
          [frameCaseEnum.LOCAL_FRAME]: {
            [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
            [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.SET,
            [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY
          },
          [frameCaseEnum.REMOTE_FRAME]: {
            [apiCaseEnum.COOKIE]: testOutcomeEnum.EMPTY,
            [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.EMPTY,
            [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY
          }
        },
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION,
        [cookieSettingEnum.ALLOW_ALL]: testOutcomeEnum.SET
      },
      [ephemeralStorageEnum.OFF]: {
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: {
          [frameCaseEnum.CURRENT_FRAME]: {
            [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
            [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.SET,
            [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY
          },
          [frameCaseEnum.LOCAL_FRAME]: {
            [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
            [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.SET,
            [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY
          },
          [frameCaseEnum.REMOTE_FRAME]: testOutcomeEnum.EXCEPTION
        },
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION,
        [cookieSettingEnum.ALLOW_ALL]: testOutcomeEnum.SET
      }
    }
  }

  // Return the expected value for a test, given the test case, the
  // ephemeral storage setting, the cookie policy setting, the frame
  // case being tested, and the API being tested.
  //
  // ie (testCasesEnum, ephemeralStorageEnum, cookieSettingEnum,
  //     frameCaseEnum, apiCaseEnum) -> testOutcomeEnum
  const expectedTestCaseValue = (testCasesOpt, ephemeralStorageOpt,
    cookieSettingOpt, frameCaseOpt, apiCaseOpt) => {
    const expectedForTestStep = expectedOutcomes[testCasesOpt]
    const expectedForEphemSetting = expectedForTestStep[ephemeralStorageOpt]
    const expectedForCookieSetting = expectedForEphemSetting[cookieSettingOpt]

    // If the value is an int (i.e. a case of testOutcomeEnum), that means
    // the same value is expected for every API, for every frame case
    // for this test.
    if (Number.isInteger(expectedForCookieSetting)) {
      return expectedForCookieSetting
    }

    // If the value given the frame case is an int (i.e. a case of
    // testOutcomeEnum), that means that the same value is expected for
    // every API in this frame.
    const expectedForFrameCase = expectedForCookieSetting[frameCaseOpt]
    if (Number.isInteger(expectedForFrameCase)) {
      return expectedForFrameCase
    }

    return expectedForFrameCase[apiCaseOpt]
  }

  const resultCellStyles = {
    [testOutcomeEnum.SET]: {
      class: 'bg-success',
      text: 'success'
    },
    [testOutcomeEnum.EMPTY]: {
      class: 'bg-light',
      text: 'empty'
    },
    [testOutcomeEnum.EXCEPTION]: {
      class: 'bg-warning',
      text: 'blocked'
    },
    [testOutcomeEnum.WRONG]: {
      class: 'bg-danger',
      text: 'wrong'
    }
  }

  const styleCellForExpectedValue = (cellElm, val) => {
    const cellStyle = resultCellStyles[val]
    cellElm.classList.remove('bg-success', 'bg-light', 'bg-warning',
      'bg-danger')
    cellElm.textContent = cellStyle.text
    cellElm.classList.add(cellStyle.class)
  }

  const storageTestKey = 'brave-ephemeral-storage-test'
  const queryParams = (new URL(L)).searchParams

  const storageValQueryKey = 'test-value'
  const newPossibleStorageVal = L.href + '::' + (+Math.random())
  let storageTestValue
  if (queryParams.get(storageValQueryKey) !== null) {
    storageTestValue = queryParams.get(storageValQueryKey)
  } else {
    let storageTestValueFromStorage = null
    try {
      storageTestValueFromStorage = W.localStorage.getItem(storageValQueryKey)
    } catch (_) {}

    storageTestValue = storageTestValueFromStorage || newPossibleStorageVal
  }

  try {
    W.localStorage.setItem(storageValQueryKey, storageTestValue)
  } catch (_) {

  }

  const ephemStorageQueryKey = 'ephemeral-storage-setting'
  const initEphemeralStorageVal = queryParams.get(ephemStorageQueryKey) || 'on'
  storageSettingSelect.value = initEphemeralStorageVal

  const cookieBlockingQueryKey = 'cookie-blocking-setting'
  const initCookieBlockingVal = queryParams.get(cookieBlockingQueryKey) || '3p'
  cookieBlockingSelect.value = initCookieBlockingVal

  const isForcedResetQueryKey = 'reset-url'
  const forcedResetUrl = queryParams.get(isForcedResetQueryKey)
  const isForcedResetCase = !!forcedResetUrl

  const continueTestUrlElm = D.getElementById('continue-test-url')
  const updateTestUrlText = _ => {
    const destUrl = new URL(L)
    const destUrlParams = destUrl.searchParams
    destUrlParams.set(storageValQueryKey, storageTestValue)
    destUrlParams.set(ephemStorageQueryKey, storageSettingSelect.value)
    destUrlParams.set(cookieBlockingQueryKey, cookieBlockingSelect.value)
    continueTestUrlElm.value = destUrl.toString()
  }

  const copyUrlButton = D.getElementById('copy-url-button')
  const onUrlButtonClick = async _ => {
    const initialText = copyUrlButton.textContent
    copyUrlButton.setAttribute('disabled', 'disabled')

    await navigator.clipboard.writeText(continueTestUrlElm.value)
    copyUrlButton.textContent = 'Copied!'

    setInterval(_ => {
      copyUrlButton.textContent = initialText
      copyUrlButton.removeAttribute('disabled')
    }, 3000)
  }
  copyUrlButton.addEventListener('click', onUrlButtonClick, false)

  const elmsForTestCases = {
    [testCasesEnum.INITIAL]: D.getElementById('row-initial-case'),
    [testCasesEnum.REMOTE_PAGE]: D.getElementById('row-remote-page-case'),
    [testCasesEnum.SAME_PAGE_SAME_SESSION]:
      D.getElementById('row-same-page-session-case'),
    [testCasesEnum.SAME_PAGE_NEW_SESSION]:
      D.getElementById('row-new-page-session-case')
  }
  const classNamesForFrameCases = {
    [frameCaseEnum.CURRENT_FRAME]: 'cell-this-frame',
    [frameCaseEnum.LOCAL_FRAME]: 'cell-local-frame',
    [frameCaseEnum.REMOTE_FRAME]: 'cell-remote-frame'
  }
  const classNamesForAPICases = {
    [apiCaseEnum.COOKIE]: 'row-cookies',
    [apiCaseEnum.LOCAL_STORAGE]: 'row-local-storage',
    [apiCaseEnum.SESSION_STORAGE]: 'row-session-storage'
  }

  const updateOutcomeTables = _ => {
    const ephemeralStorageOpt = storageSettingSelect.value
    const cookieSettingOpt = cookieBlockingSelect.value

    for (const [testCaseOption, rowElm] of Object.entries(elmsForTestCases)) {
      const tableSelector = '#' + rowElm.id + ' table'
      const tableElm = rowElm.querySelector(tableSelector)

      for (const [apiCaseOpt, apiCaseClassName] of Object.entries(classNamesForAPICases)) {
        const rowSelector = tableSelector + ' tr.' + apiCaseClassName
        const tRowElm = tableElm.querySelector(rowSelector)

        for (const [frameCaseOpt, frameCaseClassName] of Object.entries(classNamesForFrameCases)) {
          const cellSelector = rowSelector + ' td.' + frameCaseClassName
          const cellElm = tRowElm.querySelector(cellSelector)

          const expectedVal = expectedTestCaseValue(testCaseOption,
            ephemeralStorageOpt, cookieSettingOpt, frameCaseOpt, apiCaseOpt)
          styleCellForExpectedValue(cellElm, expectedVal)
        }
      }
    }
    updateTestUrlText()
  }

  storageSettingSelect.addEventListener('change', updateOutcomeTables, false)
  cookieBlockingSelect.addEventListener('change', updateOutcomeTables, false)
  updateOutcomeTables()

  const onEphemStorageTestElmClick = event => {
    event.preventDefault()
    event.cancelBubble = true
    const destUrl = new URL(event.target.href)
    const destParams = destUrl.searchParams
    destParams.set(storageValQueryKey, storageTestValue)
    destParams.set(ephemStorageQueryKey, storageSettingSelect.value)
    destParams.set(cookieBlockingQueryKey, cookieBlockingSelect.value)
    W.open(destUrl.toString())
  }
  const ephemStorageTestAnchorElms = D.querySelectorAll('a.ephem-storage-test')
  for (const aElm of Array.from(ephemStorageTestAnchorElms)) {
    aElm.addEventListener('click', onEphemStorageTestElmClick, false)
  }

  const testFrameWindows = {
    'this-frame': W,
    'local-frame': D.querySelector('iframe.this-origin').contentWindow,
    'remote-frame': D.querySelector('iframe.other-origin').contentWindow
  }

  const updateResultCell = (cellElm, val) => {
    let cellComparison
    if (val === exceptionEncoding) {
      cellComparison = testOutcomeEnum.EXCEPTION
    } else if (val === storageTestValue) {
      cellComparison = testOutcomeEnum.SET
    } else if (!val) {
      cellComparison = testOutcomeEnum.EMPTY
    } else {
      cellComparison = testOutcomeEnum.WRONG
    }
    const cellStyle = resultCellStyles[cellComparison]
    cellElm.classList.remove('bg-success', 'bg-light', 'bg-warning',
      'bg-danger')

    cellElm.textContent = cellStyle.text
    cellElm.classList.add(cellStyle.class)
  }

  const readStorageInFrame = async frameElm => {
    return await BU.simplePostMessage(frameElm, {
      action: 'storage::read',
      key: storageTestKey
    })
  }

  const updateStorageTable = async _ => {
    for (const [frameName, frameWin] of Object.entries(testFrameWindows)) {
      const frameStoreVals = await readStorageInFrame(frameWin)
      for (const [storageKey, storageValue] of Object.entries(frameStoreVals)) {
        const cellSel = `#storage-rs tr.row-${storageKey} td.cell-${frameName}`
        const cellElm = D.querySelector(cellSel)
        updateResultCell(cellElm, storageValue)
      }
    }
  }

  const clearStorageInFrame = async frameWin => {
    await BU.simplePostMessage(frameWin, {
      action: 'storage::clear',
      key: storageTestKey
    })
  }

  const writeStorageInFrame = async (frameWin, value) => {
    const msg = {
      action: 'storage::write',
      key: storageTestKey,
      value
    }
    return await BU.simplePostMessage(frameWin, msg)
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
    for (const aFrameWin of Object.values(testFrameWindows)) {
      await clearStorageInFrame(aFrameWin)
    }

    const path = L.pathname
    const otherOriginResetUrl = L.protocol + BU.otherOriginUrl(path)
    const destUrl = new URL(otherOriginResetUrl)
    const destParams = destUrl.searchParams
    destParams.set(storageValQueryKey, storageTestValue)
    destParams.set(isForcedResetQueryKey, L.protocol + BU.thisOriginUrl(path))
    D.location = destUrl.toString()
  }, false)

  setStorageButton.addEventListener('click', async _ => {
    freezeButtons()
    for (const aFrameWin of Object.values(testFrameWindows)) {
      await writeStorageInFrame(aFrameWin, storageTestValue)
    }
    await updateStorageTable()
    unfreezeButtons()
  }, false)

  readValuesButton.addEventListener('click', async _ => {
    freezeButtons()
    await updateStorageTable()
    unfreezeButtons()
  }, false)

  if (isForcedResetCase === true) {
    freezeButtons()
    try {
      W.localStorage.removeItem(storageValQueryKey)
    } catch (_) {}
    setInterval(async _ => {
      for (const aFrameWin of Object.values(testFrameWindows)) {
        await clearStorageInFrame(aFrameWin)
      }
      D.location = forcedResetUrl
    }, 1000)
  }
})()
