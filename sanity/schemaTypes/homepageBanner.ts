import {defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons'

export default defineType({
  name: 'homepageBanner',
  title: 'Homepage Banner',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'slide',
          fields: [
            {name: 'image', type: 'image', options: {hotspot: true}, validation: (r: any) => r.required()},
            {name: 'title', type: 'string'},
            {name: 'subtitle', type: 'string'},
            {name: 'ctaLabel', type: 'string'},
            {name: 'ctaLink', type: 'string'},
            {name: 'order', type: 'number'},
          ],
          preview: {select: {title: 'title', media: 'image'}},
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Homepage Banner'}
    },
  },
})
