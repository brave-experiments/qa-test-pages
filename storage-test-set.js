(_ => {
  const randomKey = `storage-test-set-key-${Math.random()}`
  const randomValue = `storage-test-set-value-${Math.random()}`
  window.localStorage[randomKey] = randomValue
})()