(_ => {
  const W = window
  const D = W.document
  const L = W.location

  const alertElm = D.getElementById('alert-elm')
  const destUrlElm = D.getElementById('destination-url')
  const numSecElm = D.getElementById('num-seconds')

  const currentUrl = new URL(L.href.toString())
  const searchParams = currentUrl.searchParams

  const expectedKeys = ['destination', 'sec', 'value']
  const queryValues = Object.create(null)
  for (const anExpectedKey of expectedKeys) {
    const queryVal = searchParams.get(anExpectedKey)
    if (queryVal === undefined) {
      alertElm.classList.remove('d-none')
      alertElm.textContent = `Error: Didn't receive a query param for "${anExpectedKey}".`
      return
    }
    queryValues[anExpectedKey] = queryVal
  }

  destUrlElm.textContent = queryValues.destination
  numSecElm.textContent = queryValues.sec
  let remainingSec = +queryValues.sec

  const destUrl = new URL(queryValues.destination)
  destUrl.searchParams.set('value', queryValues.value)

  const intervalId = setInterval(_ => {
    if (remainingSec === 0) {
      clearInterval(intervalId)
      D.location = destUrl.toString()
      return
    }
    remainingSec -= 1
    numSecElm.textContent = remainingSec
  }, 1000)
})()
