(_ => {
  const FP2 = window.Fingerprint2
  const fp2Options = {
    excludes: {
      userAgent: false,
      webdriver: true,
      language: true,
      colorDepth: true,
      deviceMemory: true,
      pixelRatio: true,
      hardwareConcurrency: true,
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

  const displayedHashLength = 8

  const onMessage = msg => {
    if (msg.data.action !== 'fp-complete') {
      return
    }

    const isFromLocal = msg.data.isLocalFrame
    const cellClass = isFromLocal ? '.local-frame-value' : '.remote-frame-value'
    for (const [fpName, fpValue] of Object.entries(msg.data.fpValues)) {
      const anElm = document.querySelector(cellClass + '.value-' + fpName)
      if (!anElm) {
        continue
      }
      anElm.textContent = fpValue.substring(0, displayedHashLength)
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
        const hashInput = Array.isArray(value) ? value.join('-') : value
        const hashValue = FP2.x64hash128(hashInput, 0)
        anElm.textContent = hashValue.substring(0, displayedHashLength)
      }
    })
  })

  startButton.removeAttribute('disabled')
})()
