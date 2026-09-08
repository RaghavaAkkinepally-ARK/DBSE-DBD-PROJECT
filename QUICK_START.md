# 🚀 QUICK START GUIDE

## Blood Bank Management System - 5 Minutes to Launch

### Prerequisites
- MySQL 8.x installed and running
- Node.js (v14+) installed
- Terminal/PowerShell access

---

## Step 1️⃣: Create Database (2 minutes)

### Windows PowerShell:
```powershell
cd C:\blood-bank-management
mysql -u root -p < database.sql
```
Enter your MySQL password when prompted.

**Expected Output:**
```
Query OK, 1 row affected (0.01 sec)
Query OK, 50 rows affected (0.05 sec)
...
```

---

## Step 2️⃣: Configure Environment (1 minute)

Edit `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password_here
DB_NAME=BloodBankDB
PORT=3000
```

---

## Step 3️⃣: Install Dependencies (1 minute)

```powershell
cd C:\blood-bank-management\backend
npm install
```

**Wait for** `added XX packages in Xs`

---

## Step 4️⃣: Start Server (1 minute)

```powershell
npm start
```

**Expected Output:**
```
✓ MySQL Connected Successfully
✓ Server running at http://localhost:3000
✓ API available at http://localhost:3000/api
```

---

## Step 5️⃣: Open Application

Open your browser:
```
http://localhost:3000
```

**You should see:** Dashboard with statistics and blood availability

---

## ✅ Quick Verification

- [ ] Dashboard shows: Total Donors > 0
- [ ] Blood Availability table has data
- [ ] Can click "Donors" and see 50+ donors
- [ ] Can add new donor
- [ ] Can view blood inventory
- [ ] Can create blood requests
- [ ] Can issue blood (transaction test)
- [ ] Can view billing records

---

## 🔍 Testing Blood Issuance (Most Important)

1. Go to **Blood Requests** → Click **+ Create Request**
2. Select a recipient, blood group, and set priority
3. Click **Create Request**
4. Go to **Blood Requests**, find your request, click **Approve**
5. Go to **Blood Issues** → Click **+ Issue Blood**
6. Select your approved request
7. Select an available blood unit
8. Click **Issue Blood**
9. ✅ If successful: "Blood issued successfully! (Transaction completed)"
10. Verify: Blood_Inventory status changed, Blood_Request status changed

---

## 🐛 Common Issues

### "Cannot connect to MySQL"
- Check MySQL is running
- Verify password in .env
- Try: `mysql -u root -p` to test connection

### "Port 3000 already in use"
- Kill existing process or change PORT in .env

### "npm not found"
- Reinstall Node.js from nodejs.org

### "Missing tables in database"
- Run: `mysql -u root -p < database.sql` again

---

## 📱 Frontend Features to Try

| Feature | Location | Test |
|---------|----------|------|
| Dashboard | Home | Refresh and see real-time stats |
| Donor Search | Donors | Search by name, filter by blood group |
| Donation History | Donors → History | Click "History" on any donor |
| Expiring Blood Alert | Inventory | Click "Expiring Soon" |
| Emergency Requests | Reports | Red-highlighted emergency requests |
| Blood Availability | Dashboard | Blood groups with quantities |
| Billing Summary | Reports | Total paid vs pending |

---

## 📊 Database Verification

### In MySQL:
```sql
USE BloodBankDB;
SHOW TABLES;                      -- Should show 10 tables
SELECT COUNT(*) FROM Donor;       -- Should show 50
SELECT COUNT(*) FROM Donation;    -- Should show 50
SELECT * FROM Available_Blood;    -- View showing available blood
CALL GetBloodStock('O+');         -- Stored procedure test
```

---

## 🔐 Important Files

| File | Purpose | Edit if... |
|------|---------|-----------|
| `backend/.env` | Database credentials | MySQL password changes |
| `database.sql` | Schema + data | Need to reset database |
| `frontend/index.html` | UI layout | Want to modify design |
| `backend/server.js` | API routes | Adding new features |
| `frontend/js/script.js` | Frontend logic | Changing data binding |

---

## 🎯 For DBMS Viva Examiner

Show them:
1. **Database Schema**: Run `SHOW CREATE TABLE Donor;` in MySQL
2. **Sample Data**: Run `SELECT * FROM Donor LIMIT 5;`
3. **Transaction**: Demonstrate blood issuance → Check Blood_Inventory and Blood_Request changed
4. **Stored Procedure**: Run `CALL GetBloodStock('O+');`
5. **Trigger**: Show expired blood auto-marked as 'Expired'
6. **JOIN Queries**: Show donations with donor names from reports
7. **Reports**: Generate blood stock report showing GROUP BY aggregation

---

## 📝 Key Points for Viva

✅ **What the project does**: Complete blood bank management from donation to billing

✅ **Database**: 10 normalized tables with proper relationships

✅ **CRUD**: All operations available via web interface connected to real MySQL

✅ **Transactions**: Blood issuance uses ACID transaction (all or nothing)

✅ **Advanced DB**: Views (Available_Blood), Stored Procedures (GetBloodStock), Triggers (expire_blood)

✅ **API**: 40+ REST endpoints covering all major operations

✅ **Frontend**: Real-time dashboards pulling live data from MySQL, not hardcoded

---

## 🚨 Must Remember

- **Do NOT commit .env to GitHub** (it has passwords)
- **Keep MySQL running** while using the application
- **Sample data is realistic** (donors linked to donations, donations to screening, etc.)
- **All statistics on dashboard** come from actual MySQL queries
- **Tables in frontend** show real data from database (not fake/mock)
- **Foreign keys enforced** - can't delete donor with donations

---

## 📞 Stop Server

Press `Ctrl + C` in PowerShell

---

## ✨ You're Ready!

The system is now running with:
- ✅ MySQL database with 50+ sample records
- ✅ Express backend with 40+ API endpoints
- ✅ Responsive frontend with 12 management modules
- ✅ Complete DBMS implementation

**Good luck with your DBMS project! 🎓**

---

**Need help?** Check README.md for detailed documentation.
