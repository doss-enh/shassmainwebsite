import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  fields: [
    defineField({name: 'source', title: 'Source path', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'destination', title: 'Destination path', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'type',
      title: 'Redirect type',
      type: 'string',
      options: {list: ['301', '302']},
      initialValue: '301',
    }),
  ],
  preview: {
    select: {source: 'source', destination: 'destination'},
    prepare({source, destination}) {
      return {title: source, subtitle: `→ ${destination}`}
    },
  },
})
