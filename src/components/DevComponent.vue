<template>
  <div class="dev">
    <h1 class="title">Dev Configs</h1>

    <div class="row">
      <!-- <button @click="rebuildMaze">Rebuild Maze</button>
      <button @click="startGame" v-if="!store.started">Start Game</button> -->
      <button @click="restartGame">Restart Game</button>
      <button @click="resetDefaults">Reset Defaults</button>
      <button @click="close">Close</button>
    </div>

    <br>


    <div class="row">
      <table>
        <tbody>
          <tr>
            <td align="right"><label for="avoidchest">Avoid Chest:</label></td>
            <td align="left"><input type="checkbox" id="avoidchest" v-model="configs.avoid_chest"></td>
          </tr>
          <tr>
            <td align="right"><label for="loopmatches">Loop Matches:</label></td>
            <td align="left"><input type="checkbox" id="loopmatches" v-model="configs.loop_matches"></td>
          </tr>
          <tr>
            <td><br></td>
          </tr>
          <tr>
            <td align="right"><label for="showtilenumbers">Show Tile Numbers:</label></td>
            <td align="left"><input type="checkbox" id="showtilenumbers" v-model="configs.showTileNumbers"></td>
          </tr>
          <!-- <tr>
            <td align="right"><label for="shadows">Shadows:</label></td>
            <td align="left"><input type="checkbox" id="shadows" v-model="configs.display.shadows"></td>
          </tr> -->
          <!-- <tr>
            <td align="right"><label for="glows">Glows:</label></td>
            <td align="left"><input type="checkbox" id="glows" v-model="configs.display.glows"></td>
          </tr> -->
          <tr>
            <td align="right"><label for="sound">Sound:</label></td>
            <td align="left"><input type="checkbox" id="sound" v-model="configs.sound"></td>
          </tr>
          <tr>
            <td align="right"><label for="music">Music:</label></td>
            <td align="left"><input type="checkbox" id="music" v-model="configs.music"></td>
          </tr>
          <tr>
            <td align="right"><label for="voice">Voice:</label></td>
            <td align="left"><input type="checkbox" id="voice" v-model="configs.voice"></td>
          </tr>
          <tr>
            <td><br></td>
          </tr>

          <tr>
            <td align="right">Maze Columns:</td>
            <td align="left"><input type="number" min="1" max="20" v-model="configs.columns" /></td>
          </tr>
          <tr>
            <td align="right">Maze Rows:</td>
            <td align="left"><input type="number" min="1" max="20" v-model="configs.rows" /></td>
          </tr>
          <tr>
            <td align="right">Maze Change Way Every:</td>
            <td align="left">
              <input type="number" min="1" max="100" v-model="configs.changeWayEveryNumberOfTiles" />
              tiles
            </td>
          </tr>
          <tr>
            <td><br></td>
          </tr>
          <tr>
            <td align="right">Players Speed:</td>
            <td align="left"><input type="number" min="100" max="600" v-model="configs.speed" /></td>
          </tr>
          <tr>
            <td align="right">Players Distance Tolerance:</td>
            <td align="left"><input type="number" min="4" max="100" v-model="configs.distance_tolerance" /></td>
          </tr>

          <tr>
            <td align="right">Players Inteligence:</td>
            <td align="left">
              <select v-model="configs.inteligence">
                <option value="dumbest">Dumbest</option>
                <option value="dumb">Dumb</option>
                <option value="normal">Normal</option>
                <option value="smart">Smart</option>
                <option value="kickass">KickAss</option>
              </select>
            </td>
          </tr>
          <tr>
            <td><br></td>
          </tr>
          <tr>
            <td align="right">Start Items:</td>
            <td align="left"><input type="number" min="0" max="100" v-model="configs.start_items"></td>
          </tr>
          <tr>
            <td align="right">Max Items:</td>
            <td align="left"><input type="number" min="0" max="100" v-model="configs.max_items" /></td>
          </tr>
          <tr>
            <td align="right">Max Speed Ups:</td>
            <td align="left"><input type="number" min="0" max="100" v-model="configs.max_speedups" /></td>
          </tr>
          <tr>
            <td align="right">Max Speed Downs:</td>
            <td align="left"><input type="number" min="0" max="100" v-model="configs.max_speeddowns" /></td>
          </tr>
          <tr>
            <td align="right">Max Bombs:</td>
            <td align="left"><input type="number" min="0" max="100" v-model="configs.max_bombs" /></td>
          </tr>
          <tr>
            <td align="right">Max Swirls:</td>
            <td align="left"><input type="number" min="0" max="100" v-model="configs.max_swirls" /></td>
          </tr>
          <tr>
            <td align="right">Max Twisters:</td>
            <td align="left">
              <input type="number" min="0" max="100" v-model="configs.max_twisters" />
            </td>
          </tr>
          <tr>
            <td align="right">Max Golden Twisters:</td>
            <td align="left">
              <input type="number" min="0" max="100" v-model="configs.max_twisters_golden" />
            </td>
          </tr>
          <tr>
            <td><br></td>
          </tr>
          <tr>
            <td align="right">Start Countdown:</td>
            <td align="left">
              <input type="number" min="0" max="12" v-model="configs.start_countdown" />
              seconds
            </td>
          </tr>
          <tr>
            <td align="right">Refresh Item Every:</td>
            <td align="left">
              <input type="number" min="0" max="30" v-model="configs.refresh_items_seconds" />
              seconds
            </td>
          </tr>
          <tr>
            <td align="right">Key Recovery Time:</td>
            <td align="left">
              <input type="number" min="0" max="12" v-model="configs.key_recovery_time" />
              seconds
            </td>
          </tr>
          <tr>
            <td align="right">Golden Twister After:</td>
            <td align="left">
              <input type="number" min="0" max="500" v-model="configs.twister_golden_after_seconds" />
              seconds
            </td>
          </tr>
          <tr>
            <td align="right">Dizzy Time:</td>
            <td align="left">
              <input type="number" min="0" max="12" v-model="configs.dizzy_seconds" />
              seconds
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Time: {{ timeElapsed }}s -->
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
    configs: {
      deep: true,
      handler(configs) {
        const difficulty = configs.difficulty;
        configs = { ...configs, dev: false };
        window.localStorage.setItem("configs_" + difficulty, JSON.stringify(configs));
      }
    },
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
    },
    resetDefaults() {
      const store = getStore();
      const difficulty = store.configs.difficulty;

      window.localStorage.removeItem("configs_" + difficulty);
      window.location.reload();
    },
    close() {
      this.store.configs.dev = false
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
  font-size: 24px;
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

input,
button,
select {
  padding: 5px;
  font-size: 24px;
}

input[type='checkbox'] {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

label {
  cursor: pointer;
}
</style>
