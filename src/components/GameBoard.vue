<!-- eslint-disable vue/valid-v-for -->
<template>
  <div class="GameBoard">
    <tile :number="tile.number" :x="tile.x" :y="tile.y" :image="tile.image" :width="tile.width" :height="tile.height"
      :walls="tile.walls" :goal="tile.goal" v-for="tile in tiles" ref="tiles"></tile>
    <slot></slot>

    <Item v-for="item in items" :number="item.number" :tile="item.tile" :name="item.type" :taken="item.taken"
      :item="item" ref="items">
    </Item>
    <Player v-for="player in players" :player="player" ref="players"></Player>
  </div>

  <dev v-if="configs.dev"></dev>

  <div id="game-canvas" @click="quitGameIfFinished"></div>
</template>

<script>
import getStore from "$/store.js";
import gameMixins from "@/mixins/game-mixins";
import Tile from "#/Tile.vue";
import Player from "#/Player.vue";
import Item from "#/Item.vue";
import Dev from "#/Dev.vue";
let store;

export default
  {
    mixins: gameMixins,

    data() {
      store = getStore();
      return {
        configs: store.configs,
        board: false,
        background_audio: false,
        inteligence: store.configs.inteligence,
        startTime: 0,
        endTime: 0,
        timeInterval: false,
        players: store.players,
        items: store.items,
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

      // Refresh one item every x seconds
      if (this.configs.refresh_items_seconds) {
        this.itemRefresher = setInterval(function () {
          let item = store.items.find(i => !i.taken && i.type != "chest")

          if (item) {
            item.taken = true
            store.generateItem()
          }
        }, this.configs.refresh_items_seconds * 1000)
      }
    },

    beforeUnmount() {
      clearInterval(this.timeInterval)
      clearInterval(this.itemRefresher)
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
      Item,
      Dev
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
