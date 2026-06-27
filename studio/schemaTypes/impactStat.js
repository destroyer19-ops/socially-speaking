export default {
  name: 'impactStat',
  title: 'Impact Statistic',
  type: 'document',
  fields: [
    {
      name: 'metric',
      title: 'Metric Name',
      type: 'string',
      description: 'e.g., "Youth Impacted", "Chapters"',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'value',
      title: 'Value',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'suffix',
      title: 'Suffix',
      type: 'string',
      description: 'e.g., "+", "k"',
    },
    {
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Name of the Lucide icon to use (e.g., "Users", "Globe")',
    }
  ]
};
