# Blood Bank Management System

A complete, production-ready Blood Bank Management System built as a college DBMS project. This is a localhost-based web application that demonstrates all essential database management concepts including relationships, CRUD operations, transactions, views, stored procedures, and triggers.

## 🎯 Project Overview

This system manages the complete lifecycle of blood banking operations:
- **Donor Management**: Register, track, and manage blood donors
- **Donation Campaigns**: Organize and track blood collection camps
- **Blood Screening & Testing**: Record test results and donation quality
- **Blood Inventory**: Manage blood units with expiry tracking
- **Hospital & Recipient Management**: Link hospitals and recipients
- **Blood Requests**: Handle blood requests with priority levels
- **Blood Issuance**: Issue blood with ACID transactions
- **Billing**: Automated billing for blood units
- **Reports & Analytics**: Comprehensive dashboard and reports

## 🏗️ Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Responsive design with red/maroon hospital theme
- **Vanilla JavaScript**: No framework, pure JS for CRUD operations
- **Responsive Layout**: Works on desktop, tablet, and mobile

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **mysql2/promise**: Async MySQL connection pool
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Database
- **MySQL 8.x**: Relational database
- **10 Tables** with proper relationships
- **Foreign Keys**: Data integrity constraints
- **Transactions**: ACID compliance for critical operations
- **Views**: Complex data aggregation
- **Stored Procedures**: Reusable database logic
- **Triggers**: Automatic business logic execution

## 📊 Database Design

### Tables (10 Total)

1. **Donor** (50+ records)
   - donor_id, donor_name, gender, date_of_birth, blood_group
   - phone (UNIQUE), email, address, city
   - eligibility_status, last_donation_date

2. **Donation_Camp** (8 records)
   - camp_id, camp_name, location, camp_date
   - organizer, contact

3. **Donation** (50 records)
   - donation_id, donor_id (FK), camp_id (FK)
   - donation_date, quantity_ml, donation_status

4. **Screening** (50 records)
   - screening_id, donation_id (FK - UNIQUE)
   - HIV, Hepatitis B, Hepatitis C, Malaria results
   - blood_pressure, hemoglobin, overall_result

5. **Blood_Inventory** (50+ records)
   - blood_id, donation_id (FK), blood_group
   - component_type, quantity_ml, collection_date
   - expiry_date, status (Available/Issued/Expired)

6. **Hospital** (10 records)
   - hospital_id, hospital_name, address, city, phone

7. **Recipient** (30 records)
   - recipient_id, hospital_id (FK), recipient_name
   - age, gender, blood_group, contact

8. **Blood_Request** (30 records)
   - request_id, recipient_id (FK), blood_group
   - component_type, units_required, request_date
   - priority (Normal/Urgent/Emergency)
   - status (Pending/Approved/Fulfilled/Rejected)

9. **Blood_Issue** (20 records)
   - issue_id, request_id (FK), blood_id (FK)
   - issue_date, quantity_ml

10. **Billing** (20 records)
    - bill_id, issue_id (FK - UNIQUE), bill_date
    - amount, payment_method, payment_status

### Database Objects

**View: Available_Blood**
```sql
SELECT blood_group, component_type, COUNT(*) as available_units, SUM(quantity_ml) as total_quantity
FROM Blood_Inventory
WHERE status = 'Available'
GROUP BY blood_group, component_type;
```

**Stored Procedure: GetBloodStock**
```sql
PROCEDURE GetBloodStock(IN requested_group VARCHAR(5))
Returns available blood inventory for a specific blood group
```

**Trigger: expire_blood_on_date**
Automatically marks blood units as 'Expired' when expiry date passes

## 🚀 Installation & Setup

### Prerequisites
- **MySQL 8.x** installed and running
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Step 1: Create MySQL Database

```bash
# Start MySQL and run the database schema
mysql -u root -p < C:\blood-bank-management\database.sql
```

Enter your MySQL password when prompted.

### Step 2: Configure Environment Variables

Edit `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=BloodBankDB
PORT=3000
NODE_ENV=development
```

**⚠️ Important**: Do NOT commit `.env` to version control. Use `.env.example` as reference.

### Step 3: Install Backend Dependencies

```bash
cd C:\blood-bank-management\backend
npm install
```

This installs:
- express
- mysql2 (with promise support)
- cors
- dotenv

### Step 4: Start the Backend Server

```bash
npm start
```

