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
      Glow: false,
      shadowDistance: 5,
      moving: false,
      glowing: false,
      start_position: false,
      tiles: [],
      tilesStack: [], // walked tiles
      lastTile: false,
      currentTile: store.tiles.find(t => t.number === 1),
      nextTile: false,
      item: false,
      effect: false,
      inteligence: false,
      hasKey: false
    }
  },

  mounted() {
    this.player.Component = this;
    this.inteligence = this.player.inteligence || store.configs.inteligence
    window["player" + this.player.number] = this
  },

  beforeUnmount() {
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
    moving(moving) {
      if (!moving) {
        this.reachedTile()
      }
    },
    hasKey(hasKey) {
      if (this.Key)
        this.Key.visible = hasKey
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
      this.moving = false
      this.target = false
      this.tilesStack = []
      this.tile = false
      this.nextTile = false
      this.Player.body.reset(x, y);
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
        let position = nextTile.position
        if (position == "left") {
          this.Player.setFlipX(true);
        } else if (position == "right") {
          this.Player.setFlipX(false);
        }

        this.nextTile = nextTile.tile
        this.moveTo(nextTile.tile, speed)
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

      this.stopRotating(this.swirling)
      this.swirling = this.rotate(9, 50)

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
        let twisterAudio = playAudio("twister")
        twisterAudio.volume = 0.8
        playAudio(Player.player.name.toLowerCase() + "_" + Player.item.type + audioNumber, "mp3", "voice")
      }

      //console.log(this.player.name + " got a TWISTERR")

      let randomTile = store.getRandomTile(true)

      if (randomTile) {
        // Rotate
        this.stopRotating(this.twisting)
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
          Player.stopRotating(Player.twisting)
          Player.dizzy();
          return Player.moveToNextTile()
        }

        Player.nextTile = randomTile
        return this.moveTo(randomTile, speed * store.configs.twister_speed_multiplier, onFinished)
      }

      return false
    },

    twister_golden() {
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
          switch (this.player.number) {
            case 1:
              goToTile = player2.nextTile
              break;
            case 2:
              goToTile = player1.nextTile
              break
          }
        }

        // Chest Mode
      } else {
        goToTile = store.tiles.find(tile => tile.goal)
      }

      if (goToTile) {
        // Rotate
        this.stopRotating(this.twisting_golden)
        this.twisting_golden = Player.rotate()
        this.twister_item = { ...this.item }

        const speed = store.configs.speed
        let onFinished = function () {
          Player.twister_item = false
          Player.item = false

          if (Player.currentTile.number === goToTile.number) {
            console.log(Player.player.name + " finished twisting golden" + Player.currentTile.number)
            Player.stopRotating(Player.twisting_golden)
            Player.dizzy();
            return Player.moveToNextTile()
          }
        }

        console.log(this.player.name + " twisting golden" + goToTile.number)
        Player.nextTile = goToTile
        return this.moveTo(goToTile, speed * store.configs.twister_speed_multiplier, onFinished)
      }

      return false
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
      const x = this.player.position ? this.player.position.x : 0;
      const y = this.player.position ? this.player.position.y : 0;
      const player = Scene.physics.add.sprite(x, y, this.player.name);
      if (store.configs.display.shadows)
        player.preFX.addShadow(-10, -10, 0.006, 2, 0x333333, 10);
      const dizzySprite = Scene.physics.add.sprite(x, y, "dizzy");
      const mudSprite = Scene.physics.add.sprite(x, y, "mud");
      const fireSprite = Scene.physics.add.sprite(x, y, "fire");
      const keySprite = Scene.physics.add.sprite(x, y, "hasKey");



      player.depth = 1
      dizzySprite.depth = 1
      mudSprite.depth = 1
      fireSprite.depth = 0.9
      keySprite.depth = 1.1

      // Scale Player
      let tileHeight = this.currentTile.height
      let playerHeight = tileHeight / 1.5

      player.displayHeight = playerHeight
      player.scaleX = player.scaleY;
      dizzySprite.displayHeight = playerHeight
      dizzySprite.scaleX = dizzySprite.scaleY;
      mudSprite.displayHeight = playerHeight
      mudSprite.scaleX = dizzySprite.scaleY;
      fireSprite.displayHeight = playerHeight
      fireSprite.scaleX = dizzySprite.scaleY;
      keySprite.displayHeight = playerHeight
      keySprite.scaleX = dizzySprite.scaleY;

      // Position Player
      let tileWidth = this.currentTile.width

      // First Tile
      let playerX = this.currentTile.number === 1 ? (tileWidth / 2 / 2) * this.player.number : tileWidth / 2
      let playerY = tileHeight / 2
      player.x = playerX
      player.y = playerY
      dizzySprite.x = playerX + this.shadowDistance
      dizzySprite.y = playerY + this.shadowDistance
      mudSprite.x = playerX + this.shadowDistance
      mudSprite.y = playerY + this.shadowDistance
      fireSprite.x = playerX + this.shadowDistance
      fireSprite.y = playerY + this.shadowDistance
      keySprite.x = playerX + this.shadowDistance
      keySprite.y = playerY + this.shadowDistance

      dizzySprite.visible = false
      mudSprite.visible = false
      fireSprite.visible = false
      keySprite.visible = this.hasKey
      mudSprite.alpha = 0.7

      this.physics = Scene.physics;
      this.Player = player;
      this.Dizzy = dizzySprite;
      this.Mud = mudSprite;
      this.Fire = fireSprite;
      this.Key = keySprite;
      this.Glow = this.glow();

      // Collider stolle key on key mode
      if (store.configs.mode == "key" && this.player.number == 2) {
        let lastTouched = new Date()
        Scene.physics.add.overlap(player1.Player, player, function (args) {
          let lastTouchedSeconds = Math.round((new Date() - lastTouched) / 1000, 2)

          // Detect touch every x second
          if (lastTouchedSeconds >= store.configs.detect_players_touch_seconds) {
            lastTouched = new Date()

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

    update(Scene) {
      //this.isOutOfScreenFix()

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

      throw Error("Error while moving player " + this.player.name + " to: " + to + " ( tile " + to + " does not exist )");
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
