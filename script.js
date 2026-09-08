// Blood Bank Management System - Frontend JavaScript
const API_BASE = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    loadDonors();
    loadDonations();
    loadCamps();
    loadScreening();
    loadInventory();
    loadHospitals();
    loadRecipients();
    loadRequests();
    loadIssues();
    loadBilling();
    loadReports();
    
    // Setup form submissions
    document.getElementById('donorForm').addEventListener('submit', saveDonor);
    document.getElementById('donationForm').addEventListener('submit', saveDonation);
    document.getElementById('campForm').addEventListener('submit', saveCamp);
    document.getElementById('screeningForm').addEventListener('submit', saveScreening);
    document.getElementById('hospitalForm').addEventListener('submit', saveHospital);
    document.getElementById('recipientForm').addEventListener('submit', saveRecipient);
    document.getElementById('requestForm').addEventListener('submit', saveRequest);
    document.getElementById('issueForm').addEventListener('submit', saveIssue);
    document.getElementById('billingForm').addEventListener('submit', saveBilling);
    
    // Setup search and filter
    document.getElementById('donorSearch').addEventListener('input', filterDonors);
    document.getElementById('bloodGroupFilter').addEventListener('change', filterDonors);
});

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav item
    event.target.classList.add('active');
    
    // Reload data for the section
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'donors':
            loadDonors();
            break;
        case 'donations':
            loadDonations();
            break;
        case 'camps':
            loadCamps();
            break;
        case 'screening':
            loadScreening();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'hospitals':
            loadHospitals();
            break;
        case 'recipients':
            loadRecipients();
            break;
        case 'requests':
            loadRequests();
            break;
        case 'issues':
            loadIssues();
            break;
        case 'billing':
            loadBilling();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Dashboard request failed (${response.status})`);
        }
        
        document.getElementById('totalDonors').textContent = data.totalDonors;
        document.getElementById('totalBloodUnits').textContent = data.totalBloodUnits;
        document.getElementById('availableBloodUnits').textContent = data.availableBloodUnits;
        document.getElementById('pendingRequests').textContent = data.pendingRequests;
        document.getElementById('emergencyRequests').textContent = data.emergencyRequests;
        document.getElementById('totalHospitals').textContent = data.totalHospitals;
        document.getElementById('totalRecipients').textContent = data.totalRecipients;
        document.getElementById('donationCamps').textContent = data.donationCamps;
        
        // Blood availability table
        const bloodTable = document.getElementById('bloodAvailabilityTable');
        bloodTable.innerHTML = '';
        data.bloodByGroup.forEach(item => {
            const row = `<tr>
                <td>${item.blood_group}</td>
                <td>${item.units || 0}</td>
                <td>${item.quantity || 0}</td>
            </tr>`;
            bloodTable.innerHTML += row;
        });
        
        // If no data, show message
        if (data.bloodByGroup.length === 0) {
            bloodTable.innerHTML = '<tr><td colspan="3" class="text-center">No blood units available</td></tr>';
        }
    } catch (error) {
        console.error('Dashboard Error:', error);
        alert('Failed to load dashboard');
    }
}

// ============================================
// DONOR MANAGEMENT
// ============================================
async function loadDonors() {
    try {
        const response = await fetch(`${API_BASE}/donors`);
        const donors = await response.json();
        
        const table = document.getElementById('donorTable').querySelector('tbody');
        table.innerHTML = '';
        
        donors.forEach(donor => {
            const row = `<tr>
                <td>${donor.donor_id}</td>
                <td>${donor.donor_name}</td>
                <td>${donor.gender || '-'}</td>
                <td>${donor.blood_group}</td>
                <td>${donor.phone}</td>
                <td>${donor.city || '-'}</td>
                <td>${donor.eligibility_status}</td>
                <td>${donor.last_donation_date || 'Never'}</td>
                <td>
                    <button class="btn btn-primary" onclick="editDonor(${donor.donor_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteDonor(${donor.donor_id})">Delete</button>
                    <button class="btn btn-success" onclick="viewDonorHistory(${donor.donor_id})">History</button>
                </td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (donors.length === 0) {
            table.innerHTML = '<tr><td colspan="9" class="text-center">No donors found</td></tr>';
        }
    } catch (error) {
        console.error('Donor List Error:', error);
    }
}