Expected output:
```
✓ MySQL Connected Successfully
✓ Server running at http://localhost:3000
✓ API available at http://localhost:3000/api
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📋 Project Structure

```
blood-bank-management/
│
├── backend/
│   ├── server.js              # Main Express server with all API routes
│   ├── db.js                  # MySQL connection pool configuration
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables (DO NOT COMMIT)
│
├── frontend/
│   ├── index.html             # Main dashboard UI with all sections
│   ├── css/
│   │   └── style.css          # Complete responsive styling
│   └── js/
│       └── script.js          # All frontend logic and API integration
│
├── database.sql               # Complete database schema + sample data
├── .env.example               # Example environment file
├── README.md                  # This file
└── package.json               # Root package.json (optional)
```

## 🔌 API Endpoints

All endpoints return JSON and use standard HTTP methods.

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Donor Management
- `GET /api/donors` - List all donors
- `GET /api/donors/:id` - Get specific donor
- `GET /api/donors/:id/donations` - Get donor's donation history
- `POST /api/donors` - Add new donor
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor

### Donation Management
- `GET /api/donations` - List all donations
- `POST /api/donations` - Record new donation

### Donation Camps
- `GET /api/camps` - List all camps
- `POST /api/camps` - Create camp
- `PUT /api/camps/:id` - Update camp
- `DELETE /api/camps/:id` - Delete camp

### Screening & Testing
- `GET /api/screening` - List screening records
- `POST /api/screening` - Add screening record

### Blood Inventory
- `GET /api/inventory` - List all blood units
- `GET /api/inventory/available` - List available blood
- `GET /api/inventory/expiring` - List expiring blood (within 7 days)
- `POST /api/inventory` - Add blood to inventory

### Hospital Management
- `GET /api/hospitals` - List all hospitals
- `POST /api/hospitals` - Add hospital
- `PUT /api/hospitals/:id` - Update hospital
- `DELETE /api/hospitals/:id` - Delete hospital

### Recipient Management
- `GET /api/recipients` - List all recipients
- `POST /api/recipients` - Add recipient
- `PUT /api/recipients/:id` - Update recipient
- `DELETE /api/recipients/:id` - Delete recipient

### Blood Requests
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create blood request
- `PUT /api/requests/:id` - Update request status

### Blood Issues (WITH TRANSACTION)
- `GET /api/issues` - List all blood issues
- `POST /api/issues` - Issue blood (ACID transaction)

### Billing
- `GET /api/billing` - List all bills
- `POST /api/billing` - Create bill
- `PUT /api/billing/:id` - Update payment status

### Reports
- `GET /api/reports/blood-stock` - Blood stock by group
- `GET /api/reports/donor-history` - Total donations by donor
- `GET /api/reports/emergency-requests` - Emergency/Urgent requests
- `GET /api/reports/expiring-blood` - Blood expiring in 30 days
- `GET /api/reports/hospital-recipients` - Recipients per hospital
- `GET /api/reports/camp-statistics` - Donation camp statistics
- `GET /api/reports/blood-issued` - Blood issue history
- `GET /api/reports/billing-summary` - Billing statistics

## 📱 Frontend Features

### Dashboard
- Real-time statistics cards (donors, blood units, requests, etc.)
- Blood availability by group with quantities
- Auto-refreshing data from MySQL

### Donor Management
- List all donors with pagination
- Search by name
- Filter by blood group
- Add new donor with validation
- Edit donor information
- Delete donor with confirmation
- View complete donation history

### Blood Inventory
- Real-time inventory status
- Filter by blood group and status
- Expiring blood alerts (7-day warning)
- Component type tracking (Whole Blood, Plasma, etc.)
- Quantity management

### Blood Requests
- Create requests with priority levels (Normal/Urgent/Emergency)
- Color-coded priority indicators
- Approval/Rejection workflow
- Status tracking (Pending/Approved/Fulfilled/Rejected)

### Blood Issuance (ACID Transaction)
```javascript
// Backend performs ACID transaction:
1. BEGIN TRANSACTION
2. Verify blood unit is available
3. INSERT Blood_Issue record
4. UPDATE Blood_Inventory status to 'Issued'
5. UPDATE Blood_Request status to 'Fulfilled'
6. COMMIT or ROLLBACK
```

### Reports Section
- Blood stock analysis
- Donor donation history
- Emergency requests summary
- Camp statistics
- Hospital-wise recipients
- Billing summary with paid/pending status

## 🔐 Database Constraints & Validation

### Primary Keys
All tables have AUTO_INCREMENT primary keys

### Foreign Keys
- Enforced referential integrity
- CASCADE delete for donations and screening
- Prevents orphaned records

### Unique Constraints
- `Donor.phone` - No duplicate phone numbers
- `Screening.donation_id` - One screening per donation
- `Billing.issue_id` - One bill per issue

### Check Constraints
- Blood groups: Valid values only (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Eligibility status: Eligible/Ineligible/Deferred
- Donation status: Collected/Rejected/Pending
- Blood component types: Whole Blood/Packed Cells/Plasma/Platelets
- Test results: Negative/Positive/Inconclusive
- Request priority: Normal/Urgent/Emergency
- Request status: Pending/Approved/Fulfilled/Rejected
- Payment methods: Cash/UPI/Card/Online
- Payment status: Paid/Pending

### Defaults
- `eligibility_status` = 'Eligible'
- `donation_status` = 'Collected'
- `blood_status` = 'Available'
- `request_status` = 'Pending'
- Timestamps on created_at

## 🔍 DBMS Concepts Demonstrated

✅ **Relational Database Design**
- Proper normalization (3NF)
- Entity-Relationship model
- Table relationships (One-to-Many, Many-to-One)

✅ **DDL Operations**
- CREATE DATABASE
- CREATE TABLE
- CREATE VIEW
- CREATE PROCEDURE
- CREATE TRIGGER
- Constraints (PK, FK, UNIQUE, CHECK, DEFAULT)

✅ **DML Operations**
- INSERT with multiple records
- UPDATE with conditions
- DELETE with constraints
- SELECT with complex queries

✅ **Query Operations**
- WHERE clause filtering
- ORDER BY sorting
- GROUP BY aggregation
- HAVING conditions
- Aggregate functions (COUNT, SUM, AVG, MAX, MIN)
- String functions
- Date functions

✅ **JOIN Operations**
- INNER JOIN for related data
- LEFT JOIN for optional relationships
- Multiple joins in complex queries

✅ **Advanced Features**
- Subqueries in SELECT
- UNION in reports
- Transaction management (BEGIN, COMMIT, ROLLBACK)
- Stored procedures with parameters
- Triggers for business logic
- Views for simplified queries

## 🧪 Testing the Application

### 1. Verify Database Connection
- Dashboard should load with statistics
- All numbers should be > 0 (sample data present)

### 2. Test Donor CRUD
- ✓ Add new donor with all required fields
- ✓ Edit donor information
- ✓ Delete donor
- ✓ View donation history
- ✓ Search and filter by blood group

### 3. Test Donation Management
- ✓ Record donation for existing donor
- ✓ View donations with donor names (JOIN query)
- ✓ Associate donation with camp

### 4. Test Blood Inventory
- ✓ Blood units listed with correct blood groups
- ✓ Expiring blood alerts work
- ✓ Status filtering works

### 5. Test Blood Issuance (Transaction)
- ✓ Create blood request
- ✓ Approve request
- ✓ Issue blood from inventory
- ✓ Verify Blood_Inventory status changed to "Issued"
- ✓ Verify Blood_Request status changed to "Fulfilled"
- ✓ All changes happen atomically (transaction)

### 6. Test Billing
- ✓ Bill created after blood issue
- ✓ Payment status can be updated
- ✓ Billing summary shows correct totals

### 7. Test Reports
- ✓ Blood stock report shows quantities
- ✓ Donor history shows total donations
- ✓ Emergency requests are highlighted
- ✓ Camp statistics show donations collected
- ✓ Billing summary is accurate

## 🐛 Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: 
- Ensure MySQL is running
- Check DB_HOST, DB_USER, DB_PASSWORD in .env
- Verify database name is correct

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**:
- Change PORT in .env to 3001, 3002, etc.
- Or kill existing process on port 3000

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**:
```bash
cd backend
npm install
```

### Foreign Key Constraint Error
Occurs when trying to delete a donor with donations.
**Solution**: Delete donations first, or use CASCADE delete (already implemented)

## 📚 Sample Queries

### Find Blood Availability
```sql
SELECT blood_group, component_type, SUM(quantity_ml) as total_quantity
FROM Blood_Inventory
WHERE status = 'Available' AND expiry_date > CURDATE()
GROUP BY blood_group, component_type;
```

### Get Donor Donation History
```sql
SELECT d.donor_id, d.donor_name, COUNT(dn.donation_id) as total_donations,
       SUM(dn.quantity_ml) as total_ml, MAX(dn.donation_date) as last_donation
