export const dd = (out) => {
  console.log(out)
}

export const log = (out) => {
  console.log(out)
}

export const sortByKey = (array, key, order = 'asc') => {
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

export const playAudio = (audio_name, extension = 'mp3', type = 'sound', onEndedCallBack) => {
  let store = getStore()
  let onEnded = function () {
    if (typeof onEndedCallBack === 'function') onEndedCallBack()
  }
  let onError = function () {}
  let src = '/audios/' + audio_name + '.' + extension
  var audio = new Audio(src)

  if (type == 'voice') {
    if (store.voice) return false

    onEnded = function () {
      store.voice = false
      if (typeof onEndedCallBack === 'function') onEndedCallBack()
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
