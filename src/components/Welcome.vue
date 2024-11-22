<template>
  <div class="Wrapper">
    <div class="Welcome">
      <div class="Logo">
        <img src="/images/logotipo.jpg" height="200" />
        <h1>The Big Maze Race</h1>
      </div>

      <div class="Controls">
        <select v-model="difficulty">
          <option value="" disabled>
            Choose a difficulty
          </option>
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>

        <!-- <select class="pleaseSelectCategory">
          <option value="" disabled>
            Choose a category
          </option>
        </select> -->

        <button class="StartGame" @click="startGame">
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import getStore from '$/store'
import store from '@/stores/store';

export default {
  data() {
    let store = getStore()
    return {
      difficulty: store.configs.difficulty
    }
  },
  watch: {
    difficulty(difficulty) {
      store.configs.difficulty = difficulty
    }
  },
  methods: {
    startGame() {
      let store = getStore()
      let difficulty = this.difficulty
      let configs = store.difficulty_configs[difficulty]
      store.configs = { ...store.configs, ...configs }
      store.started = true
    }
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
  margin-bottom: 15px;
  cursor: pointer;
  border: 3px solid black;
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
