/* ================================
   CART PERSISTENCE (localStorage)
================================ */

const CART_STORAGE_KEY = 'noore_cart_items';

/* ================================
   BLOCK 2: SAVE, LOAD & RENDER
================================ */

function saveCartToStorage() {
    const cartItems = document.querySelectorAll("#cartItems .cart-item");
    const items = Array.from(cartItems).map(item => ({
        name: item.querySelector(".cart-item-name").innerText,
        price: parseFloat(item.querySelector(".cart-item-price").innerText.replace("₹", ""))
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function loadCartFromStorage() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Error parsing cart:", e);
        return [];
    }
}

function renderCartFromStorage() {
    const items = loadCartFromStorage();
    const cartItems = document.getElementById("cartItems");
    cartItems.innerHTML = "";
    
    items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");
        
        const nameDiv = document.createElement("div");
        nameDiv.classList.add("cart-item-name");
        nameDiv.innerText = item.name;
        
        const priceDiv = document.createElement("div");
        priceDiv.classList.add("cart-item-price");
        priceDiv.innerText = "₹" + item.price;
        
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("cart-item-remove");
        removeBtn.innerText = "✕";
        
        removeBtn.onclick = function(e) {
            e.stopPropagation();
            if (itemDiv.classList.contains("freebie-item")) {
                showToast("Cannot remove Freebie");
                return;
            }
            const removeSound = document.getElementById("removeItemSound");
            if (removeSound) {
                removeSound.volume = 0.10;
                removeSound.playbackRate = 1.2;
                removeSound.currentTime = 0;
                removeSound.play();
            }
            itemDiv.remove();
            updateCartTotals();
            saveCartToStorage();
        };
        
        itemDiv.appendChild(nameDiv);
        itemDiv.appendChild(priceDiv);
        itemDiv.appendChild(removeBtn);
        cartItems.appendChild(itemDiv);
    });
    
    updateCartTotals();
}

/* ================================
   SCROLL & CART FUNCTIONS
================================ */

function scrollToContact() {
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
}

function toggleCart() {
    document.getElementById("cart").classList.toggle("active");
}

/* ================================
   BLOCK 3: ADD TO CART
================================ */

function addToCart(button) {
    const card = button.closest(".card");
    const productName = card.querySelector("h3").innerText;
    const productImage = card.querySelector(".product-img").src;
    const productPriceText = card.querySelector(".price").innerText;
    const productPrice = parseFloat(productPriceText.replace("₹", ""));

    // Check if product is "Coming Soon"
    if (productName === "Coming Soon..." || productImage.includes("comingsoon.png")) {
        showToast("Coming soon! Hold tight 🌸");
        return; // Stop function - don't add to cart
    }

    const cartItems = document.getElementById("cartItems");

    const item = document.createElement("div");
    item.classList.add("cart-item");

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("cart-item-name");
    nameDiv.innerText = productName;

    const priceDiv = document.createElement("div");
    priceDiv.classList.add("cart-item-price");
    priceDiv.innerText = "₹" + productPrice;

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("cart-item-remove");
    removeBtn.innerText = "✕";

    removeBtn.onclick = function(e) {
        e.stopPropagation();
        if (item.classList.contains("freebie-item")) {
            showToast("Cannot remove Freebie");
            return;
        }
        const removeSound = document.getElementById("removeItemSound");
        if (removeSound) {
            removeSound.volume = 0.10;
            removeSound.playbackRate = 1.2;
            removeSound.currentTime = 0;
            removeSound.play();
        }
        item.remove();
        updateCartTotals();
        saveCartToStorage();
    };

    item.appendChild(nameDiv);
    item.appendChild(priceDiv);
    item.appendChild(removeBtn);
    cartItems.appendChild(item);

    const sound = document.getElementById("addToCartSound");
    if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.20;
        sound.playbackRate = 1.5;
        sound.play();
    }

    button.classList.remove("pop");
    void button.offsetWidth;
    button.classList.add("pop");

    toggleCart();
    updateCartTotals();
    saveCartToStorage();
}

/* ================================
   BLOCK 1: CONSTANTS & MAIN FUNCTION
================================ */

const MIN_ORDER_AMOUNT = 200;
const SHIPPING_COST = 60;

