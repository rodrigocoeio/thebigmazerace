import getStore from '$/store'

const listenKeyBoardEvents = function (e) {
  let store = getStore()

  console.log(e.key + ' key pressed!')

  // Open Dev Mode
  if (e.shiftKey && e.key.toUpperCase() === 'D') store.configs.dev = !store.configs.dev

  // Quits Game
  if (e.key === 'Escape') store.quitGame()

  // Starts Game
  if (e.key === 'Enter') {
    if (store.finished) store.quitGame()
    else if (!store.started) store.startGame()
  }

  // Starts/Stops Music
  if (e.key.toLowerCase() === 'm') {
    if (store.music) store.stopsMusic()
    else if (store.started && !store.finished) store.startsMusic()
  }

  // Pauses Game
  if (e.key === ' ') {
    if (!store.finished) {
      store.paused = !store.paused

      if (store.paused) {
        store.pauseGame()
      } else {
        store.unpauseGame()
      }
    }
  }

  // Speeds UP
  if (e.key == '+') {
    let newSpeed = store.configs.speed + 10
    store.configs.speed = newSpeed < 600 ? newSpeed : 600
  }
  // Speeds Down
  if (e.key == '-') {
    let newSpeed = store.configs.speed - 10
    store.configs.speed = newSpeed > 50 ? newSpeed : 50
  }

  // Cheat Golden Twister,
  // press:
  // number 1 for Player 1
  // number 2 for Player 2
  if (parseInt(e.key) === 1 || parseInt(e.key) === 2) {
    let player = store.players.find((player) => player.number === parseInt(e.key))
    if (player) {
      store.getCheatGoldenTwister(player)
    }
  }
}

window.addEventListener('keydown', listenKeyBoardEvents)
