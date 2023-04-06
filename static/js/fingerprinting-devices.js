(async _ => {
  const W = window
  const D = W.document
  const N = W.navigator

  const devicesTestBtn = D.querySelector('#enumerate-devices-section button')
  const webUSBQueryBtn = D.querySelector('#webusb-section button.btn-primary')
  const webUSBCurrentBtn = D.querySelector('#webusb-section button.btn-secondary')

  const disablePage = _ => {
    devicesTestBtn.disabled = true
    webUSBQueryBtn.disabled = true
    webUSBCurrentBtn.disabled = true
  }

  const enablePage = _ => {
    devicesTestBtn.removeAttribute('disabled')
    webUSBQueryBtn.removeAttribute('disabled')
    webUSBCurrentBtn.removeAttribute('disabled')
  }

  const devicesSectionElm = D.getElementById('enumerate-devices-results')

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
    disablePage()
    devicesTestBtn.parentElement.removeChild(devicesTestBtn)

    await N.mediaDevices.getUserMedia({ audio: true, video: true })
    const devices = await N.mediaDevices.enumerateDevices()
    for (const device of devices) {
      handleNewDeviceItem(device)
    }
    enablePage()
  }
  devicesTestBtn.addEventListener('click', onClick, false)

  const webUSBResultsBody = D.querySelector('#webusb-section table tbody')
  const webUSBResultsTable = D.querySelector('#webusb-section table')

  const createUSBDeviceRow = (_ => {
    const webUSBProps = ['productName', 'vendorId', 'productId', 'serialNumber']
    return device => {
      const rowElm = D.createElement('tr')
      for (const aProp of webUSBProps) {
        const cellElm = D.createElement('td')
        const codeElm = D.createElement('code')
        codeElm.innerText = device[aProp]
        cellElm.appendChild(codeElm)
        rowElm.appendChild(cellElm)
      }
      return rowElm
    }
  })()

  const createResultMsgRow = (msg, isError) => {
    const errorRow = D.createElement('tr')
    const errorCell = D.createElement('td')
    errorRow.appendChild(errorCell)
    errorCell.setAttribute('colspan', 4)
    errorCell.classList.add(isError === true ? 'table-warning' : 'bg-info')
    errorCell.innerText = msg
    return errorRow
  }

  const updateUSBTable = async queryFunc => {
    webUSBResultsTable.classList.remove('d-none')
    disablePage()
    for (const resultRow of Array.from(webUSBResultsBody.children)) {
      webUSBResultsBody.removeChild(resultRow)
    }

    try {
      const devices = await queryFunc()
      for (const aDevice of devices) {
        const row = createUSBDeviceRow(aDevice)
        webUSBResultsBody.appendChild(row)
      }
    } catch (error) {
      webUSBResultsBody.appendChild(createResultMsgRow(error.toString(), true))
    }
    enablePage()
  }

  const onWebUSBQueryClick = async _ => {
    await updateUSBTable(async _ => {
      return await N.usb.requestDevice({ filters: [] })
    })
  }
  webUSBQueryBtn.addEventListener('click', onWebUSBQueryClick)

  const onWebUSBCurrentClick = async _ => {
    await updateUSBTable(async _ => {
      return await N.usb.getDevices()
    })
  }
  webUSBCurrentBtn.addEventListener('click', onWebUSBCurrentClick)

  enablePage()
})()
