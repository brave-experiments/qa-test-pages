(_ => {

const thisOrigin = document.location.host;
const otherOrigin = thisOrigin === "dev-pages.bravesoftware.com"
  ? "dev-pages.brave.software"
  : "dev-pages.bravesoftware.com"

const classToOrigin = {
  "other-origin": otherOrigin,
  "this-origin": thisOrigin
}

for (const [aClass, anOrigin] of Object.entries(classToOrigin)) {
  const elms = document.getElementsByClassName(aClass)
  for (const elm of elms) {
    const elmTagName = elm.tagName.toLowerCase()
    switch (elmTagName) {
      case "iframe":
      case "img":
      case "script":
        elm.src = "//" + anOrigin + elm.src
        break

      case "a":
        elm.href = "//" + anOrigin + elm.href
        break

      default:
        elm.textContent = anOrigin
        break
    }
  }
}

})()