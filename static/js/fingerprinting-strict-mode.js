(async _ => {
  const W = window
  const D = W.document
  const BU = W.BRAVE
  const JQ = W.jQuery
  const FP2 = W.Fingerprint2
  const displayedHashLength = 8

  const scriptsToInject = [
    '/static/js/frames/fingerprinting-strict-mode.js'
  ]
  await BU.insertTestFramesWithScript(scriptsToInject)

  const htmlClassNameToArgCall = {
    'webgl-get-supported-extensions': {
      api: 'webgl-get-supported-extensions'
    },
    'webgl-get-extension-debug': {
      api: 'webgl-get-extension',
      args: ['WEBGL_debug_renderer_info']
    },
    'webgl-get-extension-other': {
      api: 'webgl-get-extension',
      args: ['WEBGL_lose_context']
    }
  }

  const hashSourceText = new Map()
  const modalHashText = document.querySelector('#modal .fp-hash')
  const modalInputText = document.querySelector('#modal .fp-input')
  const modalTitle = document.querySelector('#modal .modal-title')
  const modal = JQ('#modal')
  modal.modal({ show: false })
  modal.find('.modal-footer button').click(_ => {
    modal.modal('hide')
  })
  const showModalForElm = event => {
    const anchorElm = event.target
    const { title, hash, input } = hashSourceText.get(anchorElm)
    modalTitle.textContent = title
    modalHashText.textContent = hash
    modalInputText.textContent = input
    modal.modal('show')
  }

  const startBtnElm = D.getElementById('start')
  const getAllApiResults = async _ => {
    hashSourceText.clear()
    for (const [frameName, frameRef] of BU.getTestWindowNamesAndValues()) {
      for (const [clsName, apiArgs] of Object.entries(htmlClassNameToArgCall)) {
        const rs = await BU.sendPostMsg(frameRef, 'strict-mode::call', apiArgs)
        const cellAnchorSel = `tr.row-${clsName} td.cell-${frameName} a`
        const anchorElm = D.querySelector(cellAnchorSel)

        const cellDescSel = `tr.row-${clsName} th`
        const cellDescElm = D.querySelector(cellDescSel)
        const cellDesc = cellDescElm.textContent

        const jsonText = JSON.stringify(rs, null, 2)
        const rsHashText = FP2.x64hash128(jsonText, 0)
        hashSourceText.set(anchorElm, {
          hash: rsHashText,
          input: jsonText,
          title: cellDesc
        })
        anchorElm.textContent = rsHashText.substring(0, displayedHashLength)
        anchorElm.addEventListener('click', showModalForElm, false)
      }
    }
    startBtnElm.setAttribute('disabled', true)
  }
  startBtnElm.addEventListener('click', getAllApiResults, false)
  startBtnElm.removeAttribute('disabled')
})()
