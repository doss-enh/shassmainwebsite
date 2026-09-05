import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  fields: [
    defineField({name: 'source', title: 'Source path', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'destination', title: 'Destination path', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'statusCode', title: 'Status code', type: 'number', options: {list: [301, 302]}, initialValue: 301}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
    defineField({name: 'note', title: 'Note', type: 'text'}),
  ],
  preview: {
    select: {source: 'source', destination: 'destination'},
    prepare({source, destination}) {
      return {title: source, subtitle: `→ ${destination}`}
    },
  },
})
