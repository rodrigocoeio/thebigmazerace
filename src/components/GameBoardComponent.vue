<template>
  <div class="GameBoard">
    <tile-component :number="tile.number" :x="tile.x" :y="tile.y" :image="tile.image" :width="tile.width"
      :height="tile.height" :walls="tile.walls" :goal="tile.goal" :key="'tile' + index" v-for="tile, index in tiles"
      ref="tiles"></tile-component>
    <slot></slot>
    <item-component v-for="item in untakenItems" :key="'item' + item.number" :number="item.number" :tile="item.tile"
      :name="item.type" :taken="item.taken" :item="item" ref="items">
    </item-component>
    <player-component v-for="player, index in players" :key="'player' + index" :player="player" :name="player.name"
      :number="player.number" ref="players"></player-component>
  </div>

  <dev-component v-if="configs.dev"></dev-component>

  <div id="game-canvas" @click="quitGameIfFinished"></div>
</template>

<script>
import getStore from "$/store.js";
import gameMixins from "@/mixins/game-mixins";
import TileComponent from "#/TileComponent.vue";
import PlayerComponent from "#/PlayerComponent.vue";
import ItemComponent from "#/ItemComponent.vue";
import DevComponent from "#/DevComponent.vue";

export default
  {
    mixins: gameMixins,

    data() {
      return {
        board: false,
        background_audio: false,
        timeInterval: false
      };
    },

    computed: {
      timeElapsed() {
        let now = new Date()
        let timeDiff = now - this.startTime; //in ms

        // strip the ms
        timeDiff /= 1000;

        // get seconds
        let seconds = Math.round(timeDiff, 2);

        return seconds
      },
      untakenItems() {
        return this.items.filter(item => !item.taken)
      },
      player1() {
        return this.$refs.players.find(player => player.number == 1)
      },
      player2() {
        return this.$refs.players.find(player => player.number == 2)
      }
    },

    watch: {
      'configs.refresh_items_seconds': function () {
        this.itemRefresher()
      },
      paused(paused) {
        this.pausedScreen()

        if (!paused) {
          this.$refs.players.forEach($player => {
            $player.moveToNextTile()
          })
        }
      },
      started(started) {
        if (!started) {
          this.$refs.players.forEach($player => {
            $player.stopsAllRotation()
          })
        }
      },
      finished(finished) {
        if (finished) {
          this.$refs.players.forEach($player => {
            $player.stopsAllRotation()
          })
          this.finishedScreen()
        }
      }
    },

    created() {
      const store = getStore()
      store.buildGame()
      clearInterval(store.itemRefresher)
    },

    mounted() {
      this.startPlayers()
      this.watchPlayers()
    },

    unmounted() {
      const store = getStore()
      clearInterval(this.timeInterval)
      clearInterval(store.itemRefresher)
      clearInterval(this.playersWatcher)
    },

    methods: {
      startPlayers() {
        const Game = this
        const store = getStore()

        if (this.playersStartCountdown)
          clearInterval(this.playersStartCountdown)

        let countdown = store.configs.start_countdown;
        this.playersStartCountdown = setInterval(function () {
          if (countdown === 0) {
            console.log("GO!")
            Game.startItemRefresher()
            Game.timerStart()
            Game.$refs.players.forEach(player => player.start());
            clearInterval(Game.playersStartCountdown)
          } else {
            console.log("Countdown: " + countdown)
            countdown--;
          }
        }, 1000)
      },

      timerStart() {
        const Game = this
        this.timeInterval = setInterval(() => {
          Game.currentTime = new Date()
        }, 1000)
      },

      // Watch Players, if not moving then move to next tile
      watchPlayers() {
        const Game = this

        if (this.playersWatcher)
          clearInterval(this.playersWatcher)

        this.playersWatcher = setInterval(function () {
          Game.$refs.players.forEach(player => {
            if (!player.moving && !player.target && !player.nextTile)
              player.moveToNextTile()
          });
        }, 1000);
      },

      quitGameIfFinished() {
        console.log("Quit Game")
        let store = getStore()
        if (store.finished) {
          store.quitGame()
        }
      },

      // Refresh one item every x seconds
      startItemRefresher() {
        console.log("Creating Item Refresher")

        const store = getStore()

        if (!store.configs.refresh_items_seconds)
          store.configs.refresh_items_seconds = 1

        if (store.configs.refresh_items_seconds) {
          if (store.itemRefresher)
            clearInterval(store.itemRefresher)

          store.itemRefresher = setInterval(function () {
            console.log("Item Refresher")

            if (store.paused || store.finished)
              return false;

            // Removes one item if max is reached
            store.items = store.items.filter(i => !i.taken)
            if ((store.items.length - 2) >= store.configs.max_items) {
              let item = store.items.find(i => !i.taken && i.type != "chest" && i.type != "key")
              if (item) {
                item.taken = true
                store.items = store.items.filter(i => i.number !== item.number)
              }
            }

            store.generateItem()
          }, store.configs.refresh_items_seconds * 1000)
        }
      },

      preload(Scene) {
        const store = getStore()

        this.Scene = Scene

        // Background
        Scene.load.image('board', "/images/background2.jpeg");
        Scene.load.image('tile-column', "images/column.png");
        Scene.load.image('tile-row', "images/row.png");

        // Load Items
        store.items_available.forEach(item => {
          Scene.load.image(item.type, item.image);

          let image = new Image();
          image.src = item.image;
        })

        // Glow Plugin
        Scene.load.plugin('rexglowfilterpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js', true);
      },

      create(Scene) {
        this.Scene = Scene

        // Board
        //this.board = Scene.add.image(store.configs.width / 2, store.configs.height / 2, 'board');
        //this.board.setAlpha(0.8);
      },
      update() {

      },
      destroy() {
        if (this.board)
          this.board.destroy();
      },

      pausedScreen() {
        const store = getStore()

        if (store.paused && !store.finished) {
          const width = store.configs.width
          const height = store.configs.height

          const overlay = this.Scene.add.renderTexture(width / 2, height / 2, width, height);
          overlay.fill(0x000000, 0.3);

          const text_x = width / 2
          const text_y = height / 2

          const pausedText = "Paused"
          const text = this.Scene.add.text(text_x, text_y, pausedText, { font: "600 48px Poppins", color: "white" });
          text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 1);
          text.setOrigin(0.5, 0.5);

          overlay.depth = 1.9
          text.depth = 2

          this.pausedOverlay = overlay
          this.pausedText = text
        } else if (this.pausedOverlay) {
          this.pausedOverlay.destroy()
          this.pausedText.destroy()
        }
      },

      finishedScreen() {
        const store = getStore()

        const width = this.configs.width
        const height = this.configs.height
        const winner = this.winner

        const overlay = this.Scene.add.renderTexture(width / 2, height / 2, width, height);
        overlay.fill(0x000000, 0.5);

        const shadowDistance = 30
        const x = this.configs.width / 2
        const y = this.configs.height / 2 - 50
        const shadow = this.Scene.physics.add.sprite(x - 100, y, winner.player.name + "_big");
        const player = this.Scene.physics.add.sprite((x - 100 + shadowDistance), (y + shadowDistance), winner.player.name + "_big");

        const chest_x = x + 150
        const chest_y = y + 120
        const chest_shadow = this.Scene.physics.add.sprite(chest_x, chest_y, "chest_open");
        const chest = this.Scene.physics.add.sprite((chest_x + shadowDistance), (chest_y + shadowDistance), "chest_open");

        shadow.setOrigin(0.5);
        shadow.tint = 0x000000;
        shadow.alpha = 0.5;

        chest_shadow.setOrigin(0.5);
        chest_shadow.tint = 0x000000;
        chest_shadow.alpha = 0.5;

        const text_y = chest_y + 120
        const text_x = x
        const spentTime = store.getTimeElapsed()
        const finishedText = "The " + winner.player.name + " has found the chest in " + spentTime + " seconds!"
        const text = this.Scene.add.text(text_x, text_y, finishedText, { font: "600 48px Poppins", color: "white" });
        text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 1);
        text.setOrigin(0.5);

        overlay.depth = 1.9
        player.depth = 2
        shadow.depth = 2
        chest.depth = 2
        text.depth = 2
      },
    },

    components: {
      TileComponent,
      PlayerComponent,
      ItemComponent,
      DevComponent
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
