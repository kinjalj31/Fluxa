import { Router, Request, Response } from 'express'
import { UserWorkflows } from '../../workflows/user-workflows'

const router = Router()

// POST /api/users - Create new user
router.post(
  '/',
  async (request: Request, response: Response) => {
    try {
      if (!request.body.name || !request.body.email) {
        return response.status(400).json({
          message: 'Missing required fields: name and email'
        })
      }

      const result = await UserWorkflows.createUser(
        request.body.name,
        request.body.email
      )
      
      return response.status(201).json({
        message: 'User created successfully',
        ...result
      })
    } catch (error: any) {
      console.error('Create user error:', error)
      
      if (error.message === 'User already exists with this email') {
        return response.status(409).json({
          message: 'User already exists with this email'
        })
      }
      
      return response.status(500).json({
        message: 'Internal server error',
        error: error.message
      })
    }
  }
)

// GET /api/users/:email - Get user by email
router.get(
  '/:email',
  async (request: Request, response: Response) => {
    try {
      const result = await UserWorkflows.getUserByEmail(request.params.email)
      
      return response.status(200).json({
        message: 'User found',
        ...result
      })
    } catch (error: any) {
      console.error('Get user error:', error)
      
      if (error.message === 'User not found') {
        return response.status(404).json({
          message: 'User not found'
        })
      }
      
      return response.status(500).json({
        message: 'Internal server error',
        error: error.message
      })
    }
  }
)

// GET /api/users/stats - Get user statistics
router.get(
  '/stats',
  async (request: Request, response: Response) => {
    try {
      const result = await UserWorkflows.getUserStats()
      
      return response.status(200).json({
        message: 'User statistics retrieved',
        ...result
      })
    } catch (error: any) {
      console.error('Get user stats error:', error)
      return response.status(500).json({
        message: 'Internal server error',
        error: error.message
      })
    }
  }
)

module.exports = router