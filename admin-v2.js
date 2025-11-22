// Simplified Admin Dashboard JavaScript - Backend Integrated
console.log('🚀 Admin.js loaded! Version 2.0 with referral discount support');

const API_URL = 'https://www.deeddraw.com/api';
let currentSection = 'dashboard';
let authToken = null;

// Get auth token
function getAuthToken() {
    if (!authToken) {
        authToken = localStorage.getItem('authToken');
    }
    return authToken;
}

// Authentication check
async function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        window.location.href = 'login.html';
        return false;
    }
    
    const user = JSON.parse(userData);
    if (!user.isAdmin) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'dashboard.html';
        return false;
    }
    
    // Update admin user display
    document.querySelector('.admin-user span').textContent = `${user.firstName} ${user.lastName}`;
    
    return true;
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', async function() {
    if (!await checkAdminAuth()) return;
    
    await loadDashboardStats();
    initializeEventListeners();
});

// Navigation
function showSection(sectionName) {
    console.log('🔍 showSection called with:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
        console.log('  Hiding section:', section.id);
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    console.log('  Target section:', targetSection);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('  ✅ Activated section:', sectionName + '-section');
    } else {
        console.error('  ❌ Section not found:', sectionName + '-section');
    }
    
    // Update navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNav = document.querySelector(`[onclick*="showSection('${sectionName}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'participants': 'Participants',
        'transactions': 'Transactions'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || sectionName;
    
    currentSection = sectionName;
    
    // Load section-specific data
    if (sectionName === 'participants') {
        loadParticipants();
    } else if (sectionName === 'transactions') {
        loadTransactions();
    }
}

// Load Dashboard Statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            
            // Update stat cards
            document.getElementById('total-participants').textContent = stats.totalParticipants;
            document.getElementById('total-points').textContent = stats.totalPoints;
            document.getElementById('total-revenue').textContent = formatCurrency(stats.totalRevenue);
            document.getElementById('pending-count').textContent = stats.pendingTransactions;
            
            // Update recent activity
            loadRecentActivity(stats.recentActivity);
            
            console.log('✅ Dashboard stats loaded:', stats);
        } else {
            showMessage('Failed to load dashboard statistics', 'error');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showMessage('Unable to connect to server', 'error');
    }
}

// Load Recent Activity
function loadRecentActivity(activities) {
    const activityList = document.getElementById('recent-activity-list');
    
    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-credit-card"></i>
            </div>
            <div class="activity-content">
                <p><strong>${activity.participantName}</strong> registered ${activity.points} points for ${formatCurrency(activity.amount)}</p>
                <small>Certificate: ${activity.certificateNumber} | Status: <span class="status-${activity.status}">${activity.status}</span> | ${new Date(activity.date).toLocaleString()}</small>
            </div>
        </div>
    `).join('');
}

// Load Participants
async function loadParticipants() {
    try {
        const searchTerm = document.getElementById('participant-search')?.value || '';
        const category = document.getElementById('category-filter')?.value || '';
        
        const queryParams = new URLSearchParams({
            page: 1,
            limit: 100,
            search: searchTerm,
            category: category
        });
        
        const response = await fetch(`${API_URL}/admin/users?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayParticipants(data.data.users);
            console.log(`✅ Loaded ${data.data.users.length} participants`);
        } else {
            showMessage('Failed to load participants', 'error');
        }
    } catch (error) {
        console.error('Error loading participants:', error);
        showMessage('Unable to load participants', 'error');
    }
}

