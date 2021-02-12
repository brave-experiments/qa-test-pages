(_ => {
  const W = window
  const D = W.document

  const preImage = D.getElementById('pre-image')
  const postImage = D.getElementById('post-image')
  const postCanvas = D.getElementById('post-canvas')
  const height = preImage.height
  const width = preImage.width

  postCanvas.style.height = height + 'px'
  postCanvas.style.width = width + 'px'
  postCanvas.height = height
  postCanvas.width = width
  postCanvas.style.display = 'none'
  postImage.style.display = 'none'
  const postCanvasContext = postCanvas.getContext('2d')

  const startButtonElm = D.getElementById('run-test-button')
  const testSelectElm = D.getElementById('test-select')
  startButtonElm.setAttribute('disabled', true)

  const resetResult = _ => {
    startButtonElm.setAttribute('disabled', true)
    postImage.style.display = 'none'
    postCanvas.style.display = 'none'
    postCanvasContext.clearRect(0, 0, height, width)
    postImage.src = ''
  }

  const setCanvasResult = imageData => {
    postImage.style.display = 'none'
    postCanvas.style.display = 'block'
    postCanvasContext.putImageData(imageData, 0, 0)
    startButtonElm.removeAttribute('disabled')
  }

  const setImageResult = imageDataUrl => {
    postCanvas.style.display = 'none'
    postImage.style.display = 'block'
    postImage.src = imageDataUrl
    startButtonElm.removeAttribute('disabled')
  }

  const onWorkerMsg = msg => {
    const msgData = msg.data
    switch (msgData.type) {
      case 'canvas':
        setCanvasResult(msgData.imageData)
        break

      case 'image':
        setImageResult(msgData.imageData)
        break

      default:
        throw new Error(`Unexpected worker response argument: ${msgData.type}`)
    }
  }

  const worker = new W.Worker('/static/js/workers/farbling-debug.js')
  worker.onmessage = onWorkerMsg

  const blobToDataUrl = blob => {
    return new Promise((resolve) => {
      const reader = new W.FileReader()
      reader.addEventListener('load', _ => {
        resolve(reader.result)
      }, false)

      reader.readAsDataURL(blob)
    })
  }

  const localWebApiCall = async webApi => {
    const canvas = D.createElement('canvas')
    canvas.height = height
    canvas.width = width
    canvas.style.display = 'block'
    const context = canvas.getContext('2d')
    context.drawImage(preImage, 0, 0, width, height)

    switch (webApi) {
      case 'toDataURL': {
        const dataUrl = canvas.toDataURL()
        setImageResult(dataUrl)
      }
        break

      case 'toBlob':
        canvas.toBlob(async blob => {
          setImageResult(await blobToDataUrl(blob))
        })
        break

      case 'getImageData':
        setCanvasResult(context.getImageData(0, 0, width, height))
        break

      default:
        throw new Error(`Unexpected webApi argument: ${webApi}`)
    }
  }

  const onStartTest = async event => {
    event.preventDefault()
    resetResult()
    const testDesc = testSelectElm.value
    const [context, webApi] = testDesc.split(':')

    if (context === 'worker') {
      worker.postMessage({
        imageData: await W.createImageBitmap(preImage),
        webApi,
        height,
        width
      })
      return
    }

    localWebApiCall(webApi)
  }
  startButtonElm.addEventListener('click', onStartTest, false)
  startButtonElm.removeAttribute('disabled')
})()
