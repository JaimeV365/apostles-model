declare module 'papaparse' {
    export interface ParseResult<T> {
      data: T[];
      errors: any[];
      meta: {
        delimiter: string;
        linebreak: string;
        aborted: boolean;
        truncated: boolean;
        cursor: number;
      };
    }
  
    export interface ParseConfig {
      complete?: (results: ParseResult<any>, file?: File) => void;
      error?: (error: any, file?: File) => void;
      header?: boolean;
    }
  
    export function parse<T>(file: File, config: ParseConfig): void;
  }