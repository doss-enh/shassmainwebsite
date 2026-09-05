import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'image', title: 'Image', type: 'imageWithAlt'}),
    defineField({name: 'parent', title: 'Parent category', type: 'reference', to: [{type: 'category'}]}),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number'}),
    defineField({name: 'externalId', title: 'External ID', type: 'string', readOnly: true, description: 'Import reference — do not edit'}),
  ],
  preview: {
    select: {title: 'name', media: 'image', subtitle: 'parent.name'},
  },
})
