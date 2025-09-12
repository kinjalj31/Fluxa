import { UserRepository } from '../repositories/UserRepository';
import { User } from '../types';

export class UserModel {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(name: string, email: string): Promise<User> {
    return this.userRepository.create(name, email);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.userRepository.updateUser(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepository.deleteUser(id);
  }
}