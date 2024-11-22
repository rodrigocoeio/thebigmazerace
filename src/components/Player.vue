<template>
  <div class="GamePlayer">

  </div>
</template>

<script>
import objectMixins from "@/mixins/object-mixins.js";
import getStore from "$/store.js";
let store

export default {
  props: ['player'],

  mixins: objectMixins,

  data() {
    store = getStore();
    const Game = this.$parent.Game;
    return {
      Game: Game,
      PhaserGame: false,
      Player: false,
      Shadow: false,
      shadowDistance: 2,
      moving: false,
      start_position: false,
      tiles: [],
      tilesStack: [], // walked tiles
      lastTile: false,
      currentTile: false,
      nextTile: false,
      item: false
    }
  },

  mounted() {
    this.player.Component = this;
  },

  beforeUnmount() {
    if (this.Player)
      this.Player.destroy()

    if (this.Shadow)
      this.Shadow.destroy()
  },

  computed: {
    isSelected() {
      return true;
    },
    selected() {
      return this.isSelected;
    }
  },

  watch: {
    selected() {
      this.selectedAnimation();
    },
    moving(moving) {
      if (!moving) {
        if (this.currentTile.goal) {
          return this.finished()
        }

        this.moveToNextTile();
      }
    }
  },

  methods: {
    finished() {
      /* Finished */
      this.stop()
      this.$parent.finishGame(this)
      return
    },
    start() {
      if (!this.tile) {
        this.tiles = store.tiles.map(tile => {
          return {
            ...tile, visited: 0,
            decisions: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }
          }
        })

        this.currentTile = this.tiles[0]
        this.currentTile.visited = 1
      }

      this.moveToNextTile()
    },
    stop() {
      this.moving = false
      this.target = false
    },
    restart() {
      const x = this.player.position ? this.player.position.x : 0;
      const y = this.player.position ? this.player.position.y : 0;
      this.Player.setPosition(x, y);
      this.Shadow.setPosition(x + this.shadowDistance, y + this.shadowDistances);
      this.moving = false
      this.target = false
      this.tilesStack = []
      this.tile = false
      this.nextTile = false
      this.Player.body.reset(x, y);
      this.Shadow.body.reset((x + this.shadowDistance), (y + this.shadowDistance));
    },
    moveToNextTile(avoidItem) {
      store = getStore();

      if (!store.started || this.moving)
        return false

      let lastTile = this.currentTile
      let currentTile = this.nextTile ? this.nextTile : this.currentTile
      this.tilesStack.push(lastTile)
      currentTile.visited++

      this.lastTile = lastTile
      this.currentTile = currentTile
      this.nextTile = false

      let speed = this.player.speed ? this.player.speed : store.configs.speed

      // FOUNDED ITEM
      if (!avoidItem) {
        let foundedItem = store.items.find(i => i.tile == currentTile.number)
        if (foundedItem) {
          this.item = { ...foundedItem }
        }

        // HAS ITEM
        if (this.item) {
          this.item.count++

          if (this.item.count >= this.item.limit) {
            this.item = false
          } else {
            let Player = this

            switch (this.item.type) {
              case "speedup":
                speed = speed * 2
                break
              case "speeddown":
                speed = speed / 2
                break
              case "swirling":
                {
                  console.log("swirling")
                  let rotateInteval = setInterval(() => {
                    Player.Player.setOrigin(0.5, 0.5);
                    Player.Shadow.setOrigin(0.5, 0.5);
                    Player.Player.angle++;
                    Player.Shadow.angle++;
                  }, 0.1)
                  setTimeout(function () {
                    Player.Player.angle = 0;
                    Player.Shadow.angle = 0;
                    Player.item = false
                    Player.moveToNextTile(true)
                    clearInterval(rotateInteval)
                  }, this.item.limit * 1000)
                  return false
                }
            }
          }
        }
      }

      if (this.currentTile.goal) {
        return this.finished();
      }

      let nextTile = store.getPlayerNextRandomTile(this.currentTile, this.lastTile, this.tiles, this.player.inteligence);

      if (!nextTile) {
        if (this.tilesStack.length > 0) {
          nextTile = { tile: this.tilesStack.pop() }
        }
      }

      if (nextTile) {
        this.nextTile = nextTile.tile
        this.moveTo(nextTile.tile.number - 1, speed)
      }
    },
    preload(PhaserGame) {
      this.PhaserGame = PhaserGame;
      PhaserGame.load.plugin('rexglowfilterpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js', true);
      PhaserGame.load.image(this.player.name, this.player.image);

      let image = new Image();
      image.src = this.player.image;
    },

    create(PhaserGame) {
      const x = this.player.position ? this.player.position.x : 0;
      const y = this.player.position ? this.player.position.y : 0;
      const shadow = PhaserGame.physics.add.sprite(x, y, this.player.name);
      const player = PhaserGame.physics.add.sprite((x + this.shadowDistance), (y + this.shadowDistance), this.player.name);

      shadow.setOrigin(0.5);
      shadow.tint = 0x000000;
      shadow.alpha = 0.5;

      if (this.player.scale) {
        player.setScale(this.player.scale);
        shadow.setScale(this.player.scale);
      }

      this.physics = PhaserGame.physics;
      this.Player = player;
      this.Shadow = shadow;
      this.selectedAnimation();
    },

    update(PhaserGame) {
      if (this.target && this.Player.body) {
        let distance = Phaser.Math.Distance.Between(this.Player.x, this.Player.y, this.target.x, this.target.y);

        if (this.Player.body.speed > 0) {
          this.moving = true;
          //  4 is our distance tolerance, i.e. how close the source can get to the target
          //  before it is considered as being there. The faster it moves, the more tolerance is required.
          if (distance < 6) {
            this.Player.body.reset(this.target.x, this.target.y);
            this.Shadow.body.reset((this.target.x + this.shadowDistance), (this.target.y + this.shadowDistance));
            this.target = false;
          }
        } else { this.moving = false; this.target = false; }
      } else { this.moving = false; }
    },

    moveTo(to, speed = 100) {
      const player_x = this.player.position ? this.player.position.x : 0;
      const player_y = this.player.position ? this.player.position.y : 0;
      const tile = store.tiles[to] ? store.tiles[to] : false;

      if (tile) {
        this.target = {
          x: (tile.x + player_x),
          y: (tile.y + player_y),
          tile: tile
        };

        this.physics.moveToObject(this.Player, this.target, speed);
        this.physics.moveToObject(this.Shadow, this.target, speed);

        return true;
      }

      throw Error("Error while moving player " + this.player.name + " to: " + to + " ( tile " + to + " does not exist )");
    },

    selectedAnimation() {
      const Player = this.Player;
      const PhaserGame = this.PhaserGame;
      const Between = Phaser.Math.Between;
      var postFxPlugin = PhaserGame.plugins.get('rexglowfilterpipelineplugin');
      var pipeline = postFxPlugin.add(Player);

      if (this.selected) {
        Player.glowTask = Player.scene.tweens.add({
          targets: pipeline,
          intensity: 0.02,
          ease: 'Linear',
          duration: Between(500, 1000),
          repeat: -1,
          yoyo: true
        });

      } else {
        // Remove postfx pipeline
        postFxPlugin.remove(Player);
        if (Player.glowTask) {
          Player.glowTask.stop();
          Player.glowTask = null;
        }
      }
    }
  }
}
</script>
