import getStore from '$/store.js'

let store

export default [
  {
    data() {
      return {
        preloaded: false,
        created: false,
        updating: false,
        rendering: false,
        destroyed: false,
      }
    },
    computed: {
      isVisible() {
        return true
      },
    },
    mounted() {
      store = getStore()
      store.components.push(this)

      if (!this.preloaded && store.Phaser.isRunning) {
        const scene = store.Phaser.scene.scenes[0]
        this.preload(scene)
        this.create(scene)
      }
    },
    beforeUnmount() {
      if (store.Phaser && !this.destroyed) this.destroy(store.Phaser)

      store.components = store.components.filter((object) => object != this)
    },
    methods: {
      preload() {
        this.preloaded = true
      },
      create() {
        this.created = true
      },
      update() {
        this.updating = true
      },
      render() {
        this.rendering = true
      },
      destroy() {
        this.destroyed = true
      },
    },
  },
]
