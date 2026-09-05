import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'productAttribute',
  title: 'Attribute',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required(), description: 'e.g. Color, GB, Size'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'showInFilters', title: 'Show in filters', type: 'boolean'}),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [{type: 'object', name: 'attributeValue', fields: [{name: 'label', type: 'string'}]}],
    }),
  ],
  preview: {
    select: {title: 'name', values: 'values'},
    prepare({title, values}) {
      return {title, subtitle: (values || []).map((v: {label?: string}) => v.label).join(', ')}
    },
  },
})
