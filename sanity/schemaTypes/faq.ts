import {defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons'

export default defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'question', title: 'Question', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'answer', title: 'Answer', type: 'text', validation: (r) => r.required()}),
    defineField({name: 'category', title: 'Category', type: 'string'}),
    defineField({name: 'order', title: 'Sort order', type: 'number', initialValue: 0}),
  ],
  preview: {select: {title: 'question', subtitle: 'category'}},
})
