<template>
  <div class="Wrapper">
    <div class="Welcome">
      <div class="Logo">
        <img src="/images/logotipo.jpg" height="200" />
        <h1>The Big aMAZEing Race</h1>
      </div>

      <div class="Controls">
        <table>
          <tbody>
            <tr>
              <td>
                <label>Difficulty</label>
                <select v-model="difficulty">
                  <option value="" disabled>
                    Choose a difficulty
                  </option>
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </td>
              <td>
                <label>Mode</label>
                <select v-model="mode">
                  <option value="" disabled>
                    Choose a mode
                  </option>
                  <option value="chest">Find the Chest</option>
                  <option value="key">Find the Key/Chest</option>
                </select>
              </td>
              <td>
                <label>Player 1</label>
                <choose-player-component number="1"></choose-player-component>
              </td>
              <td>
                <label>Player 2</label>
                <choose-player-component number="2"></choose-player-component>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- <select class="pleaseSelectCategory">
          <option value="" disabled>
            Choose a category
          </option>
        </select> -->

        <button class="StartGame" :disabled="false" @click="startGame">
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import getStore from '$/store'
import ChoosePlayerComponent from "./ChoosePlayerComponent.vue"
import { playAudio } from "@/utils"

export default {
  props: ["canStart"],
  data() {
    let store = getStore()
    return {
      difficulty: store.configs.difficulty,
      mode: store.configs.mode
    }
  },
  watch: {
    difficulty(difficulty) {
      let store = getStore()
      store.configs.difficulty = difficulty
      playAudio("selected")
      this.setGameDifficulty();
    },
    mode(mode) {
      let store = getStore()
      store.configs.mode = mode
      playAudio("selected")
    },
  },
  methods: {
    startGame() {
      playAudio('selected')

      let store = getStore()
      store.startGame()
    },
    setGameDifficulty() {
      const store = getStore()
      const difficulty = store.configs.difficulty
      const difficulty_configs = store.difficulty_configs[difficulty]
      let storageConfigs = window.localStorage.getItem("configs_" + difficulty);

      if (storageConfigs) {
        return store.configs = JSON.parse(storageConfigs);
      }

      store.configs = { ...store.configs, ...difficulty_configs, dev: false }
    }
  },
  components: {
    ChoosePlayerComponent
  }
}
</script>

<style scoped>
.Wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-items: center;
}

.Welcome {
  text-align: center;
  margin: 0 auto;
}

.Logo {
  font-size: 24px;
  text-shadow: gray 3px 0 0px;
  -webkit-text-stroke: 1px black;
  margin-bottom: 30px;
}

.Logo h1 {
  margin: 0px;
}

.Controls select {
  display: block;
  padding: 20px;
  border-radius: 15px;
  font-size: 24px;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  margin: 0 auto;
  cursor: pointer;
  border: 3px solid black;
  height: 100px;
}

.Controls select:hover {
  background-color: chartreuse;
  text-shadow: white 3px 0 10px;
  box-shadow: 3px 3px gray;
}

.StartGame {
  display: block;
  padding: 20px;
  border: 3px solid black;
  border-radius: 15px;
  font-size: 24px;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: bold;
  margin: 0 auto;
  cursor: pointer;
}

.StartGame:hover {
  background-color: chartreuse;
  text-shadow: gray 3px 0 10px;
  box-shadow: 3px 3px gray;
}

.PleaseSelect {
  border: 3px solid red !important;
  box-sizing: border-box;
}
</style>
