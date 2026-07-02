# Testing Guide - Admin Dashboard Phase 3

## ✅ Current Status

**Server:** Running at `http://localhost:3000`  
**Build:** Success  
**TypeScript:** No errors  
**Middleware:** Working ✓  

---

## 🧪 Testing Steps

### **Step 1: Create First User (Becomes Admin)**

1. **Visit the app:**
   ```
   http://localhost:3000
   ```

2. **Sign up/Sign in:**
   - Use Google OAuth to sign in
   - This will create the first user in Firebase
   - **The first user automatically gets admin role** (implemented in `lib/auth.ts`)

3. **Verify user creation in Firebase:**
   - Go to Firebase Console → Firestore
   - Check `users` collection
   - Confirm your user document has `role: "admin"`

---

### **Step 2: Access Admin Dashboard**

1. **Navigate to admin page:**
   ```
   http://localhost:3000/admin
   ```

2. **What you should see:**
   - ✅ Dark Raycast-themed sidebar
   - ✅ Dashboard with 4 metric cards
   - ✅ User Growth chart (line chart)
   - ✅ Task Status chart (donut chart)
   - ✅ Token Usage chart (bar chart)
   - ✅ Feature Usage chart (area chart)

3. **If redirected to login:**
   - Clear browser cookies/cache
   - Sign out and sign in again
   - Make sure you're logged in

---

### **Step 3: Test API Endpoints**

#### **Option A: Browser Console Testing**

1. **Open browser console** (F12 or Cmd+Option+I)

2. **Get your user token:**
   ```javascript
   // Check if user is logged in
   const userStr = localStorage.getItem('user');
   const user = userStr ? JSON.parse(userStr) : null;
   const token = user?.idToken || user?.accessToken;
   console.log('Token:', token);
   
   // If no token, you need to sign in
   if (!token) {
     console.log('No token found. Please sign in.');
   }
   ```

3. **Test dashboard metrics:**
   ```javascript
   const token = JSON.parse(localStorage.getItem('user'))?.idToken;
   
   fetch('/api/admin/dashboard', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   .then(r => r.json())
   .then(data => console.log('Dashboard:', data))
   .catch(err => console.error('Error:', err));
   ```

4. **Test user analytics:**
   ```javascript
   fetch('/api/admin/analytics/users?range=7d', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   .then(r => r.json())
   .then(data => console.log('User metrics:', data))
   .catch(err => console.error('Error:', err));
   ```

#### **Option B: cURL Testing (from terminal)**

1. **Get your token from browser console:**
   ```javascript
   // In browser console:
   JSON.parse(localStorage.getItem('user'))?.idToken
   ```

2. **Test endpoints:**
   ```bash
   # Replace YOUR_TOKEN with actual token
   
   # Dashboard metrics
   curl http://localhost:3000/api/admin/dashboard \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # User analytics
   curl "http://localhost:3000/api/admin/analytics/users?range=7d" \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Task analytics
   curl "http://localhost:3000/api/admin/analytics/tasks?range=7d" \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # System config
   curl http://localhost:3000/api/admin/config \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # User list
   curl http://localhost:3000/api/admin/users \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

### **Step 4: Test Authentication & Authorization**

#### **Test 1: First User Becomes Admin**

1. **Check Firestore:**
   - Open Firebase Console
   - Navigate to Firestore → `users` collection
   - Find your user document
   - Verify `role: "admin"` field exists

2. **Expected behavior:**
   - If `users` collection is empty: your role = "admin"
   - If users already exist: your role = "user"

#### **Test 2: Non-Admin User Can't Access**

1. **Create a second user:**
   - Sign out
   - Sign in with a different Google account
   - This user should get `role: "user"`

2. **Try to access admin:**
   - Visit `http://localhost:3000/admin`
   - **Should redirect to home page**

3. **Verify in Firestore:**
   - Check second user has `role: "user"`

#### **Test 3: Admin User Can Access**

1. **Sign in as first user (admin):**
   - Visit `http://localhost:3000/admin`
   - **Should see admin dashboard**

2. **Check sidebar:**
   - Your name and email should appear
   - Avatar shows first letter of name

---

### **Step 5: Test Dashboard Functionality**

#### **Test Date Range Picker:**

1. **Click date picker:**
   - Should show dropdown
   - Options: "Last 7 Days" and "Last 30 Days"

2. **Select "Last 30 Days":**
   - Charts should recalculate
   - Data should reflect 30 days of history

3. **Check console for API calls:**
   - Network tab should show requests to `/api/admin/analytics/*?range=30d`

#### **Test Navigation:**

