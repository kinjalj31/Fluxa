import { Database } from '../database/Database';
import { PoolClient } from 'pg';

export abstract class BaseRepository<T> {
  protected db: Database;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = Database.getInstance();
    this.tableName = tableName;
  }

  protected async findOne(conditions: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  protected async findMany(conditions?: Record<string, any>, orderBy?: string): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    let values: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      values = Object.values(conditions);
      const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    const result = await this.db.query(query, values);
    return result.rows;
  }

  protected async insert(data: Record<string, any>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  protected async update(id: string, data: Record<string, any>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [id, ...values]);
    return result.rows[0];
  }

  protected async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async executeQuery(query: string, params?: any[]): Promise<any> {
    return this.db.query(query, params);
  }

  protected async executeTransaction<R>(callback: (client: PoolClient) => Promise<R>): Promise<R> {
    return this.db.transaction(callback);
  }
}