import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!authUser.role) {
      return NextResponse.json(
        { error: 'Account not activated' },
        { status: 403 }
      )
    }

    // Validate AWS configuration
    if (!process.env.AWS_BUCKET_NAME) {
      console.error('AWS_BUCKET_NAME is not configured')
      return NextResponse.json(
        { error: 'AWS configuration missing' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const version = searchParams.get('version') || '2.1.0'
    
    // Map version to actual file name in S3
    // Update this mapping when you add new versions
    const versionToFileName: Record<string, string> = {
      '2.1.0': 'AuraSetup-x64-2.0.1.exe',
      '2.0.1': 'AuraSetup-x64-2.0.1.exe',
      // Add more mappings as needed: 'version': 'filename.exe'
    }
    
    // Use fileName from query param if provided, otherwise use mapping, otherwise fallback
    const fileName = searchParams.get('fileName') || versionToFileName[version] || `AuraSetup-x64-${version}.exe`

    // S3 key path - file should be in software/ folder
    const s3Key = `software/${fileName}`

    console.log(`Generating download URL for: ${s3Key}`)

    // Create GetObject command
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    })

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    console.log('Download URL generated successfully')

    return NextResponse.json({
      downloadUrl: presignedUrl,
      fileName: fileName,
      expiresIn: 3600, // 1 hour in seconds
    })
  } catch (error: any) {
    console.error('Download URL generation error:', error)
    
    // Handle specific S3 errors
    if (error.name === 'NoSuchKey' || error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return NextResponse.json(
        { error: `File not found in S3 bucket: ${error.message}` },
        { status: 404 }
      )
    }

    if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
      return NextResponse.json(
        { error: 'AWS credentials are invalid' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate download URL', message: error.message },
      { status: 500 }
    )
  }
}
