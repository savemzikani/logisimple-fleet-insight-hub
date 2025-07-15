import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const DocumentIdSchema = z.object({
  id: z.string().uuid(),
});

type DocumentIdRequest = z.infer<typeof DocumentIdSchema>;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const validation = DocumentIdSchema.safeParse({ id: params.id });
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid document ID',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const documentId = validation.data.id;
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Must be authenticated' },
        { status: 401 }
      );
    }

    // Get the document with driver and company info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        driver:drivers(id, company_id, status),
        uploaded_by:user_profiles(id, email, full_name)
      `)
      .eq('id', documentId)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch document',
          details: docError.message
        },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this document
    if (document.driver.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot access documents for inactive drivers' },
        { status: 403 }
      );
    }

    // Check if user has access to this company
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', document.driver.company_id)
      .eq('status', 'active')
      .in('role', ['admin', 'manager', 'dispatcher'])
      .single();

    if (companyError) {
      console.error('Error verifying user permissions:', companyError);
      return NextResponse.json(
        { 
          error: 'Failed to verify user permissions',
          details: companyError.message
        },
        { status: 500 }
      );
    }

    if (!companyMember) {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get a signed URL for the document
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('driver-documents')
      .createSignedUrl(document.file_path, 3600); // 1 hour expiration

    if (urlError) {
      console.error('Error generating download URL:', urlError);
      return NextResponse.json(
        { 
          error: 'Failed to generate download URL',
          details: urlError.message
        },
        { status: 500 }
      );
    }

    if (!signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: 'Invalid download URL generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: document.id,
      driver_id: document.driver_id,
      name: document.file_name,
      type: document.document_type,
      url: signedUrlData.signedUrl,
      upload_date: document.uploaded_at,
      expiry_date: document.expiry_date,
      status: document.status === 'expired' ? 'expired' : 
              document.expiry_date && new Date(document.expiry_date) < new Date() ? 'expired' :
              document.expiry_date && new Date(document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring_soon' :
              'valid',
      metadata: {
        size: document.file_size,
        mime_type: document.file_type,
        uploaded_by: document.uploaded_by,
        uploaded_by_name: document.uploaded_by?.full_name || document.uploaded_by?.email,
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const validation = DocumentIdSchema.safeParse({ id: params.id });
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid document ID',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const documentId = validation.data.id;
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Must be authenticated' },
        { status: 401 }
      );
    }

    // Get the document with driver and company info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        driver:drivers(id, company_id, status),
        uploaded_by:user_profiles(id, email, full_name)
      `)
      .eq('id', documentId)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch document',
          details: docError.message
        },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this document
    if (document.driver.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot delete documents for inactive drivers' },
        { status: 403 }
      );
    }

    // Check if user has access to this company
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', document.driver.company_id)
      .eq('status', 'active')
      .in('role', ['admin', 'manager', 'dispatcher'])
      .single();

    if (companyError) {
      console.error('Error verifying user permissions:', companyError);
      return NextResponse.json(
        { 
          error: 'Failed to verify user permissions',
          details: companyError.message
        },
        { status: 500 }
      );
    }

    if (!companyMember) {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete the document from storage
    const { error: deleteError } = await supabase.storage
      .from('driver-documents')
      .remove([document.file_path]);

    if (deleteError) {
      console.error('Error deleting file from storage:', deleteError);
      return NextResponse.json(
        { 
          error: 'Failed to delete file from storage',
          details: deleteError.message
        },
        { status: 500 }
      );
    }

    // Delete the document record
    const { error: docDeleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (docDeleteError) {
      console.error('Error deleting document record:', docDeleteError);
      return NextResponse.json(
        { 
          error: 'Failed to delete document record',
          details: docDeleteError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
