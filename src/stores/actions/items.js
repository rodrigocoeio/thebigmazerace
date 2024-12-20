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
      let key_tile = this.getRandomTile()
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

      if (item.type == 'twister_golden') {
        let twister_golden_after_seconds = this.configs.twister_golden_after_seconds

        // For Key Mode cut the twister golden time in half
        if (this.configs.mode == 'key')
          twister_golden_after_seconds = twister_golden_after_seconds / 2

        return this.getTimeElapsed() >= twister_golden_after_seconds
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
