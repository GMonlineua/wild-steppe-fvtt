import { stakesText } from './enrichers.js'

export const loadHandlebarsPartials = () => {
  const partials = [
    'systems/wild-steppe/templates/applications/tracks/track.hbs',
    'systems/wild-steppe/templates/shared/aspect.hbs',
    'systems/wild-steppe/templates/shared/aspects.hbs',
    'systems/wild-steppe/templates/shared/attribute.hbs',
    'systems/wild-steppe/templates/shared/description.hbs',
    'systems/wild-steppe/templates/shared/effects.hbs',
    'systems/wild-steppe/templates/shared/number_field.hbs',
    'systems/wild-steppe/templates/shared/rating_mods.hbs',
    'systems/wild-steppe/templates/shared/select_field.hbs',
    'systems/wild-steppe/templates/shared/slim_item.hbs',
    'systems/wild-steppe/templates/shared/text_field.hbs',
    'systems/wild-steppe/templates/shared/track.hbs',
    'systems/wild-steppe/templates/sheets/player/background.hbs',
    'systems/wild-steppe/templates/sheets/player/counters.hbs',
    'systems/wild-steppe/templates/sheets/player/drives.hbs',
    'systems/wild-steppe/templates/sheets/player/knowledges.hbs',
    'systems/wild-steppe/templates/sheets/player/list_track.hbs',
    'systems/wild-steppe/templates/sheets/player/relationships.hbs',
    'systems/wild-steppe/templates/sheets/player/resource.hbs',
    'systems/wild-steppe/templates/sheets/player/resources.hbs',
    'systems/wild-steppe/templates/sheets/player/skills.hbs',
    'systems/wild-steppe/templates/sheets/ship/cargo.hbs',
    'systems/wild-steppe/templates/sheets/ship/rating.hbs',
    'systems/wild-steppe/templates/sheets/ship/ratings.hbs',
  ]

  return loadTemplates(partials)
}

export const loadHandlebarsHelpers = () => {
  Handlebars.registerHelper('times', (n, content) => {
    let result = ''
    for (let i = 0; i < n; i++) {
      content.data.index = i + 1
      result += content.fn(i)
    }
    return result
  })

  Handlebars.registerHelper('fieldType', (type = null) => type || 'text')
  Handlebars.registerHelper(
    'any',
    (array) =>
      (array.name ? array.size : Object.values(array || [])?.length || 0) > 0,
  )
  Handlebars.registerHelper('byKey', (array, key) => {
    return array[key]
  })
  Handlebars.registerHelper('join', (array, glue) => array.join(glue))
  Handlebars.registerHelper('displayNumber', (value) =>
    value >= 0 ? `+${value}` : value,
  )
  // Returns a track cell which is either marked, burned, or empty based on the information provided.
  Handlebars.registerHelper('trackCell', (index, value, burn) => {
    const css_class = index <= burn ? 'burned' : index <= value ? 'checked' : ''
    return `<li class="box ${css_class}"><span class="dot" data-index=${index}"></span></li>`
  })
  Handlebars.registerHelper('stakesText', (stakes) => stakesText(stakes))
  Handlebars.registerHelper('selectOptGroup', (values, options) => {
    const { label, selected } = options?.hash
    let html = `<optgroup label="${label}">`
    for (const key of Object.keys(values)) {
      html += `<option value="${key}"`
      if (selected === key) html += ` selected`
      html += `>${values[key]}</option>`
    }
    html += '</optgroup>'
    return html
  })
}
