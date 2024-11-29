window.dd = (out) => {
  console.log(out)
}

window.log = (out) => {
  console.log(out)
}

window.sortByKey = (array, key, order = 'asc') => {
  return array.sort(function (a, b) {
    var x = a[key]
    var y = b[key]

    switch (order) {
      case 'asc':
        return x > y ? -1 : x < y ? 1 : 0
      case 'desc':
        return x < y ? -1 : x > y ? 1 : 0
    }

    return x < y ? -1 : x > y ? 1 : 0
  })
}

import getStore from '$/store.js'

window.playAudio = (audio_name, extension = 'mp3', type = 'sound') => {
  let store = getStore()
  let onEnded = function () {}
  let onError = function () {}
  let src = '/audios/' + audio_name + '.' + extension
  var audio = new Audio(src)

  if (type == 'voice') {
    if (store.voice) return false

    onEnded = function () {
      store.voice = false
    }
    onError = onEnded

    store.voice = audio
  }

  audio.play()
  audio.muted = !store.configs[type]
  audio.onended = onEnded
  audio.onerror = onError

  return audio
}
