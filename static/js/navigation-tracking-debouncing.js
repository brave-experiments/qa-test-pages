(_ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const startButtonElm = D.getElementById('start')
  const referrerSectionElm = D.getElementById('observed-referer-section')
  const refererElm = D.getElementById('observed-referer')

  if (W.location.toString().includes('?complete') === true) {
    referrerSectionElm.classList.remove('d-none')
    const refererHost = D.referrer || (new URL(D.referrer)).host
    refererElm.textContent = refererHost
  }

  const onClick = _ => {
    const finalUrl = BU.thisOriginUrlSecure('/navigation-tracking/debouncing.html?complete')
    const encodedUrl = W.encodeURIComponent(finalUrl)
    const intermediateUrl = `https://www.youtube.com/redirect?q=${encodedUrl}`
    W.location = intermediateUrl
  }
  startButtonElm.addEventListener('click', onClick, false)
  startButtonElm.removeAttribute('disabled')
})()
