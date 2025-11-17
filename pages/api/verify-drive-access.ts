// pages/api/verify-drive-access.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const auth = await requireAuth(req, res);
    if (!auth) return;

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    // Validate Google Drive URL format
    if (!isValidGoogleDriveUrl(url)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Google Drive URL format' 
      });
    }

    // Verify access to the Google Drive file/folder
    const accessResult = await verifyGoogleDriveAccess(url);
    
    return res.status(200).json(accessResult);
  } catch (error) {
    console.error('Verify drive access API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error while verifying access' 
    });
  }
}

// Helper function to validate Google Drive URLs
function isValidGoogleDriveUrl(url: string): boolean {
  const drivePatterns = [
    /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/,
    /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/,
    /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/[a-zA-Z0-9_-]+/
  ];
  
  return drivePatterns.some(pattern => pattern.test(url));
}

// Helper function to verify Google Drive access
async function verifyGoogleDriveAccess(url: string): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    let checkUrl = url;
    let urlType = 'unknown';
    
    // Handle different Google Drive URL formats
    if (url.includes('/file/d/')) {
      urlType = 'file';
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (fileId) {
        // Try multiple approaches for file access verification
        checkUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
      }
    } else if (url.includes('/folders/')) {
      urlType = 'folder';
      // For folders, we'll check the folder view directly
      checkUrl = url;
    } else if (url.includes('/document/d/') || url.includes('/spreadsheets/d/') || url.includes('/presentation/d/')) {
      urlType = 'google_doc';
      // For Google Docs, we can check the published/export version
      const docId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (docId) {
        if (url.includes('/document/d/')) {
          checkUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;
        } else if (url.includes('/spreadsheets/d/')) {
          checkUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;
        } else if (url.includes('/presentation/d/')) {
          checkUrl = `https://docs.google.com/presentation/d/${docId}/export/png?id=${docId}&pageid=p`;
        }
      }
    }

    // Make a HEAD request to check accessibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(checkUrl, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SubmissionBot/1.0)',
        },
      });
      
      clearTimeout(timeoutId);

      const responseDetails = {
        status: response.status,
        statusText: response.statusText,
        url: checkUrl,
        urlType,
        redirected: response.redirected,
      };

      if (response.status === 200) {
        return { 
          success: true, 
          details: responseDetails 
        };
      } else if (response.status === 403) {
        return { 
          success: false, 
          error: 'File is not publicly accessible. Please set sharing to "Anyone with the link can view".', 
          details: responseDetails 
        };
      } else if (response.status === 404) {
        return { 
          success: false, 
          error: 'File not found. Please check if the URL is correct and the file exists.', 
          details: responseDetails 
        };
      } else if (response.status >= 500) {
        return { 
          success: false, 
          error: 'Google Drive is temporarily unavailable. Please try again later.', 
          details: responseDetails 
        };
      } else {
        return { 
          success: false, 
          error: `Unable to access file (Status: ${response.status}). Please check the URL and sharing settings.`, 
          details: responseDetails 
        };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return { 
          success: false, 
          error: 'Request timed out. The file might be too large or Google Drive is slow to respond.' 
        };
      }
      throw fetchError;
    }

  } catch (error: any) {
    console.error('Google Drive access verification error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { 
        success: false, 
        error: 'Network error occurred while verifying access. Please check your internet connection.' 
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to verify file access. Please ensure the URL is correct and publicly accessible.' 
    };
  }
}

// Alternative verification method using Google Drive API (if you have API credentials)
async function verifyGoogleDriveAccessWithAPI(fileId: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,permissions&key=${apiKey}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'File not found or not accessible' };
      }
      return { success: false, error: `API error: ${response.status}` };
    }
    
    const fileData = await response.json();
    
    // Check if file has public permissions
    const hasPublicPermission = fileData.permissions?.some((perm: any) => 
      perm.type === 'anyone' && (perm.role === 'reader' || perm.role === 'viewer')
    );
    
    if (hasPublicPermission) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'File exists but is not publicly accessible. Please set sharing to "Anyone with the link can view".' 
      };
    }
  } catch (error) {
    console.error('Google Drive API verification error:', error);
    return { 
      success: false, 
      error: 'Failed to verify file access via API' 
    };
  }
}
