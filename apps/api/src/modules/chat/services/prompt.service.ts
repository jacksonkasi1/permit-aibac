import { logger } from "@repo/logs";
import { Message } from "ai";
import { classifyPrompt } from "@repo/permit";

/**
 * Service for handling prompt classification and validation
 */
export const promptService = {
  /**
   * Classify and validate a user prompt
   */
  async classifyPrompt(
    userId: string,
    messages: Message[]
  ): Promise<{
    allowed: boolean;
    classification: string;
    reason?: string;
    filters?: Record<string, any>;
    lastPrompt: string;
  }> {
    try {
      // Get last user message
      const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
      
      if (!lastUserMessage || !lastUserMessage.content) {
        return {
          allowed: false,
          classification: "unknown",
          reason: "No valid user message found",
          lastPrompt: ""
        };
      }
      
      const prompt = lastUserMessage.content;
      logger.debug(`Classifying prompt from user ${userId}: "${prompt.substring(0, 50)}..."`);
      
      // Use Permit.io to classify the prompt
      const classificationResult = await classifyPrompt(userId, prompt);
      
      return {
        allowed: classificationResult.allowed,
        classification: classificationResult.classification || "view",
        reason: classificationResult.reason,
        filters: classificationResult.filters,
        lastPrompt: prompt
      };
    } catch (error) {
      logger.error(`Error classifying prompt for user ${userId}:`, error);
      return {
        allowed: false,
        classification: "error",
        reason: "Error during prompt classification",
        lastPrompt: ""
      };
    }
  },
  
  /**
   * Create a system prompt based on user permissions and classifications
   */
  createPermissionAwareSystemPrompt(
    classification: string, 
    filters: Record<string, any> = {}
  ): string {
    // Base system prompt for all users
    let prompt = `You are a medical assistant following strict privacy and security guidelines. 
                 You can only discuss medical information that the user has access to based on their role.
                 Always respect confidentiality and privacy of medical data.`;
    
    // Add classification-specific instructions
    if (classification === 'view') {
      prompt += `\nYou are in VIEW mode - only provide information, do not suggest or allow changes to records.`;
    } else if (classification === 'update') {
      prompt += `\nYou are in UPDATE mode - you can suggest updates to records the user has access to.`;
    } else if (classification === 'create') {
      prompt += `\nYou are in CREATE mode - you can help create new records within the user's permission scope.`;
    } else if (classification === 'delete') {
      prompt += `\nYou are in DELETE mode - you can discuss deletion of records within the user's permission scope.`;
    }
    
    // Add filter-specific instructions
    if (filters.department) {
      prompt += `\nThe user belongs to the ${filters.department} department - only discuss information related to this department.`;
    }
    
    if (filters.sensitivity) {
      if (Array.isArray(filters.sensitivity)) {
        prompt += `\nThe user has access to ${filters.sensitivity.join(', ')} sensitivity levels.`;
      } else {
        prompt += `\nThe user has access to ${filters.sensitivity} sensitivity level only.`;
      }
    }
    
    if (filters.specialization) {
      prompt += `\nThe user's specialization is ${filters.specialization} - focus responses on this area.`;
    }
    
    return prompt;
  }
}; 