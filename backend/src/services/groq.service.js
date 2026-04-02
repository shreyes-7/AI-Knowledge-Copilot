const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Groq LLM Service
 * Handles LLM inference using Groq API
 */
class GroqService {
  constructor() {
    this.provider = config.MODEL_PROVIDER;
    this.apiKey = config.GROQ_API_KEY;
    this.model = config.GROQ_MODEL;
    this.temperature = config.GROQ_TEMPERATURE;
    this.maxTokens = config.GROQ_MAX_TOKENS;
    this.apiUrl = 'https://api.groq.com/openai/v1';
    this.timeout = config.REQUEST_TIMEOUT_MS;

    if (!this.apiKey) {
      logger.warn('GROQ_API_KEY not configured');
    }
  }

  /**
   * Generate completion using Groq
   */
  async generateCompletion(messages, options = {}) {
    try {
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Messages must be a non-empty array');
      }

      const temperature = options.temperature !== undefined ? options.temperature : this.temperature;
      const maxTokens = options.maxTokens || this.maxTokens;

      logger.debug('Calling Groq API', {
        model: this.model,
        messageCount: messages.length,
        temperature,
        maxTokens,
      });

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 0.9,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      );

      const answer = response.data.choices[0]?.message?.content;

      if (!answer) {
        throw new Error('Invalid response from Groq API');
      }

      logger.info('Groq API call completed', {
        model: this.model,
        tokens: response.data.usage?.total_tokens,
      });

      return {
        answer,
        usage: response.data.usage,
        model: this.model,
      };
    } catch (error) {
      logger.error('Groq API call failed', {
        error: error.message,
        model: this.model,
        status: error.response?.status,
      });

      // Provide more detailed error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid Groq API key');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded on Groq API');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Groq API request timeout');
      }

      throw error;
    }
  }

  /**
   * Generate RAG response with context
   */
  async generateRAGResponse(query, context, options = {}) {
    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Query must be a non-empty string');
      }

      if (!context || typeof context !== 'string') {
        throw new Error('Context must be a non-empty string');
      }

      logger.info('Generating RAG response', {
        queryLength: query.length,
        contextLength: context.length,
      });

      // Build system prompt for RAG
      const systemPrompt = `You are a helpful assistant answering questions from retrieved documents.

Use the provided context to write clear, explanatory, and detailed answers.
Prefer a natural explanation over a vague summary.
When possible:
- start with a direct answer in simple language
- explain the concept, significance, and important details
- synthesize across multiple context snippets if they are related
- mention uncertainty only if the context is genuinely insufficient

Rules:
- Do not invent facts that are not supported by the context
- Do not say "the context says" or "the context provided" unless necessary
- If the context is partial, give the best supported explanation first, then briefly note what is missing
- If the answer truly is not available, respond with "I don't have enough information to answer this question based on the available documents."

Context:
${context}`;

      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: query,
        },
      ];

      const result = await this.generateCompletion(messages, options);

      return {
        answer: result.answer,
        usage: result.usage,
        model: result.model,
      };
    } catch (error) {
      logger.error('RAG response generation failed', {
        error: error.message,
        queryLength: query?.length || 0,
        contextLength: context?.length || 0,
      });
      throw error;
    }
  }

  /**
   * Generate streaming completion (placeholder for future implementation)
   */
  async generateCompletionStream(messages, options = {}) {
    try {
      logger.warn('Streaming is not yet implemented');
      return await this.generateCompletion(messages, options);
    } catch (error) {
      logger.error('Streaming completion failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Count tokens in text (estimation)
   */
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Validate if text fits within token limits
   */
  validateTokenLimit(text, maxTokens) {
    const estimatedTokens = this.estimateTokens(text);
    return estimatedTokens <= maxTokens;
  }
}

module.exports = GroqService;
