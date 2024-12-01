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
      Scene: false,
      backgroundImage: false,
      topWall: false,
      bottomWall: false,
      leftWall: false,
      rightWall: false,
      shadowDistance: 5,
    }
  },

  watch: {
    "walls.top": function (open) {
      if (!open) this.topWall.destroy();
    },
    "walls.bottom": function (open) {
      if (!open) this.bottomWall.destroy();
    },
    "walls.left": function (open) {
      if (!open) this.leftWall.destroy();
    },
    "walls.right": function (open) {
      if (!open) this.rightWall.destroy();
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
    preload(Scene) {
      if (this.image) {
        Scene.load.image('tile-background-' + this.number, this.image);
      }
      if (this.goal) {
        Scene.load.image('tile-goal', '/images/chest_closed.png');
      }
    },
    create(Scene) {
      this.Scene = Scene;

      // background image
      if (this.image) {
        this.backgroundImage = Scene.add.image(this.x + (this.width / 2) + 10, this.y + (this.height / 2), 'tile-background-' + this.number);
      }

      //if (this.goal) {
      //  this.goalImage = Scene.add.image(this.x + (this.width / 2), this.y + (this.height / 2), 'tile-goal');
      //  this.goalImage.setScale(0.2);
      // }

      this.buildWalls(Scene);
      if (store.configs.showTileNumbers) this.buildTileNumber(Scene);
    },

    buildWalls(Scene) {
      let columnWallHeight = this.height / 6;

      // Top Wall
      if (this.walls.top) {
        let topX = this.x + (this.width / 2)
        let topY = this.y + (columnWallHeight / 2)

        this.topWall = Scene.add.image(topX, topY, 'tile-row');
        //this.topWall.preFX.addShadow(-10, -10, 0.006, 2, 0x333333, 10);

        this.topWall.displayWidth = this.width + (columnWallHeight);
        this.topWall.displayHeight = columnWallHeight;
      } else if (this.topWall) {
        this.topWall.destroy();
      }

      // Bottom Wall
      if (this.walls.bottom) {
        let bottomX = this.x + (this.width / 2)
        let bottomY = this.y + this.height - (columnWallHeight / 2)
        this.bottomWall = Scene.add.image(bottomX, bottomY, 'tile-row');
        //this.bottomWall.preFX.addShadow(-10, -10, 0.006, 2, 0x333333, 10);

        this.bottomWall.displayWidth = this.width + (columnWallHeight)
        this.bottomWall.displayHeight = columnWallHeight;
      } else if (this.bottomWall) {
        this.bottomWall.destroy();
      }

      // Left Wall
      if (this.walls.left) {
        let leftX = this.x + parseInt(columnWallHeight / 2)
        let leftY = this.y + (this.height / 2)
        this.leftWall = Scene.add.image(leftX, leftY, 'tile-column');
        this.leftWall.displayWidth = columnWallHeight;
        this.leftWall.displayHeight = this.height + (columnWallHeight)
      } else if (this.leftWall) {
        this.leftWall.destroy();
      }

      // Right Wall
      if (this.walls.right) {
        let rightX = this.x + this.width - (columnWallHeight / 2)
        let rightY = this.y + (this.height / 2)
        this.rightWall = Scene.add.image(rightX, rightY, 'tile-column');
        this.rightWall.displayWidth = columnWallHeight;
        this.rightWall.displayHeight = this.height + (columnWallHeight)
      } else if (this.rightWall) {
        this.rightWall.destroy();
      }
    },

    buildTileNumber(Scene) {
      this.numberCircle = Scene.add.circle(this.x + 20 - 3, this.y + 20 - 3, 15, 0xffffff);
      this.numberCircle.setStrokeStyle(2, 0x000000);

      const numberTextX = this.number <= 9 ? 14 : 10;
      this.numberText = Scene.add.text(this.x + numberTextX - 3, this.y + 10 - 3, this.number, { font: "600 20px Poppins", color: "black" });
      this.numberText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
  }
}
</script>
