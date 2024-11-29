export default {
  startGame() {
    console.log('Game Started!')
    this.started = true
    this.finished = false
    this.paused = false

    let difficulty = this.configs.difficulty
    let configs = this.difficulty_configs[difficulty]
    this.configs = { ...this.configs, ...configs }

    let audioNumber = Math.floor(Math.random() * 2) + 1
    playAudio('start_game' + audioNumber, 'mp3', 'voice')

    this.startsMusic()
  },
  quitGame() {
    this.started = false
    this.finished = false
    this.paused = false

    this.stopsVoice()
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
}
