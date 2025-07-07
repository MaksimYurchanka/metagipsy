import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../lib/config';
import { logger } from '../lib/logger';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey
);

// Get current user profile
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK
      logger.error('Failed to get user profile', { error, userId: req.user!.id });
      return res.status(500).json({
        error: 'Failed to get user profile'
      });
    }

    res.json({
      user: {
        id: req.user!.id,
        email: req.user!.email,
        role: req.user!.role,
        profile: profile || null
      }
    });
  } catch (error) {
    logger.error('Auth me endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { displayName, preferences } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: req.user!.id,
        display_name: displayName,
        preferences: preferences || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to update user profile', { error, userId: req.user!.id });
      return res.status(500).json({
        error: 'Failed to update profile'
      });
    }

    res.json({
      profile: data
    });
  } catch (error) {
    logger.error('Profile update endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Delete user account
router.delete('/account', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    // Delete user data from our database
    await Promise.all([
      supabase.from('profiles').delete().eq('id', req.user!.id),
      // Note: Sessions and messages will be cascade deleted via foreign key constraints
    ]);

    // Delete user from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(req.user!.id);

    if (error) {
      logger.error('Failed to delete user account', { error, userId: req.user!.id });
      return res.status(500).json({
        error: 'Failed to delete account'
      });
    }

    logger.info('User account deleted', { userId: req.user!.id });
    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Account deletion endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get user usage statistics
router.get('/usage', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, message_count, created_at')
      .eq('user_id', req.user!.id);

    if (error) {
      logger.error('Failed to get user usage', { error, userId: req.user!.id });
      return res.status(500).json({
        error: 'Failed to get usage statistics'
      });
    }

    const totalSessions = sessions?.length || 0;
    const totalMessages = sessions?.reduce((sum, s) => sum + (s.message_count || 0), 0) || 0;
    
    // Calculate usage for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyUsage = sessions?.filter(s => 
      new Date(s.created_at) >= currentMonth
    ) || [];

    res.json({
      usage: {
        totalSessions,
        totalMessages,
        monthlyUsage: {
          sessions: monthlyUsage.length,
          messages: monthlyUsage.reduce((sum, s) => sum + (s.message_count || 0), 0)
        },
        limits: {
          // FIXED: Changed from sessionsPerMonth to maxSessionsPerMonth
          sessions: config.limits.maxSessionsPerMonth,
          // FIXED: Changed from messagesPerMonth to maxMessagesPerMonth  
          messages: config.limits.maxMessagesPerMonth
        }
      }
    });
  } catch (error) {
    logger.error('Usage endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;