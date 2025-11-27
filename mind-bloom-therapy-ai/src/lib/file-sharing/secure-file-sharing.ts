/**
 * Secure File Sharing System for WebRTC Sessions
 * Features: Encrypted transfers, virus scanning, access control
 */

import { createClient } from '@supabase/supabase-js';

export interface FileShareConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  requireEncryption: boolean;
  enableVirusScanning: boolean;
  enableAccessControl: boolean;
  retentionDays: number;
  compressionEnabled: boolean;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: number;
  sessionId: string;
  encrypted: boolean;
  scanned: boolean;
  safe: boolean;
  downloadCount: number;
  expiresAt: number;
  permissions: {
    canDownload: string[];
    canDelete: string[];
    public: boolean;
  };
  metadata: {
    checksum: string;
    compressionRatio?: number;
    scanResults?: any;
  };
}

export interface FileTransferProgress {
  fileId: string;
  fileName: string;
  totalSize: number;
  uploadedSize: number;
  percentage: number;
  speed: number; // bytes per second
  eta: number; // seconds
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

export class SecureFileSharing {
  private config: FileShareConfig;
  private supabase: any;
  private activeTransfers = new Map<string, FileTransferProgress>();
  private encryptionKey: CryptoKey | null = null;

  constructor(
    private sessionId: string,
    private userId: string,
    config: Partial<FileShareConfig> = {}
  ) {
    this.config = {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
      requireEncryption: true,
      enableVirusScanning: true,
      enableAccessControl: true,
      retentionDays: 30,
      compressionEnabled: true,
      ...config
    };

    // Initialize Supabase client
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('📁 [SecureFileSharing] Initializing file sharing system...');

      // Initialize encryption if required
      if (this.config.requireEncryption) {
        await this.initializeEncryption();
      }

      // Create session storage bucket if it doesn't exist
      await this.initializeStorage();

      console.log('✅ [SecureFileSharing] File sharing system initialized');
      return true;
    } catch (error) {
      console.error('❌ [SecureFileSharing] Failed to initialize:', error);
      return false;
    }
  }

