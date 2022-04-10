(async _ => {
  const W = window
  const D = W.document
  const L = W.location
  const BU = W.BRAVE

  const testAlertElm = D.getElementById('test-alert')
  const testResultElm = D.getElementById('test-description')
  const iframeContainer = D.getElementById('iframe-container')
  const iframeElm = D.getElementById('test-iframe')

  const isTopLevelFrame = W.top === W
  if (isTopLevelFrame) {
    testAlertElm.parentNode.removeChild(testAlertElm)
    testResultElm.parentNode.removeChild(testResultElm)
    iframeElm.src = BU.otherOriginUrl(L.pathname + L.search)
    return
  }

  iframeContainer.removeChild(iframeElm)
  iframeContainer.parentNode.removeChild(iframeContainer)

  const searchParams = (new W.URL(L)).searchParams
  const expectedValue = searchParams.get('value')
  const testUrl = searchParams.get('url')

  let didTestPass
  let msg
  try {
    const rs = await W.fetch(testUrl)
    const blobText = await rs.text()
    didTestPass = false
    if (blobText === expectedValue) {
      msg = 'Looks like blobs are NOT partitioned. ' +
            `Was able to load blob URL and received value ${blobText}.`
    } else {
      msg = 'Unanticipated test result. Was able to load blob URL, but got ' +
            `an unexpected value. Expected ${expectedValue}, got ${blobText}.`
    }
  } catch (e) {
    didTestPass = true
    msg = `Received ${e} when trying to load blob URL.`
  }

  if (didTestPass) {
    testAlertElm.classList.add('alert-success')
    testAlertElm.innerText = 'Test passed'
  } else {
    testAlertElm.classList.add('alert-danger')
    testAlertElm.innerText = 'Test failed'
  }
  testResultElm.innerText = msg
})()
