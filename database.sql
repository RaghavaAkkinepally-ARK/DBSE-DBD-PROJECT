-- Blood Bank Management System - Database Schema
-- DBMS College Project
-- MySQL 8.x

DROP DATABASE IF EXISTS BloodBankDB;
CREATE DATABASE IF NOT EXISTS BloodBankDB;
USE BloodBankDB;

-- ============================================
-- 1. DONOR TABLE
-- ============================================
CREATE TABLE Donor (
    donor_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    date_of_birth DATE,
    blood_group VARCHAR(5) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100),
    address VARCHAR(200),
    city VARCHAR(50),
    eligibility_status VARCHAR(20) DEFAULT 'Eligible' CHECK (eligibility_status IN ('Eligible', 'Ineligible', 'Deferred')),
    last_donation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_blood_group (blood_group),
    INDEX idx_city (city),
    INDEX idx_phone (phone)
);

-- ============================================
-- 2. DONATION_CAMP TABLE
-- ============================================
CREATE TABLE Donation_Camp (
    camp_id INT PRIMARY KEY AUTO_INCREMENT,
    camp_name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    camp_date DATE NOT NULL,
    organizer VARCHAR(100),
    contact VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_camp_date (camp_date),
    INDEX idx_location (location)
);

-- ============================================
-- 3. DONATION TABLE
-- ============================================
CREATE TABLE Donation (
    donation_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    camp_id INT,
    donation_date DATE NOT NULL,
    quantity_ml INT DEFAULT 450 CHECK (quantity_ml > 0),
    donation_status VARCHAR(20) DEFAULT 'Collected' CHECK (donation_status IN ('Collected', 'Rejected', 'Pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id) ON DELETE CASCADE,
    FOREIGN KEY (camp_id) REFERENCES Donation_Camp(camp_id) ON DELETE SET NULL,
    INDEX idx_donor_id (donor_id),
    INDEX idx_camp_id (camp_id),
    INDEX idx_donation_date (donation_date)
);

-- ============================================
-- 4. SCREENING TABLE
-- ============================================
CREATE TABLE Screening (
    screening_id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT NOT NULL UNIQUE,
    hiv_result VARCHAR(10) CHECK (hiv_result IN ('Negative', 'Positive', 'Inconclusive')),
    hepatitis_b_result VARCHAR(10) CHECK (hepatitis_b_result IN ('Negative', 'Positive', 'Inconclusive')),
    hepatitis_c_result VARCHAR(10) CHECK (hepatitis_c_result IN ('Negative', 'Positive', 'Inconclusive')),
    malaria_result VARCHAR(10) CHECK (malaria_result IN ('Negative', 'Positive', 'Inconclusive')),
    blood_pressure VARCHAR(20),
    hemoglobin DECIMAL(4,1),
    overall_result VARCHAR(20) DEFAULT 'Pending' CHECK (overall_result IN ('Pending', 'Passed', 'Failed')),
    screening_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES Donation(donation_id) ON DELETE CASCADE,
    INDEX idx_overall_result (overall_result)
);

-- ============================================
-- 5. BLOOD_INVENTORY TABLE
-- ============================================
CREATE TABLE Blood_Inventory (
    blood_id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    component_type VARCHAR(30) CHECK (component_type IN ('Whole Blood', 'Packed Cells', 'Plasma', 'Platelets')),
    quantity_ml INT NOT NULL CHECK (quantity_ml > 0),
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Issued', 'Expired', 'Discarded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES Donation(donation_id) ON DELETE CASCADE,
    INDEX idx_blood_group (blood_group),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_component_type (component_type)
);

-- ============================================
-- 6. HOSPITAL TABLE
-- ============================================
CREATE TABLE Hospital (
    hospital_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_name VARCHAR(120) NOT NULL,
    address VARCHAR(200),
    city VARCHAR(50),
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_hospital_name (hospital_name)
);

-- ============================================
-- 7. RECIPIENT TABLE
-- ============================================
CREATE TABLE Recipient (
    recipient_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    age INT CHECK (age > 0 AND age < 150),
    gender VARCHAR(10),
    blood_group VARCHAR(5) NOT NULL,
    contact VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id) ON DELETE CASCADE,
    INDEX idx_hospital_id (hospital_id),
    INDEX idx_blood_group (blood_group)
);

-- ============================================
-- 8. BLOOD_REQUEST TABLE
-- ============================================
CREATE TABLE Blood_Request (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    recipient_id INT NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    component_type VARCHAR(30),
    units_required INT CHECK (units_required > 0),
    request_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Urgent', 'Emergency')),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Fulfilled', 'Rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id) ON DELETE CASCADE,
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_blood_group (blood_group)
);

-- ============================================
-- 9. BLOOD_ISSUE TABLE
-- ============================================
CREATE TABLE Blood_Issue (
    issue_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    blood_id INT NOT NULL,
    issue_date DATE NOT NULL,
    quantity_ml INT NOT NULL CHECK (quantity_ml > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES Blood_Request(request_id) ON DELETE CASCADE,
    FOREIGN KEY (blood_id) REFERENCES Blood_Inventory(blood_id) ON DELETE CASCADE,
    INDEX idx_request_id (request_id),
    INDEX idx_blood_id (blood_id),
    INDEX idx_issue_date (issue_date)
);

-- ============================================
-- 10. BILLING TABLE
-- ============================================
CREATE TABLE Billing (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    issue_id INT NOT NULL UNIQUE,
    bill_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(30) CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Online')),
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES Blood_Issue(issue_id) ON DELETE CASCADE,
    INDEX idx_payment_status (payment_status),
    INDEX idx_bill_date (bill_date)
);

-- ============================================
-- VIEW: Available Blood Inventory
-- ============================================
CREATE VIEW Available_Blood AS
SELECT 
    blood_group,
    component_type,
    COUNT(*) AS available_units,
    SUM(quantity_ml) AS total_quantity
FROM Blood_Inventory
WHERE status = 'Available'
GROUP BY blood_group, component_type;

-- ============================================
-- STORED PROCEDURE: Get Blood Stock
-- ============================================
DELIMITER //
CREATE PROCEDURE GetBloodStock(IN requested_group VARCHAR(5))
BEGIN
    SELECT 
        blood_id,
        blood_group,
        component_type,
        quantity_ml,
        collection_date,
        expiry_date,
        status
    FROM Blood_Inventory
    WHERE blood_group = requested_group 
    AND status = 'Available'
    AND expiry_date > CURDATE()
    ORDER BY collection_date ASC;
END//
DELIMITER ;

-- ============================================
-- TRIGGER: Expire Blood Units
-- ============================================
DELIMITER //
CREATE TRIGGER expire_blood_on_date
BEFORE UPDATE ON Blood_Inventory
FOR EACH ROW
BEGIN
    IF NEW.expiry_date < CURDATE() AND NEW.status = 'Available' THEN
        SET NEW.status = 'Expired';
    END IF;
END//
DELIMITER ;

-- ============================================
-- SAMPLE DATA: Donors
-- ============================================
INSERT INTO Donor (donor_name, gender, date_of_birth, blood_group, phone, email, address, city, eligibility_status, last_donation_date) VALUES
('Rajesh Kumar', 'Male', '1990-05-15', 'O+', '9876543210', 'rajesh@email.com', '123 Main St', 'Delhi', 'Eligible', '2026-08-15'),
('Priya Singh', 'Female', '1995-03-22', 'A+', '9876543211', 'priya@email.com', '456 Oak Ave', 'Mumbai', 'Eligible', '2026-08-10'),
('Amit Patel', 'Male', '1992-07-10', 'B+', '9876543212', 'amit@email.com', '789 Pine Rd', 'Bangalore', 'Eligible', '2026-07-20'),
('Anjali Sharma', 'Female', '1998-11-05', 'AB+', '9876543213', 'anjali@email.com', '321 Elm St', 'Pune', 'Eligible', '2026-08-05'),
('Vikram Singh', 'Male', '1988-01-30', 'O-', '9876543214', 'vikram@email.com', '654 Maple Dr', 'Chennai', 'Eligible', '2026-07-15'),
('Neha Gupta', 'Female', '1996-09-18', 'A-', '9876543215', 'neha@email.com', '987 Cedar Ln', 'Kolkata', 'Eligible', '2026-08-01'),
('Arjun Nair', 'Male', '1991-06-25', 'B-', '9876543216', 'arjun@email.com', '147 Birch Way', 'Hyderabad', 'Eligible', '2026-07-10'),
('Sneha Kapoor', 'Female', '1997-04-12', 'AB-', '9876543217', 'sneha@email.com', '258 Spruce Ct', 'Ahmedabad', 'Ineligible', NULL),
('Rohan Desai', 'Male', '1994-08-08', 'O+', '9876543218', 'rohan@email.com', '369 Willow Rd', 'Jaipur', 'Eligible', '2026-06-20'),
('Divya Nambiar', 'Female', '1999-02-14', 'A+', '9876543219', 'divya@email.com', '741 Ash Pl', 'Lucknow', 'Eligible', '2026-08-12'),
('Sanjay Kumar', 'Male', '1989-10-20', 'B+', '9876543220', 'sanjay@email.com', '852 Oak St', 'Delhi', 'Eligible', '2026-07-25'),
('Komal Singh', 'Female', '1993-12-03', 'O+', '9876543221', 'komal@email.com', '963 Pine Ave', 'Mumbai', 'Eligible', '2026-08-08'),
('Aditya Verma', 'Male', '1997-05-17', 'A+', '9876543222', 'aditya@email.com', '159 Elm Rd', 'Bangalore', 'Eligible', '2026-07-30'),
('Ritika Malhotra', 'Female', '1991-07-22', 'B-', '9876543223', 'ritika@email.com', '357 Maple St', 'Pune', 'Eligible', '2026-08-03'),
('Harsh Pandey', 'Male', '1996-09-11', 'AB+', '9876543224', 'harsh@email.com', '456 Cedar Ave', 'Chennai', 'Eligible', '2026-07-18'),
('Meera Iyer', 'Female', '1994-11-28', 'O-', '9876543225', 'meera@email.com', '654 Birch Ln', 'Kolkata', 'Eligible', '2026-08-06'),
('Nikhil Bhat', 'Male', '1990-03-15', 'A-', '9876543226', 'nikhil@email.com', '789 Spruce Dr', 'Hyderabad', 'Eligible', '2026-07-22'),
('Pooja Menon', 'Female', '1998-06-09', 'B+', '9876543227', 'pooja@email.com', '321 Willow Ct', 'Ahmedabad', 'Eligible', '2026-08-09'),
('Yash Malhar', 'Male', '1992-04-21', 'AB-', '9876543228', 'yash@email.com', '258 Ash Way', 'Jaipur', 'Eligible', '2026-07-27'),
('Isha Kulkarni', 'Female', '1995-08-14', 'O+', '9876543229', 'isha@email.com', '147 Oak Pl', 'Lucknow', 'Eligible', '2026-08-11'),
('Rahul Saxena', 'Male', '1989-02-26', 'A+', '9876543230', 'rahul@email.com', '369 Pine St', 'Delhi', 'Eligible', '2026-07-19'),
('Veena Sinha', 'Female', '1996-10-07', 'B+', '9876543231', 'veena@email.com', '741 Elm Ave', 'Mumbai', 'Eligible', '2026-08-02'),
('Karan Gill', 'Male', '1993-01-19', 'AB+', '9876543232', 'karan@email.com', '852 Maple Rd', 'Bangalore', 'Eligible', '2026-07-28'),
('Simran Chopra', 'Female', '1997-09-05', 'O-', '9876543233', 'simran@email.com', '963 Cedar Ln', 'Pune', 'Eligible', '2026-08-04'),
('Varun Agarwal', 'Male', '1994-05-23', 'A-', '9876543234', 'varun@email.com', '159 Birch Ave', 'Chennai', 'Eligible', '2026-07-31'),
('Ananya Banerjee', 'Female', '1998-12-11', 'B-', '9876543235', 'ananya@email.com', '357 Spruce St', 'Kolkata', 'Ineligible', NULL),
('Deepak Joshi', 'Male', '1991-03-08', 'AB+', '9876543236', 'deepak@email.com', '456 Willow Rd', 'Hyderabad', 'Eligible', '2026-08-07'),
('Gitika Rao', 'Female', '1995-07-16', 'O+', '9876543237', 'gitika@email.com', '654 Ash Dr', 'Ahmedabad', 'Eligible', '2026-07-24'),
('Manish Kumar', 'Male', '1992-11-29', 'A+', '9876543238', 'manish@email.com', '789 Oak Ct', 'Jaipur', 'Eligible', '2026-08-10'),
('Pavitra Singh', 'Female', '1999-04-02', 'B+', '9876543239', 'pavitra@email.com', '321 Pine Way', 'Lucknow', 'Eligible', '2026-07-29'),
('Siddharth Verma', 'Male', '1990-08-20', 'AB-', '9876543240', 'siddharth@email.com', '258 Elm Ln', 'Delhi', 'Eligible', '2026-08-13'),
('Tanya Khanna', 'Female', '1996-06-10', 'O-', '9876543241', 'tanya@email.com', '147 Maple Ave', 'Mumbai', 'Eligible', '2026-07-23'),
('Aman Thakur', 'Male', '1994-02-05', 'A-', '9876543242', 'aman@email.com', '369 Cedar Pl', 'Bangalore', 'Eligible', '2026-08-08'),
('Richa Nair', 'Female', '1997-10-13', 'B-', '9876543243', 'richa@email.com', '741 Birch St', 'Pune', 'Deferred', NULL),
('Harsh Srivastava', 'Male', '1993-04-25', 'AB+', '9876543244', 'harsh.s@email.com', '852 Spruce Ave', 'Chennai', 'Eligible', '2026-07-16'),
('Aadhya Sharma', 'Female', '1998-01-07', 'O+', '9876543245', 'aadhya@email.com', '963 Willow Ln', 'Kolkata', 'Eligible', '2026-08-11'),
('Bhavesh Patel', 'Male', '1989-09-18', 'A+', '9876543246', 'bhavesh@email.com', '159 Ash Ave', 'Hyderabad', 'Eligible', '2026-07-26'),
('Charu Mishra', 'Female', '1995-05-31', 'B+', '9876543247', 'charu@email.com', '357 Oak Rd', 'Ahmedabad', 'Eligible', '2026-08-09'),
('Dushyant Singh', 'Male', '1992-12-12', 'AB-', '9876543248', 'dushyant@email.com', '456 Pine St', 'Jaipur', 'Eligible', '2026-07-20'),
('Esha Reddy', 'Female', '1997-03-20', 'O-', '9876543249', 'esha@email.com', '654 Elm Ave', 'Lucknow', 'Eligible', '2026-08-05'),
('Faisal Khan', 'Male', '1990-11-14', 'A-', '9876543250', 'faisal@email.com', '789 Maple Ln', 'Delhi', 'Eligible', '2026-07-31'),
('Gita Prabhu', 'Female', '1996-08-06', 'B-', '9876543251', 'gita@email.com', '321 Cedar Dr', 'Mumbai', 'Eligible', '2026-08-12'),
('Hemant Kumar', 'Male', '1994-01-22', 'AB+', '9876543252', 'hemant@email.com', '258 Birch Ct', 'Bangalore', 'Eligible', '2026-07-25'),
('Ishita Verma', 'Female', '1999-07-09', 'O+', '9876543253', 'ishita@email.com', '147 Spruce Way', 'Pune', 'Eligible', '2026-08-03'),
('Jitendra Singh', 'Male', '1991-10-27', 'A+', '9876543254', 'jitendra@email.com', '369 Willow Rd', 'Chennai', 'Eligible', '2026-07-28'),
('Kamini Dutta', 'Female', '1997-02-17', 'B+', '9876543255', 'kamini@email.com', '741 Ash Pl', 'Kolkata', 'Eligible', '2026-08-06'),
('Lokesh Verma', 'Male', '1993-06-30', 'AB-', '9876543256', 'lokesh@email.com', '852 Oak Ave', 'Hyderabad', 'Eligible', '2026-07-21'),
('Monika Sharma', 'Female', '1998-09-11', 'O-', '9876543257', 'monika@email.com', '963 Pine Rd', 'Ahmedabad', 'Eligible', '2026-08-10'),
('Nitin Gupta', 'Male', '1989-04-03', 'A-', '9876543258', 'nitin@email.com', '159 Elm St', 'Jaipur', 'Eligible', '2026-07-19'),
('Onika Desai', 'Female', '1995-12-19', 'B-', '9876543259', 'onika@email.com', '357 Maple Ave', 'Lucknow', 'Eligible', '2026-08-07');

-- ============================================
-- SAMPLE DATA: Donation Camps
-- ============================================
INSERT INTO Donation_Camp (camp_name, location, camp_date, organizer, contact) VALUES
('Red Cross Camp 2026', 'Delhi Central Hospital', '2026-08-01', 'Red Cross Society', '9876500001'),
('Blood Donation Drive', 'Mumbai Medical Center', '2026-08-05', 'Lion''s Club', '9876500002'),
('Summer Blood Camp', 'Bangalore Fitness Hub', '2026-08-10', 'NGO Health India', '9876500003'),
('Emergency Blood Collection', 'Pune General Hospital', '2026-08-15', 'Hospital Blood Bank', '9876500004'),
('Community Drive 2026', 'Chennai City Hall', '2026-07-20', 'Community Forum', '9876500005'),
('Corporate Camp', 'Kolkata Business Park', '2026-07-25', 'TCS', '9876500006'),
('College Blood Drive', 'Hyderabad Engineering Institute', '2026-08-12', 'Student Forum', '9876500007'),
('Hospital Annual Camp', 'Ahmedabad Civil Hospital', '2026-08-18', 'Hospital Management', '9876500008');

-- ============================================
-- SAMPLE DATA: Donations
-- ============================================
INSERT INTO Donation (donor_id, camp_id, donation_date, quantity_ml, donation_status) VALUES
(1, 1, '2026-08-01', 450, 'Collected'),
(2, 2, '2026-08-05', 450, 'Collected'),
(3, 3, '2026-08-10', 450, 'Collected'),
(4, 4, '2026-08-15', 450, 'Collected'),
(5, 5, '2026-07-20', 450, 'Collected'),
(6, 6, '2026-07-25', 450, 'Collected'),
(7, 7, '2026-08-12', 450, 'Collected'),
(8, 8, '2026-08-18', 350, 'Collected'),
(9, 1, '2026-08-02', 450, 'Collected'),
(10, 2, '2026-08-06', 450, 'Collected'),
(11, 3, '2026-08-11', 450, 'Collected'),
(12, 4, '2026-08-16', 450, 'Collected'),
(13, 5, '2026-07-21', 450, 'Collected'),
(14, 6, '2026-07-26', 450, 'Collected'),
(15, 7, '2026-08-13', 450, 'Collected'),
(16, 8, '2026-08-19', 450, 'Collected'),
(17, 1, '2026-08-03', 450, 'Collected'),
(18, 2, '2026-08-07', 450, 'Collected'),
(19, 3, '2026-08-12', 450, 'Collected'),
(20, 4, '2026-08-17', 450, 'Collected'),
(21, 5, '2026-07-22', 450, 'Collected'),
(22, 6, '2026-07-27', 450, 'Collected'),
(23, 7, '2026-08-14', 450, 'Collected'),
(24, 8, '2026-08-20', 450, 'Collected'),
(25, 1, '2026-08-04', 450, 'Collected'),
(26, 2, '2026-08-08', 450, 'Collected'),
(27, 3, '2026-08-13', 450, 'Collected'),
(28, 4, '2026-08-18', 450, 'Collected'),
(29, 5, '2026-07-23', 450, 'Collected'),
(30, 6, '2026-07-28', 450, 'Collected'),
(31, 7, '2026-08-15', 450, 'Collected'),
(32, 8, '2026-08-21', 450, 'Collected'),
(33, 1, '2026-08-05', 450, 'Collected'),
(34, 2, '2026-08-09', 450, 'Collected'),
(35, 3, '2026-08-14', 450, 'Collected'),
(36, 4, '2026-08-19', 450, 'Collected'),
(37, 5, '2026-07-24', 450, 'Collected'),
(38, 6, '2026-07-29', 450, 'Collected'),
(39, 7, '2026-08-16', 450, 'Collected'),
(40, 8, '2026-08-22', 450, 'Collected'),
(41, 1, '2026-08-06', 450, 'Collected'),
(42, 2, '2026-08-10', 450, 'Collected'),
(43, 3, '2026-08-15', 450, 'Collected'),
(44, 4, '2026-08-20', 450, 'Collected'),
(45, 5, '2026-07-25', 450, 'Collected'),
(46, 6, '2026-07-30', 450, 'Collected'),
(47, 7, '2026-08-17', 450, 'Collected'),
(48, 8, '2026-08-23', 450, 'Collected'),
(49, 1, '2026-08-07', 450, 'Collected'),
(50, 2, '2026-08-11', 450, 'Collected');

-- ============================================
-- SAMPLE DATA: Screening
-- ============================================
INSERT INTO Screening (donation_id, hiv_result, hepatitis_b_result, hepatitis_c_result, malaria_result, blood_pressure, hemoglobin, overall_result) VALUES
(1, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 14.5, 'Passed'),
(2, 'Negative', 'Negative', 'Negative', 'Negative', '118/76', 13.8, 'Passed'),
(3, 'Negative', 'Negative', 'Negative', 'Negative', '122/82', 15.2, 'Passed'),
(4, 'Negative', 'Negative', 'Negative', 'Negative', '119/79', 14.1, 'Passed'),
(5, 'Negative', 'Negative', 'Negative', 'Negative', '121/81', 15.0, 'Passed'),
(6, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 13.5, 'Passed'),
(7, 'Negative', 'Negative', 'Negative', 'Negative', '118/78', 14.8, 'Passed'),
(8, 'Positive', 'Negative', 'Negative', 'Negative', '125/85', 12.0, 'Failed'),
(9, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 14.3, 'Passed'),
(10, 'Negative', 'Negative', 'Negative', 'Negative', '119/79', 13.9, 'Passed'),
(11, 'Negative', 'Negative', 'Negative', 'Negative', '121/81', 15.1, 'Passed'),
(12, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 14.6, 'Passed'),
(13, 'Negative', 'Negative', 'Negative', 'Negative', '118/78', 13.7, 'Passed'),
(14, 'Negative', 'Negative', 'Negative', 'Negative', '122/82', 14.9, 'Passed'),
(15, 'Negative', 'Negative', 'Negative', 'Negative', '119/79', 14.2, 'Passed'),
(16, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 15.3, 'Passed'),
(17, 'Negative', 'Negative', 'Negative', 'Negative', '121/81', 14.4, 'Passed'),
(18, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 13.6, 'Passed'),
(19, 'Negative', 'Negative', 'Negative', 'Negative', '118/78', 14.7, 'Passed'),
(20, 'Negative', 'Negative', 'Negative', 'Negative', '122/82', 15.0, 'Passed'),
(21, 'Negative', 'Negative', 'Negative', 'Negative', '119/79', 14.1, 'Passed'),
(22, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 13.8, 'Passed'),
(23, 'Negative', 'Negative', 'Negative', 'Negative', '121/81', 14.9, 'Passed'),
(24, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 15.2, 'Passed'),
(25, 'Negative', 'Negative', 'Negative', 'Negative', '118/78', 14.3, 'Passed'),
(26, 'Negative', 'Negative', 'Negative', 'Negative', '122/82', 13.7, 'Passed'),
(27, 'Negative', 'Negative', 'Negative', 'Negative', '119/79', 14.8, 'Passed'),
(28, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 15.1, 'Passed'),
(29, 'Negative', 'Negative', 'Negative', 'Negative', '121/81', 14.2, 'Passed'),
(30, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 13.9, 'Passed'),
(31, 'Negative', 'Negative', 'Negative', 'Negative', '118/78', 14.6, 'Passed'),
(32, 'Negative', 'Negative', 'Negative', 'Negative', '122/82', 15.0, 'Passed'),
(33, 'Negative', 'Negative', 'Negative', 'Negative', '119/79', 14.4, 'Passed'),
(34, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 13.5, 'Passed'),
(35, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 14.7, 'Passed'),
(36, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 15.2, 'Passed'),
(37, 'Negative', 'Negative', 'Negative', 'Negative', '118/78', 14.1, 'Passed'),
(38, 'Negative', 'Negative', 'Negative', 'Negative', '122/82', 13.8, 'Passed'),
(39, 'Negative', 'Negative', 'Negative', 'Negative', '119/79', 14.9, 'Passed'),
(40, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 15.3, 'Passed'),
(41, 'Negative', 'Negative', 'Negative', 'Negative', '121/81', 14.3, 'Passed'),
(42, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 13.6, 'Passed'),
(43, 'Negative', 'Negative', 'Negative', 'Negative', '118/78', 14.8, 'Passed'),
(44, 'Negative', 'Negative', 'Negative', 'Negative', '122/82', 15.1, 'Passed'),
(45, 'Negative', 'Negative', 'Negative', 'Negative', '119/79', 14.2, 'Passed'),
(46, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 13.9, 'Passed'),
(47, 'Negative', 'Negative', 'Negative', 'Negative', '121/81', 14.7, 'Passed'),
(48, 'Negative', 'Negative', 'Negative', 'Negative', '120/80', 15.0, 'Passed'),
(49, 'Negative', 'Negative', 'Negative', 'Negative', '118/78', 14.4, 'Passed'),
(50, 'Negative', 'Negative', 'Negative', 'Negative', '122/82', 13.7, 'Passed');

-- ============================================
-- SAMPLE DATA: Blood Inventory
-- ============================================
INSERT INTO Blood_Inventory (donation_id, blood_group, component_type, quantity_ml, collection_date, expiry_date, status) VALUES
(1, 'O+', 'Whole Blood', 450, '2026-08-01', '2026-09-12', 'Available'),
(2, 'A+', 'Whole Blood', 450, '2026-08-05', '2026-09-16', 'Available'),
(3, 'B+', 'Whole Blood', 450, '2026-08-10', '2026-09-21', 'Available'),
(4, 'AB+', 'Plasma', 250, '2026-08-15', '2026-11-13', 'Available'),
(5, 'O-', 'Packed Cells', 350, '2026-07-20', '2026-10-18', 'Available'),
(6, 'A-', 'Whole Blood', 450, '2026-07-25', '2026-09-05', 'Available'),
(7, 'B-', 'Platelets', 200, '2026-08-12', '2026-08-19', 'Available'),
(9, 'O+', 'Whole Blood', 450, '2026-08-02', '2026-09-13', 'Available'),
(10, 'A+', 'Whole Blood', 450, '2026-08-06', '2026-09-17', 'Available'),
(11, 'B+', 'Plasma', 250, '2026-08-11', '2026-11-09', 'Available'),
(12, 'AB+', 'Packed Cells', 350, '2026-08-16', '2026-11-14', 'Available'),
(13, 'O-', 'Whole Blood', 450, '2026-07-21', '2026-09-01', 'Expired'),
(14, 'A-', 'Whole Blood', 450, '2026-07-26', '2026-09-06', 'Available'),
(15, 'B-', 'Whole Blood', 450, '2026-08-13', '2026-09-24', 'Available'),
(16, 'AB-', 'Whole Blood', 450, '2026-08-19', '2026-09-30', 'Available'),
(17, 'O+', 'Packed Cells', 350, '2026-08-03', '2026-11-01', 'Available'),
(18, 'A+', 'Plasma', 250, '2026-08-07', '2026-11-05', 'Available'),
(19, 'B+', 'Whole Blood', 450, '2026-08-12', '2026-09-23', 'Available'),
(20, 'AB+', 'Whole Blood', 450, '2026-08-17', '2026-09-28', 'Available'),
(21, 'O-', 'Whole Blood', 450, '2026-07-22', '2026-09-02', 'Expired'),
(22, 'A-', 'Platelets', 200, '2026-07-27', '2026-08-03', 'Available'),
(23, 'B-', 'Whole Blood', 450, '2026-08-14', '2026-09-25', 'Available'),
(24, 'AB-', 'Whole Blood', 450, '2026-08-20', '2026-10-01', 'Available'),
(25, 'O+', 'Whole Blood', 450, '2026-08-04', '2026-09-15', 'Available'),
(26, 'A+', 'Whole Blood', 450, '2026-08-08', '2026-09-19', 'Available'),
(27, 'B+', 'Packed Cells', 350, '2026-08-13', '2026-11-11', 'Available'),
(28, 'AB+', 'Whole Blood', 450, '2026-08-18', '2026-09-29', 'Available'),
(29, 'O-', 'Whole Blood', 450, '2026-07-23', '2026-09-03', 'Expired'),
(30, 'A-', 'Whole Blood', 450, '2026-07-28', '2026-09-08', 'Available'),
(31, 'B-', 'Whole Blood', 450, '2026-08-15', '2026-09-26', 'Available'),
(32, 'AB-', 'Plasma', 250, '2026-08-21', '2026-11-19', 'Available'),
(33, 'O+', 'Whole Blood', 450, '2026-08-05', '2026-09-16', 'Available'),
(34, 'A+', 'Whole Blood', 450, '2026-08-09', '2026-09-20', 'Available'),
(35, 'B+', 'Whole Blood', 450, '2026-08-14', '2026-09-25', 'Available'),
(36, 'AB+', 'Whole Blood', 450, '2026-08-19', '2026-09-30', 'Available'),
(37, 'O-', 'Whole Blood', 450, '2026-07-24', '2026-09-04', 'Expired'),
(38, 'A-', 'Whole Blood', 450, '2026-07-29', '2026-09-09', 'Available'),
(39, 'B-', 'Platelets', 200, '2026-08-16', '2026-08-23', 'Available'),
(40, 'AB-', 'Whole Blood', 450, '2026-08-22', '2026-10-02', 'Available'),
(41, 'O+', 'Whole Blood', 450, '2026-08-06', '2026-09-17', 'Available'),
(42, 'A+', 'Packed Cells', 350, '2026-08-10', '2026-11-08', 'Available'),
(43, 'B+', 'Whole Blood', 450, '2026-08-15', '2026-09-26', 'Available'),
(44, 'AB+', 'Whole Blood', 450, '2026-08-20', '2026-10-01', 'Available'),
(45, 'O-', 'Whole Blood', 450, '2026-07-25', '2026-09-05', 'Available'),
(46, 'A-', 'Whole Blood', 450, '2026-07-30', '2026-09-10', 'Available'),
(47, 'B-', 'Whole Blood', 450, '2026-08-17', '2026-09-28', 'Available'),
(48, 'AB-', 'Whole Blood', 450, '2026-08-23', '2026-10-03', 'Available'),
(49, 'O+', 'Plasma', 250, '2026-08-07', '2026-11-05', 'Available'),
(50, 'A+', 'Whole Blood', 450, '2026-08-11', '2026-09-22', 'Available');

-- ============================================
-- SAMPLE DATA: Hospital
-- ============================================
INSERT INTO Hospital (hospital_name, address, city, phone) VALUES
('Delhi Medical Center', '100 Hospital Rd', 'Delhi', '9876600001'),
('Apollo Hospital Mumbai', '200 Marine Drive', 'Mumbai', '9876600002'),
('Bangalore General Hospital', '300 MG Road', 'Bangalore', '9876600003'),
('Pune City Hospital', '400 East Ave', 'Pune', '9876600004'),
('Chennai Medical Institute', '500 Beach Rd', 'Chennai', '9876600005'),
('Kolkata Healthcare', '600 Park St', 'Kolkata', '9876600006'),
('Hyderabad Health Center', '700 Tank Bund', 'Hyderabad', '9876600007'),
('Ahmedabad Civil Hospital', '800 Sardar Ave', 'Ahmedabad', '9876600008'),
('Jaipur General Hospital', '900 Rajendra Pl', 'Jaipur', '9876600009'),
('Lucknow Medical Center', '1000 Hazratganj', 'Lucknow', '9876600010');

-- ============================================
-- SAMPLE DATA: Recipient
-- ============================================
INSERT INTO Recipient (hospital_id, recipient_name, age, gender, blood_group, contact) VALUES
(1, 'Patient A', 45, 'Male', 'O+', '9876700001'),
(1, 'Patient B', 32, 'Female', 'A+', '9876700002'),
(2, 'Patient C', 60, 'Male', 'B+', '9876700003'),
(2, 'Patient D', 28, 'Female', 'AB+', '9876700004'),
(3, 'Patient E', 55, 'Male', 'O-', '9876700005'),
(3, 'Patient F', 38, 'Female', 'A-', '9876700006'),
(4, 'Patient G', 42, 'Male', 'B-', '9876700007'),
(4, 'Patient H', 51, 'Female', 'AB-', '9876700008'),
(5, 'Patient I', 35, 'Male', 'O+', '9876700009'),
(5, 'Patient J', 29, 'Female', 'A+', '9876700010'),
(6, 'Patient K', 67, 'Male', 'B+', '9876700011'),
(6, 'Patient L', 44, 'Female', 'AB+', '9876700012'),
(7, 'Patient M', 36, 'Male', 'O-', '9876700013'),
(7, 'Patient N', 50, 'Female', 'A-', '9876700014'),
(8, 'Patient O', 48, 'Male', 'B-', '9876700015'),
(8, 'Patient P', 33, 'Female', 'AB-', '9876700016'),
(9, 'Patient Q', 52, 'Male', 'O+', '9876700017'),
(9, 'Patient R', 27, 'Female', 'A+', '9876700018'),
(10, 'Patient S', 61, 'Male', 'B+', '9876700019'),
(10, 'Patient T', 40, 'Female', 'AB+', '9876700020'),
(1, 'Patient U', 37, 'Male', 'O-', '9876700021'),
(2, 'Patient V', 46, 'Female', 'A-', '9876700022'),
(3, 'Patient W', 54, 'Male', 'B-', '9876700023'),
(4, 'Patient X', 31, 'Female', 'AB-', '9876700024'),
(5, 'Patient Y', 58, 'Male', 'O+', '9876700025'),
(6, 'Patient Z', 43, 'Female', 'A+', '9876700026'),
(7, 'Patient AA', 39, 'Male', 'B+', '9876700027'),
(8, 'Patient AB', 49, 'Female', 'AB+', '9876700028'),
(9, 'Patient AC', 63, 'Male', 'O-', '9876700029'),
(10, 'Patient AD', 26, 'Female', 'A-', '9876700030');

-- ============================================
-- SAMPLE DATA: Blood Request
-- ============================================
INSERT INTO Blood_Request (recipient_id, blood_group, component_type, units_required, request_date, priority, status) VALUES
(1, 'O+', 'Whole Blood', 2, '2026-08-20', 'Normal', 'Approved'),
(2, 'A+', 'Whole Blood', 1, '2026-08-21', 'Urgent', 'Approved'),
(3, 'B+', 'Whole Blood', 3, '2026-08-22', 'Emergency', 'Pending'),
(4, 'AB+', 'Plasma', 2, '2026-08-23', 'Normal', 'Approved'),
(5, 'O-', 'Packed Cells', 1, '2026-08-24', 'Urgent', 'Approved'),
(6, 'A-', 'Whole Blood', 2, '2026-08-25', 'Emergency', 'Pending'),
(7, 'B-', 'Platelets', 1, '2026-08-26', 'Normal', 'Approved'),
(8, 'AB-', 'Whole Blood', 2, '2026-08-27', 'Urgent', 'Approved'),
(9, 'O+', 'Whole Blood', 1, '2026-08-28', 'Normal', 'Approved'),
(10, 'A+', 'Whole Blood', 2, '2026-08-29', 'Emergency', 'Pending'),
(11, 'B+', 'Plasma', 1, '2026-08-30', 'Normal', 'Approved'),
(12, 'AB+', 'Whole Blood', 3, '2026-09-01', 'Urgent', 'Approved'),
(13, 'O-', 'Whole Blood', 2, '2026-09-02', 'Normal', 'Approved'),
(14, 'A-', 'Whole Blood', 1, '2026-09-03', 'Urgent', 'Pending'),
(15, 'B-', 'Whole Blood', 2, '2026-09-04', 'Normal', 'Approved'),
(16, 'AB-', 'Platelets', 1, '2026-09-05', 'Emergency', 'Approved'),
(17, 'O+', 'Packed Cells', 2, '2026-09-06', 'Normal', 'Approved'),
(18, 'A+', 'Whole Blood', 1, '2026-09-07', 'Urgent', 'Pending'),
(19, 'B+', 'Whole Blood', 3, '2026-09-08', 'Emergency', 'Approved'),
(20, 'AB+', 'Whole Blood', 2, '2026-09-09', 'Normal', 'Approved'),
(21, 'O-', 'Whole Blood', 1, '2026-09-10', 'Urgent', 'Approved'),
(22, 'A-', 'Whole Blood', 2, '2026-09-11', 'Normal', 'Approved'),
(23, 'B-', 'Whole Blood', 1, '2026-09-12', 'Emergency', 'Pending'),
(24, 'AB-', 'Whole Blood', 2, '2026-09-13', 'Urgent', 'Approved'),
(25, 'O+', 'Whole Blood', 3, '2026-09-14', 'Normal', 'Approved'),
(26, 'A+', 'Whole Blood', 1, '2026-09-15', 'Urgent', 'Approved'),
(27, 'B+', 'Packed Cells', 2, '2026-09-16', 'Normal', 'Pending'),
(28, 'AB+', 'Whole Blood', 1, '2026-09-17', 'Emergency', 'Approved'),
(29, 'O-', 'Whole Blood', 2, '2026-09-18', 'Normal', 'Approved'),
(30, 'A-', 'Platelets', 1, '2026-09-19', 'Urgent', 'Approved');

-- ============================================
-- SAMPLE DATA: Blood Issue
-- ============================================
INSERT INTO Blood_Issue (request_id, blood_id, issue_date, quantity_ml) VALUES
(1, 1, '2026-08-21', 450),
(2, 2, '2026-08-22', 450),
(4, 4, '2026-08-24', 250),
(5, 5, '2026-08-25', 350),
(7, 7, '2026-08-27', 200),
(8, 8, '2026-08-28', 450),
(9, 9, '2026-08-29', 450),
(11, 11, '2026-08-31', 250),
(12, 12, '2026-09-02', 350),
(13, 14, '2026-09-03', 450),
(15, 15, '2026-09-04', 450),
(16, 16, '2026-09-05', 450),
(17, 17, '2026-09-06', 350),
(19, 19, '2026-09-08', 450),
(20, 20, '2026-09-09', 450),
(21, 21, '2026-09-10', 450),
(22, 22, '2026-09-11', 450),
(24, 24, '2026-09-13', 450),
(25, 25, '2026-09-14', 450),
(26, 26, '2026-09-15', 450);

-- ============================================
-- SAMPLE DATA: Billing
-- ============================================
INSERT INTO Billing (issue_id, bill_date, amount, payment_method, payment_status) VALUES
(1, '2026-08-21', 500.00, 'Cash', 'Paid'),
(2, '2026-08-22', 500.00, 'Card', 'Paid'),
(3, '2026-08-24', 300.00, 'UPI', 'Paid'),
(4, '2026-08-25', 400.00, 'Cash', 'Pending'),
(5, '2026-08-27', 250.00, 'Card', 'Paid'),
(6, '2026-08-28', 500.00, 'Online', 'Paid'),
(7, '2026-08-29', 500.00, 'UPI', 'Paid'),
(8, '2026-08-31', 300.00, 'Cash', 'Pending'),
(9, '2026-09-02', 400.00, 'Card', 'Paid'),
(10, '2026-09-03', 500.00, 'Online', 'Paid'),
(11, '2026-09-04', 500.00, 'UPI', 'Paid'),
(12, '2026-09-05', 500.00, 'Cash', 'Paid'),
(13, '2026-09-06', 400.00, 'Card', 'Pending'),
(14, '2026-09-08', 500.00, 'Online', 'Paid'),
(15, '2026-09-09', 500.00, 'UPI', 'Paid'),
(16, '2026-09-10', 500.00, 'Cash', 'Paid'),
(17, '2026-09-11', 500.00, 'Card', 'Paid'),
(18, '2026-09-13', 500.00, 'Online', 'Paid'),
(19, '2026-09-14', 500.00, 'UPI', 'Paid'),
(20, '2026-09-15', 500.00, 'Cash', 'Paid');

-- ============================================
-- Verify Data
-- ============================================
SELECT 'Donor' AS TableName, COUNT(*) AS RecordCount FROM Donor
UNION ALL
SELECT 'Donation_Camp', COUNT(*) FROM Donation_Camp
UNION ALL
SELECT 'Donation', COUNT(*) FROM Donation
UNION ALL
SELECT 'Screening', COUNT(*) FROM Screening
UNION ALL
SELECT 'Blood_Inventory', COUNT(*) FROM Blood_Inventory
UNION ALL
SELECT 'Hospital', COUNT(*) FROM Hospital
UNION ALL
SELECT 'Recipient', COUNT(*) FROM Recipient
UNION ALL
SELECT 'Blood_Request', COUNT(*) FROM Blood_Request
UNION ALL
SELECT 'Blood_Issue', COUNT(*) FROM Blood_Issue
UNION ALL
SELECT 'Billing', COUNT(*) FROM Billing;
