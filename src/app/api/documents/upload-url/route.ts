import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const DocumentUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  driver_id: z.string().uuid(),
  metadata: z.object({
    type: z.string().min(1),
    size: z.number().min(1),
    expiry_date: z.string().optional(),
  }).optional(),
});

type DocumentUploadRequest = z.infer<typeof DocumentUploadSchema>;

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Must be authenticated' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = DocumentUploadSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { filename, contentType, driver_id, metadata } = validation.data;

    // Verify user has access to this driver
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('company_id, status')
      .eq('id', driver_id)
      .single();

    if (driverError) {
      return NextResponse.json(
        { error: 'Failed to fetch driver information' },
        { status: 500 }
      );
    }

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    if (driver.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot upload documents for inactive drivers' },
        { status: 403 }
      );
    }

    // Verify user has access to this company
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', driver.company_id)
      .eq('status', 'active')
      .in('role', ['admin', 'manager', 'dispatcher'])
      .single();

    if (companyError) {
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 500 }
      );
    }

    if (!companyMember) {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          allowed_types: allowedTypes
        },
        { status: 400 }
      );
    }

    // Validate file size (25MB max)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (metadata?.size && metadata.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'File size exceeds maximum allowed size',
          max_size: maxSize,
          actual_size: metadata.size
        },
        { status: 400 }
      );
    }

    // Generate a unique file path
    const fileExt = filename.split('.').pop();
    const filePath = `documents/${driver_id}/${uuidv4()}.${fileExt}`;
    
    // Create a signed URL for upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('driver-documents')
      .createSignedUploadUrl(filePath, {
        fileSize: metadata?.size || maxSize,
        fileType: contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Error creating signed URL:', uploadError);
      return NextResponse.json(
        { 
          error: 'Failed to create upload URL',
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    // Create document record in database
    const documentId = uuidv4();
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        driver_id,
        company_id: driver.company_id,
        file_name: filename,
        file_path: filePath,
        file_type: contentType,
        file_size: metadata?.size,
        document_type: metadata?.type || 'other',
        expiry_date: metadata?.expiry_date || null,
        status: 'pending_upload',
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating document record:', docError);
      return NextResponse.json(
        { 
          error: 'Failed to create document record',
          details: docError.message
        },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document record creation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documentId: document.id,
      uploadUrl: uploadData.signedUrl,
      fields: uploadData.token,
      document,
    });
  } catch (error) {
    console.error('Error in upload URL generation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
