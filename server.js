// Blood Bank Management System - Main Express Server
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================
// DASHBOARD API
// ============================================
app.get('/api/dashboard', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [donors] = await connection.query('SELECT COUNT(*) as count FROM Donor');
        const [bloodUnits] = await connection.query('SELECT COUNT(*) as count FROM Blood_Inventory');
        const [availableUnits] = await connection.query('SELECT COUNT(*) as count FROM Blood_Inventory WHERE status = "Available"');
        const [pendingRequests] = await connection.query('SELECT COUNT(*) as count FROM Blood_Request WHERE status = "Pending"');
        const [emergencyRequests] = await connection.query('SELECT COUNT(*) as count FROM Blood_Request WHERE priority = "Emergency"');
        const [hospitals] = await connection.query('SELECT COUNT(*) as count FROM Hospital');
        const [recipients] = await connection.query('SELECT COUNT(*) as count FROM Recipient');
        const [camps] = await connection.query('SELECT COUNT(*) as count FROM Donation_Camp');
        
        // Blood availability by group
        const [bloodByGroup] = await connection.query(`
            SELECT blood_group, SUM(quantity_ml) as quantity, COUNT(*) as units
            FROM Blood_Inventory
            WHERE status = 'Available'
            GROUP BY blood_group
            ORDER BY blood_group
        `);
        
        connection.release();
        
        res.json({
            totalDonors: donors[0].count,
            totalBloodUnits: bloodUnits[0].count,
            availableBloodUnits: availableUnits[0].count,
            pendingRequests: pendingRequests[0].count,
            emergencyRequests: emergencyRequests[0].count,
            totalHospitals: hospitals[0].count,
            totalRecipients: recipients[0].count,
            donationCamps: camps[0].count,
            bloodByGroup: bloodByGroup
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// ============================================
// DONOR MANAGEMENT APIS
// ============================================

// Get all donors
app.get('/api/donors', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [donors] = await connection.query(`
            SELECT * FROM Donor ORDER BY donor_id DESC
        `);
        connection.release();
        res.json(donors);
    } catch (error) {
        console.error('Donor List Error:', error);
        res.status(500).json({ error: 'Failed to fetch donors' });
    }
});

// Get single donor
app.get('/api/donors/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [donor] = await connection.query('SELECT * FROM Donor WHERE donor_id = ?', [req.params.id]);
        connection.release();
        
        if (donor.length === 0) {
            return res.status(404).json({ error: 'Donor not found' });
        }
        res.json(donor[0]);
    } catch (error) {
        console.error('Donor Detail Error:', error);
        res.status(500).json({ error: 'Failed to fetch donor' });
    }
});

// Get donor donation history
app.get('/api/donors/:id/donations', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [donations] = await connection.query(`
            SELECT d.*, dc.camp_name, s.overall_result
            FROM Donation d
            LEFT JOIN Donation_Camp dc ON d.camp_id = dc.camp_id
            LEFT JOIN Screening s ON d.donation_id = s.donation_id
            WHERE d.donor_id = ?
            ORDER BY d.donation_date DESC
        `, [req.params.id]);
        connection.release();
        res.json(donations);
    } catch (error) {
        console.error('Donor History Error:', error);
        res.status(500).json({ error: 'Failed to fetch donation history' });
    }
});

// Add new donor
app.post('/api/donors', async (req, res) => {
    const { donor_name, gender, date_of_birth, blood_group, phone, email, address, city } = req.body;
    
    if (!donor_name || !blood_group || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(blood_group)) {
        return res.status(400).json({ error: 'Invalid blood group' });
    }
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO Donor (donor_name, gender, date_of_birth, blood_group, phone, email, address, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [donor_name, gender, date_of_birth, blood_group, phone, email, address, city]
        );
        connection.release();
        res.status(201).json({ message: 'Donor added successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Phone number already exists' });
        }
        console.error('Add Donor Error:', error);
        res.status(500).json({ error: 'Failed to add donor' });
    }
});

