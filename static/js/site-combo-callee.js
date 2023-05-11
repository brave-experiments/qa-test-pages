/* eslint-env worker,serviceworker */

(async _ => {
  const isWorker = !!(self && self.importScripts)
  const isServiceWorker = !!(isWorker && self && self.clients)
  const isFrame = !isWorker

  if (isWorker) {
    self.importScripts('/static/js/site.js')
  }

  const handlerReg = new Map()
  const registerHandlerForAction = (action, callback) => {
    handlerReg[action] = callback
  }

  const onWorkerMessage = async event => {
    const request = event.data
    const { action } = request

    const response = await handlerReg[action](request)
    if (isServiceWorker) {
      const client = await clients.get(event.source.id)
      client.postMessage({
        request, response
      })
      return
    }

    if (isWorker) {
      self.postMessage({ request, response })
    }
  }

  const startListening = _ => {
    if (isWorker) {
      if (isServiceWorker) {
        self.addEventListener('install', event => {
          event.waitUntil(self.skipWaiting())
        })

        self.addEventListener('activate', event => {
          event.waitUntil(clients.claim())
        })
      }

      self.addEventListener('message', onWorkerMessage)
    }

    if (isFrame) {
      const W = window
      const BU = W.BRAVE

      BU.receivePostMsg(async (action, request) => {
        const response = await handlerReg[action](request)
        return { data: { response, request } }
      })
    }
  }

  self.BRAVE_COMBO_CALLEE = {
    registerHandlerForAction,
    startListening
  }
})()
