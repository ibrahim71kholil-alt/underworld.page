/* =====================================================
   UNDERWORLD — MAIN JAVASCRIPT
   Firebase + Products + Cart + Wishlist + Search
===================================================== */


/* =====================================================
   FIREBASE
===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* YOUR FIREBASE CONFIG */

const firebaseConfig = {

    apiKey: "AIzaSyAyU3Vgiwq0k0P-LJi-o5C5wnmbTHxwFYw",

    authDomain:
        "underworld-f7aae.firebaseapp.com",

    projectId:
        "underworld-f7aae",

    storageBucket:
        "underworld-f7aae.firebasestorage.app",

    messagingSenderId:
        "1054711880818",

    appId:
        "1:1054711880818:web:7a97b6fc1413e3b4a6eb"

};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =====================================================
   GLOBAL STATE
===================================================== */

let products = [];

let filteredProducts = [];

let currentCategory = "All";

let currentLanguage =
    localStorage.getItem("underworldLanguage") || "en";

let cart =
    JSON.parse(localStorage.getItem("underworldCart")) || [];

let wishlist =
    JSON.parse(localStorage.getItem("underworldWishlist")) || [];


/* =====================================================
   DOM
===================================================== */

const productsGrid =
    document.getElementById("productsGrid");

const emptyProducts =
    document.getElementById("emptyProducts");

const cartCount =
    document.getElementById("cartCount");

const wishlistCount =
    document.getElementById("wishlistCount");

const cartItems =
    document.getElementById("cartItems");

const cartEmpty =
    document.getElementById("cartEmpty");

const cartTotal =
    document.getElementById("cartTotal");

const wishlistItems =
    document.getElementById("wishlistItems");

const currentYear =
    document.getElementById("currentYear");


/* =====================================================
   DEMO PRODUCTS
   These show if Firebase has no products yet.
===================================================== */

const demoProducts = [

    {
        id: "demo-women-1",

        name: "Elegant Minimal Dress",

        banglaName:
            "এলিগ্যান্ট মিনিমাল ড্রেস",

        category: "Women",

        price: 1890,

        discountPrice: 1490,

        stock: 12,

        stockStatus: "In Stock",

        sizes: ["S", "M", "L", "XL"],

        colors: ["Black", "Beige"],

        images: [

            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85"

        ],

        description:
            "A premium everyday dress designed for a confident modern look.",

        banglaDescription:
            "আধুনিক ও আত্মবিশ্বাসী লুকের জন্য প্রিমিয়াম মানের ড্রেস।",

        popular: true

    },


    {
        id: "demo-men-1",

        name: "Premium Oversized Shirt",

        banglaName:
            "প্রিমিয়াম ওভারসাইজড শার্ট",

        category: "Men",

        price: 1290,

        discountPrice: 990,

        stock: 25,

        stockStatus: "In Stock",

        sizes: ["M", "L", "XL", "XXL"],

        colors: ["Black", "White", "Brown"],

        images: [

            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=85"

        ],

        description:
            "Relaxed oversized silhouette with a premium fashion finish.",

        banglaDescription:
            "প্রিমিয়াম ফ্যাশন ফিনিশসহ আরামদায়ক ওভারসাইজড শার্ট।",

        popular: true

    },


    {
        id: "demo-sports-1",

        name: "Performance Training Set",

        banglaName:
            "পারফরম্যান্স ট্রেনিং সেট",

        category: "Sports",

        price: 1590,

        discountPrice: 1290,

        stock: 18,

        stockStatus: "In Stock",

        sizes: ["S", "M", "L", "XL"],

        colors: ["Black", "Grey"],

        images: [

            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85"

        ],

        description:
            "Lightweight performance wear made for training and movement.",

        banglaDescription:
            "ট্রেনিং ও শরীরচর্চার জন্য হালকা ও আরামদায়ক পারফরম্যান্স পোশাক।",

        popular: true

    },


    {
        id: "demo-women-2",

        name: "Classic Blazer",

        banglaName:
            "ক্লাসিক ব্লেজার",

        category: "Women",

        price: 2490,

        discountPrice: 2190,

        stock: 8,

        stockStatus: "Low Stock",

        sizes: ["S", "M", "L"],

        colors: ["Cream", "Black"],

        images: [

            "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85"

        ],

        description:
            "Timeless blazer with a clean premium silhouette.",

        banglaDescription:
            "পরিপাটি ও প্রিমিয়াম লুকের জন্য ক্লাসিক ব্লেজার।",

        popular: true

    },


    {
        id: "demo-men-2",

        name: "Urban Cargo Pants",

        banglaName:
            "আরবান কার্গো প্যান্ট",

        category: "Men",

        price: 1790,

        discountPrice: 1490,

        stock: 15,

        stockStatus: "In Stock",

        sizes: ["30", "32", "34", "36"],

        colors: ["Black", "Olive"],

        images: [

            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85"

        ],

        description:
            "Modern cargo pants with a relaxed urban fit.",

        banglaDescription:
            "আধুনিক আরবান লুকের জন্য আরামদায়ক কার্গো প্যান্ট।",

        popular: true

    },


    {
        id: "demo-sports-2",

        name: "Essential Training Tee",

        banglaName:
            "এসেনশিয়াল ট্রেনিং টি-শার্ট",

        category: "Sports",

        price: 790,

        discountPrice: 650,

        stock: 35,

        stockStatus: "In Stock",

        sizes: ["S", "M", "L", "XL"],

        colors: ["Black", "White"],

        images: [

            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85"

        ],

        description:
            "Lightweight everyday training t-shirt.",

        banglaDescription:
            "প্রতিদিনের ট্রেনিংয়ের জন্য হালকা ও আরামদায়ক টি-শার্ট।",

        popular: true

    }

];


