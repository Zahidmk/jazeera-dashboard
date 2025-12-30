# Next.js Dashboard - Architecture & Responsibilities

## 📋 Overview
This Next.js application serves as a **Middleware Dashboard** for managing van sales operations, inventory, and synchronization between the mobile app and Odoo ERP system.

---

## 🎯 Next.js Responsibilities

### ✅ **Frontend (Dashboard UI)**

#### 1. **Admin Dashboard** (`/dashboard`)
- **KPI Cards**: Sales performance, team metrics, delivery stats
- **Charts**: Van distribution, rep distribution, performance analytics
- **Overview Tables**: Base vans, base representatives
- **Real-time Status**: Sync status, system health

#### 2. **Van Management** (`/dashboard/vans`, `/dashboard/vans-reps`)
- Van list with details (code, registration, status, capacity)
- Van details page with inventory, sync logs, assigned reps
- Add/Edit van functionality
- Assign representatives to vans
- Track van locations and routes

#### 3. **Stock Overview** (`/dashboard/stock`)
- Current inventory levels per van
- Stock loading interface
- Capacity management
- Stock allocation to vans
- Low stock alerts

#### 4. **Sales Reports** (`/dashboard/reports`, `/dashboard/cash-sales`)
- Sales by van
- Sales by route
- Sales by representative
- Cash sales tracking
- Revenue analytics

#### 5. **Sync Status** (`/dashboard/sync`)
- Sync queue management
- Sync logs and history
- Error tracking
- Retry mechanisms
- Real-time sync status

#### 6. **Additional Features**
- **Users & Roles** (`/dashboard/users`): User management, permissions
- **Routes** (`/dashboard/routes`): Route planning and assignment
- **Leads** (`/dashboard/leads`): Customer lead management
- **Orders** (`/dashboard/orders`): Order tracking and delivery
- **Settings** (`/dashboard/settings`): System configuration

---

### ✅ **Backend (API Routes)**

#### **Required API Structure**

```
app/api/
├── inventory/
│   ├── route.ts              # GET: Fetch all inventory
│   ├── [id]/route.ts         # GET/PUT/DELETE: Single item
│   └── sync/route.ts         # POST: Sync from inventory system
│
├── vans/
│   ├── route.ts              # GET: All vans, POST: Create van
│   ├── [id]/route.ts         # GET/PUT/DELETE: Single van
│   ├── [id]/stock/route.ts   # GET/POST: Van inventory
│   └── [id]/assign/route.ts  # POST: Assign stock to van
│
├── sales/
│   ├── route.ts              # GET: All sales, POST: Create sale
│   ├── [id]/route.ts         # GET/PUT/DELETE: Single sale
│   ├── sync/route.ts         # POST: Sync sales to ERP
│   └── reports/route.ts      # GET: Sales reports
│
├── reps/
│   ├── route.ts              # GET: All reps, POST: Create rep
│   ├── [id]/route.ts         # GET/PUT/DELETE: Single rep
│   └── [id]/assign/route.ts  # POST: Assign rep to van
│
├── routes/
│   ├── route.ts              # GET: All routes, POST: Create route
│   └── [id]/route.ts         # GET/PUT/DELETE: Single route
│
├── sync/
│   ├── status/route.ts       # GET: Sync status
│   ├── queue/route.ts        # GET: Sync queue
│   └── logs/route.ts         # GET: Sync logs
│
└── auth/
    ├── login/route.ts        # POST: User login
    ├── logout/route.ts       # POST: User logout
    └── session/route.ts      # GET: Current session
```

---

## 🔧 API Route Responsibilities

### **1. Inventory Management**
```typescript
// app/api/inventory/route.ts
GET  /api/inventory          // Fetch all inventory from inventory system
POST /api/inventory          // Add new inventory item

// app/api/inventory/[id]/route.ts
GET    /api/inventory/:id    // Get single item
PUT    /api/inventory/:id    // Update item
DELETE /api/inventory/:id    // Delete item

// app/api/inventory/sync/route.ts
POST /api/inventory/sync     // Sync inventory from external system
```

**Responsibilities:**
- Fetch inventory from inventory management system
- Validate stock quantities
- Update inventory levels
- Handle inventory sync errors

---

### **2. Van Stock Assignment**
```typescript
// app/api/vans/[id]/stock/route.ts
GET  /api/vans/:id/stock     // Get van's current stock
POST /api/vans/:id/stock     // Assign stock to van

// app/api/vans/[id]/assign/route.ts
POST /api/vans/:id/assign    // Assign stock items to van
```

**Responsibilities:**
- Assign stock to specific vans
- Validate stock availability
- Check van capacity limits
- Update inventory after assignment
- Track stock movement history

---

### **3. Sales Synchronization**
```typescript
// app/api/sales/route.ts
GET  /api/sales              // Get all sales
POST /api/sales              // Create new sale

// app/api/sales/sync/route.ts
POST /api/sales/sync         // Sync sales back to ERP
```

**Responsibilities:**
- Receive sales data from mobile app
- Validate sales transactions
- Sync sales to Odoo ERP
- Handle sync failures and retries
- Update inventory after sales
- Generate sales reports

---

