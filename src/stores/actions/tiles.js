export default {
  generateTiles() {
    const tiles = []
    const configs = this.configs
    const mazeWidth = configs.width
    const mazeHeight = configs.height
    const rows = configs.rows
    const columns = configs.columns
    const tileWidth = mazeWidth / columns
    const tileHeight = mazeHeight / rows

    this.tiles = tiles

    let tileNumber = 1

    // Loop throught rows
    for (let r = 1; r <= rows; r++) {
      // Loop throught columns
      for (let c = 1; c <= columns; c++) {
        tiles.push({
          number: tileNumber,
          row: r,
          column: c,
          width: tileWidth,
          height: tileHeight,
          x: tileWidth * (c - 1),
          y: tileHeight * (r - 1),
          walls: {
            top: true,
            bottom: true,
            left: true,
            right: true,
          },
          visited: 0,
          goal: false,
          item: false,
        })

        tileNumber++
      }
    }

    this.tiles = tiles

    return tiles
  },

  getRandomTile(withItem, tiles) {
    tiles = tiles ? tiles : this.tiles
    tiles = tiles.filter((t) => !t.goal && t.number != 1)
    if (!withItem) tiles = tiles.filter((t) => !t.item || t.item.taken)
    let random = Math.floor(Math.random() * tiles.length)

    let randomTile = tiles[random]

    if (!randomTile) {
      console.log('Could not get random tile ' + random)
      console.log(this.tiles)
      console.log(tiles)
    }

    return randomTile
  },

  getTileNumber(number) {
    return this.tiles.find((tile) => tile.number == number)
  },
}