/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    currentYear.textContent =
        new Date().getFullYear();

    setLanguage(currentLanguage);

    updateCounts();

    setupEvents();

    setupHero();

    await loadProducts();

    renderProducts();

    renderCart();

    renderWishlist();

    setTimeout(() => {

        document
            .getElementById("pageLoader")
            ?.classList.add("hide");

    }, 600);

});


/* =====================================================
   FIREBASE PRODUCT LOAD
===================================================== */

async function loadProducts() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "products")
            );

        const firebaseProducts = [];

        snapshot.forEach((item) => {

            firebaseProducts.push({

                id: item.id,

                ...item.data()

            });

        });


        /*
          Firebase products available:
          use them.

          Otherwise demo products.
        */

        if (firebaseProducts.length > 0) {

            products = firebaseProducts;

        } else {

            products = demoProducts;

        }

    } catch (error) {

        console.error(
            "Firebase product error:",
            error
        );

        products = demoProducts;

        showToast(
            "Demo products loaded. Firebase connection needs checking."
        );

    }


    filteredProducts =
        [...products];

}


/* =====================================================
   NORMALIZE PRODUCT
===================================================== */

function normalizeProduct(product) {

    return {

        id: product.id,

        name:
            product.name ||
            product.englishName ||
            "UNDERWORLD Product",

        banglaName:
            product.banglaName ||
            product.banglaProductName ||
            product.name ||
            "পণ্য",

        category:
            product.category ||
            "Men",

        price:
            Number(
                product.price ??
                product.regularPrice ??
                0
            ),

        discountPrice:
            Number(
                product.discountPrice ??
                product.offerPrice ??
                product.price ??
                product.regularPrice ??
                0
            ),

        stock:
            Number(
                product.stock ??
                product.stockQuantity ??
                0
            ),

        stockStatus:
            product.stockStatus ||
            (Number(product.stock || 0) > 0
                ? "In Stock"
                : "Out of Stock"),

        sizes:
            Array.isArray(product.sizes)
                ? product.sizes
                : [],

        colors:
            Array.isArray(product.colors)
                ? product.colors
                : [],

        images:
            Array.isArray(product.images)
                ? product.images
                : [
                    product.image ||
                    product.imageUrl ||
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85"
                ],

        description:
            product.description ||
            "Premium UNDERWORLD collection.",

        banglaDescription:
            product.banglaDescription ||
            product.banglaDetails ||
            "UNDERWORLD-এর প্রিমিয়াম কালেকশন।",

        popular:
            product.popular !== false

    };

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

    if (!productsGrid) return;

    let list =
        products.map(normalizeProduct);


    /* CATEGORY */

    if (currentCategory !== "All") {

        list =
            list.filter(
                product =>
                    product.category.toLowerCase() ===
                    currentCategory.toLowerCase()
            );

    }


    filteredProducts = list;


    if (list.length === 0) {

        productsGrid.innerHTML = "";

        emptyProducts.classList.remove("hidden");

        return;

    }


    emptyProducts.classList.add("hidden");


    productsGrid.innerHTML =
        list.map(
            (product, index) =>
                productCardHTML(
                    product,
                    index
                )
        ).join("");


    attachProductEvents();

}


