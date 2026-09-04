import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'media', title: 'Media'},
    {name: 'details', title: 'Details'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required(), group: 'general'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required(), group: 'general'}),
    defineField({name: 'sku', title: 'SKU', type: 'string', group: 'general'}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {list: ['draft', 'live', 'archived'], layout: 'radio'},
      initialValue: 'draft',
      group: 'general',
    }),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', initialValue: false, group: 'general'}),
    defineField({name: 'category', title: 'Category', type: 'reference', to: [{type: 'category'}], group: 'general'}),
    defineField({name: 'brand', title: 'Brand', type: 'reference', to: [{type: 'brand'}], group: 'general'}),

    defineField({name: 'images', title: 'Images', type: 'array', of: [{type: 'image', options: {hotspot: true}}], group: 'media'}),

    defineField({name: 'shortDescription', title: 'Short description', type: 'text', group: 'details'}),
    defineField({name: 'description', title: 'Description', type: 'array', of: [{type: 'block'}], group: 'details'}),
    defineField({name: 'minOrderQty', title: 'Minimum order quantity', type: 'number', group: 'details'}),
    defineField({name: 'priceOnRequest', title: 'Price on request', type: 'boolean', initialValue: true, group: 'details'}),
    defineField({name: 'indicativePrice', title: 'Indicative price (internal reference only)', type: 'number', group: 'details'}),
    defineField({
      name: 'attributes',
      title: 'Attributes',
      type: 'array',
      group: 'details',
      of: [
        {
          type: 'object',
          name: 'productAttribute',
          fields: [
            {name: 'attribute', type: 'reference', to: [{type: 'attribute'}]},
            {name: 'values', type: 'array', of: [{type: 'string'}]},
          ],
        },
      ],
    }),
    defineField({
      name: 'printAreas',
      title: 'Branding / print areas',
      type: 'array',
      of: [{type: 'string'}],
      group: 'details',
    }),

    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo'}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text', group: 'seo'}),
  ],
  preview: {
    select: {title: 'name', media: 'images.0', subtitle: 'sku', status: 'status'},
    prepare({title, media, subtitle, status}) {
      return {title, media, subtitle: [subtitle, status].filter(Boolean).join(' · ')}
    },
  },
})
