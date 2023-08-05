export function centerVertically(element) {
    element.style.top = `${(document.body.clientHeight / 2) - (element.offsetHeight / 2)}px`
}