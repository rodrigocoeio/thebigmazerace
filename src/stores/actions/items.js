export default {
  generateItems() {
    this.items = []

    // Goal Chest Item
    let goal_tile = this.tiles.find((t) => t.goal)
    let chest = this.configs.items.find((i) => i.type == 'chest')
    this.items.push({ number: 1, tile: goal_tile.number, ...chest })
    goal_tile.item = chest

    // Key Item
    if (this.configs.mode === 'key') {
      let key_tile = this.getRandomTile() //this.getTileNumber(2)
      let key = this.configs.items.find((i) => i.type == 'key')
      this.items.push({ number: 2, tile: key_tile.number, ...key })
      key_tile.item = key
    }

    // Generate Random Items
    let randomItemsCount = this.configs.items_count
    for (let i = 0; i < randomItemsCount; i++) {
      this.generateItem()
    }
  },

  generateItem() {
    let tile = this.getRandomTile()
    let item = this.getRandomItem()

    this.newItem(item, tile)
  },

  newItem(item, tile) {
    if (tile && item) {
      if (tile.item) {
        const item = this.items.find((i) => i.number === tile.item.number)
        item.taken = true
        tile.item.taken = true
      }

      let itemNumber = Date.now() + Math.floor(Math.random() * 9999999)
      let newItem = { number: itemNumber, tile: tile.number, taken: false, ...item }

      this.items.push(newItem)
      tile.item = newItem
    }
  },

  getRandomItem() {
    let items = this.configs.items.filter((item) => {
      if (item.type == 'speedup') {
        let speedups = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxSpeedups = this.configs.max_speedups

        return speedups.length < maxSpeedups
      }

      if (item.type == 'speeddown') {
        let speeddowns = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxSpeeddowns = this.configs.max_speeddowns

        return speeddowns.length < maxSpeeddowns
      }

      if (item.type == 'swirl') {
        let swirlings = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxSwirls = this.configs.max_swirls

        return swirlings.length < maxSwirls
      }

      if (item.type == 'twister') {
        let twisters = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxTwisters = this.configs.max_twisters

        return twisters.length < maxTwisters
      }

      if (item.type == 'twister_golden') {
        let twister_golden_after_seconds = this.configs.twister_golden_after_seconds
        let twisters_golden = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxTwistersGolden = this.configs.max_twisters_golden

        return (
          twisters_golden.length < maxTwistersGolden &&
          this.getTimeElapsed() >= twister_golden_after_seconds
        )
      }

      if (item.type == 'bomb') {
        let bombs = this.items.filter((i) => i.type == item.type && !i.taken)
        let maxBombs = this.configs.max_bombs

        return bombs.length < maxBombs
      }

      return item.type != 'chest' && item.type != 'key'
    })
    let random = Math.floor(Math.random() * items.length)

    return items[random]
  },
}
