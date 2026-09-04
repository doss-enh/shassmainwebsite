import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'attribute',
  title: 'Attribute',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required(), description: 'e.g. Color, Material, Print Method'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [{type: 'string'}],
      description: 'e.g. Red, Blue, Black',
    }),
  ],
  preview: {
    select: {title: 'name', values: 'values'},
    prepare({title, values}) {
      return {title, subtitle: values ? values.join(', ') : ''}
    },
  },
})
