export default {
  // Generates Maze
  generateMaze() {
    let changeCourseEveryNumberOfTiles = this.configs.changeWayEveryNumberOfTiles
    let tiles = this.tiles
    let currentTile = tiles[0]
    let stack = []
    let goalTile = false

    // Walk through tiles
    while (currentTile) {
      // Get random not visited neighbor
      let nextNeighbor = this.getRandomNotVisitedNeighbor(currentTile)

      // Set current tile to visited
      currentTile.visited++

      if (nextNeighbor && stack.length < changeCourseEveryNumberOfTiles) {
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
          if (tile.visited > 0) {
            let neighbors = this.findNeighbors(tile)
            neighbors = neighbors.filter((n) => n.tile.visited === 0)
            return neighbors.length > 0
          }

          return false
        })

        if (firstNotVisited) {
          currentTile = firstNotVisited
          continue
        }

        currentTile = false
        goalTile.goal = true
      }
    }

    this.tiles = tiles
  },

  // Get Random Not Visited Neighbor
  getRandomNotVisitedNeighbor(currentTile, tiles) {
    let neighbors = this.findNeighbors(currentTile, tiles)
    neighbors = neighbors.filter((n) => n.tile.visited === 0)
    let random = Math.floor(Math.random() * neighbors.length)
    let randomNeighbor = neighbors[random]

    return randomNeighbor
  },

  // Find Tile Neighbors
  findNeighbors(currentTile, tiles) {
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
    if (topNeighbor) neighbors.push({ position: 'top', tile: topNeighbor })
    if (bottomNeighbor) neighbors.push({ position: 'bottom', tile: bottomNeighbor })
    if (leftNeighbor) neighbors.push({ position: 'left', tile: leftNeighbor })
    if (rightNeighbor) neighbors.push({ position: 'right', tile: rightNeighbor })

    return neighbors
  },

  // Filters only opened walls neighbors
  findOpenedNeighbors(currentTile, tiles) {
    let neighbors = this.findNeighbors(currentTile, tiles)
    neighbors = neighbors.filter((n) => !currentTile.walls[n.position])
    return neighbors
  },

  // Filters only closed walls neighbors
  findClosedNeighbors(currentTile, tiles) {
    let neighbors = this.findNeighbors(currentTile, tiles)
    neighbors = neighbors.filter((n) => currentTile.walls[n.position])
    return neighbors
  },
}
