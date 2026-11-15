export const enrich = async (html, secrets = false) => {
  if (html)
    return await TextEditor.enrichHTML(html, {
      secrets: secrets,
      async: true,
    })

  return html
}

export const listToRows = (array, columns) => {
  const result = []
  let currentRow = []

  for (const index in array) {
    currentRow.push(array[index])

    if ((parseInt(index) + 1) % columns === 0) {
      result.push(currentRow)
      currentRow = []
    }
  }

  if (currentRow.length > 0)
    result.push(Array.from({ ...currentRow, length: columns }))

  return result
}

export const clamp = (value, max, min = 0) =>
  Math.min(max, Math.max(min, value))

export const clickModifiers = (event) => event.shiftKey || event.ctrlKey

export const makeSortable = (list, selector, onMove) => {
  const items = () => [...list.querySelectorAll(`:scope > ${selector}`)]
  let dragged = null
  let startIndex = -1
  let origin = null

  for (const element of items()) element.draggable = true

    list.addEventListener('dragstart', (event) => {
      const element = event.target.closest?.(selector)
      if (element?.parentElement !== list) return
        event.stopPropagation() // keep the drag away from the sheet's own handlers
        dragged = element
        startIndex = items().indexOf(element)
        origin = element.nextSibling
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', '') // Firefox needs data to start a drag
        // Add the class after the browser has taken the drag image.
        setTimeout(() => element.classList.add('dragging'), 0)
    })

    list.addEventListener('dragover', (event) => {
      if (!dragged) return
        event.preventDefault() // mark the list as a valid drop target
        event.dataTransfer.dropEffect = 'move'
        const target = event.target.closest?.(selector)
        if (!target || target === dragged || target.parentElement !== list) return
          const rect = target.getBoundingClientRect()
          const after = event.clientY > rect.top + rect.height / 2
          list.insertBefore(dragged, after ? target.nextSibling : target)
    })

    list.addEventListener('drop', (event) => {
      if (!dragged) return
        event.preventDefault()
        event.stopPropagation()
    })

    list.addEventListener('dragend', (event) => {
      if (!dragged) return
        const element = dragged
        dragged = null
        element.classList.remove('dragging')

        // Escape, or a drop outside the list: put the element back.
        if (event.dataTransfer.dropEffect === 'none') {
          list.insertBefore(element, origin)
          return
        }

        const newIndex = items().indexOf(element)
        if (newIndex !== startIndex) onMove(element, newIndex)
    })
}