/* =====================================================
   PRODUCT CARD
===================================================== */

function productCardHTML(product, index) {

    const liked =
        wishlist.includes(product.id);

    const hasDiscount =
        product.discountPrice < product.price;

    const discountPercent =
        hasDiscount
            ? Math.round(
                (
                    (product.price -
                    product.discountPrice)
                    /
                    product.price
                ) * 100
            )
            : 0;


    const productName =
        currentLanguage === "bn"
            ? product.banglaName
            : product.name;


    return `

        <article
            class="product-card"
            style="animation-delay:${index * 70}ms"
            data-id="${escapeHTML(product.id)}">

            <div class="product-image">

                <img
                    src="${escapeHTML(product.images[0])}"
                    alt="${escapeHTML(productName)}"
                    loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85'">


                ${
                    hasDiscount
                    ?
                    `
                    <span class="product-badge">
                        SALE
                    </span>

                    <span class="product-badge discount">
                        -${discountPercent}%
                    </span>
                    `
                    :
                    ""
                }


                ${
                    product.stock <= 5
                    ?
                    `
                    <span
                        class="product-badge"
                        style="top:${hasDiscount ? "83px" : "13px"}">
                        LOW STOCK
                    </span>
                    `
                    :
                    ""
                }


                <button
                    class="
                        product-heart
                        ${liked ? "liked" : ""}
                    "
                    data-wishlist="${escapeHTML(product.id)}">

                    <i class="
                        ${liked
                            ? "fa-solid"
                            : "fa-regular"}
                        fa-heart
                    "></i>

                </button>


                <a
                    href="product.html?id=${encodeURIComponent(product.id)}"
                    class="product-view">

                    VIEW PRODUCT
                    <i class="fa-solid fa-arrow-right"></i>

                </a>

            </div>


            <div class="product-info">

                <span class="product-category">
                    ${escapeHTML(product.category)}
                </span>

                <h3 class="product-name">
                    ${escapeHTML(productName)}
                </h3>


                <div class="product-price">

                    <span class="current-price">
                        ৳${formatNumber(
                            product.discountPrice
                        )}
                    </span>

                    ${
                        hasDiscount
                        ?
                        `
                        <span class="old-price">
                            ৳${formatNumber(
                                product.price
                            )}
                        </span>
                        `
                        :
                        ""
                    }

                </div>


                <div class="
                    product-stock
                    ${
                        product.stock > 0
                            ? "in-stock"
                            : "out-stock"
                    }
                ">

                    ${
                        product.stock > 0
                            ? `● ${product.stockStatus}`
                            : "● Out of Stock"
                    }

                </div>

            </div>

        </article>

    `;

}


/* =====================================================
   PRODUCT EVENTS
===================================================== */

function attachProductEvents() {

    document
        .querySelectorAll("[data-wishlist]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    toggleWishlist(
                        button.dataset.wishlist
                    );

                }
            );

        });

}


/* =====================================================
   CATEGORY
===================================================== */

function shopCategory(category) {

    currentCategory = category;

    document
        .querySelectorAll(".filter-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category === category
            );

        });


    renderProducts();

    document
        .getElementById("popular")
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* Make available to HTML onclick */

window.shopCategory =
    shopCategory;


/* =====================================================
   FILTER
===================================================== */

function filterProducts(category) {

    currentCategory = category;

    document
        .querySelectorAll(".filter-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category === category
            );

        });

    renderProducts();

}


/* =====================================================
   SEARCH
===================================================== */

