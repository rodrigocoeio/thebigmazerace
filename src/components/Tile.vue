<template>
  <div class="GameTile">
    <!-- Number : {{ number }} {{ x }} {{ y }} {{ image }}-->
  </div>
</template>

<script>
import getStore from "$/store.js";
import objectMixins from "@/mixins/object-mixins.js";
let store;

export default {
  props: ['number', 'x', 'y', 'width', 'height', 'image', 'rule', 'walls', 'goal'],

  data() {
    return {
      Phaser: false,
      backgroundImage: false,
      topWall: false,
      bottomWall: false,
      leftWall: false,
      rightWall: false
    }
  },

  mixins: objectMixins,

  mounted() {
    store = getStore();
  },

  beforeUnmount() {
    if (this.backgroundImage)
      this.backgroundImage.destroy();
    if (this.topWall)
      this.topWall.destroy();
    if (this.bottomWall)
      this.bottomWall.destroy();
    if (this.leftWall)
      this.leftWall.destroy();
    if (this.rightWall)
      this.rightWall.destroy();
    if (this.numberCircle)
      this.numberCircle.destroy();
    if (this.numberText)
      this.numberText.destroy();
    if (this.goalImage)
      this.goalImage.destroy();
  },

  methods: {
    preload(Phaser) {
      if (this.image) {
        Phaser.load.image('tile-background-' + this.number, this.image);
      }
      if (this.goal) {
        Phaser.load.image('tile-goal', '/images/chest_closed.png');
      }
    },
    create(Phaser) {
      this.Phaser = Phaser;

      // background image
      if (this.image) {
        this.backgroundImage = Phaser.add.image(this.x + (this.width / 2) + 10, this.y + (this.height / 2), 'tile-background-' + this.number);
      }

      if (this.goal) {
        this.goalImage = Phaser.add.image(this.x + (this.width / 2), this.y + (this.height / 2), 'tile-goal');
        this.goalImage.setScale(0.2);
      }

      this.buildWalls(Phaser);
      //this.buildTileNumber(Phaser);
    },

    buildWalls(Phaser) {
      let columnWallHeight = this.height / 10;

      // Top Wall
      if (this.walls.top) {
        this.topWall = Phaser.add.image(this.x + (this.width / 2), this.y + (columnWallHeight / 2), 'tile-row');
        this.topWall.displayWidth = this.width;
        this.topWall.displayHeight = columnWallHeight;
      } else if (this.topWall) {
        this.topWall.destroy();
      }

      // Bottom Wall
      if (this.walls.bottom) {
        this.bottomWall = Phaser.add.image(this.x + (this.width / 2), this.y + this.height - (columnWallHeight / 2), 'tile-row');
        this.bottomWall.displayWidth = this.width;
        this.bottomWall.displayHeight = columnWallHeight;
      } else if (this.bottomWall) {
        this.bottomWall.destroy();
      }

      // Left Wall
      if (this.walls.left) {
        this.leftWall = Phaser.add.image(this.x + parseInt(columnWallHeight / 2), this.y + (this.height / 2), 'tile-column');
        this.leftWall.displayWidth = columnWallHeight;
        this.leftWall.displayHeight = this.height;
      } else if (this.leftWall) {
        this.leftWall.destroy();
      }

      // Right Wall
      if (this.walls.right) {
        this.rightWall = Phaser.add.image(this.x + this.width - (columnWallHeight / 2), this.y + (this.height / 2), 'tile-column');
        this.rightWall.displayWidth = columnWallHeight;
        this.rightWall.displayHeight = this.height;
      } else if (this.rightWall) {
        this.rightWall.destroy();
      }
    },

    buildTileNumber(Phaser) {
      this.numberCircle = Phaser.add.circle(this.x + 20 - 3, this.y + 20 - 3, 15, 0xffffff);
      this.numberCircle.setStrokeStyle(2, 0x000000);

      const numberTextX = this.number <= 9 ? 14 : 10;
      this.numberText = Phaser.add.text(this.x + numberTextX - 3, this.y + 10 - 3, this.number, { font: "600 20px Poppins", color: "black" });
      this.numberText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
  }
}
</script>