FROM Donor d
LEFT JOIN Donation dn ON d.donor_id = dn.donor_id
GROUP BY d.donor_id, d.donor_name;
```

### Find Emergency Requests
```sql
SELECT br.*, r.recipient_name, h.hospital_name
FROM Blood_Request br
JOIN Recipient r ON br.recipient_id = r.recipient_id
JOIN Hospital h ON r.hospital_id = h.hospital_id
WHERE br.priority = 'Emergency' AND br.status = 'Pending'
ORDER BY br.request_date ASC;
```

### Track Blood Expiry
```sql
SELECT * FROM Blood_Inventory
WHERE status = 'Available' 
AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY expiry_date ASC;
```

## 🔄 Transaction Example (Blood Issuance)

```javascript
// Frontend calls:
POST /api/issues
{
    "request_id": 1,
    "blood_id": 5,
    "issue_date": "2026-09-01",
    "quantity_ml": 450
}

// Backend executes ACID transaction:
BEGIN TRANSACTION
  1. Lock blood_id=5 for update (prevent race conditions)
  2. Verify: Blood_Inventory.status = 'Available' AND quantity >= 450
  3. INSERT into Blood_Issue (request_id=1, blood_id=5, ...)
  4. UPDATE Blood_Inventory SET status='Issued' WHERE blood_id=5
  5. UPDATE Blood_Request SET status='Fulfilled' WHERE request_id=1
