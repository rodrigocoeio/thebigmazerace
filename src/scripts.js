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
  var audio = new Audio('/audio/' + audio_name + '.' + extension)
  audio.play()
  audio.muted = !store.configs[type]
  return audio
}