function updateCartTotals() {
    // 1. Calculate Product Total
    let productTotal = 0;
    const cartItems = document.querySelectorAll("#cartItems .cart-item");
    
    cartItems.forEach(item => {
        const priceText = item.querySelector(".cart-item-price").innerText.replace("₹", "");
        productTotal += parseFloat(priceText);
    });

    // 2. Calculate Freebies Logic (CORRECTED)
    // Every ₹200 = 1 Freebie
    let freebieCount = 0;
    if (productTotal >= 200) {
        freebieCount = Math.floor(productTotal / 200);
    }

    // 3. Render Freebies (With x2, x3 display)
    const container = document.getElementById("freebiesContainer");
    
    if (freebieCount > 0) {
        let existingFreebie = container.querySelector(".freebie-item");
        
        if (!existingFreebie) {
            const freebieDiv = document.createElement("div");
            freebieDiv.classList.add("cart-item", "freebie-item");
            freebieDiv.innerHTML = `
                <div class="cart-item-name freebie-label">
                    <span>🎁</span> Freebie x${freebieCount}
                </div>
                <div class="cart-item-price">₹0</div>
            `;
            container.appendChild(freebieDiv);
        } else {
            existingFreebie.querySelector(".freebie-label").innerHTML = `<span>🎁</span> Freebie x${freebieCount}`;
        }
    } else {
        container.innerHTML = "";
    }

    // 4. Calculate Totals & Hide Shipping if empty
    let grandTotal = 0;
    const shippingRow = document.getElementById("shippingRow");
    
    if (productTotal > 0) {
        grandTotal = productTotal + SHIPPING_COST;
        shippingRow.style.display = "flex"; // Show shipping
    } else {
        shippingRow.style.display = "none"; // Hide shipping
    }

    // 5. Update UI Text
    document.getElementById("productTotalDisplay").innerText = "₹" + productTotal;
    document.getElementById("grandTotalDisplay").innerText = "₹" + grandTotal;

    // 6. Check Minimum Order
    const warningEl = document.getElementById("minOrderWarning");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    if (productTotal < MIN_ORDER_AMOUNT) {
        warningEl.style.display = "block";
        warningEl.innerText = "Minimum order amount is ₹200";
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerText = "Place Order";
    } else {
        warningEl.style.display = "none";
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerText = "Place Order";
    }
}/* Prevent inside clicks from closing cart */

document.getElementById("cart").addEventListener("click", function (event) {
event.stopPropagation();
});

/* Outside click closes cart */
document.addEventListener("click", function (event) {
    const cart = document.getElementById("cart");
    const cartButton = event.target.closest('[onclick="toggleCart()"]');

    if (
        cart.classList.contains("active") &&
        !cart.contains(event.target) &&
        !cartButton
    ) {
        cart.classList.remove("active");
    }
});

/* ================================
   DRAG TO CLOSE CART
================================ */

const cart = document.getElementById("cart");
let isDragging = false;
let startX = 0;

cart.addEventListener("mousedown", startDrag);
cart.addEventListener("touchstart", startDrag, { passive: true });

function startDrag(e) {
    if (!cart.classList.contains("active")) return;
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    cart.style.transition = "none";
}

document.addEventListener("mousemove", dragMove);
document.addEventListener("touchmove", dragMove, { passive: true });

function dragMove(e) {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = currentX - startX;
    if (delta > 0) {
        cart.style.right = `-${delta}px`;
    }
}

document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    cart.style.transition = "right 0.4s ease";
    const draggedAmount = Math.abs(parseInt(cart.style.right) || 0);
    if (draggedAmount > 120) {
        cart.classList.remove("active");
    }
    cart.style.right = "";
}

/* ================================
   LOGIN & PLACE ORDER BUTTONS
================================ */

const loginBtn = document.getElementById("loginBtn");
const placeOrderBtn = document.getElementById("placeOrderBtn");

/* Update login button based on localStorage */
function updateLoginButton() {
    const storedUser = localStorage.getItem('noore_user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        // Get first name (everything before first space)
        const firstName = user.name.split(' ')[0];
        loginBtn.textContent = firstName;
        loginBtn.classList.add("logged-in");
    } else {
        loginBtn.textContent = "Login";
        loginBtn.classList.remove("logged-in");
    }
}

