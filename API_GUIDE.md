# API Implementation Guide - Quick Start

## 🚀 Quick Setup

### 1. Create API Directory Structure

```bash
mkdir -p app/api/{inventory,vans,sales,reps,routes,sync,auth}/{[id],sync,assign,status,queue,logs,login,logout,session}
```

### 2. Basic API Route Template

```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET - List all resources
export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from database
    const data = []
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// POST - Create new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // TODO: Validate input
    // TODO: Save to database
    
    return NextResponse.json({
      success: true,
      data: body
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
```

---

## 📋 Priority API Routes to Implement

### **1. Inventory API** (Highest Priority)

```typescript
// app/api/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Fetch all inventory items
  const inventory = [
    {
      id: '1',
      itemCode: 'ITEM-001',
      itemName: 'Product A',
      quantity: 100,
      unit: 'pcs',
      price: 50.00
    }
  ]
  
  return NextResponse.json({ success: true, data: inventory })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Validate and create inventory item
  // TODO: Save to database
  
  return NextResponse.json({ 
    success: true, 
    data: body 
  }, { status: 201 })
}
```

```typescript
// app/api/inventory/sync/route.ts
export async function POST(request: NextRequest) {
  try {
    // Fetch from external inventory system
    // const externalData = await fetchFromInventorySystem()
    
    // Sync to local database
    // await syncToDatabase(externalData)
    
    return NextResponse.json({
      success: true,
      message: 'Inventory synced successfully',
      syncedItems: 0
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    )
  }
}
```

---

### **2. Vans Stock Assignment API**

```typescript
// app/api/vans/[id]/stock/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const vanId = params.id
  
  // Fetch van's current stock
  const stock = []
  
  return NextResponse.json({ success: true, data: stock })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const vanId = params.id
  const body = await request.json()
  
  // Validate stock assignment
  const { items } = body
  
  // Check van capacity
  // Validate item availability
  // Assign stock to van
  
  return NextResponse.json({
    success: true,
    message: 'Stock assigned successfully',
    data: { vanId, items }
  })
}
```

---

### **3. Sales Sync API**

```typescript
// app/api/sales/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { sales } = body
  
  try {
    // Validate sales data
    for (const sale of sales) {
      // Validate quantities
      // Check inventory
      // Update stock levels
    }
    
    // Sync to Odoo ERP
    // await syncToOdoo(sales)
    
    return NextResponse.json({
      success: true,
      message: 'Sales synced successfully',
      syncedCount: sales.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    )
  }
}
```

---

### **4. Authentication API**

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()
  
  // TODO: Validate credentials against database
  // const user = await validateUser(username, password)
  
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  }
  
  // Generate JWT token
  const token = sign(
    { userId: '1', username, role: 'admin' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  )
  
  return NextResponse.json({
    success: true,
    token,
    user: { username, role: 'admin' }
  })
}
```

---

## 🔧 Utility Functions

### **Validation Middleware**

```typescript
// lib/api/validation.ts
export function validateQuantities(items: any[]) {
  const errors = []
  
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Invalid quantity for item ${item.itemCode}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateVanCapacity(vanId: string, items: any[]) {
  // TODO: Fetch van capacity from database
  const vanCapacity = 5000 // kg
  
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  
  if (totalWeight > vanCapacity) {
    return {
      isValid: false,
      error: `Total weight ${totalWeight}kg exceeds van capacity ${vanCapacity}kg`
    }
  }
  
  return { isValid: true }
}
```

### **Auth Middleware**

```typescript
// lib/api/auth.ts
import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function checkAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return { authenticated: false, error: 'No token provided' }
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'secret')
    return { authenticated: true, user: decoded }
  } catch (error) {
    return { authenticated: false, error: 'Invalid token' }
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const auth = await checkAuth(request)
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      )
    }
    
    return handler(request, context, auth.user)
  }
}
```

---

## 📦 Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jazeera_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"

# External APIs
INVENTORY_SYSTEM_URL="https://inventory-api.example.com"
INVENTORY_API_KEY="your-api-key"

ODOO_URL="https://your-odoo-instance.com"
ODOO_DB="your-database"
ODOO_USERNAME="admin"
ODOO_PASSWORD="admin-password"

# App
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

---

## 🧪 Testing API Routes

### Using cURL:

```bash
# GET inventory
curl http://localhost:3000/api/inventory

# POST new inventory item
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"itemCode":"ITEM-001","itemName":"Product A","quantity":100}'

# Assign stock to van
curl -X POST http://localhost:3000/api/vans/van-001/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[{"itemCode":"ITEM-001","quantity":10}]}'

# Sync sales
curl -X POST http://localhost:3000/api/sales/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sales":[{"vanId":"van-001","amount":500}]}'
```

---

## 📊 Response Format Standard

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}

// List Response
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## 🚀 Next Steps

1. **Install Dependencies**
   ```bash
   npm install jsonwebtoken
   npm install @types/jsonwebtoken --save-dev
   ```

2. **Create API Routes** (in order of priority)
   - ✅ `app/api/inventory/route.ts`
   - ✅ `app/api/vans/[id]/stock/route.ts`
   - ✅ `app/api/sales/sync/route.ts`
   - ✅ `app/api/auth/login/route.ts`

3. **Setup Database Connection**
   - Choose database (PostgreSQL, MySQL, MongoDB)
   - Setup Prisma or your preferred ORM
   - Create database schema

4. **Implement Frontend Integration**
   - Create API client functions
   - Add loading states
   - Handle errors
   - Show success messages

5. **Testing**
   - Test each endpoint
   - Validate error handling
   - Check authentication
   - Test edge cases

---

**Ready to start implementing? Let me know which API route you'd like to create first!**
