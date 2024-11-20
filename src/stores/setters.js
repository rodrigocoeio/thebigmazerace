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
          visited: false,
          goal: false,
        })

        tileNumber++
      }
    }

    this.tiles = tiles

    return tiles
  },

  generateMaze() {
    let tiles = this.tiles
    let currentTile = tiles[0]
    let stack = []
    let goalTile = false

    // Walk through tiles
    while (currentTile) {
      // Get random neighbor
      let nextNeighbor = this.getRandomNeighbor(currentTile)

      // Set current tile to visited
      currentTile.visited = true

      if (nextNeighbor && stack.length < 10) {
        // Remove current and neighbor walls
        switch (nextNeighbor.position) {
          case 'top':
            currentTile.walls.top = false
            nextNeighbor.tile.walls.bottom = false
            break
          case 'bottom':
            currentTile.walls.bottom = false
            nextNeighbor.tile.walls.top = false
            break
          case 'left':
            currentTile.walls.left = false
            nextNeighbor.tile.walls.right = false
            break
          case 'right':
            currentTile.walls.right = false
            nextNeighbor.tile.walls.left = false
            break
        }

        //console.log(nextNeighbor)
        stack.push(currentTile)
        currentTile = nextNeighbor.tile
        goalTile = currentTile
      } else if (stack.length > 0) {
        //console.log('stack')
        currentTile = stack.pop()
      } else {
        let firstNotVisited = tiles.find((tile) => {
          if (tile.visited) {
            let neighbors = this.findNeighbors(tile)
            console.log(neighbors)
            return neighbors.length > 0
          }

          return false
        })

        if (firstNotVisited) {
          currentTile = firstNotVisited
          continue
        }

        //console.log('ended')
        goalTile.goal = true
        currentTile = false
      }
    }

    this.tiles = tiles
  },

  getRandomNeighbor(currentTile, tiles, openWalls) {
    let neighbors = this.findNeighbors(currentTile, tiles, openWalls)
    let random = Math.floor(Math.random() * neighbors.length)
    let randomNeighbor = neighbors[random]

    return randomNeighbor
  },
  findNeighbors(currentTile, tiles, openWalls) {
    let mazeColumns = this.configs.columns
    tiles = tiles ? tiles : this.tiles

    // Calc neighbors numbers
    let topNeighborNumber = currentTile.number - mazeColumns
    let bottomNeighborNumber = currentTile.number + mazeColumns
    let leftNeighborNumber = currentTile.number - 1
    let rightNeighborNumber = currentTile.number + 1

    // Find neighbors
    let topNeighbor = tiles.find((tile) => {
      return tile.number === topNeighborNumber
    })
    let bottomNeighbor = tiles.find((tile) => {
      return tile.number === bottomNeighborNumber
    })
    let leftNeighbor = tiles.find((tile) => {
      // checks if the left neighbor its on the same row
      return tile.number === leftNeighborNumber && currentTile.row === tile.row
    })
    let rightNeighbor = tiles.find((tile) => {
      // checks if the left neighbor its on the same row
      return tile.number === rightNeighborNumber && currentTile.row === tile.row
    })

    // Generate neighbors array
    let neighbors = []
    if (
      (!openWalls || (openWalls && !currentTile.walls.top)) &&
      topNeighbor &&
      !topNeighbor.visited
    )
      neighbors.push({ position: 'top', tile: topNeighbor })
    if (
      (!openWalls || (openWalls && !currentTile.walls.bottom)) &&
      bottomNeighbor &&
      !bottomNeighbor.visited
    )
      neighbors.push({ position: 'bottom', tile: bottomNeighbor })
    if (
      (!openWalls || (openWalls && !currentTile.walls.left)) &&
      leftNeighbor &&
      !leftNeighbor.visited
    )
      neighbors.push({ position: 'left', tile: leftNeighbor })
    if (
      (!openWalls || (openWalls && !currentTile.walls.right)) &&
      rightNeighbor &&
      !rightNeighbor.visited
    )
      neighbors.push({ position: 'right', tile: rightNeighbor })

    return neighbors
  },
}