// Update donor
app.put('/api/donors/:id', async (req, res) => {
    const { donor_name, gender, date_of_birth, blood_group, phone, email, address, city, eligibility_status } = req.body;
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE Donor SET donor_name = ?, gender = ?, date_of_birth = ?, blood_group = ?, phone = ?, email = ?, address = ?, city = ?, eligibility_status = ? WHERE donor_id = ?',
            [donor_name, gender, date_of_birth, blood_group, phone, email, address, city, eligibility_status, req.params.id]
        );
        connection.release();
        res.json({ message: 'Donor updated successfully' });
    } catch (error) {
        console.error('Update Donor Error:', error);
        res.status(500).json({ error: 'Failed to update donor' });
    }
});

// Delete donor
app.delete('/api/donors/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Donor WHERE donor_id = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Donor deleted successfully' });
    } catch (error) {
        console.error('Delete Donor Error:', error);
        res.status(500).json({ error: 'Failed to delete donor' });
    }
});

// ============================================
// DONATION MANAGEMENT APIS
// ============================================

// Get all donations
app.get('/api/donations', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [donations] = await connection.query(`
            SELECT d.*, do.donor_name, do.blood_group, dc.camp_name
            FROM Donation d
            JOIN Donor do ON d.donor_id = do.donor_id
            LEFT JOIN Donation_Camp dc ON d.camp_id = dc.camp_id
            ORDER BY d.donation_date DESC
        `);
        connection.release();
        res.json(donations);
    } catch (error) {
        console.error('Donations List Error:', error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});

// Add donation
app.post('/api/donations', async (req, res) => {
    const { donor_id, camp_id, donation_date, quantity_ml } = req.body;
    
    if (!donor_id || !donation_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO Donation (donor_id, camp_id, donation_date, quantity_ml, donation_status) VALUES (?, ?, ?, ?, "Collected")',
            [donor_id, camp_id || null, donation_date, quantity_ml || 450]
        );
        connection.release();
        res.status(201).json({ message: 'Donation recorded successfully', donation_id: result.insertId });
    } catch (error) {
        console.error('Add Donation Error:', error);
        res.status(500).json({ error: 'Failed to record donation' });
    }
});

// ============================================
// DONATION CAMP APIS
// ============================================

// Get all camps
app.get('/api/camps', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [camps] = await connection.query(`
            SELECT c.*, COUNT(d.donation_id) as donations_collected
            FROM Donation_Camp c
            LEFT JOIN Donation d ON c.camp_id = d.camp_id
            GROUP BY c.camp_id
            ORDER BY c.camp_date DESC
        `);
        connection.release();
        res.json(camps);
    } catch (error) {
        console.error('Camps List Error:', error);
        res.status(500).json({ error: 'Failed to fetch camps' });
    }
});

// Add camp
app.post('/api/camps', async (req, res) => {
    const { camp_name, location, camp_date, organizer, contact } = req.body;
    
    if (!camp_name || !camp_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO Donation_Camp (camp_name, location, camp_date, organizer, contact) VALUES (?, ?, ?, ?, ?)',
            [camp_name, location, camp_date, organizer, contact]
        );
        connection.release();
        res.status(201).json({ message: 'Camp created successfully', camp_id: result.insertId });
    } catch (error) {
        console.error('Add Camp Error:', error);
        res.status(500).json({ error: 'Failed to create camp' });
    }
});

// Update camp
app.put('/api/camps/:id', async (req, res) => {
    const { camp_name, location, camp_date, organizer, contact } = req.body;
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE Donation_Camp SET camp_name = ?, location = ?, camp_date = ?, organizer = ?, contact = ? WHERE camp_id = ?',
            [camp_name, location, camp_date, organizer, contact, req.params.id]
        );
        connection.release();
        res.json({ message: 'Camp updated successfully' });
    } catch (error) {
        console.error('Update Camp Error:', error);
        res.status(500).json({ error: 'Failed to update camp' });
    }
});

// Delete camp
app.delete('/api/camps/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Donation_Camp WHERE camp_id = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Camp deleted successfully' });
    } catch (error) {
        console.error('Delete Camp Error:', error);
        res.status(500).json({ error: 'Failed to delete camp' });
    }
});

// ============================================
// SCREENING APIS
// ============================================

// Get all screening records
app.get('/api/screening', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [screening] = await connection.query(`
            SELECT s.*, d.donation_id, do.donor_name, do.blood_group
            FROM Screening s
            JOIN Donation d ON s.donation_id = d.donation_id
            JOIN Donor do ON d.donor_id = do.donor_id
            ORDER BY s.screening_date DESC
        `);
        connection.release();
        res.json(screening);
    } catch (error) {
        console.error('Screening List Error:', error);
        res.status(500).json({ error: 'Failed to fetch screening records' });
    }
});

