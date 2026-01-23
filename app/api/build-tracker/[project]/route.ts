import { NextRequest, NextResponse } from 'next/server'

// Projects allowed to build 
const ALLOWED_PROJECTS = ['trust']

interface BuildData {
  project: string
  timestamp: string
  hostname: string
  platform: string
  nodeVersion: string
  env: string
  isVercel: boolean
  isNetlify: boolean
  isCI: boolean
  user: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params

  // Check if project is allowed
  if (!ALLOWED_PROJECTS.includes(project)) {
    console.log(`[BUILD-TRACKER] Unauthorized project: ${project}`)
    return NextResponse.json(
      { success: false, error: 'Project not authorized' },
      { status: 403 }
    )
  }

  try {
    const body: BuildData = await request.json()

    // Log the build attempt
    console.log(`[BUILD-TRACKER] Build attempt logged:`, {
      project,
      timestamp: body.timestamp,
      hostname: body.hostname,
      platform: body.platform,
      nodeVersion: body.nodeVersion,
      env: body.env,
      isVercel: body.isVercel,
      isNetlify: body.isNetlify,
      isCI: body.isCI,
      user: body.user,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`[BUILD-TRACKER] Error parsing request:`, error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
