(_ => {
  const hideClass = 'd-none'
  const alertElm = document.getElementById('alert')
  const valueElm = document.getElementsByTagName('code')[0]
  const dlElm = document.getElementsByTagName('dl')[0]

  const clearStorage = _ => {
    window.localStorage.clear()
    alertElm.classList.remove(hideClass)
    alertElm.textContent = 'Storage cleared'
  }

  const setStorage = (value) => {
    try {
      window.localStorage.setItem('storage-key', value)
      alertElm.classList.add(hideClass)
    } catch (e) {
      alertElm.textContent = e
      dlElm.classList.add(hideClass)
    }
  }

  const onMessage = msg => {
    switch (msg.data.type) {
      case 'clear':
        return clearStorage()
      case 'set':
        return setStorage(msg.data.value)
    }
  }

  window.addEventListener('message', onMessage, false)

  setInterval(_ => {
    try {
      const value = window.localStorage.getItem('storage-key')
      valueElm.textContent = value
      dlElm.classList.remove(hideClass)
    } catch (error) {
      dlElm.classList.add(hideClass)
      alertElm.classList.remove(hideClass)
      alertElm.textContent = error
    }
  }, 500)
})()
