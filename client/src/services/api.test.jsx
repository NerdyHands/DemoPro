import apiService from './api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service - FormData Upload', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('uploadPICRAForProcessing should not set Content-Type header for FormData', async () => {
    // Mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({ success: true })
    });

    // Create FormData
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('projectId', '123');

    // Call the method
    await apiService.uploadPICRAForProcessing(formData);

    // Verify fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Get the fetch call arguments
    const [url, config] = fetch.mock.calls[0];
    
    // Verify the URL
    expect(url).toContain('/api/picra-processing/upload');
    
    // Verify the method
    expect(config.method).toBe('POST');
    
    // Verify the body is FormData
    expect(config.body).toBeInstanceOf(FormData);
    
    // Verify that Content-Type is NOT set in headers (browser should set it automatically)
    expect(config.headers['Content-Type']).toBeUndefined();
    
    // Verify Authorization header is still present
    expect(config.headers['Authorization']).toBeDefined();
  });

  test('uploadFile should not set Content-Type header for FormData', async () => {
    // Mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({ success: true })
    });

    // Create a test file
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Call the method
    await apiService.uploadFile(testFile, 'report');

    // Verify fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Get the fetch call arguments
    const [url, config] = fetch.mock.calls[0];
    
    // Verify the URL
    expect(url).toContain('/api/reports/upload');
    
    // Verify the method
    expect(config.method).toBe('POST');
    
    // Verify the body is FormData
    expect(config.body).toBeInstanceOf(FormData);
    
    // Verify that Content-Type is NOT set in headers
    expect(config.headers['Content-Type']).toBeUndefined();
    
    // Verify Authorization header is still present
    expect(config.headers['Authorization']).toBeDefined();
  });

  test('uploadFileWithMetadata should not set Content-Type header for FormData', async () => {
    // Mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({ success: true })
    });

    // Create FormData
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('metadata', JSON.stringify({ title: 'Test Report' }));

    // Call the method
    await apiService.uploadFileWithMetadata(formData);

    // Verify fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Get the fetch call arguments
    const [url, config] = fetch.mock.calls[0];
    
    // Verify the URL
    expect(url).toContain('/api/reports/upload');
    
    // Verify the method
    expect(config.method).toBe('POST');
    
    // Verify the body is FormData
    expect(config.body).toBeInstanceOf(FormData);
    
    // Verify that Content-Type is NOT set in headers
    expect(config.headers['Content-Type']).toBeUndefined();
    
    // Verify Authorization header is still present
    expect(config.headers['Authorization']).toBeDefined();
  });

  test('JSON requests should still have Content-Type header', async () => {
    // Mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({ success: true })
    });

    // Call a JSON method
    await apiService.createProject({ name: 'Test Project' });

    // Verify fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Get the fetch call arguments
    const [url, config] = fetch.mock.calls[0];
    
    // Verify the URL
    expect(url).toContain('/api/projects');
    
    // Verify the method
    expect(config.method).toBe('POST');
    
    // Verify that Content-Type IS set for JSON requests
    expect(config.headers['Content-Type']).toBe('application/json');
    
    // Verify Authorization header is still present
    expect(config.headers['Authorization']).toBeDefined();
  });
}); 