function searchProducts(query) {

    const text =
        query.trim().toLowerCase();


    if (!text) {

        renderProducts();

        return;

    }


    let list =
        products.map(normalizeProduct);


    list =
        list.filter(product => {

            const searchable = [

                product.name,

                product.banglaName,

                product.category,

                product.description,

                ...(product.colors || []),

                ...(product.sizes || [])

            ]
            .join(" ")
            .toLowerCase();


            return searchable.includes(text);

        });


    filteredProducts = list;


    if (list.length === 0) {

        productsGrid.innerHTML = "";

        emptyProducts.classList.remove("hidden");

        return;

    }


    emptyProducts.classList.add("hidden");


    productsGrid.innerHTML =
        list.map(
            (product, index) =>
                productCardHTML(
                    product,
                    index
                )
        ).join("");


    attachProductEvents();


    document
        .getElementById("popular")
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   CART
===================================================== */

function addToCart(productId, options = {}) {

    const product =
        products
            .map(normalizeProduct)
            .find(
                item =>
                    item.id === productId
            );


    if (!product) {

        showToast("Product not found");

        return;

    }


    if (product.stock <= 0) {

        showToast("Product is out of stock");

        return;

    }


    const size =
        options.size ||
        product.sizes?.[0] ||
        "";

    const color =
        options.color ||
        product.colors?.[0] ||
        "";


    const existing =
        cart.find(
            item =>
                item.id === productId &&
                item.size === size &&
                item.color === color
        );


    if (existing) {

        if (existing.quantity >= product.stock) {

            showToast("Stock limit reached");

            return;

        }

        existing.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            banglaName:
                product.banglaName,

            price:
                product.discountPrice,

            image:
                product.images[0],

            size,

            color,

            quantity: 1

        });

    }


    saveCart();

    renderCart();

    updateCounts();

    showToast(
        currentLanguage === "bn"
            ? "কার্টে যোগ হয়েছে"
            : "Added to cart"
    );

}


/* Available globally for product.html */

window.addToCart =
    addToCart;


/* =====================================================
   REMOVE CART
===================================================== */

function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

    renderCart();

    updateCounts();

}


/* =====================================================
   UPDATE QUANTITY
===================================================== */

function changeQuantity(index, amount) {

    if (!cart[index]) return;


    cart[index].quantity += amount;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    saveCart();

    renderCart();

    updateCounts();

}


/* =====================================================
   RENDER CART
===================================================== */

function renderCart() {

    if (!cartItems) return;


    if (cart.length === 0) {

        cartItems.innerHTML = "";

        cartEmpty.style.display = "flex";

        document
            .getElementById("checkoutBtn")
            ?.setAttribute(
                "disabled",
                "disabled"
            );

        cartTotal.textContent = "৳0";

        return;

    }


    cartEmpty.style.display = "none";

    document
        .getElementById("checkoutBtn")
        ?.removeAttribute("disabled");


    cartItems.innerHTML =
        cart.map(
            (item, index) => `

                <div class="cart-item">

                    <img
                        src="${escapeHTML(item.image)}"
                        alt="${escapeHTML(item.name)}">

                    <div>

                        <h4>
                            ${
                                currentLanguage === "bn"
                                ? escapeHTML(
                                    item.banglaName ||
                                    item.name
                                )
                                : escapeHTML(
                                    item.name
                                )
                            }
                        </h4>

                        <div class="cart-item-price">
                            ৳${formatNumber(item.price)}
                        </div>

                        ${
                            item.size
                            ?
                            `
                            <small>
                                Size: ${escapeHTML(item.size)}
                            </small>
                            `
                            :
                            ""
                        }

                        ${
                            item.color
                            ?
                            `
                            <small>
                                Color: ${escapeHTML(item.color)}
                            </small>
                            `
                            :
                            ""
                        }

                        <div class="quantity-box">

                            <button
                                onclick="changeQuantity(${index}, -1)">
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                onclick="changeQuantity(${index}, 1)">
                                +
                            </button>

                        </div>

                    </div>


                    <button
                        class="cart-remove"
                        onclick="removeFromCart(${index})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            `
        ).join("");


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                (
                    Number(item.price) *
                    Number(item.quantity)
                ),
            0
        );


    cartTotal.textContent =
        "৳" + formatNumber(total);

}


/* Make functions available */

window.changeQuantity =
    changeQuantity;

window.removeFromCart =
    removeFromCart;


/* =====================================================
   SAVE CART
===================================================== */

function saveCart() {

    localStorage.setItem(
        "underworldCart",
        JSON.stringify(cart)
    );

}


/* =====================================================
   WISHLIST
===================================================== */

