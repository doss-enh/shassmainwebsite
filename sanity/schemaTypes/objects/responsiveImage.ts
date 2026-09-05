import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'responsiveImage',
  title: 'Responsive image',
  type: 'object',
  fields: [
    defineField({name: 'desktop', title: 'Desktop', type: 'imageWithAlt'}),
    defineField({name: 'mobile', title: 'Mobile', type: 'imageWithAlt'}),
  ],
})
