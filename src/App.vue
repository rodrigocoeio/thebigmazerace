<template>
  <welcome-component v-if="!started"></welcome-component>
  <game-board-component ref="gameboard" v-if="started"></game-board-component>
</template>

<script>
import WelcomeComponent from "#/WelcomeComponent.vue";
import GameBoardComponent from "#/GameBoardComponent.vue";
import getStore from "$/store"

export default {
  data() {
    let store = getStore()
    return store
  },
  mounted() {
    let store = getStore()
    window.store = store
  },
  components: {
    WelcomeComponent,
    GameBoardComponent
  }
}
</script>