function toggleWishlist(productId) {

    const index =
        wishlist.indexOf(productId);


    if (index >= 0) {

        wishlist.splice(index, 1);

        showToast(
            currentLanguage === "bn"
                ? "Wishlist থেকে সরানো হয়েছে"
                : "Removed from wishlist"
        );

    } else {

        wishlist.push(productId);

        showToast(
            currentLanguage === "bn"
                ? "Wishlist-এ যোগ হয়েছে"
                : "Added to wishlist"
        );

    }


    localStorage.setItem(
        "underworldWishlist",
        JSON.stringify(wishlist)
    );


    updateCounts();

    renderProducts();

    renderWishlist();

}


/* =====================================================
   WISHLIST RENDER
===================================================== */

function renderWishlist() {

    if (!wishlistItems) return;


    const list =
        products
            .map(normalizeProduct)
            .filter(
                product =>
                    wishlist.includes(product.id)
            );


    if (list.length === 0) {

        wishlistItems.innerHTML = `

            <div class="cart-empty">

                <i class="fa-regular fa-heart"></i>

                <h3>
                    Your wishlist is empty
                </h3>

                <p>
                    Save your favourite products here.
                </p>

            </div>

        `;

        return;

    }


    wishlistItems.innerHTML =
        list.map(product => {

            const name =
                currentLanguage === "bn"
                    ? product.banglaName
                    : product.name;


            return `

                <div class="wishlist-item">

                    <img
                        src="${escapeHTML(product.images[0])}"
                        alt="${escapeHTML(name)}">


                    <div>

                        <h4>
                            ${escapeHTML(name)}
                        </h4>

                        <strong>
                            ৳${formatNumber(
                                product.discountPrice
                            )}
                        </strong>

                        <br>

                        <button
                            onclick="removeWishlist('${escapeHTML(product.id)}')">

                            Remove

                        </button>

                    </div>


                    <a
                        href="product.html?id=${encodeURIComponent(product.id)}">

                        <i class="fa-solid fa-arrow-right"></i>

                    </a>

                </div>

            `;

        }).join("");

}


/* =====================================================
   REMOVE WISHLIST
===================================================== */

function removeWishlist(productId) {

    wishlist =
        wishlist.filter(
            id => id !== productId
        );

    localStorage.setItem(
        "underworldWishlist",
        JSON.stringify(wishlist)
    );

    updateCounts();

    renderWishlist();

    renderProducts();

}


/* Global */

window.removeWishlist =
    removeWishlist;


/* =====================================================
   COUNTS
===================================================== */

function updateCounts() {

    const totalCart =
        cart.reduce(
            (sum, item) =>
                sum + Number(item.quantity),
            0
        );


    cartCount.textContent =
        totalCart;

    wishlistCount.textContent =
        wishlist.length;

}


/* =====================================================
   CHECKOUT
===================================================== */

function openCheckout() {

    if (cart.length === 0) {

        showToast(
            currentLanguage === "bn"
                ? "আপনার কার্ট খালি"
                : "Your cart is empty"
        );

        return;

    }


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    document
        .getElementById("checkoutItemsCount")
        .textContent =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    document
        .getElementById("checkoutTotal")
        .textContent =
        "৳" + formatNumber(total);


    openModal(
        "checkoutModal"
    );

}


/* =====================================================
   PLACE ORDER
===================================================== */

async function placeOrder(event) {

    event.preventDefault();


    if (cart.length === 0) {

        showToast("Your cart is empty");

        return;

    }


    const button =
        event.target.querySelector(
            'button[type="submit"]'
        );


    button.disabled = true;

    button.innerHTML =
        "PROCESSING...";


    const order = {

        customer: {

            name:
                document
                .getElementById(
                    "customerName"
                )
                .value
                .trim(),

            phone:
                document
                .getElementById(
                    "customerPhone"
                )
                .value
                .trim(),

            address:
                document
                .getElementById(
                    "customerAddress"
                )
                .value
                .trim(),

            district:
                document
                .getElementById(
                    "customerDistrict"
                )
                .value
                .trim()

        },

        paymentMethod:
            document
            .getElementById(
                "paymentMethod"
            )
            .value,

        items:
            cart,

        total:
            cart.reduce(
                (sum, item) =>
                    sum +
                    item.price *
                    item.quantity,
                0
            ),

        status:
            "Pending",

        createdAt:
            serverTimestamp()

    };


    try {

        const orderRef =
            await addDoc(
                collection(db, "orders"),
                order
            );


        console.log(
            "Order created:",
            orderRef.id
        );


        cart = [];

        saveCart();

        renderCart();

        updateCounts();

        closeModal(
            "checkoutModal"
        );


        event.target.reset();


        showToast(
            currentLanguage === "bn"
                ? "অর্ডার সফলভাবে নেওয়া হয়েছে"
                : "Order placed successfully"
        );


        closeDrawer();

    } catch (error) {

        console.error(error);

        showToast(
            "Order failed. Please check Firebase."
        );

    }


    button.disabled = false;

    button.innerHTML =
        `
        PLACE ORDER
        <i class="fa-solid fa-check"></i>
        `;

}


