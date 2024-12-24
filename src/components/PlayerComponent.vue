<template>
  <div class="GamePlayer">

  </div>
</template>

<script>
import objectMixins from "@/mixins/object-mixins.js";
import getStore from "$/store.js";
import { playAudio } from "@/utils"
import Phaser from 'phaser'
let store

export default {
  props: ['player', 'number'],

  mixins: objectMixins,

  data() {
    store = getStore();
    const Game = this.$parent.Game;
    return {
      name: this.player.name,
      Game: Game,
      Scene: false,
      Player: false,
      Glow: false,
      shadowDistance: 5,
      moving: false,
      glowing: store.configs.display.glows,
      start_position: false,
      started: false,
      tiles: [],
      tilesStack: [], // walked tiles
      lastTile: false,
      currentTile: false,
      nextTile: false,
      item: false,
      effect: false,
      inteligence: false,
      hasKey: false,
      knowGoal: false
    }
  },

  mounted() {
    const store = getStore()

    this.inteligence = this.player.inteligence || store.configs.inteligence
    window["player" + this.player.number] = this

    this.currentTile = store.tiles.find(t => t.number === 1)
  },

  beforeUnmount() {
    window["player" + this.player.number] = undefined

    if (this.Glow) {
      this.glowing = false
      this.glow()
    }

    if (this.Player)
      this.Player.destroy()
    if (this.Dizzy)
      this.Dizzy.destroy()
    if (this.Fire)
      this.Fire.destroy()
    if (this.Mud)
      this.Mud.destroy()
    if (this.Key)
      this.Key.destroy()
  },

  watch: {
    currentTile() {
      const store = getStore()
      const playerNumber = this.number
      const player = store.players.find(player => player.number === playerNumber)
      player.tile = this.currentTile

      if (this.currentTile.goal) {
        this.knowGoal = true
      }
    },
    moving(moving) {
      if (!moving) {
        this.reachedTile()
      }
    },
    hasKey(hasKey) {
      if (this.Key)
        this.Key.visible = hasKey

      const store = getStore()
      const playerNumber = this.number
      const player = store.players.find(player => parseInt(player.number) == parseInt(playerNumber))
      player.hasKey = hasKey
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

      this.started = true
      this.moveToNextTile()
    },
    stop() {
      this.started = false
      this.nextTile = false
    },
    restart() {
      const x = this.player.position ? this.player.position.x : 0;
      const y = this.player.position ? this.player.position.y : 0;

      this.started = false
      this.moving = false
      this.target = false
      this.tilesStack = []
      this.tile = false
      this.nextTile = false

      this.Player.body.reset(x, y)
      this.Player.setPosition(x, y)
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

      if (!store.started || !this.started || this.moving || store.paused)
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
      let nextTile = store.getPlayerNextRandomTile(this);

      // If none Next Tile, get last in visited (go back)
      if (!nextTile) {
        if (this.tilesStack.length > 0) {
          nextTile = { tile: this.tilesStack.pop() }
        }
      }

      // If Next Tile
      if (nextTile) {
        console.log("Player " + this.number + " is moving to " + nextTile.tile.number)
        let position = nextTile.position
        if (position == "left") {
          this.Player.setFlipX(true);
        } else if (position == "right") {
          this.Player.setFlipX(false);
        }

        this.nextTile = nextTile.tile
        this.moveTo(nextTile.tile, speed)
      } else {
        console.log("Player " + this.number + " could not find a next tile")
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
          case "key":
            this.foundKey()
            return
          case "chest":
            this.foundChest()
            return
          case "speedup":
            if (this.item.count == 0) {
              let audioNumber = Math.floor(Math.random() * 3) + 1
              let rocketAudio = playAudio("rocket")
              rocketAudio.volume = 0.5
              playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
              this.Fire.visible = true
            }
            break
          case "speeddown":
            if (this.item.count == 0) {
              let audioNumber = Math.floor(Math.random() * 3) + 1
              playAudio("mud")
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

    foundKey() {
      store.stopsVoice()

      let audioNumber = Math.floor(Math.random() * 2) + 1
      playAudio("key", "wav")
      playAudio(this.player.name.toLowerCase() + "_key" + audioNumber, "mp3", "voice")
      this.hasKey = true
    },

    foundChest() {
      let store = getStore()
      if (store.configs.mode == "key" && !this.hasKey) {
        this.item.taken = false
        return false
      }

      this.hasKey = false
      store.finishGame(this)
    },

    swirl() {
      let Player = this

      if (Player.item.count == 0) {
        let audioNumber = Math.floor(Math.random() * 3) + 1
        let swirlAudio = playAudio("swirl")
        swirlAudio.volume = 0.5
        playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
      }

      this.stopsAllRotation()
      this.swirling = this.rotate(9, 50)

      setTimeout(function () {
        Player.item = false;
        Player.stopsAllRotation()
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
        let twisterAudio = playAudio("twister")
        twisterAudio.volume = 0.8
        playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
      }

      //console.log(this.player.name + " got a TWISTERR")

      let randomTile = store.getRandomTile(true)

      if (randomTile) {
        // Rotate
        this.stopsAllRotation()
        this.twisting = Player.rotate()
        this.twister_item = { ...this.item }

        const speed = store.configs.speed
        let onFinished = function () {
          if (Player.item && Player.twister_item.count <= Player.twister_item.limit) {
            randomTile = store.getRandomTile(true)
            Player.nextTile = randomTile
            Player.twister_item.count++
            return this.moveTo(randomTile, speed * store.configs.twister_speed_multiplier, onFinished)
          }

          Player.twister_item = false
          Player.item = false
          Player.stopsAllRotation()
          Player.dizzy();
          return Player.moveToNextTile()
        }

        Player.nextTile = randomTile
        return this.moveTo(randomTile, speed * store.configs.twister_speed_multiplier, onFinished)
      }

      return false
    },

    twister_golden() {
      let GameBoard = this.$parent
      let Player = this
      let store = getStore()

      if (Player.item.count == 0) {
        let audioNumber = Math.floor(Math.random() * 3) + 1
        playAudio("twister")
        playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
      }

      let goToTile = false


      // Key Mode
      if (store.configs.mode == "key") {
        let keyItem = store.items.find(item => item.type == "key" && !item.taken)

        // Key Item on the Map then go to the key tile
        if (keyItem)
          goToTile = store.tiles.find(tile => tile.number == keyItem.tile)

        // Already Have the Key go to the chest tile
        else if (this.hasKey)
          goToTile = store.tiles.find(tile => tile.goal)

        // If key is with other player, go to player
        else {
          let playerWithKey = store.players.find(player => player.hasKey)
          goToTile = store.tiles.find(tile => tile.number == playerWithKey.tile.number)
        }

        // Chest Mode
      } else {
        goToTile = store.tiles.find(tile => tile.goal)
      }

      if (goToTile) {
        // Rotate
        this.stopsAllRotation()
        this.twisting_golden = Player.rotate()
        this.twister_item = { ...this.item }

        const speed = store.configs.speed
        let onFinished = function () {
          Player.twister_item = false
          Player.item = false

          if (Player.currentTile.number === goToTile.number) {
            console.log(Player.player.name + " finished twisting golden" + Player.currentTile.number)
            Player.stopsAllRotation()
            Player.dizzy();
            return Player.moveToNextTile()
          }
        }

        console.log(this.player.name + " twisting golden" + goToTile.number)
        Player.nextTile = goToTile
        return this.moveTo(goToTile, speed * store.configs.twister_speed_multiplier, onFinished)
      } else {
        console.error("Twister Golden: Could not find the right go to tile")
      }
    },

    rotate(angle, interval) {
      const Player = this
      interval = interval ? interval : 30
      angle = angle ? angle : 35

      Player.Player.setOrigin(0.5, 0.5);
      return setInterval(() => {
        if (store.paused) return false
        Player.Player.angle += angle;
      }, interval)
    },

    stopRotating(rotating) {
      if (rotating) {
        this.Player.angle = 0;

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
      explosion.depth = 1.1

      // Position Explosion
      explosion.x = this.currentTile.x + tileWidth / 2
      explosion.y = this.currentTile.y + tileHeight / 2

      // Remove explosion
      setTimeout(function () {
        explosion.destroy()
      }, 500)

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
      Scene.load.image("hasKey", "/images/hasKey.png");

      let image = new Image();
      image.src = this.player.image;
    },

    create(Scene) {
      this.physics = Scene.physics;

      const x = this.player.position ? this.player.position.x : 0;
      const y = this.player.position ? this.player.position.y : 0;
      // Scale Player by Tiles Height
      const tileHeight = this.currentTile.height
      const playerHeight = tileHeight / 1.5
      // Position Player by Tiles Width
      const tileWidth = this.currentTile.width
      const playerX = this.currentTile.number === 1 ? (tileWidth / 2 / 2) * this.player.number : tileWidth / 2
      const playerY = tileHeight / 2

      // Create Player Sprite
      const player = Scene.physics.add.sprite(x, y, this.player.name);
      player.depth = 1
      player.displayHeight = playerHeight
      player.scaleX = player.scaleY;
      player.x = playerX
      player.y = playerY
      this.Player = player;

      // Player Shadow
      if (store.configs.display.shadows)
        player.preFX.addShadow(-10, -10, 0.006, 2, 0x333333, 10);

      // Dizzy Sprite
      const dizzySprite = Scene.physics.add.sprite(x, y, "dizzy");
      dizzySprite.depth = 1.1
      dizzySprite.displayHeight = playerHeight
      dizzySprite.scaleX = dizzySprite.scaleY;
      dizzySprite.x = playerX
      dizzySprite.y = playerY
      dizzySprite.visible = false
      this.Dizzy = dizzySprite;

      // Mud Sprite
      const mudSprite = Scene.physics.add.sprite(x, y, "mud");
      mudSprite.depth = 1.1
      mudSprite.displayHeight = playerHeight
      mudSprite.scaleX = mudSprite.scaleY;
      mudSprite.x = playerX
      mudSprite.y = playerY
      mudSprite.alpha = 0.7
      mudSprite.visible = false
      this.Mud = mudSprite;

      // Fire Sprite
      const fireSprite = Scene.physics.add.sprite(x, y, "fire");
      fireSprite.depth = 0.9
      fireSprite.displayHeight = playerHeight
      fireSprite.scaleX = fireSprite.scaleY;
      fireSprite.x = playerX
      fireSprite.y = playerY
      fireSprite.visible = false
      this.Fire = fireSprite;

      // Key Sprite
      const keySprite = Scene.physics.add.sprite(x, y, "hasKey");
      keySprite.depth = 1.1
      keySprite.displayHeight = playerHeight
      keySprite.scaleX = keySprite.scaleY;
      keySprite.x = playerX
      keySprite.y = playerY
      keySprite.visible = this.hasKey
      this.Key = keySprite;

      this.Glow = this.glow();
      this.stoleKeyCollider(Scene);
    },

    stoleKeyCollider(Scene) {
      // Collider stolle key on key mode
      if (store.configs.mode == "key" && this.player.number == 2) {
        const GameBoard = this.$parent
        const player1 = GameBoard.player1
        const player2 = GameBoard.player2
        store.playersLastTouched = new Date()

        Scene.physics.add.overlap(player1.Player, this.Player, function () {
          let lastTouchedSeconds = Math.round((new Date() - store.playersLastTouched) / 1000, 2)

          // Detect touch every x second
          if (lastTouchedSeconds >= store.configs.detect_players_touch_seconds) {
            store.playersLastTouched = new Date()

            // Stole Key
            if (player1.hasKey) {
              player1.hasKey = false
              player2.foundKey()
            }
            else
              if (player2.hasKey) {
                player2.hasKey = false
                player1.foundKey()
              }
          }
        });
      }
    },

    update() {
      //this.isOutOfScreenFix()

      if (this.target && this.Player.body) {
        if (this.Player.body.speed > 0) {
          let distance = Phaser.Math.Distance.Between(this.Player.x, this.Player.y, this.target.x, this.target.y);
          this.moving = true;

          //console.log(distance);

          //  4 is our distance tolerance, i.e. how close the source can get to the target
          //  before it is considered as being there. The faster it moves, the more tolerance is required.
          if (distance < 8 || store.configs.instant_mode) {
            this.Player.body.reset(this.target.x, this.target.y);
            this.Dizzy.body.reset(this.target.x, this.target.y);
            this.Mud.body.reset(this.target.x, this.target.y);
            this.Fire.body.reset(this.target.x, this.target.y);
            this.Key.body.reset(this.target.x, this.target.y);
            this.target = false;
            this.distance = 0
          } else {
            this.distance = distance
          }

          //console.log(this.player.name + " is moving, distance: " + distance)
        } else { this.moving = false; this.target = false; }
      } else { this.moving = false; }
    },

    moveTo(tile, speed = 100, onFinishMoving) {
      const player_x = tile.width / 2
      const player_y = tile.height / 2

      if (tile) {
        this.target = {
          x: (tile.x + player_x),
          y: (tile.y + player_y),
          tile: tile
        };

        this.physics.moveToObject(this.Player, this.target, speed);

        if (this.Dizzy.visible)
          this.physics.moveToObject(this.Dizzy, this.target, speed);
        if (this.Mud.visible)
          this.physics.moveToObject(this.Mud, this.target, speed);
        if (this.Fire.visible)
          this.physics.moveToObject(this.Fire, this.target, speed);
        if (store.configs.mode == "key")
          this.physics.moveToObject(this.Key, this.target, speed);

        this.moving = true
        this.onFinishMoving = onFinishMoving

        return true;
      }
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
        this.Fire.body.speed = 0
        this.Mud.body.speed = 0
        this.Key.body.speed = 0

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
          this.Key.body.reset(this.target.x, this.target.y);
          this.Shadow.body.reset((this.target.x + this.shadowDistance), (this.target.y + this.shadowDistance));

          this.moveToNextTile()
        }

        console.log(this.player.name + " got out of screen")
      }

      return isOutOfScreen
    },

    glow() {
      const Player = this.Player;
      const Scene = this.Scene;

      if (this.glowing) {
        const Between = Phaser.Math.Between;
        var postFxPlugin = Scene.plugins.get('rexglowfilterpipelineplugin');
        var pipeline = postFxPlugin.add(Player);

        return Player.scene.tweens.add({
          targets: pipeline,
          intensity: 0.02,
          ease: 'Linear',
          duration: Between(500, 1000),
          repeat: -1,
          yoyo: true
        });

      } else {
        // Remove postfx pipeline
        if (this.Glow) {
          postFxPlugin.remove(Player);
          this.Glow.stop();
          this.Glow = null;
        }

        return false
      }
    }
  }
}
</script>