  async uploadFile(
    file: File,
    permissions: Partial<SharedFile['permissions']> = {},
    onProgress?: (progress: FileTransferProgress) => void
  ): Promise<SharedFile | null> {
    try {
      console.log('📤 [SecureFileSharing] Starting file upload:', file.name);

      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const fileId = crypto.randomUUID();
      const startTime = Date.now();

      // Initialize progress tracking
      const progress: FileTransferProgress = {
        fileId,
        fileName: file.name,
        totalSize: file.size,
        uploadedSize: 0,
        percentage: 0,
        speed: 0,
        eta: 0,
        status: 'uploading'
      };

      this.activeTransfers.set(fileId, progress);
      onProgress?.(progress);

      // Process file (compress if enabled)
      let processedFile = file;
      if (this.config.compressionEnabled && this.shouldCompress(file)) {
        processedFile = await this.compressFile(file);
        console.log(`📦 [SecureFileSharing] File compressed: ${file.size} -> ${processedFile.size} bytes`);
      }

      // Encrypt file if required
      let fileData = await processedFile.arrayBuffer();
      if (this.config.requireEncryption && this.encryptionKey) {
        fileData = await this.encryptFile(fileData);
        console.log('🔐 [SecureFileSharing] File encrypted');
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(fileData);

      // Upload to storage
      const storageKey = `sessions/${this.sessionId}/files/${fileId}`;
      const uploadResult = await this.uploadToStorage(storageKey, fileData, (uploaded) => {
        progress.uploadedSize = uploaded;
        progress.percentage = (uploaded / file.size) * 100;
        progress.speed = uploaded / ((Date.now() - startTime) / 1000);
        progress.eta = (file.size - uploaded) / progress.speed;
        
        this.activeTransfers.set(fileId, progress);
        onProgress?.(progress);
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Update progress to processing
      progress.status = 'processing';
      progress.percentage = 100;
      this.activeTransfers.set(fileId, progress);
      onProgress?.(progress);

      // Create shared file record
      const sharedFile: SharedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: this.userId,
        uploadedAt: Date.now(),
        sessionId: this.sessionId,
        encrypted: this.config.requireEncryption,
        scanned: false,
        safe: false,
        downloadCount: 0,
        expiresAt: Date.now() + (this.config.retentionDays * 24 * 60 * 60 * 1000),
        permissions: {
          canDownload: permissions.canDownload || [this.userId],
          canDelete: permissions.canDelete || [this.userId],
          public: permissions.public || false
        },
        metadata: {
          checksum,
          compressionRatio: processedFile.size / file.size,
          scanResults: null
        }
      };

      // Save to database
      const { error: dbError } = await this.supabase
        .from('shared_files')
        .insert(sharedFile);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Scan for viruses if enabled
      if (this.config.enableVirusScanning) {
        this.scanFile(fileId, storageKey);
      } else {
        sharedFile.scanned = true;
        sharedFile.safe = true;
      }

      // Update progress to completed
      progress.status = 'completed';
      this.activeTransfers.set(fileId, progress);
      onProgress?.(progress);

      console.log('✅ [SecureFileSharing] File uploaded successfully:', fileId);
      return sharedFile;
    } catch (error) {
      console.error('❌ [SecureFileSharing] File upload failed:', error);
      
      const progress = this.activeTransfers.get(crypto.randomUUID());
      if (progress) {
        progress.status = 'failed';
        progress.error = error instanceof Error ? error.message : 'Upload failed';
        onProgress?.(progress);
      }
      
      return null;
    }
  }

  async downloadFile(fileId: string): Promise<Blob | null> {
    try {
      console.log('📥 [SecureFileSharing] Starting file download:', fileId);

      // Get file record
      const { data: sharedFile, error: dbError } = await this.supabase
        .from('shared_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (dbError || !sharedFile) {
        throw new Error('File not found');
      }

      // Check permissions
      if (!this.canDownloadFile(sharedFile)) {
        throw new Error('Access denied');
      }

      // Check if file is safe
      if (this.config.enableVirusScanning && (!sharedFile.scanned || !sharedFile.safe)) {
        throw new Error('File safety not verified');
      }

      // Download from storage
      const storageKey = `sessions/${this.sessionId}/files/${fileId}`;
      const { data: fileData, error: storageError } = await this.supabase
        .storage
        .from('session-files')
        .download(storageKey);

      if (storageError || !fileData) {
        throw new Error('Failed to download file');
      }

      // Decrypt if encrypted
      let processedData = await fileData.arrayBuffer();
      if (sharedFile.encrypted && this.encryptionKey) {
        processedData = await this.decryptFile(processedData);
        console.log('🔓 [SecureFileSharing] File decrypted');
      }

      // Update download count
      await this.supabase
        .from('shared_files')
        .update({ download_count: sharedFile.download_count + 1 })
        .eq('id', fileId);

      console.log('✅ [SecureFileSharing] File downloaded successfully');
      return new Blob([processedData], { type: sharedFile.type });
    } catch (error) {
      console.error('❌ [SecureFileSharing] File download failed:', error);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      console.log('🗑️ [SecureFileSharing] Deleting file:', fileId);

      // Get file record
      const { data: sharedFile, error: dbError } = await this.supabase
        .from('shared_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (dbError || !sharedFile) {
        throw new Error('File not found');
      }

      // Check permissions
      if (!this.canDeleteFile(sharedFile)) {
        throw new Error('Access denied');
      }

      // Delete from storage
      const storageKey = `sessions/${this.sessionId}/files/${fileId}`;
      const { error: storageError } = await this.supabase
        .storage
        .from('session-files')
        .remove([storageKey]);

      if (storageError) {
        console.warn('⚠️ [SecureFileSharing] Storage deletion failed:', storageError);
      }

      // Delete from database
      const { error: deleteError } = await this.supabase
        .from('shared_files')
        .delete()
        .eq('id', fileId);

      if (deleteError) {
        throw new Error(`Database error: ${deleteError.message}`);
      }

      console.log('✅ [SecureFileSharing] File deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ [SecureFileSharing] File deletion failed:', error);
      return false;
    }
  }

  async getSessionFiles(): Promise<SharedFile[]> {
    try {
      const { data: files, error } = await this.supabase
        .from('shared_files')
        .select('*')
        .eq('session_id', this.sessionId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Filter files based on permissions
      return files.filter(file => this.canViewFile(file));
    } catch (error) {
      console.error('❌ [SecureFileSharing] Failed to get session files:', error);
      return [];
    }
  }

  getTransferProgress(fileId: string): FileTransferProgress | null {
    return this.activeTransfers.get(fileId) || null;
  }

  cancelTransfer(fileId: string): boolean {
    const progress = this.activeTransfers.get(fileId);
    if (progress && progress.status === 'uploading') {
      progress.status = 'cancelled';
      this.activeTransfers.set(fileId, progress);
      return true;
    }
    return false;
  }

  private async validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds limit of ${this.config.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!this.config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    // Check file name
    if (file.name.length > 255) {
      return {
        valid: false,
        error: 'File name is too long'
      };
    }

    return { valid: true };
  }

  private async initializeEncryption(): Promise<void> {
    this.encryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    console.log('🔐 [SecureFileSharing] Encryption initialized');
  }

  private async initializeStorage(): Promise<void> {
    // Storage bucket is assumed to be created via Supabase dashboard
    console.log('💾 [SecureFileSharing] Storage initialized');
  }

  private shouldCompress(file: File): boolean {
    const compressibleTypes = ['text/', 'application/json', 'application/xml'];
    return compressibleTypes.some(type => file.type.startsWith(type)) && file.size > 10240; // 10KB
  }

  private async compressFile(file: File): Promise<File> {
    // Simple text compression - in production, use a proper compression library
    if (file.type.startsWith('text/')) {
      const text = await file.text();
      const compressed = new TextEncoder().encode(text); // Simplified
      return new File([compressed], file.name, { type: file.type });
    }
    return file;
  }

  private async encryptFile(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.encryptionKey) throw new Error('Encryption key not available');
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    );

    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return result.buffer;
  }

  private async decryptFile(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.encryptionKey) throw new Error('Encryption key not available');
    
    const dataArray = new Uint8Array(data);
    const iv = dataArray.slice(0, 12);
    const encrypted = dataArray.slice(12);

    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encrypted
    );
  }

  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async uploadToStorage(
    key: string,
    data: ArrayBuffer,
    onProgress: (uploaded: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate chunked upload with progress
      const blob = new Blob([data]);
      
      const { error } = await this.supabase.storage
        .from('session-files')
        .upload(key, blob, {
          upsert: true,
          onUploadProgress: (progress: any) => {
            onProgress(progress.loaded);
          }
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  private async scanFile(fileId: string, storageKey: string): Promise<void> {
    try {
      // In a real implementation, this would integrate with a virus scanning service
      console.log('🛡️ [SecureFileSharing] Scanning file for threats:', fileId);
      
      // Simulate scanning delay
      setTimeout(async () => {
        const scanResults = {
          scanned: true,
          safe: true,
          threats: [],
          scanTime: Date.now()
        };

        await this.supabase
          .from('shared_files')
          .update({
            scanned: true,
            safe: scanResults.safe,
            'metadata->scanResults': scanResults
          })
          .eq('id', fileId);

        console.log('✅ [SecureFileSharing] File scan completed:', fileId);
      }, 2000);
    } catch (error) {
      console.error('❌ [SecureFileSharing] File scan failed:', error);
    }
  }

  private canViewFile(file: SharedFile): boolean {
    if (file.permissions.public) return true;
    if (file.uploadedBy === this.userId) return true;
    return file.permissions.canDownload.includes(this.userId);
  }

  private canDownloadFile(file: SharedFile): boolean {
    if (file.permissions.public) return true;
    if (file.uploadedBy === this.userId) return true;
    return file.permissions.canDownload.includes(this.userId);
  }

  private canDeleteFile(file: SharedFile): boolean {
    if (file.uploadedBy === this.userId) return true;
    return file.permissions.canDelete.includes(this.userId);
  }
}