// Login Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPhone').value = '';
}

function saveUserDetails() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    
    if (!name || !email || !phone) {
        showToast('Please fill in all fields');
        return;
    }
    
    // Save full name to localStorage
    localStorage.setItem('noore_user', JSON.stringify({ name, email, phone }));
    
    // Get first name (everything before first space)
    const firstName = name.split(' ')[0];
    
    // Update button with first name only
    loginBtn.textContent = firstName;
    loginBtn.classList.add('logged-in');
    
    closeLoginModal();
    showToast('Welcome, ' + firstName + '!');
}

// Handle login button click
function handleLoginClick() {
    if (loginBtn.classList.contains("logged-in")) {
        showLogoutModal();
    } else {
        openLoginModal();
    }
    // Validate email format before saving
    if (email && email.includes('@') && email.includes('.')) {
        const userData = {
            name: name,
            email: email,
            phone: phone
        };
        localStorage.setItem('noore_user', JSON.stringify(userData));
        showToast('Login successful!');
    } else {
        showToast('Invalid email format!');
    }
}

// Logout Confirmation Modal
function showLogoutModal() {
    document.getElementById('logoutModal').style.display = 'flex';
}

function closeLogoutModal() {
    document.getElementById('logoutModal').style.display = 'none';
}

function confirmLogout() {
    localStorage.removeItem('noore_user');
    loginBtn.textContent = "Login";
    loginBtn.classList.remove("logged-in");
    closeLogoutModal();
    showToast('Logged out successfully!');
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Handle Enter key navigation in login modal
document.addEventListener('keydown', function(e) {
    // Only if login modal is open
    if (document.getElementById('loginModal').style.display === 'flex') {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            const nameInput = document.getElementById('userName');
            const emailInput = document.getElementById('userEmail');
            const phoneInput = document.getElementById('userPhone');
            const continueBtn = document.querySelector('#loginModal button[onclick="saveUserDetails()"]');
            
            // If on name field, go to email
            if (document.activeElement === nameInput) {
                emailInput.focus();
            }
            // If on email field, go to phone
            else if (document.activeElement === emailInput) {
                phoneInput.focus();
            }
            // If on phone field or button, click continue
            else if (document.activeElement === phoneInput || document.activeElement === continueBtn) {
                saveUserDetails();
            }
        }
    }
});

// Check login status on page load
document.addEventListener("DOMContentLoaded", () => {
    renderCartFromStorage();
    updateLoginButton();
});

// Place Order button click
placeOrderBtn.addEventListener("click", async () => {
    const cartItemsElements = document.querySelectorAll("#cartItems .cart-item");

    if (cartItemsElements.length === 0) {
        showToast("🛒 Your cart is empty!");
        return;
    }

    const storedUser = localStorage.getItem('noore_user');
    if (!storedUser) {
        showToast('⚠️ Please login first!');
        openLoginModal();
        return;
    }

    const user = JSON.parse(storedUser);

    // Create products array
    const cartItems = Array.from(cartItemsElements).map(item => ({
        name: item.querySelector(".cart-item-name").innerText,
        price: parseFloat(item.querySelector(".cart-item-price").innerText.replace("₹", ""))
    }));

    // Get Product Total from screen
    const productTotalText = document.getElementById("productTotalDisplay").innerText.replace("₹", "");
    const productTotal = parseFloat(productTotalText);
    
    // Calculate Grand Total (Product + Shipping)
    const grandTotal = productTotal + 60;

    // Create product list string for display
    let productList = "";
    cartItems.forEach(item => {
        productList += item.name + " - ₹" + item.price + ", ";
    });
    // Remove last comma
    productList = productList.slice(0, -2);

    // Store data globally
    window.pendingOrder = {
        customer: user.name,
        email: user.email,
        products: cartItems, // Store as array, not JSON string
        productList: productList,
        total: grandTotal
    };

    // Show UPI modal
    showUPIPaymentModal();
});

