const logger = require('./logger');

/**
 * Text Chunker Utility
 * Splits large texts into smaller chunks with overlap
 */
class TextChunker {
  constructor(options = {}) {
    // Token estimation: roughly 1 token per 4 characters
    this.chunkSize = options.chunkSize || 500;
    this.overlapSize = options.overlapSize || 100;
    this.charPerToken = options.charPerToken || 4;
  }

  /**
   * Convert tokens to estimated characters
   */
  tokensToChars(tokens) {
    return tokens * this.charPerToken;
  }

  /**
   * Convert characters to estimated tokens
   */
  charsToTokens(chars) {
    return Math.ceil(chars / this.charPerToken);
  }

  /**
   * Clean text
   */
  cleanText(text) {
    if (typeof text !== 'string') {
      return '';
    }

    return text
      .normalize('NFKD') // Normalize unicode
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Split text into chunks with overlap
   */
  chunk(text) {
    if (!text || typeof text !== 'string') {
      logger.warn('Invalid text provided for chunking');
      return [];
    }

    // Clean text
    const cleanedText = this.cleanText(text);

    if (cleanedText.length === 0) {
      return [];
    }

    const chunkSizeChars = this.tokensToChars(this.chunkSize);
    const overlapSizeChars = this.tokensToChars(this.overlapSize);

    const chunks = [];
    let startIdx = 0;

    while (startIdx < cleanedText.length) {
      let endIdx = startIdx + chunkSizeChars;

      // Try to break at a sentence boundary
      if (endIdx < cleanedText.length) {
        const lastPeriod = cleanedText.lastIndexOf('.', endIdx);
        const lastNewline = cleanedText.lastIndexOf('\n', endIdx);
        const lastSpace = cleanedText.lastIndexOf(' ', endIdx);

        if (lastPeriod > startIdx + chunkSizeChars * 0.5) {
          endIdx = lastPeriod + 1;
        } else if (lastNewline > startIdx + chunkSizeChars * 0.5) {
          endIdx = lastNewline + 1;
        } else if (lastSpace > startIdx + chunkSizeChars * 0.5) {
          endIdx = lastSpace + 1;
        }
      } else {
        endIdx = cleanedText.length;
      }

      const chunk = cleanedText.substring(startIdx, endIdx).trim();

      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // Move start position by chunk size minus overlap
      startIdx = endIdx - overlapSizeChars;
      
      // Ensure we're making progress
      if (startIdx <= chunks.length * chunkSizeChars - chunkSizeChars) {
        startIdx = chunks.length * chunkSizeChars - chunkSizeChars;
      }
    }

    logger.debug('Text chunked successfully', {
      originalLength: text.length,
      cleanedLength: cleanedText.length,
      chunkCount: chunks.length,
      avgChunkSize: Math.round(cleanedText.length / chunks.length),
    });

    return chunks;
  }

  /**
   * Chunk multiple texts
   */
  chunkBatch(texts) {
    if (!Array.isArray(texts)) {
      return [];
    }

    return texts.flatMap(text => this.chunk(text));
  }
}

module.exports = TextChunker;
