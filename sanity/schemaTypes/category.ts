import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'image', title: 'Image', type: 'image'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({name: 'parent', title: 'Parent category', type: 'reference', to: [{type: 'category'}]}),
    defineField({name: 'order', title: 'Sort order', type: 'number', initialValue: 0}),
  ],
  preview: {
    select: {title: 'name', media: 'image', subtitle: 'parent.name'},
  },
})