### **4. Quantity Validation**
```typescript
// Middleware in API routes
export async function validateQuantities(items: StockItem[]) {
  // Check if requested quantities are available
  // Validate against van capacity
  // Ensure no negative quantities
  // Return validation errors if any
}
```

**Responsibilities:**
- Validate stock quantities before assignment
- Check van capacity constraints
- Prevent over-allocation
- Ensure data integrity

---

### **5. Authentication & Roles**
```typescript
// app/api/auth/login/route.ts
POST /api/auth/login         // User authentication

// Middleware
export async function checkAuth(req: Request) {
  // Verify JWT token
  // Check user permissions
  // Return user role
}
```

**Responsibilities:**
- User authentication
- Role-based access control (Admin, Manager, Rep)
- Session management
- Protected route access

---

## 📁 Current Project Structure

```
app/
├── dashboard/
│   ├── page.tsx                    # ✅ Main dashboard
│   ├── vans/
│   │   └── [id]/page.tsx          # ✅ Van details
│   ├── vans-reps/page.tsx         # ✅ Vans & Reps management
│   ├── stock/page.tsx             # ⚠️ Needs implementation
│   ├── cash-sales/page.tsx        # ⚠️ Needs implementation
│   ├── reports/page.tsx           # ⚠️ Needs implementation
│   ├── sync/page.tsx              # ⚠️ Needs implementation
│   ├── routes/page.tsx            # ⚠️ Needs implementation
│   ├── users/page.tsx             # ⚠️ Needs implementation
│   └── settings/page.tsx          # ⚠️ Needs implementation
│
├── api/                            # ❌ NOT YET CREATED
│   ├── inventory/
│   ├── vans/
│   ├── sales/
│   ├── reps/
│   ├── routes/
│   ├── sync/
│   └── auth/
│
└── mobile/                         # ✅ Mobile app routes
    ├── home/page.tsx
    ├── orders/page.tsx
    └── ...
```

---

## 🚀 Next Steps - Implementation Priority

### **Phase 1: API Routes (High Priority)**
1. ✅ Create `app/api` directory structure
2. ✅ Implement authentication endpoints
3. ✅ Create inventory API routes
4. ✅ Create vans API routes
5. ✅ Create sales API routes

### **Phase 2: Frontend Pages (Medium Priority)**
1. ⚠️ Complete stock management page
2. ⚠️ Build sales reports page
3. ⚠️ Implement sync status page
4. ⚠️ Create routes management page

### **Phase 3: Integration (High Priority)**
1. 🔄 Connect frontend to API routes
2. 🔄 Implement real-time sync
3. 🔄 Add error handling
4. 🔄 Setup authentication flow

### **Phase 4: Testing & Optimization**
1. 🧪 API endpoint testing
2. 🧪 Frontend integration testing
3. ⚡ Performance optimization
4. 🔒 Security hardening

---

## 💡 Key Features to Implement

### **Stock Assignment Flow**
1. Admin selects van
2. Views available inventory
3. Assigns stock items with quantities
4. System validates capacity and availability
5. Updates van inventory
6. Logs transaction

### **Sales Sync Flow**
1. Mobile app records sale
2. Sends to Next.js API
3. API validates and stores
4. Queues for ERP sync
5. Syncs to Odoo
6. Updates inventory
7. Generates reports

### **Real-time Dashboard**
1. WebSocket connection for live updates
2. Auto-refresh sync status
3. Real-time notifications
4. Live inventory updates

---

## 🔐 Security Considerations

- JWT-based authentication
- Role-based access control
- API rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens

---

## 📊 Database Schema (Recommended)

```sql
-- Vans
CREATE TABLE vans (
  id UUID PRIMARY KEY,
  van_code VARCHAR(50) UNIQUE,
  registration_number VARCHAR(50),
  capacity DECIMAL,
  current_load DECIMAL,
  status VARCHAR(20),
  branch VARCHAR(100),
  created_at TIMESTAMP
);

-- Inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  item_code VARCHAR(50) UNIQUE,
  item_name VARCHAR(255),
  quantity DECIMAL,
  unit VARCHAR(20),
  price DECIMAL,
  updated_at TIMESTAMP
);

-- Van Stock
CREATE TABLE van_stock (
  id UUID PRIMARY KEY,
  van_id UUID REFERENCES vans(id),
  item_id UUID REFERENCES inventory(id),
  quantity DECIMAL,
  assigned_at TIMESTAMP,
  assigned_by UUID
);

-- Sales
CREATE TABLE sales (
  id UUID PRIMARY KEY,
  van_id UUID REFERENCES vans(id),
  rep_id UUID,
  customer_id UUID,
  total_amount DECIMAL,
  payment_method VARCHAR(50),
  sync_status VARCHAR(20),
  created_at TIMESTAMP,
  synced_at TIMESTAMP
);
```

---

## 📝 Notes

- Use TypeScript for type safety
- Implement proper error handling
- Add logging for debugging
- Use environment variables for configuration
- Implement caching for performance
- Add API documentation (Swagger/OpenAPI)

---

**Status Legend:**
- ✅ Implemented
- ⚠️ Needs implementation
- ❌ Not yet created
- 🔄 In progress
- 🧪 Testing phase
- ⚡ Optimization needed
