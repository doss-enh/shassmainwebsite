import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'formSubmission',
  title: 'Form Submission',
  type: 'document',
  fields: [
    defineField({
      name: 'formType',
      title: 'Form type',
      type: 'string',
      options: {list: ['contact', 'quote_request', 'catalogue_download', 'newsletter', 'other']},
    }),
    defineField({name: 'name', title: 'Name', type: 'string'}),
    defineField({name: 'email', title: 'Email', type: 'string'}),
    defineField({name: 'phone', title: 'Phone', type: 'string'}),
    defineField({name: 'message', title: 'Message', type: 'text'}),
    defineField({name: 'payload', title: 'Raw payload', type: 'text', description: 'JSON snapshot of the submitted form'}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {list: ['new', 'reviewed', 'archived']},
      initialValue: 'new',
    }),
    defineField({name: 'createdAt', title: 'Submitted at', type: 'datetime', initialValue: () => new Date().toISOString()}),
  ],
  orderings: [{title: 'Newest first', name: 'createdAtDesc', by: [{field: 'createdAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'name', subtitle: 'formType'},
  },
})
