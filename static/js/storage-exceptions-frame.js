(_ => {
  const w = window
  const d = w.document

  const createStorageElm = _ => {
    const elm = d.createElement('span')
    elm.classList.add('badge')
    elm.classList.add('badge-pill')
    return elm
  }

  const createStorageElmAllowed = _ => {
    const elm = createStorageElm()
    elm.innerText = 'allowed'
    elm.classList.add('badge-primary')
    return elm
  }

  const createStorageElmException = _ => {
    const elm = createStorageElm()
    elm.innerText = 'exception'
    elm.classList.add('badge-warning')
    return elm
  }

  const createStorageElmError = _ => {
    const elm = createStorageElm()
    elm.innerText = 'error'
    elm.classList.add('badge-danger')
    return elm
  }

  const createStorageElmUndefined = _ => {
    const elm = createStorageElm()
    elm.innerText = 'undefined'
    elm.classList.add('badge-info')
    return elm
  }

  const getStorageStatusForAPI = (apiName, proto) => {
    try {
      if (w[apiName] === undefined || w[apiName] === null) {
        return createStorageElmUndefined()
      } else if (Object.getPrototypeOf(w[apiName]) === proto) {
        return createStorageElmAllowed()
      } else {
        return createStorageElmError()
      }
    } catch (error) {
      return createStorageElmException()
    }
  }

  const getAllStorageTestResultsForDocument = _ => {
    const localStorageElm = getStorageStatusForAPI('localStorage', w.Storage.prototype)
    const sessionStorageElm = getStorageStatusForAPI('sessionStorage', w.Storage.prototype)
    const indexDbElm = getStorageStatusForAPI('indexedDB', w.IDBFactory.prototype)

    return {
      localStorage: localStorageElm.outerHTML,
      sessionStorage: sessionStorageElm.outerHTML,
      indexDB: indexDbElm.outerHTML
    }
  }

  const onMessage = msg => {
    if (msg.data.action !== 'storage-test-query') {
      return
    }

    msg.source.postMessage({
      action: 'storage-test-response',
      results: getAllStorageTestResultsForDocument(),
      selector: msg.data.selector
    }, '*')
  }

  window.addEventListener('message', onMessage, false)
})()