/* =====================================================
   LANGUAGE
===================================================== */

function setLanguage(language) {

    currentLanguage = language;

    localStorage.setItem(
        "underworldLanguage",
        language
    );


    document.documentElement
        .setAttribute(
            "lang",
            language === "bn"
                ? "bn"
                : "en"
        );


    document
        .querySelectorAll("[data-en][data-bn]")
        .forEach(element => {

            element.textContent =
                language === "bn"
                    ? element.dataset.bn
                    : element.dataset.en;

        });


    const languageText =
        document.getElementById(
            "languageText"
        );


    if (languageText) {

        languageText.textContent =
            language === "en"
                ? "বাংলা"
                : "English";

    }


    if (products.length) {

        renderProducts();

        renderCart();

        renderWishlist();

    }

}


/* =====================================================
   HERO SLIDER
===================================================== */

let currentSlide = 0;

let heroTimer;


function setupHero() {

    const slides =
        document.querySelectorAll(
            ".hero-slide"
        );

    const dots =
        document.querySelectorAll(
            ".hero-dot"
        );


    if (!slides.length) return;


    function showSlide(index) {

        currentSlide =
            (index + slides.length) %
            slides.length;


        slides.forEach(
            (slide, i) => {

                slide.classList.toggle(
                    "active",
                    i === currentSlide
                );

            }
        );


        dots.forEach(
            (dot, i) => {

                dot.classList.toggle(
                    "active",
                    i === currentSlide
                );

            }
        );

    }


    function nextSlide() {

        showSlide(
            currentSlide + 1
        );

    }


    function prevSlide() {

        showSlide(
            currentSlide - 1
        );

    }


    document
        .getElementById("heroNext")
        ?.addEventListener(
            "click",
            () => {

                nextSlide();

                resetHeroTimer();

            }
        );


    document
        .getElementById("heroPrev")
        ?.addEventListener(
            "click",
            () => {

                prevSlide();

                resetHeroTimer();

            }
        );


    dots.forEach(
        dot => {

            dot.addEventListener(
                "click",
                () => {

                    showSlide(
                        Number(
                            dot.dataset.slide
                        )
                    );

                    resetHeroTimer();

                }
            );

        }
    );


    function resetHeroTimer() {

        clearInterval(heroTimer);

        heroTimer =
            setInterval(
                nextSlide,
                5500
            );

    }


    showSlide(0);

    resetHeroTimer();

}


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {


    /* SEARCH */

    document
        .getElementById("searchBtn")
        ?.addEventListener(
            "click",
            () =>
                openSearch()
        );


    document
        .getElementById("closeSearch")
        ?.addEventListener(
            "click",
            () =>
                closeSearch()
        );


    document
        .getElementById("searchInput")
        ?.addEventListener(
            "input",
            event =>
                searchProducts(
                    event.target.value
                )
        );


    /* CART */

    document
        .getElementById("cartBtn")
        ?.addEventListener(
            "click",
            () =>
                openDrawer(
                    "cartDrawer"
                )
        );


    document
        .getElementById("closeCart")
        ?.addEventListener(
            "click",
            closeDrawer
        );


    document
        .getElementById("drawerOverlay")
        ?.addEventListener(
            "click",
            closeDrawer
        );


    /* WISHLIST */

    document
        .getElementById("wishlistBtn")
        ?.addEventListener(
            "click",
            () =>
                openDrawer(
                    "wishlistDrawer"
                )
        );


    document
        .getElementById("closeWishlist")
        ?.addEventListener(
            "click",
            closeDrawer
        );


    /* ACCOUNT */

    document
        .getElementById("accountBtn")
        ?.addEventListener(
            "click",
            () =>
                openModal(
                    "accountModal"
                )
        );


    document
        .getElementById("closeAccount")
        ?.addEventListener(
            "click",
            () =>
                closeModal(
                    "accountModal"
                )
        );


    document
        .getElementById("continueShopping")
        ?.addEventListener(
            "click",
            () =>
                closeModal(
                    "accountModal"
                )
        );


    /* CHECKOUT */

    document
        .getElementById("checkoutBtn")
        ?.addEventListener(
            "click",
            openCheckout
        );


    document
        .getElementById("closeCheckout")
        ?.addEventListener(
            "click",
            () =>
                closeModal(
                    "checkoutModal"
                )
        );


    document
        .getElementById("checkoutForm")
        ?.addEventListener(
            "submit",
            placeOrder
        );


    /* LANGUAGE */

    document
        .getElementById("languageBtn")
        ?.addEventListener(
            "click",
            () => {

                setLanguage(
                    currentLanguage === "en"
                        ? "bn"
                        : "en"
                );

            }
        );


    /* FILTERS */

    document
        .querySelectorAll(".filter-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        filterProducts(
                            button.dataset.category
                        )
                );

            }
        );


    /* VIEW ALL */

    document
        .getElementById("viewAllBtn")
        ?.addEventListener(
            "click",
            () => {

                currentCategory = "All";

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(button => {

                        button.classList.toggle(
                            "active",
                            button.dataset.category === "All"
                        );

                    });

                renderProducts();

            }
        );


    document
        .getElementById("loadMoreBtn")
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById("popular")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );


    /* MOBILE */

    document
        .getElementById("mobileMenuBtn")
        ?.addEventListener(
            "click",
            () =>
                document
                    .getElementById("mobileMenu")
                    .classList.add("open")
        );


    document
        .getElementById("mobileClose")
        ?.addEventListener(
            "click",
            () =>
                document
                    .getElementById("mobileMenu")
                    .classList.remove("open")
        );


    document
        .querySelectorAll(".mobile-menu a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () =>
                    document
                        .getElementById("mobileMenu")
                        .classList.remove("open")
            );

        });


    /* HEADER SCROLL */

    window.addEventListener(
        "scroll",
        () => {

            document
                .getElementById("header")
                ?.classList.toggle(
                    "scrolled",
                    window.scrollY > 20
                );

        }
    );


    /* ESCAPE */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeSearch();

                closeDrawer();

                closeModal(
                    "accountModal"
                );

                closeModal(
                    "checkoutModal"
                );

            }

        }
    );

}


