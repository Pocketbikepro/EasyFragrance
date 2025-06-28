// Global variables
let currentPage = 'home';
let userGender = null;
let currentTheme = 'neutral';
let fragranceLibrary = [];
let wishlist = [];
let recentlyAddedFragrances = [];
let weeklyPlanner = {};
let currentQuestionIndex = 0;
let questionnaireAnswers = {};

// Questionnaire questions
const questionnaireQuestions = [
    {
        id: 'occasion',
        title: 'What\'s the occasion?',
        subtitle: 'Help us understand when you\'ll be wearing this fragrance',
        options: [
            {
                value: 'daily',
                label: 'Daily Wear',
                description: 'For work, errands, and everyday activities'
            },
            {
                value: 'evening',
                label: 'Evening Out',
                description: 'For dates, parties, and social events'
            },
            {
                value: 'special',
                label: 'Special Occasions',
                description: 'For weddings, celebrations, and important events'
            },
            {
                value: 'casual',
                label: 'Casual Hangouts',
                description: 'For relaxed time with friends and family'
            }
        ]
    },
    {
        id: 'season',
        title: 'What season is it?',
        subtitle: 'Different seasons call for different fragrance profiles',
        options: [
            {
                value: 'spring',
                label: 'Spring',
                description: 'Fresh florals and light, airy scents'
            },
            {
                value: 'summer',
                label: 'Summer',
                description: 'Citrus, aquatic, and cooling fragrances'
            },
            {
                value: 'autumn',
                label: 'Autumn',
                description: 'Warm spices, woods, and cozy notes'
            },
            {
                value: 'winter',
                label: 'Winter',
                description: 'Rich, deep, and warming fragrances'
            }
        ]
    },
    {
        id: 'mood',
        title: 'What\'s your mood?',
        subtitle: 'Your emotional state can influence your fragrance choice',
        options: [
            {
                value: 'energetic',
                label: 'Energetic & Confident',
                description: 'Bold, invigorating scents that boost your energy'
            },
            {
                value: 'romantic',
                label: 'Romantic & Sensual',
                description: 'Intimate, seductive fragrances with depth'
            },
            {
                value: 'relaxed',
                label: 'Relaxed & Calm',
                description: 'Soothing, peaceful scents for tranquility'
            },
            {
                value: 'adventurous',
                label: 'Adventurous & Bold',
                description: 'Unique, daring fragrances that make a statement'
            }
        ]
    },
    {
        id: 'preference',
        title: 'What scent family do you prefer?',
        subtitle: 'Choose the type of fragrance that appeals to you most',
        options: [
            {
                value: 'floral',
                label: 'Floral',
                description: 'Rose, jasmine, lavender, and other flower notes'
            },
            {
                value: 'woody',
                label: 'Woody',
                description: 'Sandalwood, cedar, oakmoss, and earthy notes'
            },
            {
                value: 'fresh',
                label: 'Fresh & Clean',
                description: 'Citrus, aquatic, and crisp, clean scents'
            },
            {
                value: 'oriental',
                label: 'Oriental & Spicy',
                description: 'Vanilla, amber, spices, and warm notes'
            }
        ]
    },
    {
        id: 'intensity',
        title: 'How strong do you like your fragrances?',
        subtitle: 'This affects the concentration and longevity',
        options: [
            {
                value: 'light',
                label: 'Light & Subtle',
                description: 'Soft, barely-there scents that are gentle'
            },
            {
                value: 'moderate',
                label: 'Moderate',
                description: 'Balanced fragrances that are noticeable but not overwhelming'
            },
            {
                value: 'strong',
                label: 'Strong & Bold',
                description: 'Powerful fragrances that make a lasting impression'
            },
            {
                value: 'versatile',
                label: 'Versatile',
                description: 'Adaptable scents that work in different situations'
            }
        ]
    }
];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupNavigation();
    setupGenderModal();
    loadColorTheme();
});

function initializeApp() {
    // Load saved data
    loadFragrances();
    loadWishlist();
    loadRecentlyAddedFragrances();
    loadWeeklyPlanner();
    
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    if (!hasCompletedOnboarding) {
        // First time user - show splash screen
        showSplashScreen();
    } else {
        // Returning user - skip splash screen and go directly to app
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
            splashScreen.classList.remove('fade-out');
        }
        
        // Load saved gender preference
        const savedGender = localStorage.getItem('userGender');
        if (savedGender) {
            userGender = savedGender;
            currentTheme = savedGender;
            applyTheme(savedGender);
        }
        
        // Initialize dashboard
        initializeDashboard();
        updateDashboardCounts();
        renderRecentlyAddedFragrances();
        
        // Set up alert button listeners after dashboard is initialized
        setupAlertButtonListeners();
        
        // Show current page
        const hash = window.location.hash.slice(1) || 'home';
        navigateToPage(hash, false);
    }
}

function showSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        splashScreen.style.display = 'flex';
        // Show begin button after delay
        setTimeout(() => {
            const beginButton = document.querySelector('.begin-button');
            if (beginButton) {
                beginButton.style.display = 'flex';
            }
        }, 2000);
    }
}

function hideSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        // Immediately hide the splash screen without animation
        splashScreen.style.display = 'none';
        splashScreen.classList.remove('fade-out');
    }
}

function beginApp() {
    // Hide splash screen
    hideSplashScreen();
    
    // Show gender modal after splash with mobile-friendly delay
    setTimeout(() => {
        showGenderModal();
    }, 300);
}

function setupNavigation() {
    // Handle navigation clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            navigateToPage(e.state.page, false);
        }
    });
}

function navigateToPage(page, updateHistory = true) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
    
    // Update current page
    currentPage = page;
    
    // Initialize specific features based on page
    if (page === 'library') {
        setTimeout(() => {
            initializeWeeklyPlanner();
            renderFragranceList();
        }, 100);
    } else if (page === 'home') {
        setTimeout(() => {
            updateDashboardCounts();
            renderRecentlyAddedFragrances();
            setupAlertButtonListeners();
        }, 100);
    } else if (page === 'wishlist') {
        setTimeout(() => {
            renderWishlist();
            populateWishlistSelect();
        }, 100);
    }
    
    // Update URL
    if (updateHistory) {
        window.history.pushState({ page }, '', `#${page}`);
    }
    
    // Close mobile menu
    const navToggle = document.querySelector('.nav-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    if (navToggle && navLinksContainer) {
        navToggle.classList.remove('active');
        navLinksContainer.classList.remove('active');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Event Listeners
function setupEventListeners() {
    // Fragrance input
    const fragranceInput = document.getElementById('fragranceInput');
    if (fragranceInput) {
        fragranceInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addFragrance();
            }
        });
    }
    
    // Wishlist select
    const wishlistSelect = document.getElementById('wishlistSelect');
    if (wishlistSelect) {
        wishlistSelect.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addToWishlist();
            }
        });
    }
    
    // Mobile-friendly begin button
    const beginButton = document.querySelector('.begin-button');
    if (beginButton) {
        // Remove any existing event listeners
        beginButton.replaceWith(beginButton.cloneNode(true));
        const newBeginButton = document.querySelector('.begin-button');
        
        // Add both click and touch events for mobile compatibility
        newBeginButton.addEventListener('click', function(e) {
            e.preventDefault();
            beginApp();
        });
        
        newBeginButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.95)';
        }, { passive: false });
        
        newBeginButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(1)';
            beginApp();
        }, { passive: false });
        
        // Ensure button is clickable
        newBeginButton.style.pointerEvents = 'auto';
        newBeginButton.style.cursor = 'pointer';
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        // Remove onclick attribute if it exists
        settingsBtn.removeAttribute('onclick');
        
        // Add click event listener
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleSettingsModal();
        });
        
        // Add touch event listeners for mobile
        settingsBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.95)';
        }, { passive: false });
        
        settingsBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(1)';
            toggleSettingsModal();
        }, { passive: false });
    }
    
    // Setup alert button listeners
    setupAlertButtonListeners();
}

