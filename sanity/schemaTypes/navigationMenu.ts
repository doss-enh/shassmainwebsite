import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'navigationMenu',
  title: 'Navigation Menu',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      options: {list: ['main', 'mega', 'footer']},
      validation: (r) => r.required(),
    }),
    defineField({name: 'items', title: 'Menu items', type: 'array', of: [{type: 'navItem'}]}),
  ],
  preview: {select: {title: 'title', subtitle: 'location'}},
})
