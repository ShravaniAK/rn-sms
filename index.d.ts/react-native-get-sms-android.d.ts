declare module 'react-native-get-sms-android' {
    interface SmsFilter {
      box: string; // 'inbox', 'sent', etc.
      indexFrom?: number;
      maxCount?: number;
    }
  
    interface SmsMessage {
      _id: string;
      address: string;
      body: string;
      date: number;
      type: number;
    }
  
    export function list(
      filter: string,
      failureCallback: (error: string) => void,
      successCallback: (count: number, smsList: string) => void
    ): void;
  }
  