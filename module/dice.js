export const addDiceColor = (
  dice3d,
  name,
  description,
  color,
  text = '#f9f9f9',
  outline = '#2d2a2b',
) => {
  const commonDice = {
    category: 'Wildsea',
    foreground: text,
    visibility: 'visible',
    font: 'Teko',
    material: 'wood',
    texture: 'wood',
  }

  dice3d.addColorset(
    {
      ...commonDice,
      name,
      description,
      background: color,
      edge: color,
      outline,
    },
    'default',
  )
}

export const rollPool = async (dicePool) => {
  const totalDice =
    (dicePool.edgeDice || 0) +
    (dicePool.skillDice || 0) +
    (dicePool.advantageDice || 0) +
    (dicePool.ratingDice || 0)

  dicePool.cut = parseInt(dicePool.cut)

  let formula = `${totalDice}d6`

  let zeroDice = false
  if (totalDice - dicePool.cut <= 0) {
    zeroDice = true
    formula = '1d6'
  }

  if (dicePool.cut > 0) formula += `dh${dicePool.cut}`
  formula += 'kh'

  const roll = await new Roll(formula).roll()

  const results = roll.dice
    .flatMap((die) => die.results)
    .sort((a, b) => b.result - a.result)
    .map((r) => {
      return { result: r.result }
    })

  if (!zeroDice)
    for (const index in results) results[index].cut = index < dicePool.cut

  results.filter((r) => !r.cut && r.result === roll.total)[0].max = true
  results.reverse()

  const keptNumbers = results.filter((r) => !r.cut).map((r) => r.result)
  const twist =
    keptNumbers.filter((item, index) => keptNumbers.indexOf(item) !== index)
      .length > 0

  let displayFormula = `${totalDice}d`
  if (dicePool.cut > 0)
    displayFormula += ` ${game.i18n.localize('wildsea.cut')} ${dicePool.cut}`

  const resultText = ((total) => {
    switch (total) {
      case 6:
        return zeroDice ? 'conflict' : 'triumph'
      case 5:
      case 4:
        return 'conflict'
      default:
        return 'disaster'
    }
  })(roll.total)

  return [
    roll,
    {
      dicePool,
      results,
      twist,
      total: roll.total,
      displayFormula,
      resultText,
    },
  ]
}
