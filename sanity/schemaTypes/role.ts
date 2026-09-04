import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'role',
  title: 'Role',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'permissions',
      title: 'Permissions',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          'enquiries.view', 'enquiries.manage',
          'products.view', 'products.manage',
          'content.manage',
          'settings.manage',
          'users.manage',
        ],
      },
    }),
  ],
  preview: {select: {title: 'name'}},
})
