export default {
  name: 'mediaItem',
  title: 'Media Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'type',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Conferences', value: 'Conferences' },
          { title: 'Campus Chapters', value: 'Campus Chapters' },
          { title: 'Outreach', value: 'Outreach' },
          { title: 'The Exchange', value: 'The Exchange' },
          { title: 'Community Activities', value: 'Community Activities' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Image File',
      type: 'image',
      hidden: ({ document }) => document?.type !== 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
        },
      ],
    },
    {
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      hidden: ({ document }) => document?.type !== 'video',
      description: 'URL to the video (YouTube, Vimeo, or MP4)',
    },
    {
      name: 'thumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      hidden: ({ document }) => document?.type !== 'video',
    },
    {
      name: 'featured',
      title: 'Featured Item',
      type: 'boolean',
      description: 'Show this on the homepage gallery preview',
      initialValue: false,
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'image',
    },
  },
};