// Add screening
app.post('/api/screening', async (req, res) => {
    const { donation_id, hiv_result, hepatitis_b_result, hepatitis_c_result, malaria_result, blood_pressure, hemoglobin } = req.body;
    
    if (!donation_id) {
        return res.status(400).json({ error: 'Donation ID is required' });
    }
    
    // Determine overall result
    const overall_result = hiv_result === 'Negative' && hepatitis_b_result === 'Negative' && 
                          hepatitis_c_result === 'Negative' && malaria_result === 'Negative' ? 'Passed' : 'Failed';
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO Screening (donation_id, hiv_result, hepatitis_b_result, hepatitis_c_result, malaria_result, blood_pressure, hemoglobin, overall_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [donation_id, hiv_result, hepatitis_b_result, hepatitis_c_result, malaria_result, blood_pressure, hemoglobin, overall_result]
        );
        connection.release();
        res.status(201).json({ message: 'Screening record added successfully' });
    } catch (error) {
        console.error('Add Screening Error:', error);
        res.status(500).json({ error: 'Failed to add screening record' });
    }
});

// ============================================
// BLOOD INVENTORY APIS
// ============================================

// Get all blood inventory
app.get('/api/inventory', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [inventory] = await connection.query(`
            SELECT bi.*, do.donor_name
            FROM Blood_Inventory bi
            JOIN Donation d ON bi.donation_id = d.donation_id
            JOIN Donor do ON d.donor_id = do.donor_id
            ORDER BY bi.blood_id DESC
        `);
        connection.release();
        res.json(inventory);
    } catch (error) {
        console.error('Inventory List Error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// Get available blood
app.get('/api/inventory/available', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [available] = await connection.query(`
            SELECT * FROM Blood_Inventory
            WHERE status = 'Available' AND expiry_date > CURDATE()
            ORDER BY expiry_date ASC
        `);
        connection.release();
        res.json(available);
    } catch (error) {
        console.error('Available Inventory Error:', error);
        res.status(500).json({ error: 'Failed to fetch available blood' });
    }
});

// Get expiring blood
app.get('/api/inventory/expiring', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [expiring] = await connection.query(`
            SELECT * FROM Blood_Inventory
            WHERE status = 'Available' AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY expiry_date ASC
        `);
        connection.release();
        res.json(expiring);
    } catch (error) {
        console.error('Expiring Inventory Error:', error);
        res.status(500).json({ error: 'Failed to fetch expiring blood' });
    }
});

// Add blood to inventory
app.post('/api/inventory', async (req, res) => {
    const { donation_id, blood_group, component_type, quantity_ml, collection_date, expiry_date } = req.body;
    
    if (!donation_id || !blood_group || !quantity_ml) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO Blood_Inventory (donation_id, blood_group, component_type, quantity_ml, collection_date, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, "Available")',
            [donation_id, blood_group, component_type, quantity_ml, collection_date, expiry_date]
        );
        connection.release();
        res.status(201).json({ message: 'Blood added to inventory successfully' });
    } catch (error) {
        console.error('Add Inventory Error:', error);
        res.status(500).json({ error: 'Failed to add blood to inventory' });
    }
});

// ============================================
// HOSPITAL APIS
// ============================================

// Get all hospitals
app.get('/api/hospitals', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [hospitals] = await connection.query('SELECT * FROM Hospital ORDER BY hospital_id DESC');
        connection.release();
        res.json(hospitals);
    } catch (error) {
        console.error('Hospitals List Error:', error);
        res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
});

// Add hospital
app.post('/api/hospitals', async (req, res) => {
    const { hospital_name, address, city, phone } = req.body;
    
    if (!hospital_name) {
        return res.status(400).json({ error: 'Hospital name is required' });
    }
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO Hospital (hospital_name, address, city, phone) VALUES (?, ?, ?, ?)',
            [hospital_name, address, city, phone]
        );
        connection.release();
        res.status(201).json({ message: 'Hospital added successfully', hospital_id: result.insertId });
    } catch (error) {
        console.error('Add Hospital Error:', error);
        res.status(500).json({ error: 'Failed to add hospital' });
    }
});

