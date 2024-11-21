<!-- eslint-disable vue/valid-v-for -->
<template>
  <div class="GameBoard">
    <tile :number="tile.number" :x="tile.x" :y="tile.y" :image="tile.image" :width="tile.width" :height="tile.height"
      :walls="tile.walls" :goal="tile.goal" v-for="tile in tiles"></tile>
    <slot></slot>

    <Player v-for="player in players" :player="player" :speed="playerSpeed" ref="players"></Player>
  </div>

  <div class="dev">
    <label>Columns</label>
    <input type="number" min="1" max="12" v-model="columns" />
    <label>Rows</label>
    <input type="number" min="1" max="12" v-model="rows" />
    <label>Speed</label>
    <input type="number" min="100" max="500" v-model="playerSpeed" />
    <label>Change Way Every</label>
    <input type="number" min="1" max="100" v-model="changeWayEveryNumberOfTiles" />
    <label>Inteligence</label>
    <select v-model="inteligence">
      <option value="dumb">Dumb</option>
      <option value="normal">Normal</option>
      <option value="smart">Smart</option>
      <option value="kickass">KickAss</option>
    </select>

    <button @click="rebuildMaze">Rebuild Maze</button>
    <button @click="startGame">Start Game</button>
    <button @click="stopGame">Stop Game</button>
    <button @click="restartGame">Restart Game</button>

    Time: {{ timeElapsed }}s
  </div>

  <div id="game-canvas"></div>
</template>

<script>
import getStore from "$/store.js";
import gameMixins from "@/mixins/game-mixins";
import Tile from "#/Tile.vue";
import Player from "#/Player.vue";
let store;

export default
  {
    mixins: gameMixins,

    data() {
      store = getStore();
      return {
        columns: store.configs.columns,
        rows: store.configs.rows,
        changeWayEveryNumberOfTiles: store.configs.changeWayEveryNumberOfTiles,
        board: false,
        background_audio: false,
        playerSpeed: store.configs.speed,
        inteligence: store.configs.inteligence,
        startTime: 0,
        endTime: 0,
        timeInterval: false,
        players: [
          {
            name: "Rabbit",
            image: "/images/rabbit.png",
            welcome: {
              position: { x: 200, y: 450 }
            },
            position: { x: 20, y: 20 },
            scale: 0.8
          },
          {
            name: "Turtle",
            image: "/images/turtle.png",
            welcome: {
              position: { x: 200, y: 450 }
            },
            position: { x: 50, y: 25 },
            scale: 0.6
          }
        ]
      };
    },

    computed: {
      tiles() {
        store = getStore();
        return store.tiles;
      },
      sound() {
        return store.configs.sound;
      },
      music() {
        return store.configs.music;
      },
      timeElapsed() {
        var timeDiff = this.endTime - this.startTime; //in ms
        // strip the ms
        timeDiff /= 1000;

        // get seconds
        var seconds = Math.round(timeDiff, 2);

        return seconds
      }
    },

    watch: {
      columns() {
        store.configs.columns = parseInt(this.columns)
        this.resetMaze()
      },
      rows() {
        store.configs.rows = parseInt(this.rows)
        this.resetMaze()
      },
      changeWayEveryNumberOfTiles() {
        store.configs.changeWayEveryNumberOfTiles = parseInt(this.changeWayEveryNumberOfTiles)
        this.resetMaze()
      },
      inteligence() {
        store.configs.inteligence = this.inteligence
      }
    },

    created() {
      store = getStore();
      store.generateTiles();
      store.generateMaze();
    },

    mounted() {
      //this.startMusic();
    },

    beforeUnmount() {
      this.stopMusic();
    },

    methods: {
      startGame() {
        store.started = true;
        this.startTime = new Date();
        this.$refs.players.forEach(player => player.start());

        let Game = this
        this.timeInterval = setInterval(() => {
          Game.endTime = new Date()
        })
      },
      stopGame() {
        store.started = false;
        clearInterval(this.timeInterval)
      },
      restartGame() {
        this.stopGame()
        this.$refs.players.forEach($player => $player.restart())
      },
      finishGame(winner) {
        this.endTime = new Date();
        clearInterval(this.timeInterval)

        store.started = false
        store.finished = true
        alert(winner.player.name + " has founded the chest in " + this.timeElapsed + "s")
      },
      rebuildMaze() {
        this.restartGame()

        store.tiles = [];
        setTimeout(() => {
          store.generateTiles();
          store.generateMaze();
        }, 10);
      },
      startMusic() {
        if (this.music) {
          if (!this.background_audio)
            // eslint-disable-next-line no-undef
            this.background_audio = playAudio('board-background2');

          this.background_audio.volume = 0.5;
          this.background_audio.loop = true;


          this.background_audio.play();
        }
      },
      stopMusic() {
        if (this.background_audio) {
          this.background_audio.pause();
          this.background_audio = false;
        }
      },
      preload(PhaserGame) {
        // Background
        PhaserGame.load.image('board', "/images/background.jpeg");
        PhaserGame.load.image('tile-column', "images/column.png");
        PhaserGame.load.image('tile-row', "images/row.png");
      },
      create(PhaserGame) {
        console.log('board created');
        // Board
        this.board = PhaserGame.add.image(store.configs.width / 2, store.configs.height / 2, 'board');
        //this.board.setAlpha(0.8);
      },
      update(PhaserGame) {

      },
      destroy(PhaserGame) {
        if (this.board)
          this.board.destroy();
      }
    },

    components: {
      Tile,
      Player
    }
  }
</script>

<style scoped>
#game-canvas {
  width: 100%;
}

canvas {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
}
</style>
