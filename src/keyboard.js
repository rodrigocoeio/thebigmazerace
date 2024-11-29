import getStore from '$/store'
let player = false
let inteligences = ['dumbest', 'dumb', 'normal', 'smart', 'kickass']

const listenKeyBoardEvents = function (e) {
  let store = getStore()

  console.log(e.key + ' key pressed!')

  // Open Dev Mode
  if (e.key.toUpperCase() === 'D') store.configs.dev = !store.configs.dev

  // Quits Game
  if (e.key === 'Escape' || e.key === 'Backspace') store.quitGame()

  // Starts Game
  if (e.key === 'Enter') {
    if (store.finished) store.quitGame()
    else if (!store.started) store.startGame()
  }

  // Pauses Game
  if (e.key === ' ') {
    store.paused = !store.paused
    if (store.paused) {
      console.log('Game Paused!')
      store.Scene.sys.pause()
    } else {
      store.Scene.sys.resume()
    }
  }

  // Speeds UP
  if (e.key == '+') {
    let newSpeed = store.configs.speed + 10
    store.configs.speed = newSpeed < 500 ? newSpeed : 500
  }
  // Speeds Down
  if (e.key == '-') {
    let newSpeed = store.configs.speed - 10
    store.configs.speed = newSpeed > 50 ? newSpeed : 50
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
    if (e.key == 0) {
      player.avoidChest = player.avoidChest ? false : true
      if (player.avoidChest) console.log('Player ' + player.number + ' is avoiding the chest!')
      else console.log('Player ' + player.number + ' stopped avoinding the chest!')
      player = false
      return
    }

    if (inteligences[e.key]) {
      player.inteligence = inteligences[e.key]
      console.log(player.name + ' is now on ' + player.inteligence + ' mode')
      player = false
    }
  }
}

window.addEventListener('keydown', listenKeyBoardEvents)
