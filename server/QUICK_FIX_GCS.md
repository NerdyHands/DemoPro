# Quick Fix for Google Cloud Storage Bucket Issue

## Current Problem
Your service account `cosmic-answer-439316-f1@appspot.gserviceaccount.com` doesn't have permission to create buckets, but the server needs the `ezpicra-reports` bucket to exist.

## Solution: Create Bucket Manually (5 minutes)

### Step 1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `cosmic-answer-439316-f1`

### Step 2: Create the Bucket
1. Go to **Cloud Storage** > **Buckets**
2. Click **Create Bucket**
3. Fill in the details:
   - **Name**: `ezpicra-reports` (exactly as shown)
   - **Location**: `US-CENTRAL1` (as configured in your .env)
   - **Storage class**: Standard
   - **Access control**: Uniform
   - **Protection tools**: None (for development)
4. Click **Create**

### Step 3: Grant Object Permissions
1. Go to **IAM & Admin** > **IAM**
2. Find `cosmic-answer-439316-f1@appspot.gserviceaccount.com`
3. Click the pencil icon to edit
4. Add these roles:
   - **Storage Object Admin** (for file operations)
   - **Storage Object Viewer** (for reading files)
5. Click **Save**

### Step 4: Test
1. Restart your server
2. You should see: `✅ Using existing bucket: ezpicra-reports`
3. Test file upload functionality

## Alternative: Disable GCS for Development

If you want to use local storage instead:

1. **Add to your `.env.development`:**
   ```
   USE_LOCAL_STORAGE=true
   ```

2. **Create uploads directory:**
   ```bash
   mkdir -p server/uploads
   ```

3. **Restart server** - it will use local storage

## Verification

After creating the bucket, your server logs should show:
```
✅ Using existing bucket: ezpicra-reports
✅ Google Cloud Storage initialized
```

Instead of:
```
⚠️  Cannot create bucket ezpicra-reports - using existing bucket or local storage
```

## Need Help?

If you still have issues:
1. Check that the bucket name is exactly `ezpicra-reports`
2. Verify the project ID is `cosmic-answer-439316-f1`
3. Ensure the service account has Storage Object Admin role
4. Check that the bucket location is `US-CENTRAL1` 