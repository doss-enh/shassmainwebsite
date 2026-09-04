import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'catalogue',
  title: 'Catalogue',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'coverImage', title: 'Cover image', type: 'image'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({name: 'file', title: 'PDF file', type: 'file', options: {accept: '.pdf'}}),
    defineField({name: 'category', title: 'Category', type: 'reference', to: [{type: 'category'}]}),
    defineField({name: 'published', title: 'Published', type: 'boolean', initialValue: true}),
  ],
  preview: {select: {title: 'title', media: 'coverImage'}},
})
