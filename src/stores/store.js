const state = {
  Phaser: false, // Phaser Instance
  Game: false, // Game Component
  components: [],
  configs: {
    // Game Configs
    width: window.innerWidth,
    height: window.innerHeight - 27,
    columns: 15,
    rows: 10,
    difficulty: 'easy',
    speed: 150,

    // Inteligences
    // dumb: Players doesn't remember where they came from, so they will randomly choose a next way
    // normal: Players remember where they came from and won't go back
    // smart: Players remember where they came from, and counts the visits they made to the neighbors and choose randomly proportionaly to the number of visits
    // kickass: Players remember where they came from, and always choose least visited tiles first or tile with item
    inteligence: 'smart',

    players: 0,
    menu: true,
    sound: true,
    voice: true,
    music: true,
    changeWayEveryNumberOfTiles: 5,
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
