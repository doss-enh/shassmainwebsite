import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'enquiry',
  title: 'Product Enquiry',
  type: 'document',
  fields: [
    defineField({name: 'enquiryNumber', title: 'Enquiry number', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {list: ['new', 'contacted', 'quoted', 'negotiation', 'won', 'lost'], layout: 'radio'},
      initialValue: 'new',
    }),
    defineField({name: 'customerName', title: 'Customer name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'company', title: 'Company', type: 'string'}),
    defineField({name: 'email', title: 'Email', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'phone', title: 'Phone', type: 'string'}),
    defineField({name: 'message', title: 'Message', type: 'text'}),
    defineField({
      name: 'items',
      title: 'Products enquired',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'enquiryItem',
          fields: [
            {name: 'product', type: 'reference', to: [{type: 'product'}]},
            {name: 'quantity', type: 'number'},
            {name: 'notes', type: 'string'},
          ],
          preview: {
            select: {title: 'product.name', quantity: 'quantity'},
            prepare({title, quantity}) {
              return {title, subtitle: quantity ? `Qty: ${quantity}` : ''}
            },
          },
        },
      ],
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal notes',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'note',
          fields: [
            {name: 'text', type: 'text'},
            {name: 'author', type: 'string'},
            {name: 'createdAt', type: 'datetime'},
          ],
        },
      ],
    }),
    defineField({name: 'source', title: 'Source', type: 'string', initialValue: 'website'}),
    defineField({name: 'createdAt', title: 'Submitted at', type: 'datetime', initialValue: () => new Date().toISOString()}),
  ],
  orderings: [
    {title: 'Newest first', name: 'createdAtDesc', by: [{field: 'createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'enquiryNumber', subtitle: 'customerName', status: 'status'},
    prepare({title, subtitle, status}) {
      return {title: `${title} · ${subtitle}`, subtitle: status}
    },
  },
})
