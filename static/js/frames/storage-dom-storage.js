(async _ => {
  const W = window || global
  const D = W.document
  const BU = W.BRAVE

  const randNum = W.Math.random()
  const testKey = `dom-storage-key-${randNum}`
  const testValue = `dom-storage-value-${randNum}`

  const isCookiesAvailable = async _ => {
    const testCookie = `${testKey}=${testValue}`
    try {
      D.cookie = testCookie
      return D.cookie.includes(testCookie)
    } catch (_) {
      return false
    }
  }

  const isLocalStorageAvailable = async _ => {
    try {
      W.localStorage.setItem(testKey, testValue)
      const testResult = W.localStorage.getItem(testKey) === testValue
      W.localStorage.removeItem(testKey)
      return testResult
    } catch (_) {
      return false
    }
  }

  const isSessionStorageAvailable = async _ => {
    try {
      W.sessionStorage.setItem(testKey, testValue)
      const testResult = W.sessionStorage.getItem(testKey) === testValue
      W.sessionStorage.removeItem(testKey)
      return testResult
    } catch (_) {
      return false
    }
  }

  const isWindowCachesAvailable = async _ => {
    try {
      await W.caches.open(testKey)
      return true
    } catch (_) {
      return false
    }
  }

  const methodToTestMap = {
    cookies: isCookiesAvailable,
    localStorage: isLocalStorageAvailable,
    sessionStorage: isSessionStorageAvailable,
    caches: isWindowCachesAvailable
  }

  const testStorageAvailability = async methodName => {
    return await methodToTestMap[methodName]()
  }

  const onMessage = async (action, msg) => {
    switch (action) {
      case 'dom-storage::test': {
        const storageMethod = msg
        const callResult = await testStorageAvailability(storageMethod)
        return callResult
      }
    }
  }
  BU.receivePostMsg(onMessage)
})()
