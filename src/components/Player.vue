<template>
  <div class="GamePlayer">

  </div>
</template>

<script>
import objectMixins from "@/mixins/object-mixins.js";
import getStore from "$/store.js";
let store

export default {
  props: ['player', 'speed'],

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
      tile: false
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
      return this.player == store.turn.player;
    },
    selected() {
      return this.isSelected;
    }
  },

  watch: {
    tile(tile) {
      this.tilesStack.push(tile)
    },
    selected() {
      this.selectedAnimation();
    },
    moving(moving) {
      if (!moving && this.tile.goal) {
        store.started = false
        store.finished = true
        alert(this.player.name + " has founded the chest!")
      }
      if (!moving) this.moveToNextTile();
    }
  },

  methods: {
    start() {
      if (!this.tile) {
        this.tiles = store.tiles.map(tile => {
          return { ...tile, visited: false }
        })

        this.tile = this.tiles[0]
        this.tile.visited = true
      }

      this.moveToNextTile()
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
    moveToNextTile() {
      store = getStore();

      if (!store.started || this.moving)
        return false

      let nextTile = store.getRandomNeighbor(this.tile, this.tiles, true);

      if (!nextTile) {
        if (this.tilesStack.length > 0) {
          nextTile = { tile: this.tilesStack.pop() }
        }
      }

      if (nextTile) {
        this.moveTo(nextTile.tile.number - 1, this.speed)
        this.tile = nextTile.tile
        this.tile.visited = true
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
    },

    walkTo(walk_to, speed = 200) {
      // prevents from player walking to tile that does not exist
      this.walk_to = (parseInt(walk_to) > (store.tiles.length - 1))
        ? (store.tiles.length - 1)
        : parseInt(walk_to);
      this.walk_speed = speed;

      const next_tile = (this.walk_to > this.player.steps) ? this.player.steps + 1
        : (this.walk_to < this.player.steps) ? this.player.steps - 1
          : this.player.steps;

      const log = this.player.name + " is walking to: " + this.walk_to + ", next tile: " + next_tile;
      dd(log);

      return this.moveTo(next_tile, speed);

    },

    takeCoin(kind) {
      console.log("Player " + this.player.name + " toke a " + kind + " coin");

      this.player.coins[kind] = typeof this.player.coins[kind] != "number" ?
        1 :
        parseInt(this.player.coins[kind]) + 1;

      this.player.points = points[kind] ? this.player.points + points[kind] : this.player.points;

      playAudio('take-coin');
    },
    takeTreasure(kind) {
      console.log("Player " + this.player.name + " toke a " + kind + " treasure");

      this.player.treasures[kind] = typeof this.player.treasures[kind] != "number" ?
        1 :
        parseInt(this.player.treasures[kind]) + 1;

      this.player.points = points[kind] ? this.player.points + points[kind] : this.player.points;

      playAudio('take-treasure');
    },
    goFoward(steps) {
      const go_to = this.player.steps + steps;

      console.log(this.player.name + " is going foward " + steps + " steps");

      return this.walkTo(go_to);
    },
    goBack(steps) {
      const go_to = this.player.steps - steps;

      console.log(this.player.name + " is going back " + steps + " steps");

      return this.walkTo(go_to);
    },
    startOver() {
      console.log(this.player.name + " is starting over");
      this.moveTo(0, 200);
    }
  }
}
</script>
