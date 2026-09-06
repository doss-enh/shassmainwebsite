import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'layout', title: 'Layout', type: 'string', options: {list: ['richText']}, initialValue: 'richText'}),
    defineField({name: 'body', title: 'Body', type: 'array', of: [{type: 'block'}, {type: 'imageWithAlt'}]}),
    defineField({
      name: 'gallery',
      title: 'Image gallery',
      type: 'array',
      of: [{type: 'imageWithAlt'}],
      description: 'Rendered as a grid beneath the body — the Clients page uses this for customer logos.',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'externalId', title: 'External ID', type: 'string', readOnly: true}),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
