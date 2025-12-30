# System Structure - Van-Based Sales Management

## 📋 Overview

This dashboard manages a **van-based sales system** where van drivers are the primary sales representatives. There is NO separate "relay reps" concept - the van drivers handle all sales activities directly.

---

## 🚚 System Hierarchy

```
Company/Branch
    ↓
  Vans (Delivery Vehicles)
    ↓
  Van Drivers/Sales Reps
    ↓
  Routes & Customers
    ↓
  Sales & Deliveries
```

---

## 👥 User Roles

### **1. Van Driver / Sales Representative**
- **Primary Role**: Drive the van AND make sales
- **Responsibilities**:
  - Deliver products to customers
  - Make sales on the route
  - Collect payments (cash/card)
  - Manage van inventory
  - Report daily sales
  - Handle customer relationships

### **2. Manager / Admin**
- **Responsibilities**:
  - Assign vans to drivers
  - Load stock into vans
  - Assign routes
  - Monitor sales performance
  - Manage inventory
  - Generate reports

---

## 🚛 Van Management

Each van:
- Has ONE or MORE assigned drivers/reps
- Carries inventory (stock)
- Follows assigned routes
- Tracks sales made from that van
- Has capacity limits
- Syncs data with central system

---

## 📱 Mobile App (Van Driver App)

Van drivers use the mobile app to:
- View assigned routes
- Check van inventory
- Record sales transactions
- Collect customer payments
- Update delivery status
- Sync data with dashboard

---

## 💻 Dashboard (Admin/Manager)

Managers use the dashboard to:
- Manage vans and assign drivers
- Load stock into vans
- Create and assign routes
- Monitor real-time sales
- Track van locations
- Generate performance reports
- Sync with Odoo ERP

---

## 🔄 Data Flow

```
1. Manager loads stock into van
2. Manager assigns driver to van
3. Manager assigns route to van
4. Driver uses mobile app on route
5. Driver makes sales and records them
6. Sales sync to dashboard
7. Dashboard syncs to Odoo ERP
8. Reports generated for management
```

---

## 📊 Key Modules

### **Active Modules:**
1. ✅ **Dashboard** - Overview and KPIs
2. ✅ **Vans & Reps** - Manage vans and assign drivers
3. ✅ **Users & Roles** - User management
4. ✅ **Routes** - Route planning and assignment
5. ✅ **Stock Management** - Inventory and van loading
6. ✅ **Cash Sales** - Sales tracking and reporting
7. ✅ **Settings** - System configuration

### **Disabled Modules:**
- ❌ **Relay Reps** - Not needed (drivers handle everything)
- ❌ **Leads & Customers** - Future feature
- ❌ **Orders & Deliveries** - Future feature
- ❌ **Reports** - Future feature
- ❌ **Sync Queue & Logs** - Future feature

---

## 🎯 Terminology

| Term | Meaning in This System |
|------|------------------------|
| **Van** | Delivery vehicle with inventory |
| **Rep / Driver** | Person who drives van AND makes sales |
| **Route** | Planned path with customer stops |
| **Stock Loading** | Assigning inventory to a van |
| **Van Assignment** | Assigning a driver to a van |
| **Cash Sales** | Sales made by van drivers |
| **Sync** | Data synchronization between mobile app, dashboard, and ERP |

---

## 🔑 Important Notes

1. **No Relay Reps**: Unlike some systems, we don't have separate "relay representatives" who work independently. All sales are made by van drivers.

2. **Van-Centric**: Everything revolves around vans:
   - Stock is loaded into vans
   - Drivers are assigned to vans
   - Routes are assigned to vans
   - Sales are tracked per van

3. **Driver = Sales Rep**: The person driving the van is also the sales representative. They handle:
   - Driving
   - Selling
   - Collecting payments
   - Customer service

4. **Mobile-First Sales**: Sales are recorded on the mobile app by drivers in the field, then synced to the dashboard.

5. **ERP Integration**: All data eventually syncs to Odoo ERP for company-wide reporting and accounting.

---

## 📈 Typical Workflow

### **Morning (Stock Loading)**
1. Manager checks inventory
2. Manager loads stock into vans
3. System records stock assignment
4. Van capacity is updated

### **Route Assignment**
1. Manager creates/selects route
2. Manager assigns route to van
3. Driver receives route on mobile app
4. Driver sees customer list and locations

### **During Route (Sales)**
1. Driver visits customers
2. Driver shows products
3. Customer makes purchase
4. Driver records sale in mobile app
5. Driver collects payment
6. Sale is queued for sync

### **End of Day (Sync & Reporting)**
1. Driver returns to base
2. Mobile app syncs all sales
3. Dashboard updates in real-time
4. Manager reviews daily performance
5. Data syncs to Odoo ERP
6. Reports are generated

---

## 🔄 Integration Points

### **Mobile App ↔ Dashboard**
- Sales data sync
- Inventory updates
- Route information
- Real-time status

### **Dashboard ↔ Odoo ERP**
- Sales transactions
- Inventory levels
- Customer data
- Financial reports

### **Dashboard ↔ Inventory System**
- Stock availability
- Product information
- Pricing updates

---

## 🎨 UI/UX Principles

1. **Van-Centric Views**: Most screens organize data by van
2. **Driver-Friendly**: Mobile app is simple and fast
3. **Manager Dashboard**: Comprehensive overview and control
4. **Real-Time Updates**: Live sync status and notifications
5. **Mobile Responsive**: Dashboard works on tablets for field managers

---

**This system is designed for efficiency in van-based sales operations where drivers are empowered to handle the complete sales process from delivery to payment collection.**
