class IdCounter {
  private static instance: IdCounter;
  private counter: number;
  private pageLoadToken: string;
  private readonly MAX_COUNTER = 999999; // Set maximum value to 999999 for 6-digit IDs

  private constructor() {
    // Generate a unique page load token
    this.pageLoadToken = new Date().toISOString() + Math.random().toString(36).substring(2);
    
    // Always start from 0 for each page load
    this.counter = 0;
  }

  public static getInstance(): IdCounter {
    if (!IdCounter.instance) {
      IdCounter.instance = new IdCounter();
    }
    return IdCounter.instance;
  }

  public getNextId(): string {
    if (this.counter > this.MAX_COUNTER) {
      // Handle overflow by resetting to 0
      console.warn("ID counter has reached maximum value and will restart from 0");
      this.counter = 0;
    }
    
    // Check if we need 5 or 6 digits (once we pass 99999)
    const paddedCounter = this.counter <= 99999 
      ? String(this.counter).padStart(5, '0')
      : String(this.counter).padStart(6, '0');
      
    const id = `segmentorID-${paddedCounter}`; // Changed prefix to segmentorID-
    this.counter++;
    return id;
  }

  public reset(): void {
    this.counter = 0;
    // Update the page load token
    this.pageLoadToken = new Date().toISOString() + Math.random().toString(36).substring(2);
  }
  
  // Method to get current counter value (for testing)
  public getCurrentCounter(): number {
    return this.counter;
  }
}

export const idCounter = IdCounter.getInstance();