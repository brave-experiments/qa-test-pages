(_ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const testButtons = Array.from(D.querySelectorAll('.table button'))
  const referrerSectionElm = D.getElementById('observed-referer-section')
  const refererElm = D.getElementById('observed-referer')

  if (W.location.toString().includes('?complete') === true) {
    referrerSectionElm.classList.remove('d-none')
    const refererHost = D.referrer || (new URL(D.referrer)).hostname
    refererElm.textContent = refererHost
  }

  const onClick = (targetUrl, _) => {
    const finalUrl = BU.thisOriginUrlSecure('/navigation-tracking/debouncing.html?complete')
    const encodedUrl = W.encodeURIComponent(finalUrl)
    const intermediateUrl = targetUrl + encodedUrl
    W.location = intermediateUrl
  }

  for (const aTestButton of testButtons) {
    const rowElm = aTestButton.parentElement.parentElement
    const testUrl = rowElm.dataset.testUrl
    const testOnClick = onClick.bind(undefined, testUrl)
    aTestButton.addEventListener('click', testOnClick, false)
    aTestButton.removeAttribute('disabled')
  }
})()
