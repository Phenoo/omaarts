import {defineField, defineType} from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Event Name',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'dateRange',
      title: 'Date Range (e.g. OCT 12 - NOV 04)',
      type: 'string',
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
            { title: 'Exhibition', value: 'exhibition' },
            { title: 'Workshop', value: 'workshop' },
            { title: 'Lesson', value: 'lesson' },
        ]
      }
    }),
  ],
})
