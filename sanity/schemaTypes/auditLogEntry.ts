import {defineField, defineType} from 'sanity'
import {HistoryIcon} from '@sanity/icons'

export default defineType({
  name: 'auditLogEntry',
  title: 'Audit Log Entry',
  type: 'document',
  icon: HistoryIcon,
  fields: [
    defineField({name: 'action', title: 'Action', type: 'string'}),
    defineField({name: 'actor', title: 'Actor', type: 'string'}),
    defineField({name: 'target', title: 'Target', type: 'string'}),
    defineField({name: 'metadata', title: 'Metadata', type: 'text'}),
    defineField({name: 'createdAt', title: 'Timestamp', type: 'datetime', initialValue: () => new Date().toISOString()}),
  ],
  orderings: [{title: 'Newest first', name: 'createdAtDesc', by: [{field: 'createdAt', direction: 'desc'}]}],
  preview: {select: {title: 'action', subtitle: 'actor'}},
})
