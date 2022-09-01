(_ => {
  // https://github.com/joaquimserafim/base64-url/blob/master/index.js
  function escape (str) {
    return str.replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  function base64UrlEncode (str) {
    return escape(window.btoa(str))
  }

  const W = window
  const D = W.document
  const BU = W.BRAVE

  const currentPath = '/navigation-tracking/debouncing.html?complete'
  const currentUrl = BU.thisOriginUrlSecure(currentPath)
  const actionFunctionMapping = {
    base64: bouncerUrl => bouncerUrl + base64UrlEncode(currentUrl),
    regex: bouncerUrl => {
      // The debouncing rule being tested does not want a protocol in place.
      const currentUrlNoProto = currentUrl.replace('https://', '')
      const encodedCurUrl = W.encodeURIComponent(currentUrlNoProto)
      const destUrl = bouncerUrl
        .replace('{replace}', encodedCurUrl)
        .replace('{this-path}', W.encodeURIComponent(currentPath))
        .replace('{this-origin}', W.encodeURIComponent(D.location.host))
      return destUrl
    },
    none: bouncerUrl => bouncerUrl + W.encodeURIComponent(currentUrl)
  }

  const testButtons = Array.from(D.querySelectorAll('.table button'))
  const referrerSectionElm = D.getElementById('observed-referer-section')
  const refererElm = D.getElementById('observed-referer')

  if (W.location.toString().includes('?complete') === true) {
    referrerSectionElm.classList.remove('d-none')
    const refererHost = D.referrer || (new URL(D.referrer)).hostname
    refererElm.textContent = refererHost
  }

  const onClick = (bouncerUrl, transformFunc) => {
    W.location = transformFunc(bouncerUrl)
  }

  for (const aTestButton of testButtons) {
    const rowElm = aTestButton.parentElement.parentElement
    const bouncerUrl = BU.otherOriginUrl(rowElm.dataset.testUrl)
    const testAction = rowElm.dataset.testAction || 'none'
    const transformFunc = actionFunctionMapping[testAction]
    const testOnClick = onClick.bind(undefined, bouncerUrl, transformFunc)
    aTestButton.addEventListener('click', testOnClick, false)
    aTestButton.removeAttribute('disabled')
  }
})()
