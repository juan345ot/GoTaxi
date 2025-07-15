import Constants from 'expo-constants';

export const API_BASE_URL = process.env.API_BASE_URL || Constants?.manifest?.extra?.API_BASE_URL || "https://api.gotaxi.com/";