// Fragrance Recommendation Functions
function getFragrance() {
    const scenario = document.getElementById('scenario').value.trim().toLowerCase();
    const resultDiv = document.getElementById('result');
    
    if (!scenario) {
        resultDiv.innerHTML = "<p>Please describe your day, mood, or event.</p>";
        resultDiv.classList.add('show');
        return;
    }

    // Show loading state with animation
    resultDiv.innerHTML = '<span class="loading"></span>Finding the perfect fragrance for you...';
    resultDiv.classList.add('show');
    
    // Simulate a brief loading time for better UX
    setTimeout(() => {
        let matchedScenario = null;
        
        // Ensure we have a valid gender selection
        if (!userGender) {
            resultDiv.innerHTML = "<p>Please select your gender preference first to get personalized recommendations.</p>";
            resultDiv.classList.add('show');
            return;
        }
        
        const genderRecommendations = fragranceRecommendations[userGender];
        
        // Check for keyword matches
        for (const [key, data] of Object.entries(genderRecommendations)) {
            if (scenario.includes(key)) {
                matchedScenario = data;
                break;
            }
        }
        
        // If no specific match, provide general recommendations
        if (!matchedScenario) {
            matchedScenario = {
                title: `Versatile Fragrance Options - ${userGender === 'male' ? 'Masculine' : userGender === 'female' ? 'Feminine' : 'Universal'}`,
                recommendations: genderRecommendations.casual.recommendations.slice(0, 5)
            };
        }
        
        // Display recommendations with smooth animation
        let html = `<p><strong>${matchedScenario.title}</strong></p>`;
        html += '<ul style="text-align: left; max-width: 400px; margin: 0 auto;">';
        matchedScenario.recommendations.forEach((rec, index) => {
            html += `<li style="margin: 10px 0; line-height: 1.4; opacity: 0; animation: fadeInUp 0.5s ease forwards ${index * 0.1}s;">${rec}</li>`;
        });
        html += '</ul>';
        
        resultDiv.innerHTML = html;
        
        // Add fade-in animation for list items
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
    }, 800);
}

function getFragranceWithScroll() {
    getFragrance();
    setTimeout(scrollToResults, 1000);
}

