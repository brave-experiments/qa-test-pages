(_ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const params = (new URL(D.location)).searchParams
  const isTestPage = params.get('test') === 'run'
  const windowName = W.name

  const alertElm = D.querySelector('.alert')
  const testBtnElm = D.getElementById('button-start-test')
  const resetBtnElm = D.getElementById('button-reset-test')

  if (isTestPage) {
    alertElm.classList.remove('alert-dark')
    const alertText = `<code>window.name</code> = ${windowName || 'NA'}`
    alertElm.innerHTML = alertText
    if (windowName) {
      alertElm.classList.add('alert-danger')
    } else {
      alertElm.classList.add('alert-success')
    }
  }

  resetBtnElm.addEventListener('click', _ => {
    W.name = undefined
    W.location = BU.thisOriginUrlSecure(D.location.pathname)
  })

  testBtnElm.addEventListener('click', _ => {
    W.name = `value: (random value: ${Math.random()}`
    W.location = BU.otherOriginUrl(D.location.pathname) + '?test=run'
  })

  resetBtnElm.removeAttribute('disabled')
  testBtnElm.removeAttribute('disabled')
})()
