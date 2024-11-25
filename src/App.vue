<template>
  <welcome v-if="!started" @click="playBackgroundMusic"></welcome>
  <game-board v-if="started" @click="playBackgroundMusic"></game-board>
</template>

<script>
import Welcome from "#/Welcome.vue";
import GameBoard from "#/GameBoard.vue";
import getStore from "$/store"

export default {
  data() {
    let store = getStore()
    return store
  },
  watch: {
    started() {
      if (this.started)
        this.audio.volume = 0.1
      else
        this.audio.volume = 0.7
    }
  },
  mounted() {

  },
  methods: {
    playBackgroundMusic() {
      if (!this.audio) {
        this.audio = this.audio || playAudio("background_music", "mp3", "music")
        this.audio.loop = true
        this.audio.volume = 0.7
      }
    }
  },
  components: {
    Welcome,
    GameBoard
  }
}
</script>
