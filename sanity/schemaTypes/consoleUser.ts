import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'consoleUser',
  title: 'User',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'email', title: 'Email', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'avatar', title: 'Avatar', type: 'image'}),
    defineField({name: 'role', title: 'Role', type: 'reference', to: [{type: 'role'}]}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
  ],
  preview: {select: {title: 'name', subtitle: 'email', media: 'avatar'}},
})
