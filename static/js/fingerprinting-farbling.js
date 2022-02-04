(async _ => {
  const W = window
  const braveUtils = W.BRAVE
  const N = W.navigator
  const SW = N.serviceWorker
  const FP2 = W.Fingerprint2
  const jQuery = W.jQuery

  const fp2Options = {
    fonts: {
      extendedJsFonts: true
    },
    excludes: {
      userAgent: false,
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
      audio: false,
      enumerateDevices: false,
      'canvas-red': false,
      'canvas-green': false,
      'canvas-blue': false,
      speechSynthesisVoices: false
    }
  }

  const swUrl = './fingerprinting-farbling-service-worker.js'
  if (SW.controller === null || (await SW.getRegistrations()).length === 0) {
    await SW.register(swUrl)
    W.location.reload()
    return
  }

  const fpFramePath = '/frames/fingerprinting-farbling-stress.html'
  const randIframeUrl = _ => {
    const randInt = Math.floor(Math.random() * 1000) % 2
    if (randInt === 0) {
      return braveUtils.thisOriginUrl(fpFramePath)
    } else {
      return braveUtils.otherOriginUrl(fpFramePath)
    }
  }

  const fpElms = new Map()
  const modalHashText = document.querySelector('#farbling-modal .fp-hash')
  const modalInputText = document.querySelector('#farbling-modal .fp-input')
  const modalTitle = document.querySelector('#farbling-modal .modal-title')
  const modal = jQuery('#farbling-modal')
  modal.modal({ show: false })
  modal.find('.modal-footer button').click(_ => {
    modal.modal('hide')
  })

  const showModalForElm = event => {
    const anchorElm = event.target
    if (fpElms.has(anchorElm) === false) {
      return
    }
    const [fpName, fpInput, fpHash] = fpElms.get(anchorElm)
    modalTitle.textContent = fpName
    modalHashText.textContent = fpHash
    modalInputText.textContent = fpInput
    modal.modal('show')
  }

  let numIFrameTestsInAir = 0
  const displayedHashLength = 8
  const stressTableBody = document.querySelector('#stress-table tbody')
  const onMessage = msg => {
    if (msg.data.action === 'fp-complete') {
      const context = msg.data.context
      const cellClass = `.${context}-value`
      if (context.includes('-frame')) {
        numIFrameTestsInAir -= 1
        if (numIFrameTestsInAir === 0) {
          for (const aFrame of iframeElms) {
            aFrame.classList.add('d-none')
          }
        }
      }
      for (const [fpName, [fpInput, fpHash]] of Object.entries(msg.data.fpValues)) {
        const selector = cellClass + '.value-' + fpName
        const tdElm = document.querySelector(selector)
        if (!tdElm) {
          continue
        }

        tdElm.textContent = ''
        const anchorElm = document.createElement('a')
        anchorElm.className = 'badge badge-light'
        tdElm.appendChild(anchorElm)
        anchorElm.textContent = fpHash.substring(0, displayedHashLength)
        anchorElm.addEventListener('click', showModalForElm, false)
        fpElms.set(anchorElm, [fpName, fpInput, fpHash])
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
  W.addEventListener('message', onMessage, false)
  SW.addEventListener('message', onMessage, false)

  const startButton = document.getElementById('start')
  const iframeElms = Array.from(document.getElementsByTagName('iframe'))

  startButton.addEventListener('click', _ => {
    SW.controller.postMessage('generate')

    const worker = new W.Worker('./static/js/workers/fingerprinting-farbling.js')
    worker.onmessage = onMessage

    for (const aFrame of iframeElms) {
      numIFrameTestsInAir += 1
      aFrame.classList.remove('d-none')
      aFrame.contentWindow.postMessage('generate', '*')
    }

    startButton.setAttribute('disabled', true)
    startButton.textContent = 'Generating fingerprints'
    FP2.get(fp2Options, values => {
      startButton.textContent = 'Finished'
      for (const aFPValue of values) {
        const { key, value } = aFPValue
        const tdElm = document.querySelector('.local-value.value-' + key)
        if (!tdElm) {
          continue
        }
        const fpInput = Array.isArray(value) ? value.join('-') : String(value)
        const fpHash = FP2.x64hash128(fpInput, 0)

        tdElm.textContent = ''
        const anchorElm = document.createElement('a')
        anchorElm.className = 'badge badge-light'
        tdElm.appendChild(anchorElm)
        anchorElm.textContent = fpHash.substring(0, displayedHashLength)
        anchorElm.addEventListener('click', showModalForElm, false)
        fpElms.set(anchorElm, [key, fpInput, fpHash])
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
    W.document.body.appendChild(newFrame)
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
