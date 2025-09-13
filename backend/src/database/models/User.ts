import { UserRepository } from '../../library/user/repository'

export interface User {
  id: string
  name: string
  email: string
  created_at: Date
  updated_at: Date
}

export class UserModel {
  private repository: UserRepository

  constructor() {
    this.repository = new UserRepository()
  }

  async create(name: string, email: string): Promise<User> {
    return await this.repository.createUser(name, email)
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findByEmail(email)
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findById(id)
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return await this.repository.updateUser(id, data)
  }

  async delete(id: string): Promise<boolean> {
    return await this.repository.deleteUser(id)
  }
}