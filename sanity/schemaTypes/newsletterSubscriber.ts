import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons'

export default defineType({
  name: 'newsletterSubscriber',
  title: 'Newsletter Subscriber',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({name: 'email', title: 'Email', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'subscribedAt', title: 'Subscribed at', type: 'datetime', initialValue: () => new Date().toISOString()}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {list: ['subscribed', 'unsubscribed']},
      initialValue: 'subscribed',
    }),
  ],
  preview: {select: {title: 'email', subtitle: 'status'}},
})
