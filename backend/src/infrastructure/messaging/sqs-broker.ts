import { SQSClientService } from './sqs-client'

/**
 * SQS Message Broker - Infrastructure layer for message handling
 * 
 * Provides message polling and processing capabilities.
 * Uses callback pattern to avoid dependencies on upper layers.
 */
export class SQSBroker {
  private sqsClient: SQSClientService
  private isPolling = false
  private messageHandler?: (notification: any) => Promise<void>

  constructor() {
    this.sqsClient = new SQSClientService()
  }

  /**
   * Set message handler callback
   */
  setMessageHandler(handler: (notification: any) => Promise<void>): void {
    this.messageHandler = handler
  }

  /**
   * Start Continuous SQS Polling
   * 
   * Infinite loop that monitors SQS queue for Textract completion notifications.
   * 
   * **Flow:**
   * 1. Polls SQS queue every 5 seconds for messages
   * 2. Processes SNS notifications from Textract service
   * 3. Triggers message handler for OCR completion
   * 4. Updates invoice database with extracted data
   * 5. Deletes processed messages from queue
   * 
   * **Error Handling:**
   * - Normal polling: 5 second intervals
   * - On errors: 10 second intervals (exponential backoff)
   * - Continues running to maintain service availability
   * 
   * **Lifecycle:**
   * - Started during server startup
   * - Runs until stopPolling() called or server shutdown
   */
  async startPolling(): Promise<void> {
    if (this.isPolling) {
      console.log('SQS: ⚠️ Polling already active, skipping start request')
      return
    }

    if (!this.messageHandler) {
      throw new Error('Message handler not set. Call setMessageHandler() first.')
    }
    
    // Clear old messages on startup
    await this.sqsClient.purgeQueue()
    
    this.isPolling = true
    console.log(`\n=== SQS POLLING STARTED ===`)
    console.log(`Queue URL: ${process.env.TEXTRACT_SQS_QUEUE_URL}`)
    console.log(`Region: ${process.env.AWS_REGION || 'us-east-1'}`)
    console.log(`Polling Interval: 5 seconds`)
    console.log(`Long Polling: 20 seconds`)
    console.log(`===========================\n`)
    
    let pollCount = 0
    
    while (this.isPolling) {
      try {
        pollCount++
        console.log(`SQS: 🔄 Poll #${pollCount} - Checking for messages...`)
        
        const startTime = Date.now()
        const messages = await this.sqsClient.receiveMessages()
        const duration = Date.now() - startTime
        
        console.log(`SQS: 📨 Received ${messages.length} messages in ${duration}ms`)
        
        if (messages.length > 0) {
          console.log(`SQS: 🔄 Processing ${messages.length} messages sequentially...`)
          
          for (let i = 0; i < messages.length; i++) {
            const message = messages[i]
            console.log(`SQS: 📩 Processing message ${i + 1}/${messages.length}`)
            console.log(`SQS: MessageId: ${message.MessageId}`)
            console.log(`SQS: ReceiptHandle: ${message.ReceiptHandle?.substring(0, 20)}...`)
            
            await this.processMessage(message)
          }
          
          console.log(`SQS: ✅ Completed processing ${messages.length} messages`)
        } else {
          console.log(`SQS: ⏳ Poll #${pollCount} - No messages received, waiting 5s...`)
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000))
      } catch (error) {
        console.error(`SQS: ❌ Poll #${pollCount} - Polling error:`, error)
        console.log('SQS: ⏳ Waiting 10s before retry due to error...')
        await new Promise(resolve => setTimeout(resolve, 10000))
      }
    }
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    this.isPolling = false
    console.log('\n=== SQS POLLING STOPPED ===\n')
  }

  /**
   * Process Individual SQS Message
   * 
   * Unwraps SNS notification from SQS message body and triggers message handler.
   * SNS messages are double-wrapped: SQS.Body contains SNS.Message containing actual notification.
   * Deletes message from queue only after successful processing to prevent data loss.
   */
  private async processMessage(message: any): Promise<void> {
    console.log(`\n--- SQS MESSAGE PROCESSING ---`)
    console.log(`MessageId: ${message.MessageId}`)
    
    try {
      console.log('SQS: 🔍 Complete raw message:')
      console.log(JSON.stringify(message, null, 2))
      console.log('\nSQS: 🔓 Parsing SQS message body...')
      const body = JSON.parse(message.Body)
      
      // Check if this is a direct Textract notification or SNS-wrapped
      if (body.JobId && body.Status && body.API) {
        console.log('SQS: 📨 Direct Textract notification:', {
          JobId: body.JobId,
          Status: body.Status,
          API: body.API
        })
        
        console.log('SQS: 🚀 Forwarding to message handler...')
        await this.messageHandler!(body)
        
      } else if (body.Type === 'Notification' && body.Message) {
        console.log('SQS: 🔓 Parsing SNS notification message...')
        const notification = JSON.parse(body.Message)
        
        console.log('SQS: 📨 SNS Notification extracted:', {
          JobId: notification.JobId,
          Status: notification.Status,
          API: notification.API
        })
        
        console.log('SQS: 🚀 Forwarding to message handler...')
        await this.messageHandler!(notification)
        
      } else {
        console.log('SQS: ⚠️ Unknown message format, deleting...')
        await this.sqsClient.deleteMessage(message.ReceiptHandle)
        return
      }
      
      console.log('SQS: 🗑️ Deleting processed message from queue...')
      await this.sqsClient.deleteMessage(message.ReceiptHandle)
      console.log('SQS: ✅ Message successfully deleted from queue')
      
    } catch (error) {
      console.error('SQS: ❌ Error processing message:', error)
      console.error('SQS: ⚠️ Message will remain in queue for retry')
    }
    
    console.log(`--- MESSAGE PROCESSING COMPLETE ---\n`)
  }
}