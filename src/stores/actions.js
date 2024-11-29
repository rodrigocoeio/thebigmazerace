import maze from './actions/maze'
import gameControls from './actions/gameControls'
import tiles from './actions/tiles'
import items from './actions/items'
import players from './actions/players'

export default {
  ...maze,
  ...gameControls,
  ...tiles,
  ...items,
  ...players,
}
