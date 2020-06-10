(_ => {
  const braveSoftwareOrigin = 'dev-pages.bravesoftware.com'
  const braveSoftwareComOrigin = 'dev-pages.brave.software'

  const thisOrigin = document.location.host
  const bodyElm = document.body
  let otherOrigin

  switch (thisOrigin) {
    case braveSoftwareOrigin:
      otherOrigin = braveSoftwareComOrigin
      bodyElm.className += ' brave-software-com'
      break

    case braveSoftwareComOrigin:
      otherOrigin = braveSoftwareOrigin
      bodyElm.className += ' brave-software'
      break
  }

  const classToOrigin = {
    'other-origin': otherOrigin,
    'this-origin': thisOrigin
  }

  for (const [aClass, anOrigin] of Object.entries(classToOrigin)) {
    const elms = document.getElementsByClassName(aClass)
    for (const elm of elms) {
      const elmTagName = elm.tagName.toLowerCase()
      switch (elmTagName) {
        case 'iframe':
        case 'img':
        case 'script':
          elm.src = '//' + anOrigin + elm.src
          break

        case 'a':
          elm.href = '//' + anOrigin + elm.href
          break

        default:
          elm.textContent = anOrigin
          break
      }
    }
  }
})()
