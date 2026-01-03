import { type SchemaTypeDefinition } from 'sanity'
import { artwork } from './artwork'
import { event } from './event'
import { service } from './service'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [artwork, event, service],
}
