import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================
   YOUR FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyBgcjFRNOfOdg4ntCjB6LwA8J-fvxPfrPM",
  authDomain: "underworld-f7aae.firebaseapp.com",
  projectId: "underworld-f7aae",
  storageBucket: "underworld-f7aae.firebasestorage.app",
  messagingSenderId: "1054711880818",
  appId: "1:1054711880818:web:4ce58efeb3dbd3374ab6eb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================
   GLOBAL DATA
========================= */

let products = [];
let cart = JSON.parse(localStorage.getItem("underworldCart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("underworldWishlist") || "[]");
let currentFilter = "All";
let currentProduct = null;
let selectedSize = "";
let selectedColor = "";


/* =========================
   DOM
========================= */

const productsGrid = document.getElementById("productsGrid");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts(){

  try{

    const snapshot = await getDocs(collection(db,"products"));

    products = [];

    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    renderProducts();

  }catch(error){

    console.error(error);

    productsGrid.innerHTML = `
      <div class="loading">
        Unable to load products.
      </div>
    `;
  }
}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts(){

  let filtered = products.filter(product => {

    if(currentFilter === "All"){
      return true;
    }

    return String(product.category || "").toLowerCase()
      === currentFilter.toLowerCase();

  });


  const search = document.getElementById("searchInput")?.value
    ?.trim()
    .toLowerCase();

  if(search){

    filtered = filtered.filter(product => {

      return String(product.name || "").toLowerCase().includes(search)
        || String(product.category || "").toLowerCase().includes(search)
        || String(product.tags || "").toLowerCase().includes(search);

    });

  }


  if(filtered.length === 0){

    productsGrid.innerHTML = `
      <div class="loading">
        No products found.
      </div>
    `;

    return;
  }


  productsGrid.innerHTML = filtered.map(product => {

    const price = Number(product.discountPrice || product.price || 0);
    const oldPrice = Number(product.price || 0);

    const discount =
      product.discountPrice && oldPrice > price
      ? Math.round((1 - price / oldPrice) * 100)
      : 0;

    const image =
      product.images?.[0]
      || product.image
      || "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80";


    return `
      <article class="product-card" data-id="${product.id}">

        ${discount > 0
          ? `<span class="product-badge">${discount}% OFF</span>`
          : ""
        }

        <button class="wishlist" data-wishlist="${product.id}">
          ${wishlist.includes(product.id) ? "♥" : "♡"}
        </button>

        <div class="product-image">
          <img
            src="${image}"
            alt="${escapeHTML(product.name || "Product")}"
            loading="lazy"
          >
        </div>

        <div class="product-info">

          <span class="product-category">
            ${escapeHTML(product.category || "")}
          </span>

          <h3>${escapeHTML(product.name || "Untitled Product")}</h3>

          <div class="price">
            ৳${price.toLocaleString()}

            ${
              discount > 0
              ? `<span class="old-price">৳${oldPrice.toLocaleString()}</span>`
              : ""
            }
          </div>

        </div>

      </article>
    `;

  }).join("");


  document.querySelectorAll(".product-card").forEach(card => {

    card.addEventListener("click", e => {

      if(e.target.closest(".wishlist")) return;

      const id = card.dataset.id;

      const product = products.find(p => p.id === id);

      if(product){
        openProduct(product);
      }

    });

  });


  document.querySelectorAll("[data-wishlist]").forEach(button => {

    button.addEventListener("click", e => {

      e.stopPropagation();

      toggleWishlist(button.dataset.wishlist);

    });

  });

}


/* =========================
   WISHLIST
========================= */

function toggleWishlist(id){

  if(wishlist.includes(id)){

    wishlist = wishlist.filter(item => item !== id);

    showToast("Removed from wishlist");

  }else{

    wishlist.push(id);

    showToast("Added to wishlist");

  }

  localStorage.setItem(
    "underworldWishlist",
    JSON.stringify(wishlist)
  );

  renderProducts();
}


/* =========================
   PRODUCT DETAILS
========================= */

function openProduct(product){

  currentProduct = product;

  selectedSize = "";
  selectedColor = "";

  const modal = document.getElementById("productModal");
  const details = document.getElementById("productDetails");

  const images =
    product.images?.length
      ? product.images
      : [product.image];


  const price =
    Number(product.discountPrice || product.price || 0);

  const oldPrice =
    Number(product.price || 0);


  const sizes =
    Array.isArray(product.sizes)
      ? product.sizes
      : String(product.sizes || "")
          .split(",")
          .map(x => x.trim())
          .filter(Boolean);


  const colors =
    Array.isArray(product.colors)
      ? product.colors
      : String(product.colors || "")
          .split(",")
          .map(x => x.trim())
          .filter(Boolean);


  details.innerHTML = `

    <div class="product-details">

      <div class="detail-gallery">

        ${images.map(image => `
          <img src="${image}" alt="${escapeHTML(product.name || "")}">
        `).join("")}

      </div>


      <div class="detail-content">

        <span class="product-category">
          ${escapeHTML(product.category || "")}
        </span>

        <h2>
          ${escapeHTML(product.name || "")}
        </h2>

        <div class="detail-price">

          ৳${price.toLocaleString()}

          ${
            oldPrice > price
            ? `<span class="old-price">
                ৳${oldPrice.toLocaleString()}
              </span>`
            : ""
          }

        </div>


        <p class="detail-description">
          ${escapeHTML(product.description || "Premium quality product from UNDERWORLD.")}
        </p>


        ${
          sizes.length
          ? `
            <div class="option-title">SELECT SIZE</div>

            <div class="option-list">
              ${sizes.map(size => `
                <button class="option-btn size-option"
                  data-size="${escapeHTML(size)}">
                  ${escapeHTML(size)}
                </button>
              `).join("")}
            </div>
          `
          : ""
        }


        ${
          colors.length
          ? `
            <div class="option-title">SELECT COLOR</div>

            <div class="option-list">
              ${colors.map(color => `
                <button class="option-btn color-option"
                  data-color="${escapeHTML(color)}">
                  ${escapeHTML(color)}
                </button>
              `).join("")}
            </div>
          `
          : ""
        }


        <div class="option-title">
          STOCK:
          ${
            Number(product.stock || 0) > 0
            ? `${product.stock} AVAILABLE`
            : "OUT OF STOCK"
          }
        </div>


        <button
          id="addToCartBtn"
          class="primary-btn"
          style="width:100%;margin-top:20px"
          ${Number(product.stock || 0) <= 0 ? "disabled" : ""}
        >
          ADD TO CART
        </button>

      </div>

    </div>

  `;


  modal.classList.add("open");


  document.querySelectorAll(".size-option").forEach(button => {

    button.addEventListener("click", () => {

      selectedSize = button.dataset.size;

      document.querySelectorAll(".size-option")
        .forEach(x => x.classList.remove("selected"));

      button.classList.add("selected");

    });

  });


  document.querySelectorAll(".color-option").forEach(button => {

    button.addEventListener("click", () => {

      selectedColor = button.dataset.color;

      document.querySelectorAll(".color-option")
        .forEach(x => x.classList.remove("selected"));

      button.classList.add("selected");

    });

  });


  document.getElementById("addToCartBtn")
    ?.addEventListener("click", () => {

      addToCart(product);

    });

}


/* =========================
   CART
========================= */

function addToCart(product){

  const price =
    Number(product.discountPrice || product.price || 0);


  const existing = cart.find(item =>
    item.id === product.id &&
    item.size === selectedSize &&
    item.color === selectedColor
  );


  if(existing){

    existing.quantity += 1;

  }else{

    cart.push({

      id: product.id,
      name: product.name,
      image: product.images?.[0] || product.image,
      price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1

    });

  }


  saveCart();

  closeModal("productModal");

  openCart();

  showToast("Added to cart");
}


function saveCart(){

  localStorage.setItem(
    "underworldCart",
    JSON.stringify(cart)
  );

  renderCart();

}


function renderCart(){

  const totalQuantity =
    cart.reduce((sum,item) => sum + item.quantity,0);

  cartCount.textContent = totalQuantity;


  if(cart.length === 0){

    cartItems.innerHTML = `
      <div class="loading">
        Your cart is empty.
      </div>
    `;

    cartTotal.textContent = "৳0";

    return;
  }


  cartItems.innerHTML = cart.map((item,index) => `

    <div class="cart-item">

      <img src="${item.image}" alt="">

      <div class="cart-item-info">

        <h4>${escapeHTML(item.name)}</h4>

        <p>৳${item.price.toLocaleString()}</p>

        ${item.size ? `<p>Size: ${escapeHTML(item.size)}</p>` : ""}

        ${item.color ? `<p>Color: ${escapeHTML(item.color)}</p>` : ""}

        <div class="qty">

          <button data-minus="${index}">−</button>

          <span>${item.quantity}</span>

          <button data-plus="${index}">+</button>

          <button class="remove-cart" data-remove="${index}">
            REMOVE
          </button>

        </div>

      </div>

    </div>

  `).join("");


  document.querySelectorAll("[data-minus]").forEach(btn => {

    btn.onclick = () => {

      const i = Number(btn.dataset.minus);

      cart[i].quantity--;

      if(cart[i].quantity <= 0){
        cart.splice(i,1);
      }

      saveCart();

    };

  });


  document.querySelectorAll("[data-plus]").forEach(btn => {

    btn.onclick = () => {

      cart[Number(btn.dataset.plus)].quantity++;

      saveCart();

    };

  });


  document.querySelectorAll("[data-remove]").forEach(btn => {

    btn.onclick = () => {

      cart.splice(Number(btn.dataset.remove),1);

      saveCart();

    };

  });


  const total =
    cart.reduce(
      (sum,item) => sum + item.price * item.quantity,
      0
    );

  cartTotal.textContent =
    `৳${total.toLocaleString()}`;

}


/* =========================
   CHECKOUT
========================= */

document.getElementById("checkoutForm")
  .addEventListener("submit", async e => {

    e.preventDefault();

    if(cart.length === 0){

      showToast("Your cart is empty");

      return;

    }


    const customerName =
      document.getElementById("customerName").value.trim();

    const customerPhone =
      document.getElementById("customerPhone").value.trim();

    const customerAddress =
      document.getElementById("customerAddress").value.trim();

    const paymentMethod =
      document.getElementById("paymentMethod").value;


    const total =
      cart.reduce(
        (sum,item) => sum + item.price * item.quantity,
        0
      );


    try{

      await addDoc(collection(db,"orders"),{

        customerName,
        customerPhone,
        customerAddress,
        paymentMethod,

        items:cart,

        total,

        status:"Pending",

        createdAt:serverTimestamp()

      });


      cart = [];

      saveCart();

      closeModal("checkoutModal");

      closeCart();

      document.getElementById("checkoutForm").reset();

      showToast("Order placed successfully!");

    }catch(error){

      console.error(error);

      showToast("Order failed. Please try again.");

    }

  });


/* =========================
   CHECKOUT OPEN
========================= */

document.getElementById("checkoutBtn")
  .addEventListener("click", () => {

    if(cart.length === 0){

      showToast("Your cart is empty");

      return;

    }


    const total =
      cart.reduce(
        (sum,item) => sum + item.price * item.quantity,
        0
      );

    document.getElementById("checkoutTotal")
      .textContent =
      `৳${total.toLocaleString()}`;

    document.getElementById("checkoutModal")
      .classList.add("open");

  });


/* =========================
   CART UI
========================= */

function openCart(){

  document.getElementById("cartDrawer")
    .classList.add("open");

  document.getElementById("cartOverlay")
    .classList.add("open");

}

function closeCart(){

  document.getElementById("cartDrawer")
    .classList.remove("open");

  document.getElementById("cartOverlay")
    .classList.remove("open");

}


document.getElementById("cartBtn")
  .onclick = openCart;

document.getElementById("closeCart")
  .onclick = closeCart;

document.getElementById("cartOverlay")
  .onclick = closeCart;


/* =========================
   SEARCH
========================= */

document.getElementById("searchBtn")
  .onclick = () => {

    document.getElementById("searchPanel")
      .classList.add("open");

    document.getElementById("searchInput")
      .focus();

  };


document.getElementById("closeSearch")
  .onclick = () => {

    document.getElementById("searchPanel")
      .classList.remove("open");

  };


document.getElementById("searchInput")
  .addEventListener("input",renderProducts);


/* =========================
   FILTERS
========================= */

document.querySelectorAll(".filter")
  .forEach(button => {

    button.addEventListener("click", () => {

      currentFilter = button.dataset.filter;

      document.querySelectorAll(".filter")
        .forEach(x => x.classList.remove("active"));

      button.classList.add("active");

      renderProducts();

    });

  });


/* =========================
   CATEGORY BUTTONS
========================= */

document.querySelectorAll("[data-category]")
  .forEach(button => {

    button.addEventListener("click", () => {

      currentFilter = button.dataset.category;

      document.querySelectorAll(".filter")
        .forEach(x => {

          x.classList.toggle(
            "active",
            x.dataset.filter === currentFilter
          );

        });

      document.getElementById("shop")
        .scrollIntoView({
          behavior:"smooth"
        });

      renderProducts();

    });

  });


/* =========================
   HERO SLIDER
========================= */

let slideIndex = 0;

const slides =
  document.querySelectorAll(".hero-slide");

const dots =
  document.querySelectorAll(".hero-dot");


function showSlide(index){

  slides.forEach((slide,i) => {

    slide.classList.toggle(
      "active",
      i === index
    );

  });


  dots.forEach((dot,i) => {

    dot.classList.toggle(
      "active",
      i === index
    );

  });

}


function nextSlide(){

  slideIndex =
    (slideIndex + 1) % slides.length;

  showSlide(slideIndex);

}


setInterval(nextSlide,5000);


dots.forEach((dot,index) => {

  dot.onclick = () => {

    slideIndex = index;

    showSlide(index);

  };

});


/* =========================
   MOBILE MENU
========================= */

document.getElementById("menuBtn")
  .onclick = () => {

    document.getElementById("mobileMenu")
      .classList.toggle("open");

  };


/* =========================
   LANGUAGE
========================= */

document.getElementById("languageBtn")
  .onclick = () => {

    const button =
      document.getElementById("languageBtn");

    if(button.textContent === "EN"){

      button.textContent = "বাং";

      document.querySelector(".hero-small").textContent =
        "উইমেন কালেকশন";

    }else{

      button.textContent = "EN";

      document.querySelector(".hero-small").textContent =
        "WOMEN COLLECTION";

    }

  };


/* =========================
   MODAL CLOSE
========================= */

function closeModal(id){

  document.getElementById(id)
    .classList.remove("open");

}

document.getElementById("closeProduct")
  .onclick = () => closeModal("productModal");

document.getElementById("closeCheckout")
  .onclick = () => closeModal("checkoutModal");


document.querySelectorAll(".modal")
  .forEach(modal => {

    modal.addEventListener("click",e => {

      if(e.target === modal){
        modal.classList.remove("open");
      }

    });

  });


/* =========================
   TOAST
========================= */

let toastTimer;

function showToast(message){

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    },2500);

}


/* =========================
   SECURITY / HTML
========================= */

function escapeHTML(value){

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================
   START
========================= */

renderCart();

loadProducts();
