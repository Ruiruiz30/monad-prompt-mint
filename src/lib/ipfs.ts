import { NFTMetadata, IPFSUploadResult } from '@/types';

// Download image from URL and convert to File
async function downloadImageAsFile(imageUrl: string, filename: string): Promise<File> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

// Upload image and metadata to IPFS
export async function uploadToIPFS(
  imageUrl: string,
  prompt: string,
  retryCount = 3
): Promise<IPFSUploadResult> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`IPFS upload attempt ${attempt}/${retryCount}`);
      
      // Download the image
      const imageFile = await downloadImageAsFile(imageUrl, 'generated-image.png');
      
      // Upload image to IPFS
      const imageCid = await uploadFile(imageFile);
      const imageIPFSUrl = `ipfs://${imageCid}`;
      
      console.log('Image uploaded to IPFS:', imageIPFSUrl);
      
      // Create NFT metadata
      const metadata: NFTMetadata = {
        name: `AI Generated Art: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
        description: `AI-generated artwork created from the prompt: "${prompt}"`,
        image: imageIPFSUrl,
        attributes: [
          {
            trait_type: "Generation Method",
            value: "DALL-E-3"
          },
          {
            trait_type: "Created At",
            value: new Date().toISOString().split('T')[0]
          },
          {
            trait_type: "Prompt Length",
            value: prompt.length.toString()
          }
        ],
        prompt: prompt,
        created_at: new Date().toISOString(),
        generated_by: "PromptMint"
      };
      
      // Upload metadata to IPFS
      const metadataFile = new File(
        [JSON.stringify(metadata, null, 2)],
        'metadata.json',
        { type: 'application/json' }
      );
      
      const metadataCid = await uploadFile(metadataFile);
      const tokenURI = `ipfs://${metadataCid}`;
      
      console.log('Metadata uploaded to IPFS:', tokenURI);
      
      // Create preview URL (using a public IPFS gateway)
      const previewURL = `https://ipfs.io/ipfs/${imageCid}`;
      
      return {
        cid: metadataCid,
        tokenURI,
        previewURL
      };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`IPFS upload attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < retryCount) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`IPFS upload failed after ${retryCount} attempts: ${lastError?.message}`);
}

// Upload a single file to IPFS (mock implementation for development)
async function uploadFile(file: File): Promise<string> {
  try {
    // TODO: Replace with actual Web3.Storage implementation
    // For now, we'll use a mock CID for development
    const mockCid = generateMockCid(file.name);
    
    console.log(`Mock upload: ${file.name} -> ${mockCid}`);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockCid;
    
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error(`Failed to upload ${file.name} to IPFS`);
  }
}

// Generate a mock CID for development purposes
function generateMockCid(filename: string): string {
  const timestamp = Date.now();
  const hash = btoa(`${filename}-${timestamp}`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `Qm${hash.substring(0, 44)}`;
}