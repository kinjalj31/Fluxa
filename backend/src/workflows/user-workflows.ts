import { UserRepository } from '../library/user/repository'

const COMPONENT = 'UserWorkflows'

/**
 * User Workflows
 * Business logic layer for user operations
 */
export class UserWorkflows {

  /**
   * Create User Workflow
   */
  static async createUser(name: string, email: string) {
    console.log(`${COMPONENT}: Creating user`)
    console.log(`Name: ${name}, Email: ${email}`)

    try {
      const userRepository = new UserRepository()

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email)
      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      const user = await userRepository.createUser(name, email)

      return {
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
          }
        }
      }

    } catch (error) {
      console.error(`${COMPONENT}: Create user failed:`, error)
      throw error
    }
  }

  /**
   * Get User By Email Workflow
   */
  static async getUserByEmail(email: string) {
    console.log(`${COMPONENT}: Getting user by email`)
    console.log(`Email: ${email}`)

    try {
      const userRepository = new UserRepository()
      const user = await userRepository.findByEmail(email)
      
      if (!user) {
        throw new Error('User not found')
      }

      return {
        success: true,
        message: 'User found',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
          }
        }
      }

    } catch (error) {
      console.error(`${COMPONENT}: Get user failed:`, error)
      throw error
    }
  }

  /**
   * Get User Stats Workflow
   */
  static async getUserStats() {
    console.log(`${COMPONENT}: Getting user stats`)

    try {
      const userRepository = new UserRepository()
      const stats = await userRepository.getUserStats()

      return {
        success: true,
        message: 'User statistics retrieved',
        data: stats
      }

    } catch (error) {
      console.error(`${COMPONENT}: Get user stats failed:`, error)
      throw error
    }
  }

  /**
   * Find or create user by email
   * Following hiring-force user management patterns
   */
  static async findOrCreateUser(userName: string, email: string) {
    try {
      const userRepository = new UserRepository()

      // Try to find existing user
      let user = await userRepository.findByEmail(email)
      
      if (!user) {
        console.log(`${COMPONENT}: Creating new user for email: ${email}`)
        user = await userRepository.createUser(userName, email)
        console.log(`${COMPONENT}: New user created with ID: ${user.id}`)
      } else {
        console.log(`${COMPONENT}: Found existing user with ID: ${user.id}`)
      }

      return user

    } catch (error) {
      console.error(`${COMPONENT}: User creation/lookup failed:`, error)
      throw new Error('Failed to find or create user')
    }
  }
}