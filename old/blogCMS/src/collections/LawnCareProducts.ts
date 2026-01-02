import { CollectionConfig } from 'payload'

export const LawnCareProducts: CollectionConfig = {
  slug: 'lawn-care-products',
  admin: {
    useAsTitle: 'name',
  },

  access: {
    read: () => true,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },

    {
      name: 'description',
      type: 'richText',
      required: true,
    },

    {
      name: 'price',
      type: 'number',
      required: true,
    },

    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Fertilizer', value: 'fertilizer' },
        { label: 'Grass Cutter', value: 'cutter' },
        { label: 'Garden Tool', value: 'tool' },
        { label: 'Seeds', value: 'seeds' },
        { label: 'Insect Control', value: 'insect' },
        { label: 'Others', value: 'other' },
      ],
      required: true,
    },

    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },

    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
    },

    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
    },

    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
  ],

  timestamps: true,
}
