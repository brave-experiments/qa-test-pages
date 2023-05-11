/* eslint-env worker,serviceworker */

(async _ => {
  if (self.importScripts) {
    await self.importScripts('/static/js/site-combo-callee.js')
  }

  const action = 'filtering::network-requests::read'
  const W = self
  const BU = W.BRAVE
  const BCC = W.BRAVE_COMBO_CALLEE

  const originFuncMap = {
    this: BU.thisOriginUrl,
    other: BU.otherOriginUrl
  }

  const currentUrlStr = W.location.toString()

  const urlTestCaseMap = {
    full: url => {
      return (new W.URL(url, currentUrlStr)).toString()
    },
    protocol: url => {
      const fullUrl = new W.URL(url, currentUrlStr)
      return `//${fullUrl.hostname}${fullUrl.pathname}${fullUrl.search}`
    },
    path: url => {
      const fullUrl = new W.URL(url, currentUrlStr)
      return fullUrl.pathname + fullUrl.search
    }
  }

  const resourceUrl = '/static/images/test.jpg?335962573013224749'
  const isTestUrlBlocked = async (whichOrigin, urlTestCase) => {
    const urlTestFunc = urlTestCaseMap[urlTestCase]
    const originFunc = originFuncMap[whichOrigin]
    const urlToFetch = urlTestFunc(originFunc(resourceUrl))

    return new Promise(resolve => {
      fetch(urlToFetch, { mode: 'no-cors' })
        .then(response => response.blob())
        .then(blob => {
          console.log(blob)
          resolve(blob.size === 0)
        })
        .catch(_ => {
          resolve(true)
        })
    })
  }

  const onMessage = async request => {
    const { originTestCase, urlTestCase } = request.args
    return await isTestUrlBlocked(originTestCase, urlTestCase)
  }

  BCC.registerHandlerForAction(action, onMessage)

  await BCC.startListening()
})()
