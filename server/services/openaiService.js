const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.client = null;
    this.apiKey = process.env.OPENAI_API_KEY;
    
    this.initializeClient();
  }

  initializeClient() {
    try {
      if (!this.apiKey) {
        console.log('⚠️  OpenAI API key not found. OpenAI features will be disabled.');
        return;
      }

      this.client = new OpenAI({
        apiKey: this.apiKey
      });

      console.log('✅ OpenAI service initialized');
    } catch (error) {
      console.error('❌ Error initializing OpenAI service:', error);
    }
  }

  isAvailable() {
    return this.client && this.apiKey;
  }

  async processPICRASection(extractedText, propertyAddress) {
    if (!this.isAvailable()) {
      throw new Error('OpenAI service not available');
    }

    try {
      console.log('🤖 Processing PICRA section with OpenAI...');

      const prompt = this.createPICRAPrompt(extractedText, propertyAddress);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional property inspector and estimator. Your task is to analyze PICRA (Property Inspection and Condition Report Analysis) documents and extract repair items with detailed estimates. Be thorough, accurate, and professional in your analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      
      console.log('✅ OpenAI processing completed');
      
      return this.parseOpenAIResponse(response);
    } catch (error) {
      console.error('❌ Error processing with OpenAI:', error);
      throw error;
    }
  }

  createPICRAPrompt(extractedText, propertyAddress) {
    return `
Please analyze the following PICRA (Property Inspection and Condition Report Analysis) document section and create a detailed breakdown of repair items with estimates.

Property Address: ${propertyAddress || 'Not specified'}

Extracted Text from "Custom Scheme of Repairs" section:
${extractedText || 'No repairs section found'}

Please provide your analysis in the following JSON format:

{
  "summary": "Brief summary of the property condition and overall assessment",
  "totalEstimatedCost": 0,
  "repairItems": [
    {
      "category": "Category of repair (e.g., Roofing, Plumbing, Electrical, etc.)",
      "description": "Detailed description of the repair needed",
      "priority": "high|medium|low",
      "estimatedCost": 0,
      "materials": "List of required materials",
      "laborHours": 0,
      "notes": "Additional notes or recommendations"
    }
  ],
  "recommendations": [
    "List of general recommendations for the property"
  ],
  "timeline": "Estimated timeline for completing all repairs",
  "riskAssessment": "Assessment of any immediate risks or safety concerns"
}

Guidelines:
1. Be specific and detailed in descriptions
2. Provide realistic cost estimates
3. Categorize repairs by priority (high, medium, low)
4. Include safety concerns and immediate risks
5. Consider local building codes and standards
6. Provide practical recommendations
7. Estimate realistic timelines

Please ensure all monetary values are in USD and all measurements are in standard units.
`;
  }

  parseOpenAIResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: parsed,
          rawResponse: response
        };
      } else {
        // If no JSON found, return the raw response
        return {
          success: false,
          data: null,
          rawResponse: response,
          error: 'No valid JSON found in response'
        };
      }
    } catch (error) {
      console.error('❌ Error parsing OpenAI response:', error);
      return {
        success: false,
        data: null,
        rawResponse: response,
        error: error.message
      };
    }
  }

  async generateQuoteLineItems(repairItems) {
    if (!this.isAvailable()) {
      throw new Error('OpenAI service not available');
    }

    try {
      console.log('💰 Generating quote line items with OpenAI...');

      const prompt = this.createQuotePrompt(repairItems);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional contractor and estimator. Your task is to convert repair items into detailed quote line items with accurate pricing and specifications."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      const response = completion.choices[0].message.content;
      
      console.log('✅ Quote generation completed');
      
      return this.parseQuoteResponse(response);
    } catch (error) {
      console.error('❌ Error generating quote:', error);
      throw error;
    }
  }

  createQuotePrompt(repairItems) {
    return `
Please convert the following repair items into detailed quote line items with accurate pricing and specifications.

Repair Items:
${JSON.stringify(repairItems, null, 2)}

Please provide your response in the following JSON format:

{
  "quoteItems": [
    {
      "itemNumber": "Q-001",
      "description": "Detailed description of the work to be performed",
      "quantity": "1 EA",
      "unitPrice": 0,
      "totalPrice": 0,
      "specifications": "Detailed specifications and requirements",
      "materials": "List of materials included",
      "labor": "Labor description and hours",
      "warranty": "Warranty information",
      "notes": "Additional notes or conditions"
    }
  ],
  "subtotal": 0,
  "tax": 0,
  "total": 0,
  "paymentTerms": "Payment terms and conditions",
  "validUntil": "Quote validity period",
  "termsAndConditions": "General terms and conditions"
}

Guidelines:
1. Use standard construction terminology
2. Provide detailed specifications for each item
3. Include realistic pricing based on current market rates
4. Specify quantities and units clearly
5. Include warranty information where applicable
6. Add relevant terms and conditions
7. Calculate taxes appropriately (assume 8.5% sales tax)
8. Set reasonable payment terms
9. Include quote validity period (30 days recommended)

Please ensure all monetary values are in USD.
`;
  }

  parseQuoteResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: parsed,
          rawResponse: response
        };
      } else {
        return {
          success: false,
          data: null,
          rawResponse: response,
          error: 'No valid JSON found in response'
        };
      }
    } catch (error) {
      console.error('❌ Error parsing quote response:', error);
      return {
        success: false,
        data: null,
        rawResponse: response,
        error: error.message
      };
    }
  }
}

module.exports = OpenAIService; 