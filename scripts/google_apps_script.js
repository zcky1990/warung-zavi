/**
 * GOOGLE APPS SCRIPT FOR WARUNG ZAVI DEBT TRACKER
 * ---------------------------------------------
 * 1. Create a New Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Replace the code with this script.
 * 4. Replace 'YOUR_SHEET_ID_HERE' with your actual Sheet ID.
 * 5. Deploy as Web App:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL to your api.js file.
 */

const SHEET_ID = 'YOUR_SHEET_ID_HERE';

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  if (action === 'get_data') {
    const data = {
      customers: getSheetData(ss, 'Customers'),
      products: getSheetData(ss, 'Products'),
      debts: getSheetData(ss, 'Debts'),
      income: getSheetData(ss, 'Income')
    };
    return jsonResponse(data);
  }
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const payload = body.payload;
  let responseData = { success: true };

  switch (action) {
    case 'add_customer':
      const customerId = generateId();
      appendRow(ss, 'Customers', [customerId, payload.name, payload.phone || '', payload.address || '']);
      responseData.id = customerId;
      break;
    case 'update_customer':
      updateCustomerInSheet(ss, payload);
      break;
    case 'add_product':
      const productId = generateId();
      appendRow(ss, 'Products', [productId, payload.name, payload.price, payload.category || '']);
      responseData.id = productId;
      break;
    case 'update_product':
      updateProductInSheet(ss, payload);
      break;
    case 'add_debt':
      const debtId = generateId();
      appendRow(ss, 'Debts', [debtId, payload.customerId, new Date().toISOString(), payload.items, payload.total, 'unpaid']);
      responseData.id = debtId;
      responseData.date = new Date().toISOString();
      break;
    case 'update_debt':
      updateDebtInSheet(ss, payload);
      break;
    case 'pay_debt':
      updateDebtStatus(ss, payload.debtId, 'paid');
      const incomeId = generateId();
      const incomeDate = new Date().toISOString();
      appendRow(ss, 'Income', [incomeId, incomeDate, payload.amount, 'Debt Payment', payload.method]);
      responseData.id = incomeId;
      responseData.date = incomeDate;
      break;
    case 'add_direct_income':
      const directIncomeId = generateId();
      const directIncomeDate = new Date().toISOString();
      appendRow(ss, 'Income', [directIncomeId, directIncomeDate, payload.amount, payload.source, payload.method]);
      responseData.id = directIncomeId;
      responseData.date = directIncomeDate;
      break;
  }

  return jsonResponse(responseData);
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h.toLowerCase()] = row[i]);
    return obj;
  });
}

function appendRow(ss, sheetName, row) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = getHeaders(sheetName);
    sheet.appendRow(headers);
  }
  sheet.appendRow(row);
}

function getHeaders(sheetName) {
  const headers = {
    'Customers': ['id', 'name', 'phone', 'address'],
    'Products': ['id', 'name', 'price', 'category'],
    'Debts': ['id', 'customerid', 'date', 'items', 'total', 'status'],
    'Income': ['id', 'date', 'amount', 'source', 'method']
  };
  return headers[sheetName] || [];
}

function updateDebtStatus(ss, debtId, status) {
  const sheet = ss.getSheetByName('Debts');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === debtId) {
      sheet.getRange(i + 1, 6).setValue(status);
      break;
    }
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateProductInSheet(ss, payload) {
  const sheet = ss.getSheetByName('Products');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === payload.id) {
      sheet.getRange(i + 1, 2).setValue(payload.name);
      sheet.getRange(i + 1, 3).setValue(payload.price);
      sheet.getRange(i + 1, 4).setValue(payload.category);
      break;
    }
  }
}

function updateCustomerInSheet(ss, payload) {
  const sheet = ss.getSheetByName('Customers');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === payload.id) {
      sheet.getRange(i + 1, 2).setValue(payload.name);
      sheet.getRange(i + 1, 3).setValue(payload.phone);
      sheet.getRange(i + 1, 4).setValue(payload.address);
      break;
    }
  }
}

function updateDebtInSheet(ss, payload) {
  const sheet = ss.getSheetByName('Debts');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === payload.id) {
      sheet.getRange(i + 1, 4).setValue(payload.items);
      sheet.getRange(i + 1, 5).setValue(payload.total);
      break;
    }
  }
}
