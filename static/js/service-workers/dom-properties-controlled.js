/* eslint-env worker,serviceworker */

const getProperties = _ => {
  return {
    gpc: navigator.globalPrivacyControl,
    isbrave: navigator.brave === undefined ? null : true,
    connection: navigator.connection && 'NetworkInformation'
  }
}

let isServiceWorker
try {
  isServiceWorker = !!self.clients
} catch (e) {
  isServiceWorker = false
}

if (isServiceWorker) {
  self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting())
  })

  self.addEventListener('activate', event => {
    event.waitUntil(clients.claim())
  })

  self.addEventListener('message', async event => {
    if (event.data !== 'read') {
      console.error(`Unexpected message: ${event.data}`)
      return
    }

    const client = await clients.get(event.source.id)
    client.postMessage({
      action: 'read',
      context: 'serviceworker',
      navigator: getProperties()
    })
  })
} else { // Is a WebWorker
  postMessage({
    action: 'read',
    context: 'worker',
    navigator: getProperties()
  })
}
