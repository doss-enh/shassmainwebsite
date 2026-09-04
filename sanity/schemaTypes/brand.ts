import {defineField, defineType} from 'sanity'
import {TrendUpwardIcon} from '@sanity/icons'

export default defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  icon: TrendUpwardIcon,
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'logo', title: 'Logo', type: 'image'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
  ],
  preview: {
    select: {title: 'name', media: 'logo'},
  },
})
