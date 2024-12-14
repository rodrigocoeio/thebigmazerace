<template>
  <div class="dev">
    [ Development ]
    <label>Columns</label>
    <input type="number" min="1" max="12" v-model="configs.columns" />
    <label>Rows</label>
    <input type="number" min="1" max="12" v-model="configs.rows" />
    <label>Speed</label>
    <input type="number" min="100" max="300" v-model="configs.speed" />
    <label>Change Way Every</label>
    <input type="number" min="1" max="100" v-model="configs.changeWayEveryNumberOfTiles" />
    <label>Inteligence</label>
    <select v-model="configs.inteligence">
      <option value="dumbest">Dumbest</option>
      <option value="dumb">Dumb</option>
      <option value="normal">Normal</option>
      <option value="smart">Smart</option>
      <option value="kickass">KickAss</option>
    </select>

    <button @click="rebuildMaze">Rebuild Maze</button>
    <button @click="startGame" v-if="!store.started">Start Game</button>
    <button @click="restartGame">Restart Game</button>

    Time: {{ Game.timeElapsed }}s
  </div>
</template>

<script>
import getStore from "$/store.js";
import store from "@/stores/store";

export default {
  data() {
    let store = getStore()

    return {
      Game: this.$parent,
      store: store,
      configs: store.configs
    };
  },

  watch: {
    "configs.speed": function (speed) {
      this.configs.speed = parseInt(speed)
    }
  },

  methods: {
    rebuildMaze() {
      this.$parent.rebuildMaze()
    },
    startGame() {
      store.startGame()
    },
    restartGame() {
      store.restartGame()
    }
  }
}
</script>
