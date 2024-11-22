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
      Glow: false,
      shadowDistance: 3,
      moving: false,
      glowing: true,
      start_position: false,
      tiles: [],
      tilesStack: [], // walked tiles
      lastTile: false,
      currentTile: store.tiles.find(t => t.number === 1),
      nextTile: false,
      item: false
    }
  },

  mounted() {
    this.player.Component = this;
  },

  beforeUnmount() {
    if (this.Glow) {
      this.glowing = false
      this.glow()
    }

    if (this.Player)
      this.Player.destroy()

    if (this.Shadow)
      this.Shadow.destroy()
  },

  watch: {
    moving(moving) {
      if (!moving) {
        if (this.onFinishMoving && typeof this.onFinishMoving === "function")
          return this.onFinishMoving()

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

        this.currentTile = this.tiles.find(t => t.number === 1)
        this.currentTile.visited = 1
      }

      this.Player.x = this.currentTile.width / 2
      this.Shadow.x = this.currentTile.width / 2

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
        let foundedItem = store.items.find(item => item.tile == currentTile.number)
        if (foundedItem && !foundedItem.taken) {
          foundedItem.taken = true
          this.item = foundedItem
          store.generateItem()
        }

        // HAS ITEM
        if (this.item) {
          let Player = this

          switch (this.item.type) {
            case "chest":
              this.finished()
              break
            case "speedup":
              speed = speed * 2
              break
            case "speeddown":
              speed = speed / 2
              break
            case "swirling":
              {
                let rotateInteval = setInterval(() => {
                  Player.Player.setOrigin(0.5, 0.5);
                  Player.Shadow.setOrigin(0.5, 0.5);
                  Player.Player.angle += 1;
                  Player.Shadow.angle += 1;
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
            case "twister":
              {
                let randomTile = store.getRandomTile()
                if (randomTile) {
                  this.item.count++

                  // Rotate
                  let rotateInteval = setInterval(() => {
                    Player.Player.setOrigin(0.5, 0.5);
                    Player.Shadow.setOrigin(0.5, 0.5);
                    Player.Player.angle += 3;
                    Player.Shadow.angle += 3;
                  }, 0.1)

                  let Game = this.$parent
                  let onFinished = function () {
                    if (Player.item.count >= Player.item.limit) {
                      Player.lastTile = Player.currentTile
                      Player.currentTile = Player.nextTile
                      Player.nextTile = false
                      Player.item = false
                      Player.Player.angle = 0;
                      Player.Shadow.angle = 0;
                      clearInterval(rotateInteval)
                      return Player.moveToNextTile()
                    } else {
                      randomTile = store.getRandomTile()
                      Player.nextTile = randomTile
                      return this.moveTo(randomTile.number, 300, onFinished)
                    }
                  }

                  Player.nextTile = randomTile
                  return this.moveTo(randomTile.number, 300, onFinished)
                }

                return false
              }
          }

          if (this.item.count >= this.item.limit)
            this.item = false
          else
            this.item.count++
        }
      }

      // Found Chest
      if (this.currentTile.goal) {
        return this.finished();
      }

      // Get Next Tile
      let nextTile = store.getPlayerNextRandomTile(this.currentTile, this.lastTile, this.tiles, this.player.inteligence);

      // If none Next Tile, get last in visited (go back)
      if (!nextTile) {
        if (this.tilesStack.length > 0) {
          nextTile = { tile: this.tilesStack.pop() }
        }
      }

      if (nextTile) {
        this.nextTile = nextTile.tile
        this.moveTo(nextTile.tile.number, speed)
      }
    },
    preload(PhaserGame) {
      this.PhaserGame = PhaserGame;
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

      // Scale Player
      let tileHeight = this.currentTile.height
      let playerHeight = tileHeight / 2

      player.displayHeight = playerHeight
      player.scaleX = player.scaleY;
      shadow.displayHeight = playerHeight
      shadow.scaleX = player.scaleY;

      // Position Player
      let tileWidth = this.currentTile.width

      // First Tile
      let playerX = this.currentTile.number === 1 ? (tileWidth / 2 / 2) * this.player.number : tileWidth / 2
      let playerY = tileHeight / 2
      player.x = playerX
      player.y = playerY
      shadow.x = playerX + this.shadowDistance
      shadow.y = playerY + this.shadowDistance

      this.physics = PhaserGame.physics;
      this.Player = player;
      this.Shadow = shadow;
      this.Glow = this.glow();
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

    moveTo(to, speed = 100, onFinishMoving) {
      const tile = store.tiles.find(t => t.number == to)
      const player_x = tile.width / 2
      const player_y = tile.height / 2

      if (tile) {
        this.target = {
          x: (tile.x + player_x),
          y: (tile.y + player_y),
          tile: tile
        };

        this.onFinishMoving = onFinishMoving

        this.physics.moveToObject(this.Player, this.target, speed);
        this.physics.moveToObject(this.Shadow, this.target, speed);

        return true;
      }

      throw Error("Error while moving player " + this.player.name + " to: " + to + " ( tile " + to + " does not exist )");
    },

    glow() {
      const Player = this.Player;
      const PhaserGame = this.PhaserGame;
      const Between = Phaser.Math.Between;
      var postFxPlugin = PhaserGame.plugins.get('rexglowfilterpipelineplugin');
      var pipeline = postFxPlugin.add(Player);

      if (this.glowing) {
        this.Glow = Player.scene.tweens.add({
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
        if (this.Glow) {
          this.Glow.stop();
          this.Glow = null;
        }
      }
    }
  }
}
</script>
