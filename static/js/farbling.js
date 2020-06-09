(_ => {

const fp2Options = {
  excludes: {
    "userAgent": false,
    "webdriver": true,
    "language": true,
    "colorDepth": true,
    "deviceMemory": true,
    "pixelRatio": true,
    "hardwareConcurrency": true,
    "screenResolution": true,
    "availableScreenResolution": true,
    "timezoneOffset": true,
    "timezone": true,
    "sessionStorage": true,
    "localStorage": true,
    "indexedDb": true,
    "addBehavior": true,
    "openDatabase": true,
    "cpuClass": true,
    "platform": true,
    "doNotTrack": true,
    "plugins": false,
    "canvas": false,
    "webgl": false,
    "webglVendorAndRenderer": false,
    "adBlock": true,
    "hasLiedLanguages": true,
    "hasLiedResolution": true,
    "hasLiedOs": true,
    "hasLiedBrowser": true,
    "touchSupport": true,
    "fonts": true,
    "fontsFlash": true,
    "audio": false,
    "enumerateDevices": false,
  }
}

const startButton = document.getElementById("start")
const iframeElms = document.getElementsByTagName("iframe")

startButton.addEventListener("click", _ => {
  for (const aFrame of iframeElms) {
    aFrame.contentWindow.postMessage("generate", "*")
  }

  startButton.setAttribute("disabled", true)
  startButton.textContent = "Generating fingerprints"
  Fingerprint2.get(fp2Options, values => {
    startButton.textContent = "Finished"
    for (const aFPValue of values) {
      const {key, value} = aFPValue
      for (const anElm of document.getElementsByClassName("value-" + key)) {
        const hashInput = Array.isArray(value) ? value.join("-") : value
        const hashValue = Fingerprint2.x64hash128(hashInput, 0)
        anElm.textContent = hashValue
      }
    }
  })
})

startButton.removeAttribute("disabled")

})()