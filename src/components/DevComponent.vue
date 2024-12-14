<template>
  <div class="dev">
    <h1 class="title">Dev Configs</h1>
    <div class="row">
      <label>Columns</label>
      <input type="number" min="1" max="12" v-model="configs.columns" />
      <label>Rows</label>
      <input type="number" min="1" max="12" v-model="configs.rows" />
      <label>Change Way Every</label>
      <input type="number" min="1" max="100" v-model="configs.changeWayEveryNumberOfTiles" />
    </div>
    <br>

    <div class="row">
      <label>Speed</label>
      <input type="number" min="100" max="300" v-model="configs.speed" />
      <label>Inteligence</label>
      <select v-model="configs.inteligence">
        <option value="dumbest">Dumbest</option>
        <option value="dumb">Dumb</option>
        <option value="normal">Normal</option>
        <option value="smart">Smart</option>
        <option value="kickass">KickAss</option>
      </select>
    </div>

    <br>

    <div class="row">
      <button @click="rebuildMaze">Rebuild Maze</button>
      <button @click="startGame" v-if="!store.started">Start Game</button>
      <button @click="restartGame">Restart Game</button>
    </div>

    Time: {{ timeElapsed }}s
  </div>
</template>

<script>
import getStore from "$/store.js";

export default {
  data() {
    const store = getStore()

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
      this.store.rebuildMaze()
      this.$parent.restartGame()
    },
    startGame() {
      this.store.startGame()
    },
    restartGame() {
      this.store.restartGame()
    }
  }
}
</script>

<style scoped>
.dev {
  position: absolute;
  left: 0;
  right: 0;
  margin-inline: auto;
  width: fit-content;
  background: white;
  opacity: 0.8;
  border: 3px dashed black;
  border-radius: 10px;
  margin-top: 50px;
  padding: 50px;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  text-align: center;
  max-height: 400px;
  overflow-x: auto;
}

.dev .title {
  font-size: 36px;
  font-weight: bold;
}

.dev button {
  padding: 15px;
  margin: 5px;
  font-weight: bold;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}
</style>
