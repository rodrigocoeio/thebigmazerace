export default {
  // Generates Players
  generatePlayers() {
    let store = this

    this.configs.players.forEach((player) => {
      if (player.selected) {
        store.players.push({
          Component: false,
          avoidChest: false,
          knowChest: false,
          hasKey: false,
          tile: false,
          nextTile: false,
          ...player,
        })
      }
    })
  },

  // Cheat Golden Twister
  getCheatGoldenTwister(player) {
    const item = this.configs.items.find((item) => item.type == 'twister_golden')

    if (player.nextTile.item) {
      if (['key', 'chest'].includes(player.nextTile.item.type)) {
        return false
      }

      player.nextTile.item.taken = true
      player.nextTile.item = false
    }

    this.newItem(item, player.nextTile)
  },

  // Get Player Next Random Tile
  getPlayerNextRandomTile(Player) {
    const currentTile = Player.currentTile
    const lastTile = Player.lastTile
    const tiles = Player.tiles
    let inteligence = Player.inteligence
    const avoidChest = this.configs.avoid_chest

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
    // Get Special Items
    let specialItemNeighbor = this.getSpecialItemNeighbor(neighbors)
    if (specialItemNeighbor) {
      return specialItemNeighbor
    }

    // Avoid last neighbor
    neighbors = this.filtersLastNeighborOut(neighbors, lastTile)

    // If player has the key and know where the goal is, go to it
    if (Player.hasKey && Player.knowGoal) {
      return this.getNextGoalNeighbor(currentTile, neighbors)
    }

    // If adversary player has the key, chase it
    const adversaryPlayerWithKey = this.players.find(
      (player) => player.hasKey && player.number != Player.number,
    )
    if (adversaryPlayerWithKey) {
      let adversaryTile = adversaryPlayerWithKey.nextTile ? adversaryPlayerWithKey.nextTile : false
      adversaryTile =
        !adversaryTile && adversaryPlayerWithKey.tile ? adversaryPlayerWithKey.tile : adversaryTile

      return this.getNextAdversaryNeighbor(currentTile, adversaryTile, neighbors)
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
    const findKey = this.getNeighborWithItemType(neighbors, 'key')
    if (findKey) {
      console.log('taking special item: key')
      return findKey
    }

    const findChest = this.getNeighborWithItemType(neighbors, 'chest')
    if (findChest) {
      console.log('taking special item: chest')
      return findChest
    }

    const findTwisterGolden = this.getNeighborWithItemType(neighbors, 'twister_golden')
    if (findTwisterGolden) {
      console.log('taking special item: twister golden')
      return findTwisterGolden
    }

    const findBomb = this.getNeighborWithItemType(neighbors, 'bomb')
    if (findBomb) {
      console.log('taking special item: bomb')
      return findBomb
    }
  },

  getNeighborWithItemType(neighbors, type) {
    const store = this
    return neighbors.find((neighbor) => {
      if (neighbor.tile.item) {
        const specialItem = store.items.filter(
          (item) => !item.taken && item.type == type && item.number == neighbor.tile.item.number,
        )
        return specialItem.length > 0
      }

      return false
    })
  },

  getNextGoalNeighbor(currentTile, neighbors) {
    const goalTile = this.tiles.find((tile) => tile.goal)
    const path = this.findPath(currentTile.number, goalTile.number)
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
}
