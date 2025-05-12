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

export const deleteAndReturn = (map, key) => {
  var a = map[key]
  delete map[key]
  return a
}

export const clickModifiers = (event) => event.shiftKey || event.ctrlKey