1. **Click each sidebar link:**
   - `/admin` → Dashboard
   - `/admin/analytics` → Analytics
   - `/admin/settings` → Settings
   - `/admin/users` → User List
   - `/admin/logs` → Audit Logs

2. **Verify active state:**
   - Active page should have red left border
   - Background should be slightly highlighted

---

### **Step 6: Test Real Data Integration**

#### **Create Test Data:**

1. **Create some tasks:**
   - Use the task creation API or chat interface
   - Create tasks with different statuses (pending, in-progress, completed)

2. **Check task metrics:**
   - Visit `/api/admin/analytics/tasks`
   - Should show counts by status

3. **Task Status Chart:**
   - Dashboard should show task distribution
   - Pending, In Progress, Completed counts

#### **Verify Metrics:**

1. **User Count:**
   ```javascript
   // Check Firebase Console > Firestore
   // Count documents in 'users' collection
   ```

2. **Task Count:**
   ```javascript
   // Check Firebase Console > Firestore
   // Count documents in 'tasks' collection
   ```

3. **Dashboard should match:**
   - Total Users = users collection count
   - Tasks Created = tasks collection count

---

## 🐛 Troubleshooting

### **Issue: Redirected to Login**

**Cause:** No valid session  
**Solution:**
1. Clear browser cookies
2. Sign out and sign in again
3. Check Firebase Console for user creation

### **Issue: 401 Unauthorized**

**Cause:** Invalid or expired token  
**Solution:**
1. Refresh your token:
   ```javascript
   // In browser console:
   await auth.currentUser.getIdToken(true);
   ```
2. Sign out and sign in again

### **Issue: Empty Dashboard**

**Cause:** No data in Firestore yet  
**Solution:**
1. Create some tasks via the chat interface
2. Charts will populate with real data
3. Until then, mock data may be used

### **Issue: Charts Not Loading**

**Cause:** API returning empty array  
**Solution:**
1. Check browser console for errors
2. Verify API response in Network tab
3. Check Firestore has data for the date range

### **Issue: Role Not Set**

**Cause:** User document missing role field  
**Solution:**
1. Go to Firebase Console → Firestore
2. Find your user document
3. Add field: `role: "admin"`
4. Refresh page

---

## 📊 Expected Data Flow

```
Browser
  ↓ (fetch with token)
Analytics Client (lib/admin/analytics-client.ts)
  ↓ (Authorization header)
API Routes (/api/admin/*)
  ↓ (verifyAdminUser)
Firestore Query
  ↓ (data)
JSON Response
  ↓ (setMetrics)
React State Update
  ↓ (props)
Chart Components
  ↓ (render)
Recharts Visualizations
```

---

## ✅ Test Checklist

### **Authentication**
- [ ] First user gets admin role automatically
- [ ] Second user gets user role
- [ ] Admin can access /admin routes
- [ ] Non-admin is redirected to home
- [ ] Session persists across refreshes

### **Dashboard**
- [ ] Dashboard loads with 4 metric cards
- [ ] User Growth chart displays
- [ ] Task Status chart displays
- [ ] Token Usage chart displays
- [ ] Feature Usage chart displays
- [ ] Date range picker works
- [ ] Charts update on date change

### **API Endpoints**
- [ ] `/api/admin/dashboard` returns metrics
- [ ] `/api/admin/analytics/users` returns user data
- [ ] `/api/admin/analytics/tasks` returns task data
- [ ] `/api/admin/config` returns system config
- [ ] All endpoints return 401 without token
- [ ] Non-admin tokens return empty data or 403

### **Sidebar**
- [ ] All navigation links work
- [ ] Active state shows correctly
- [ ] User avatar displays
- [ ] User email displays
- [ ] Hover effects work

### **Real Data**
- [ ] User count matches Firestore
- [ ] Task count matches Firestore
- [ ] Growth rates calculated correctly
- [ ] Charts reflect actual data

---

## 📝 Test Report Template

After testing, please report:

1. **✅ Working Features:**
   - List of features that work correctly

2. **❌ Issues Found:**
   - Describe any errors or unexpected behavior
   - Include browser console errors
   - Include API error responses

3. **📊 Data Accuracy:**
   - Dashboard metrics vs. Firestore counts
   - Discrepancies in calculations

4. **🎨 UI/UX Issues:**
   - Visual bugs
   - Layout problems
   - Responsive issues

5. **🔐 Auth/Auth Issues:**
   - Role assignment problems
   - Access control issues
   - Session management bugs

---

**Ready to test?** Start with Step 1 and work through each step systematically.

**Need help?** Share specific error messages or screenshots, and I'll help troubleshoot.