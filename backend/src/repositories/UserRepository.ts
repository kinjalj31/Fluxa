import { BaseRepository } from './BaseRepository';
import { User } from '../types';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async create(name: string, email: string): Promise<User> {
    return this.insert({
      name,
      email,
      created_at: 'NOW()',
      updated_at: 'NOW()'
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ id });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const updateData: Record<string, any> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    
    return this.update(id, updateData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async findAll(): Promise<User[]> {
    return this.findMany({}, 'created_at DESC');
  }
}