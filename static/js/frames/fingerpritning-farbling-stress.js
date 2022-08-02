(_ => {
  const FP2 = window.Fingerprint2
  const fp2Options = {
    fonts: {
      extendedJsFonts: true
    },
    excludes: {
      userAgent: true,
      webdriver: true,
      language: true,
      colorDepth: true,
      deviceMemory: false,
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
      fonts: false,
      fontsFlash: true,
      audio: true,
      enumerateDevices: false,
      webglParams: false,
      navigatorLanguages: false
    }
  }

  const onMessage = e => {
    if (e.data.msg !== 'generate-fp') {
      return
    }

    const thisUrl = window.location.href

    FP2.get(fp2Options, values => {
      let combinedFp = ''
      for (const aFPValue of values) {
        const value = aFPValue.value
        const hashInput = Array.isArray(value) ? value.join('-') : String(value)
        combinedFp += hashInput
      }

      window.parent.postMessage({
        action: 'stress-fp-complete',
        url: thisUrl,
        frameId: e.data.frameId,
        fingerprint: FP2.x64hash128(combinedFp, 0)
      }, '*')
    })
  }

  window.addEventListener('message', onMessage, false)
})()
