export default {
  startGame() {
    console.log('Game Started!')
    this.started = true
    this.finished = false
    this.stopped = false
    this.voice = false

    let difficulty = this.configs.difficulty
    let configs = this.difficulty_configs[difficulty]
    this.configs = { ...this.configs, ...configs }

    console.log(difficulty)

    let audioNumber = Math.floor(Math.random() * 2) + 1
    playAudio('start_game' + audioNumber, 'mp3', 'voice')
    playAudio('selected')
  },
  quitGame() {
    this.started = false
    this.finished = false
    this.stopped = false
    if (this.voice) {
      this.voice.pause()
      this.voice = false
    }
  },

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

  generateItems() {
    this.items = []

    // Goal Chest Item
    let goal_tile = this.tiles.find((t) => t.goal)
    let chest = this.configs.items.find((i) => i.type == 'chest')
    this.items.push({ number: 1, tile: goal_tile.number, ...chest })
    goal_tile.item = chest

    // Generate Random Items
    let randomItemsCount = this.configs.items_count
    for (let i = 0; i < randomItemsCount; i++) {
      this.generateItem()
    }
  },

  generateItem() {
    let tile = this.getRandomTile()
    let item = this.getRandomItem()

    if (tile && item) {
      let itemNumber = Date.now() + Math.floor(Math.random() * 9999999)
      let newItem = { number: itemNumber, tile: tile.number, taken: false, ...item }

      this.items.push(newItem)
      tile.item = newItem
    }
  },

  getRandomItem() {
    let items = this.configs.items.filter((item) => {
      if (item.type == 'swirling') {
        let swirlings = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxSwirlings = this.configs.max_swirlings

        return swirlings.length < maxSwirlings
      }

      if (item.type == 'twister') {
        let twisters = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxTwisters = this.configs.max_twisters

        return twisters.length < maxTwisters
      }

      if (item.type == 'bomb') {
        let bombs = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxBombs = this.configs.max_bombs

        return bombs.length < maxBombs
      }
      return item.type != 'chest'
    })
    let random = Math.floor(Math.random() * items.length)

    return items[random]
  },

  getRandomTile(withItem, tiles) {
    tiles = tiles ? tiles : this.tiles
    tiles = tiles.filter((t) => !t.goal && t.number != 1)
    if (!withItem) tiles = tiles.filter((t) => !t.item)
    let random = Math.floor(Math.random() * tiles.length)

    let randomTile = tiles[random]

    if (!randomTile) {
      console.log('Could not get random tile ' + random)
      console.log(this.tiles)
      console.log(tiles)
    }

    return randomTile
  },

  generatePlayers() {
    let store = this

    this.configs.players.forEach((player) => {
      if (player.selected) {
        store.players.push({ avoidChest: false, ...player })
      }
    })
  },

  getRandomNotVisitedNeighbor(currentTile, tiles) {
    let neighbors = this.findNeighbors(currentTile, tiles)
    neighbors = neighbors.filter((n) => n.tile.visited === 0)
    let random = Math.floor(Math.random() * neighbors.length)
    let randomNeighbor = neighbors[random]

    return randomNeighbor
  },

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

  getPlayerNextRandomTile(currentTile, lastTile, tiles, inteligence) {
    inteligence = inteligence || this.configs.inteligence
    let neighbors = this.findOpenedNeighbors(currentTile, tiles)

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
}
