<template>
  <div class="GameItem">

  </div>
</template>

<script>
import objectMixins from "@/mixins/object-mixins.js";
import getStore from "$/store.js";
let store

export default {
  props: ['item', 'taken'],

  mixins: objectMixins,

  data() {
    store = getStore();
    return {
      shadowDistance: 5,
      glowing: false,
      Glow: false
    }
  },

  mounted() {
    /* if (this.item.type === "chest" || this.item.type === "key") {
      let Item = this

      setTimeout(() => {
        Item.glowing = true
        Item.glow()
      }, 500)
    } */
  },

  beforeUnmount() {
    //console.log("unmounting item number: " + this.item.number)
    if (this.Item)
      this.Item.destroy()
  },

  computed: {

  },

  watch: {
    taken(taken) {
      if (taken) {
        if (this.Item)
          this.Item.destroy()
      }
    }
  },

  methods: {
    preload(Scene) {
      this.Scene = Scene;
    },
    create(Scene) {
      let item = this.item
      const tile = store.tiles.find(t => t.number == item.tile)
      let item_x = tile.x + tile.width / 2
      let item_y = tile.y + tile.height / 2

      const Item = Scene.physics.add.sprite(item_x, item_y, this.item.type);
      if (store.configs.display.shadows)
        Item.preFX.addShadow(-10, -10, 0.006, 2, 0x333333, 10);

      Item.depth = 0.9

      // Scale Item
      let itemHeight = this.item.type === "chest" ? tile.height / 1.5 : tile.height / 2
      Item.displayHeight = itemHeight
      Item.scaleX = Item.scaleY;


      this.physics = Scene.physics;
      this.Item = Item;
    },

    update(Scene) {
      if (this.target && this.Item.body) {
        let distance = Phaser.Math.Distance.Between(this.Item.x, this.Item.y, this.target.x, this.target.y);

        if (this.Item.body.speed > 0) {
          this.moving = true;
          //  4 is our distance tolerance, i.e. how close the source can get to the target
          //  before it is considered as being there. The faster it moves, the more tolerance is required.
          if (distance < 6) {
            this.Item.body.reset(this.target.x, this.target.y);
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

        return true;
      }

      throw Error("Error while moving item " + this.item.name + " to: " + to + " ( tile " + to + " does not exist )");
    },

    glow() {
      const Item = this.Item;
      const Scene = this.Scene;
      const Between = Phaser.Math.Between;
      var postFxPlugin = Scene.plugins.get('rexglowfilterpipelineplugin');
      var pipeline = postFxPlugin.add(Item);

      if (this.glowing) {
        this.Glow = Item.scene.tweens.add({
          targets: pipeline,
          intensity: 0.02,
          ease: 'Linear',
          duration: Between(500, 1000),
          repeat: -1,
          yoyo: true
        });

      } else {
        // Remove postfx pipeline
        postFxPlugin.remove(Item);
        if (this.Glow) {
          this.Glow.stop();
          this.Glow = null;
        }
      }
    }
  }
}
</script>