// UPI Modal Function
function showUPIPaymentModal() {
    const orderData = window.pendingOrder;
    
    let modal = document.getElementById('upiPaymentModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'upiPaymentModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        document.body.appendChild(modal);
    }

    const upiID = 'amitapoojary12345-1@oksbi';
    const amount = orderData.total;
    const upiLink = `upi://pay?pa=${upiID}&pn=NOORE&am=${amount}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 350px; width: 90%;">
            <h3 style="color: var(--maroon); margin-bottom: 15px;">Pay via UPI</h3>
            <p style="font-size: 24px; font-weight: bold; color: var(--maroon); margin-bottom: 20px;">₹${amount}</p>
            <img src="${qrCodeUrl}" alt="UPI QR Code" style="width: 200px; height: 200px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 10px;">
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Scan with any UPI app</p>
            <p style="font-size: 11px; color: #999; margin-bottom: 20px;">UPI ID: ${upiID}</p>
            <button id="confirmPaymentBtn" onclick="confirmUPIPayment()" style="width: 100%; padding: 12px; background: var(--maroon); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-bottom: 10px;">I've Paid ✅</button>
            <button onclick="closeUPIModal()" style="width: 100%; padding: 10px; background: #ddd; color: #333; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">Cancel</button>
        </div>
    `;

    modal.style.display = 'flex';
}

// Global Flag to Prevent Double Submission
let isOrderProcessing = false;

// Confirm Payment Function
function confirmUPIPayment() {
    // Prevent multiple clicks
    if (isOrderProcessing) {
        showToast('Please wait... Order is being processed');
        return;
    }

    const orderData = window.pendingOrder;
    const orderId = 'NOOR-' + Date.now().toString().slice(-6);
    
    let phone = '';
    const storedUser = localStorage.getItem('noore_user');
    if (storedUser) {
        phone = JSON.parse(storedUser).phone || '';
    }
    
    // Format products nicely (not JSON)
    const productsList = orderData.products.map(item => 
        `${item.name} - ₹${item.price}`
    ).join('\n');
    
    // Validate customer email
    if (!orderData.email || !orderData.email.includes('@') || !orderData.email.includes('.')) {
        console.error('Invalid customer email:', orderData.email);
        showToast('Invalid email address! Please login again.');
        return;
    }
    
    // Set processing flag
    isOrderProcessing = true;
    
    // Disable button and show loading state
    const btn = document.getElementById('confirmPaymentBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerText = 'Sending...';
        btn.style.background = '#999';
    }
    
    const templateParams = {
        order_id: orderId,
        customer_name: orderData.customer,
        customer_email: orderData.email,
        customer_phone: phone,
        products: productsList,
        total: orderData.total,
        to_email: orderData.email // ✅ Send to customer
    };
    
    // ✅ Send ONE email to customer
    emailjs.send('service_soy3imv', 'template_qta1mrp', templateParams)
        .then(() => {
            console.log('Order email sent to customer!');
            closeUPIModal();
            showOrderConfirmationPopup(orderId, orderData.total);
        })
        .catch((error) => {
            console.error('Email failed: ', error);
            console.error('Error details:', error.text);
            showToast('Order failed: ' + error.text);
        })
        .finally(() => {
            // Reset processing flag and button state
            isOrderProcessing = false;
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'I\'ve Paid ✅';
                btn.style.background = 'var(--maroon)';
            }
        });
}

