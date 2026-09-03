import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {

  const currentAudio = ref(null)

  function register(audioEl) {
    currentAudio.value = audioEl
  }

  function fadeIn(audioEl, targetVolume = 0.8, duration = 1500) {
    if (!audioEl) return
    audioEl.volume = 0
    audioEl.play().catch(err => console.warn('播放被拦截:', err))

    const steps = 30
    const interval = duration / steps
    const step = targetVolume / steps
    let current = 0

    const timer = setInterval(() => {
      current += step
      if (current >= targetVolume) {
        audioEl.volume = targetVolume
        clearInterval(timer)
      } else {
        audioEl.volume = current
      }
    }, interval)
  }

  function fadeOut(audioEl, duration = 800) {
    return new Promise(resolve => {
      if (!audioEl || audioEl.paused) {
        resolve()
        return
      }
      const startVolume = audioEl.volume
      const steps = 20
      const interval = duration / steps
      const step = startVolume / steps
      let current = startVolume

      const timer = setInterval(() => {
        current -= step
        if (current <= 0) {
  

        audioEl.volume = 0
          audioEl.pause()
          clearInterval(timer)
          resolve()
        } else {
          audioEl.volume = current
        }
      }, interval)
    })
  }

  async function fadeOutCurrent(duration = 800) {
    if (currentAudio.value) {
      await fadeOut(currentAudio.value, duration)
    }
  }

  return {
    currentAudio,
    register,
    fadeIn,
    fadeOut,
    fadeOutCurrent
  }
})