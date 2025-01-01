<template>
  <div class="GameItem">

  </div>
</template>

<script>
import objectMixins from "@/mixins/object-mixins.js";
import getStore from "$/store.js";
import Phaser from 'phaser'

export default {
  props: ['item', 'taken'],

  mixins: objectMixins,

  unmounted() {
    if (this.Item)
      this.Item.destroy()
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
      this.physics = Scene.physics;

      const store = getStore()
      const item = this.item
      const tile = store.tiles.find(t => t.number == item.tile)
      const item_x = tile.x + tile.width / 2
      const item_y = tile.y + tile.height / 2

      const Item = Scene.physics.add.sprite(item_x, item_y, this.item.type);
      Item.depth = 0.9

      // Scale Item
      const itemHeight = this.item.type === "chest" ? tile.height / 1.5 : tile.height / 2
      Item.displayHeight = itemHeight
      Item.scaleX = Item.scaleY;

      // Item Shadow
      if (store.configs.display.shadows)
        Item.preFX.addShadow(-10, -10, 0.006, 2, 0x333333, 10);

      this.Item = Item;
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
