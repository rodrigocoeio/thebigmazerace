import './assets/main.css'

import jQuery from 'jquery'
import Phaser from 'phaser'

import './scripts.js'
import './keyboard.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')

window.$ = jQuery
