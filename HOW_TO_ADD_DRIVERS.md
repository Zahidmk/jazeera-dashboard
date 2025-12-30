# How to Add Drivers in Your Dashboard

## 📋 Quick Guide: Adding Van Drivers

There are **two main ways** to add drivers to your system:

---

## Method 1: Add Driver via "Vans & Reps" Page ✅ (Recommended)

### **Step-by-Step:**

1. **Navigate to Vans & Reps**
   - Click on "Vans & Reps" in the sidebar menu
   - Or go to: `/dashboard/vans-reps`

2. **Click "Add Rep" Button**
   - Look for the blue "Add Rep" button in the top right
   - It has a "+" icon

3. **Fill in Driver Information**
   - **Name**: Driver's full name (e.g., "Ahmed Ali")
   - **Phone**: Contact number (e.g., "+966 50 123 4567")
   - **Shift**: Select shift timing (Morning/Evening/Night)
   - **Branch**: Select branch location

4. **Click "Save"**
   - Driver is now added to the system!

---

## Method 2: Add Driver via "Users & Roles" Page

### **Step-by-Step:**

1. **Navigate to Users & Roles**
   - Click on "Users & Roles" in the sidebar menu
   - Or go to: `/dashboard/users`

2. **Click "Add User" Button**
   - Look for the "Add User" button in the top right

3. **Fill in User Information**
   - **Name**: Full name
   - **Email**: Email address
   - **Phone**: Contact number
   - **Role**: Select "Driver" from dropdown
   - **Status**: Select "Active"
   - **Branch**: Select branch location

4. **Click "Save"**
   - User is created with driver role!

5. **Assign Van to Driver** (Optional)
   - Click the user icon (👤+) next to the driver
   - Select vans to assign
   - Click "Assign"

---

## 🎯 Which Method Should You Use?

### **Use "Vans & Reps" Page When:**
- ✅ You're adding drivers who will operate vans
- ✅ You want to quickly add operational staff
- ✅ You're managing daily van operations

### **Use "Users & Roles" Page When:**
- ✅ You're adding any type of user (Admin, Manager, Driver)
- ✅ You need to set specific permissions
- ✅ You're managing user accounts and access

---

## 📱 Visual Guide

### **Vans & Reps Page:**
```
┌────────────────────────────────────────────────┐
│ Vans & Reps              [Add Rep] [Add Van]   │
├────────────────────────────────────────────────┤
│                                                 │
│ Summary Cards:                                  │
│ [Total Vans: 15] [Van Drivers: 24]             │
│                                                 │
│ Vans Table                                      │
│ ┌────────────────────────────────────────────┐ │
│ │ Van Code | Registration | Driver | Status  │ │
│ │ VAN-001  | ABC-1234    | Ahmed  | Active  │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ Van Drivers Table                               │
│ ┌────────────────────────────────────────────┐ │
│ │ Name     | Phone        | Van    | Actions │ │
│ │ Ahmed    | +966 50...   | VAN-001| [Edit]  │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ Click [Add Rep] to add a new driver ←          │
└────────────────────────────────────────────────┘
```

### **Add Rep Modal:**
```
┌────────────────────────────────────────────────┐
│ Add Representative                        [X]  │
├────────────────────────────────────────────────┤
│                                                 │
│ Name: [________________]                        │
│                                                 │
│ Phone: [________________]                       │
│                                                 │
│ Shift: [Morning ▼]                              │
│                                                 │
│ Branch: [Riyadh Central ▼]                      │
│                                                 │
│                          [Cancel]  [Save]       │
└────────────────────────────────────────────────┘
```

---

## 🔄 Complete Workflow: From Driver to Van Assignment

### **Step 1: Add Driver**
```
Vans & Reps → [Add Rep] → Fill Form → [Save]
```

### **Step 2: Assign Van to Driver**
```
Option A: Edit Van
- Click [👁] on van row
- Select driver from dropdown
- Save

Option B: Edit Driver
- Click [✏️] on driver row
- Select assigned van
- Save
```

### **Step 3: Assign Route**
```
Routes Page → Select Route → Assign to Van
```

### **Step 4: Load Stock**
```
Stock Management → Select Van → Load Items
```

---

## 📊 Data Flow

```
1. Add Driver
   ↓
2. Assign Van to Driver
   ↓
3. Assign Route to Van
   ↓
4. Load Stock into Van
   ↓
5. Driver uses mobile app
   ↓
6. Makes sales on route
   ↓
7. Syncs back to dashboard
```

---

## 🎯 Quick Reference

### **Where to Find:**
- **Add Driver**: Vans & Reps page → "Add Rep" button (top right)
- **View Drivers**: Vans & Reps page → "Van Drivers" table (bottom)
- **Edit Driver**: Click ✏️ icon in Actions column
- **Assign Van**: Edit driver → Select van from dropdown

### **Required Information:**
- ✅ Name (required)
- ✅ Phone (required)
- ✅ Shift timing (required)
- ✅ Branch (required)

### **Optional Information:**
- Assigned Van (can be set later)
- Email address
- Employee ID

---

## 💡 Tips

1. **Add drivers before vans**: Makes assignment easier
2. **Use consistent naming**: "Ahmed Ali" not "ahmed" or "Ali, Ahmed"
3. **Verify phone numbers**: Important for mobile app access
4. **Set correct branch**: Affects reporting and management
5. **Assign vans immediately**: Helps with planning

---

## ❓ Common Questions

### **Q: Can one driver have multiple vans?**
A: Currently, one driver is assigned to one van at a time. You can reassign as needed.

### **Q: What's the difference between "Rep" and "Driver"?**
A: They're the same! "Rep" = "Representative" = "Driver". We use both terms.

### **Q: Do I need to create a user account for drivers?**
A: Not required for basic operations. Create user accounts only if drivers need dashboard access.

### **Q: How do drivers access the mobile app?**
A: Drivers use their phone number to log into the mobile app.

### **Q: Can I delete a driver?**
A: Yes, but it's better to set status to "Inactive" to preserve history.

---

## 🚀 Quick Start Checklist

- [ ] Navigate to "Vans & Reps" page
- [ ] Click "Add Rep" button
- [ ] Enter driver name
- [ ] Enter phone number
- [ ] Select shift timing
- [ ] Select branch
- [ ] Click "Save"
- [ ] Verify driver appears in table
- [ ] Assign van to driver (optional)
- [ ] Done! ✅

---

## 📞 Need Help?

If you're still confused:
1. Check the "Vans & Reps" page
2. Look for the blue "Add Rep" button
3. Fill in the form
4. Click Save

**It's that simple!** 🎉

---

## 🎬 Example

**Adding "Mohammed Hassan" as a driver:**

1. Go to: Vans & Reps
2. Click: "Add Rep"
3. Fill in:
   - Name: Mohammed Hassan
   - Phone: +966 55 987 6543
   - Shift: Morning
   - Branch: Riyadh Central
4. Click: "Save"
5. Done! Mohammed is now in the system

**Next steps:**
- Assign him to VAN-003
- Assign Route B to VAN-003
- Load stock into VAN-003
- Mohammed can start using the mobile app!

---

**Remember: Drivers = Reps = Sales Representatives = Van Drivers**
They're all the same thing in your system! 🚚👨‍💼
