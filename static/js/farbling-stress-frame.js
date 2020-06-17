(_ => {
  const FP2 = window.Fingerprint2
  const fp2Options = {
    excludes: {
      userAgent: true,
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
      plugins: true,
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
      audio: true,
      enumerateDevices: true
    }
  }

  const onMessage = e => {
    if (e.data.msg !== 'generate-fp') {
      return
    }

    const thisUrl = window.location.href

    FP2.get(fp2Options, values => {
      let combinedFp = ""
      for (const aFPValue of values) {
        const { _, value } = aFPValue
        const hashInput = Array.isArray(value) ? value.join('-') : value
        combinedFp += hashInput
      }

      window.parent.postMessage({
        action: 'stress-fp-complete',
        url: thisUrl,
        frameId: e.data.frameId,
        fingerprint: FP2.x64hash128(combinedFp, 0),
      }, '*')
    })
  }

  window.addEventListener('message', onMessage, false)
})()
