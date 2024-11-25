import getStore from '$/store.js'
import Game from '@/game.js'

const GameMixins = []

GameMixins.push({
  data() {
    let store = getStore()
    return store
  },

  mounted() {
    let store = getStore()
    store.Game = this

    store.Phaser = Game(store.configs, this, store.components)
  },

  beforeUnmount() {
    this.destroy()

    if (this.Phaser && !this.destroyed) {
      this.Phaser.destroy(true)
      this.Phaser = false
      this.destroyed = true
    }
  },

  methods: {
    preload(PhaserGame) {},

    create(PhaserGame) {},

    update(PhaserGame) {},

    render(PhaserGame) {},

    destroy() {},
  },
})

export default GameMixins