// Update hospital
app.put('/api/hospitals/:id', async (req, res) => {
    const { hospital_name, address, city, phone } = req.body;
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE Hospital SET hospital_name = ?, address = ?, city = ?, phone = ? WHERE hospital_id = ?',
            [hospital_name, address, city, phone, req.params.id]
        );
        connection.release();
        res.json({ message: 'Hospital updated successfully' });
    } catch (error) {
        console.error('Update Hospital Error:', error);
        res.status(500).json({ error: 'Failed to update hospital' });
    }
});

// Delete hospital
app.delete('/api/hospitals/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Hospital WHERE hospital_id = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        console.error('Delete Hospital Error:', error);
        res.status(500).json({ error: 'Failed to delete hospital' });
    }
});

// ============================================
// RECIPIENT APIS
// ============================================

// Get all recipients
app.get('/api/recipients', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [recipients] = await connection.query(`
            SELECT r.*, h.hospital_name
            FROM Recipient r
            JOIN Hospital h ON r.hospital_id = h.hospital_id
            ORDER BY r.recipient_id DESC
        `);
        connection.release();
        res.json(recipients);
    } catch (error) {
        console.error('Recipients List Error:', error);
        res.status(500).json({ error: 'Failed to fetch recipients' });
    }
});

// Add recipient
app.post('/api/recipients', async (req, res) => {
    const { hospital_id, recipient_name, age, gender, blood_group, contact } = req.body;
    
    if (!hospital_id || !recipient_name || !blood_group) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO Recipient (hospital_id, recipient_name, age, gender, blood_group, contact) VALUES (?, ?, ?, ?, ?, ?)',
            [hospital_id, recipient_name, age, gender, blood_group, contact]
        );
        connection.release();
        res.status(201).json({ message: 'Recipient added successfully', recipient_id: result.insertId });
    } catch (error) {
        console.error('Add Recipient Error:', error);
        res.status(500).json({ error: 'Failed to add recipient' });
    }
});

// Update recipient
app.put('/api/recipients/:id', async (req, res) => {
    const { hospital_id, recipient_name, age, gender, blood_group, contact } = req.body;
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE Recipient SET hospital_id = ?, recipient_name = ?, age = ?, gender = ?, blood_group = ?, contact = ? WHERE recipient_id = ?',
            [hospital_id, recipient_name, age, gender, blood_group, contact, req.params.id]
        );
        connection.release();
        res.json({ message: 'Recipient updated successfully' });
    } catch (error) {
        console.error('Update Recipient Error:', error);
        res.status(500).json({ error: 'Failed to update recipient' });
    }
});

// Delete recipient
app.delete('/api/recipients/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Recipient WHERE recipient_id = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Recipient deleted successfully' });
    } catch (error) {
        console.error('Delete Recipient Error:', error);
        res.status(500).json({ error: 'Failed to delete recipient' });
    }
});

// ============================================
// BLOOD REQUEST APIS
// ============================================

// Get all blood requests
app.get('/api/requests', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [requests] = await connection.query(`
            SELECT br.*, r.recipient_name, h.hospital_name
            FROM Blood_Request br
            JOIN Recipient r ON br.recipient_id = r.recipient_id
            JOIN Hospital h ON r.hospital_id = h.hospital_id
            ORDER BY br.request_date DESC
        `);
        connection.release();
        res.json(requests);
    } catch (error) {
        console.error('Requests List Error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Add blood request
app.post('/api/requests', async (req, res) => {
    const { recipient_id, blood_group, component_type, units_required, request_date, priority } = req.body;
    
    if (!recipient_id || !blood_group || !units_required) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO Blood_Request (recipient_id, blood_group, component_type, units_required, request_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, "Pending")',
            [recipient_id, blood_group, component_type, units_required, request_date, priority || 'Normal']
        );
        connection.release();
        res.status(201).json({ message: 'Blood request created successfully', request_id: result.insertId });
    } catch (error) {
        console.error('Add Request Error:', error);
        res.status(500).json({ error: 'Failed to create blood request' });
    }
});

