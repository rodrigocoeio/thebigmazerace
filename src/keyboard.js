import getStore from '$/store'
let player = false
let inteligences = ['dumbest', 'dumb', 'normal', 'smart', 'kickass']

const listenKeyBoardEvents = function (e) {
  let store = getStore()

  if (e.key.toUpperCase() === 'D') store.configs.dev = !store.configs.dev
  if (e.key === 'Escape' || e.key === 'Backspace') store.quitGame()
  if (e.key === 'Enter') {
    if (store.finished) store.quitGame()
    else store.startGame()
  }

  if (!player) {
    let player_number = parseInt(e.key) - 1
    if (store.players[player_number]) {
      player = store.players[player_number]
      console.log(player.name + ' selected')
    } else {
      player = false
    }
  } else {
    if (inteligences[e.key]) {
      player.inteligence = inteligences[e.key]
      console.log(player.name + ' is now on ' + player.inteligence + ' mode')
      player = false
    }
  }
}

window.addEventListener('keydown', listenKeyBoardEvents)
