const { Expo } = require('expo-server-sdk');
const env_configs = require('../config/environmentConfig');

// Create Expo client with proper configuration
const expo = new Expo({
  accessToken: env_configs.EXPO_ACCESS_TOKEN || null,
  useFcmV1: true,
});

class PushNotificationService {
  static async sendMessageNotification({
    recipientPushToken,
    senderName,
    messageText,
    threadId,
    senderId,
    firstName,
    lastName,
    profilePicture,
  }) {

    // Validate that this is a proper Expo token
    if (!Expo.isExpoPushToken(recipientPushToken)) {
      console.error(`Invalid Expo push token format: ${recipientPushToken}`);
      return false;
    }

    console.log(`Valid Expo token detected`);

    const message = {
      to: recipientPushToken, // Use the full Expo token, don't extract
      sound: 'default',
      title: senderName,
      body: messageText,
      data: {
        type: 'message',
        threadId: threadId.toString(),
        senderId: senderId.toString(),
        timestamp: new Date().toISOString(),
        firstName: firstName,
        lastName: lastName,
        profilePicture: profilePicture,
      },
      priority: 'high',
      // Remove FCM-specific options that might cause issues
      channelId: 'default',
    };

    try {
 
      // Send using Expo's push notification service
      const tickets = await expo.sendPushNotificationsAsync([message]);
      
      console.log(`Raw response:`, JSON.stringify(tickets, null, 2));
      
      const ticket = tickets[0];
      
      if (ticket.status === 'error') {
        console.error(`Push notification failed:`, ticket.details);
        
        // Handle specific Expo errors
        switch (ticket.details?.error) {
          case 'InvalidCredentials':
            console.error(`InvalidCredentials - This usually means:`);
            console.error(`[EXPO] 1. Your Expo project is not properly configured`);
            console.error(`[EXPO] 2. You need to add EXPO_ACCESS_TOKEN to environment variables`);
            console.error(`[EXPO] 3. Or the token was generated with FCM but you're using Expo service`);
            break;
          case 'DeviceNotRegistered':
            console.error(`[EXPO] Token is invalid/expired - user needs to re-register`);
            break;
          case 'MessageTooBig':
            console.error(`[EXPO] Message content is too large`);
            break;
          case 'MessageRateExceeded':
            console.error(`[EXPO] Too many messages sent, implement rate limiting`);
            break;
          default:
            console.error(`[EXPO] Unknown error: ${ticket.details?.error}`);
        }
        return false;
      }
      
      if (ticket.status === 'ok') {
        console.log(`[EXPO] Push notification sent successfully!`);
        console.log(`[EXPO] Receipt ID: ${ticket.id}`);
        return true;
      }
      
      console.warn(`[EXPO] Unexpected ticket status: ${ticket.status}`);
      return false;
      
    } catch (error) {
      console.error(`[EXPO] Error sending push notification:`, error.message);
      console.error(`[EXPO] Error stack:`, error.stack);
      
      // Check for network issues
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.error(`[EXPO] Network error - check internet connection`);
      } else if (error.message.includes('401')) {
        console.error(`[EXPO] Authentication error - check EXPO_ACCESS_TOKEN`);
      }
      
      return false;
    }
  }

  static async sendBulkNotifications(notifications) {
    console.log(`[EXPO] Processing ${notifications.length} bulk notifications...`);
    
    // Filter to only valid Expo tokens
    const validNotifications = notifications.filter(notification => {
      const isValid = Expo.isExpoPushToken(notification.to);
      if (!isValid) {
        console.warn(`[EXPO] Skipping invalid token: ${notification.to}`);
      }
      return isValid;
    });

    if (validNotifications.length === 0) {
      console.log(`[EXPO] No valid Expo push tokens found`);
      return [];
    }

    console.log(`[EXPO] Sending ${validNotifications.length} valid notifications...`);

    try {
      // Chunk notifications for batch sending (Expo recommends max 100 per chunk)
      const chunks = expo.chunkPushNotifications(validNotifications);
      const allTickets = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`[EXPO] Sending chunk ${i + 1}/${chunks.length} (${chunk.length} notifications)...`);
        
        try {
          const tickets = await expo.sendPushNotificationsAsync(chunk);
          allTickets.push(...tickets);
          
          // Small delay between chunks to avoid rate limiting
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (chunkError) {
          console.error(`[EXPO] Error sending chunk ${i + 1}:`, chunkError.message);
          // Add error tickets for failed chunk
          allTickets.push(...chunk.map(() => ({ 
            status: 'error', 
            details: { error: 'ChunkSendError', message: chunkError.message } 
          })));
        }
      }

      // Log summary
      const successCount = allTickets.filter(ticket => ticket.status === 'ok').length;
      const errorCount = allTickets.filter(ticket => ticket.status === 'error').length;
      
      console.log(`[EXPO] Bulk send complete: ${successCount} successful, ${errorCount} failed`);
      
      // Log error details
      if (errorCount > 0) {
        const errorTickets = allTickets.filter(ticket => ticket.status === 'error');
        const errorSummary = {};
        errorTickets.forEach(ticket => {
          const errorType = ticket.details?.error || 'Unknown';
          errorSummary[errorType] = (errorSummary[errorType] || 0) + 1;
        });
        console.log(`[EXPO] Error summary:`, errorSummary);
      }
      
      return allTickets;
      
    } catch (error) {
      console.error(`[EXPO] Bulk send error:`, error);
      return [];
    }
  }
}

module.exports = PushNotificationService;