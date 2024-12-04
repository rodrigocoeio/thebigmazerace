export default {
  // Generates Players
  generatePlayers() {
    let store = this

    this.configs.players.forEach((player) => {
      if (player.selected) {
        store.players.push({ avoidChest: false, ...player })
      }
    })
  },

  // Get Player Next Random Tile
  getPlayerNextRandomTile(currentTile, lastTile, tiles, inteligence, avoidChest) {
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
        nextTile = this.getKickAssNextTile(currentTile, neighbors, lastTile, tiles)
        break
    }

    if (nextTile && currentTile.decisions) {
      //console.log(nextTile.position)
      //console.log(currentTile.decisions[nextTile.position])
      //console.log(currentTile)
      currentTile.decisions[nextTile.position]++
    }

    //if (lastTile) console.log('last ' + lastTile.number)
    //console.log('current ' + currentTile.number)
    //if (randomNeighbor) console.log('next ' + randomNeighbor.tile.number)

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
  getKickAssNextTile(currentTile, neighbors, lastTile, tiles) {
    // Avoid last neighbor
    neighbors = this.filtersLastNeighborOut(neighbors, lastTile)

    // Avoid dead ends
    let findOpenedNeighbors = this.findOpenedNeighbors
    neighbors = neighbors.filter((n) => {
      let myNeighbors = findOpenedNeighbors(n.tile, tiles)

      // if goal or have items walk into it anyways
      if (myNeighbors.length === 1) {
        return n.tile.goal || n.tile.item
      }
      return true
    })

    // Get Special Items
    let specialItemNeighbor = this.getSpecialItemNeighbor(neighbors)
    if (specialItemNeighbor) return specialItemNeighbor

    // Try first going unvisited neighbors
    let unvisitedNeighbors = neighbors.filter((n) => n.tile.visited === 0)
    let unvisitedNeighbor = this.getDumbestNextTile(currentTile, unvisitedNeighbors)
    if (unvisitedNeighbor) return unvisitedNeighbor

    // Gets least decided direction neighbor
    return this.getLeastDecidedNeighbor(currentTile, neighbors)
  },

  // Gets the least decided direction/neighbor
  getLeastDecidedNeighbor(currentTile, neighbors) {
    let leastDecidedNeighbor = false
    let decisions = currentTile.decisions ? currentTile.decisions : {}
    let times = 0

    neighbors.forEach((n) => {
      let decided_times = decisions[n.position] ? decisions[n.position] : 0
      if (!leastDecidedNeighbor || n.tile.visited == 0 || decided_times < times) {
        leastDecidedNeighbor = n
        times = decided_times
      }
    })

    return leastDecidedNeighbor
  },

  getSpecialItemNeighbor(neighbors) {
    let specialItems = ['key', 'chest', 'twister_golden', 'speedup']
    return neighbors.find((neighbor) => {
      return specialItems.includes(neighbor.tile.item.type)
    })
  },
}
