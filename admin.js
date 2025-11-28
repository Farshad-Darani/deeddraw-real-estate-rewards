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
async function initializeAdminPanel() {
    console.log('📊 Initializing admin panel...');
    if (!await checkAdminAuth()) return;
    
    initializeEventListeners();
    
    // Update notification badges
    updateNotificationBadges();
    
    // Refresh badges every 30 seconds
    setInterval(updateNotificationBadges, 30000);
    
    // Load dashboard by default (this will trigger data loading)
    console.log('📊 Initial load - calling showSection(dashboard)');
    await showSection('dashboard');
}

// Update notification badges for pending items
async function updateNotificationBadges() {
    try {
        const authToken = getAuthToken();
        if (!authToken) return;
        
        // Get pending transactions count
        const txResponse = await fetch(`${API_URL}/admin/transactions?status=pending`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (txResponse.ok) {
            const txData = await txResponse.json();
            const pendingTxCount = txData.data?.transactions?.length || 0;
            updateBadge('transactions-badge', pendingTxCount);
        }
        
        // Get pending withdrawals count
        const wdResponse = await fetch(`${API_URL}/admin/withdrawals?status=pending`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (wdResponse.ok) {
            const wdData = await wdResponse.json();
            // Backend returns array directly in data field
            const pendingWdCount = Array.isArray(wdData.data) ? wdData.data.length : 0;
            updateBadge('withdrawals-badge', pendingWdCount);
        }
    } catch (error) {
        console.error('Error updating badges:', error);
    }
}

// Update individual badge
function updateBadge(badgeId, count) {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Check if DOM is already loaded (since script is dynamically added)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminPanel);
} else {
    // DOM is already loaded, run immediately
    console.log('📊 DOM already loaded, initializing immediately');
    initializeAdminPanel();
}

// Navigation
async function showSection(sectionName) {
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
        'transactions': 'Transactions',
        'withdrawals': 'Withdrawals'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || sectionName;
    
    currentSection = sectionName;
    
    // Load section-specific data
    console.log('📊 Loading data for section:', sectionName);
    if (sectionName === 'dashboard') {
        console.log('📊 Calling loadDashboardStats()');
        await loadDashboardStats();
    } else if (sectionName === 'participants') {
        await loadParticipants();
    } else if (sectionName === 'transactions') {
        await loadTransactions();
    } else if (sectionName === 'withdrawals') {
        await loadWithdrawals();
    }
}

// Load Dashboard Statistics
async function loadDashboardStats() {
    console.log('📊 loadDashboardStats called!');
    try {
        console.log('📊 Fetching from:', `${API_URL}/admin/dashboard`);
        console.log('📊 Auth token:', getAuthToken() ? 'Present' : 'Missing');
        
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        console.log('📊 Response status:', response.status);
        const data = await response.json();
        console.log('📊 Response data:', data);
        
        if (data.success) {
            const stats = data.data;
            console.log('📊 Stats received:', stats);
            
            // Update stat cards
            const participantsEl = document.getElementById('total-participants');
            const pointsEl = document.getElementById('total-points');
            const revenueEl = document.getElementById('total-revenue');
            const pendingEl = document.getElementById('pending-count');
            
            console.log('📊 Elements found:', {
                participants: !!participantsEl,
                points: !!pointsEl,
                revenue: !!revenueEl,
                pending: !!pendingEl
            });
            
            if (participantsEl) participantsEl.textContent = stats.totalParticipants;
            if (pointsEl) pointsEl.textContent = stats.totalPoints;
            if (revenueEl) revenueEl.textContent = formatCurrency(stats.totalRevenue);
            if (pendingEl) pendingEl.textContent = stats.pendingTransactions;
            
            console.log('📊 Updated values:', {
                participants: participantsEl?.textContent,
                points: pointsEl?.textContent,
                revenue: revenueEl?.textContent,
                pending: pendingEl?.textContent
            });
            
            // Update recent activity
            loadRecentActivity(stats.recentActivity);
            
            console.log('✅ Dashboard stats loaded successfully');
        } else {
            console.error('❌ API returned success: false', data);
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
    
    activityList.innerHTML = activities.map(activity => {
        if (activity.type === 'withdrawal') {
            // Withdrawal activity
            const statusIcons = {
                'pending': 'fa-clock',
                'approved': 'fa-check-circle',
                'rejected': 'fa-times-circle'
            };
            const icon = statusIcons[activity.status] || 'fa-money-bill-wave';
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p><strong>${activity.participantName}</strong> requested withdrawal of ${formatCurrency(activity.amount)}</p>
                        <small>Status: <span class="status-${activity.status}">${activity.status}</span> | ${new Date(activity.date).toLocaleString()}</small>
                    </div>
                </div>
            `;
        } else {
            // Transaction activity
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="activity-content">
                        <p><strong>${activity.participantName}</strong> registered ${activity.points} points for ${formatCurrency(activity.amount)}</p>
                        <small>Certificate: ${activity.certificateNumber} | Status: <span class="status-${activity.status}">${activity.status}</span> | ${new Date(activity.date).toLocaleString()}</small>
                    </div>
                </div>
            `;
        }
    }).join('');
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
            updateNotificationBadges(); // Update badges
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
            updateNotificationBadges(); // Update badges
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

async function exportData() {
    try {
        console.log('🔄 Starting export...');
        console.log('API_URL:', API_URL);
        console.log('Auth token:', authToken ? 'Present' : 'Missing');
        
        const response = await fetch(`${API_URL}/admin/export-participants`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`Failed to fetch export data: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Export data received:', data);
        
        if (!data.success || !data.participants) {
            throw new Error('Invalid export data');
        }

        console.log(`✅ Exporting ${data.participants.length} participants...`);

        // Create CSV content
        const headers = ['Name', 'Email', 'Phone', 'Points', 'Province', 'City', 'Referral Code', 'Certificate Numbers', 'Registered Date'];
        const csvRows = [headers.join(',')];

        data.participants.forEach(p => {
            const row = [
                `"${p.name || ''}"`,
                `"${p.email || ''}"`,
                `"${p.phone || ''}"`,
                p.points || 0,
                `"${p.province || ''}"`,
                `"${p.city || ''}"`,
                `"${p.referralCode || ''}"`,
                `"${p.certificateNumbers || ''}"`,
                `"${p.registeredDate || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        console.log('📄 CSV content created, length:', csvContent.length);
        
        // Create download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `deeddraw_participants_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        console.log('🖱️ Triggering download...');
        link.click();
        document.body.removeChild(link);
        
        alert(`✅ Exported ${data.participants.length} participants successfully!`);
    } catch (error) {
        console.error('❌ Export error:', error);
        alert('❌ Failed to export data. Please check the console for details.');
    }
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
        'mortgage-broker': 'Mortgage Broker'
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
    console.log('🎯 Initializing event listeners...');
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close');
    console.log('🎯 Found', closeButtons.length, 'close buttons');
    
    closeButtons.forEach((closeBtn, index) => {
        console.log('🎯 Attaching listener to close button', index);
        closeBtn.addEventListener('click', function() {
            console.log('🎯 Close button clicked!');
            const modal = this.closest('.modal');
            console.log('🎯 Closing modal:', modal.id);
            modal.style.display = 'none';
        });
    });
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            console.log('🎯 Clicked outside modal, closing:', e.target.id);
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

// ============= WITHDRAWAL MANAGEMENT =============

// Load Withdrawals
async function loadWithdrawals() {
    try {
        const statusFilter = document.getElementById('withdrawal-status')?.value || '';
        
        const queryParams = new URLSearchParams();
        if (statusFilter) {
            queryParams.append('status', statusFilter);
        }
        
        const response = await fetch(`${API_URL}/admin/withdrawals?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayWithdrawals(data.data);
            console.log(`✅ Loaded ${data.data.length} withdrawal requests`);
        } else {
            showMessage('Failed to load withdrawal requests', 'error');
        }
    } catch (error) {
        console.error('Error loading withdrawals:', error);
        showMessage('Unable to load withdrawal requests', 'error');
    }
}

// Display Withdrawals
function displayWithdrawals(withdrawals) {
    const tbody = document.querySelector('#withdrawals-table tbody');
    
    if (withdrawals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No withdrawal requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = withdrawals.map(w => {
        const statusClass = w.status === 'approved' ? 'verified' : w.status;
        const statusIcon = w.status === 'pending' ? 'clock' : w.status === 'approved' ? 'check-circle' : 'times-circle';
        
        return `
            <tr>
                <td>
                    <strong>${w.user.name}</strong><br>
                    <small style="color: #666;">${w.user.email}</small><br>
                    <small style="color: #c8a15a; font-weight: 600;">Code: ${w.user.referralCode}</small>
                </td>
                <td><strong style="color: #c8a15a;">$${parseFloat(w.amount).toFixed(2)}</strong></td>
                <td>
                    ${w.email}<br>
                    <small style="color: #28a745; font-weight: 600;">
                        <i class="fas fa-question-circle"></i> Q: "What is your referral code?"<br>
                        <i class="fas fa-key"></i> A: "${w.user.referralCode}"
                    </small>
                </td>
                <td>
                    <span class="status-badge status-${statusClass}"><i class="fas fa-${statusIcon}"></i> ${w.status}</span>
                    ${w.adminNotes ? `<br><small style="color: #666; font-style: italic;"><i class="fas fa-sticky-note"></i> ${w.adminNotes}</small>` : ''}
                </td>
                <td>${new Date(w.createdAt).toLocaleString()}</td>
                <td>${w.processedAt ? new Date(w.processedAt).toLocaleString() : '-'}</td>
                <td>
                    ${w.status === 'pending' ? `
                        <button class="btn-small btn-success" onclick="approveWithdrawal('${w.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn-small btn-danger" onclick="rejectWithdrawal('${w.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : `
                        <span style="color: #999;">-</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

// Filter Withdrawals
function filterWithdrawals() {
    loadWithdrawals();
}

// Approve Withdrawal
async function approveWithdrawal(id) {
    const notes = prompt('Add notes (optional):');
    
    if (notes === null) return; // User cancelled
    
    if (!confirm('Are you sure you want to approve this withdrawal? Please ensure you have sent the e-transfer before approving.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/withdrawals/${id}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ notes })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Withdrawal approved successfully', 'success');
            loadWithdrawals();
            updateNotificationBadges(); // Update badges
        } else {
            showMessage(data.message || 'Failed to approve withdrawal', 'error');
        }
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        showMessage('Unable to approve withdrawal', 'error');
    }
}

// Reject Withdrawal
async function rejectWithdrawal(id) {
    const notes = prompt('Reason for rejection:');
    
    if (!notes || notes.trim() === '') {
        alert('Please provide a reason for rejection');
        return;
    }
    
    if (!confirm('Are you sure you want to reject this withdrawal?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/withdrawals/${id}/reject`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ notes })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Withdrawal rejected', 'success');
            loadWithdrawals();
            updateNotificationBadges(); // Update badges
        } else {
            showMessage(data.message || 'Failed to reject withdrawal', 'error');
        }
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        showMessage('Unable to reject withdrawal', 'error');
    }
}