// Update blood request status
app.put('/api/requests/:id', async (req, res) => {
    const { status } = req.body;
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE Blood_Request SET status = ? WHERE request_id = ?',
            [status, req.params.id]
        );
        connection.release();
        res.json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Update Request Error:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// ============================================
// BLOOD ISSUE APIS (WITH TRANSACTION)
// ============================================

// Get all blood issues
app.get('/api/issues', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [issues] = await connection.query(`
            SELECT bi.*, br.blood_group, r.recipient_name, h.hospital_name, bl.blood_group as inventory_blood_group
            FROM Blood_Issue bi
            JOIN Blood_Request br ON bi.request_id = br.request_id
            JOIN Recipient r ON br.recipient_id = r.recipient_id
            JOIN Hospital h ON r.hospital_id = h.hospital_id
            JOIN Blood_Inventory bl ON bi.blood_id = bl.blood_id
            ORDER BY bi.issue_date DESC
        `);
        connection.release();
        res.json(issues);
    } catch (error) {
        console.error('Issues List Error:', error);
        res.status(500).json({ error: 'Failed to fetch blood issues' });
    }
});

// Issue blood (WITH TRANSACTION)
app.post('/api/issues', async (req, res) => {
    const { request_id, blood_id, issue_date, quantity_ml } = req.body;
    
    if (!request_id || !blood_id || !quantity_ml) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // 1. Verify blood unit is available
        const [blood] = await connection.query(
            'SELECT * FROM Blood_Inventory WHERE blood_id = ? FOR UPDATE',
            [blood_id]
        );
        
        if (blood.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Blood unit not found' });
        }
        
        if (blood[0].status !== 'Available' || blood[0].quantity_ml < quantity_ml) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: 'Blood unit not available or insufficient quantity' });
        }
        
        // 2. Insert Blood_Issue record
        const [issueResult] = await connection.query(
            'INSERT INTO Blood_Issue (request_id, blood_id, issue_date, quantity_ml) VALUES (?, ?, ?, ?)',
            [request_id, blood_id, issue_date, quantity_ml]
        );
        
        // 3. Update Blood_Inventory status
        await connection.query(
            'UPDATE Blood_Inventory SET status = "Issued" WHERE blood_id = ?',
            [blood_id]
        );
        
        // 4. Update Blood_Request status
        await connection.query(
            'UPDATE Blood_Request SET status = "Fulfilled" WHERE request_id = ?',
            [request_id]
        );
        
        // Commit transaction
        await connection.commit();
        connection.release();
        
        res.status(201).json({ message: 'Blood issued successfully', issue_id: issueResult.insertId });
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Issue Blood Error:', error);
        res.status(500).json({ error: 'Failed to issue blood' });
    }
});

// ============================================
// BILLING APIS
// ============================================

// Get all bills
app.get('/api/billing', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [bills] = await connection.query(`
            SELECT b.*, bi.issue_date, r.recipient_name, h.hospital_name
            FROM Billing b
            JOIN Blood_Issue bi ON b.issue_id = bi.issue_id
            JOIN Blood_Request br ON bi.request_id = br.request_id
            JOIN Recipient r ON br.recipient_id = r.recipient_id
            JOIN Hospital h ON r.hospital_id = h.hospital_id
            ORDER BY b.bill_date DESC
        `);
        connection.release();
        res.json(bills);
    } catch (error) {
        console.error('Billing List Error:', error);
        res.status(500).json({ error: 'Failed to fetch bills' });
    }
});

// Create bill
app.post('/api/billing', async (req, res) => {
    const { issue_id, bill_date, amount, payment_method } = req.body;
    
    if (!issue_id || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO Billing (issue_id, bill_date, amount, payment_method, payment_status) VALUES (?, ?, ?, ?, "Pending")',
            [issue_id, bill_date, amount, payment_method || 'Cash']
        );
        connection.release();
        res.status(201).json({ message: 'Bill created successfully', bill_id: result.insertId });
    } catch (error) {
        console.error('Add Bill Error:', error);
        res.status(500).json({ error: 'Failed to create bill' });
    }
});

// Update payment status
app.put('/api/billing/:id', async (req, res) => {
    const { payment_status } = req.body;
    
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE Billing SET payment_status = ? WHERE bill_id = ?',
            [payment_status, req.params.id]
        );
        connection.release();
        res.json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Update Bill Error:', error);
        res.status(500).json({ error: 'Failed to update bill' });
    }
});

