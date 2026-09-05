import {defineType, defineField} from 'sanity'

export const navSubItem = defineType({
  name: 'navSubItem',
  title: 'Sub-item',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Label', type: 'string'}),
    defineField({name: 'category', title: 'Category', type: 'reference', to: [{type: 'category'}]}),
  ],
})

export const navItem = defineType({
  name: 'navItem',
  title: 'Menu item',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Label', type: 'string'}),
    defineField({name: 'linkType', title: 'Link type', type: 'string', options: {list: ['custom', 'category']}}),
    defineField({name: 'href', title: 'Custom link', type: 'string', hidden: ({parent}) => parent?.linkType !== 'custom'}),
    defineField({name: 'category', title: 'Category', type: 'reference', to: [{type: 'category'}], hidden: ({parent}) => parent?.linkType !== 'category'}),
    defineField({name: 'visible', title: 'Visible', type: 'boolean', initialValue: true}),
    defineField({name: 'children', title: 'Sub-items', type: 'array', of: [{type: 'navSubItem'}]}),
  ],
  preview: {
    select: {title: 'label', href: 'href'},
    prepare({title, href}) {
      return {title, subtitle: href}
    },
  },
})
