<template>
  <welcome v-if="!store.started"></welcome>
  <game-board v-if="store.started"></game-board>
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
  components: {
    Welcome,
    GameBoard
  }
}
</script>