// ============================================
// REPORTS APIS
// ============================================

// Blood stock by group
app.get('/api/reports/blood-stock', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [report] = await connection.query(`
            SELECT blood_group, component_type, COUNT(*) as units, SUM(quantity_ml) as total_quantity
            FROM Blood_Inventory
            WHERE status = 'Available'
            GROUP BY blood_group, component_type
            ORDER BY blood_group
        `);
        connection.release();
        res.json(report);
    } catch (error) {
        console.error('Blood Stock Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Total donations by donor
app.get('/api/reports/donor-history', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [report] = await connection.query(`
            SELECT d.donor_id, d.donor_name, d.blood_group, COUNT(dn.donation_id) as total_donations, 
                   SUM(dn.quantity_ml) as total_ml, MAX(dn.donation_date) as last_donation
            FROM Donor d
            LEFT JOIN Donation dn ON d.donor_id = dn.donor_id
            GROUP BY d.donor_id, d.donor_name, d.blood_group
            ORDER BY total_donations DESC
        `);
        connection.release();
        res.json(report);
    } catch (error) {
        console.error('Donor History Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Emergency blood requests
app.get('/api/reports/emergency-requests', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [report] = await connection.query(`
            SELECT br.*, r.recipient_name, h.hospital_name, d.donor_name
            FROM Blood_Request br
            JOIN Recipient r ON br.recipient_id = r.recipient_id
            JOIN Hospital h ON r.hospital_id = h.hospital_id
            WHERE br.priority IN ('Emergency', 'Urgent')
            ORDER BY br.request_date DESC
        `);
        connection.release();
        res.json(report);
    } catch (error) {
        console.error('Emergency Requests Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Expiring blood
app.get('/api/reports/expiring-blood', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [report] = await connection.query(`
            SELECT * FROM Blood_Inventory
            WHERE status = 'Available' AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            ORDER BY expiry_date ASC
        `);
        connection.release();
        res.json(report);
    } catch (error) {
        console.error('Expiring Blood Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Hospital-wise recipients
app.get('/api/reports/hospital-recipients', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [report] = await connection.query(`
            SELECT h.hospital_id, h.hospital_name, h.city, COUNT(r.recipient_id) as total_recipients
            FROM Hospital h
            LEFT JOIN Recipient r ON h.hospital_id = r.hospital_id
            GROUP BY h.hospital_id, h.hospital_name, h.city
            ORDER BY total_recipients DESC
        `);
        connection.release();
        res.json(report);
    } catch (error) {
        console.error('Hospital Recipients Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Donation camp statistics
app.get('/api/reports/camp-statistics', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [report] = await connection.query(`
            SELECT c.camp_id, c.camp_name, c.location, c.camp_date, 
                   COUNT(d.donation_id) as donations_collected,
                   SUM(d.quantity_ml) as total_quantity
            FROM Donation_Camp c
            LEFT JOIN Donation d ON c.camp_id = d.camp_id
            GROUP BY c.camp_id, c.camp_name, c.location, c.camp_date
            ORDER BY c.camp_date DESC
        `);
        connection.release();
        res.json(report);
    } catch (error) {
        console.error('Camp Statistics Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Blood issued history
app.get('/api/reports/blood-issued', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [report] = await connection.query(`
            SELECT bi.*, r.recipient_name, h.hospital_name, bl.blood_group
            FROM Blood_Issue bi
            JOIN Blood_Request br ON bi.request_id = br.request_id
            JOIN Recipient r ON br.recipient_id = r.recipient_id
            JOIN Hospital h ON r.hospital_id = h.hospital_id
            JOIN Blood_Inventory bl ON bi.blood_id = bl.blood_id
            ORDER BY bi.issue_date DESC
        `);
        connection.release();
        res.json(report);
    } catch (error) {
        console.error('Blood Issued Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Billing summary
app.get('/api/reports/billing-summary', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [report] = await connection.query(`
            SELECT 
                COUNT(*) as total_bills,
                SUM(amount) as total_amount,
                SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN payment_status = 'Pending' THEN amount ELSE 0 END) as pending_amount,
                COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) as pending_count
            FROM Billing
        `);
        connection.release();
        res.json(report[0]);
    } catch (error) {
        console.error('Billing Summary Report Error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// ============================================
// Error handling and server start
// ============================================

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
});
