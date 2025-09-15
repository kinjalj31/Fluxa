import * as migration001 from './001-create-users-table'
import * as migration002 from './002-create-invoices-table'
import * as migration003 from './003-create-invoice-extracts-table'

export const migrations = [
  {
    name: '001-create-users-table',
    up: migration001.up,
    down: migration001.down
  },
  {
    name: '002-create-invoices-table',
    up: migration002.up,
    down: migration002.down
  },
  {
    name: '003-create-invoice-extracts-table',
    up: migration003.up,
    down: migration003.down
  }
]

export const runMigrations = async (): Promise<void> => {
  console.log('🚀 Running database migrations...')
  
  for (const migration of migrations) {
    try {
      await migration.up()
      console.log(`✅ Migration ${migration.name} completed`)
    } catch (error) {
      console.error(`❌ Migration ${migration.name} failed:`, error)
      throw error
    }
  }
  
  console.log('🎉 All migrations completed successfully')
}