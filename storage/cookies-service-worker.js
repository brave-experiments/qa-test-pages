/* eslint-env serviceworker */

const testToken = '?cookie-test='

self.addEventListener('fetch', async event => {
  const request = event.request

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  if (request.url.includes(testToken) === true) {
    const testName = request.url.split(testToken)[1]
    const sentCookies = request.headers.get('cookie')
    const didReceiveSecureCookie = (
      sentCookies !== null &&
      sentCookies.includes(testName)
    )

    const client = await self.clients.get(event.clientId)
    client.postMessage({
      action: testName,
      result: didReceiveSecureCookie
    })
  }

  return fetch(request)
})
