// lib/tokenUtils.ts (Updated with cleanup methods)
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TokenUtils {
  /**
   * Generate secure random token
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create email verification token
   */
  static async createVerificationToken(userId: string): Promise<string> {
    try {
      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.verificationToken.create({
        data: {
          token,
          userId,
          expiresAt,
          type: 'EMAIL_VERIFICATION',
        },
      });

      return token;
    } catch (error) {
      console.error('Error creating verification token:', error);
      throw new Error('Failed to create verification token');
    }
  }

  /**
   * Create password reset token
   */
  static async createPasswordResetToken(userId: string): Promise<string> {
    try {
      // Invalidate any existing reset tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { 
          userId,
          used: false,
          expiresAt: { gt: new Date() }
        },
        data: { used: true },
      });

      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          token,
          userId,
          expiresAt,
        },
      });

      return token;
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw new Error('Failed to create password reset token');
    }
  }

  /**
   * Verify email verification token
   */
  static async verifyEmailToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    try {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!verificationToken) {
        return { valid: false, error: 'Invalid verification token' };
      }

      if (verificationToken.used) {
        return { valid: false, error: 'Verification token has already been used' };
      }

      if (verificationToken.expiresAt < new Date()) {
        return { valid: false, error: 'Verification token has expired' };
      }

      if (verificationToken.user.isEmailVerified) {
        return { valid: false, error: 'Email is already verified' };
      }

      // Mark token as used
      await prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });

      return { valid: true, userId: verificationToken.userId };
    } catch (error) {
      console.error('Error verifying email token:', error);
      return { valid: false, error: 'Failed to verify token' };
    }
  }

  /**
   * Verify password reset token
   */
  static async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        return { valid: false, error: 'Invalid reset token' };
      }

      if (resetToken.used) {
        return { valid: false, error: 'Reset token has already been used' };
      }

      if (resetToken.expiresAt < new Date()) {
        return { valid: false, error: 'Reset token has expired' };
      }

      return { valid: true, userId: resetToken.userId };
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return { valid: false, error: 'Failed to verify token' };
    }
  }

  /**
   * Mark password reset token as used
   */
  static async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    try {
      await prisma.passwordResetToken.updateMany({
        where: { token },
        data: { used: true },
      });
    } catch (error) {
      console.error('Error marking password reset token as used:', error);
      throw new Error('Failed to mark token as used');
    }
  }

  /**
   * Clean up expired tokens (Enhanced version)
   */
  static async cleanupExpiredTokens(): Promise<{
    deletedVerificationTokens: number;
    deletedPasswordResetTokens: number;
    totalDeleted: number;
  }> {
    try {
      const now = new Date();
      
      console.log('Starting token cleanup process...');

      // Delete expired verification tokens
      const deletedVerificationTokens = await prisma.verificationToken.deleteMany({
        where: { 
          expiresAt: { lt: now }
        },
      });

      // Delete expired password reset tokens
      const deletedPasswordResetTokens = await prisma.passwordResetToken.deleteMany({
        where: { 
          expiresAt: { lt: now }
        },
      });

      const totalDeleted = deletedVerificationTokens.count + deletedPasswordResetTokens.count;

      console.log('Token cleanup completed:', {
        deletedVerificationTokens: deletedVerificationTokens.count,
        deletedPasswordResetTokens: deletedPasswordResetTokens.count,
        totalDeleted,
        timestamp: new Date().toISOString()
      });

      return {
        deletedVerificationTokens: deletedVerificationTokens.count,
        deletedPasswordResetTokens: deletedPasswordResetTokens.count,
        totalDeleted
      };
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      throw new Error('Failed to cleanup expired tokens');
    }
  }

  /**
   * Clean up used tokens (additional cleanup for used tokens older than 7 days)
   */
  static async cleanupUsedTokens(): Promise<{
    deletedVerificationTokens: number;
    deletedPasswordResetTokens: number;
    totalDeleted: number;
  }> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      console.log('Starting used token cleanup process...');

      // Delete used verification tokens older than 7 days
      const deletedVerificationTokens = await prisma.verificationToken.deleteMany({
        where: { 
          used: true,
          createdAt: { lt: sevenDaysAgo }
        },
      });

      // Delete used password reset tokens older than 7 days
      const deletedPasswordResetTokens = await prisma.passwordResetToken.deleteMany({
        where: { 
          used: true,
          createdAt: { lt: sevenDaysAgo }
        },
      });

      const totalDeleted = deletedVerificationTokens.count + deletedPasswordResetTokens.count;

      console.log('Used token cleanup completed:', {
        deletedVerificationTokens: deletedVerificationTokens.count,
        deletedPasswordResetTokens: deletedPasswordResetTokens.count,
        totalDeleted,
        timestamp: new Date().toISOString()
      });

      return {
        deletedVerificationTokens: deletedVerificationTokens.count,
        deletedPasswordResetTokens: deletedPasswordResetTokens.count,
        totalDeleted
      };
    } catch (error) {
      console.error('Error cleaning up used tokens:', error);
      throw new Error('Failed to cleanup used tokens');
    }
  }

  /**
   * Get token statistics for monitoring
   */
  static async getTokenStatistics(): Promise<{
    verificationTokens: {
      total: number;
      expired: number;
      used: number;
      active: number;
    };
    passwordResetTokens: {
      total: number;
      expired: number;
      used: number;
      active: number;
    };
  }> {
    try {
      const now = new Date();

      // Verification token stats
      const [
        totalVerificationTokens,
        expiredVerificationTokens,
        usedVerificationTokens
      ] = await Promise.all([
        prisma.verificationToken.count(),
        prisma.verificationToken.count({ where: { expiresAt: { lt: now } } }),
        prisma.verificationToken.count({ where: { used: true } })
      ]);

      // Password reset token stats
      const [
        totalPasswordResetTokens,
        expiredPasswordResetTokens,
        usedPasswordResetTokens
      ] = await Promise.all([
        prisma.passwordResetToken.count(),
        prisma.passwordResetToken.count({ where: { expiresAt: { lt: now } } }),
        prisma.passwordResetToken.count({ where: { used: true } })
      ]);

      return {
        verificationTokens: {
          total: totalVerificationTokens,
          expired: expiredVerificationTokens,
          used: usedVerificationTokens,
          active: totalVerificationTokens - expiredVerificationTokens - usedVerificationTokens
        },
        passwordResetTokens: {
          total: totalPasswordResetTokens,
          expired: expiredPasswordResetTokens,
          used: usedPasswordResetTokens,
          active: totalPasswordResetTokens - expiredPasswordResetTokens - usedPasswordResetTokens
        }
      };
    } catch (error) {
      console.error('Error getting token statistics:', error);
      throw new Error('Failed to get token statistics');
    }
  }

  /**
   * Comprehensive cleanup - both expired and old used tokens
   */
  static async performFullCleanup(): Promise<{
    expiredCleanup: {
      deletedVerificationTokens: number;
      deletedPasswordResetTokens: number;
      totalDeleted: number;
    };
    usedCleanup: {
      deletedVerificationTokens: number;
      deletedPasswordResetTokens: number;
      totalDeleted: number;
    };
    grandTotal: number;
  }> {
    try {
      console.log('Starting comprehensive token cleanup...');

      const expiredCleanup = await this.cleanupExpiredTokens();
      const usedCleanup = await this.cleanupUsedTokens();

      const grandTotal = expiredCleanup.totalDeleted + usedCleanup.totalDeleted;

      console.log('Comprehensive cleanup completed:', {
        expiredCleanup,
        usedCleanup,
        grandTotal,
        timestamp: new Date().toISOString()
      });

      return {
        expiredCleanup,
        usedCleanup,
        grandTotal
      };
    } catch (error) {
      console.error('Error performing full cleanup:', error);
      throw new Error('Failed to perform full cleanup');
    }
  }

  /**
   * Resend verification email (with rate limiting)
   */
  static async canResendVerificationEmail(userId: string): Promise<{ canResend: boolean; waitTime?: number }> {
    try {
      const lastToken = await prisma.verificationToken.findFirst({
        where: { 
          userId,
          type: 'EMAIL_VERIFICATION',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!lastToken) {
        return { canResend: true };
      }

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastToken.createdAt > fiveMinutesAgo) {
        const waitTime = Math.ceil((lastToken.createdAt.getTime() + 5 * 60 * 1000 - Date.now()) / 1000);
        return { canResend: false, waitTime };
      }

      return { canResend: true };
    } catch (error) {
      console.error('Error checking resend eligibility:', error);
      return { canResend: false };
    }
  }
}