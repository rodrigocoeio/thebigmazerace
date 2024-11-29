<template>
  <welcome v-if="!started"></welcome>
  <game-board v-if="started"></game-board>
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
  mounted() {
    let store = getStore()
    window.store = store
  },
  components: {
    Welcome,
    GameBoard
  }
}
</script>
