import {defineField, defineType} from 'sanity'

// One editable object per homepage band, so copy changes never need a
// developer. Each section renders only when it has a heading, which lets
// the page be built up (or trimmed) entirely from Studio.
const richSection = (name: string, title: string, group: string) =>
  defineField({
    name,
    title,
    type: 'object',
    group,
    options: {collapsible: true, collapsed: true},
    fields: [
      {name: 'heading', title: 'Heading', type: 'string'},
      {name: 'body', title: 'Body', type: 'array', of: [{type: 'block'}]},
    ],
  })

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    {name: 'intro', title: 'Intro sections', default: true},
    {name: 'brands', title: 'Featured brands'},
    {name: 'highlight', title: 'Highlight band'},
    {name: 'valueProps', title: 'Value props'},
    {name: 'personalisation', title: 'Personalisation'},
    {name: 'whyUs', title: 'Why choose us'},
    {name: 'cta', title: 'Closing CTA & videos'},
    {name: 'clients', title: 'Clients'},
    {name: 'faqs', title: 'FAQ section'},
  ],

  fields: [
    // Bands 1 and 2 — the two intro copy blocks either side of the category row.
    richSection('introOne', 'Intro — above category row', 'intro'),
    richSection('introTwo', 'Intro — below category row', 'intro'),
    defineField({name: 'categoryHeading', title: 'Category row label', type: 'string', group: 'intro', initialValue: 'Choose Category'}),

    // Featured brands strip.
    defineField({name: 'brandsHeading', title: 'Heading', type: 'string', group: 'brands', initialValue: 'Featured Brands'}),
    defineField({
      name: 'featuredBrands',
      title: 'Brand tiles',
      type: 'array',
      group: 'brands',
      of: [
        {
          type: 'object',
          name: 'brandTile',
          fields: [
            {name: 'label', title: 'Label', type: 'string'},
            {name: 'image', title: 'Image', type: 'imageWithAlt'},
            {name: 'link', title: 'Link', type: 'string'},
          ],
          preview: {select: {title: 'label', media: 'image'}},
        },
      ],
    }),

    // Wide light band, then the gradient highlight band with a feature image.
    richSection('exploreSection', 'Light band', 'highlight'),
    richSection('highlightSection', 'Gradient band', 'highlight'),
    defineField({name: 'highlightImage', title: 'Gradient band image', type: 'imageWithAlt', group: 'highlight'}),

    // Value props — heading, copy, then the three icon cards.
    richSection('valuePropsSection', 'Heading & copy', 'valueProps'),
    defineField({
      name: 'valueProps',
      title: 'Cards',
      type: 'array',
      group: 'valueProps',
      of: [
        {
          type: 'object',
          name: 'valueProp',
          fields: [
            {name: 'icon', title: 'Icon (emoji)', type: 'string'},
            {name: 'title', title: 'Title', type: 'string'},
            {name: 'text', title: 'Text', type: 'string'},
          ],
          preview: {select: {title: 'title', subtitle: 'text'}},
        },
      ],
    }),

    // Navy personalisation band with its tag pills.
    richSection('personalisationSection', 'Heading & copy', 'personalisation'),
    defineField({name: 'personalisationTags', title: 'Tags', type: 'array', of: [{type: 'string'}], group: 'personalisation'}),
    richSection('creativitySection', 'Creativity band', 'personalisation'),

    // Dark "why choose us" band.
    defineField({name: 'whyUsHeading', title: 'Heading', type: 'string', group: 'whyUs'}),
    defineField({
      name: 'whyUsCards',
      title: 'Cards',
      type: 'array',
      group: 'whyUs',
      of: [
        {
          type: 'object',
          name: 'whyUsCard',
          fields: [
            {name: 'icon', title: 'Icon (emoji)', type: 'string'},
            {name: 'title', title: 'Title', type: 'string'},
            {name: 'text', title: 'Text', type: 'string'},
          ],
          preview: {select: {title: 'title', subtitle: 'text'}},
        },
      ],
    }),

    // Closing CTA plus the video strip beneath it.
    richSection('closingSection', 'Heading & copy', 'cta'),
    defineField({
      name: 'closingCtas',
      title: 'Buttons',
      type: 'array',
      group: 'cta',
      of: [
        {
          type: 'object',
          name: 'ctaButton',
          fields: [
            {name: 'label', title: 'Label', type: 'string'},
            {name: 'href', title: 'Link', type: 'string'},
            {name: 'style', title: 'Style', type: 'string', options: {list: ['solid', 'outline']}, initialValue: 'solid'},
          ],
          preview: {select: {title: 'label', subtitle: 'href'}},
        },
      ],
    }),
    defineField({
      name: 'videos',
      title: 'Video tiles',
      type: 'array',
      group: 'cta',
      of: [
        {
          type: 'object',
          name: 'videoTile',
          fields: [
            {name: 'title', title: 'Title', type: 'string'},
            {name: 'url', title: 'Video URL', type: 'url'},
            {name: 'thumbnail', title: 'Thumbnail', type: 'imageWithAlt'},
          ],
          preview: {select: {title: 'title', media: 'thumbnail'}},
        },
      ],
    }),

    // Client logo wall.
    richSection('clientsSection', 'Heading & copy', 'clients'),
    defineField({
      name: 'clientLogos',
      title: 'Client logos',
      type: 'array',
      group: 'clients',
      of: [{type: 'imageWithAlt'}],
    }),

    // FAQ band — questions come from the FAQ documents; this is its framing.
    richSection('faqSection', 'Heading & copy', 'faqs'),
  ],

  preview: {
    prepare() {
      return {title: 'Homepage'}
    },
  },
})
