(_ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const scriptPath = '/storage-test-set.js'
  const urlFuncs = [BU.thisOriginUrl, BU.otherOriginUrl]
  for (const aFunc of urlFuncs) {
    const scriptElm = D.createElement('script')
    scriptElm.src = aFunc(scriptPath)
    D.body.appendChild(scriptElm)
  }
})()