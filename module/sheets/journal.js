export default class WildsteppeJournalSheet extends foundry.appv1.sheets.JournalSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1100,
      height: 850,
    })
  }
}