function openDonorModal() {
    document.getElementById('donorId').value = '';
    document.getElementById('donorForm').reset();
    document.getElementById('donorModal').style.display = 'block';
}

function closeDonorModal() {
    document.getElementById('donorModal').style.display = 'none';
}

async function saveDonor(e) {
    e.preventDefault();
    
    const donor = {
        donor_name: document.getElementById('donorName').value,
        gender: document.getElementById('donorGender').value,
        date_of_birth: document.getElementById('donorDOB').value,
        blood_group: document.getElementById('donorBloodGroup').value,
        phone: document.getElementById('donorPhone').value,
        email: document.getElementById('donorEmail').value,
        address: document.getElementById('donorAddress').value,
        city: document.getElementById('donorCity').value,
        eligibility_status: document.getElementById('donorEligibility').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/donors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donor)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Donor saved successfully!');
        closeDonorModal();
        loadDonors();
    } catch (error) {
        console.error('Save Donor Error:', error);
        alert('Failed to save donor');
    }
}

async function editDonor(donorId) {
    try {
        const response = await fetch(`${API_BASE}/donors/${donorId}`);
        const donor = await response.json();
        
        document.getElementById('donorId').value = donor.donor_id;
        document.getElementById('donorName').value = donor.donor_name;
        document.getElementById('donorGender').value = donor.gender || '';
        document.getElementById('donorDOB').value = donor.date_of_birth || '';
        document.getElementById('donorBloodGroup').value = donor.blood_group;
        document.getElementById('donorPhone').value = donor.phone;
        document.getElementById('donorEmail').value = donor.email || '';
        document.getElementById('donorAddress').value = donor.address || '';
        document.getElementById('donorCity').value = donor.city || '';
        document.getElementById('donorEligibility').value = donor.eligibility_status;
        
        document.getElementById('donorModal').style.display = 'block';
    } catch (error) {
        console.error('Edit Donor Error:', error);
        alert('Failed to load donor');
    }
}

async function deleteDonor(donorId) {
    if (!confirm('Are you sure you want to delete this donor?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/donors/${donorId}`, { method: 'DELETE' });
        const result = await response.json();
        
        alert(result.message);
        loadDonors();
    } catch (error) {
        console.error('Delete Donor Error:', error);
        alert('Failed to delete donor');
    }
}

async function viewDonorHistory(donorId) {
    try {
        const response = await fetch(`${API_BASE}/donors/${donorId}/donations`);
        const donations = await response.json();
        
        let message = 'Donation History:\n\n';
        donations.forEach((d, i) => {
            message += `${i + 1}. Date: ${d.donation_date}, Qty: ${d.quantity_ml}ml, Status: ${d.overall_result}\n`;
        });
        
        if (donations.length === 0) {
            message = 'No donations recorded for this donor.';
        }
        
        alert(message);
    } catch (error) {
        console.error('History Error:', error);
    }
}

function filterDonors() {
    const searchTerm = document.getElementById('donorSearch').value.toLowerCase();
    const bloodGroup = document.getElementById('bloodGroupFilter').value;
    const rows = document.querySelectorAll('#donorTable tbody tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const blood = row.cells[3].textContent;
        
        const matchSearch = name.includes(searchTerm);
        const matchBlood = !bloodGroup || blood === bloodGroup;
        
        row.style.display = (matchSearch && matchBlood) ? '' : 'none';
    });
}

