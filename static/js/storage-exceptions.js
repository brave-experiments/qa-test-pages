(_ => {
  const d = window.document
  const w = window

  const localFrame = d.querySelector('iframe.this-origin')
  const remoteFrame = d.querySelector('iframe.other-origin')

  // Mapping of CSS selector of test row, to the global context to test against.
  const testElements = {
    '.storage-row-first-party': w,
    '.storage-row-first-party-frame': localFrame.contentWindow,
    '.storage-row-third-party-frame': remoteFrame.contentWindow
  }

  const populateTableRowWithTestResults = (rowCSSSelector, testResults) => {
    const tableRowElm = d.querySelector(rowCSSSelector)
    const localStorageCell = tableRowElm.querySelector('.localstorage-received')
    localStorageCell.innerHTML = testResults.localStorage

    const sessionStorageCell = tableRowElm.querySelector('.sessionstorage-received')
    sessionStorageCell.innerHTML = testResults.sessionStorage

    const indexDBCell = tableRowElm.querySelector('.indexdb-received')
    indexDBCell.innerHTML = testResults.indexDB
  }

  setTimeout(_ => {
    Object.entries(testElements).forEach(entries => {
      const [sel, global] = entries
      const msg = {
        action: 'storage-test-query',
        selector: sel
      }
      global.postMessage(msg, '*')
    })
  }, 1500)

  const onMessage = msg => {
    if (msg.data.action !== 'storage-test-response') {
      return
    }
    populateTableRowWithTestResults(msg.data.selector, msg.data.results)
  }

  w.addEventListener('message', onMessage, false)
})()
