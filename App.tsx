import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, PermissionsAndroid, Alert } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

interface Expense {
  amount: string;
  description: string;
  date: Date;
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Request SMS permissions from the user
  const requestSmsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to your SMS to read expense messages.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('SMS permission granted');
        getSms();
      } else {
        console.log('SMS permission denied');
        Alert.alert('Permission Denied', 'Cannot read SMS without permission.');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Function to read SMS and extract expense-related info
  const getSms = () => {
    const filter = {
      box: 'inbox', // 'inbox' or 'sent' or 'draft'
      indexFrom: 0, // Start reading from the first message
      maxCount: 100, // Max number of messages to read
    };
  
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.log('Failed with this error: ' + fail);
        Alert.alert('Error', 'Failed to retrieve SMS messages.');
      },
      (count: number, smsList: string) => {
        const smsArray = JSON.parse(smsList);
        const extractedExpenses = smsArray
          .filter((sms: any) => 
            sms.body.includes('debited') || 
            sms.body.includes('credited') || 
            sms.body.includes('charged') || 
            sms.body.includes('order') || 
            sms.body.includes('payment')
          ) // Check for multiple transaction keywords
          .map((sms: any) => {
            return {
              amount: extractAmount(sms.body),
              description: sms.body,
              date: new Date(sms.date),
            };
          });
        setExpenses(extractedExpenses);
      },
    );
  };
  
  // Function to extract the amount from the SMS body using regex
  const extractAmount = (text: string): string => {
    const regex = /\b(?:INR|USD|EUR)?\s?\d+(?:,\d{3})*(?:\.\d{1,2})?\b/; // Improved regex to capture amounts with currency symbols
    const match = text.match(regex);
    return match ? match[0] : 'N/A';
  };
  

  useEffect(() => {
    requestSmsPermission();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Button title="View All Expenses" onPress={getSms} />
      <FlatList
        data={expenses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
            <Text style={{ fontWeight: 'bold' }}>Amount: {item.amount}</Text>
            <Text>Description: {item.description}</Text>
            <Text>Date: {item.date.toDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
