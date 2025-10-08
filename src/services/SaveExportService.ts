import { ApostlesSaveData, SaveExportService } from '../types/save-export';

class SaveExportServiceImpl implements SaveExportService {
  private readonly VERSION = '1.0.0';
  private readonly FILE_EXTENSION = '.seg';

  /**
   * Save user progress to a file
   */
  async saveProgress(data: ApostlesSaveData): Promise<void> {
    // Add metadata
    const saveData: ApostlesSaveData = {
      ...data,
      version: this.VERSION,
      timestamp: new Date().toISOString(),
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(saveData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = data.fileName || this.getDefaultFileName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  }

  /**
   * Load progress from a file
   */
  async loadProgress(file: File): Promise<ApostlesSaveData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const data = JSON.parse(jsonString);
          
          if (this.validateSaveData(data)) {
            resolve(data);
          } else {
            reject(new Error('Invalid save file format'));
          }
        } catch (error) {
          reject(new Error('Failed to parse save file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Validate save data structure
   */
  validateSaveData(data: any): data is ApostlesSaveData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      data.data &&
      Array.isArray(data.data.points) &&
      Array.isArray(data.data.manualAssignments) &&
      data.chartConfig &&
      typeof data.chartConfig.midpoint === 'object' &&
      typeof data.chartConfig.midpoint.sat === 'number' &&
      typeof data.chartConfig.midpoint.loy === 'number' &&
      data.uiState &&
      data.filters
    );
  }

  /**
   * Generate default filename with timestamp
   */
  getDefaultFileName(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `Segmentor_${dateStr}_${timeStr}${this.FILE_EXTENSION}`;
  }

  /**
   * Check if file has correct extension
   */
  isValidFileType(file: File): boolean {
    return file.name.toLowerCase().endsWith(this.FILE_EXTENSION);
  }

  /**
   * Get file extension
   */
  getFileExtension(): string {
    return this.FILE_EXTENSION;
  }
}

// Export singleton instance
export const saveExportService = new SaveExportServiceImpl();
export default saveExportService;
