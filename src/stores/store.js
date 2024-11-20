const state = {
  Phaser: false, // Phaser Instance
  Game: false, // Game Component
  components: [],
  configs: {
    // Game Configs
    width: 1000,
    height: 450,
    columns: 12,
    rows: 12,
    difficulty: 'easy',
    players: 0,
    menu: true,
    sound: true,
    voice: true,
    music: true,
  },
  started: false, //  Game Started
  finished: true,
  players: [], //  Players
  tiles: [], //  Tiles
  turn: {
    //  Turn
    turn: 1,
    started: false,
    moved: false,
    completed: false,
    rule: false,
    steps: false,
    player_number: false,
    player: false,
  },
  turns: [],
}

import getters from './getters'
import setters from './setters'

import { defineStore } from 'pinia'

const getStore = defineStore({
  id: 'game',
  state: () => state,
  getters: getters,
  actions: setters,
})

let store
export default function () {
  store = store ? store : getStore()
  return store
}
