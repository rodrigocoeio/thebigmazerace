<template>
  <div class="ChoosePlayer" @click="openPlayers">
    <div class="Player" v-show="selected">
      <img :src="selected.image" height="50">
      {{ selected.name }}
      ↓
    </div>
  </div>

  <div class="ChoosePlayerBox" v-show="open" @click="closePlayers">
    <div class="Players">
      <div class="Placeholder">Choose a player</div>
      <div :class="['Player', player.selected ? 'Selected' : '']" :key="index" v-for="player, index in players"
        @click="select(player)">
        <img :src="player.image" height="50">
        {{ player.name }}
      </div>
    </div>
  </div>
</template>

<script>
import getStore from "$/store"
import $ from 'jquery'
import { playAudio } from "@/utils"

export default {
  props: ["number"],
  data() {
    let store = getStore()
    let playerNumber = this.number
    let selected = store.players_available.find(player => player.number == parseInt(playerNumber) && player.selected)

    return {
      selected: selected,
      open: false,
      players: store.players_available
    }
  },
  created() {
    if (!this.selected)
      this.selectFirst()
  },
  methods: {
    openPlayers() {
      this.open = true

      let ChoosePlayers = this
      setTimeout(function () {
        $(window).off("click").on("click", function () {
          ChoosePlayers.closePlayers()
          $(window).off("click")
        })
      })

    },
    closePlayers() {
      this.open = false
    },
    selectFirst() {
      let first = this.players.find(player => !player.selected)
      if (first) {
        first.selected = true
        first.number = parseInt(this.number)
        this.selected = first
      }

    },
    select(player) {
      if (player.selected)
        return false

      let playerNumber = parseInt(this.number)
      this.players.forEach(player => {
        if (player.number == playerNumber) {
          player.number = 0
          player.selected = false
        }
      })

      player.selected = true
      player.number = parseInt(this.number)
      this.selected = player

      playAudio("selected")
    }
  }
}
</script>

<style scoped>
.ChoosePlayer {
  display: block;
  padding: 20px;
  border: 3px solid black;
  border-radius: 15px;
  font-size: 24px;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: bold;
  margin: 0 auto;
  cursor: pointer;
}

.ChoosePlayer:hover {
  background-color: chartreuse;
  text-shadow: gray 3px 0 10px;
  box-shadow: 3px 3px gray;
}

.ChoosePlayerBox {
  position: absolute;
  top: 10px;
  display: block;
  overflow: hidden;
  border: 3px solid black;
  border-radius: 15px;
  background-color: white;
  font-size: 24px;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: bold;
  margin: 0 auto;
  cursor: pointer;
}

.ChoosePlayerBox:hover {
  background-color: chartreuse;
  text-shadow: gray 3px 0 10px;
  box-shadow: 3px 3px gray;
}

.ChoosePlayerBox .Placeholder {
  font-weight: normal;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 15px;
  padding-right: 15px;
}

.ChoosePlayerBox .Player {
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 15px;
  padding-right: 15px;
}

.ChoosePlayerBox .Player.Selected {
  opacity: 0.5;
  cursor: not-allowed
}

.ChoosePlayerBox .Player:hover:not(.Selected) {
  background-color: #1967d2
}
</style>
