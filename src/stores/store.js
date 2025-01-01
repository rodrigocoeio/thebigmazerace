const state = {
  Phaser: false, // Phaser Instance
  Scene: false, // Phaser Scene Instance
  Game: false, // Game Component
  components: [],

  started: false, //  Game Started
  startTime: false,
  currentTime: false,
  paused: false,
  finished: false,
  finishedTime: false,
  winner: false,
  players: [], //  Players
  items: [], // Items
  tiles: [], //  Tiles
  voice: false,
  music: false,

  configs: {
    // Game Configs
    width: window.innerWidth,
    height: window.innerHeight,
    columns: 12,
    rows: 8,
    difficulty: 'easy',
    mode: 'key', // Chest Mode  / Key Mode
    speed: 300,
    distance_tolerance: 20,
    refresh_items_seconds: 1, // Refresh one item every x seconds
    start_items: 3,
    max_items: 9,
    max_speedups: 50,
    max_speeddowns: 3,
    max_swirls: 2,
    max_twisters: 2,
    max_twisters_golden: 2,
    max_bombs: 2,
    dizzy_seconds: 1,
    playersLastTouched: false,
    avoid_chest: false,

    pursuePlayerWithKey: true,
    knowGoal: true,

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
    music: false,
    dev: false,
    loop_matches: false,
    changeWayEveryNumberOfTiles: 5,
    instant_mode: false, // Instant movement, for testing purposes
    start_countdown: 4, // Start Players After x seconds
    twister_golden_after_seconds: 0, // Special Twister Appears after x seconds ( takes the player to the chest )   // For Key Mode cut the twister golden time in half
    twister_speed_multiplier: 2.5, // Twister speed multiplier
    key_recovery_time: 3, // time to recover the key fron adversary

    itemRefresher: false,

    display: {
      shadows: false,
      glows: false,
    },
  },

  difficulty_configs: {
    easy: {
      columns: 6,
      rows: 6,
      speed: 300,
      inteligence: 'kickass',
      changeWayEveryNumberOfTiles: 3,
      start_items: 5,
      max_items: 15,
      max_swirls: 3,
      max_twisters: 3,
      max_twisters_golden: 3,
      max_bombs: 5,
      twister_golden_after_seconds: 60, // Special Twister Appears after x seconds ( takes the player to the chest )
    },
    normal: {
      columns: 9,
      rows: 9,
      speed: 300,
      inteligence: 'kickass',
      changeWayEveryNumberOfTiles: 5,
      start_items: 5,
      max_items: 25,
      max_swirls: 5,
      max_twisters: 5,
      max_twisters_golden: 5,
      max_bombs: 10,
      twister_golden_after_seconds: 90, // Special Twister Appears after x seconds ( takes the player to the chest )
    },
    hard: {
      columns: 12,
      rows: 12,
      speed: 300,
      inteligence: 'kickass',
      changeWayEveryNumberOfTiles: 7,
      start_items: 10,
      max_items: 40,
      max_swirls: 7,
      max_twisters: 7,
      max_twisters_golden: 7,
      max_bombs: 15,
      twister_golden_after_seconds: 120, // Special Twister Appears after x seconds ( takes the player to the chest )
    },
  },

  players_available: [
    {
      number: 0,
      name: 'Rabbit',
      image: '/images/rabbit.png',
      image_big: '/images/rabbit_big.png',
      inteligence: false,
      speed: false,
      selected: false,
    },
    {
      number: 0,
      name: 'Turtle',
      image: '/images/turtle.png',
      image_big: '/images/turtle_big.png',
      inteligence: false,
      speed: false,
      selected: false,
    },
    {
      number: 0,
      name: 'Cat',
      image: '/images/cat.png',
      image_big: '/images/cat_big.png',
      inteligence: false,
      speed: false,
      selected: false,
    },
    {
      number: 0,
      name: 'Fox',
      image: '/images/fox.png',
      image_big: '/images/fox_big.png',
      inteligence: false,
      speed: false,
      selected: false,
    },
    {
      number: 0,
      name: 'Dog',
      image: '/images/dog.png',
      image_big: '/images/dog_big.png',
      inteligence: false,
      speed: false,
      selected: false,
    },
    {
      number: 0,
      name: 'Dinosaur',
      image: '/images/dinosaur.png',
      image_big: '/images/dinosaur_big.png',
      inteligence: false,
      speed: false,
      selected: false,
    },
    {
      number: 0,
      name: 'Unicorn',
      image: '/images/unicorn.png',
      image_big: '/images/unicorn_big.png',
      inteligence: false,
      speed: false,
      selected: false,
    },
  ],
  items_available: [
    {
      type: 'speedup',
      image: '/images/speedup.png',
      limit: 6,
      count: 0,
    },
    {
      type: 'speeddown',
      image: '/images/speeddown.png',
      limit: 1,
      count: 0,
    },
    {
      type: 'swirl',
      image: '/images/swirl.png',
      limit: 2,
      count: 0,
    },
    {
      type: 'twister',
      image: '/images/twister.png',
      limit: 2,
      count: 0,
    },
    {
      type: 'twister_golden',
      image: '/images/twister_golden.png',
      limit: 1,
      count: 0,
    },
    {
      type: 'bomb',
      image: '/images/bomb.png',
      limit: 1,
      count: 0,
    },
    {
      type: 'key',
      image: '/images/key.png',
    },
    {
      type: 'chest',
      image: '/images/chest.png',
    },
  ],
}

import getters from './getters'
import actions from './actions'

import { defineStore } from 'pinia'

const getStore = defineStore({
  id: 'game',
  state: () => state,
  getters: getters,
  actions: actions,
})

let store
export default function () {
  store = store ? store : getStore()
  return store
}