function displayParticipants(participants) {
    const tbody = document.querySelector('#participants-table tbody');
    
    if (!participants || participants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No participants found</td></tr>';
        return;
    }
    
    tbody.innerHTML = participants.map(p => `
        <tr>
            <td>${p.id.substring(0, 8)}...</td>
            <td>${p.firstName} ${p.lastName}</td>
            <td>${p.email}</td>
            <td>${getCategoryDisplayName(p.category)}</td>
            <td><strong>${p.totalPoints}</strong></td>
            <td>${formatCurrency(p.totalPaid)}</td>
            <td>${new Date(p.createdAt).toLocaleDateString()}</td>
            <td><span class="status ${p.isVerified ? 'verified' : 'pending'}">${p.isVerified ? 'Verified' : 'Pending'}</span></td>
            <td>
                <button class="btn-small btn-primary" onclick='viewParticipant(${JSON.stringify(p)})'>View</button>
            </td>
        </tr>
    `).join('');
}

// Load Transactions
async function loadTransactions(status = '') {
    try {
        const statusFilter = document.getElementById('transaction-status')?.value || status;
        
        const queryParams = new URLSearchParams({
            page: 1,
            limit: 100,
            status: statusFilter
        });
        
        const response = await fetch(`${API_URL}/admin/transactions?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayTransactions(data.data.transactions);
            console.log(`✅ Loaded ${data.data.transactions.length} transactions`);
        } else {
            showMessage('Failed to load transactions', 'error');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showMessage('Unable to load transactions', 'error');
    }
}

function displayTransactions(transactions) {
    const tbody = document.querySelector('#transactions-table tbody');
    
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No transactions found</td></tr>';
        return;
    }
    
    console.log('Transactions data:', transactions); // Debug log
    
    tbody.innerHTML = transactions.map(t => {
        // Calculate base amount if referral discount exists
        console.log(`Transaction ${t.certificateNumber}:`, {
            amount: t.amount,
            referralDiscount: t.referralDiscount,
            referralCodeUsed: t.referralCodeUsed
        }); // Debug log
        
        const hasDiscount = t.referralDiscount && parseFloat(t.referralDiscount) > 0;
        const baseAmount = hasDiscount ? parseFloat(t.amount) + parseFloat(t.referralDiscount) : parseFloat(t.amount);
        
        return `
        <tr>
            <td><strong>${t.certificateNumber}</strong></td>
            <td>${t.user.name}<br><small>${t.user.email}</small></td>
            <td><strong>${t.points}</strong></td>
            <td>
                ${hasDiscount ? `
                    <div style="font-size: 0.85rem; color: #64748b; text-decoration: line-through;">
                        ${formatCurrency(baseAmount)}
                    </div>
                    <div style="font-weight: 600; color: #f59e0b;">
                        ${formatCurrency(t.amount)}
                    </div>
                    <div style="font-size: 0.75rem; color: #10b981;">
                        -${formatCurrency(t.referralDiscount)} discount
                    </div>
                ` : `
                    <div style="font-weight: 600;">
                        ${formatCurrency(t.amount)}
                    </div>
                `}
            </td>
            <td>E-Transfer<br><small>${t.etransferEmail}</small></td>
            <td><span class="status-badge status-${t.status}">${t.status.toUpperCase()}</span></td>
            <td>${new Date(t.createdAt).toLocaleDateString()}</td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                    <button class="btn-small btn-primary" onclick="viewTransaction('${t.id}')">View</button>
                    ${t.status === 'pending' ? `
                        <div style="display: flex; gap: 4px;">
                            <button class="btn-small btn-success" onclick="approveTransaction('${t.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-small btn-danger" onclick="rejectTransaction('${t.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    ` : ''}
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// View Transaction Details
async function viewTransaction(transactionId) {
    try {
        const response = await fetch(`${API_URL}/admin/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const t = data.data.transaction;
            const detailsHtml = `
                <div class="transaction-details">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Certificate Number:</label>
                            <span><strong>${t.certificateNumber}</strong></span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge status-${t.status}">${t.status.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Participant:</label>
                            <span>${t.user.firstName} ${t.user.lastName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${t.user.email}</span>
                        </div>
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>${t.user.phone || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Category:</label>
                            <span>${getCategoryDisplayName(t.user.category)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Location:</label>
                            <span>${t.user.city || 'N/A'}, ${t.user.province || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Transaction Amount:</label>
                            <span><strong>${formatCurrency(t.transactionAmount)}</strong></span>
                        </div>
                        <div class="detail-item">
                            <label>Points:</label>
                            <span><strong>${t.points}</strong></span>
                        </div>
                        ${t.referralDiscount && parseFloat(t.referralDiscount) > 0 ? `
                        <div class="detail-item" style="grid-column: 1 / -1; background: rgba(245, 158, 11, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <h3 style="margin: 0 0 0.75rem 0; color: #d97706; font-size: 1rem;">
                                <i class="fas fa-tag" style="margin-right: 0.5rem;"></i>
                                Pricing Breakdown
                            </h3>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                                <div>
                                    <label style="font-size: 0.85rem; color: #64748b;">Base Amount:</label>
                                    <div style="font-weight: 500; text-decoration: line-through;">${formatCurrency(parseFloat(t.amount) + parseFloat(t.referralDiscount))}</div>
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #64748b;">Referral Discount:</label>
                                    <div style="font-weight: 600; color: #10b981;">-${formatCurrency(t.referralDiscount)}</div>
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #64748b;">Final Amount:</label>
                                    <div style="font-weight: 700; color: #d97706; font-size: 1.2rem;">${formatCurrency(t.amount)}</div>
                                </div>
                            </div>
                        </div>
                        ` : `
                        <div class="detail-item">
                            <label>Registration Fee:</label>
                            <span><strong>${formatCurrency(t.amount)}</strong></span>
                        </div>
                        `}
                        <div class="detail-item" style="grid-column: 1 / -1; background: rgba(100, 116, 139, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <h3 style="margin: 0 0 0.75rem 0; color: #2c3e50; font-size: 1rem;">
                                <i class="fas fa-paper-plane" style="margin-right: 0.5rem;"></i>
                                E-Transfer Payment Details
                            </h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                                <div>
                                    <label style="font-size: 0.85rem; color: #64748b;">Email:</label>
                                    <div style="font-weight: 500;">${t.eTransferEmail || 'Not provided'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #64748b;">Reference/Confirmation:</label>
                                    <div style="font-weight: 500; color: ${t.eTransferReference === 'PENDING' ? '#f59e0b' : '#2c3e50'};">
                                        ${t.eTransferReference || 'Not provided'}
                                        ${t.eTransferReference === 'PENDING' ? '<span style="font-size: 0.8rem; color: #f59e0b;"> (Awaiting payment)</span>' : ''}
                                    </div>
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #64748b;">Transfer Date:</label>
                                    <div style="font-weight: 500;">${t.eTransferDate ? new Date(t.eTransferDate).toLocaleDateString() : 'Not provided'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #64748b;">Expected Amount:</label>
                                    <div style="font-weight: 700; color: #f59e0b; font-size: 1.1rem;">${formatCurrency(t.amount)}</div>
                                    ${t.referralDiscount && parseFloat(t.referralDiscount) > 0 ? `
                                        <div style="font-size: 0.75rem; color: #10b981; margin-top: 0.25rem;">
                                            (Includes ${formatCurrency(t.referralDiscount)} referral discount)
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label>Referral Code Used:</label>
                            <span>${t.referralCodeUsed || 'None'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Created:</label>
                            <span>${new Date(t.createdAt).toLocaleString()}</span>
                        </div>
                        ${t.notes ? `
                        <div class="detail-item" style="grid-column: 1 / -1;">
                            <label>Notes:</label>
                            <span>${t.notes}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${t.status === 'pending' ? `
                    <div class="modal-actions" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                        <button class="btn btn-success" onclick="approveTransaction('${t.id}'); closeModal('transaction-modal');">
                            <i class="fas fa-check"></i> Approve Transaction
                        </button>
                        <button class="btn btn-danger" onclick="rejectTransaction('${t.id}'); closeModal('transaction-modal');">
                            <i class="fas fa-times"></i> Reject Transaction
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
            
            document.getElementById('transaction-details').innerHTML = detailsHtml;
            document.getElementById('transaction-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading transaction details:', error);
        showMessage('Unable to load transaction details', 'error');
    }
}

// Approve Transaction
async function approveTransaction(transactionId) {
    if (!confirm('Are you sure you want to approve this transaction?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/transactions/${transactionId}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notes: 'Approved by admin'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Transaction approved successfully!', 'success');
            await loadTransactions();
            await loadDashboardStats();
        } else {
            showMessage(data.message || 'Failed to approve transaction', 'error');
        }
    } catch (error) {
        console.error('Error approving transaction:', error);
        showMessage('Unable to approve transaction', 'error');
    }
}

// Reject Transaction
async function rejectTransaction(transactionId) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/transactions/${transactionId}/reject`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reason: reason
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Transaction rejected', 'success');
            await loadTransactions();
            await loadDashboardStats();
        } else {
            showMessage(data.message || 'Failed to reject transaction', 'error');
        }
    } catch (error) {
        console.error('Error rejecting transaction:', error);
        showMessage('Unable to reject transaction', 'error');
    }
}

// View Participant Details
function viewParticipant(participant) {
    const detailsHtml = `
        <div class="participant-details">
            <h3>${participant.firstName} ${participant.lastName}</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${participant.email}</span>
                </div>
                <div class="detail-item">
                    <label>Phone:</label>
                    <span>${participant.phone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Category:</label>
                    <span>${getCategoryDisplayName(participant.category)}</span>
                </div>
                <div class="detail-item">
                    <label>Location:</label>
                    <span>${participant.city || 'N/A'}, ${participant.province || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Total Points:</label>
                    <span><strong>${participant.totalPoints}</strong></span>
                </div>
                <div class="detail-item">
                    <label>Total Paid:</label>
                    <span><strong>${formatCurrency(participant.totalPaid)}</strong></span>
                </div>
                <div class="detail-item">
                    <label>Total Transactions:</label>
                    <span>${participant.transactionCount}</span>
                </div>
                <div class="detail-item">
                    <label>Registration Date:</label>
                    <span>${new Date(participant.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status ${participant.isVerified ? 'verified' : 'pending'}">${participant.isVerified ? 'Verified' : 'Pending'}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('participant-details').innerHTML = detailsHtml;
    document.getElementById('participant-modal').style.display = 'block';
}

// Search and Filter Functions
function searchParticipants() {
    loadParticipants();
}

function filterTransactions() {
    loadTransactions();
}

// Utility Functions
async function refreshData() {
    showMessage('Refreshing data...', 'info');
    
    if (currentSection === 'dashboard') {
        await loadDashboardStats();
    } else if (currentSection === 'participants') {
        await loadParticipants();
    } else if (currentSection === 'transactions') {
        await loadTransactions();
    }
    
    showMessage('Data refreshed successfully', 'success');
}

function exportData() {
    alert('Export functionality coming soon!');
}

function goToHomepage() {
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function getCategoryDisplayName(category) {
    const categoryMap = {
        'agent-broker': 'Agent/Broker',
        'developer': 'Developer',
        'sales-marketing': 'Sales & Marketing',
        'mortgage-broker': 'Mortgage Broker',
        'individual': 'Individual'
    };
    return categoryMap[category] || category;
}

function showMessage(text, type = 'success') {
    const existingMessage = document.querySelector('.admin-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `admin-message ${type}`;
    messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${text}`;
    
    const adminMain = document.querySelector('.admin-main');
    adminMain.insertBefore(messageDiv, adminMain.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event Listeners
function initializeEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Search on enter key
    const participantSearch = document.getElementById('participant-search');
    if (participantSearch) {
        participantSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchParticipants();
            }
        });
    }
}