// ============================================
// DONATIONS
// ============================================
async function loadDonations() {
    try {
        const response = await fetch(`${API_BASE}/donations`);
        const donations = await response.json();
        
        const table = document.getElementById('donationTable').querySelector('tbody');
        table.innerHTML = '';
        
        donations.forEach(donation => {
            const row = `<tr>
                <td>${donation.donation_id}</td>
                <td>${donation.donor_name}</td>
                <td>${donation.blood_group}</td>
                <td>${donation.donation_date}</td>
                <td>${donation.quantity_ml}</td>
                <td>${donation.camp_name || 'Walk-in'}</td>
                <td>${donation.donation_status}</td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (donations.length === 0) {
            table.innerHTML = '<tr><td colspan="7" class="text-center">No donations found</td></tr>';
        }
    } catch (error) {
        console.error('Donations List Error:', error);
    }
}

function openDonationModal() {
    document.getElementById('donationForm').reset();
    loadDonorDropdown('donationDonorId');
    loadCampDropdown('donationCampId');
    document.getElementById('donationModal').style.display = 'block';
}

function closeDonationModal() {
    document.getElementById('donationModal').style.display = 'none';
}

async function saveDonation(e) {
    e.preventDefault();
    
    const donation = {
        donor_id: document.getElementById('donationDonorId').value,
        camp_id: document.getElementById('donationCampId').value || null,
        donation_date: document.getElementById('donationDate').value,
        quantity_ml: document.getElementById('donationQuantity').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/donations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donation)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Donation recorded successfully!');
        closeDonationModal();
        loadDonations();
    } catch (error) {
        console.error('Save Donation Error:', error);
        alert('Failed to record donation');
    }
}

// ============================================
// DONATION CAMPS
// ============================================
async function loadCamps() {
    try {
        const response = await fetch(`${API_BASE}/camps`);
        const camps = await response.json();
        
        const table = document.getElementById('campTable').querySelector('tbody');
        table.innerHTML = '';
        
        camps.forEach(camp => {
            const row = `<tr>
                <td>${camp.camp_id}</td>
                <td>${camp.camp_name}</td>
                <td>${camp.location || '-'}</td>
                <td>${camp.camp_date}</td>
                <td>${camp.organizer || '-'}</td>
                <td>${camp.contact || '-'}</td>
                <td>${camp.donations_collected || 0}</td>
                <td>
                    <button class="btn btn-primary" onclick="editCamp(${camp.camp_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCamp(${camp.camp_id})">Delete</button>
                </td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (camps.length === 0) {
            table.innerHTML = '<tr><td colspan="8" class="text-center">No camps found</td></tr>';
        }
    } catch (error) {
        console.error('Camps List Error:', error);
    }
}

function openCampModal() {
    document.getElementById('campId').value = '';
    document.getElementById('campForm').reset();
    document.getElementById('campModal').style.display = 'block';
}

function closeCampModal() {
    document.getElementById('campModal').style.display = 'none';
}

async function saveCamp(e) {
    e.preventDefault();
    
    const camp = {
        camp_name: document.getElementById('campName').value,
        location: document.getElementById('campLocation').value,
        camp_date: document.getElementById('campDate').value,
        organizer: document.getElementById('campOrganizer').value,
        contact: document.getElementById('campContact').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/camps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(camp)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Camp created successfully!');
        closeCampModal();
        loadCamps();
    } catch (error) {
        console.error('Save Camp Error:', error);
        alert('Failed to create camp');
    }
}

async function editCamp(campId) {
    try {
        const response = await fetch(`${API_BASE}/camps`);
        const camps = await response.json();
        const camp = camps.find(c => c.camp_id === campId);
        
        if (!camp) return;
        
        document.getElementById('campId').value = camp.camp_id;
        document.getElementById('campName').value = camp.camp_name;
        document.getElementById('campLocation').value = camp.location || '';
        document.getElementById('campDate').value = camp.camp_date;
        document.getElementById('campOrganizer').value = camp.organizer || '';
        document.getElementById('campContact').value = camp.contact || '';
        
        document.getElementById('campModal').style.display = 'block';
    } catch (error) {
        console.error('Edit Camp Error:', error);
    }
}

async function deleteCamp(campId) {
    if (!confirm('Are you sure?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/camps/${campId}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);
        loadCamps();
    } catch (error) {
        console.error('Delete Camp Error:', error);
    }
}

// ============================================
// SCREENING
// ============================================
async function loadScreening() {
    try {
        const response = await fetch(`${API_BASE}/screening`);
        const records = await response.json();
        
        const table = document.getElementById('screeningTable').querySelector('tbody');
        table.innerHTML = '';
        
        records.forEach(record => {
            const row = `<tr>
                <td>${record.screening_id}</td>
                <td>${record.donation_id}</td>
                <td>${record.donor_name}</td>
                <td>${record.hiv_result}</td>
                <td>${record.hepatitis_b_result}</td>
                <td>${record.hepatitis_c_result}</td>
                <td>${record.malaria_result}</td>
                <td>${record.hemoglobin}</td>
                <td><span style="color: ${record.overall_result === 'Passed' ? 'green' : 'red'}">${record.overall_result}</span></td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (records.length === 0) {
            table.innerHTML = '<tr><td colspan="9" class="text-center">No screening records found</td></tr>';
        }
    } catch (error) {
        console.error('Screening List Error:', error);
    }
}

function openScreeningModal() {
    document.getElementById('screeningForm').reset();
    loadDonationDropdown('screeningDonationId');
    document.getElementById('screeningModal').style.display = 'block';
}

function closeScreeningModal() {
    document.getElementById('screeningModal').style.display = 'none';
}

async function saveScreening(e) {
    e.preventDefault();
    
    const screening = {
        donation_id: document.getElementById('screeningDonationId').value,
        hiv_result: document.getElementById('screeningHIV').value,
        hepatitis_b_result: document.getElementById('screeningHepatitisB').value,
        hepatitis_c_result: document.getElementById('screeningHepatitisC').value,
        malaria_result: document.getElementById('screeningMalaria').value,
        blood_pressure: document.getElementById('screeningBP').value,
        hemoglobin: document.getElementById('screeningHemoglobin').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/screening`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(screening)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Screening record added successfully!');
        closeScreeningModal();
        loadScreening();
    } catch (error) {
        console.error('Save Screening Error:', error);
        alert('Failed to add screening record');
    }
}

// ============================================
// BLOOD INVENTORY
// ============================================
async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/inventory`);
        const inventory = await response.json();
        
        const table = document.getElementById('inventoryTable').querySelector('tbody');
        table.innerHTML = '';
        
        inventory.forEach(item => {
            const row = `<tr>
                <td>${item.blood_id}</td>
                <td>${item.blood_group}</td>
                <td>${item.component_type || '-'}</td>
                <td>${item.quantity_ml}</td>
                <td>${item.collection_date}</td>
                <td>${item.expiry_date}</td>
                <td>${item.status}</td>
                <td>${item.donor_name}</td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (inventory.length === 0) {
            table.innerHTML = '<tr><td colspan="8" class="text-center">No inventory found</td></tr>';
        }
    } catch (error) {
        console.error('Inventory List Error:', error);
    }
}

async function loadExpiringBlood() {
    try {
        const response = await fetch(`${API_BASE}/inventory/expiring`);
        const expiring = await response.json();
        
        if (expiring.length === 0) {
            alert('No blood units expiring soon!');
            return;
        }
        
        let message = 'Blood Units Expiring Soon:\n\n';
        expiring.forEach((item, i) => {
            message += `${i + 1}. ${item.blood_group} - ${item.component_type} - Expires: ${item.expiry_date}\n`;
        });
        
        alert(message);
    } catch (error) {
        console.error('Expiring Blood Error:', error);
    }
}

// ============================================
// HOSPITALS
// ============================================
async function loadHospitals() {
    try {
        const response = await fetch(`${API_BASE}/hospitals`);
        const hospitals = await response.json();
        
        const table = document.getElementById('hospitalTable').querySelector('tbody');
        table.innerHTML = '';
        
        hospitals.forEach(hospital => {
            const row = `<tr>
                <td>${hospital.hospital_id}</td>
                <td>${hospital.hospital_name}</td>
                <td>${hospital.address || '-'}</td>
                <td>${hospital.city || '-'}</td>
                <td>${hospital.phone || '-'}</td>
                <td>
                    <button class="btn btn-primary" onclick="editHospital(${hospital.hospital_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteHospital(${hospital.hospital_id})">Delete</button>
                </td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (hospitals.length === 0) {
            table.innerHTML = '<tr><td colspan="6" class="text-center">No hospitals found</td></tr>';
        }
    } catch (error) {
        console.error('Hospitals List Error:', error);
    }
}

function openHospitalModal() {
    document.getElementById('hospitalId').value = '';
    document.getElementById('hospitalForm').reset();
    document.getElementById('hospitalModal').style.display = 'block';
}

function closeHospitalModal() {
    document.getElementById('hospitalModal').style.display = 'none';
}

async function saveHospital(e) {
    e.preventDefault();
    
    const hospital = {
        hospital_name: document.getElementById('hospitalName').value,
        address: document.getElementById('hospitalAddress').value,
        city: document.getElementById('hospitalCity').value,
        phone: document.getElementById('hospitalPhone').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/hospitals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hospital)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Hospital added successfully!');
        closeHospitalModal();
        loadHospitals();
    } catch (error) {
        console.error('Save Hospital Error:', error);
        alert('Failed to add hospital');
    }
}

async function editHospital(hospitalId) {
    try {
        const response = await fetch(`${API_BASE}/hospitals`);
        const hospitals = await response.json();
        const hospital = hospitals.find(h => h.hospital_id === hospitalId);
        
        if (!hospital) return;
        
        document.getElementById('hospitalId').value = hospital.hospital_id;
        document.getElementById('hospitalName').value = hospital.hospital_name;
        document.getElementById('hospitalAddress').value = hospital.address || '';
        document.getElementById('hospitalCity').value = hospital.city || '';
        document.getElementById('hospitalPhone').value = hospital.phone || '';
        
        document.getElementById('hospitalModal').style.display = 'block';
    } catch (error) {
        console.error('Edit Hospital Error:', error);
    }
}

async function deleteHospital(hospitalId) {
    if (!confirm('Are you sure?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/hospitals/${hospitalId}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);
        loadHospitals();
    } catch (error) {
        console.error('Delete Hospital Error:', error);
    }
}

// ============================================
// RECIPIENTS
// ============================================
async function loadRecipients() {
    try {
        const response = await fetch(`${API_BASE}/recipients`);
        const recipients = await response.json();
        
        const table = document.getElementById('recipientTable').querySelector('tbody');
        table.innerHTML = '';
        
        recipients.forEach(recipient => {
            const row = `<tr>
                <td>${recipient.recipient_id}</td>
                <td>${recipient.recipient_name}</td>
                <td>${recipient.age || '-'}</td>
                <td>${recipient.gender || '-'}</td>
                <td>${recipient.blood_group}</td>
                <td>${recipient.hospital_name}</td>
                <td>${recipient.contact || '-'}</td>
                <td>
                    <button class="btn btn-primary" onclick="editRecipient(${recipient.recipient_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteRecipient(${recipient.recipient_id})">Delete</button>
                </td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (recipients.length === 0) {
            table.innerHTML = '<tr><td colspan="8" class="text-center">No recipients found</td></tr>';
        }
    } catch (error) {
        console.error('Recipients List Error:', error);
    }
}

function openRecipientModal() {
    document.getElementById('recipientId').value = '';
    document.getElementById('recipientForm').reset();
    loadHospitalDropdown('recipientHospitalId');
    document.getElementById('recipientModal').style.display = 'block';
}

function closeRecipientModal() {
    document.getElementById('recipientModal').style.display = 'none';
}

async function saveRecipient(e) {
    e.preventDefault();
    
    const recipient = {
        hospital_id: document.getElementById('recipientHospitalId').value,
        recipient_name: document.getElementById('recipientName').value,
        age: document.getElementById('recipientAge').value,
        gender: document.getElementById('recipientGender').value,
        blood_group: document.getElementById('recipientBloodGroup').value,
        contact: document.getElementById('recipientContact').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/recipients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipient)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Recipient added successfully!');
        closeRecipientModal();
        loadRecipients();
    } catch (error) {
        console.error('Save Recipient Error:', error);
        alert('Failed to add recipient');
    }
}

async function editRecipient(recipientId) {
    try {
        const response = await fetch(`${API_BASE}/recipients`);
        const recipients = await response.json();
        const recipient = recipients.find(r => r.recipient_id === recipientId);
        
        if (!recipient) return;
        
        document.getElementById('recipientId').value = recipient.recipient_id;
        document.getElementById('recipientHospitalId').value = recipient.hospital_id;
        document.getElementById('recipientName').value = recipient.recipient_name;
        document.getElementById('recipientAge').value = recipient.age || '';
        document.getElementById('recipientGender').value = recipient.gender || '';
        document.getElementById('recipientBloodGroup').value = recipient.blood_group;
        document.getElementById('recipientContact').value = recipient.contact || '';
        
        document.getElementById('recipientModal').style.display = 'block';
    } catch (error) {
        console.error('Edit Recipient Error:', error);
    }
}

async function deleteRecipient(recipientId) {
    if (!confirm('Are you sure?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/recipients/${recipientId}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);
        loadRecipients();
    } catch (error) {
        console.error('Delete Recipient Error:', error);
    }
}

// ============================================
// BLOOD REQUESTS
// ============================================
async function loadRequests() {
    try {
        const response = await fetch(`${API_BASE}/requests`);
        const requests = await response.json();
        
        const table = document.getElementById('requestTable').querySelector('tbody');
        table.innerHTML = '';
        
        requests.forEach(request => {
            const row = `<tr>
                <td>${request.request_id}</td>
                <td>${request.recipient_name}</td>
                <td>${request.blood_group}</td>
                <td>${request.units_required}</td>
                <td>${request.request_date}</td>
                <td><span style="color: ${request.priority === 'Emergency' ? 'red' : 'orange'}">${request.priority}</span></td>
                <td>${request.status}</td>
                <td>
                    <button class="btn btn-success" onclick="updateRequestStatus(${request.request_id}, 'Approved')">Approve</button>
                    <button class="btn btn-danger" onclick="updateRequestStatus(${request.request_id}, 'Rejected')">Reject</button>
                </td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (requests.length === 0) {
            table.innerHTML = '<tr><td colspan="8" class="text-center">No requests found</td></tr>';
        }
    } catch (error) {
        console.error('Requests List Error:', error);
    }
}

function openRequestModal() {
    document.getElementById('requestForm').reset();
    loadRecipientDropdown('requestRecipientId');
    document.getElementById('requestModal').style.display = 'block';
}

function closeRequestModal() {
    document.getElementById('requestModal').style.display = 'none';
}

async function saveRequest(e) {
    e.preventDefault();
    
    const request = {
        recipient_id: document.getElementById('requestRecipientId').value,
        blood_group: document.getElementById('requestBloodGroup').value,
        component_type: document.getElementById('requestComponentType').value,
        units_required: document.getElementById('requestUnits').value,
        request_date: document.getElementById('requestDate').value,
        priority: document.getElementById('requestPriority').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Blood request created successfully!');
        closeRequestModal();
        loadRequests();
    } catch (error) {
        console.error('Save Request Error:', error);
        alert('Failed to create blood request');
    }
}

async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetch(`${API_BASE}/requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        alert(result.message);
        loadRequests();
    } catch (error) {
        console.error('Update Request Error:', error);
    }
}

// ============================================
// BLOOD ISSUES (WITH TRANSACTION)
// ============================================
async function loadIssues() {
    try {
        const response = await fetch(`${API_BASE}/issues`);
        const issues = await response.json();
        
        const table = document.getElementById('issueTable').querySelector('tbody');
        table.innerHTML = '';
        
        issues.forEach(issue => {
            const row = `<tr>
                <td>${issue.issue_id}</td>
                <td>${issue.request_id}</td>
                <td>${issue.recipient_name}</td>
                <td>${issue.blood_group}</td>
                <td>${issue.quantity_ml}</td>
                <td>${issue.issue_date}</td>
                <td>${issue.hospital_name}</td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (issues.length === 0) {
            table.innerHTML = '<tr><td colspan="7" class="text-center">No blood issues found</td></tr>';
        }
    } catch (error) {
        console.error('Issues List Error:', error);
    }
}

function openIssueModal() {
    document.getElementById('issueForm').reset();
    loadRequestDropdown('issueRequestId');
    loadBloodInventoryDropdown('issueBloodId');
    document.getElementById('issueModal').style.display = 'block';
}

function closeIssueModal() {
    document.getElementById('issueModal').style.display = 'none';
}

async function saveIssue(e) {
    e.preventDefault();
    
    const issue = {
        request_id: document.getElementById('issueRequestId').value,
        blood_id: document.getElementById('issueBloodId').value,
        issue_date: document.getElementById('issueDate').value,
        quantity_ml: document.getElementById('issueQuantity').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issue)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Blood issued successfully! (Transaction completed)');
        closeIssueModal();
        loadIssues();
        loadInventory();
        loadRequests();
    } catch (error) {
        console.error('Save Issue Error:', error);
        alert('Failed to issue blood');
    }
}

// ============================================
// BILLING
// ============================================
async function loadBilling() {
    try {
        const response = await fetch(`${API_BASE}/billing`);
        const bills = await response.json();
        
        const table = document.getElementById('billingTable').querySelector('tbody');
        table.innerHTML = '';
        
        bills.forEach(bill => {
            const row = `<tr>
                <td>${bill.bill_id}</td>
                <td>${bill.issue_id}</td>
                <td>${bill.recipient_name}</td>
                <td>₹${bill.amount}</td>
                <td>${bill.payment_method}</td>
                <td>${bill.payment_status}</td>
                <td>${bill.bill_date}</td>
                <td>
                    <button class="btn btn-success" onclick="updatePaymentStatus(${bill.bill_id}, 'Paid')">Mark Paid</button>
                </td>
            </tr>`;
            table.innerHTML += row;
        });
        
        if (bills.length === 0) {
            table.innerHTML = '<tr><td colspan="8" class="text-center">No bills found</td></tr>';
        }
    } catch (error) {
        console.error('Billing List Error:', error);
    }
}

function openBillingModal() {
    document.getElementById('billingForm').reset();
    loadIssueDropdown('billingIssueId');
    document.getElementById('billingModal').style.display = 'block';
}

function closeBillingModal() {
    document.getElementById('billingModal').style.display = 'none';
}

async function saveBilling(e) {
    e.preventDefault();
    
    const bill = {
        issue_id: document.getElementById('billingIssueId').value,
        bill_date: document.getElementById('billingDate').value,
        amount: document.getElementById('billingAmount').value,
        payment_method: document.getElementById('billingPaymentMethod').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/billing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bill)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
            return;
        }
        
        alert('Bill created successfully!');
        closeBillingModal();
        loadBilling();
    } catch (error) {
        console.error('Save Billing Error:', error);
        alert('Failed to create bill');
    }
}

async function updatePaymentStatus(billId, status) {
    try {
        const response = await fetch(`${API_BASE}/billing/${billId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_status: status })
        });
        
        const result = await response.json();
        alert(result.message);
        loadBilling();
    } catch (error) {
        console.error('Update Payment Error:', error);
    }
}

// ============================================
// REPORTS
// ============================================
async function loadReports() {
    try {
        // Blood stock report
        const bloodStockRes = await fetch(`${API_BASE}/reports/blood-stock`);
        const bloodStock = await bloodStockRes.json();
        let html = '';
        bloodStock.forEach(item => {
            html += `<tr><td>${item.blood_group}</td><td>${item.component_type}</td><td>${item.units}</td><td>${item.total_quantity}</td></tr>`;
        });
        document.getElementById('bloodStockReport').querySelector('tbody').innerHTML = html || '<tr><td colspan="4">No data</td></tr>';
        
        // Donor history report
        const donorHistRes = await fetch(`${API_BASE}/reports/donor-history`);
        const donorHist = await donorHistRes.json();
        html = '';
        donorHist.slice(0, 10).forEach(item => {
            html += `<tr><td>${item.donor_name}</td><td>${item.blood_group}</td><td>${item.total_donations}</td><td>${item.total_ml}</td></tr>`;
        });
        document.getElementById('donorHistoryReport').querySelector('tbody').innerHTML = html || '<tr><td colspan="4">No data</td></tr>';
        
        // Emergency requests report
        const emergencyRes = await fetch(`${API_BASE}/reports/emergency-requests`);
        const emergency = await emergencyRes.json();
        html = '';
        emergency.slice(0, 10).forEach(item => {
            html += `<tr><td>${item.recipient_name || 'Unknown'}</td><td>${item.blood_group}</td><td>${item.units_required}</td><td>${item.priority}</td></tr>`;
        });
        document.getElementById('emergencyRequestsReport').querySelector('tbody').innerHTML = html || '<tr><td colspan="4">No data</td></tr>';
        
        // Camp statistics report
        const campStatsRes = await fetch(`${API_BASE}/reports/camp-statistics`);
        const campStats = await campStatsRes.json();
        html = '';
        campStats.forEach(item => {
            html += `<tr><td>${item.camp_name}</td><td>${item.location}</td><td>${item.donations_collected}</td><td>${item.total_quantity}</td></tr>`;
        });
        document.getElementById('campStatsReport').querySelector('tbody').innerHTML = html || '<tr><td colspan="4">No data</td></tr>';
        
        // Hospital recipients report
        const hospRecipRes = await fetch(`${API_BASE}/reports/hospital-recipients`);
        const hospRecip = await hospRecipRes.json();
        html = '';
        hospRecip.forEach(item => {
            html += `<tr><td>${item.hospital_name}</td><td>${item.city}</td><td>${item.total_recipients}</td></tr>`;
        });
        document.getElementById('hospitalRecipientsReport').querySelector('tbody').innerHTML = html || '<tr><td colspan="3">No data</td></tr>';
        
        // Billing summary report
        const billingSummaryRes = await fetch(`${API_BASE}/reports/billing-summary`);
        const billingSummary = await billingSummaryRes.json();
        const billingSummaryDiv = document.getElementById('billingSummaryReport');
        billingSummaryDiv.innerHTML = `
            <p><strong>Total Bills:</strong> ${billingSummary.total_bills}</p>
            <p><strong>Total Amount:</strong> ₹${billingSummary.total_amount || 0}</p>
            <p><strong>Paid:</strong> ₹${billingSummary.paid_amount || 0} (${billingSummary.paid_count} bills)</p>
            <p><strong>Pending:</strong> ₹${billingSummary.pending_amount || 0} (${billingSummary.pending_count} bills)</p>
        `;
    } catch (error) {
        console.error('Reports Error:', error);
    }
}

// ============================================
// DROPDOWN LOADERS
// ============================================
async function loadDonorDropdown(elementId) {
    try {
        const response = await fetch(`${API_BASE}/donors`);
        const donors = await response.json();
        
        let html = '<option value="">Select Donor</option>';
        donors.forEach(donor => {
            html += `<option value="${donor.donor_id}">${donor.donor_name} (${donor.blood_group})</option>`;
        });
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Donor Dropdown Error:', error);
    }
}

async function loadCampDropdown(elementId) {
    try {
        const response = await fetch(`${API_BASE}/camps`);
        const camps = await response.json();
        
        let html = '<option value="">Select Camp (Optional)</option>';
        camps.forEach(camp => {
            html += `<option value="${camp.camp_id}">${camp.camp_name}</option>`;
        });
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Camp Dropdown Error:', error);
    }
}

async function loadDonationDropdown(elementId) {
    try {
        const response = await fetch(`${API_BASE}/donations`);
        const donations = await response.json();
        
        let html = '<option value="">Select Donation</option>';
        donations.forEach(donation => {
            html += `<option value="${donation.donation_id}">${donation.donation_id} - ${donation.donor_name}</option>`;
        });
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Donation Dropdown Error:', error);
    }
}

async function loadHospitalDropdown(elementId) {
    try {
        const response = await fetch(`${API_BASE}/hospitals`);
        const hospitals = await response.json();
        
        let html = '<option value="">Select Hospital</option>';
        hospitals.forEach(hospital => {
            html += `<option value="${hospital.hospital_id}">${hospital.hospital_name}</option>`;
        });
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Hospital Dropdown Error:', error);
    }
}

async function loadRecipientDropdown(elementId) {
    try {
        const response = await fetch(`${API_BASE}/recipients`);
        const recipients = await response.json();
        
        let html = '<option value="">Select Recipient</option>';
        recipients.forEach(recipient => {
            html += `<option value="${recipient.recipient_id}">${recipient.recipient_name} (${recipient.blood_group})</option>`;
        });
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Recipient Dropdown Error:', error);
    }
}

async function loadRequestDropdown(elementId) {
    try {
        const response = await fetch(`${API_BASE}/requests`);
        const requests = await response.json();
        
        let html = '<option value="">Select Request</option>';
        requests.filter(req => req.status === 'Approved').forEach(request => {
            html += `<option value="${request.request_id}">Req#${request.request_id} - ${request.recipient_name} (${request.blood_group})</option>`;
        });
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Request Dropdown Error:', error);
    }
}

async function loadBloodInventoryDropdown(elementId) {
    try {
        const response = await fetch(`${API_BASE}/inventory/available`);
        const inventory = await response.json();
        
        let html = '<option value="">Select Blood Unit</option>';
        inventory.forEach(item => {
            html += `<option value="${item.blood_id}">${item.blood_group} (${item.component_type}) - ${item.quantity_ml}ml</option>`;
        });
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Blood Inventory Dropdown Error:', error);
    }
}

async function loadIssueDropdown(elementId) {
    try {
        const response = await fetch(`${API_BASE}/issues`);
        const issues = await response.json();
        
        let html = '<option value="">Select Blood Issue</option>';
        issues.forEach(issue => {
            html += `<option value="${issue.issue_id}">Issue#${issue.issue_id}</option>`;
        });
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Issue Dropdown Error:', error);
    }
}

// ============================================
// MODAL CLOSE ON OUTSIDE CLICK
// ============================================
window.onclick = function(event) {
    const modals = ['donorModal', 'donationModal', 'campModal', 'screeningModal', 
                    'hospitalModal', 'recipientModal', 'requestModal', 'issueModal', 'billingModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};
