(_ => {
  const braveUtils = window.BRAVE
  const FP2 = window.Fingerprint2
  const fp2Options = {
    excludes: {
      userAgent: false,
      webdriver: true,
      language: true,
      colorDepth: true,
      deviceMemory: true,
      pixelRatio: true,
      hardwareConcurrency: false,
      screenResolution: true,
      availableScreenResolution: true,
      timezoneOffset: true,
      timezone: true,
      sessionStorage: true,
      localStorage: true,
      indexedDb: true,
      addBehavior: true,
      openDatabase: true,
      cpuClass: true,
      platform: true,
      doNotTrack: true,
      plugins: false,
      canvas: false,
      webgl: false,
      webglVendorAndRenderer: false,
      adBlock: true,
      hasLiedLanguages: true,
      hasLiedResolution: true,
      hasLiedOs: true,
      hasLiedBrowser: true,
      touchSupport: true,
      fonts: true,
      fontsFlash: true,
      audio: false,
      enumerateDevices: false
    }
  }

  const fpFramePath = '/frames/farbling-stress.html'
  const randIframeUrl = _ => {
    const randInt = Math.floor(Math.random() * 1000) % 2
    if (randInt === 0) {
      return braveUtils.thisOriginUrl(fpFramePath)
    } else {
      return braveUtils.otherOriginUrl(fpFramePath)
    }
  }

  const displayedHashLength = 8
  const stressTableBody = document.querySelector('#stress-table tbody')
  const onMessage = msg => {
    if (msg.data.action === 'fp-complete') {
      const isFromLocal = msg.data.isLocalFrame
      const cellClass = isFromLocal ? '.local-frame-value' : '.remote-frame-value'
      for (const [fpName, fpValue] of Object.entries(msg.data.fpValues)) {
        const anElm = document.querySelector(cellClass + '.value-' + fpName)
        if (!anElm) {
          continue
        }
        anElm.textContent = fpValue.substring(0, displayedHashLength)
      }
      return
    }

    if (msg.data.action === 'stress-fp-complete') {
      const newRow = document.createElement('tr')

      const fingerprint = msg.data.fingerprint
      const fingerprintElm = document.createElement('td')
      fingerprintElm.textContent = fingerprint.substring(0, displayedHashLength)
      newRow.appendChild(fingerprintElm)

      const url = msg.data.url
      const urlElm = document.createElement('td')
      urlElm.textContent = url
      newRow.appendChild(urlElm)

      const time = (new Date()).toISOString()
      const timeElm = document.createElement('td')
      timeElm.textContent = time
      newRow.appendChild(timeElm)

      stressTableBody.appendChild(newRow)
      const frameId = msg.data.frameId
      const iframeElm = document.getElementById(frameId)
      document.body.removeChild(iframeElm)
    }
  }
  window.addEventListener('message', onMessage, false)

  const startButton = document.getElementById('start')
  const iframeElms = document.getElementsByTagName('iframe')

  startButton.addEventListener('click', _ => {
    for (const aFrame of iframeElms) {
      aFrame.contentWindow.postMessage('generate', '*')
    }

    startButton.setAttribute('disabled', true)
    startButton.textContent = 'Generating fingerprints'
    FP2.get(fp2Options, values => {
      startButton.textContent = 'Finished'
      for (const aFPValue of values) {
        const { key, value } = aFPValue
        const anElm = document.querySelector('.local-value.value-' + key)
        if (!anElm) {
          continue
        }
        const hashInput = Array.isArray(value) ? value.join('-') : String(value)
        const hashValue = FP2.x64hash128(hashInput, 0)
        anElm.textContent = hashValue.substring(0, displayedHashLength)
      }
    })
  })
  startButton.removeAttribute('disabled')

  let frameCounter = 1
  const iframeFingerprintValues = url => {
    const newFrame = document.createElement('iframe')
    const frameId = 'stress-frame-' + frameCounter
    frameCounter += 1
    newFrame.loading = 'eager'
    newFrame.style.display = 'none'
    newFrame.id = frameId
    window.document.body.appendChild(newFrame)
    newFrame.src = url
    newFrame.onload = _ => {
      setTimeout(_ => {
        newFrame.contentWindow.postMessage({
          msg: 'generate-fp',
          frameId
        }, '*')
      }, 1000)
    }
  }

  const stressButton = document.getElementById('stress-button')
  let timerId = false
  const stopStressTest = _ => {
    clearInterval(timerId)
    stressButton.setAttribute('disabled', true)
    stressButton.textContent = 'Stress test finished'
  }

  const startStressTest = _ => {
    stressButton.removeEventListener('click', startStressTest)
    stressButton.addEventListener('click', stopStressTest, false)
    stressButton.textContent = 'Stop stress test'
    timerId = setInterval(_ => {
      iframeFingerprintValues(randIframeUrl())
    }, 1000)
  }
  stressButton.addEventListener('click', startStressTest, false)
  stressButton.removeAttribute('disabled')
})()
