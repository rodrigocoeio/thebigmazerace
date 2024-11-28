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
      item: false,
      effect: false,
      inteligence: false
    }
  },

  mounted() {
    this.player.Component = this;
    this.inteligence = this.player.inteligence || store.configs.inteligence
    window["player" + this.player.number] = this

    /* let Player = this
    setTimeout(function () {
      if (Player.player.number == 1)
        Player.foundChest()
    }, 5000) */
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
        this.reachedTile()
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

      //this.Player.x = this.currentTile.width / 2
      //this.Shadow.x = this.currentTile.width / 2

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
    reachedTile() {
      let lastTile = this.currentTile
      let currentTile = this.nextTile ? this.nextTile : this.currentTile
      this.tilesStack.push(lastTile)
      currentTile.visited++

      this.lastTile = lastTile
      this.currentTile = currentTile
      this.nextTile = false

      if (this.item)
        this.item.count++

      if (this.item.count >= this.item.limit)
        this.item = false

      this.getItem()

      if (this.onFinishMoving && typeof this.onFinishMoving === "function")
        return this.onFinishMoving()

      this.moveToNextTile();
    },

    moveToNextTile() {
      store = getStore();

      if (!store.started || this.moving || store.stopped)
        return false

      let speed = this.player.speed ? this.player.speed : store.configs.speed

      // Has Item
      if (this.item) {
        switch (this.item.type) {
          case "speedup":
            speed = speed * 2
            break
          case "speeddown":
            speed = speed / 2
            break
          case "swirling":
            return false
          case "twister":
            return false
        }
      }

      // Get Next Tile
      let nextTile = store.getPlayerNextRandomTile(this.currentTile, this.lastTile, this.tiles, this.inteligence);

      // Avoid Chest
      if (nextTile && nextTile.tile.goal && this.player.avoidChest) {
        nextTile = false
        console.log("Player " + this.player.number + " has avoided the chest!")
      }

      // If none Next Tile, get last in visited (go back)
      if (!nextTile) {
        if (this.tilesStack.length > 0) {
          nextTile = { tile: this.tilesStack.pop() }
        }
      }

      // If Next Tile
      if (nextTile) {
        this.nextTile = nextTile.tile
        this.moveTo(nextTile.tile.number, speed)
      }
    },

    // Get Item
    getItem() {
      let store = getStore()
      let currentTile = this.currentTile;

      let foundedItem = store.items.find(item => item.tile == currentTile.number && !item.taken)
      if (foundedItem) {
        foundedItem.taken = true
        this.item = foundedItem

        let foundedItemTile = store.tiles.find(tile => tile.number == foundedItem.tile)
        foundedItemTile.item = false

        let Player = this
        switch (this.item.type) {
          case "chest":
            this.foundChest()
            return this.finished()
          case "speedup":
            if (this.item.count == 0) {
              let audioNumber = Math.floor(Math.random() * 3) + 1
              playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
            }
            break
          case "speeddown":
            if (this.item.count == 0) {
              let audioNumber = Math.floor(Math.random() * 3) + 1
              playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
            }
            break
          case "swirling":
            this.swirling();
            break;
          case "twister":
            this.twister();
            break;
          case "bomb":
            this.bomb();
            break;
        }

        if (!store.finished)
          store.generateItem()
      }
    },

    foundChest() {
      let store = getStore()

      if (store.voice) {
        store.voice.pause()
        store.voice = false
      }

      let audioNumber = Math.floor(Math.random() * 2) + 1
      playAudio("take_chest")
      playAudio("finished" + audioNumber, "mp3", "voice")

      this.$parent.finishGame(this)
      this.finishedScreen()
    },

    finishedScreen() {
      const store = getStore()
      const width = store.configs.width
      const height = store.configs.height

      const overlay = this.PhaserGame.add.renderTexture(width / 2, height / 2, width, height);
      overlay.fill(0x000000, 0.5);

      const x = store.configs.width / 2
      const y = store.configs.height / 2 - 50
      const shadow = this.PhaserGame.physics.add.sprite(x - 100, y, this.player.name + "_big");
      const player = this.PhaserGame.physics.add.sprite((x - 100 + this.shadowDistance), (y + this.shadowDistance), this.player.name + "_big");

      const chest_x = x + 150
      const chest_y = y + 120
      const chest_shadow = this.PhaserGame.physics.add.sprite(chest_x, chest_y, "chest_open");
      const chest = this.PhaserGame.physics.add.sprite((chest_x + this.shadowDistance), (chest_y + this.shadowDistance), "chest_open");

      shadow.setOrigin(0.5);
      shadow.tint = 0x000000;
      shadow.alpha = 0.5;

      chest_shadow.setOrigin(0.5);
      chest_shadow.tint = 0x000000;
      chest_shadow.alpha = 0.5;

      const text_y = chest_y + 80
      const text_x = x - 300
      const finishedText = "The " + this.player.name + " has found the chest!"
      const text = this.PhaserGame.add.text(text_x, text_y, finishedText, { font: "600 48px Poppins", color: "white" });
      text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 1);
    },

    swirling() {
      let Player = this

      if (Player.item.count == 0) {
        let audioNumber = Math.floor(Math.random() * 3) + 1
        playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
      }

      if (this.rotateInteval)
        clearInterval(this.rotateInteval)

      this.rotateInteval = setInterval(() => {
        Player.Player.setOrigin(0.5, 0.5);
        Player.Shadow.setOrigin(0.5, 0.5);
        Player.Player.angle += 3;
        Player.Shadow.angle += 3;
      }, 0.1)
      setTimeout(function () {
        Player.Player.angle = 0;
        Player.Shadow.angle = 0;
        Player.item = false;
        Player.moveToNextTile(true);
        clearInterval(Player.rotateInteval);
        Player.dizzy();
      }, this.item.limit * 1000)
      return false
    },
    twister() {
      let Player = this
      let store = getStore()

      if (Player.item.count == 0) {
        let audioNumber = Math.floor(Math.random() * 3) + 1
        playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
      }

      console.log(this.player.name + " got a TWISTERR")

      let randomTile = store.getRandomTile()

      if (randomTile) {
        // Rotate
        if (this.rotateInteval)
          clearInterval(this.rotateInteval)

        this.rotateInteval = setInterval(() => {
          Player.Player.setOrigin(0.5, 0.5);
          Player.Shadow.setOrigin(0.5, 0.5);
          Player.Player.angle += 5;
          Player.Shadow.angle += 5;
        }, 0.1)

        let onFinished = function () {
          if (Player.item.count < Player.item.limit) {
            randomTile = store.getRandomTile()
            Player.nextTile = randomTile
            Player.item.count++
            return this.moveTo(randomTile.number, 300, onFinished)
          }

          Player.item = false
          Player.Player.angle = 0;
          Player.Shadow.angle = 0;
          clearInterval(Player.rotateInteval)
          Player.dizzy();
          return Player.moveToNextTile()
        }

        Player.nextTile = randomTile
        return this.moveTo(randomTile.number, 500, onFinished)
      }

      return false
    },

    dizzy() {
      if (this.dizzy_timeout)
        clearTimeout(this.dizzy_timeout)

      let Player = this
      let Dizzy = this.Dizzy
      let player = this.player

      playAudio("dizzy", "mp3", "voice")

      Dizzy.visible = true
      this.inteligence = "dumbest"
      this.dizzy_timeout = setTimeout(function () {
        Dizzy.visible = false
        console.log(player.inteligence)
        Player.inteligence = player.inteligence
        Player.dizzy_timeout = false
      }, store.configs.dizzy_seconds * 1000)
    },

    bomb() {
      let store = getStore()
      let random = Math.floor(Math.random() * 3) + 1
      playAudio("bomb" + random, "mp3", "voice")
      playAudio("explosion")

      const explosion = this.PhaserGame.physics.add.sprite(0, 0, "explosion");

      // Scale Explosion
      let tileWidth = this.currentTile.width
      let tileHeight = this.currentTile.height

      let explosionHeight = tileHeight / 2
      explosion.displayHeight = explosionHeight
      explosion.scaleX = explosion.scaleY;

      // Position Explosion
      explosion.x = this.currentTile.x + tileWidth / 2
      explosion.y = this.currentTile.y + tileHeight / 2

      // Remove explosion
      setTimeout(function () {
        explosion.destroy()
      }, 300)

      // Remove a wall
      // Get tile component
      let currentTile = this.currentTile
      let $tile = this.$parent.$refs.tiles.find($t => {
        return $t.number === currentTile.number
      })

      if (currentTile) {
        let neighbors = store.findClosedNeighbors(currentTile)

        if (neighbors.length > 0) {
          let random = Math.floor(Math.random() * neighbors.length)
          let neighbor = neighbors[random]

          currentTile.walls[neighbor.position] = false
          switch (neighbor.position) {
            case "top":
              neighbor.tile.walls.bottom = false;
              break;
            case "bottom":
              neighbor.tile.walls.top = false;
              break;
            case "left":
              neighbor.tile.walls.right = false;
              break;
            case "right":
              neighbor.tile.walls.left = false;
              break;
          }
        }
      }
    },


    preload(PhaserGame) {
      this.PhaserGame = PhaserGame;
      PhaserGame.load.image(this.player.name, this.player.image);
      PhaserGame.load.image(this.player.name + "_big", this.player.image_big);
      PhaserGame.load.image("dizzy", "/images/dizzy.png");
      PhaserGame.load.image("chest_open", "/images/chest_open.png");
      PhaserGame.load.image("explosion", "/images/explosion.png");

      let image = new Image();
      image.src = this.player.image;
    },

    create(PhaserGame) {
      const x = this.player.position ? this.player.position.x : 0;
      const y = this.player.position ? this.player.position.y : 0;
      const shadow = PhaserGame.physics.add.sprite((x + this.shadowDistance), (y + this.shadowDistance), this.player.name);
      const player = PhaserGame.physics.add.sprite(x, y, this.player.name);
      const dizzySprite = PhaserGame.physics.add.sprite(x, y, "dizzy");

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
      dizzySprite.displayHeight = playerHeight
      dizzySprite.scaleX = dizzySprite.scaleY;

      // Position Player
      let tileWidth = this.currentTile.width

      // First Tile
      let playerX = this.currentTile.number === 1 ? (tileWidth / 2 / 2) * this.player.number : tileWidth / 2
      let playerY = tileHeight / 2
      player.x = playerX
      player.y = playerY
      shadow.x = playerX + this.shadowDistance
      shadow.y = playerY + this.shadowDistance
      dizzySprite.x = playerX + this.shadowDistance
      dizzySprite.y = playerY + this.shadowDistance

      dizzySprite.visible = false

      this.physics = PhaserGame.physics;
      this.Player = player;
      this.Shadow = shadow;
      this.Dizzy = dizzySprite;
      //this.Glow = this.glow();
    },

    update(PhaserGame) {
      this.isOutOfScreenFix()

      if (this.target && this.Player.body) {
        if (this.Player.body.speed > 0) {
          let distance = Phaser.Math.Distance.Between(this.Player.x, this.Player.y, this.target.x, this.target.y);
          this.moving = true;

          //  4 is our distance tolerance, i.e. how close the source can get to the target
          //  before it is considered as being there. The faster it moves, the more tolerance is required.
          if (distance < 8 || store.configs.instant_mode) {
            this.Player.body.reset(this.target.x, this.target.y);
            this.Dizzy.body.reset(this.target.x, this.target.y);
            this.Shadow.body.reset((this.target.x + this.shadowDistance), (this.target.y + this.shadowDistance));
            this.target = false;
            this.distance = 0
          } else {
            this.distance = distance
          }

          //console.log(this.player.name + " is moving, distance: " + distance)
        } else { this.moving = false; this.target = false; }
      } else { this.moving = false; }
    },

    isOutOfScreenFix() {
      let position = this.Player.body.position
      let mazeWidth = store.configs.width
      let mazeHeight = store.configs.height
      let isOutOfScreen = position.x < 0 || position.y < 0 || position.x > mazeWidth || position.y > mazeHeight

      if (isOutOfScreen) {
        this.moving = false;
        this.target = false;
        this.Player.body.speed = 0
        this.Dizzy.body.speed = 0
        this.Shadow.body.speed = 0

        const tile = this.currentTile
        const player_x = tile.width / 2
        const player_y = tile.height / 2

        if (tile) {
          this.target = {
            x: (tile.x + player_x),
            y: (tile.y + player_y),
            tile: tile
          };

          this.Player.body.reset(this.target.x, this.target.y);
          this.Dizzy.body.reset(this.target.x, this.target.y);
          this.Shadow.body.reset((this.target.x + this.shadowDistance), (this.target.y + this.shadowDistance));

          this.moveToNextTile()
        }

        console.log(this.player.name + " got out of screen")
      }

      return isOutOfScreen
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
        this.physics.moveToObject(this.Dizzy, this.target, speed);

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