function scrollToResults() {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Fragrance Library Functions
function addFragrance() {
    const input = document.getElementById('fragranceInput');
    const fragranceName = input.value.trim();
    
    if (!fragranceName) {
        showNotification('Please enter a fragrance name', 'error');
        return;
    }
    
    if (fragranceLibrary.some(f => f.toLowerCase() === fragranceName.toLowerCase())) {
        showNotification('This fragrance is already in your library', 'error');
        return;
    }
    
    // Add to library
    fragranceLibrary.push(fragranceName);
    
    // Add to recently added
    addToRecentlyAdded(fragranceName);
    
    // Save to localStorage
    saveFragrances();
    
    // Render updated list
    renderFragranceList();
    
    // Update dashboard counts
    updateDashboardCounts();
    
    // Clear input
    input.value = '';
    
    // Focus back to input
    input.focus();
    
    showNotification('Fragrance added to your library!', 'success');
}

function deleteFragrance(index) {
    const deletedFragrance = fragranceLibrary[index];
    
    // Remove from array
    fragranceLibrary.splice(index, 1);
    
    // Remove from weekly planner assignments
    Object.keys(weeklyPlanner).forEach(dateKey => {
        if (weeklyPlanner[dateKey] === deletedFragrance) {
            delete weeklyPlanner[dateKey];
        }
    });
    
    // Remove from recently added
    recentlyAddedFragrances = recentlyAddedFragrances.filter(item => item.name !== deletedFragrance);
    saveRecentlyAddedFragrances();
    
    // Save to localStorage
    saveFragrances();
    saveWeeklyPlanner();
    
    // Render updated list
    renderFragranceList();
    
    // Update dashboard counts and recently added
    updateDashboardCounts();
    renderRecentlyAddedFragrances();
    
    showNotification('Fragrance removed from your library', 'success');
}

function renderFragranceList() {
    const listContainer = document.getElementById('fragranceList');
    if (!listContainer) return;
    
    if (fragranceLibrary.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-library-state">
                <div class="empty-icon">🧴</div>
                <h3>Your Fragrance Library is Empty</h3>
                <p>Start building your collection by adding your first fragrance above!</p>
            </div>
        `;
    } else {
        listContainer.innerHTML = fragranceLibrary.map((fragrance, index) => {
            // Smart scent detection for vibe icons
            const vibeIcon = getVibeIcon(fragrance);
            const scentType = getScentType(fragrance);
            
            return `
                <div class="fragrance-card" style="animation-delay: ${index * 0.1}s;">
                    <div class="fragrance-card-header">
                        <div class="fragrance-icon-section">
                            <div class="bottle-icon">🧴</div>
                            <div class="vibe-icon">${vibeIcon}</div>
                        </div>
                        <div class="fragrance-info">
                            <h4 class="fragrance-name">${escapeHtml(fragrance)}</h4>
                            <span class="scent-type">${scentType}</span>
                        </div>
                        <div class="fragrance-actions">
                            <button class="action-btn price-btn" onclick="showFragranceDeals('${escapeHtml(fragrance)}')" title="View deals & prices">
                                💰
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteFragrance(${index})" title="Remove from library">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="fragrance-card-footer">
                        <div class="fragrance-stats">
                            <span class="stat-item">
                                <span class="stat-icon">📅</span>
                                <span class="stat-text">Added recently</span>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Initialize weekly planner when on library page
    if (currentPage === 'library') {
        initializeWeeklyPlanner();
    }
    getLibraryRecommendation();
}

// Helper function to get vibe icon based on fragrance name
function getVibeIcon(fragranceName) {
    const name = fragranceName.toLowerCase();
    
    if (/rose|jasmine|lily|violet|orchid|flower|bloom|petal/i.test(name)) return '🌸';
    if (/wood|cedar|oud|sandal|vetiver|pine|forest|bark/i.test(name)) return '🌿';
    if (/vanilla|chocolate|caramel|sugar|honey|sweet|cupcake/i.test(name)) return '🍯';
    if (/aqua|water|fresh|marine|sea|cool|mint|citrus|green/i.test(name)) return '💧';
    if (/spice|pepper|cinnamon|cardamom|clove|ginger|nutmeg/i.test(name)) return '🔥';
    if (/musk|amber|leather|animal|suede/i.test(name)) return '🦁';
    if (/apple|berry|peach|fruit|melon|coconut|fig|grape|pear|plum/i.test(name)) return '🍎';
    if (/powder|iris|soft|clean/i.test(name)) return '✨';
    if (/night|dark|mystery|mysterious/i.test(name)) return '🌙';
    if (/sun|summer|warm|hot/i.test(name)) return '☀️';
    if (/ocean|beach|coastal/i.test(name)) return '🌊';
    if (/garden|nature|outdoor/i.test(name)) return '🌱';
    
    return '🌟'; // Default vibe icon
}

// Helper function to get scent type description
function getScentType(fragranceName) {
    const name = fragranceName.toLowerCase();
    
    if (/rose|jasmine|lily|violet|orchid|flower|bloom|petal/i.test(name)) return 'Floral';
    if (/wood|cedar|oud|sandal|vetiver|pine|forest|bark/i.test(name)) return 'Woody';
    if (/vanilla|chocolate|caramel|sugar|honey|sweet|cupcake/i.test(name)) return 'Sweet';
    if (/aqua|water|fresh|marine|sea|cool|mint|citrus|green/i.test(name)) return 'Fresh';
    if (/spice|pepper|cinnamon|cardamom|clove|ginger|nutmeg/i.test(name)) return 'Spicy';
    if (/musk|amber|leather|animal|suede/i.test(name)) return 'Musky';
    if (/apple|berry|peach|fruit|melon|coconut|fig|grape|pear|plum/i.test(name)) return 'Fruity';
    if (/powder|iris|soft|clean/i.test(name)) return 'Powdery';
    
    return 'Versatile'; // Default scent type
}

function saveFragrances() {
    localStorage.setItem('fragranceLibrary', JSON.stringify(fragranceLibrary));
}

function loadFragrances() {
    const saved = localStorage.getItem('fragranceLibrary');
    if (saved) {
        try {
            fragranceLibrary = JSON.parse(saved);
        } catch (e) {
            fragranceLibrary = [];
        }
    }
}

// Wishlist Functions
function populateWishlistSelect() {
    const select = document.getElementById('wishlistSelect');
    if (!select) return;
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select a fragrance to add...</option>';
    
    // Add available fragrances
    Object.keys(fragrancePriceDatabase.fragrances).forEach(fragrance => {
        if (!wishlist.some(item => item.name === fragrance)) {
            const option = document.createElement('option');
            option.value = fragrance;
            option.textContent = fragrance;
            select.appendChild(option);
        }
    });
}

function addToWishlist() {
    const select = document.getElementById('wishlistSelect');
    const fragranceName = select.value;
    
    if (!fragranceName) {
        showNotification('Please select a fragrance to add', 'error');
        return;
    }
    
    if (wishlist.some(item => item.name === fragranceName)) {
        showNotification('This fragrance is already in your wishlist', 'error');
        return;
    }
    
    // Add to wishlist
    wishlist.push({
        name: fragranceName,
        addedDate: new Date().toISOString(),
        lastChecked: new Date().toISOString()
    });
    
    // Save to localStorage
    saveWishlist();
    
    // Render updated wishlist
    renderWishlist();
    
    // Repopulate select
    populateWishlistSelect();
    
    // Update dashboard counts
    updateDashboardCounts();
    
    // Reset select
    select.value = '';
    
    showNotification('Fragrance added to your wishlist!', 'success');
}

function removeFromWishlist(index) {
    // Remove from array
    wishlist.splice(index, 1);
    
    // Save to localStorage
    saveWishlist();
    
    // Render updated wishlist
    renderWishlist();
    
    // Repopulate select
    populateWishlistSelect();
    
    // Update dashboard counts
    updateDashboardCounts();
    
    showNotification('Fragrance removed from your wishlist', 'success');
}

function renderWishlist() {
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    
    if (wishlist.length === 0) {
        container.innerHTML = '<div class="empty-state">Your wishlist is empty. Add fragrances to track their prices!</div>';
        return;
    }
    
    container.innerHTML = wishlist.map((item, index) => {
        const fragranceData = fragrancePriceDatabase.fragrances[item.name];
        if (!fragranceData) return '';
        
        const bestDeal = getBestDeals(fragranceData)[0];
        const savings = bestDeal ? fragranceData.retailPrice - bestDeal.price : 0;
        const savingsPercent = bestDeal ? Math.round((savings / fragranceData.retailPrice) * 100) : 0;
        
        return `
            <div class="wishlist-item" style="animation-delay: ${index * 0.1}s;">
                <div class="wishlist-header">
                    <span class="wishlist-name">${escapeHtml(item.name)}</span>
                    <div class="wishlist-actions">
                        <button class="wishlist-delete" onclick="removeFromWishlist(${index})" title="Remove from wishlist">
                            ×
                        </button>
                    </div>
                </div>
                
                <div class="wishlist-price-info">
                    <div class="price-display">
                        <span class="current-price">$${bestDeal ? bestDeal.price : fragranceData.retailPrice}</span>
                        <span class="original-price">$${fragranceData.retailPrice}</span>
                        ${bestDeal ? `<span class="savings-badge">Save $${savings} (${savingsPercent}%)</span>` : ''}
                    </div>
                    <span class="last-updated">Last updated: ${formatDate(fragrancePriceDatabase.lastUpdated)}</span>
                </div>
                
                ${bestDeal ? `
                    <div class="wishlist-deals">
                        <a href="${bestDeal.link}" target="_blank" class="deal-link">
                            Best Deal: ${bestDeal.retailer} - ${bestDeal.discount}
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function loadWishlist() {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
        try {
            wishlist = JSON.parse(saved);
        } catch (e) {
            wishlist = [];
        }
    }
}

// Deal Functions
function findFragranceDeals(fragranceName) {
    const fragranceData = fragrancePriceDatabase.fragrances[fragranceName];
    if (!fragranceData) {
        return {
            error: `No price data available for ${fragranceName}`,
            retailPrice: null,
            deals: []
        };
    }
    
    return {
        retailPrice: fragranceData.retailPrice,
        deals: getBestDeals(fragranceData),
        lastUpdated: fragrancePriceDatabase.lastUpdated
    };
}

function getBestDeals(fragranceData) {
    return fragranceData.deals
        .sort((a, b) => a.price - b.price)
        .slice(0, 3);
}

function showFragranceDeals(fragranceName) {
    const dealsData = findFragranceDeals(fragranceName);
    const resultDiv = document.getElementById('result');
    
    if (dealsData.error) {
        resultDiv.innerHTML = `<p>${dealsData.error}</p>`;
        resultDiv.classList.add('show');
        return;
    }
    
    const { retailPrice, deals, lastUpdated } = dealsData;
    
    let dealsHtml = `
        <div class="deals-container">
            <h3>${escapeHtml(fragranceName)} - Best Deals</h3>
            <p class="retail-price">Retail Price: $${retailPrice}</p>
            <div class="deals-list">
    `;
    
    if (deals.length === 0) {
        dealsHtml += '<p>No deals currently available.</p>';
    } else {
        deals.forEach((deal, index) => {
            const savings = retailPrice - deal.price;
            const savingsPercent = Math.round((savings / retailPrice) * 100);
            
            dealsHtml += `
                <div class="deal-item" style="animation-delay: ${index * 0.1}s;">
                    <div class="deal-header">
                        <span class="retailer">${escapeHtml(deal.retailer)}</span>
                        <span class="discount-badge">${deal.discount}</span>
                    </div>
                    <div class="deal-price">$${deal.price}</div>
                    <div class="savings">Save $${savings} (${savingsPercent}%)</div>
                    <div class="deal-details">
                        <a href="${deal.link}" target="_blank" class="deal-link">View Deal →</a>
                    </div>
                </div>
            `;
        });
    }
    
    dealsHtml += `
            </div>
            <p class="last-updated">Last updated: ${formatDate(lastUpdated)}</p>
        </div>
    `;
    
    resultDiv.innerHTML = dealsHtml;
    resultDiv.classList.add('show');
    
    // Scroll to results
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Set background based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    // Temporarily remove blur from headers
    const header = document.querySelector('.modern-header');
    const navbar = document.querySelector('.navbar');
    
    if (header) {
        header.style.backdropFilter = 'none';
        header.style.transition = 'backdrop-filter 0.3s ease';
    }
    if (navbar) {
        navbar.style.backdropFilter = 'none';
        navbar.style.transition = 'backdrop-filter 0.3s ease';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
            
            // Restore blur to headers after notification is gone
            setTimeout(() => {
                if (header) {
                    header.style.backdropFilter = 'blur(20px)';
                }
                if (navbar) {
                    navbar.style.backdropFilter = 'blur(20px)';
                }
            }, 300);
        }, 300);
    }, 3000);
}

// Gender Selection Functions
function showGenderModal() {
    console.log('showGenderModal called');
    const modal = document.getElementById('genderModal');
    console.log('Gender modal element found:', modal);
    if (modal) {
        modal.classList.add('show');
        console.log('Gender modal shown');
    } else {
        console.error('Gender modal element not found!');
    }
}

function hideGenderModal() {
    console.log('hideGenderModal called');
    const modal = document.getElementById('genderModal');
    console.log('Gender modal element found:', modal);
    if (modal) {
        modal.classList.remove('show');
        console.log('Gender modal hidden');
    } else {
        console.error('Gender modal element not found!');
    }
}

function selectGender(gender) {
    userGender = gender;
    currentTheme = gender;
    
    // Save gender preference
    localStorage.setItem('userGender', gender);
    localStorage.setItem('currentTheme', gender);
    
    // Mark onboarding as completed
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    // Apply theme
    applyTheme(gender);
    
    // Hide gender modal
    hideGenderModal();
    
    // Immediately hide splash screen
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        splashScreen.style.display = 'none';
    }
    
    // Initialize dashboard immediately
    initializeDashboard();
    updateDashboardCounts();
    renderRecentlyAddedFragrances();
    updateMainAlertWidget();
    
    // Navigate to home page immediately
    navigateToPage('home');
}

