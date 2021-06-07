(_ => {
  const W = window
  const D = W.document

  const updateTestResults = (success) => {
    const sel = 'test-result'
    const elm = D.getElementById(sel)
    if (success) {
      elm.className = 'bg-success'
      elm.textContent = 'Request was allowed'
    } else {
      elm.className = 'bg-danger'
      elm.textContent = 'Request was blocked'
    }
  }

  const startButtonElm = D.getElementById('button-start-test')
  const onClickTest = async event => {
    const elm = event.target
    const initialText = elm.textContent
    elm.setAttribute('disabled', 'disabled')
    elm.textContent = 'Running test'
    W.fetch('/static/images/test.jpg')
      .then(_ => true)
      .catch(_ => false)
      .then(success => {
        updateTestResults(success)
        elm.textContent = initialText
        elm.removeAttribute('disabled')
      })
  }

  const onClickNavigate = async event => {
    W.location.href = '//test-cname.brave.software/cname-uncloaking.html'
  }

  const thisOrigin = document.location.host
  if (thisOrigin !== 'test-cname.brave.software') {
    startButtonElm.textContent = 'Visit the CNAME cloaked domain'
    startButtonElm.addEventListener('click', onClickNavigate, false)
  } else {
    startButtonElm.addEventListener('click', onClickTest, false)
  }
})()
