import { clickModifiers, makeSortable } from '../../helpers.js'
import WildsteppeTrack from './track.js'

export class WildsteppeTrackPanel extends Application {
  constructor(db, options) {
    super(options)
    this.db = db
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      id: 'wildsteppe-tracks-panel',
      popOut: false,
      template: 'systems/wild-steppe/templates/applications/tracks/panel.hbs',
    }
  }

  async getData(options) {
    const data = await super.getData(options)
    const tracks = await this.prepareTracks()
    return {
      ...data,
      options: {
        editable: game.user.isGM,
      },
      tracks,
      position: game.settings.get('wildsteppe', 'trackPosition'),
    }
  }

  async prepareTracks() {
    const tracks = game.wildsteppe.trackDatabase.contents
    return tracks.map((track) => new WildsteppeTrack(track))
  }

  activateListeners(html) {
    if (game.user.isGM) {
      html.find('.addTrack').click(this.addTrack.bind(this))
      html.find('.label').click(this.editTrack.bind(this))
      html.find('.delete').click(this.interactWithTrack.bind(this, 'delete'))
      html.find('.slots').click(this.interactWithTrack.bind(this, 'mark'))
      html
        .find('.slots')
        .contextmenu(this.interactWithTrack.bind(this, 'unmark'))

      makeSortable(html.find('.track-list').get(0), '.track', (element, newIndex) =>
        game.wildsteppe.trackDatabase.moveTrack(element.dataset.trackId, newIndex),
      )
    }
  }

  async addTrack(event) {
    event.preventDefault()

    const data = await game.wildsteppe.trackDatabase.showTrackDialog(
      'wildsteppe.TRACKS.addTrack',
    )
    if (data.cancelled) return

    game.wildsteppe.trackDatabase.addTrack({ ...data })
  }

  async editTrack(event) {
    event.preventDefault()
    const id = event.currentTarget.closest('.track').dataset.trackId
    const track = game.wildsteppe.trackDatabase.get(id)
    const data = await game.wildsteppe.trackDatabase.showTrackDialog(
      'wildsteppe.TRACKS.editTrack',
      track,
    )
    if (data.cancelled) return

    game.wildsteppe.trackDatabase.updateTrack(id, data)
  }

  async interactWithTrack(action, event) {
    event.preventDefault()
    const id = event.currentTarget.closest('.track').dataset.trackId

    switch (action) {
      case 'mark':
        game.wildsteppe.trackDatabase.markTrack(id, clickModifiers(event))
        break
      case 'unmark':
        game.wildsteppe.trackDatabase.markTrack(id, clickModifiers(event), -1)
        break
      case 'delete':
        game.wildsteppe.trackDatabase.deleteTrack(id)
        break
      default:
        break
    }
  }
}
