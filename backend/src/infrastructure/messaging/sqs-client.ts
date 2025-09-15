import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, PurgeQueueCommand } from '@aws-sdk/client-sqs'

/**
 * SQS Client - Infrastructure layer for AWS SQS operations
 * 
 * Handles low-level SQS operations without business logic dependencies.
 * Follows infrastructure layer principles - no imports from upper layers.
 */
export class SQSClientService {
  private client: SQSClient
  private queueUrl: string

  constructor() {
    this.client = new SQSClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT_URL || undefined,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
      }
    })
    this.queueUrl = process.env.TEXTRACT_SQS_QUEUE_URL!
  }

  /**
   * Poll SQS Queue for Messages
   * 
   * Executes a single polling operation to retrieve messages from SQS queue.
   * Uses AWS SDK ReceiveMessageCommand with optimized parameters for efficiency.
   * 
   * **Command Configuration:**
   * - QueueUrl: Target SQS queue containing SNS notifications
   * - MaxNumberOfMessages: 10 (AWS maximum, reduces API calls)
   * - WaitTimeSeconds: 20 (long polling, reduces empty responses)
   * 
   * **Long Polling Benefits:**
   * - Reduces API calls by waiting up to 20 seconds for messages
   * - Lower costs compared to short polling (fewer requests)
   * - Eliminates empty responses when queue is temporarily empty
   * - More efficient than continuous short polling
   */
  async receiveMessages(maxMessages: number = 10, waitTimeSeconds: number = 20): Promise<any[]> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: waitTimeSeconds
    })

    console.log('SQS: 🔍 Sending ReceiveMessage command (long polling 20s)...')
    const response = await this.client.send(command)
    
    return response.Messages || []
  }

  /**
   * Delete message from queue
   */
  async deleteMessage(receiptHandle: string): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle
      })
      
      await this.client.send(command)
      console.log('SQS: ✅ DeleteMessage command successful')
    } catch (error) {
      console.error('SQS: ❌ Failed to delete message:', error)
      throw error
    }
  }

  /**
   * Purge all messages from queue
   */
  async purgeQueue(): Promise<void> {
    console.log('SQS: 🗑️ Purging queue on startup...')
    const command = new PurgeQueueCommand({
      QueueUrl: this.queueUrl
    })
    
    try {
      await this.client.send(command)
      console.log('SQS: ✅ Queue purged successfully')
    } catch (error) {
      console.log('SQS: ⚠️ Queue purge failed (may be empty):', error.message)
    }
  }

  /**
   * Parse SNS message from SQS body
   */
  parseMessage(sqsMessage: any): any {
    const body = JSON.parse(sqsMessage.Body)
    return JSON.parse(body.Message) // SNS wraps the message
  }
}