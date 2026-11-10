export type SoundscapePreset = 'campfire' | 'brown' | 'rain' | 'gamma'

let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let activeNodes: AudioNode[] = []
let crackleTimer: number | null = null

function getContext() {
  audioContext ??= new AudioContext()
  return audioContext
}

function stopNodes() {
  if (crackleTimer !== null) {
    window.clearInterval(crackleTimer)
    crackleTimer = null
  }
  for (const node of activeNodes) {
    try {
      if (node instanceof OscillatorNode) node.stop()
      node.disconnect()
    } catch {
      // Nodes can already be stopped when the preset changes.
    }
  }
  activeNodes = []
  masterGain?.disconnect()
  masterGain = null
}

function createNoiseBuffer(context: AudioContext, preset: SoundscapePreset) {
  const buffer = context.createBuffer(2, context.sampleRate * 2, context.sampleRate)
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel)
    let brown = 0
    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1
      if (preset === 'brown' || preset === 'campfire') {
        brown = (brown + 0.018 * white) / 1.018
        data[index] = brown * (preset === 'brown' ? 3.4 : 2.8)
      } else {
        data[index] = white * (preset === 'rain' ? 0.45 : 0.2)
      }
    }
  }
  return buffer
}

export async function startSoundscape(preset: SoundscapePreset, volume: number) {
  stopNodes()
  const context = getContext()
  await context.resume()

  masterGain = context.createGain()
  masterGain.gain.value = Math.max(0, Math.min(1, volume))
  masterGain.connect(context.destination)

  if (preset === 'gamma') {
    for (const [frequency, pan] of [[200, -0.75], [240, 0.75]] as const) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const panner = context.createStereoPanner()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.value = 0.06
      panner.pan.value = pan
      oscillator.connect(gain).connect(panner).connect(masterGain)
      oscillator.start()
      activeNodes.push(oscillator, gain, panner)
    }
    const pad = context.createOscillator()
    const padGain = context.createGain()
    pad.frequency.value = 110
    pad.type = 'sine'
    padGain.gain.value = 0.018
    pad.connect(padGain).connect(masterGain)
    pad.start()
    activeNodes.push(pad, padGain)
    return
  }

  const source = context.createBufferSource()
  source.buffer = createNoiseBuffer(context, preset)
  source.loop = true
  const filter = context.createBiquadFilter()
  filter.type = preset === 'rain' ? 'bandpass' : 'lowpass'
  filter.frequency.value = preset === 'rain' ? 1800 : preset === 'brown' ? 420 : 720
  filter.Q.value = preset === 'rain' ? 0.65 : 0.4
  const gain = context.createGain()
  gain.gain.value = preset === 'rain' ? 0.28 : 0.22
  source.connect(filter).connect(gain).connect(masterGain)
  source.start()
  activeNodes.push(source, filter, gain)

  if (preset === 'campfire') {
    crackleTimer = window.setInterval(() => {
      if (!audioContext || !masterGain || audioContext.state !== 'running') return
      const click = audioContext.createOscillator()
      const clickGain = audioContext.createGain()
      click.type = 'triangle'
      click.frequency.value = 900 + Math.random() * 1700
      clickGain.gain.setValueAtTime(0.018 + Math.random() * 0.025, audioContext.currentTime)
      clickGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.035)
      click.connect(clickGain).connect(masterGain)
      click.start()
      click.stop(audioContext.currentTime + 0.04)
      activeNodes.push(click, clickGain)
    }, 140 + Math.random() * 300)
  }
}

export function setSoundscapeVolume(volume: number) {
  if (masterGain) masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), getContext().currentTime, 0.08)
}

export function stopSoundscape() {
  stopNodes()
}
