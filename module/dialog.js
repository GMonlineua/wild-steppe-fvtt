export const renderDialog = async (
  title,
  handler = (_html = '') => {},
  data = {},
  template = '/systems/wild-steppe/templates/dialogs/simple.hbs',
) => {
  const content = await renderTemplate(template, data)

  return new Promise((resolve) => {
    const dialog = {
      title,
      content,
      buttons: {
        yes: {
          label: `<i class="fas fa-check"></i> ${game.i18n.localize(
            'wildsea.submit',
          )}`,
          callback: (html) => resolve(handler(html)),
        },
        cancel: {
          label: `<i class="fas fa-times"></i> ${game.i18n.localize(
            'wildsea.cancel',
          )}`,
          callback: (_html) => resolve({ cancelled: true }),
        },
      },
      default: 'yes',
      close: (_html) => resolve({ cancelled: true }),
    }

    new Dialog(dialog).render(true)
  })
}
