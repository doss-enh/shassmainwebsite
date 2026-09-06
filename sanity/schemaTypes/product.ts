import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'categories', title: 'Categories'},
    {name: 'variations', title: 'Variations'},
    {name: 'related', title: 'Related'},
    {name: 'seo', title: 'SEO'},
    {name: 'import', title: 'Import metadata'},
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required(), group: 'content'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required(), group: 'content'}),
    defineField({name: 'sku', title: 'SKU', type: 'string', group: 'content'}),
    defineField({name: 'shortDescription', title: 'Short description', type: 'text', group: 'content'}),
    defineField({name: 'description', title: 'Description', type: 'array', of: [{type: 'block'}], group: 'content'}),
    defineField({
      name: 'faqs',
      title: 'Product FAQs',
      type: 'array',
      of: [{type: 'productFaq'}],
      group: 'content',
    }),

    defineField({name: 'featuredImage', title: 'Featured image', type: 'imageWithAlt', group: 'media'}),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{type: 'imageWithAlt'}],
      group: 'media',
      // Grid layout gives drag-to-reorder tiles instead of a vertical list,
      // and the array's own upload accepts several files at once.
      options: {layout: 'grid'},
      description: 'Drag to reorder. Select several files at once when uploading.',
    }),
    defineField({name: 'needsImage', title: 'Needs a real image', type: 'boolean', group: 'media', description: 'Flagged during import — still has only a placeholder/no image'}),

    defineField({name: 'category', title: 'Primary category', type: 'reference', to: [{type: 'category'}], group: 'categories'}),
    defineField({name: 'additionalCategories', title: 'Additional categories', type: 'array', of: [{type: 'reference', to: [{type: 'category'}]}], group: 'categories'}),

    defineField({name: 'colors', title: 'Colors', type: 'array', of: [{type: 'string'}], group: 'variations'}),
    defineField({name: 'customizable', title: 'Customizable', type: 'boolean', group: 'variations'}),
    defineField({name: 'variantAxes', title: 'Variant axes', type: 'array', of: [{type: 'variantAxis'}], group: 'variations'}),
    defineField({name: 'variants', title: 'Variants', type: 'array', of: [{type: 'productVariant'}], group: 'variations'}),
    defineField({
      name: 'minimumOrderQuantity',
      title: 'Minimum order quantity',
      type: 'number',
      group: 'variations',
      initialValue: 100,
      description: 'House default is 100. Change it here for products that differ.',
    }),
    defineField({name: 'stockStatus', title: 'Stock status', type: 'string', options: {list: ['instock', 'outofstock', 'backorder']}, group: 'variations'}),
    defineField({name: 'priceOnRequest', title: 'Price on request', type: 'boolean', initialValue: true, group: 'variations'}),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {list: ['published', 'draft']},
      initialValue: 'published',
      group: 'content',
      description: 'Draft products are hidden from the storefront.',
    }),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', group: 'related'}),
    defineField({name: 'bestSeller', title: 'Best seller', type: 'boolean', group: 'related'}),
    defineField({name: 'newProduct', title: 'New product', type: 'boolean', group: 'related'}),
    defineField({name: 'relatedProducts', title: 'Related products', type: 'array', of: [{type: 'reference', to: [{type: 'product'}]}], group: 'related'}),
    defineField({name: 'crossSellProducts', title: 'Cross-sell products', type: 'array', of: [{type: 'reference', to: [{type: 'product'}]}], group: 'related'}),

    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),

    defineField({name: 'source', title: 'Source', type: 'string', readOnly: true, group: 'import'}),
    defineField({name: 'externalId', title: 'External ID', type: 'string', readOnly: true, group: 'import'}),
    defineField({
      name: 'sourceImages',
      title: 'Source image paths',
      type: 'array',
      of: [{type: 'string'}],
      readOnly: true,
      group: 'import',
      description: 'Raw import paths — pending upload as real Sanity image assets',
    }),
  ],
  preview: {
    select: {title: 'title', media: 'featuredImage', subtitle: 'sku'},
  },
})
