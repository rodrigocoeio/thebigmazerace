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
      name: this.player.name,
      Game: Game,
      Scene: false,
      Player: false,
      Shadow: false,
      Glow: false,
      shadowDistance: 5,
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

    stopsVoice() {
      let store = getStore()

      if (store.voice) {
        store.voice.pause()
        store.voice = false
      }
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

      if (this.item.count >= this.item.limit) {
        this.Fire.visible = false
        this.Mud.visible = false
        this.item = false
      }

      this.getItem()

      if (this.onFinishMoving && typeof this.onFinishMoving === "function")
        return this.onFinishMoving()

      this.moveToNextTile();
    },

    moveToNextTile() {
      store = getStore();

      if (!store.started || this.moving || store.paused)
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
          case "swirl":
            return false
          case "twister":
            return false
          case "twister_golden":
            return false
        }
      } else {
        this.Fire.visible = false
        this.Mud.visible = false
      }

      // Get Next Tile
      let nextTile = store.getPlayerNextRandomTile(this.currentTile, this.lastTile, this.tiles, this.inteligence, this.player.avoidChest);

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

        this.Mud.visible = false
        this.Fire.visible = false

        let Player = this
        switch (this.item.type) {
          case "chest":
            this.foundChest()
            return
          case "speedup":
            if (this.item.count == 0) {
              let audioNumber = Math.floor(Math.random() * 3) + 1
              playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
              this.Fire.visible = true
            }
            break
          case "speeddown":
            if (this.item.count == 0) {
              let audioNumber = Math.floor(Math.random() * 3) + 1
              playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
              this.Mud.visible = true
            }
            break
          case "swirl":
            this.swirl();
            break;
          case "twister":
            this.twister();
            break;
          case "twister_golden":
            this.twister_golden();
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
      this.stopsVoice()
      this.stopsAllRotation()

      let audioNumber = Math.floor(Math.random() * 2) + 1
      playAudio("take_chest")
      playAudio("finished" + audioNumber, "mp3", "voice")

      let store = getStore()
      store.finishGame(this)
    },

    swirl() {
      let Player = this

      if (Player.item.count == 0) {
        let audioNumber = Math.floor(Math.random() * 3) + 1
        playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
      }

      this.stopRotating(this.swirling)
      this.swirling = this.rotate()

      setTimeout(function () {
        Player.item = false;
        Player.stopRotating(Player.swirling)
        Player.dizzy();
        Player.moveToNextTile(true);
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

      //console.log(this.player.name + " got a TWISTERR")

      let randomTile = store.getRandomTile(true)

      if (randomTile) {
        // Rotate
        this.stopRotating(this.twisting)
        this.twisting = Player.rotate(1, 5)
        this.twister_item = { ...this.item }

        const speed = store.configs.speed
        let onFinished = function () {
          if (Player.item && Player.twister_item.count <= Player.twister_item.limit) {
            randomTile = store.getRandomTile(true)
            Player.nextTile = randomTile
            Player.twister_item.count++
            return this.moveTo(randomTile.number, speed * 3, onFinished)
          }

          Player.twister_item = false
          Player.item = false
          Player.stopRotating(Player.twisting)
          Player.dizzy();
          return Player.moveToNextTile()
        }

        Player.nextTile = randomTile
        return this.moveTo(randomTile.number, speed * 3, onFinished)
      }

      return false
    },

    twister_golden() {
      let Player = this
      let store = getStore()

      if (Player.item.count == 0) {
        let audioNumber = Math.floor(Math.random() * 3) + 1
        playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
      }

      let chestTile = store.tiles.find(tile => tile.goal)

      if (chestTile) {
        // Rotate
        this.stopRotating(this.twisting_golden)
        this.twisting_golden = Player.rotate(1, 5)
        this.twister_item = { ...this.item }

        const speed = store.configs.speed
        let onFinished = function () {
          Player.twister_item = false
          Player.item = false
        }

        Player.nextTile = chestTile
        return this.moveTo(chestTile.number, speed * 3, onFinished)
      }

      return false
    },

    rotate(interval, angle) {
      const Player = this
      interval = interval ? interval : 1
      angle = angle ? angle : 5

      Player.Player.setOrigin(0.5, 0.5);
      Player.Shadow.setOrigin(0.5, 0.5);
      return setInterval(() => {
        if (store.paused) return false
        Player.Player.angle += angle;
        Player.Shadow.angle += angle;
      }, interval)
    },

    stopRotating(rotating) {
      if (rotating) {
        this.Player.angle = 0;
        this.Shadow.angle = 0;

        clearInterval(rotating)
        rotating = false
      }

      return rotating
    },

    stopsAllRotation() {
      this.stopRotating(this.swirling)
      this.stopRotating(this.twisting)
      this.stopRotating(this.twisting_golden)
    },

    dizzy() {
      let store = getStore()

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
        Player.inteligence = player.inteligence ? player.inteligence : store.configs.inteligence
        console.log(Player.player.name + " - " + Player.inteligence)
        Player.dizzy_timeout = false
      }, store.configs.dizzy_seconds * 1000)
    },

    bomb() {
      let store = getStore()
      let random = Math.floor(Math.random() * 3) + 1
      playAudio("bomb" + random, "mp3", "voice")
      let bombSound = playAudio("explosion")
      bombSound.volume = 0.4

      const explosion = this.Scene.physics.add.sprite(0, 0, "explosion");

      // Scale Explosion
      let tileWidth = this.currentTile.width
      let tileHeight = this.currentTile.height

      let explosionHeight = tileHeight / 1.2
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

    preload(Scene) {
      this.Scene = Scene;
      Scene.load.image(this.player.name, this.player.image);
      Scene.load.image(this.player.name + "_big", this.player.image_big);
      Scene.load.image("mud", "/images/mud.png");
      Scene.load.image("fire", "/images/fire.png");
      Scene.load.image("dizzy", "/images/dizzy.png");
      Scene.load.image("chest_open", "/images/chest_open.png");
      Scene.load.image("explosion", "/images/explosion.png");

      let image = new Image();
      image.src = this.player.image;
    },

    create(Scene) {
      const x = this.player.position ? this.player.position.x : 0;
      const y = this.player.position ? this.player.position.y : 0;
      const shadow = Scene.physics.add.sprite((x + this.shadowDistance), (y + this.shadowDistance), this.player.name);
      const player = Scene.physics.add.sprite(x, y, this.player.name);
      const dizzySprite = Scene.physics.add.sprite(x, y, "dizzy");
      const mudSprite = Scene.physics.add.sprite(x, y, "mud");
      const fireSprite = Scene.physics.add.sprite(x, y, "fire");

      player.depth = 1
      shadow.depth = 1
      dizzySprite.depth = 1
      mudSprite.depth = 1
      fireSprite.depth = 0.9

      shadow.setOrigin(0.5);
      shadow.tint = 0x000000;
      shadow.alpha = 0.5;

      // Scale Player
      let tileHeight = this.currentTile.height
      let playerHeight = tileHeight / 1.5

      player.displayHeight = playerHeight
      player.scaleX = player.scaleY;
      shadow.displayHeight = playerHeight
      shadow.scaleX = player.scaleY;
      dizzySprite.displayHeight = playerHeight
      dizzySprite.scaleX = dizzySprite.scaleY;
      mudSprite.displayHeight = playerHeight
      mudSprite.scaleX = dizzySprite.scaleY;
      fireSprite.displayHeight = playerHeight
      fireSprite.scaleX = dizzySprite.scaleY;

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
      mudSprite.x = playerX + this.shadowDistance
      mudSprite.y = playerY + this.shadowDistance
      fireSprite.x = playerX + this.shadowDistance
      fireSprite.y = playerY + this.shadowDistance

      dizzySprite.visible = false
      mudSprite.visible = false
      fireSprite.visible = false
      mudSprite.alpha = 0.7

      this.physics = Scene.physics;
      this.Player = player;
      this.Shadow = shadow;
      this.Dizzy = dizzySprite;
      this.Mud = mudSprite;
      this.Fire = fireSprite;
      //this.Glow = this.glow();
    },

    update(Scene) {
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
            this.Mud.body.reset(this.target.x, this.target.y);
            this.Fire.body.reset(this.target.x, this.target.y);
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
          this.Fire.body.reset(this.target.x, this.target.y);
          this.Mud.body.reset(this.target.x, this.target.y);
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
        this.physics.moveToObject(this.Mud, this.target, speed);
        this.physics.moveToObject(this.Fire, this.target, speed);

        return true;
      }

      throw Error("Error while moving player " + this.player.name + " to: " + to + " ( tile " + to + " does not exist )");
    },

    glow() {
      const Player = this.Player;
      const Scene = this.Scene;
      const Between = Phaser.Math.Between;
      var postFxPlugin = Scene.plugins.get('rexglowfilterpipelineplugin');
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
