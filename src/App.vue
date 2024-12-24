<template>
  <welcome-component ref="welcome" v-if="!started"></welcome-component>
  <game-board-component ref="gameboard" v-if="started"></game-board-component>
</template>

<script>
import WelcomeComponent from "#/WelcomeComponent.vue";
import GameBoardComponent from "#/GameBoardComponent.vue";
import getStore from "$/store"

export default {
  data() {
    const store = getStore()
    return store
  },
  mounted() {
    const store = getStore()
    window.store = store

    if (!store.started) {
      this.$refs.welcome.setGameDifficulty();
    }
  },
  components: {
    WelcomeComponent,
    GameBoardComponent
  }
}
</script>
