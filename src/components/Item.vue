<template>
  <div class="GameItem">

  </div>
</template>

<script>
import objectMixins from "@/mixins/object-mixins.js";
import getStore from "$/store.js";
let store

export default {
  props: ['item'],

  mixins: objectMixins,

  data() {
    store = getStore();
    return {

    }
  },

  mounted() {

  },

  beforeUnmount() {

  },

  computed: {

  },

  watch: {

  },

  methods: {
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
    }
  }
}
</script>
