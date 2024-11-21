import getStore from '$/store'
let player = false
let inteligences = ['dumbest', 'dumb', 'normal', 'smart', 'kickass']

const listenKeyBoardEvents = function (e) {
  let store = getStore()

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

window.addEventListener('keypress', listenKeyBoardEvents)
