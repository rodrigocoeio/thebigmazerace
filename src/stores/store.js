const state = {
  Phaser: false, // Phaser Instance
  Game: false, // Game Component
  components: [],
  configs: {
    // Game Configs
    width: window.innerWidth,
    height: window.innerHeight - 22,
    columns: 12,
    rows: 8,
    difficulty: 'easy',
    speed: 150,

    // Inteligences
    // dumbest: Players doesn't remember where they came from, so they will randomly choose a next way
    // dumb: Players doesn't remember where they came from, so they will randomly choose a next way
    // normal: Players won't go back and remember their past decisions so the visits they made to the neighbors and choose randomly proportionaly to the number of visits
    // smart: Players won't go back and prefer unvisited neighbors first if none unvisited go to the least decision taken
    // kickass: Players won't go back and prefer unvisited neighbors first if none unvisited go to the least decision taken, avoiding dead ends
    inteligence: 'smart',
    showTileNumbers: false,
    menu: true,
    sound: true,
    voice: true,
    music: true,
    changeWayEveryNumberOfTiles: 5,

    players: [
      {
        number: 0,
        name: 'Rabbit',
        image: '/images/rabbit.png',
        inteligence: false,
        speed: false,
      },
      {
        number: 0,
        name: 'Turtle',
        image: '/images/turtle.png',
        inteligence: false,
        speed: false,
      },
    ],
    items: [
      {
        type: 'speedup',
        image: '/images/speedup.png',
        limit: 10,
        count: 0,
      },
      {
        type: 'speeddown',
        image: '/images/speeddown.png',
        limit: 3,
        count: 0,
      },
      {
        type: 'swirling',
        image: '/images/swirling.png',
        limit: 3,
        count: 0,
      },
      /* {
        type: 'twister',
        image: '/images/twister.png',
        limit: 1,
        count: 0,
      }, */
      {
        type: 'chest',
        image: '/images/chest.png',
      },
    ],
  },
  started: false, //  Game Started
  finished: true,
  players: [], //  Players
  items: [], // Items
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
