import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '51j44o52',
    dataset: 'production',
  },
  // Pinned so `sanity deploy` never prompts and always lands on the same URL.
  studioHost: 'shass-gift',
  deployment: {
    appId: 'gptggsc0nf2gswtlu8offmoz',
  },
})
