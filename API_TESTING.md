# API Implementation - Testing Guide

## 🎉 API Routes Successfully Created!

All core API routes have been implemented and are ready for testing.

---

## 📋 Implemented API Routes

### ✅ **1. Inventory Management**

#### GET /api/inventory
Fetch all inventory items with optional filtering

**Query Parameters:**
- `category` - Filter by category
- `search` - Search by item name or code

**Example:**
```bash
# Get all inventory
curl http://localhost:3000/api/inventory

# Filter by category
curl http://localhost:3000/api/inventory?category=Electronics

# Search
curl http://localhost:3000/api/inventory?search=Product
```

#### POST /api/inventory
Create new inventory item (requires authentication)

**Request Body:**
```json
{
  "itemCode": "ITEM-004",
  "itemName": "New Product",
  "quantity": 100,
  "unit": "pcs",
  "price": 50.00,
  "category": "Electronics"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "itemCode": "ITEM-004",
    "itemName": "New Product",
    "quantity": 100,
    "unit": "pcs",
    "price": 50.00
  }'
```

#### POST /api/inventory/sync
Sync inventory from external system (admin/manager only)

**Example:**
```bash
curl -X POST http://localhost:3000/api/inventory/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### ✅ **2. Authentication**

#### POST /api/auth/login
User login

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "BASE64_TOKEN_HERE",
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**Test Credentials:**
- Username: `admin`, Password: `admin` (role: admin)
- Username: `manager`, Password: `manager` (role: manager)

---

### ✅ **3. Van Stock Assignment**

#### GET /api/vans/[id]/stock
Get current stock for a van

**Example:**
```bash
curl http://localhost:3000/api/vans/van-001/stock
```

#### POST /api/vans/[id]/stock
Assign stock to a van (admin/manager only)

**Request Body:**
```json
{
  "items": [
    {
      "itemCode": "ITEM-001",
      "itemName": "Product A",
      "quantity": 10,
      "weight": 5,
      "unit": "pcs"
    },
    {
      "itemCode": "ITEM-002",
      "itemName": "Product B",
      "quantity": 20,
      "weight": 3,
      "unit": "pcs"
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/vans/van-001/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "itemCode": "ITEM-001",
        "itemName": "Product A",
        "quantity": 10,
        "weight": 5
      }
    ]
  }'
```

---

### ✅ **4. Sales Synchronization**

#### POST /api/sales/sync
Sync sales from mobile app to ERP

**Request Body:**
```json
{
  "sales": [
    {
      "vanId": "van-001",
      "repId": "rep-001",
      "customerId": "cust-001",
      "customerName": "John Doe",
      "items": [
        {
          "itemCode": "ITEM-001",
          "itemName": "Product A",
          "quantity": 2,
          "price": 50.00,
          "total": 100.00
        }
      ],
      "totalAmount": 100.00,
      "paymentMethod": "cash",
      "saleDate": "2025-12-30T10:00:00Z"
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/sales/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sales": [
      {
        "vanId": "van-001",
        "repId": "rep-001",
        "items": [
          {
            "itemCode": "ITEM-001",
            "itemName": "Product A",
            "quantity": 2,
            "price": 50.00,
            "total": 100.00
          }
        ],
        "totalAmount": 100.00,
        "paymentMethod": "cash",
        "saleDate": "2025-12-30T10:00:00Z"
      }
    ]
  }'
```

#### GET /api/sales/sync
Get sync status and queue

**Example:**
```bash
curl http://localhost:3000/api/sales/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Testing Workflow

### **1. Login and Get Token**

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  | jq -r '.data.token'

# Save token to variable (in bash)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  | jq -r '.data.token')

echo $TOKEN
```

### **2. Test Inventory**

```bash
# Get all inventory
curl http://localhost:3000/api/inventory | jq

# Create new item
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "itemCode": "TEST-001",
    "itemName": "Test Product",
    "quantity": 50,
    "unit": "pcs",
    "price": 25.00
  }' | jq
```

### **3. Test Van Stock Assignment**

```bash
# Get van stock
curl http://localhost:3000/api/vans/van-001/stock | jq

# Assign stock to van
curl -X POST http://localhost:3000/api/vans/van-001/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "itemCode": "ITEM-001",
        "itemName": "Product A",
        "quantity": 5,
        "weight": 2
      }
    ]
  }' | jq
```

### **4. Test Sales Sync**

```bash
# Sync sales
curl -X POST http://localhost:3000/api/sales/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sales": [
      {
        "vanId": "van-001",
        "repId": "rep-001",
        "items": [
          {
            "itemCode": "ITEM-001",
            "itemName": "Product A",
            "quantity": 1,
            "price": 50.00,
            "total": 50.00
          }
        ],
        "totalAmount": 50.00,
        "paymentMethod": "cash",
        "saleDate": "2025-12-30T10:00:00Z"
      }
    ]
  }' | jq

# Check sync status
curl http://localhost:3000/api/sales/sync \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 📊 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]
}
```

---

## 🔐 Authentication

All protected routes require an `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

Get a token by calling `/api/auth/login` first.

---

## ⚠️ Current Limitations (Development Mode)

1. **No Database**: Using in-memory storage (data resets on server restart)
2. **Simple Auth**: Basic token authentication (not JWT yet)
3. **Mock External APIs**: Inventory sync and ERP sync are mocked
4. **No Persistence**: All data is temporary

---

## 🚀 Next Steps

### **Phase 1: Database Integration** (High Priority)
1. Install Prisma: `npm install prisma @prisma/client`
2. Initialize Prisma: `npx prisma init`
3. Create database schema
4. Replace mock data with database queries

### **Phase 2: Real Authentication** (High Priority)
1. Install JWT: `npm install jsonwebtoken bcryptjs`
2. Implement proper JWT signing/verification
3. Add password hashing
4. Add refresh tokens

### **Phase 3: Frontend Integration** (Medium Priority)
1. Create API client functions
2. Add loading states to pages
3. Implement error handling
4. Add success notifications

### **Phase 4: External Integrations** (Medium Priority)
1. Connect to actual inventory system
2. Implement Odoo ERP sync
3. Add webhook support
4. Implement real-time updates

---

## 📝 Testing Checklist

- [ ] Login with admin credentials
- [ ] Login with manager credentials
- [ ] Get all inventory items
- [ ] Create new inventory item
- [ ] Sync inventory (admin only)
- [ ] Get van stock
- [ ] Assign stock to van
- [ ] Sync sales
- [ ] Check sync status
- [ ] Test validation errors
- [ ] Test authentication errors
- [ ] Test capacity validation

---

## 🐛 Troubleshooting

### "Cannot find module" errors
Make sure you're in the project directory and run:
```bash
npm install
```

### Authentication errors
Make sure you're including the Authorization header:
```bash
-H "Authorization: Bearer YOUR_TOKEN"
```

### CORS errors (if testing from browser)
Add CORS headers to API routes if needed.

---

**All API routes are now ready for testing! Start with the login endpoint to get your token, then test the other endpoints.** 🚀