function applyTheme(theme) {
    // Remove existing theme classes
    document.body.classList.remove('male-theme', 'female-theme');
    
    // Add new theme class
    if (theme === 'male') {
        document.body.classList.add('male-theme');
    } else if (theme === 'female') {
        document.body.classList.add('female-theme');
    }
    // neutral theme uses default CSS variables
}

function resetGenderPreference() {
    // Show gender modal again
    showGenderModal();
}

function toggleTheme() {
    // Cycle through themes: neutral -> male -> female -> neutral
    const themes = ['neutral', 'male', 'female'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    currentTheme = newTheme;
    localStorage.setItem('currentTheme', newTheme);
    applyTheme(newTheme);
    
    // Update theme icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        const icons = ['🌙', '👨', '👩'];
        themeIcon.textContent = icons[nextIndex];
    }
    
    showNotification(`Theme changed to ${newTheme === 'male' ? 'masculine' : newTheme === 'female' ? 'feminine' : 'neutral'} mode.`, 'info');
}

function setupGenderModal() {
    // Add event listeners to gender options
    const genderOptions = document.querySelectorAll('.gender-option');
    genderOptions.forEach(option => {
        option.addEventListener('click', () => {
            const gender = option.getAttribute('data-gender');
            selectGender(gender);
        });
    });
    
    // Add event listeners to header buttons
    const themeToggle = document.getElementById('themeToggle');
    const genderReset = document.getElementById('genderReset');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (genderReset) {
        genderReset.addEventListener('click', resetGenderPreference);
    }
}

// Modal Functions
function hideModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Weekly Planner Functions
function initializeWeeklyPlanner() {
    loadWeeklyPlanner();
    generateWeeklyCalendar();
    updateTodayFragrance();
}

function generateWeeklyCalendar() {
    const calendarContainer = document.getElementById('weeklyCalendar');
    if (!calendarContainer) return;
    
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the start of the week (Monday)
    const startOfWeek = new Date(today);
    const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days
    startOfWeek.setDate(today.getDate() - daysToSubtract);
    
    let calendarHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDate = currentDate.getDate();
        const dateKey = formatDateKey(currentDate);
        
        const isToday = isSameDay(currentDate, today);
        const assignedFragrance = weeklyPlanner[dateKey] || null;
        
        const todayClass = isToday ? 'today' : '';
        const fragranceText = assignedFragrance ? 
            `<div class="fragrance-text assigned">${escapeHtml(assignedFragrance)}</div>` :
            `<div class="fragrance-text">Click to assign</div>`;
        
        calendarHTML += `
            <div class="calendar-day ${todayClass}" onclick="openFragranceSelection('${dateKey}', '${dayName}', ${dayDate})">
                <div class="day-header">
                    <div class="day-name">${dayName}</div>
                    <div class="day-date">${dayDate}</div>
                </div>
                <div class="day-fragrance">
                    ${fragranceText}
                </div>
            </div>
        `;
    }
    
    calendarContainer.innerHTML = calendarHTML;
}

function openFragranceSelection(dateKey, dayName, dayDate) {
    selectedDay = dateKey;
    selectedFragrance = null;
    
    // Update modal title
    const modalTitle = document.getElementById('selectionModalTitle');
    const modalSubtitle = document.getElementById('selectionModalSubtitle');
    const assignBtn = document.getElementById('assignFragranceBtn');
    
    if (modalTitle) modalTitle.textContent = `Select Fragrance for ${dayName}, ${dayDate}`;
    if (modalSubtitle) modalSubtitle.textContent = 'Choose a fragrance from your library';
    if (assignBtn) assignBtn.disabled = true;
    
    // Populate fragrance list
    populateFragranceSelectionList();
    
    // Show modal
    showFragranceSelectionModal();
}

function populateFragranceSelectionList() {
    const listContainer = document.getElementById('fragranceSelectionList');
    if (!listContainer) return;
    
    if (fragranceLibrary.length === 0) {
        listContainer.innerHTML = '<div class="fragrance-selection-item"><h4>No fragrances in library</h4></div>';
        return;
    }
    
    listContainer.innerHTML = fragranceLibrary.map(fragrance => `
        <div class="fragrance-selection-item" onclick="selectFragrance('${escapeHtml(fragrance)}')">
            <h4>${escapeHtml(fragrance)}</h4>
        </div>
    `).join('');
}

function selectFragrance(fragrance) {
    selectedFragrance = fragrance;
    
    // Update visual selection
    const items = document.querySelectorAll('.fragrance-selection-item');
    items.forEach(item => {
        item.classList.remove('selected');
        if (item.querySelector('h4').textContent === fragrance) {
            item.classList.add('selected');
        }
    });
    
    // Enable assign button
    const assignBtn = document.getElementById('assignFragranceBtn');
    if (assignBtn) assignBtn.disabled = false;
}

function assignFragranceToDay() {
    if (!selectedDay || !selectedFragrance) return;
    
    // Assign fragrance to the selected day
    weeklyPlanner[selectedDay] = selectedFragrance;
    
    // Save to localStorage
    saveWeeklyPlanner();
    
    // Regenerate calendar
    generateWeeklyCalendar();
    
    // Update today's fragrance if needed
    updateTodayFragrance();
    
    // Update dashboard counts
    updateDashboardCounts();
    
    // Hide modal
    hideFragranceSelectionModal();
    
    // Show notification
    showNotification(`Fragrance assigned for ${formatDateDisplay(selectedDay)}!`, 'success');
}

