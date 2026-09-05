import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'excerpt', title: 'Excerpt', type: 'text'}),
    defineField({name: 'body', title: 'Body', type: 'array', of: [{type: 'block'}, {type: 'imageWithAlt'}]}),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime', initialValue: () => new Date().toISOString()}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'externalId', title: 'External ID', type: 'string', readOnly: true}),
  ],
  orderings: [{title: 'Newest first', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'publishedAt'}},
})
