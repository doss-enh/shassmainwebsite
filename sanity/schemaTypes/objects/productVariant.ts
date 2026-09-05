import {defineType, defineField} from 'sanity'

// An add-on (gift wrap, engraving) is NOT a variantOption — options here are
// axis selections. A variant must pin every axis the product declares, each
// axis appearing once, matched by exact axis name and value.
export const variantOption = defineType({
  name: 'variantOption',
  title: 'Variant option',
  type: 'object',
  fields: [
    defineField({name: 'name', title: 'Axis name', type: 'string'}),
    defineField({name: 'value', title: 'Value', type: 'string'}),
    defineField({name: 'code', title: 'Code', type: 'string', description: 'Short code used to compose the variant SKU'}),
  ],
})

export const productVariant = defineType({
  name: 'productVariant',
  title: 'Variant',
  type: 'object',
  fields: [
    defineField({name: 'sku', title: 'SKU', type: 'string'}),
    defineField({name: 'isDefault', title: 'Default variant', type: 'boolean'}),
    defineField({name: 'options', title: 'Options', type: 'array', of: [{type: 'variantOption'}]}),
    defineField({name: 'stockStatus', title: 'Stock status', type: 'string', options: {list: ['instock', 'outofstock', 'backorder']}}),
    defineField({
      name: 'sourceImages',
      title: 'Source image paths',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Raw import paths — pending upload as real Sanity image assets',
    }),
  ],
  preview: {
    select: {sku: 'sku', options: 'options'},
    prepare({sku, options}) {
      return {title: sku, subtitle: (options || []).map((o: {name?: string; value?: string}) => `${o.name}: ${o.value}`).join(', ')}
    },
  },
})

export const variantAxis = defineType({
  name: 'variantAxis',
  title: 'Variant axis',
  type: 'object',
  fields: [
    defineField({name: 'name', title: 'Axis name', type: 'string', description: 'e.g. Color, Capacity'}),
    defineField({name: 'values', title: 'Values', type: 'array', of: [{type: 'string'}]}),
  ],
})

export const productFaq = defineType({
  name: 'productFaq',
  title: 'Product FAQ',
  type: 'object',
  fields: [
    defineField({name: 'question', title: 'Question', type: 'string'}),
    defineField({name: 'answer', title: 'Answer', type: 'text'}),
  ],
})