/* =====================================================
   SEARCH OPEN/CLOSE
===================================================== */

function openSearch() {

    const panel =
        document.getElementById(
            "searchPanel"
        );

    panel.classList.add("open");

    document.body.classList.add(
        "no-scroll"
    );

    setTimeout(
        () =>
            document
                .getElementById("searchInput")
                ?.focus(),
        250
    );

}


function closeSearch() {

    document
        .getElementById("searchPanel")
        ?.classList.remove("open");

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =====================================================
   DRAWER
===================================================== */

function openDrawer(id) {

    closeDrawer();

    document
        .getElementById(id)
        ?.classList.add("open");

    document
        .getElementById("drawerOverlay")
        ?.classList.add("open");

    document.body.classList.add(
        "no-scroll"
    );

}


function closeDrawer() {

    document
        .querySelectorAll(".side-drawer")
        .forEach(
            drawer =>
                drawer.classList.remove("open")
        );

    document
        .getElementById("drawerOverlay")
        ?.classList.remove("open");

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =====================================================
   MODAL
===================================================== */

function openModal(id) {

    document
        .getElementById(id)
        ?.classList.add("open");

    document.body.classList.add(
        "no-scroll"
    );

}


function closeModal(id) {

    document
        .getElementById(id)
        ?.classList.remove("open");

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById("toast");

    const text =
        document.getElementById(
            "toastMessage"
        );


    if (!toast || !text) return;


    text.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () =>
                toast.classList.remove(
                    "show"
                ),
            2500
        );

}


/* =====================================================
   HELPERS
===================================================== */

function formatNumber(number) {

    return Number(number || 0)
        .toLocaleString("en-BD");

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            }[character])
        );

}
