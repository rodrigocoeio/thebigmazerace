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
      shadowDistance: 2
    }
  },

  mounted() {

  },

  beforeUnmount() {
    if (this.Item)
      this.Item.destroy()

    if (this.Shadow)
      this.Shadow.destroy()
  },

  computed: {

  },

  watch: {

  },

  methods: {
    preload(PhaserGame) {
      this.PhaserGame = PhaserGame;
      PhaserGame.load.plugin('rexglowfilterpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js', true);
      PhaserGame.load.image(this.item.type, this.item.image);

      let image = new Image();
      image.src = this.item.image;
    },

    create(PhaserGame) {
      let item = this.item
      let x = this.item.position ? this.item.position.x : 0;
      let y = this.item.position ? this.item.position.y : 0;
      const tile = store.tiles.find(t => t.number == item.tile)

      if (tile) {
        console.log(tile)
        x = x + tile.x
        y = y + tile.y
      }

      const Shadow = PhaserGame.physics.add.sprite((x + this.shadowDistance), (y + this.shadowDistance), this.item.type);
      const Item = PhaserGame.physics.add.sprite(x, y, this.item.type);

      Shadow.setOrigin(0.5);
      Shadow.tint = 0x000000;
      Shadow.alpha = 0.5;

      if (this.item.scale) {
        Item.setScale(this.item.scale);
        Shadow.setScale(this.item.scale);
      }

      this.physics = PhaserGame.physics;
      this.Item = Item;
      this.Shadow = Shadow;
    },

    update(PhaserGame) {
      if (this.target && this.Item.body) {
        let distance = Phaser.Math.Distance.Between(this.Item.x, this.Item.y, this.target.x, this.target.y);

        if (this.Item.body.speed > 0) {
          this.moving = true;
          //  4 is our distance tolerance, i.e. how close the source can get to the target
          //  before it is considered as being there. The faster it moves, the more tolerance is required.
          if (distance < 6) {
            this.Item.body.reset(this.target.x, this.target.y);
            this.Shadow.body.reset((this.target.x + this.shadowDistance), (this.target.y + this.shadowDistance));
            this.target = false;
          }
        } else { this.moving = false; this.target = false; }
      } else { this.moving = false; }
    },

    moveTo(to, speed = 100) {
      const item_x = this.item.position ? this.item.position.x : 0;
      const item_y = this.item.position ? this.item.position.y : 0;
      const tile = store.tiles[to] ? store.tiles[to] : false;

      if (tile) {
        this.target = {
          x: (tile.x + item_x),
          y: (tile.y + item_y),
          tile: tile
        };

        this.physics.moveToObject(this.Item, this.target, speed);
        this.physics.moveToObject(this.Shadow, this.target, speed);

        return true;
      }

      throw Error("Error while moving item " + this.item.name + " to: " + to + " ( tile " + to + " does not exist )");
    }
  }
}
</script>
