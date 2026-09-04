import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

export default defineType({
  name: 'webhook',
  title: 'Webhook',
  type: 'document',
  icon: LinkIcon,
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'url', title: 'Target URL', type: 'url', validation: (r) => r.required()}),
    defineField({
      name: 'event',
      title: 'Trigger event',
      type: 'string',
      options: {list: ['enquiry.created', 'formSubmission.created', 'newsletterSubscriber.created']},
    }),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
  ],
  preview: {select: {title: 'name', subtitle: 'url'}},
})
