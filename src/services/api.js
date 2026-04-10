// API Service for interacting with Google Apps Script
const API_URL = import.meta.env.VITE_WARUNG_ZAVI_API_URL || '';

export const api = {
  async getData() {
    if (!API_URL) return this.getMockData();
    try {
      const response = await fetch(`${API_URL}?action=get_data`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return this.getMockData();
    }
  },

  async post(action, payload) {
    if (!API_URL) {
      console.log('No API URL - Mocking post:', action, payload);
      return { success: true };
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify({ action, payload }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  },

  getMockData() {
    return {
      customers: [
        { id: '1', name: 'Budi', phone: '08123456789', address: 'Jl. Melati' },
        { id: '2', name: 'Ani', phone: '08987654321', address: 'Jl. Mawar' }
      ],
      products: [
        { id: 'p1', name: 'Beras 5kg', price: 65000, category: 'Sembako' },
        { id: 'p2', name: 'Minyak Goreng 1L', price: 18000, category: 'Sembako' },
        { id: 'p3', name: 'Gula 1kg', price: 15000, category: 'Sembako' }
      ],
      debts: [
        { id: 'd1', customerid: '1', date: new Date().toISOString(), items: 'Beras 5kg (1)', total: 65000, status: 'unpaid' }
      ],
      income: [
        { id: 'i1', date: new Date().toISOString(), amount: 15000, source: 'Direct Sale', method: 'Cash' }
      ]
    };
  }
};
