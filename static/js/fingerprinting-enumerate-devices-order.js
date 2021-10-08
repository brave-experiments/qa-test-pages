(async _ => {
  const W = window
  const D = W.document
  const N = W.navigator

  const devicesSectionElm = D.getElementById('enumerate-devices-section')
  const startBtnElm = D.getElementById('start')

  const addDeviceKindElm = (_ => {
    const deviceKindMap = Object.create(null)
    return kindName => {
      if (deviceKindMap[kindName] !== undefined) {
        return deviceKindMap[kindName]
      }

      const titleElm = D.createElement('h3')
      const listElm = D.createElement('ul')
      titleElm.textContent = kindName
      devicesSectionElm.appendChild(titleElm)
      devicesSectionElm.appendChild(listElm)
      deviceKindMap[kindName] = listElm
      return listElm
    }
  })()

  const addDeviceToList = (list, deviceDetails) => {
    const listItemElm = D.createElement('li')
    const itemLabelElm = D.createElement('strong')
    itemLabelElm.textContent = deviceDetails.label + ': '
    const itemIdElm = D.createElement('span')
    itemIdElm.textContent = deviceDetails.deviceId

    listItemElm.appendChild(itemLabelElm)
    listItemElm.appendChild(itemIdElm)
    list.appendChild(listItemElm)
  }

  const handleNewDeviceItem = deviceItem => {
    const { kind } = deviceItem
    const listItem = addDeviceKindElm(kind)
    addDeviceToList(listItem, deviceItem)
  }

  const onClick = async _ => {
    startBtnElm.parentElement.removeChild(startBtnElm)

    await N.mediaDevices.getUserMedia({ audio: true, video: true })
    const devices = await N.mediaDevices.enumerateDevices()
    for (const device of devices) {
      handleNewDeviceItem(device)
    }
  }
  startBtnElm.addEventListener('click', onClick, false)
  startBtnElm.removeAttribute('disabled')
})()
