const axios = require('axios');

class ChatGptService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  async extractRepairItems(prompt, extractedText) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts repair items from Property Inspection Contingency Removal Addendum (PICRA) documents. You must respond with only valid JSON arrays containing repair item objects.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: messages,
          temperature: 0.1, // Low temperature for consistent JSON output
          max_tokens: 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const content = response.data.choices[0].message.content;
      
      // Try to extract JSON from the response
      let jsonResponse;
      try {
        // Look for JSON in the response (sometimes ChatGPT adds extra text)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0]);
        } else {
          jsonResponse = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Failed to parse ChatGPT response as JSON:', parseError);
        console.log('Raw response:', content);
        
        // Return a structured error response
        return {
          success: false,
          error: 'Failed to parse ChatGPT response as valid JSON',
          rawResponse: content
        };
      }

      return {
        success: true,
        response: JSON.stringify(jsonResponse),
        structuredData: jsonResponse
      };

    } catch (error) {
      console.error('ChatGPT API error:', error);
      
      if (error.response) {
        // API error response
        return {
          success: false,
          error: `OpenAI API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'Network error: Unable to reach OpenAI API'
        };
      } else {
        // Other error
        return {
          success: false,
          error: error.message || 'Unknown error occurred'
        };
      }
    }
  }

  // Alternative method using a more specific prompt for repair items
  async extractRepairItemsStructured(extractedText) {
    const prompt = `Extract all repair items from this Property Inspection Contingency Removal Addendum (PICRA) document. 

Please format the response as a JSON array with the following structure for each repair item:
{
  "category": "System or area (e.g., HVAC, Plumbing, Electrical, Exterior, etc.)",
  "issue": "Specific issue or problem description",
  "action": "Required action or repair needed",
  "location": "Specific location if mentioned",
  "priority": "High/Medium/Low based on safety and functionality",
  "estimated_cost": "Rough cost estimate if mentioned, otherwise null"
}

Focus only on the repair items section. If there are no repair items or if the document indicates no repairs are needed, return an empty array.

Document text:
${extractedText}

Please respond with only the JSON array, no additional text.`;

    return this.extractRepairItems(prompt, extractedText);
  }

  // Method to validate and clean repair items
  validateRepairItems(items) {
    if (!Array.isArray(items)) {
      return {
        valid: false,
        error: 'Response is not an array'
      };
    }

    const requiredFields = ['category', 'issue', 'action'];
    const validItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check required fields
      const missingFields = requiredFields.filter(field => !item[field]);
      if (missingFields.length > 0) {
        console.warn(`Item ${i} missing required fields:`, missingFields);
        continue;
      }

      // Clean and validate the item
      const cleanItem = {
        category: this.cleanText(item.category),
        issue: this.cleanText(item.issue),
        action: this.cleanText(item.action),
        location: item.location ? this.cleanText(item.location) : null,
        priority: this.validatePriority(item.priority),
        estimated_cost: item.estimated_cost ? this.cleanText(item.estimated_cost) : null
      };

      validItems.push(cleanItem);
    }

    return {
      valid: true,
      items: validItems
    };
  }

  cleanText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  validatePriority(priority) {
    if (!priority) return 'Medium';
    
    const validPriorities = ['High', 'Medium', 'Low'];
    const normalized = priority.trim().toLowerCase();
    
    for (const valid of validPriorities) {
      if (normalized === valid.toLowerCase()) {
        return valid;
      }
    }
    
    return 'Medium'; // Default to Medium if invalid
  }
}

module.exports = ChatGptService;
