(async _ => {
  const W = window
  const D = W.document
  const L = W.location
  const BU = W.BRAVE

  const testKey = 'keep-alive-storage-test-key'
  const bouncePageUrl = '/storage/bounce.html'
  const currentPageUrl = L.protocol + BU.thisOriginUrl(L.pathname)

  const writeStorageInFrame = async (frameWin, key, value) => {
    return await BU.sendPostMsg(frameWin, 'storage::write', { key, value })
  }

  const readStorageInFrame = async (windowElm, key) => {
    return await BU.sendPostMsg(windowElm, 'storage::read', { key })
  }

  const clearStorageInFrame = async (frameWin, key) => {
    return await BU.sendPostMsg(frameWin, 'storage::clear', { key })
  }

  const numSecElm = D.getElementById('num-seconds-input')

  const navigateToBounceUrl = async (intOrElm, event) => {
    event.preventDefault()
    event.cancelBubble = true

    const testValue = Math.random()

    await writeStorageInFrame(BU.getTestWindow('this-frame'), testKey, testValue)
    await writeStorageInFrame(BU.getTestWindow('remote-frame'), testKey, testValue)

    const otherOriginBounceUrl = L.protocol + BU.otherOriginUrl(bouncePageUrl)
    const destUrl = new URL(otherOriginBounceUrl)
    const destParams = destUrl.searchParams
    destParams.set('destination', currentPageUrl)

    const numSecs = Number.isInteger(intOrElm) ? intOrElm : intOrElm.value
    destParams.set('sec', numSecs)
    destParams.set('value', testValue)

    D.location = destUrl.toString()
  }

  const currentUrl = new URL(L.href)
  const expectedTestValue = currentUrl.searchParams.get('value')
  const isPreTest = expectedTestValue === null

  const refreshStorageTable = async _ => {
    for (const [frameName, frameRef] of BU.getTestWindowNamesAndValues()) {
      const storedValues = await readStorageInFrame(frameRef, testKey)
      const localStorageVal = storedValues['local-storage']
      const cellElm = D.querySelector(`#table-current-state .cell-${frameName}`)
      if (localStorageVal === expectedTestValue) {
        cellElm.classList.add('bg-success')
        cellElm.textContent = 'set'
      } else if (localStorageVal === undefined || localStorageVal === null) {
        cellElm.classList.add('bg-info')
        cellElm.textContent = 'empty'
      } else {
        cellElm.classList.add('bg-danger')
        cellElm.textContent = 'wrong'
      }
    }
  }

  const keepAliveBtnElm = D.getElementById('button-keep-alive-test')
  const doNotKeepAliveBtnElm = D.getElementById('button-do-not-keep-alive-test')

  const resetBtnElm = D.getElementById('button-reset')

  keepAliveBtnElm.setAttribute('disabled', 'disabled')
  doNotKeepAliveBtnElm.setAttribute('disabled', 'disabled')

  const shortBounceCallback = navigateToBounceUrl.bind(undefined, 5)
  const longBounceCallback = navigateToBounceUrl.bind(undefined, numSecElm)

  keepAliveBtnElm.addEventListener('click', shortBounceCallback, false)
  doNotKeepAliveBtnElm.addEventListener('click', longBounceCallback, false)

  W.addEventListener('load', async _ => {
    // If we're visiting this page directly (i.e., not as the result of being
    // bounced here as part of the test), then set up storage as expected.
    if (isPreTest === true) {
      await clearStorageInFrame(BU.getTestWindow('this-frame'), testKey)
      await writeStorageInFrame(BU.getTestWindow('remote-frame'), testKey)
    } else {
      await refreshStorageTable()
    }

    keepAliveBtnElm.removeAttribute('disabled')
    doNotKeepAliveBtnElm.removeAttribute('disabled')
  }, false)

  resetBtnElm.addEventListener('click', event => {
    event.preventDefault()
    event.cancelBubble = true
    W.location = currentPageUrl
  }, false)
})()
