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

  const onMessage = e => {
    if (e.data !== 'generate') {
      return
    }

    let isLocalFrame
    try {
      isLocalFrame = !!window.parent.location.origin
    } catch (_) {
      isLocalFrame = false
    }

    const fpValues = Object.create(null)

    FP2.get(fp2Options, values => {
      for (const aFPValue of values) {
        const { key, value } = aFPValue
        const hashInput = Array.isArray(value) ? value.join('-') : String(value)
        const hashValue = FP2.x64hash128(hashInput, 0)
        fpValues[key] = hashValue
      }

      window.parent.postMessage({
        action: 'fp-complete',
        fpValues,
        isLocalFrame
      }, '*')
    })
  }

  window.addEventListener('message', onMessage, false)
})()