// Close UPI Modal
function closeUPIModal() {
    const modal = document.getElementById('upiPaymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Reset processing flag in case user cancels
    isOrderProcessing = false;
}

// Show Order Confirmation Popup
function showOrderConfirmationPopup(orderId, total) {
    let modal = document.getElementById('orderConfirmationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orderConfirmationModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: none; justify-content: center; align-items: center; z-index: 10000;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background: white; padding: 40px 30px; border-radius: 20px; text-align: center; max-width: 400px; width: 90%;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #d4af37, #f0d878); border-radius: 50%; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; font-size: 40px; color: white;">✓</div>
            <h3 style="color: var(--maroon); font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 10px;">Order Placed!</h3>
            <p style="color: #666; margin-bottom: 20px; font-size: 14px;">Thank you for your order</p>
            <div style="background: #f8f5f2; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <p style="font-size: 13px; color: #999; margin-bottom: 5px;">Order ID</p>
                <p style="font-size: 18px; font-weight: 600; color: var(--maroon); margin-bottom: 15px;">${orderId}</p>
                <p style="font-size: 13px; color: #999; margin-bottom: 5px;">Total Amount</p>
                <p style="font-size: 24px; font-weight: 700; color: var(--maroon);">₹${total}</p>
            </div>
            <div style="text-align: left; background: #fff9e6; padding: 15px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid var(--gold);">
                <p style="font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 500;">Next Steps:</p>
                <p style="font-size: 12px; color: #888; margin-bottom: 5px;">1. Send payment screenshot to <a href="https://instagram.com/noor.ebhar" target="_blank" style="color: var(--gold); text-decoration: none; font-weight: 500;">@noor.ebhar</a></p>
                <p style="font-size: 12px; color: #888; margin-bottom: 5px;">2. We'll confirm within 24 hours</p>
                <p style="font-size: 12px; color: #888;">3. Shipping details will be shared</p>
            </div>
            <p style="font-size: 12px; color: #999; margin-bottom: 25px;">Questions? DM us <a href="https://instagram.com/noor.ebhar" target="_blank" style="color: var(--gold); text-decoration: none; font-weight: 500;">@noor.ebhar</a></p>
            <button onclick="closeOrderConfirmationModal()" style="width: 100%; padding: 14px; background: var(--maroon); color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer;">Done</button>
        </div>
    `;

    modal.style.display = 'flex';
}

// Close Order Confirmation Modal
function closeOrderConfirmationModal() {
    const modal = document.getElementById('orderConfirmationModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.getElementById("cartItems").innerHTML = "";
    updateCartTotals();
    localStorage.removeItem(CART_STORAGE_KEY);
}

// Toggle Category Expand
function toggleCategory(button) {
    const productGrid = button.previousElementSibling;
    const extraProducts = productGrid.querySelectorAll('.extra-product');
    const isExpanded = button.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse
        extraProducts.forEach(product => {
            product.style.display = 'none';
        });
        button.classList.remove('expanded');
        button.querySelector('.expand-text').textContent = 'View More';
    } else {
        // Expand
        extraProducts.forEach(product => {
            product.style.display = 'block';
        });
        button.classList.add('expanded');
        button.querySelector('.expand-text').textContent = 'View Less';
    }
}

// Toggle Browse Menu (Click - works on both desktop and mobile)
function toggleBrowseMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    const menu = document.getElementById('browseMenu');
    menu.classList.toggle('show');
}

// Close Browse Menu
function closeBrowseMenu() {
    const menu = document.getElementById('browseMenu');
    menu.classList.remove('show');
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    const menu = document.getElementById('browseMenu');
    const wrapper = document.querySelector('.browse-wrapper');
    
    if (menu && wrapper && !wrapper.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// Close menu on window resize
window.addEventListener('resize', function() {
    const menu = document.getElementById('browseMenu');
    menu.classList.remove('show');
});

// Lightbox Functions
function openLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    lightboxImg.src = imgSrc;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Add ESC key listener
    document.addEventListener('keydown', handleEscKey);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('show');
    document.body.style.overflow = ''; // Enable scrolling
    
    // Remove ESC key listener
    document.removeEventListener('keydown', handleEscKey);
}

// Handle ESC key
function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    }
}

/* ================================
   LIGHTBOX FUNCTIONS WITH ZOOM
================================ */

/* ================================
   LIGHTBOX FUNCTIONS WITH POSITION-BASED ZOOM
================================ */

// Lightbox Variables
let currentZoomLevel = 1;
const maxZoom = 3;
const minZoom = 1.0;
let touchStartDistance = 0;
let lastTouchDistance = 0;
let mouseX = 0;
let mouseY = 0;
let initialImageX = 0;
let initialImageY = 0;

// Open Lightbox
function openLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    lightboxImg.src = imgSrc;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset zoom when opening
    currentZoomLevel = 1.0;
    initialImageX = 0;
    initialImageY = 0;
    lightboxImg.style.transform = `scale(${currentZoomLevel}) translate(${initialImageX}px, ${initialImageY}px)`;
    updateZoomIndicator();
    
    // Add event listeners
    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('wheel', handleWheelZoom, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mousemove', trackMousePosition);
}

// Close Lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
    
    // Remove event listeners
    document.removeEventListener('keydown', handleEscKey);
    document.removeEventListener('wheel', handleWheelZoom);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('mousemove', trackMousePosition);
}

// Track Mouse Position for Desktop Zoom
function trackMousePosition(e) {
    const container = document.querySelector('.lightbox-image-container');
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
}

// Desktop: Mouse Wheel Zoom (Position-Based)
function handleWheelZoom(e) {
    e.preventDefault();
    const lightboxImg = document.getElementById('lightboxImg');
    const container = document.querySelector('.lightbox-image-container');
    const rect = container.getBoundingClientRect();
    
    // Calculate mouse position relative to image
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Calculate zoom origin percentage
    const zoomOriginX = (mouseX / rect.width) * 100;
    const zoomOriginY = (mouseY / rect.height) * 100;
    
    if (e.deltaY < 0) {
        // Scroll up - zoom in
        if (currentZoomLevel < maxZoom) {
            currentZoomLevel += 0.1;
            lightboxImg.style.transformOrigin = `${zoomOriginX}% ${zoomOriginY}%`;
            lightboxImg.style.transform = `scale(${currentZoomLevel}) translate(${initialImageX}px, ${initialImageY}px)`;
            updateZoomIndicator();
        }
    } else {
        // Scroll down - zoom out
        if (currentZoomLevel > minZoom) {
            currentZoomLevel -= 0.1;
            lightboxImg.style.transformOrigin = `${zoomOriginX}% ${zoomOriginY}%`;
            lightboxImg.style.transform = `scale(${currentZoomLevel}) translate(${initialImageX}px, ${initialImageY}px)`;
            updateZoomIndicator();
        }
    }
}

// Mobile: Touch Start (Pinch)
function handleTouchStart(e) {
    if (e.touches.length === 2) {
        // Two fingers - calculate distance
        touchStartDistance = getTouchDistance(e.touches);
        lastTouchDistance = touchStartDistance;
        
        // Calculate center point between fingers
        const container = document.querySelector('.lightbox-image-container');
        const rect = container.getBoundingClientRect();
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        
        mouseX = centerX;
        mouseY = centerY;
    }
}

// Mobile: Touch Move (Pinch)
function handleTouchMove(e) {
    if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches);
        
        // Calculate zoom change
        const zoomChange = currentDistance / lastTouchDistance;
        const newZoom = currentZoomLevel * zoomChange;
        
        // Calculate center point between fingers
        const container = document.querySelector('.lightbox-image-container');
        const rect = container.getBoundingClientRect();
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        
        mouseX = centerX;
        mouseY = centerY;
        
        // Apply zoom with limits (minZoom = 1.0)
        if (newZoom >= minZoom && newZoom <= maxZoom) {
            currentZoomLevel = newZoom;
            const lightboxImg = document.getElementById('lightboxImg');
            const zoomOriginX = (mouseX / rect.width) * 100;
            const zoomOriginY = (mouseY / rect.height) * 100;
            lightboxImg.style.transformOrigin = `${zoomOriginX}% ${zoomOriginY}%`;
            lightboxImg.style.transform = `scale(${currentZoomLevel}) translate(${initialImageX}px, ${initialImageY}px)`;
            updateZoomIndicator();
        }
        
        lastTouchDistance = currentDistance;
    }
}

// Mobile: Touch End
function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        // Reset when pinch ends
        lastTouchDistance = 0;
    }
}

// Helper: Calculate distance between two fingers
function getTouchDistance(touches) {
    const x1 = touches[0].clientX;
    const y1 = touches[0].clientY;
    const x2 = touches[1].clientX;
    const y2 = touches[1].clientY;
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Update Zoom Indicator
function updateZoomIndicator() {
    const indicator = document.getElementById('zoomIndicator');
    if (indicator) {
        indicator.textContent = `Zoom: ${Math.round(currentZoomLevel * 100)}%`;
    }
}

// Handle ESC Key
function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    }
}

// Close lightbox when clicking outside image
document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

// Add click to all product images (excluding Coming Soon)
document.querySelectorAll('.product-img').forEach(img => {
    // Check if image is NOT a "Coming Soon" image
    if (!img.src.includes('comingsoon.png') && !img.src.includes('comingsoon')) {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function() {
            openLightbox(this.src);
        });
    } else {
        // Coming Soon images - no click action
        img.style.cursor = 'default';
    }
});


