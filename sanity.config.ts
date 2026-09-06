'use client'

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './sanity/schemaTypes'

// NEXT_PUBLIC_* values are inlined at build time, so a missing one here means
// the variable was absent from the build environment — not from the running
// server. Falling back to '' made Studio die inside minified vendor code with
// "Configuration must contain `projectId`", which says nothing about the cause.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId) {
  throw new Error(
    'NEXT_PUBLIC_SANITY_PROJECT_ID was not set when this build ran, so Studio cannot start. ' +
      'Add it to the deployment environment and rebuild — setting it at runtime is not enough, ' +
      'because NEXT_PUBLIC_* values are baked into the client bundle at build time.',
  )
}

export default defineConfig({
  basePath: '/studio',
  name: 'shass-console',
  title: 'Shass Console',
  projectId,
  dataset,
  schema: {types: schemaTypes},
  plugins: [structureTool(), visionTool()],
})
