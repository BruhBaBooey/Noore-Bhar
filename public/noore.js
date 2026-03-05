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
    const productPriceText = card.querySelector(".price").innerText;
    const productPrice = parseFloat(productPriceText.replace("₹", ""));

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

    // 2. Calculate Freebies Logic
    let freebieCount = 0;
    if (productTotal >= 200) {
        freebieCount = Math.floor((productTotal - 100) / 100);
    }

    // 3. Render Freebies (With x2, x3 display)
    const container = document.getElementById("freebiesContainer");
    
    if (freebieCount > 0) {
        // Check if freebie row already exists
        let existingFreebie = container.querySelector(".freebie-item");
        
        if (!existingFreebie) {
            // Create new freebie row
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
            // Update existing freebie row count
            existingFreebie.querySelector(".freebie-label").innerHTML = `<span>🎁</span> Freebie x${freebieCount}`;
        }
    } else {
        // No freebies, clear container
        container.innerHTML = "";
    }

    // 4. Calculate Grand Total
    const grandTotal = productTotal + SHIPPING_COST;

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
        placeOrderBtn.innerText = "Place Order"; // Always says Place Order
    } else {
        warningEl.style.display = "none";
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerText = "Place Order";
    }
}

/* Prevent inside clicks from closing cart */
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
    // Only get items from #cartItems (exclude freebies container)
    const cartItemsElements = document.querySelectorAll("#cartItems .cart-item");

    if (cartItemsElements.length === 0) {
        showToast("🛒 Your cart is empty!");
        return;
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem('noore_user');
    if (!storedUser) {
        showToast('⚠️ Please login first!');
        openLoginModal();
        return;
    }

    const user = JSON.parse(storedUser);

    // Filter out freebies (only get items from #cartItems)
    const cartItems = Array.from(cartItemsElements).map(item => ({
        name: item.querySelector(".cart-item-name").innerText,
        price: parseFloat(item.querySelector(".cart-item-price").innerText.replace("₹", ""))
    }));

    const products = cartItems.map(item => `${item.name} - ₹${item.price}`).join(', ');
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    // Show UPI payment modal
    showUPIPaymentModal(user.name, user.email, products, total);
});

// UPI Payment Modal Function
function showUPIPaymentModal(customer, email, products, total) {
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
    const upiLink = `upi://pay?pa=${upiID}&pn=NOORÉ&am=${total}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 350px; width: 90%;">
            <h3 style="color: var(--maroon); margin-bottom: 15px;">Pay via UPI</h3>
            <p style="font-size: 24px; font-weight: bold; color: var(--maroon); margin-bottom: 20px;">₹${total}</p>
            <img src="${qrCodeUrl}" alt="UPI QR Code" style="width: 200px; height: 200px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 10px;">
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Scan with any UPI app (Google Pay, PhonePe, Paytm)</p>
            <p style="font-size: 11px; color: #999; margin-bottom: 20px;">UPI ID: ${upiID}</p>
            <button onclick="confirmUPIPayment('${customer}', '${email}', '${products}', ${total})" style="width: 100%; padding: 12px; background: var(--maroon); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-bottom: 10px;">I've Paid</button>
            <button onclick="closeUPIModal()" style="width: 100%; padding: 10px; background: #ddd; color: #333; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">Cancel</button>
        </div>
    `;

    modal.style.display = 'flex';
}

// Close UPI Modal
function closeUPIModal() {
    const modal = document.getElementById('upiPaymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Confirm Payment and Submit Order
function confirmUPIPayment(customer, email, products, total) {
    const orderId = 'NOOR-' + Date.now().toString().slice(-6);
    
    let phone = '';
    const storedUser = localStorage.getItem('noore_user');
    if (storedUser) {
        phone = JSON.parse(storedUser).phone || '';
    }
    
    fetch(
        "https://script.google.com/macros/s/AKfycbwOj4kVPk6oQ2T8aQ0FPqrPFIzHCohKxRQyJgzEBsChCQxGB56HxAn3aI7X0yZFbaUA/exec",
        {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer: customer,
                email: email || '',
                phone: phone,
                products: products,
                total: total
            })
        }
    ).then(() => {
        closeUPIModal();
        showOrderConfirmationPopup(orderId, total);
    }).catch((err) => {
        console.error(err);
        showToast("Order failed: " + err.message);
    });
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
                <p style="font-size: 12px; color: #888; margin-bottom: 5px;">1. Send payment screenshot</p>
                <p style="font-size: 12px; color: #888; margin-bottom: 5px;">2. We'll confirm within 24 hours</p>
                <p style="font-size: 12px; color: #888;">3. Shipping details will be shared</p>
            </div>
            <p style="font-size: 12px; color: #999; margin-bottom: 25px;">Questions? DM us @noor.ebhar</p>
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

// Close lightbox when clicking outside image
document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

// Add click to all product images
document.querySelectorAll('.product-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function() {
        openLightbox(this.src);
    });
});