<!-- eslint-disable vue/valid-v-for -->
<template>
  <div class="GameBoard">
    <tile :number="tile.number" :x="tile.x" :y="tile.y" :image="tile.image" :width="tile.width" :height="tile.height"
      :walls="tile.walls" :goal="tile.goal" v-for="tile in tiles"></tile>
    <slot></slot>

    <Item v-for="item in items" :number="item.number" :tile="item.tile" :name="item.type" :taken="item.taken"
      :item="item" ref="items">
    </Item>
    <Player v-for="player in players" :player="player" ref="players"></Player>
  </div>

  <div class="dev" v-if="configs.dev">
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
      <option value="dumbest">Dumbest</option>
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

  <div id="game-canvas" @click="quitGameIfFinished"></div>
</template>

<script>
import getStore from "$/store.js";
import gameMixins from "@/mixins/game-mixins";
import Tile from "#/Tile.vue";
import Player from "#/Player.vue";
import Item from "#/Item.vue";
let store;

export default
  {
    mixins: gameMixins,

    data() {
      store = getStore();
      return {
        configs: store.configs,
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
        players: store.players,
        items: store.items
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
      },
      untakenItems() {
        return this.items.filter(item => !item.taken)
      }
    },

    watch: {
      playerSpeed() {
        store.configs.speed = this.playerSpeed
      },
      columns() {
        store.configs.columns = parseInt(this.columns)
        this.rebuildMaze()
      },
      rows() {
        store.configs.rows = parseInt(this.rows)
        this.rebuildMaze()
      },
      changeWayEveryNumberOfTiles() {
        store.configs.changeWayEveryNumberOfTiles = parseInt(this.changeWayEveryNumberOfTiles)
        this.rebuildMaze()
      },
      inteligence() {
        store.configs.inteligence = this.inteligence
      }
    },

    created() {
      store.tiles = [];
      store.items = [];
      store.players = [];

      store.generateTiles();
      store.generateMaze();
      store.generateItems();
      store.generatePlayers();
    },

    mounted() {
      let Game = this
      setTimeout(function () {
        Game.startPlayers()
      }, 3000)
    },

    beforeUnmount() {
      clearInterval(this.timeInterval)
    },

    methods: {
      startPlayers() {
        store.stopped = false;
        this.startTime = new Date();
        this.$refs.players.forEach(player => player.start());

        let Game = this
        this.timeInterval = setInterval(() => {
          Game.endTime = new Date()
        })
      },
      stopGame() {
        store.stopped = true;
        this.endTime = new Date();
        clearInterval(this.timeInterval)
      },
      restartGame() {
        this.stopGame()
        this.$refs.players.forEach($player => $player.restart())
      },
      finishGame(winner) {
        this.stopGame()

        store.started = true
        store.finished = true
        console.info(winner.player.name + " has founded the chest in " + this.timeElapsed + "s")
      },
      rebuildMaze() {
        this.restartGame()

        store.tiles = [];
        store.items = [];
        store.players = [];

        setTimeout(() => {
          store.generateTiles();
          store.generateMaze();
          store.generateItems();
          store.generatePlayers();
        }, 10);
      },
      quitGameIfFinished() {
        console.log("Quit Game")
        let store = getStore()
        if (store.finished) {
          store.quitGame()
        }
      },

      preload(PhaserGame) {
        // Background
        PhaserGame.load.image('board', "/images/background.jpeg");
        PhaserGame.load.image('tile-column', "images/column.png");
        PhaserGame.load.image('tile-row', "images/row.png");

        // Load Items
        store.configs.items.forEach(item => {
          PhaserGame.load.image(item.type, item.image);

          let image = new Image();
          image.src = item.image;
        })

        // Glow Plugin
        PhaserGame.load.plugin('rexglowfilterpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js', true);
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
      Player,
      Item
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
