import {defineField, defineType} from 'sanity'

const menuItem = {
  type: 'object' as const,
  name: 'menuItem',
  fields: [
    {name: 'label', type: 'string', title: 'Label'},
    {name: 'link', type: 'string', title: 'Link'},
    {
      name: 'children',
      title: 'Sub-items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'menuSubItem',
          fields: [
            {name: 'label', type: 'string', title: 'Label'},
            {name: 'link', type: 'string', title: 'Link'},
          ],
        },
      ],
    },
  ],
  preview: {select: {title: 'label', subtitle: 'link'}},
}

export default defineType({
  name: 'menu',
  title: 'Menu',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      options: {list: ['header', 'footer']},
      validation: (r) => r.required(),
    }),
    defineField({name: 'items', title: 'Menu items', type: 'array', of: [menuItem]}),
  ],
  preview: {select: {title: 'title', subtitle: 'location'}},
})
