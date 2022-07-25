(async _ => {
  const W = window
  const D = W.document

  const headerReflectionUrl = '/reflect'

  const startBtnElm = D.getElementById('start')

  // Now normalize the headers to be in { header-name: [val1, val2] }
  // format.
  const normalizeHeaders = fetchRs => {
    const normalizedHeaders = Object.create(null)
    for (const [name, values] of Object.entries(fetchRs.headers)) {
      normalizedHeaders[name] = values.map(x => x.value)
    }
    return normalizedHeaders
  }

  const getSubResourceHeaders = async _ => {
    const headersRs = await W.fetch(headerReflectionUrl, { mode: 'same-origin' })
    return normalizeHeaders(await headersRs.json())
  }

  const getNavigationHeaders = _ => {
    const iframeElm = D.createElement('iframe')
    iframeElm.style.display = 'none'
    D.body.appendChild(iframeElm)

    return new W.Promise((resolve, reject) => {
      try {
        const onIFrameLoad = _ => {
          const headerText = iframeElm.contentDocument.body.innerText
          const headerJson = W.JSON.parse(headerText)
          resolve(normalizeHeaders(headerJson))
        }

        iframeElm.addEventListener('load', onIFrameLoad, false)
        iframeElm.src = headerReflectionUrl
      } catch (e) {
        reject(e)
      }
    })
  }

  const onStartClicked = async _ => {
    startBtnElm.setAttribute('disabled', true)

    const navHeaders = await getNavigationHeaders()
    const subRequestHeaders = await getSubResourceHeaders()

    const headerRows = D.querySelectorAll('[data-header-name]')

    const codeElmForHeader = (headers, key) => {
      const headerValues = headers[key]
      const codeElm = D.createElement('code')
      if (headerValues === undefined) {
        codeElm.innerText = 'null'
      } else {
        codeElm.innerText = headerValues.join(' ')
      }
      return codeElm
    }
    const navHeaderElmMaker = codeElmForHeader.bind(undefined, navHeaders)
    const subReqElmMaker = codeElmForHeader.bind(undefined, subRequestHeaders)

    for (const rowElm of headerRows) {
      const headerName = rowElm.dataset.headerName
      const [navElm, subResElm] = Array.from(rowElm.getElementsByTagName('td'))

      navElm.appendChild(navHeaderElmMaker(headerName))
      subResElm.appendChild(subReqElmMaker(headerName))
    }

    startBtnElm.removeAttribute('disabled')
  }

  startBtnElm.addEventListener('click', onStartClicked)
  startBtnElm.removeAttribute('disabled')
})()
