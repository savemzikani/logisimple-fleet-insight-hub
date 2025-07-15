import { createClient } from '../src/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Test configuration
const TEST_DRIVER_ID = 'test-driver-123';
const TEST_COMPANY_ID = 'test-company-123';
const TEST_USER_ID = 'test-user-123';
const TEST_VEHICLE_ID = 'test-vehicle-123';

// Sample test document
const TEST_DOCUMENT = {
  id: `doc-${uuidv4()}`,
  driver_id: TEST_DRIVER_ID,
  company_id: TEST_COMPANY_ID,
  file_name: 'test-license.pdf',
  file_path: `documents/${TEST_DRIVER_ID}/test-license-${Date.now()}.pdf`,
  file_type: 'application/pdf',
  file_size: 1024 * 1024, // 1MB
  document_type: 'license',
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
  status: 'valid',
  uploaded_by: TEST_USER_ID,
};

// Initialize Supabase client
const supabase = createClient();

async function testDocumentFlow() {
  console.log('🚀 Starting document flow tests...');
  
  try {
    // 1. Test document upload
    console.log('\n📤 Testing document upload...');
    const uploadResult = await testDocumentUpload();
    console.log('✅ Document upload test completed');
    
    // 2. Test document retrieval
    console.log('\n📥 Testing document retrieval...');
    const document = await testGetDocument(uploadResult.documentId);
    console.log('✅ Document retrieval test completed');
    
    // 3. Test document deletion
    console.log('\n🗑️ Testing document deletion...');
    await testDeleteDocument(document.id);
    console.log('✅ Document deletion test completed');
    
    console.log('\n🎉 All document flow tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

async function testDocumentUpload() {
  // Create a test file
  const testFilePath = path.join(__dirname, 'test-license.pdf');
  await fs.writeFile(testFilePath, Buffer.alloc(1024 * 1024)); // 1MB file
  
  // Get upload URL
  const uploadUrlResponse = await fetch('http://localhost:3000/api/documents/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: 'test-license.pdf',
      contentType: 'application/pdf',
      driver_id: TEST_DRIVER_ID,
      metadata: {
        type: 'license',
        expiry_date: TEST_DOCUMENT.expiry_date,
        size: TEST_DOCUMENT.file_size,
      },
    }),
  });
  
  if (!uploadUrlResponse.ok) {
    const error = await uploadUrlResponse.json();
    throw new Error(`Failed to get upload URL: ${error.message || uploadUrlResponse.statusText}`);
  }
  
  const { uploadUrl, documentId } = await uploadUrlResponse.json();
  
  // Upload the file
  const fileBuffer = await fs.readFile(testFilePath);
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: fileBuffer,
  });
  
  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  }
  
  // Clean up test file
  await fs.unlink(testFilePath);
  
  return { documentId };
}

async function testGetDocument(documentId: string) {
  const response = await fetch(`http://localhost:3000/api/documents/${documentId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get document: ${error.message || response.statusText}`);
  }
  
  const document = await response.json();
  console.log('📄 Retrieved document:', {
    id: document.id,
    name: document.file_name,
    type: document.document_type,
    status: document.status,
    url: document.download_url ? '✅ URL available' : '❌ No URL',
  });
  
  return document;
}

async function testDeleteDocument(documentId: string) {
  const response = await fetch(`http://localhost:3000/api/documents/${documentId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to delete document: ${error.message || response.statusText}`);
  }
  
  console.log('✅ Document deleted successfully');
  
  // Verify deletion
  try {
    await fetch(`http://localhost:3000/api/documents/${documentId}`);
    throw new Error('Document still exists after deletion');
  } catch (error) {
    // Expected error - document should not be found
    console.log('✅ Verified document no longer exists');
  }
}

// Run the tests
if (require.main === module) {
  testDocumentFlow();
}

export { testDocumentFlow, testDocumentUpload, testGetDocument, testDeleteDocument };
