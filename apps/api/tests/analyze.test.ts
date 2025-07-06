import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import app from '../src/index';

describe('Analysis API', () => {
  describe('POST /api/v1/analyze', () => {
    it('should analyze a simple conversation', async () => {
      const conversation = {
        messages: [
          {
            role: 'user',
            content: 'I need help with my React component. It\'s not rendering properly.',
            index: 0,
            timestamp: new Date().toISOString()
          },
          {
            role: 'assistant',
            content: 'I\'d be happy to help you with your React component. Can you share the code and describe what specific issue you\'re experiencing?',
            index: 1,
            timestamp: new Date().toISOString()
          }
        ],
        platform: 'claude'
      };

      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ conversation })
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('messages');
      expect(response.body).toHaveProperty('scores');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.messages).toHaveLength(2);
      expect(response.body.scores).toHaveLength(2);
      
      // Check score structure
      const score = response.body.scores[0];
      expect(score).toHaveProperty('overall');
      expect(score).toHaveProperty('dimensions');
      expect(score.dimensions).toHaveProperty('strategic');
      expect(score.dimensions).toHaveProperty('tactical');
      expect(score.dimensions).toHaveProperty('cognitive');
      expect(score.dimensions).toHaveProperty('innovation');
      expect(score).toHaveProperty('classification');
      expect(score).toHaveProperty('confidence');
    });

    it('should reject empty conversation', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ conversation: { messages: [] } })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject conversation with too many messages', async () => {
      const messages = Array.from({ length: 101 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        index: i,
        timestamp: new Date().toISOString()
      }));

      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ conversation: { messages } })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many messages');
    });

    it('should handle different analysis depths', async () => {
      const conversation = {
        messages: [
          {
            role: 'user',
            content: 'Quick question about JavaScript arrays',
            index: 0,
            timestamp: new Date().toISOString()
          }
        ]
      };

      const quickResponse = await request(app)
        .post('/api/v1/analyze')
        .send({ 
          conversation,
          options: { analysisDepth: 'quick' }
        })
        .expect(200);

      const deepResponse = await request(app)
        .post('/api/v1/analyze')
        .send({ 
          conversation,
          options: { analysisDepth: 'deep' }
        })
        .expect(200);

      expect(quickResponse.body.metadata.analysisDepth).toBe('quick');
      expect(deepResponse.body.metadata.analysisDepth).toBe('deep');
    });

    it('should detect patterns when enabled', async () => {
      const conversation = {
        messages: Array.from({ length: 6 }, (_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i} with varying quality`,
          index: i,
          timestamp: new Date().toISOString()
        }))
      };

      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ 
          conversation,
          options: { enablePatternDetection: true }
        })
        .expect(200);

      expect(response.body.summary).toHaveProperty('patterns');
      expect(Array.isArray(response.body.summary.patterns)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const conversation = {
        messages: [
          {
            role: 'user',
            content: 'Test message',
            index: 0,
            timestamp: new Date().toISOString()
          }
        ]
      };

      // Make multiple requests quickly
      const requests = Array.from({ length: 15 }, () =>
        request(app)
          .post('/api/v1/analyze')
          .send({ conversation })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);
  });
});

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version');
  });
});

describe('404 Handling', () => {
  it('should return 404 for unknown endpoints', async () => {
    const response = await request(app)
      .get('/api/v1/unknown')
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});

