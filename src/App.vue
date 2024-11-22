<template>
  <welcome v-if="!store.started" @click="playBackgroundMusic"></welcome>
  <game-board v-if="store.started" @click="playBackgroundMusic"></game-board>
</template>

<script>
import Welcome from "#/Welcome.vue";
import GameBoard from "#/GameBoard.vue";
import getStore from "$/store"

export default {
  data() {
    return {
      store: getStore()
    }
  },
  mounted() {

  },
  methods: {
    playBackgroundMusic() {
      this.audio = this.audio || playAudio("background_music", "mp3", "music")
      this.audio.loop = true
      this.audio.volume = 0.5
    }
  },
  components: {
    Welcome,
    GameBoard
  }
}
</script>
