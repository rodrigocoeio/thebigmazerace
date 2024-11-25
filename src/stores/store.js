const state = {
  Phaser: false, // Phaser Instance
  Game: false, // Game Component
  components: [],

  difficulty_configs: {
    easy: {
      columns: 6,
      rows: 6,
      speed: 120,
      inteligence: 'smart',
      changeWayEveryNumberOfTiles: 5,
      items_count: 15,
      max_swirlings: 2,
      max_twisters: 2,
    },
    normal: {
      columns: 9,
      rows: 9,
      speed: 130,
      inteligence: 'smart',
      changeWayEveryNumberOfTiles: 7,
      items_count: 25,
      max_swirlings: 3,
      max_twisters: 3,
    },
    hard: {
      columns: 12,
      rows: 12,
      speed: 150,
      inteligence: 'smart',
      changeWayEveryNumberOfTiles: 10,
      items_count: 40,
      max_swirlings: 4,
      max_twisters: 4,
    },
  },

  configs: {
    // Game Configs
    width: window.innerWidth,
    height: window.innerHeight,
    columns: 12,
    rows: 8,
    difficulty: 'easy',
    speed: 120,
    items_count: 9,
    max_swirlings: 2,
    max_twisters: 2,
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
    dev: false,
    changeWayEveryNumberOfTiles: 5,

    players: [
      {
        number: 0,
        name: 'Rabbit',
        image: '/images/rabbit.png',
        inteligence: false,
        speed: false,
        selected: false,
      },
      {
        number: 0,
        name: 'Turtle',
        image: '/images/turtle.png',
        inteligence: false,
        speed: false,
        selected: false,
      },
      {
        number: 0,
        name: 'Cat',
        image: '/images/cat.png',
        inteligence: false,
        speed: false,
        selected: false,
      },
      {
        number: 0,
        name: 'Fox',
        image: '/images/fox.png',
        inteligence: false,
        speed: false,
        selected: false,
      },
      {
        number: 0,
        name: 'Dog',
        image: '/images/dog.png',
        inteligence: false,
        speed: false,
        selected: false,
      },
      {
        number: 0,
        name: 'Dinosaur',
        image: '/images/dinosaur.png',
        inteligence: false,
        speed: false,
        selected: false,
      },
      {
        number: 0,
        name: 'Unicorn',
        image: '/images/unicorn.png',
        inteligence: false,
        speed: false,
        selected: false,
      },
    ],
    items: [
      {
        type: 'speedup',
        image: '/images/speedup.png',
        limit: 6,
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
      {
        type: 'twister',
        image: '/images/twister.png',
        limit: 1,
        count: 0,
      },
      {
        type: 'chest',
        image: '/images/chest.png',
      },
    ],
  },
  started: false, //  Game Started
  stoped: false,
  finished: true,
  players: [], //  Players
  items: [], // Items
  tiles: [], //  Tiles
  voice: false,
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
