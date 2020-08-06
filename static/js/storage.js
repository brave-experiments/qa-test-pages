(_ => {
  const hideClass = 'd-none'
  const valueElm = document.getElementsByTagName('code')[0]
  const alertElm = document.getElementById('alert')
  const dlElm = document.getElementsByTagName('dl')[0]

  const storageValueElm = document.getElementById('storage-value')
  const setStorageButton = document.getElementById('set-button')
  const clearStorageButton = document.getElementById('clear-button')

  const frameElms = document.getElementsByTagName('iframe')

  setInterval(_ => {
    try {
      const value = window.localStorage.getItem('storage-key')
      valueElm.textContent = value
      dlElm.classList.remove(hideClass)
      alertElm.classList.add(hideClass)
    } catch (error) {
      dlElm.classList.add(hideClass)
      alertElm.classList.remove(hideClass)
      alertElm.textContent = error
    }
  }, 500)

  setStorageButton.addEventListener('click', _ => {
    const storageValue = storageValueElm.value
    for (const aFrame of frameElms) {
      aFrame.contentWindow.postMessage({
        type: 'set',
        value: storageValue
      }, '*')
    }
  }, false)

  clearStorageButton.addEventListener('click', _ => {
    for (const aFrame of frameElms) {
      aFrame.contentWindow.postMessage({
        type: 'clear'
      }, '*')
    }
  }, false)
})()