COMMIT
// All-or-nothing: Either all succeed or all rollback
```

## 📖 DBMS Concepts for Viva

**Question**: What are the tables in this system?
**Answer**: 10 tables - Donor, Donation_Camp, Donation, Screening, Blood_Inventory, Hospital, Recipient, Blood_Request, Blood_Issue, Billing

**Question**: How do you maintain data integrity?
**Answer**: Using Foreign Keys with constraints, CHECK constraints for valid values, UNIQUE constraints for phone numbers, and proper indexes

**Question**: What is a transaction and where is it used?
**Answer**: Atomic database operation - used in blood issuance to ensure request, inventory, and billing are updated together or not at all

**Question**: Explain the relationship between Donor and Donation?
**Answer**: One-to-Many relationship - One donor can have many donations, but each donation belongs to one donor. Implemented via FK on Donation.donor_id

**Question**: What is the purpose of the Screening table?
**Answer**: Records test results for each donation - HIV, Hepatitis B/C, Malaria, Hemoglobin levels. One screening record per donation due to UNIQUE constraint

**Question**: How do you handle expiring blood?
**Answer**: Using TRIGGER that auto-updates status to 'Expired' when expiry_date passes, or manually checking via report

**Question**: Explain the blood issuance workflow?
**Answer**: Request → Approve → Issue (with transaction checking availability & updating status) → Bill

## 📋 Checklist for DBMS Viva

- [x] 10 tables with proper schema
- [x] Foreign key relationships
- [x] Primary keys (AUTO_INCREMENT)
- [x] Unique and Check constraints
- [x] Indexes on frequently queried columns
- [x] 50+ sample data in each major table
- [x] Views for complex queries
- [x] Stored procedures for reusable logic
- [x] Triggers for automatic actions
- [x] ACID transactions for critical operations
- [x] Complex JOIN queries
- [x] GROUP BY with aggregation
- [x] Subqueries in reports
- [x] CRUD operations through frontend
- [x] Proper error handling
- [x] API documentation

## 🚀 Future Scope (NOT Included)

These are beyond DBMS project scope:
- User authentication (login/roles)
- Cloud deployment
- Mobile app
- SMS notifications
- Payment gateway integration
- Advanced reporting with charts
- Export to Excel/PDF
- Email notifications
- AI-based inventory prediction

## 📄 License

Educational use only. This is a college DBMS project.

## 👨‍💻 Author

DBMS Project - Blood Bank Management System

## 📞 Support

For issues related to:
- **Database**: Check MySQL error logs
- **Backend**: Check console output in terminal
- **Frontend**: Check browser console (F12)
- **Connections**: Verify .env file and MySQL credentials

---

**Happy Learning! This project covers all major DBMS concepts required for your viva.** 🎓
