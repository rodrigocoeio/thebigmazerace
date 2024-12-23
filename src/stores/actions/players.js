export default {
  // Generates Players
  generatePlayers() {
    let store = this

    this.configs.players.forEach((player) => {
      if (player.selected) {
        store.players.push({
          avoidChest: false,
          knowChest: false,
          hasKey: false,
          tile: false,
          ...player,
        })
      }
    })
  },

  // Get Player Next Random Tile
  getPlayerNextRandomTile(Player) {
    const currentTile = Player.currentTile
    const lastTile = Player.lastTile
    const tiles = Player.tiles
    let inteligence = Player.inteligence
    const avoidChest = Player.player.avoidChest

    inteligence = inteligence || this.configs.inteligence
    let neighbors = this.findOpenedNeighbors(currentTile, tiles)

    if (avoidChest) neighbors = neighbors.filter((n) => !n.tile.goal)

    // None or only one way available
    if (neighbors.length === 0) return false
    if (neighbors.length === 1) return neighbors[0]

    let nextTile = false
    switch (inteligence) {
      case 'dumbest':
        nextTile = this.getDumbestNextTile(currentTile, neighbors, lastTile, tiles)
        break
      case 'dumb':
        nextTile = this.getDumbNextTile(currentTile, neighbors, lastTile, tiles)
        break
      case 'normal':
        nextTile = this.getNormalNextTile(currentTile, neighbors, lastTile, tiles)
        break
      case 'smart':
        nextTile = this.getSmartNextTile(currentTile, neighbors, lastTile, tiles)
        break
      case 'kickass':
        nextTile = this.getKickAssNextTile(currentTile, neighbors, lastTile, tiles, Player)
        break
    }

    if (nextTile && currentTile.decisions) {
      currentTile.decisions[nextTile.position]++
    }

    return nextTile
  },

  filtersLastNeighborOut(neighbors, lastTile) {
    if (!lastTile) return neighbors

    return neighbors.filter((n) => {
      return n.tile.number != lastTile.number
    })
  },

  // Gets random neighbor even last one
  getDumbestNextTile(currentTile, neighbors) {
    let random = Math.floor(Math.random() * neighbors.length)
    let randomNeighbor = neighbors[random]

    return randomNeighbor
  },

  // Gets random neighbor avoinding last one
  getDumbNextTile(currentTile, neighbors, lastTile) {
    neighbors = this.filtersLastNeighborOut(neighbors, lastTile)
    return this.getDumbestNextTile(currentTile, neighbors, lastTile)
  },

  // Gets neighbor calculation proportion by visited number then sort randomly
  getNormalNextTile(currentTile, neighbors, lastTile) {
    let decisions = currentTile.decisions
      ? currentTile.decisions
      : {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }
    neighbors = this.filtersLastNeighborOut(neighbors, lastTile)

    // calcs % proportions to sort tiles
    // neighbors with visits gets proportion divided by the number of visits
    // the left proportion is added to the benefited tile, which is the one with less visits
    let proportion_tiles = 100 / neighbors.length
    let left_proportion = 0
    let benefited_tile = false

    // calc neighbors proportions of random sorting based on number of visits
    let visits_proportion_threshold = neighbors.length == 3 ? 33.33 : 50
    let total_visits = decisions.top + decisions.bottom + decisions.left + decisions.right

    neighbors.forEach((n) => {
      let position = n.position
      let decided_times = decisions[position]
      if (!benefited_tile || benefited_tile.tile.decisions[position] > decided_times)
        benefited_tile = n
      let visits_proportion = (decided_times * 100) / total_visits

      let give_away_proportion =
        visits_proportion && visits_proportion > visits_proportion_threshold
          ? (proportion_tiles * visits_proportion) / 100
          : 0

      n.proportion = proportion_tiles - give_away_proportion
      left_proportion = left_proportion + (proportion_tiles - n.proportion)
    })

    // add left_proportion to benefited_tile
    benefited_tile.proportion = benefited_tile.proportion + left_proportion

    // give neighbors sorting numbers
    let min = 0
    neighbors.forEach((n) => {
      let max = min + n.proportion
      n.sorting_numbers = {
        min,
        max,
      }
      min = max
    })

    let random_number = Math.random() * 100
    let randomNeighbor = neighbors.find((n) => {
      return random_number >= n.sorting_numbers.min && random_number <= n.sorting_numbers.max
    })

    return randomNeighbor
  },

  // Gets unvisited first or gets normal next tile
  getSmartNextTile(currentTile, neighbors, lastTile) {
    let unvisitedNeighbors = neighbors.filter((n) => n.tile.visited === 0)
    let unvisitedNeighbor = this.getDumbestNextTile(currentTile, unvisitedNeighbors)

    // Avoid last neighbor
    neighbors = this.filtersLastNeighborOut(neighbors, lastTile)

    // Get Special Items
    let specialItemNeighbor = this.getSpecialItemNeighbor(neighbors)
    if (specialItemNeighbor) return specialItemNeighbor

    return unvisitedNeighbor
      ? unvisitedNeighbor
      : this.getLeastDecidedNeighbor(currentTile, neighbors)
  },

  // Gets unvisited first or the least decided (chosen) neighbor
  // Avoids dead ends
  getKickAssNextTile(currentTile, neighbors, lastTile, tiles, Player) {
    // If player has the key and know where the goal is, go to it
    if (Player.hasKey && Player.knowGoal) return this.getNextRightNeighbor(currentTile, neighbors)

    // If adversary player has the key, chase it
    const adversaryPlayerWithKey = this.players.find((player) => player.hasKey)
    if (adversaryPlayerWithKey && adversaryPlayerWithKey.number != Player.number) {
      let adversaryTile = this.tiles.find(
        (tile) => tile.number == adversaryPlayerWithKey.tile.number,
      )
      return this.getNextAdversaryNeighbor(currentTile, adversaryTile, neighbors)
    }

    // Avoid last neighbor
    neighbors = this.filtersLastNeighborOut(neighbors, lastTile)

    // Avoid dead ends
    /* let findOpenedNeighbors = this.findOpenedNeighbors
    neighbors = neighbors.filter((n) => {
      let myNeighbors = findOpenedNeighbors(n.tile, tiles)

      // if goal or have items walk into it anyways
      if (myNeighbors.length === 1) {
        return n.tile.goal || n.tile.item
      }
      return true
    }) */

    // Get Special Items
    let specialItemNeighbor = this.getSpecialItemNeighbor(neighbors)
    if (specialItemNeighbor) {
      return specialItemNeighbor
    }

    // Try first going unvisited neighbors
    let unvisitedNeighbors = neighbors.filter((n) => n.tile.visited === 0)
    let unvisitedNeighbor = this.getDumbestNextTile(currentTile, unvisitedNeighbors)
    if (unvisitedNeighbor) {
      return unvisitedNeighbor
    }

    // Gets least decided direction neighbor
    let leastDecidedNeighbor = this.getLeastDecidedNeighbor(currentTile, neighbors)
    if (leastDecidedNeighbor) {
      return leastDecidedNeighbor
    }

    return this.getNormalNextTile(currentTile, neighbors, lastTile)
  },

  // Gets the least decided direction/neighbor
  getLeastDecidedNeighbor(currentTile, neighbors) {
    let leastDecidedNeighbor = false
    let decisions = currentTile.decisions ? currentTile.decisions : {}
    let times = 0

    neighbors.forEach((n) => {
      if (n.tile.visited === 0) {
        leastDecidedNeighbor = n
        return
      }

      let decided_times = decisions[n.position] ? decisions[n.position] : 0
      if (!leastDecidedNeighbor || n.tile.visited == 0 || decided_times < times) {
        leastDecidedNeighbor = n
        times = decided_times
      }
    })

    return leastDecidedNeighbor
  },

  getSpecialItemNeighbor(neighbors) {
    let specialItems = ['key', 'chest', 'twister_golden']
    return neighbors.find((neighbor) => {
      return !neighbor.tile.item.taken && specialItems.includes(neighbor.tile.item.type)
    })
  },

  getNextRightNeighbor(currentTile, neighbors) {
    const chestItem = this.items.find((item) => item.type == 'chest')
    const chestTile = this.tiles.find((tile) => tile.number == chestItem.tile)
    const path = this.findPath(currentTile.number, chestTile.number)
    const rightNeighbor = neighbors.find((neighbor) => neighbor.tile.number == path[1])

    return rightNeighbor
  },

  getNextAdversaryNeighbor(currentTile, adversaryTile, neighbors) {
    const path = this.findPath(currentTile.number, adversaryTile.number)
    const rightNeighbor = neighbors.find((neighbor) => neighbor.tile.number == path[1])

    return rightNeighbor
  },

  findPlayerChestPath(playerNumber) {
    const player = this.players[playerNumber - 1]

    const currentTile = this.tiles.find((tile) => player.tile.number === tile.number)
    const chestItem = this.items.find((item) => item.type == 'chest')
    const chestTile = this.tiles.find((tile) => tile.number == chestItem.tile)

    return this.findPath(currentTile.number, chestTile.number)
  },

  findPath(fromTileNumber, toTileNumber) {
    const mazeTiles = this.tiles.map((tile) => {
      return { ...tile, visited: false }
    })

    const startTile = mazeTiles.find((tile) => tile.number == fromTileNumber)
    const goalTile = mazeTiles.find((tile) => tile.number == toTileNumber)

    // Initialize an empty queue for BFS
    const queue = []
    queue.push(startTile)

    // Create a parent map to store the path
    const parent = {}
    parent[startTile.number] = null

    while (queue.length > 0) {
      const current = queue.shift()
      current.visited = true

      if (current.number === goalTile.number) {
        // Goal reached! Reconstruct the path
        const path = []
        let node = goalTile.number

        while (node) {
          path.unshift(node)
          node = parent[node]
        }
        return path
      }

      let neighbors = this.findOpenedNeighbors(current, mazeTiles)
      for (const neighbor of neighbors) {
        let neighborTile = neighbor.tile

        if (!neighborTile.visited) {
          parent[neighborTile.number] = current.number
          queue.push(neighborTile)
        }
      }
    }
  },

  findPathMaze(maze, start, goal) {
    // Initialize an empty queue for BFS
    const queue = []
    queue.push(start)

    // Create a visited set to keep track of visited nodes
    const visited = new Set()
    visited.add(start.toString())

    // Create a parent map to store the path
    const parent = {}
    parent[start.toString()] = null

    // Define directions to explore (up, down, left, right)
    const directions = [
      [-1, 0], // Up
      [1, 0], // Down
      [0, -1], // Left
      [0, 1], // Right
    ]

    while (queue.length > 0) {
      const current = queue.shift()

      if (current.x === goal.x && current.y === goal.y) {
        // Goal reached! Reconstruct the path
        const path = []
        let node = goal
        while (node) {
          path.unshift(node)
          node = parent[node.toString()]
        }
        return path
      }

      for (const [dx, dy] of directions) {
        const neighbor = { x: current.x + dx, y: current.y + dy }

        // Check if the neighbor is within the maze bounds and not a wall
        if (
          neighbor.x >= 0 &&
          neighbor.x < maze.length &&
          neighbor.y >= 0 &&
          neighbor.y < maze[0].length &&
          maze[neighbor.x][neighbor.y] !== 1
        ) {
          if (!visited.has(neighbor.toString())) {
            visited.add(neighbor.toString())
            parent[neighbor.toString()] = current
            queue.push(neighbor)
          }
        }
      }
    }

    // No path found
    return null
  },
}
