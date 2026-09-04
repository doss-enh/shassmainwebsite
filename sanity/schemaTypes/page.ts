import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'body', title: 'Body', type: 'array', of: [{type: 'block'}, {type: 'image'}]}),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string'}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text'}),
    defineField({name: 'published', title: 'Published', type: 'boolean', initialValue: true}),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
