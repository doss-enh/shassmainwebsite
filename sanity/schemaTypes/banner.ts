import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'banner',
  title: 'Banner',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({name: 'image', title: 'Image', type: 'responsiveImage'}),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'object',
      fields: [
        {name: 'label', type: 'string'},
        {name: 'href', type: 'string'},
      ],
    }),
    defineField({
      name: 'placement',
      title: 'Placement',
      type: 'string',
      options: {list: ['homepage-hero', 'homepage-secondary', 'category-top']},
      validation: (r) => r.required(),
    }),
    defineField({name: 'theme', title: 'Theme', type: 'string', options: {list: ['light', 'dark']}}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'placement', media: 'image.desktop'},
  },
})
