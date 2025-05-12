export default class WildseaTrack {
  constructor(data = {}) {
    this.id = data.id
    this.label = data.label
    this.value = data.value
    this.burn = data.burn
    this.visibility = data.visibility
    this.slotGroups = data.groups
      .split(/[,\|]/)
      .map((group) => parseInt(group) || 0)
  }

  render() {
    const slots = []
    let index = 0
    for (const group of this.slotGroups) {
      if (group === 0) continue
      const groupSlots = []
      for (let i = 0; i < group; i++) {
        groupSlots.push(
          index < this.burn
            ? this.burnedSlot()
            : index < this.value
            ? this.markedSlot()
            : this.emptySlot(),
        )
        index += 1
      }
      slots.push(groupSlots.join(''))
    }
    return slots.join(this.breaker())
  }

  hidden() {
    return visibility === 'hidden'
  }

  secret() {
    return visibility === 'secret'
  }

  emptySlot() {
    return `<span class="slot"></span>`
  }

  markedSlot() {
    return `<span class="slot marked"></span>`
  }

  burnedSlot() {
    return `<span class="slot burned"></span>`
  }

  breaker() {
    return `<span class="break"></span>`
  }
}
