/* eslint-env worker */

const convertOptions = {
  type: 'image/png',
  quality: 1
}

self.onmessage = async msg => {
  const { data } = msg
  const { imageData, webApi, height, width } = data

  const canvas = new self.OffscreenCanvas(width, height)
  const context = canvas.getContext('2d')
  context.drawImage(imageData, 0, 0)

  const result = Object.create(null)
  switch (webApi) {
    case 'convertToBlob':
      result.imageData = URL.createObjectURL(await canvas.convertToBlob(convertOptions))
      result.type = 'image'
      break

    case 'getImageData':
      result.imageData = context.getImageData(0, 0, width, height)
      result.type = 'canvas'
      break

    default:
      throw new Error(`Unexpected webApi argument: ${webApi}`)
  }

  self.postMessage(result)
}
