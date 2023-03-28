/* eslint-env worker,serviceworker */

(async _ => {
  const isWorker = !!(self && self.importScripts)
  const isServiceWorker = !!(isWorker && self && self.clients)
  const isFrame = !isWorker

  const headerReflectionUrl = '/reflect'
  const headerName = 'accept-language'

  const normalizeHeaders = fetchRs => {
    const normalizedHeaders = Object.create(null)
    for (const [name, values] of Object.entries(fetchRs.headers)) {
      normalizedHeaders[name] = values.map(x => x.value)
    }
    return normalizedHeaders
  }

  const getFetchLangHeader = async lang => {
    const fetchHeaders = {}
    if (lang !== undefined) {
      fetchHeaders[headerName] = lang
    }
    const headersRs = await fetch(headerReflectionUrl, {
      mode: 'same-origin',
      headers: fetchHeaders
    })

    const normalizedHeaders = normalizeHeaders(await headersRs.json())
    return normalizedHeaders[headerName]
  }

  const getAjaxLangHeader = lang => {
    const fetchHeaders = {}
    if (lang !== undefined) {
      fetchHeaders[headerName] = lang
    }
    return new Promise(resolve => {
      if (isServiceWorker) {
        resolve('-')
        return
      }
      const req = new XMLHttpRequest()
      req.open('GET', headerReflectionUrl)
      req.addEventListener('load', () => {
        const headerData = JSON.parse(req.responseText)
        const normalizedHeaders = normalizeHeaders(headerData)
        resolve(normalizedHeaders[headerName])
      })
      if (lang !== undefined) {
        req.setRequestHeader(headerName, lang)
      }
      req.send()
    })
  }

  const readHeaders = async lang => {
    return {
      fetch: await getFetchLangHeader(lang),
      ajax: await getAjaxLangHeader(lang)
    }
  }

  if (isFrame) {
    const W = window
    const BU = W.BRAVE

    const onMessage = async (action, lang) => {
      if (action === 'fingerprinting-exceptions::read') {
        return readHeaders(lang)
      }
    }
    BU.receivePostMsg(onMessage)
    return
  }

  if (isServiceWorker) {
    self.addEventListener('install', event => {
      event.waitUntil(self.skipWaiting())
    })

    self.addEventListener('activate', event => {
      event.waitUntil(clients.claim())
    })

    self.addEventListener('message', async event => {
      const { action, lang } = event.data
      const langCase = event.data.case
      if (action !== 'read') {
        console.error(`Unexpected message: ${event.data}`)
        return
      }

      const client = await clients.get(event.source.id)
      client.postMessage({
        action: 'read',
        context: 'service-worker',
        headers: await readHeaders(lang),
        case: langCase
      })
    })
    return
  }

  if (isWorker) { // is a web worker
    self.addEventListener('message', async event => {
      const { action, lang } = event.data
      const langCase = event.data.case
      if (action !== 'read') {
        console.error(`Unexpected message: ${event.data}`)
        return
      }

      postMessage({
        action: 'read',
        context: 'web-worker',
        headers: await readHeaders(lang),
        case: langCase
      })
    })
  }
})()
