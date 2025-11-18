# Google Cloud Storage Setup Guide

## Current Issue
The service account `cosmic-answer-439316-f1@appspot.gserviceaccount.com` doesn't have `storage.buckets.create` permission.

## Solutions

### Option 1: Grant Permissions to Existing Service Account (Recommended)

1. **Go to Google Cloud Console**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project: `cosmic-answer-439316-f1`

2. **Grant Storage Admin Role**
   - Go to **IAM & Admin** > **IAM**
   - Find the service account: `cosmic-answer-439316-f1@appspot.gserviceaccount.com`
   - Click the pencil icon to edit
   - Add the **Storage Admin** role
   - Click **Save**

3. **Alternative: Grant Specific Permissions**
   If you prefer minimal permissions, add these roles:
   - **Storage Object Admin** (for file operations)
   - **Storage Object Viewer** (for reading files)
   - **Storage Legacy Bucket Owner** (for bucket operations)

### Option 2: Create a New Service Account

1. **Create Service Account**
   - Go to **IAM & Admin** > **Service Accounts**
   - Click **Create Service Account**
   - Name: `ezpicra-storage-service`
   - Description: `Service account for ezPICRA file storage`

2. **Grant Permissions**
   - Add **Storage Admin** role
   - Click **Done**

3. **Create and Download Key**
   - Click on the new service account
   - Go to **Keys** tab
   - Click **Add Key** > **Create new key**
   - Choose **JSON** format
   - Download the key file

4. **Update Configuration**
   - Place the downloaded JSON file in `server/config/google-credentials.json`
   - Update your `.env.development` file:
   ```
   GOOGLE_CLOUD_KEY_FILE=./config/google-credentials.json
   ```

### Option 3: Create Bucket Manually

1. **Create Bucket in Console**
   - Go to **Cloud Storage** > **Buckets**
   - Click **Create Bucket**
   - Name: `ezpicra-reports`
   - Location: `US-CENTRAL1`
   - Click **Create**

2. **Grant Object Permissions**
   - The service account only needs object-level permissions
   - Add **Storage Object Admin** role to the service account

### Option 4: Use Local Storage (Development Only)

For development, you can disable Google Cloud Storage:

1. **Update Environment**
   ```bash
   # In .env.development
   USE_LOCAL_STORAGE=true
   ```

2. **Modify Code** (if needed)
   - The application will automatically fall back to local storage
   - Files will be stored in `server/uploads/` directory

## Verification

After applying any solution:

1. **Restart your server**
2. **Check logs** for successful bucket initialization
3. **Test file upload** to verify functionality

## Security Notes

- **Never commit** service account keys to version control
- **Use environment variables** for sensitive configuration
- **Grant minimal permissions** following the principle of least privilege
- **Rotate keys regularly** for production environments

## Troubleshooting

### Common Errors

1. **403 Forbidden**
   - Check IAM permissions
   - Verify service account has correct roles

2. **Bucket not found**
   - Ensure bucket name matches exactly
   - Check project ID configuration

3. **Authentication failed**
   - Verify credentials file path
   - Check JSON key format

### Debug Commands

```bash
# Test Google Cloud authentication
gcloud auth application-default login

# List buckets
gsutil ls

# Check service account permissions
gcloud projects get-iam-policy cosmic-answer-439316-f1
```

## Production Considerations

1. **Use Workload Identity** (for GKE)
2. **Implement proper error handling**
3. **Set up monitoring and logging**
4. **Configure backup strategies**
5. **Implement file lifecycle policies** 