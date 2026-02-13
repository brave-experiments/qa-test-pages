(_ => {
  const W = window
  const D = W.document

  const resolveDoHCNAME = async (hostname) => {
    const url = 'https://cloudflare-dns.com/dns-query?name=' +
      encodeURIComponent(hostname) + '&type=CNAME'
    const resp = await W.fetch(url, {
      headers: { 'Accept': 'application/dns-json' }
    })
    const data = await resp.json()
    if (data.Answer) {
      for (const record of data.Answer) {
        if (record.type === 5) {
          return record.data.replace(/\.$/, '')
        }
      }
    }
    return null
  }

  const updateTestResults = (success) => {
    const elm = D.getElementById('test-result')
    if (success) {
      elm.className = 'bg-success'
      elm.textContent = 'Request was allowed'
    } else {
      elm.className = 'bg-danger'
      elm.textContent = 'Request was blocked'
    }
  }

  const startButtonElm = D.getElementById('button-start-test')
  const preCheckElm = D.getElementById('dns-precheck-status')

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
    W.location.href = '//test-cname.brave.dev/cname-uncloaking.html'
  }

  const runDnsPreCheck = async () => {
    preCheckElm.textContent = 'Checking DNS configuration...'
    preCheckElm.className = 'text-muted'
    try {
      const cname = await resolveDoHCNAME('test-cname.brave.dev')
      if (cname !== 'dev-pages.brave.software') {
        throw new Error(
          'DNS pre-check failed: test-cname.brave.dev does not CNAME to ' +
          'dev-pages.brave.software as expected (got: ' + cname + ')'
        )
      }
      const secondCname = await resolveDoHCNAME('dev-pages.brave.software')
      if (secondCname !== null) {
        throw new Error(
          'DNS pre-check failed: dev-pages.brave.software has an unexpected ' +
          'CNAME to ' + secondCname
        )
      }
      preCheckElm.textContent = 'DNS pre-check passed: test-cname.brave.dev ' +
        'CNAMEs to dev-pages.brave.software'
      preCheckElm.className = 'text-success'
      startButtonElm.removeAttribute('disabled')
      startButtonElm.addEventListener('click', onClickTest, false)
    } catch (err) {
      preCheckElm.textContent = err.message
      preCheckElm.className = 'text-danger'
    }
  }

  const thisOrigin = D.location.host
  if (thisOrigin !== 'test-cname.brave.dev') {
    startButtonElm.textContent = 'Visit the CNAME cloaked domain'
    startButtonElm.removeAttribute('disabled')
    startButtonElm.addEventListener('click', onClickNavigate, false)
  } else {
    runDnsPreCheck()
  }
})()
