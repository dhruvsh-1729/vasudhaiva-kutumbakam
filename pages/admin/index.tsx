// pages/admin/token-cleanup.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';

interface TokenStats {
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
}

interface CleanupResult {
  deletedVerificationTokens: number;
  deletedPasswordResetTokens: number;
  totalDeleted: number;
}

const TokenCleanupDashboard: React.FC = () => {
  const [adminToken, setAdminToken] = useState<string>('');
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [isCleaningUp, setIsCleaningUp] = useState<boolean>(false);
  const [lastCleanup, setLastCleanup] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load admin token from localStorage if available
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
    }
  }, []);

  const callCleanupAPI = async (action: string): Promise<any> => {
    if (!adminToken.trim()) {
      throw new Error('Admin token is required');
    }

    const response = await fetch(`/api/admin/cleanup-tokens?action=${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
  };

  const fetchStats = async (): Promise<void> => {
    setIsLoadingStats(true);
    setError('');

    try {
      const result = await callCleanupAPI('stats');
      setStats(result.data);
      
      // Save token for future use
      if (adminToken) {
        localStorage.setItem('admin_token', adminToken);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const performCleanup = async (type: 'expired' | 'used' | 'full'): Promise<void> => {
    setIsCleaningUp(true);
    setError('');

    try {
      const result = await callCleanupAPI(type);
      setLastCleanup({
        type,
        result: result.data,
        timestamp: new Date().toISOString()
      });
      
      // Refresh stats after cleanup
      await fetchStats();
      
      alert(`Cleanup completed! Removed ${
        type === 'full' 
          ? result.data.grandTotal 
          : result.data.totalDeleted
      } tokens.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Cleanup failed');
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <>
      <Head>
        <title>Token Cleanup Dashboard - VK Competition Admin</title>
      </Head>
      
      <div style={{ 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '30px' }}>
          Token Cleanup Dashboard
        </h1>
        
        {/* Admin Token Input */}
        <div style={{ 
          marginBottom: '30px', 
          padding: '20px', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ marginTop: '0', marginBottom: '15px' }}>Authentication</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="password"
              placeholder="Enter admin token"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={fetchStats}
              disabled={isLoadingStats || !adminToken.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoadingStats ? '#9ca3af' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoadingStats ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoadingStats ? 'Loading...' : 'Load Stats'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Token Statistics */}
        {stats && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Token Statistics</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Verification Tokens */}
              <div style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}>
                <h3 style={{ color: '#1f2937', marginTop: '0' }}>Email Verification Tokens</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>Total: <strong>{stats.verificationTokens.total}</strong></div>
                  <div>Active: <strong style={{ color: '#059669' }}>{stats.verificationTokens.active}</strong></div>
                  <div>Expired: <strong style={{ color: '#dc2626' }}>{stats.verificationTokens.expired}</strong></div>
                  <div>Used: <strong style={{ color: '#6b7280' }}>{stats.verificationTokens.used}</strong></div>
                </div>
              </div>

              {/* Password Reset Tokens */}
              <div style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}>
                <h3 style={{ color: '#1f2937', marginTop: '0' }}>Password Reset Tokens</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>Total: <strong>{stats.passwordResetTokens.total}</strong></div>
                  <div>Active: <strong style={{ color: '#059669' }}>{stats.passwordResetTokens.active}</strong></div>
                  <div>Expired: <strong style={{ color: '#dc2626' }}>{stats.passwordResetTokens.expired}</strong></div>
                  <div>Used: <strong style={{ color: '#6b7280' }}>{stats.passwordResetTokens.used}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cleanup Actions */}
        {stats && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Cleanup Actions</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              <button
                onClick={() => performCleanup('expired')}
                disabled={isCleaningUp}
                style={{
                  padding: '15px',
                  backgroundColor: isCleaningUp ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isCleaningUp ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Clean Expired Tokens
                <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>
                  Remove {stats.verificationTokens.expired + stats.passwordResetTokens.expired} expired tokens
                </div>
              </button>

              <button
                onClick={() => performCleanup('used')}
                disabled={isCleaningUp}
                style={{
                  padding: '15px',
                  backgroundColor: isCleaningUp ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isCleaningUp ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Clean Old Used Tokens
                <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>
                  Remove used tokens older than 7 days
                </div>
              </button>

              <button
                onClick={() => performCleanup('full')}
                disabled={isCleaningUp}
                style={{
                  padding: '15px',
                  backgroundColor: isCleaningUp ? '#9ca3af' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isCleaningUp ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Full Cleanup
                <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>
                  Clean both expired and old used tokens
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Last Cleanup Result */}
        {lastCleanup && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Last Cleanup Result</h2>
            
            <div style={{
              padding: '20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Type:</strong> {lastCleanup.type} cleanup
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Timestamp:</strong> {new Date(lastCleanup.timestamp).toLocaleString()}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Results:</strong>
              </div>
              <pre style={{ 
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {JSON.stringify(lastCleanup.result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        {/* <div style={{
          padding: '20px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#1e40af', marginTop: '0' }}>Instructions</h3>
          <ul style={{ color: '#1f2937', paddingLeft: '20px' }}>
            <li><strong>Admin Token:</strong> Set ADMIN_CLEANUP_TOKEN in your environment variables</li>
            <li><strong>Expired Tokens:</strong> Removes tokens that have passed their expiration date</li>
            <li><strong>Used Tokens:</strong> Removes successfully used tokens older than 7 days</li>
            <li><strong>Full Cleanup:</strong> Combines both expired and used token cleanup</li>
            <li><strong>Automation:</strong> Consider setting up the cron endpoint for automated cleanup</li>
          </ul>
          
          <div style={{ marginTop: '15px', fontSize: '14px' }}>
            <strong>Cron Setup (Optional):</strong><br/>
            <code style={{ 
              backgroundColor: 'white', 
              padding: '5px 8px', 
              borderRadius: '4px',
              border: '1px solid #d1d5db'
            }}>
              POST /api/cron/cleanup-tokens (with Bearer CRON_SECRET)
            </code>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default TokenCleanupDashboard;