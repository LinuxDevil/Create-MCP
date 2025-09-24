import { ProjectConfig } from '../prompts.js';

export function generateServiceExample(config: ProjectConfig): string {
  return `import { Tool, Resource } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';

export interface ServerStatus {
  uptime: number;
  version: string;
  name: string;
  timestamp: string;
  memory: {
    used: number;
    total: number;
    external: number;
    buffers: number;
  };
  process: {
    pid: number;
    platform: string;
    arch: string;
    nodeVersion: string;
  };
  tools: string[];
  resources: string[];
  prompts: string[];
}

export interface DataProcessingResult {
  type: 'json' | 'csv' | 'text';
  originalSize: number;
  processedSize: number;
  data: any;
  metadata: {
    processingTime: number;
    timestamp: string;
  };
}

/**
 * Example service demonstrating business logic separation
 * from the MCP server implementation. This service provides
 * utilities for system monitoring and data processing.
 */
export class ExampleService {
  private startTime: number;
  private processingStats: Map<string, number> = new Map();

  constructor() {
    this.startTime = Date.now();
    logger.info('ExampleService initialized');
  }

  /**
   * Get comprehensive server status including system metrics
   */
  async getStatus(): Promise<ServerStatus> {
    logger.debug('Getting server status');

    const memUsage = process.memoryUsage();
    
    return {
      uptime: Date.now() - this.startTime,
      version: '1.0.0',
      name: '${config.name}',
      timestamp: new Date().toISOString(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        buffers: Math.round(memUsage.arrayBuffers / 1024 / 1024) // MB
      },
      process: {
        pid: process.pid,
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      },
      tools: ['echo', 'calculate', 'server-status', 'process-data'],
      resources: ['info://server', 'config://current'],
      prompts: ['analyze-data']
    };
  }

  /**
   * Process data in various formats with comprehensive error handling
   */
  async processData(data: string, format: 'json' | 'csv' | 'text'): Promise<DataProcessingResult> {
    const startTime = Date.now();
    logger.info(\`Processing \${format} data (\${data.length} characters)\`);

    try {
      let processedData: any;
      const originalSize = data.length;

      switch (format) {
        case 'json':
          processedData = this.processJsonData(data);
          break;
        case 'csv':
          processedData = this.processCsvData(data);
          break;
        case 'text':
          processedData = this.processTextData(data);
          break;
        default:
          throw new Error(\`Unsupported format: \${format}\`);
      }

      const processingTime = Date.now() - startTime;
      const processedSize = JSON.stringify(processedData).length;

      // Update processing statistics
      const currentCount = this.processingStats.get(format) || 0;
      this.processingStats.set(format, currentCount + 1);

      logger.info(\`Successfully processed \${format} data in \${processingTime}ms\`);

      return {
        type: format,
        originalSize,
        processedSize,
        data: processedData,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error(\`Error processing \${format} data:\`, error);
      throw new Error(\`Failed to process \${format} data: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): Record<string, number> {
    return Object.fromEntries(this.processingStats);
  }

  /**
   * Reset processing statistics
   */
  resetProcessingStats(): void {
    this.processingStats.clear();
    logger.info('Processing statistics reset');
  }

  private processJsonData(data: string): any {
    try {
      const parsed = JSON.parse(data);
      
      // Add metadata about the JSON structure
      const result = {
        originalData: parsed,
        analysis: this.analyzeJsonStructure(parsed)
      };

      return result;
    } catch (error) {
      throw new Error(\`Invalid JSON format: \${error instanceof Error ? error.message : 'Parse error'}\`);
    }
  }

  private processCsvData(data: string): any {
    const lines = data.trim().split('\\n');
    if (lines.length === 0) {
      return { rows: [], headers: [], analysis: { rowCount: 0, columnCount: 0 } };
    }

    const headers = this.parseCsvLine(lines[0]);
    const rows = lines.slice(1).map((line, index) => {
      try {
        const values = this.parseCsvLine(line);
        const row: any = { _rowIndex: index + 1 };
        
        headers.forEach((header, colIndex) => {
          row[header] = values[colIndex] || '';
        });
        
        return row;
      } catch (error) {
        throw new Error(\`Error parsing CSV row \${index + 2}: \${error instanceof Error ? error.message : 'Parse error'}\`);
      }
    });

    return {
      headers,
      rows,
      analysis: {
        rowCount: rows.length,
        columnCount: headers.length,
        emptyRows: rows.filter(row => Object.values(row).every(val => val === '')).length
      }
    };
  }

  private processTextData(data: string): any {
    const lines = data.split('\\n');
    const words = data.split(/\\s+/).filter(word => word.length > 0);
    const characters = data.length;
    const paragraphs = data.split(/\\n\\s*\\n/).filter(p => p.trim().length > 0);

    // Basic text analysis
    const wordFrequency = words.reduce((freq: Record<string, number>, word) => {
      const cleanWord = word.toLowerCase().replace(/[^\\w]/g, '');
      if (cleanWord.length > 0) {
        freq[cleanWord] = (freq[cleanWord] || 0) + 1;
      }
      return freq;
    }, {});

    // Find most common words
    const topWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return {
      content: data,
      statistics: {
        characters,
        charactersNoSpaces: data.replace(/\\s/g, '').length,
        words: words.length,
        lines: lines.length,
        paragraphs: paragraphs.length,
        averageWordsPerLine: Math.round((words.length / lines.length) * 100) / 100,
        averageCharactersPerWord: Math.round((characters / words.length) * 100) / 100
      },
      analysis: {
        topWords,
        uniqueWords: Object.keys(wordFrequency).length,
        readingTimeMinutes: Math.ceil(words.length / 200) // Assuming 200 WPM reading speed
      }
    };
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private analyzeJsonStructure(obj: any, depth = 0): any {
    if (depth > 10) return { type: 'deep-nested', depth };

    if (obj === null) return { type: 'null' };
    if (typeof obj === 'boolean') return { type: 'boolean', value: obj };
    if (typeof obj === 'number') return { type: 'number', value: obj };
    if (typeof obj === 'string') return { type: 'string', length: obj.length };
    
    if (Array.isArray(obj)) {
      return {
        type: 'array',
        length: obj.length,
        elementTypes: obj.length > 0 ? this.analyzeJsonStructure(obj[0], depth + 1) : null
      };
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      return {
        type: 'object',
        keyCount: keys.length,
        keys: keys.slice(0, 10), // Limit to first 10 keys
        structure: keys.slice(0, 5).reduce((acc: any, key) => {
          acc[key] = this.analyzeJsonStructure(obj[key], depth + 1);
          return acc;
        }, {})
      };
    }
    
    return { type: typeof obj };
  }

  /**
   * Cleanup method for proper resource disposal
   */
  dispose(): void {
    logger.info('ExampleService disposed');
    this.processingStats.clear();
  }
}
`;
}