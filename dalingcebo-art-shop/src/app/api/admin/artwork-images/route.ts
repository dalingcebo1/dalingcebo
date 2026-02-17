import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { artworkId, images } = await request.json()

    if (!artworkId || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), 'public', 'artwork-images.json')
    
    let data: Record<string, { images: string[] }> = {}
    
    // Read existing data
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      data = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist yet, start fresh
      console.log('Creating new artwork-images.json file')
    }

    // Add/update images for this artwork
    data[artworkId.toString()] = { images }

    // Write back to file with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')

    return NextResponse.json({ 
      success: true,
      message: `Successfully saved ${images.length} images for artwork #${artworkId}`
    })
  } catch (error) {
    console.error('Error saving artwork images:', error)
    return NextResponse.json(
      { error: 'Failed to save images' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'artwork-images.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    return NextResponse.json(data)
  } catch (error) {
    // File doesn't exist or other error
    return NextResponse.json({})
  }
}
