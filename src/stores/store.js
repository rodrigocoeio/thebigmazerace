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
    speed: 100,

    // Inteligences
    // dumbest: Players doesn't remember where they came from, so they will randomly choose a next way
    // dumb: Players doesn't remember where they came from, so they will randomly choose a next way
    // normal: Players won't go back and remember their past decisions so the visits they made to the neighbors and choose randomly proportionaly to the number of visits
    // smart: Players won't go back and prefer unvisited neighbors first if none unvisited go to the least decision taken
    // kickass: Players won't go back and prefer unvisited neighbors first if none unvisited go to the least decision taken, avoiding dead ends
    inteligence: 'normal',
    showTileNumbers: false,

    players: 0,
    menu: true,
    sound: true,
    voice: true,
    music: true,
    changeWayEveryNumberOfTiles: 5,
  },
  started: false, //  Game Started
  finished: true,
  players: [
    {
      name: 'Rabbit',
      image: '/images/rabbit.png',
      welcome: {
        position: { x: 200, y: 450 },
      },
      inteligence: false,
      position: { x: 20, y: 22 },
      scale: 0.8,
    },
    {
      name: 'Turtle',
      image: '/images/turtle.png',
      welcome: {
        position: { x: 200, y: 450 },
      },
      inteligence: false,
      position: { x: 50, y: 27 },
      scale: 0.6,
    },
  ], //  Players
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
