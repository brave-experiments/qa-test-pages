(_ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE

  const blobTestBtn = D.getElementById('blob-test')
  const runBlobTest = _ => {
    const randomValue = Math.random()
    const blobUrl = W.URL.createObjectURL(new W.Blob([randomValue.toString()]))
    const testUrlPath = '/storage/tests/partitioning-blob.html'
    const testParams = `value=${encodeURIComponent(randomValue)}&url=${encodeURIComponent(blobUrl)}`
    const testUrl = BU.otherOriginUrl(`${testUrlPath}?${testParams}`)
    W.open(testUrl)
  }
  blobTestBtn.addEventListener('click', runBlobTest, false)
  blobTestBtn.removeAttribute('disabled')
})()
