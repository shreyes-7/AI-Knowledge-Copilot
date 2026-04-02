const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const logger = require('./logger');

/**
 * Text Extractor Utility
 * Extracts text from various file formats
 */
class TextExtractor {
  /**
   * Extract text from a file based on its type
   */
  async extractText(filePath, fileType) {
    try {
      logger.info('Extracting text from file', { filePath, fileType });

      switch (fileType.toLowerCase()) {
        case 'pdf':
          return await this.extractFromPDF(filePath);
        case 'txt':
        case 'md':
        case 'markdown':
          return await this.extractFromText(filePath);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      logger.error('Text extraction failed', {
        filePath,
        fileType,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Extract text from PDF
   */
  async extractFromPDF(filePath) {
    try {
      const data = await fs.readFile(filePath);
      const pdfData = await pdfParse(data);
      const text = pdfData.text;

      logger.info('PDF text extracted', {
        pages: pdfData.numpages,
        textLength: text.length,
      });

      return text;
    } catch (error) {
      logger.error('PDF extraction failed', { error: error.message });
      throw new Error(`Failed to extract PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from plain text or markdown
   */
  async extractFromText(filePath) {
    try {
      const text = await fs.readFile(filePath, 'utf-8');
      logger.info('Text file extracted', { textLength: text.length });
      return text;
    } catch (error) {
      logger.error('Text file extraction failed', { error: error.message });
      throw new Error(`Failed to extract text file: ${error.message}`);
    }
  }

  /**
   * Extract filename without extension
   */
  getFileName(filePath) {
    const name = filePath.split('/').pop().split('\\').pop();
    return name.replace(/\.[^/.]+$/, '');
  }

  /**
   * Extract file extension
   */
  getFileExtension(filePath) {
    return filePath.split('.').pop().toLowerCase();
  }
}

module.exports = TextExtractor;
