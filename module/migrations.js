export const runMigrations = () => {
  if (!game.user.isGM) return

  const currentVersion = game.settings.get('wildsea', 'systemMigrationVersion')
  const NEEDS_MIGRATION_VERSION = '0.0.8'

  const needsMigration =
    !currentVersion ||
    foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion)

  if (needsMigration) {
    migrate()
    game.settings.set(
      'wildsea',
      'systemMigrationVersion',
      NEEDS_MIGRATION_VERSION,
    )
  }
}

const migrate = () => {
  const tracks = game.settings.get('wildsea', 'activeTracks')
  for (const track of Object.values(tracks)) {
    track.visibility = track.firefly ? 'secret' : 'open'
    tracks[track.id] = track
  }

  game.settings.set('wildsea', 'activeTracks', tracks)
}
