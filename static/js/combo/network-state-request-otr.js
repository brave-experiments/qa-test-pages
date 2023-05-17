/* eslint-env worker,serviceworker */

(async _ => {
  if (self.importScripts) {
    await self.importScripts('/static/js/site-combo-callee.js')
  }

  const idbJsLibPath = '/static/js/libs/idb.js'

  const readAction = 'network-state::request-otr::read'
  const writeAction = 'network-state::request-otr::write'

  const dbName = 'network-state::request-otr'
  const storeName = 'network-state::request-otr::store'

  const W = self
  const BCC = W.BRAVE_COMBO_CALLEE

  const onReadMessage = async request => {
    const handleName = request.handleName
    const { key } = request.args
    if (W.localStorage) {
      return W.localStorage[key + '::' + handleName]
    }

    if (!self.idb) {
      await self.importScripts(idbJsLibPath)
    }

    const db = await self.idb.openDB(dbName)
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const value = await store.get(key)
    await tx.complete
    return value
  }

  const onWriteMessage = async request => {
    const handleName = request.handleName
    const { key, value } = request.args

    if (W.localStorage) {
      W.localStorage[key + '::' + handleName] = value
      return true
    }

    if (!self.idb) {
      await self.importScripts(idbJsLibPath)
    }

    const db = await self.idb.openDB(dbName)
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    await store.put({
      [[key]]: value
    })
    await tx.complete
    return true
  }

  BCC.registerHandlerForAction(readAction, onReadMessage)
  BCC.registerHandlerForAction(writeAction, onWriteMessage)

  await BCC.startListening()
})()
