export default {
  startGame() {
    console.log('Game Started!')

    this.started = true
    this.finished = false
    this.paused = false
    this.winner = false

    let difficulty = this.configs.difficulty
    let configs = this.difficulty_configs[difficulty]
    this.configs = { ...this.configs, ...configs }

    let audioNumber = Math.floor(Math.random() * 2) + 1
    playAudio('start_game' + audioNumber, 'mp3', 'voice')

    this.startsMusic()

    this.startTime = new Date()
  },
  quitGame() {
    console.log('Game Quited!')

    this.started = false
    this.finished = false
    this.paused = false
    this.winner = false

    this.stopsVoice()
    this.stopsMusic()
  },
  finishGame(winner) {
    console.log('Game Finished!')
    console.info(winner.player.name + ' has founded the chest in ' + this.getTimeElapsed() + 's')

    this.finishedTime = new Date()
    this.started = true
    this.paused = true
    this.finished = true
    this.winner = winner

    this.stopsMusic()
  },
  startsMusic() {
    if (!this.music) {
      this.music = playAudio('background_music', 'mp3', 'music')
      this.music.loop = true
      this.music.volume = this.paused ? 0.7 : 0.2
    }
  },
  stopsMusic() {
    if (this.music) {
      this.music.pause()
      this.music = false
    }
  },
  stopsVoice() {
    if (this.voice) {
      this.voice.pause()
      this.voice = false
    }
  },
  getTimeElapsed() {
    if (!this.startTime) return 0

    let timeDiff = new Date() - this.startTime //in ms

    // strip the ms
    timeDiff /= 1000

    // get seconds
    let seconds = Math.round(timeDiff, 2)

    return seconds
  },
}
