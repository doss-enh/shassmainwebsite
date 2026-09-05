import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'SEO title', type: 'string'}),
    defineField({name: 'description', title: 'SEO description', type: 'text'}),
    defineField({name: 'robotsIndex', title: 'Allow indexing', type: 'boolean', initialValue: true}),
    defineField({name: 'robotsFollow', title: 'Allow following links', type: 'boolean', initialValue: true}),
  ],
})
