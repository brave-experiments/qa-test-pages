(async _ => {
  const W = window
  const D = W.document
  const L = D.location
  const O = Object
  const BU = W.BRAVE
  const exceptionEncoding = '*exception*'

  const storageSettingSelect = D.getElementById('ephemeral-storage-setting')
  const cookieBlockingSelect = D.getElementById('cookie-blocking-setting')

  const testOutcomeEnum = {
    SET: 0,
    EMPTY: 1,
    EXCEPTION: 2,
    WRONG: 4,
    NA: 6
  }
  const testCasesEnum = {
    INITIAL: 0,
    REMOTE_PAGE_SAME_SESSION: 1,
    REMOTE_PAGE_DIFF_SESSION: 2,
    SAME_PAGE_SAME_SESSION: 3,
    SAME_PAGE_DIFF_SESSION: 4,
    SAME_PAGE_RESET_SESSION: 5
  }
  const ephemeralStorageEnum = {
    BRAVE_PRE_CR121: 0,
    BRAVE_CR121: 1
  }
  const cookieSettingEnum = {
    BLOCK_THIRD_PARTY: 0,
    BLOCK_ALL: 1,
    ALLOW_ALL: 2
  }
  const frameCaseEnum = {
    CURRENT_FRAME: 0,
    LOCAL_FRAME: 1,
    REMOTE_FRAME: 2,
    NESTED_FRAME: 3
  }
  const apiCaseEnum = {
    COOKIE: 0,
    LOCAL_STORAGE: 1,
    SESSION_STORAGE: 2,
    INDEX_DB: 3
  }

  const allSetButSessionCol = {
    [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
    [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.SET,
    [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY,
    [apiCaseEnum.INDEX_DB]: testOutcomeEnum.SET
  }
  const allSetButSessionOrIDBCol = {
    [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
    [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.SET,
    [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY,
    [apiCaseEnum.INDEX_DB]: testOutcomeEnum.EXCEPTION
  }
  const allSetButIDBCol = {
    [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
    [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.SET,
    [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.SET,
    [apiCaseEnum.INDEX_DB]: testOutcomeEnum.EXCEPTION
  }
  const allEmptyButIDBCol = {
    [apiCaseEnum.COOKIE]: testOutcomeEnum.EMPTY,
    [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.EMPTY,
    [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY,
    [apiCaseEnum.INDEX_DB]: testOutcomeEnum.EXCEPTION
  }
  const cookiesSetCol = {
    [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
    [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.EMPTY,
    [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY,
    [apiCaseEnum.INDEX_DB]: testOutcomeEnum.EMPTY
  }

  const allSetTable = {
    [frameCaseEnum.CURRENT_FRAME]: testOutcomeEnum.SET,
    [frameCaseEnum.LOCAL_FRAME]: testOutcomeEnum.SET,
    [frameCaseEnum.REMOTE_FRAME]: testOutcomeEnum.SET,
    [frameCaseEnum.NESTED_FRAME]: testOutcomeEnum.SET
  }
  const allEmptyButRemoteIdbTable = {
    [frameCaseEnum.CURRENT_FRAME]: testOutcomeEnum.EMPTY,
    [frameCaseEnum.LOCAL_FRAME]: testOutcomeEnum.EMPTY,
    [frameCaseEnum.REMOTE_FRAME]: allEmptyButIDBCol,
    [frameCaseEnum.NESTED_FRAME]: testOutcomeEnum.EMPTY
  }
  const allSetButRemoteIdbTable = {
    [frameCaseEnum.CURRENT_FRAME]: testOutcomeEnum.SET,
    [frameCaseEnum.LOCAL_FRAME]: testOutcomeEnum.SET,
    [frameCaseEnum.REMOTE_FRAME]: allSetButIDBCol,
    [frameCaseEnum.NESTED_FRAME]: testOutcomeEnum.SET
  }
  const allButSessionTable = {
    [frameCaseEnum.CURRENT_FRAME]: allSetButSessionCol,
    [frameCaseEnum.LOCAL_FRAME]: allSetButSessionCol,
    [frameCaseEnum.REMOTE_FRAME]: allSetButSessionCol,
    [frameCaseEnum.NESTED_FRAME]: allSetButSessionCol
  }
  const allButNestedStoragesTable = {
    [frameCaseEnum.CURRENT_FRAME]: testOutcomeEnum.SET,
    [frameCaseEnum.LOCAL_FRAME]: testOutcomeEnum.SET,
    [frameCaseEnum.REMOTE_FRAME]: testOutcomeEnum.SET,
    [frameCaseEnum.NESTED_FRAME]: cookiesSetCol
  }
  const allButSessionAndNestedStoragesTable = {
    [frameCaseEnum.CURRENT_FRAME]: allSetButSessionCol,
    [frameCaseEnum.LOCAL_FRAME]: allSetButSessionCol,
    [frameCaseEnum.REMOTE_FRAME]: allSetButSessionCol,
    [frameCaseEnum.NESTED_FRAME]: cookiesSetCol
  }
  const unpartitionedCookiesSetTable = {
    [frameCaseEnum.CURRENT_FRAME]: cookiesSetCol,
    [frameCaseEnum.LOCAL_FRAME]: cookiesSetCol,
    [frameCaseEnum.REMOTE_FRAME]: cookiesSetCol,
    [frameCaseEnum.NESTED_FRAME]: testOutcomeEnum.EMPTY
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
    // Step 1: Initial Case
    [testCasesEnum.INITIAL]: {
      [ephemeralStorageEnum.BRAVE_PRE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: allSetTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: allSetButRemoteIdbTable,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      },
      [ephemeralStorageEnum.BRAVE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: allButNestedStoragesTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: allButNestedStoragesTable,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      }
    },

    // Step 2: Remote Page, Same Session
    [testCasesEnum.REMOTE_PAGE_SAME_SESSION]: {
      [ephemeralStorageEnum.BRAVE_PRE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: {
          [frameCaseEnum.CURRENT_FRAME]: testOutcomeEnum.SET,
          [frameCaseEnum.LOCAL_FRAME]: testOutcomeEnum.SET,
          [frameCaseEnum.REMOTE_FRAME]: testOutcomeEnum.SET,
          [frameCaseEnum.NESTED_FRAME]: testOutcomeEnum.EMPTY
        },
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: allEmptyButRemoteIdbTable,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      },
      [ephemeralStorageEnum.BRAVE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: unpartitionedCookiesSetTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: testOutcomeEnum.EMPTY,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      }
    },

    // Step 3: Remote Page, New Session
    [testCasesEnum.REMOTE_PAGE_DIFF_SESSION]: {
      [ephemeralStorageEnum.BRAVE_PRE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: {
          [frameCaseEnum.CURRENT_FRAME]: allSetButSessionCol,
          [frameCaseEnum.LOCAL_FRAME]: allSetButSessionCol,
          [frameCaseEnum.REMOTE_FRAME]: allSetButSessionCol,
          [frameCaseEnum.NESTED_FRAME]: testOutcomeEnum.EMPTY
        },
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: allEmptyButRemoteIdbTable,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      },
      [ephemeralStorageEnum.BRAVE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: unpartitionedCookiesSetTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: testOutcomeEnum.EMPTY,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      }
    },

    // Step 4: This Page, Same Session Case
    [testCasesEnum.SAME_PAGE_SAME_SESSION]: {
      [ephemeralStorageEnum.BRAVE_PRE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: allSetTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: allSetButRemoteIdbTable,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      },
      [ephemeralStorageEnum.BRAVE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: allButNestedStoragesTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: allButNestedStoragesTable,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      }
    },

    // Step 5: This Page, Different Session
    [testCasesEnum.SAME_PAGE_DIFF_SESSION]: {
      [ephemeralStorageEnum.BRAVE_PRE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: allButSessionTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: {
          [frameCaseEnum.CURRENT_FRAME]: allSetButSessionCol,
          [frameCaseEnum.LOCAL_FRAME]: allSetButSessionCol,
          [frameCaseEnum.REMOTE_FRAME]: allSetButSessionOrIDBCol,
          [frameCaseEnum.NESTED_FRAME]: {
            [apiCaseEnum.COOKIE]: testOutcomeEnum.SET,
            [apiCaseEnum.LOCAL_STORAGE]: testOutcomeEnum.SET,
            [apiCaseEnum.SESSION_STORAGE]: testOutcomeEnum.EMPTY,
            [apiCaseEnum.INDEX_DB]: testOutcomeEnum.SET
          }
        },
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      },
      [ephemeralStorageEnum.BRAVE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: allButSessionAndNestedStoragesTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: allButSessionAndNestedStoragesTable,
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      }
    },

    // Step 6: New Page, Reset Session Case
    [testCasesEnum.SAME_PAGE_RESET_SESSION]: {
      [ephemeralStorageEnum.BRAVE_PRE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: allButSessionTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: {
          [frameCaseEnum.CURRENT_FRAME]: allSetButSessionCol,
          [frameCaseEnum.LOCAL_FRAME]: allSetButSessionCol,
          [frameCaseEnum.REMOTE_FRAME]: allEmptyButIDBCol,
          [frameCaseEnum.NESTED_FRAME]: allSetButSessionCol
        },
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
      },
      [ephemeralStorageEnum.BRAVE_CR121]: {
        [cookieSettingEnum.ALLOW_ALL]: allButSessionAndNestedStoragesTable,
        [cookieSettingEnum.BLOCK_THIRD_PARTY]: {
          [frameCaseEnum.CURRENT_FRAME]: allSetButSessionCol,
          [frameCaseEnum.LOCAL_FRAME]: allSetButSessionCol,
          [frameCaseEnum.REMOTE_FRAME]: testOutcomeEnum.EMPTY,
          [frameCaseEnum.NESTED_FRAME]: cookiesSetCol
        },
        [cookieSettingEnum.BLOCK_ALL]: testOutcomeEnum.EXCEPTION
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
    },
    [testOutcomeEnum.NA]: {
      class: 'bg-info',
      text: 'N/A'
    }
  }

  const styleCellForExpectedValue = (cellElm, val) => {
    const cellStyle = resultCellStyles[val]
    cellElm.classList.remove('bg-success', 'bg-light', 'bg-warning',
      'bg-danger', 'bg-info')
    cellElm.textContent = cellStyle.text
    cellElm.classList.add(cellStyle.class)
  }

  const queryParams = (new URL(L)).searchParams

  const storageTestKey = 'storage-test'
  let storageTestValue
  let isMainTestFrame
  if (queryParams.get(storageTestKey) !== null) {
    isMainTestFrame = false
    storageTestValue = queryParams.get(storageTestKey)
  } else {
    isMainTestFrame = true
    storageTestValue = L.href + '::' + (+Math.random())
  }

  const nestedFrameTestKey = 'nested-frame-storage-key'
  const nestedFrameTestValue = queryParams.get(nestedFrameTestKey) || Math.random().toString()

  const ephemStorageQueryKey = 'ephemeral-storage-setting'
  const initEphemeralStorageVal = queryParams.get(ephemStorageQueryKey) || 'BRAVE_CR121'
  storageSettingSelect.value = initEphemeralStorageVal

  const cookieBlockingQueryKey = 'cookie-blocking-setting'
  const initCookieBlockingVal = queryParams.get(cookieBlockingQueryKey) || 'BLOCK_THIRD_PARTY'
  cookieBlockingSelect.value = initCookieBlockingVal

  const isForcedResetQueryKey = 'reset-url'
  const forcedResetUrl = queryParams.get(isForcedResetQueryKey)
  const isForcedResetCase = !!forcedResetUrl

  const continueTestThisUrlElms = Array.from(D.querySelectorAll('.continue-test-url.this-origin-input'))
  const continueTestRemoteUrlElms = Array.from(D.querySelectorAll('.continue-test-url.remote-origin-input'))
  const updateTestUrlText = _ => {
    const destUrl = new URL(L)
    const destUrlParams = destUrl.searchParams
    destUrlParams.set(storageTestKey, storageTestValue)
    destUrlParams.set(nestedFrameTestKey, nestedFrameTestValue)
    destUrlParams.set(ephemStorageQueryKey, storageSettingSelect.value)
    destUrlParams.set(cookieBlockingQueryKey, cookieBlockingSelect.value)

    const continueTestUrl = destUrl.pathname + '?' + destUrlParams.toString()
    const thisOriginUrl = destUrl.protocol + BU.thisOriginUrl(continueTestUrl)
    for (const aUrlInputElm of continueTestThisUrlElms) {
      aUrlInputElm.value = thisOriginUrl.toString()
    }

    const remoteOriginUrl = destUrl.protocol + BU.otherOriginUrl(continueTestUrl)
    for (const aUrlInputElm of continueTestRemoteUrlElms) {
      aUrlInputElm.value = remoteOriginUrl.toString()
    }
  }

  const copyUrlButtons = Array.from(D.querySelectorAll('.copy-url-button'))
  const onUrlButtonClick = async event => {
    const copyButton = event.target
    const initialText = copyButton.textContent
    copyButton.setAttribute('disabled', 'disabled')

    const urlElm = copyButton.classList.contains('this-origin-button')
      ? continueTestThisUrlElms[0]
      : continueTestRemoteUrlElms[0]

    await navigator.clipboard.writeText(urlElm.value)
    copyButton.textContent = 'Copied!'

    setInterval(_ => {
      copyButton.textContent = initialText
      copyButton.removeAttribute('disabled')
    }, 3000)
  }
  for (const aButton of copyUrlButtons) {
    aButton.addEventListener('click', onUrlButtonClick, false)
  }

  const cellForTestCaseApiAndFrame = (_ => {
    const idsForTestCases = {
      [testCasesEnum.INITIAL]: 'initial',
      [testCasesEnum.REMOTE_PAGE_SAME_SESSION]: 'remote-page-same-session',
      [testCasesEnum.REMOTE_PAGE_DIFF_SESSION]: 'remote-page-diff-session',
      [testCasesEnum.SAME_PAGE_SAME_SESSION]: 'same-page-same-session',
      [testCasesEnum.SAME_PAGE_DIFF_SESSION]: 'same-page-diff-session',
      [testCasesEnum.SAME_PAGE_RESET_SESSION]: 'same-page-reset-session'
    }
    const classNamesForAPICases = {
      [apiCaseEnum.COOKIE]: 'row-dom-cookies',
      [apiCaseEnum.LOCAL_STORAGE]: 'row-local-storage',
      [apiCaseEnum.SESSION_STORAGE]: 'row-session-storage',
      [apiCaseEnum.INDEX_DB]: 'row-index-db'
    }
    const classNamesForFrameCases = {
      [frameCaseEnum.CURRENT_FRAME]: 'cell-this-frame',
      [frameCaseEnum.LOCAL_FRAME]: 'cell-local-frame',
      [frameCaseEnum.REMOTE_FRAME]: 'cell-remote-frame',
      [frameCaseEnum.NESTED_FRAME]: 'cell-nested-frame'
    }
    const elmCache = {}

    return (testCaseOpt, apiCaseOpt, frameCaseOpt) => {
      const key = `${testCaseOpt}::${apiCaseOpt}::${frameCaseOpt}`
      const cacheVal = elmCache[key]
      if (cacheVal !== undefined) {
        return cacheVal
      }

      const testCaseId = idsForTestCases[testCaseOpt]
      const apiCaseClass = classNamesForAPICases[apiCaseOpt]
      const frameCaseClass = classNamesForFrameCases[frameCaseOpt]

      const sel = `#${testCaseId} tr.${apiCaseClass} td.${frameCaseClass}`
      const cellElm = D.querySelector(sel)
      elmCache[key] = cellElm
      return cellElm
    }
  })()

  const updateOutcomeTables = _ => {
    const ephemeralStorageOpt = ephemeralStorageEnum[storageSettingSelect.value]
    const cookieSettingOpt = cookieSettingEnum[cookieBlockingSelect.value]

    for (const testCaseOpt of O.values(testCasesEnum)) {
      for (const apiCaseOpt of O.values(apiCaseEnum)) {
        for (const frameCaseOpt of O.values(frameCaseEnum)) {
          const cellElm = cellForTestCaseApiAndFrame(testCaseOpt, apiCaseOpt,
            frameCaseOpt)
          const expectedVal = expectedTestCaseValue(testCaseOpt,
            ephemeralStorageOpt, cookieSettingOpt, frameCaseOpt, apiCaseOpt)
          styleCellForExpectedValue(cellElm, expectedVal)
        }
      }
    }

    // const nestedCellElms = D.querySelectorAll('#section-steps .cell-nested-frame')
    // for (const aCell of Array.from(nestedCellElms)) {
    //   styleCellForExpectedValue(aCell, testOutcomeEnum.NA)
    // }

    // const initialCellElms = D.querySelectorAll('#initial .cell-nested-frame')
    // const cellStyle = cookieSettingOpt === cookieSettingEnum.BLOCK_ALL
    //   ? testOutcomeEnum.EXCEPTION
    //   : testOutcomeEnum.SET
    // for (const aCell of Array.from(initialCellElms)) {
    //   const shouldBeBlocked = aCell.parentNode.classList.contains('row-index-db')
    //   const finalCellStyle = shouldBeBlocked
    //     ? testOutcomeEnum.EXCEPTION
    //     : cellStyle
    //   styleCellForExpectedValue(aCell, finalCellStyle)
    // }

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
    destParams.set(storageTestKey, storageTestValue)
    destParams.set(nestedFrameTestKey, nestedFrameTestValue)
    destParams.set(ephemStorageQueryKey, storageSettingSelect.value)
    destParams.set(cookieBlockingQueryKey, cookieBlockingSelect.value)
    W.open(destUrl.toString())
  }
  const ephemStorageTestAnchorElms = D.querySelectorAll('a.ephem-storage-test')
  for (const aElm of Array.from(ephemStorageTestAnchorElms)) {
    aElm.addEventListener('click', onEphemStorageTestElmClick, false)
  }

  const remoteFrameWin = D.querySelector('iframe.other-origin').contentWindow
  const testFrameWindows = {
    'this-frame': W,
    'local-frame': D.querySelector('iframe.this-origin').contentWindow,
    'remote-frame': remoteFrameWin
  }

  const resultToOutcome = (val, testValue) => {
    if (val === exceptionEncoding) {
      return testOutcomeEnum.EXCEPTION
    } else if (val === testValue) {
      return testOutcomeEnum.SET
    } else if (!val) {
      return testOutcomeEnum.EMPTY
    } else {
      return testOutcomeEnum.WRONG
    }
  }

  const updateResultCell = (cellElm, outcome) => {
    const cellStyle = resultCellStyles[outcome]
    cellElm.classList.remove('bg-success', 'bg-light', 'bg-warning',
      'bg-danger', 'bg-info')

    cellElm.textContent = cellStyle.text
    cellElm.classList.add(cellStyle.class)
  }

  const readStorageInFrame = async (windowElm, key) => {
    return await BU.sendPostMsg(windowElm, 'storage::read', { key })
  }

  const clearStorageInFrame = async (frameWin, key) => {
    return await BU.sendPostMsg(frameWin, 'storage::clear', { key })
  }

  const writeStorageInFrame = async (frameWin, key, value) => {
    return await BU.sendPostMsg(frameWin, 'storage::write', { key, value })
  }

  const testNestedFrameStorage = async frameWin => {
    const nestedFrameStorage = await BU.sendPostMsg(frameWin, 'storage::nested-frame', {
      key: nestedFrameTestKey
    })
    const testResults = O.create(null)
    for (const [nestedStorageKey, nestedStorageVal] of O.entries(nestedFrameStorage)) {
      testResults[nestedStorageKey] = resultToOutcome(nestedStorageVal, nestedFrameTestValue)
    }
    return testResults
  }

  /* Returns data of the form:
     {
       'cookies': {
         'this-frame': testOutcomeEnum.SET,
         'local-frame': testOutcomeEnum.SET,
         'remote-frame': testOutcomeEnum.SET,
         'nested-frame': testOutcomeEnum.SET,
       }
       'local-storage': { ... }
       'session-storage': { ... }
       'index-db': { ... }
     }
  */
  const generateStorageReport = async _ => {
    const emptyResult = _ => ({
      'this-frame': testOutcomeEnum.EMPTY,
      'local-frame': testOutcomeEnum.EMPTY,
      'remote-frame': testOutcomeEnum.EMPTY,
      'nested-frame': testOutcomeEnum.EMPTY
    })
    const report = {
      'dom-cookies': emptyResult(),
      'local-storage': emptyResult(),
      'session-storage': emptyResult(),
      'index-db': emptyResult()
    }

    for (const [frameName, frameWin] of O.entries(testFrameWindows)) {
      const frameStoreVals = await readStorageInFrame(frameWin, storageTestKey)
      for (const [storageKey, storageValue] of O.entries(frameStoreVals)) {
        report[storageKey][frameName] = resultToOutcome(storageValue, storageTestValue)
      }
    }

    const nestedStorageRs = await testNestedFrameStorage(remoteFrameWin)
    for (const [storageKey, storageRs] of O.entries(nestedStorageRs)) {
      report[storageKey]['nested-frame'] = storageRs
    }

    return report
  }

  const updateStorageTable = (report) => {
    for (const [storageKey, reportRow] of O.entries(report)) {
      for (const [frameName, outcome] of O.entries(reportRow)) {
        const cellSel = `#storage-rs tr.row-${storageKey} td.cell-${frameName}`
        const cellElm = D.querySelector(cellSel)
        updateResultCell(cellElm, outcome)
      }
    }
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

  const clearStorageInFrameTree = async _ => {
    for (const aFrameWin of O.values(testFrameWindows)) {
      await clearStorageInFrame(aFrameWin, storageTestKey)
    }
    await clearStorageInFrame(W, nestedFrameTestKey)
  }

  const clearStorageAction = async _ => {
    freezeButtons()
    await clearStorageInFrameTree()
    const path = L.pathname
    const otherOriginResetUrl = L.protocol + BU.otherOriginUrl(path)
    const destUrl = new URL(otherOriginResetUrl)
    const destParams = destUrl.searchParams
    destParams.set(storageTestKey, storageTestValue)
    destParams.set(isForcedResetQueryKey, L.protocol + BU.thisOriginUrl(path))
    D.location = destUrl.toString()
  }

  const setStorageAction = async _ => {
    freezeButtons()
    for (const aFrameWin of O.values(testFrameWindows)) {
      await writeStorageInFrame(aFrameWin, storageTestKey, storageTestValue)
    }
    if (isMainTestFrame === true) {
      await writeStorageInFrame(W, nestedFrameTestKey, nestedFrameTestValue)
    }
    const report = await generateStorageReport()
    updateStorageTable(report)
    unfreezeButtons()
  }

  const readValuesAction = async _ => {
    freezeButtons()
    const report = await generateStorageReport()
    updateStorageTable(report)
    unfreezeButtons()
  }

  clearStorageButton.addEventListener('click', clearStorageAction, false)
  setStorageButton.addEventListener('click', setStorageAction, false)
  readValuesButton.addEventListener('click', readValuesAction, false)

  if (isForcedResetCase === true) {
    freezeButtons()
    setInterval(async _ => {
      await clearStorageInFrameTree()
      D.location = forcedResetUrl
    }, 1000)
  }
})()
