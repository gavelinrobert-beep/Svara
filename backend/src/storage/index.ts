export interface StorageProvider {
  saveFile(localPath: string, filename: string): Promise<string>; // returns URL
  deleteFile(url: string): Promise<void>;
}

// LocalStorageProvider: MVP implementation using local /uploads directory
export class LocalStorageProvider implements StorageProvider {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async saveFile(_localPath: string, filename: string): Promise<string> {
    // File is already saved by multer, just return the URL
    return `${this.baseUrl}/uploads/${filename}`;
  }

  async deleteFile(url: string): Promise<void> {
    const filename = url.split('/').pop();
    if (!filename) return;
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'uploads', filename);
    try {
      fs.unlinkSync(filePath);
    } catch {
      // File may not exist, ignore
    }
  }
}
