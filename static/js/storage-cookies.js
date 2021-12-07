(async _ => {
  const W = window
  const C = W.Cookies
  const D = W.document
  const N = W.navigator
  const SW = N.serviceWorker
  const BU = W.BRAVE

  const startButtonElm = D.getElementById('button-start-test')
  const cleanupButtonElm = D.getElementById('button-cleanup')

  const swUrl = './cookies-service-worker.js'
  startButtonElm.setAttribute('disabled', true)

  const cookieStates = ['secure', 'insecure']
  const originStates = {
    secure: BU.thisOriginUrlSecure,
    insecure: BU.thisOriginUrlInsecure
  }
  const cookieTests = {}

  for (const aCookieState of cookieStates) {
    for (const [anOriginState, aUrlFunc] of Object.entries(originStates)) {
      const testKey = `${aCookieState}-to-${anOriginState}`
      const testUrl = `/storage/test.txt?cookie-test=${testKey}`
      cookieTests[testKey] = {
        id: `cell-${testKey}-result`,
        url: aUrlFunc(testUrl)
      }
    }
  }

  const unregisterAll = async _ => {
    cleanupButtonElm.setAttribute('disabled', true)
    const currentRegistrations = await SW.getRegistrations()
    for (const aSWRegistration of currentRegistrations) {
      await aSWRegistration.unregister()
    }
    cleanupButtonElm.removeAttribute('disabled')
  }
  cleanupButtonElm.addEventListener('click', unregisterAll, false)

  const onMessage = async msg => {
    const { action, result } = msg.data
    const receivedTest = cookieTests[action]
    if (receivedTest === undefined) {
      throw Error(`Received unknown response action: ${action}`)
    }
    const resultElm = D.getElementById(receivedTest.id)
    resultElm.textContent = result ? 'sent' : 'not sent'
    startButtonElm.removeAttribute('disabled')
  }
  SW.addEventListener('message', onMessage, false)

  if ((await SW.getRegistrations()).length === 0) {
    await SW.register(swUrl)
    W.location.reload()
    return
  }

  const onClick = async _ => {
    startButtonElm.setAttribute('disabled', true)
    for (const [testName, testSettings] of Object.entries(cookieTests)) {
      C.set(testName, '1', {
        secure: true,
        sameSite: 'Strict'
      })
      try {
        await W.fetch(testSettings.url, {
          credentials: 'same-origin'
        })
      } catch (error) {
        console.log(error)
      }
      C.remove(testName)
    }
  }

  startButtonElm.addEventListener('click', onClick, false)
  startButtonElm.removeAttribute('disabled')
})()