function showFragranceSelectionModal() {
    const modal = document.getElementById('fragranceSelectionModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function hideFragranceSelectionModal() {
    const modal = document.getElementById('fragranceSelectionModal');
    if (modal) {
        modal.classList.remove('show');
    }
    selectedDay = null;
    selectedFragrance = null;
}

function updateTodayFragrance() {
    const todayText = document.getElementById('todayText');
    const todayDate = document.getElementById('todayDate');
    
    if (!todayText || !todayDate) return;
    
    const today = new Date();
    const todayKey = formatDateKey(today);
    const assignedFragrance = weeklyPlanner[todayKey];
    
    // Update date display
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todayDate.textContent = today.toLocaleDateString('en-US', dateOptions);
    
    // Update fragrance display
    if (assignedFragrance) {
        todayText.textContent = assignedFragrance;
        todayText.style.color = 'var(--text-primary)';
    } else {
        todayText.textContent = 'No fragrance assigned for today';
        todayText.style.color = 'var(--text-secondary)';
    }
}

function saveWeeklyPlanner() {
    localStorage.setItem('weeklyPlanner', JSON.stringify(weeklyPlanner));
}

function loadWeeklyPlanner() {
    const saved = localStorage.getItem('weeklyPlanner');
    if (saved) {
        try {
            weeklyPlanner = JSON.parse(saved);
        } catch (e) {
            weeklyPlanner = {};
        }
    }
}

// Utility functions for date handling
function formatDateKey(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function formatDateDisplay(dateKey) {
    const date = new Date(dateKey);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Questionnaire Functions
function startQuestionnaire() {
    console.log('startQuestionnaire called');
    
    // Prevent starting the quiz if already completed
    if (localStorage.getItem('questionnaireCompleted') === 'true') {
        console.log('Questionnaire already completed, returning');
        return;
    }
    
    console.log('Starting questionnaire...');
    
    // Reset questionnaire state
    currentQuestionIndex = 0;
    questionnaireAnswers = {};
    
    // Show questionnaire modal
    showQuestionnaire();
    
    // Load first question
    loadQuestion();
}

function showQuestionnaire() {
    console.log('showQuestionnaire called');
    
    // Prevent showing the quiz if already completed
    if (localStorage.getItem('questionnaireCompleted') === 'true') {
        console.log('Questionnaire already completed, not showing');
        return;
    }
    
    const modal = document.getElementById('questionnaireModal');
    console.log('Questionnaire modal element:', modal);
    
    if (modal) {
        console.log('Showing questionnaire modal');
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
        console.error('Questionnaire modal not found!');
    }
}

function hideQuestionnaire() {
    const modal = document.getElementById('questionnaireModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }, 300);
    }
}

function loadQuestion() {
    const question = questionnaireQuestions[currentQuestionIndex];
    if (!question) return;
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / questionnaireQuestions.length) * 100;
    const progressFill = document.getElementById('questionProgress');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    // Update title and subtitle
    const title = document.getElementById('questionTitle');
    const subtitle = document.getElementById('questionSubtitle');
    if (title) title.textContent = question.title;
    if (subtitle) subtitle.textContent = question.subtitle;
    
    // Load question options
    loadQuestionOptions(question);
    
    // Update navigation buttons
    updateQuestionnaireButtons();
}

function loadQuestionOptions(question) {
    const container = document.getElementById('questionContainer');
    if (!container) return;
    
    container.innerHTML = question.options.map((option, index) => `
        <div class="question-option" 
             data-value="${option.value}">
            <h4>${option.label}</h4>
            <p>${option.description}</p>
        </div>
    `).join('');
    
    // Add mobile touch event listeners
    const options = container.querySelectorAll('.question-option');
    options.forEach(option => {
        const value = option.getAttribute('data-value');
        
        // Click handler
        option.addEventListener('click', function(e) {
            selectQuestionOption(question.id, value);
        });
        
        // Touch handlers for mobile
        option.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        option.addEventListener('touchend', function(e) {
            this.style.transform = 'scale(1)';
            selectQuestionOption(question.id, value);
        }, { passive: true });
    });
}

function selectQuestionOption(questionId, value) {
    questionnaireAnswers[questionId] = value;
    
    // Update visual selection
    const options = document.querySelectorAll('.question-option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Find and select the clicked option
    const selectedOption = document.querySelector(`[data-value="${value}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Enable next button
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    if (nextBtn) nextBtn.disabled = false;
    if (finishBtn) finishBtn.disabled = false;
}

function nextQuestion() {
    if (currentQuestionIndex < questionnaireQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        updateQuestionnaireButtons();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
        updateQuestionnaireButtons();
    }
}

function updateQuestionnaireButtons() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    if (!backBtn || !nextBtn || !finishBtn) return;
    
    // Show/hide back button
    backBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    
    // Show/hide next/finish buttons
    if (currentQuestionIndex < questionnaireQuestions.length - 1) {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
        
        // Enable/disable next button based on answer
        const currentQuestion = questionnaireQuestions[currentQuestionIndex];
        const hasAnswer = questionnaireAnswers[currentQuestion.id];
        nextBtn.disabled = !hasAnswer;
        nextBtn.style.opacity = hasAnswer ? '1' : '0.5';
    } else {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
        
        // Enable/disable finish button based on answer
        const currentQuestion = questionnaireQuestions[currentQuestionIndex];
        const hasAnswer = questionnaireAnswers[currentQuestion.id];
        finishBtn.disabled = !hasAnswer;
        finishBtn.style.opacity = hasAnswer ? '1' : '0.5';
    }
    
    // Add mobile touch event listeners with proper handling
    [backBtn, nextBtn, finishBtn].forEach(btn => {
        if (btn) {
            // Remove existing listeners to prevent duplicates
            btn.removeEventListener('touchstart', btn.touchStartHandler);
            btn.removeEventListener('touchend', btn.touchEndHandler);
            btn.removeEventListener('click', btn.clickHandler);
            
            // Add new touch handlers
            btn.touchStartHandler = function(e) {
                if (!this.disabled) {
                    this.style.transform = 'scale(0.95)';
                }
            };
            
            btn.touchEndHandler = function(e) {
                if (!this.disabled) {
                    this.style.transform = 'scale(1)';
                }
            };
            
            // Add click handler that works with touch
            btn.clickHandler = function(e) {
                if (this.disabled) {
                    e.preventDefault();
                    return;
                }
                
                // Handle the button action
                if (this === backBtn) {
                    previousQuestion();
                } else if (this === nextBtn) {
                    nextQuestion();
                } else if (this === finishBtn) {
                    finishQuestionnaire();
                }
            };
            
            // Remove onclick from HTML and use event listeners
            btn.removeAttribute('onclick');
            btn.addEventListener('click', btn.clickHandler);
            btn.addEventListener('touchstart', btn.touchStartHandler, { passive: true });
            btn.addEventListener('touchend', btn.touchEndHandler, { passive: true });
        }
    });
}

function finishQuestionnaire() {
    // Mark questionnaire as completed
    localStorage.setItem('questionnaireCompleted', 'true');
    
    // Save answers
    localStorage.setItem('questionnaireAnswers', JSON.stringify(questionnaireAnswers));
    
    // Hide questionnaire modal
    hideQuestionnaire();
    
    // Show success notification
    showNotification('Your profile has been created! Check out your personalized recommendations.', 'success');
    
    // Update main alert widget to show completion
    updateMainAlertWidget();
    
    // Navigate to home page and show recommendations
    setTimeout(() => {
        navigateToPage('home');
        
        // Show recommendation section
        setTimeout(() => {
            showRecommendationSection();
        }, 500);
    }, 1000);
}

function showRecommendationSection() {
    const recommendationSection = document.getElementById('recommendationSection');
    if (recommendationSection) {
        recommendationSection.style.display = 'block';
        
        // Generate recommendations based on questionnaire answers
        const recommendations = generateRecommendations();
        
        // Update recommendation content
        const title = recommendationSection.querySelector('h3');
        const list = recommendationSection.querySelector('.recommendations-list');
        
        if (title) {
            title.textContent = 'Your Personalized Recommendations';
        }
        
        if (list) {
            list.innerHTML = recommendations.map(rec => `
                <div class="recommendation-item">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
            `).join('');
        }
    }
}

function generateRecommendations() {
    const answers = questionnaireAnswers;
    const recommendations = [];
    
    // Generate recommendations based on answers
    if (answers.occasion === 'casual') {
        recommendations.push({
            title: 'Casual Day Fragrances',
            description: 'Light, comfortable scents perfect for everyday wear. Try fresh citrus or clean aquatic notes.'
        });
    } else if (answers.occasion === 'professional') {
        recommendations.push({
            title: 'Professional Fragrances',
            description: 'Sophisticated and refined scents suitable for work environments. Look for clean, subtle notes.'
        });
    } else if (answers.occasion === 'romantic') {
        recommendations.push({
            title: 'Romantic Evening Fragrances',
            description: 'Warm, sensual scents perfect for date nights. Consider vanilla, amber, or floral notes.'
        });
    }
    
    if (answers.season === 'summer') {
        recommendations.push({
            title: 'Summer Fragrances',
            description: 'Light, refreshing scents that work well in warm weather. Citrus and aquatic notes are ideal.'
        });
    } else if (answers.season === 'winter') {
        recommendations.push({
            title: 'Winter Fragrances',
            description: 'Warm, cozy scents perfect for cold weather. Look for vanilla, amber, or spicy notes.'
        });
    }
    
    if (answers.notes === 'fresh') {
        recommendations.push({
            title: 'Fresh & Clean Notes',
            description: 'Citrus, aquatic, and green notes provide a clean, invigorating experience.'
        });
    } else if (answers.notes === 'floral') {
        recommendations.push({
            title: 'Floral & Sweet Notes',
            description: 'Romantic flower notes and sweet vanilla create elegant, feminine scents.'
        });
    } else if (answers.notes === 'woody') {
        recommendations.push({
            title: 'Woody & Earthy Notes',
            description: 'Sandalwood, vetiver, and earthy notes provide depth and sophistication.'
        });
    } else if (answers.notes === 'spicy') {
        recommendations.push({
            title: 'Spicy & Warm Notes',
            description: 'Cinnamon, pepper, and warm spices create bold, attention-grabbing fragrances.'
        });
    }
    
    // Add general tips
    recommendations.push({
        title: 'Pro Tips',
        description: 'Test fragrances on your skin before buying. Apply to pulse points for best longevity. Store in a cool, dark place.'
    });
    
    return recommendations;
}

function updateMainAlertWidget() {
    const mainAlertWidget = document.getElementById('mainAlertWidget');
    if (!mainAlertWidget) return;

    // Check if questionnaire is completed
    const completed = localStorage.getItem('questionnaireCompleted') === 'true';

    if (completed) {
        // Show a different message or hide the quiz option
        mainAlertWidget.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">🎉</span>
                <div class="alert-info">
                    <h3>Welcome back!</h3>
                    <p>Your fragrance profile is set. Enjoy your personalized recommendations.</p>
                </div>
            </div>
        `;
    } else {
        // Show the option to take the quiz
        mainAlertWidget.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">🌸</span>
                <div class="alert-info">
                    <h3>Let's Find Your Perfect Fragrance</h3>
                    <p>Answer a few questions to get personalized recommendations.</p>
                </div>
                <button class="alert-button" onclick="startQuestionnaire()">Start Quiz</button>
            </div>
        `;
        
        // Set up event listeners for the new button
        setupAlertButtonListeners();
    }
}

// Dashboard Functions
function updateDashboardCounts() {
    // Update library count
    const libraryCount = document.getElementById('libraryCount');
    if (libraryCount) {
        libraryCount.textContent = `${fragranceLibrary.length} fragrances`;
    }
    
    // Update schedule count
    const scheduleCount = document.getElementById('scheduleCount');
    if (scheduleCount) {
        const plannedCount = Object.keys(weeklyPlanner).length;
        scheduleCount.textContent = `${plannedCount} planned`;
    }
    
    // Update wishlist count
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = `${wishlist.length} items`;
    }
}

function loadRecentlyAddedFragrances() {
    const saved = localStorage.getItem('recentlyAddedFragrances');
    if (saved) {
        try {
            recentlyAddedFragrances = JSON.parse(saved);
        } catch (e) {
            recentlyAddedFragrances = [];
        }
    }
}

function saveRecentlyAddedFragrances() {
    localStorage.setItem('recentlyAddedFragrances', JSON.stringify(recentlyAddedFragrances));
}

function addToRecentlyAdded(fragranceName) {
    const timestamp = new Date().toISOString();
    
    // Remove if already exists
    recentlyAddedFragrances = recentlyAddedFragrances.filter(item => item.name !== fragranceName);
    
    // Add to beginning
    recentlyAddedFragrances.unshift({
        name: fragranceName,
        timestamp: timestamp
    });
    
    // Keep only last 6 items
    if (recentlyAddedFragrances.length > 6) {
        recentlyAddedFragrances = recentlyAddedFragrances.slice(0, 6);
    }
    
    saveRecentlyAddedFragrances();
    renderRecentlyAddedFragrances();
}

function renderRecentlyAddedFragrances() {
    const grid = document.getElementById('recentlyAddedGrid');
    if (!grid) return;
    
    if (recentlyAddedFragrances.length === 0) {
        grid.innerHTML = '<div class="empty-recent">No fragrances added yet. Start building your collection!</div>';
        return;
    }
    
    grid.innerHTML = recentlyAddedFragrances.map(item => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="recent-fragrance-card" onclick="showFragranceDeals('${escapeHtml(item.name)}')">
                <div class="recent-fragrance-name">${escapeHtml(item.name)}</div>
                <div class="recent-fragrance-date">Added ${formattedDate}</div>
            </div>
        `;
    }).join('');
}

function initializeDashboard() {
    // Update dashboard counts
    updateDashboardCounts();
    
    // Show wishlist alert if needed
    const dismissedWishlistAlert = localStorage.getItem('dismissedWishlistAlert');
    if (!dismissedWishlistAlert && wishlist.length === 0) {
        setTimeout(() => {
            showWishlistAlert();
        }, 2000);
    }
}

function showResetConfirmation() {
    const confirmed = confirm('⚠️ WARNING: This will permanently delete ALL your data including:\n\n• Your fragrance library\n• Wishlist items\n• Weekly planner\n• All preferences\n\nThis action cannot be undone. Are you sure you want to continue?');
    
    if (confirmed) {
        resetAllData();
    }
}

function resetAllData() {
    // Clear all localStorage
    localStorage.clear();
    
    // Reset all variables
    fragranceLibrary = [];
    wishlist = [];
    weeklyPlanner = {};
    recentlyAddedFragrances = [];
    questionnaireAnswers = {};
    currentQuestionIndex = 0;
    userGender = null;
    currentTheme = 'neutral';
    
    // Reset UI
    document.body.classList.remove('male-theme', 'female-theme', 'ocean-theme', 'sunset-theme', 'forest-theme', 'lavender-theme', 'midnight-theme');
    
    // Update all displays
    renderFragranceList();
    renderWishlist();
    renderRecentlyAddedFragrances();
    updateDashboardCounts();
    updateMainAlertWidget();
    
    // Reset wishlist alert to show again
    resetWishlistAlert();
    
    // Show success notification
    showNotification('All data has been reset successfully!', 'success');
    
    // Close settings modal
    toggleSettingsModal();
    
    // Redirect to home page (don't show splash screen)
    navigateToPage('home');
}

function resetMainAlertWidget() {
    const mainAlertWidget = document.getElementById('mainAlertWidget');
    if (!mainAlertWidget) return;
    
    mainAlertWidget.classList.remove('dismissed');
    mainAlertWidget.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">🎯</div>
            <div class="alert-info">
                <h3>Discover Your Perfect Fragrance</h3>
                <p>Get personalized recommendations based on your preferences</p>
            </div>
            <div class="alert-action">
                <button class="alert-button" onclick="startQuestionnaire()">Start Quiz</button>
            </div>
        </div>
    `;
    
    // Set up event listeners for the new button
    setupAlertButtonListeners();
}

function dismissAlert() {
    const mainAlertWidget = document.getElementById('mainAlertWidget');
    if (mainAlertWidget) {
        mainAlertWidget.classList.add('dismissed');
        
        // Show wishlist alert after a short delay
        setTimeout(() => {
            showWishlistAlert();
        }, 500);
    }
}

function showWishlistAlert() {
    const wishlistAlertSection = document.getElementById('wishlistAlertSection');
    if (wishlistAlertSection) {
        wishlistAlertSection.style.display = 'block';
        wishlistAlertSection.classList.add('show');
    }
}

function resetWishlistAlert() {
    // Remove dismissed state to allow wishlist alert to show again
    localStorage.removeItem('dismissedWishlistAlert');
    
    const wishlistAlertSection = document.getElementById('wishlistAlertSection');
    if (wishlistAlertSection) {
        wishlistAlertSection.style.display = 'block';
        wishlistAlertSection.classList.remove('show');
    }
}

function dismissWishlistAlert() {
    const wishlistAlertSection = document.getElementById('wishlistAlertSection');
    if (wishlistAlertSection) {
        wishlistAlertSection.classList.remove('show');
        
        // Save dismissed state
        localStorage.setItem('dismissedWishlistAlert', 'true');
        
        // Smooth transition for layout adjustment
        setTimeout(() => {
            wishlistAlertSection.style.display = 'none';
        }, 300);
    }
}

// Settings Modal Functions
function toggleSettingsModal() {
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        if (settingsModal.classList.contains('show')) {
            settingsModal.classList.remove('show');
        } else {
            settingsModal.classList.add('show');
            updateSettingsModal();
        }
    }
}

function updateSettingsModal() {
    // Update color theme selection
    updateColorThemeSelection();
}

// Color Theme Functions
function applyColorTheme(theme) {
    // Remove all existing theme classes
    document.body.classList.remove('ocean-theme', 'sunset-theme', 'forest-theme', 'lavender-theme', 'midnight-theme');
    
    // Apply new theme
    if (theme !== 'default') {
        document.body.classList.add(theme + '-theme');
    }
    
    // Save theme preference
    localStorage.setItem('colorTheme', theme);
    
    // Update color theme selection
    updateColorThemeSelection();
    
    // Show notification
    const themeNames = {
        'default': 'Default',
        'ocean': 'Ocean',
        'sunset': 'Sunset',
        'forest': 'Forest',
        'lavender': 'Lavender',
        'midnight': 'Midnight'
    };
    
    showNotification(`Applied ${themeNames[theme]} theme!`, 'success');
}

function updateColorThemeSelection() {
    const currentTheme = localStorage.getItem('colorTheme') || 'default';
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-theme') === currentTheme) {
            option.classList.add('selected');
        }
    });
}

function loadColorTheme() {
    const savedTheme = localStorage.getItem('colorTheme');
    if (savedTheme && savedTheme !== 'default') {
        applyColorTheme(savedTheme);
    }
}

// Reset Functions
function resetPreferences() {
    // Reset color theme
    localStorage.removeItem('colorTheme');
    document.body.classList.remove('ocean-theme', 'sunset-theme', 'forest-theme', 'lavender-theme', 'midnight-theme');
    
    // Reset gender preference
    localStorage.removeItem('userGender');
    userGender = null;
    
    // Reset theme toggle
    localStorage.removeItem('currentTheme');
    currentTheme = 'neutral';
    
    // Reset onboarding to allow gender selection again
    localStorage.removeItem('hasCompletedOnboarding');
    
    // Reset wishlist alert to show again
    resetWishlistAlert();
    
    // Update UI
    updateColorThemeSelection();
    
    showNotification('Preferences reset successfully! You can now select your gender preference again.', 'success');
    
    // Show splash screen to allow gender selection
    setTimeout(() => {
        showSplashScreen();
    }, 1000);
}

// Close settings modal when clicking outside
document.addEventListener('click', function(event) {
    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (settingsModal && settingsModal.classList.contains('show')) {
        if (!settingsModal.contains(event.target) && !settingsBtn.contains(event.target)) {
            toggleSettingsModal();
        }
    }
});

// Close settings modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.classList.contains('show')) {
            toggleSettingsModal();
        }
    }
});

function getLibraryRecommendation() {
    const card = document.getElementById('libraryRecommendationCard');
    if (!card) return;
    if (fragranceLibrary.length === 0) {
        card.style.display = 'none';
        card.innerHTML = '';
        return;
    }
    // Simple scent type detection by keywords
    const scentTypes = {
        fresh: [/aqua|water|fresh|marine|sea|cool|mint|citrus|green/i],
        woody: [/wood|cedar|oud|sandal|vetiver|pine|forest|bark/i],
        floral: [/rose|jasmine|lily|violet|orchid|flower|bloom|petal/i],
        spicy: [/spice|pepper|cinnamon|cardamom|clove|ginger|nutmeg/i],
        sweet: [/vanilla|chocolate|caramel|sugar|honey|sweet|cupcake/i],
        musky: [/musk|amber|leather|animal|suede/i],
        fruity: [/apple|berry|peach|fruit|melon|coconut|fig|grape|pear|plum/i],
        powdery: [/powder|iris|soft|clean/i]
    };
    const counts = {};
    let uncategorized = 0;
    fragranceLibrary.forEach(name => {
        let found = false;
        for (const [type, regexes] of Object.entries(scentTypes)) {
            if (regexes.some(r => r.test(name))) {
                counts[type] = (counts[type] || 0) + 1;
                found = true;
                break;
            }
        }
        if (!found) uncategorized++;
    });
    // Find most common and missing types
    const allTypes = Object.keys(scentTypes);
    const presentTypes = Object.keys(counts);
    let mostCommon = presentTypes[0] || null;
    let maxCount = 0;
    presentTypes.forEach(type => {
        if (counts[type] > maxCount) {
            mostCommon = type;
            maxCount = counts[type];
        }
    });
    const missingTypes = allTypes.filter(type => !presentTypes.includes(type));
    let suggestion = '';
    if (missingTypes.length > 0) {
        const suggestType = missingTypes[Math.floor(Math.random() * missingTypes.length)];
        suggestion = `You have mostly <b>${mostCommon}</b> scents. Why not try something <b>${suggestType}</b>?`;
    } else if (mostCommon) {
        suggestion = `You have a well-rounded collection, but <b>${mostCommon}</b> is your favorite!`;
    } else {
        suggestion = `Your collection is unique! Try adding more to discover your scent profile.`;
    }
    card.innerHTML = `<h3>Library Insight</h3><p>${suggestion}</p>`;
    card.style.display = '';
}

function suggestFromLibrary() {
    const input = document.getElementById('moodInput');
    const resultDiv = document.getElementById('moodSuggestionResult');
    if (!input || !resultDiv) return;
    const mood = input.value.trim().toLowerCase();
    if (fragranceLibrary.length === 0) {
        resultDiv.innerHTML = '<p>Your library is empty. Add some fragrances to get suggestions!</p>';
        return;
    }
    if (!mood) {
        resultDiv.innerHTML = '<p>Please describe your mood, event, or vibe.</p>';
        return;
    }
    // Improved mood keywords and match to fragrance names
    const moodKeywords = [
        { mood: 'romantic', words: ['romantic', 'date', 'love', 'night', 'evening', 'passion', 'intimate'] },
        { mood: 'work', words: ['work', 'office', 'professional', 'meeting', 'business', 'formal'] },
        { mood: 'fresh', words: ['fresh', 'clean', 'aqua', 'water', 'mint', 'citrus', 'green', 'morning', 'crisp'] },
        { mood: 'warm', words: ['warm', 'cozy', 'vanilla', 'amber', 'spice', 'winter', 'sweet', 'comfort'] },
        { mood: 'energetic', words: ['energetic', 'sport', 'active', 'zest', 'vibrant', 'summer', 'uplifting'] },
        { mood: 'floral', words: ['floral', 'flower', 'rose', 'jasmine', 'bloom', 'petal', 'garden'] },
        { mood: 'woody', words: ['woody', 'wood', 'cedar', 'oud', 'sandal', 'forest', 'earthy'] },
        { mood: 'fruity', words: ['fruity', 'fruit', 'berry', 'peach', 'apple', 'melon', 'coconut', 'juicy'] },
        { mood: 'musky', words: ['musky', 'musk', 'leather', 'animal', 'suede', 'deep'] },
        { mood: 'powdery', words: ['powdery', 'powder', 'iris', 'soft', 'clean', 'gentle'] },
        { mood: 'adventurous', words: ['adventure', 'adventurous', 'explore', 'bold', 'unique', 'mystery'] },
        { mood: 'relaxed', words: ['relaxed', 'chill', 'calm', 'laid-back', 'easygoing', 'peaceful'] },
        { mood: 'rainy', words: ['rain', 'rainy', 'storm', 'cloudy', 'wet', 'cool'] },
        { mood: 'party', words: ['party', 'fun', 'celebrate', 'night out', 'clubbing', 'festive'] }
    ];
    // Find which mood category matches the input
    let matchedMood = null;
    for (const entry of moodKeywords) {
        if (entry.words.some(word => mood.includes(word))) {
            matchedMood = entry;
            break;
        }
    }
    // If no direct match, try to match any word in the input to any mood keyword
    if (!matchedMood) {
        for (const entry of moodKeywords) {
            if (entry.words.some(word => mood.split(/\s+/).includes(word))) {
                matchedMood = entry;
                break;
            }
        }
    }
    // Try to find a fragrance in the library that matches the mood
    let match = null;
    if (matchedMood) {
        // Look for a fragrance whose name contains any of the mood's keywords
        for (const fragrance of fragranceLibrary) {
            if (matchedMood.words.some(word => fragrance.toLowerCase().includes(word))) {
                match = fragrance;
                break;
            }
        }
    }
    // If no match by mood, try to find a fragrance whose name contains any word from the input
    if (!match) {
        const moodWords = mood.split(/\s+/);
        for (const fragrance of fragranceLibrary) {
            if (moodWords.some(word => fragrance.toLowerCase().includes(word))) {
                match = fragrance;
                break;
            }
        }
    }
    // If still no match, suggest the most "versatile" fragrance (first in list)
    if (!match && fragranceLibrary.length > 0) {
        resultDiv.innerHTML = `<p>No perfect match found, but your most versatile fragrance is <b>${escapeHtml(fragranceLibrary[0])}</b>!</p>`;
        return;
    }
    if (match) {
        resultDiv.innerHTML = `<p>Based on your mood, try: <b>${escapeHtml(match)}</b></p>`;
    } else {
        resultDiv.innerHTML = `<p>No matching fragrance found. Try adding more to your library!</p>`;
    }
}

function resetQuestionnaire() {
    console.log('Resetting questionnaire completion status');
    localStorage.removeItem('questionnaireCompleted');
    console.log('Questionnaire reset complete');
}

// Add this to the global scope for testing
window.resetQuestionnaire = resetQuestionnaire;

function setupAlertButtonListeners() {
    console.log('Setting up alert button listeners...');
    
    // Alert button (Start Quiz button) - Mobile touch support
    const alertButtons = document.querySelectorAll('.alert-button');
    console.log('Found alert buttons:', alertButtons.length);
    
    alertButtons.forEach((alertButton, index) => {
        console.log(`Setting up alert button ${index}:`, alertButton.textContent);
        
        // Don't remove onclick - keep it as fallback
        // alertButton.removeAttribute('onclick');
        
        // Add click event listener (this will work alongside onclick)
        alertButton.addEventListener('click', function(e) {
            console.log('Alert button clicked!');
            e.preventDefault();
            e.stopPropagation(); // Prevent onclick from also firing
            startQuestionnaire();
        });
        
        // Add touch event listeners for mobile
        alertButton.addEventListener('touchstart', function(e) {
            console.log('Alert button touchstart!');
            e.preventDefault();
            this.style.transform = 'scale(0.95)';
        }, { passive: false });
        
        alertButton.addEventListener('touchend', function(e) {
            console.log('Alert button touchend!');
            e.preventDefault();
            e.stopPropagation(); // Prevent onclick from also firing
            this.style.transform = 'scale(1)';
            startQuestionnaire();
        }, { passive: false });
        
        // Ensure button is clickable
        alertButton.style.pointerEvents = 'auto';
        alertButton.style.cursor = 'pointer';
        alertButton.style.webkitTapHighlightColor = 'transparent';
        alertButton.style.touchAction = 'manipulation';
    });
}

// Add this to the global scope for testing
window.setupAlertButtonListeners = setupAlertButtonListeners;

// Test function to check button status
function testAlertButton() {
    console.log('=== ALERT BUTTON TEST ===');
    
    const alertButtons = document.querySelectorAll('.alert-button');
    console.log('Total alert buttons found:', alertButtons.length);
    
    alertButtons.forEach((btn, index) => {
        console.log(`Button ${index}:`, {
            text: btn.textContent,
            onclick: btn.getAttribute('onclick'),
            hasClickListeners: btn.onclick !== null,
            style: {
                pointerEvents: btn.style.pointerEvents,
                cursor: btn.style.cursor,
                display: btn.style.display,
                visibility: btn.style.visibility
            }
        });
    });
    
    // Check if questionnaire modal exists
    const modal = document.getElementById('questionnaireModal');
    console.log('Questionnaire modal exists:', !!modal);
    
    // Check questionnaire completion status
    const completed = localStorage.getItem('questionnaireCompleted');
    console.log('Questionnaire completed:', completed);
}

// Add test function to global scope
window.testAlertButton = testAlertButton;

// Add manual trigger function
window.manualStartQuiz = function() {
    console.log('Manual quiz start triggered');
    startQuestionnaire();
};
  
  
  
  
