import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================
   FIREBASE CONFIG
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

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================
   ADMIN EMAIL
========================= */

/*
   এখানে আপনার Firebase Admin account-এর
   Email লিখবেন।
*/

const ADMIN_EMAIL = "YOUR_ADMIN_EMAIL@gmail.com";


/* =========================
   LOGIN
========================= */

document.getElementById("loginBtn")
  .addEventListener("click", async () => {

    const email =
      document.getElementById("loginEmail").value.trim();

    const password =
      document.getElementById("loginPassword").value;


    if(!email || !password){

      document.getElementById("loginError")
        .textContent =
        "Email and password required.";

      return;

    }


    try{

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    }catch(error){

      console.error(error);

      document.getElementById("loginError")
        .textContent =
        "Invalid email or password.";

    }

  });


/* =========================
   AUTH CHECK
========================= */

onAuthStateChanged(auth, user => {

  if(user && user.email === ADMIN_EMAIL){

    document.getElementById("loginScreen")
      .classList.add("hidden");

    document.getElementById("adminApp")
      .classList.remove("hidden");

    loadAll();

  }else{

    document.getElementById("loginScreen")
      .classList.remove("hidden");

    document.getElementById("adminApp")
      .classList.add("hidden");

  }

});


/* =========================
   LOGOUT
========================= */

document.getElementById("logoutBtn")
  .onclick = () => signOut(auth);


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(".nav-btn")
  .forEach(button => {

    button.addEventListener("click", () => {

      const section =
        button.dataset.section;


      document.querySelectorAll(".nav-btn")
        .forEach(x => x.classList.remove("active"));

      button.classList.add("active");


      document.querySelectorAll(".admin-section")
        .forEach(x => x.classList.add("hidden"));


      document.getElementById(
        section + "Section"
      ).classList.remove("hidden");


      document.getElementById("pageTitle")
        .textContent =
        section.charAt(0).toUpperCase()
        + section.slice(1);


      if(section === "products"){
        loadProducts();
      }

      if(section === "orders"){
        loadOrders();
      }

      if(section === "categories"){
        loadCategories();
      }

    });

  });


/* =========================
   LOAD EVERYTHING
========================= */

async function loadAll(){

  await loadProducts();

  await loadOrders();

  await loadCategories();

}


/* =========================
   PRODUCTS
========================= */

let allProducts = [];


async function loadProducts(){

  const snapshot =
    await getDocs(collection(db,"products"));

  allProducts = [];

  snapshot.forEach(item => {

    allProducts.push({
      id:item.id,
      ...item.data()
    });

  });


  document.getElementById("totalProducts")
    .textContent =
    allProducts.length;


  renderAdminProducts();

}


function renderAdminProducts(){

  const container =
    document.getElementById("adminProducts");


  if(allProducts.length === 0){

    container.innerHTML = `
      <div style="padding:40px;text-align:center;color:#777">
        No products yet.
      </div>
    `;

    return;
  }


  container.innerHTML =
    allProducts.map(product => {

      const image =
        product.images?.[0]
        || product.image
        || "";


      return `

        <div class="admin-product">

          <img src="${image}" alt="">

          <div>
            <h3>${escapeHTML(product.name)}</h3>
            <p>${escapeHTML(product.category || "")}</p>
          </div>

          <div class="admin-price">
            ৳${Number(
              product.discountPrice || product.price || 0
            ).toLocaleString()}
          </div>

          <div class="admin-stock">
            Stock: ${product.stock || 0}
          </div>

          <div>

            <button
              class="action-btn"
              data-edit="${product.id}"
            >
              EDIT
            </button>

            <button
              class="action-btn delete-btn"
              data-delete="${product.id}"
            >
              DELETE
            </button>

          </div>

        </div>

      `;

    }).join("");


  document.querySelectorAll("[data-edit]")
    .forEach(button => {

      button.onclick = () => {

        const product =
          allProducts.find(
            p => p.id === button.dataset.edit
          );

        if(product){
          openEditProduct(product);
        }

      };

    });


  document.querySelectorAll("[data-delete]")
    .forEach(button => {

      button.onclick = async () => {

        if(!confirm("Delete this product?")){
          return;
        }

        await deleteDoc(
          doc(db,"products",button.dataset.delete)
        );

        loadProducts();

      };

    });

}


/* =========================
   ADD PRODUCT
========================= */

document.getElementById("addProductBtn")
  .onclick = () => {

    document.getElementById("productForm").reset();

    document.getElementById("productId").value = "";

    document.getElementById("productModalTitle")
      .textContent =
      "Add New Product";

    document.getElementById("productModal")
      .classList.add("open");

  };


/* =========================
   SAVE PRODUCT
========================= */

document.getElementById("productForm")
  .addEventListener("submit", async e => {

    e.preventDefault();


    const id =
      document.getElementById("productId").value;


    const images =
      document.getElementById("productImages")
        .value
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);


    const sizes =
      document.getElementById("productSizes")
        .value
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);


    const colors =
      document.getElementById("productColors")
        .value
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);


    const tags =
      document.getElementById("productTags")
        .value
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);


    const data = {

      name:
        document.getElementById("productName").value.trim(),

      category:
        document.getElementById("productCategory").value,

      price:
        Number(
          document.getElementById("productPrice").value
        ),

      discountPrice:
        Number(
          document.getElementById("productDiscount").value
        ) || null,

      stock:
        Number(
          document.getElementById("productStock").value
        ),

      sizes,

      colors,

      tags,

      images,

      description:
        document.getElementById("productDescription").value.trim(),

      popular:
        document.getElementById("productPopular").checked,

      updatedAt:
        serverTimestamp()

    };


    try{

      if(id){

        await updateDoc(
          doc(db,"products",id),
          data
        );

      }else{

        data.createdAt = serverTimestamp();

        await addDoc(
          collection(db,"products"),
          data
        );

      }


      closeProductModal();

      await loadProducts();

      alert("Product saved successfully.");

    }catch(error){

      console.error(error);

      alert(
        "Could not save product. Check Firebase Rules."
      );

    }

  });


/* =========================
   EDIT PRODUCT
========================= */

function openEditProduct(product){

  document.getElementById("productId")
    .value = product.id;

  document.getElementById("productName")
    .value = product.name || "";

  document.getElementById("productCategory")
    .value = product.category || "Men";

  document.getElementById("productPrice")
    .value = product.price || "";

  document.getElementById("productDiscount")
    .value = product.discountPrice || "";

  document.getElementById("productStock")
    .value = product.stock || "";

  document.getElementById("productSizes")
    .value =
    Array.isArray(product.sizes)
      ? product.sizes.join(", ")
      : "";

  document.getElementById("productColors")
    .value =
    Array.isArray(product.colors)
      ? product.colors.join(", ")
      : "";

  document.getElementById("productTags")
    .value =
    Array.isArray(product.tags)
      ? product.tags.join(", ")
      : "";

  document.getElementById("productImages")
    .value =
    Array.isArray(product.images)
      ? product.images.join("\n")
      : "";

  document.getElementById("productDescription")
    .value =
    product.description || "";

  document.getElementById("productPopular")
    .checked =
    product.popular === true;


  document.getElementById("productModalTitle")
    .textContent =
    "Edit Product";


  document.getElementById("productModal")
    .classList.add("open");

}


/* =========================
   CLOSE PRODUCT
========================= */

function closeProductModal(){

  document.getElementById("productModal")
    .classList.remove("open");

}

document.getElementById("closeProductModal")
  .onclick = closeProductModal;


/* =========================
   CATEGORIES
========================= */

async function loadCategories(){

  const snapshot =
    await getDocs(collection(db,"categories"));

  const container =
    document.getElementById("categoryList");

  container.innerHTML = "";

  snapshot.forEach(item => {

    const data = item.data();

    const div =
      document.createElement("div");

    div.className = "category-item";

    div.innerHTML = `

      <span>
        ${escapeHTML(data.name || "")}
      </span>

      <button
        class="action-btn delete-btn"
        data-category-delete="${item.id}"
      >
        DELETE
      </button>

    `;

    container.appendChild(div);

  });


  document.querySelectorAll(
    "[data-category-delete]"
  ).forEach(button => {

    button.onclick = async () => {

      if(!confirm("Delete category?")){
        return;
      }

      await deleteDoc(
        doc(
          db,
          "categories",
          button.dataset.categoryDelete
        )
      );

      loadCategories();

    };

  });

}


document.getElementById("addCategoryBtn")
  .onclick = async () => {

    const input =
      document.getElementById("categoryName");

    const name =
      input.value.trim();

    if(!name) return;

    await addDoc(
      collection(db,"categories"),
      {
        name,
        createdAt:serverTimestamp()
      }
    );

    input.value = "";

    loadCategories();

  };


/* =========================
   ORDERS
========================= */

let allOrders = [];


async function loadOrders(){

  const snapshot =
    await getDocs(collection(db,"orders"));

  allOrders = [];

  snapshot.forEach(item => {

    allOrders.push({
      id:item.id,
      ...item.data()
    });

  });


  document.getElementById("totalOrders")
    .textContent =
    allOrders.length;


  const pending =
    allOrders.filter(
      x => x.status === "Pending"
    ).length;

  document.getElementById("pendingOrders")
    .textContent =
    pending;


  const revenue =
    allOrders
      .filter(x => x.status !== "Cancelled")
      .reduce(
        (sum,x) => sum + Number(x.total || 0),
        0
      );


  document.getElementById("totalRevenue")
    .textContent =
    `৳${revenue.toLocaleString()}`;


  renderOrders();

}


function renderOrders(){

  const container =
    document.getElementById("adminOrders");

  const recent =
    document.getElementById("recentOrders");


  if(allOrders.length === 0){

    container.innerHTML = `
      <div style="padding:40px;text-align:center;color:#777">
        No orders yet.
      </div>
    `;

    recent.innerHTML =
      `<div style="padding:30px;color:#777">No orders yet.</div>`;

    return;
  }


  const html =
    allOrders.map(order => {

      return `

        <div class="order">

          <div class="order-top">

            <div>

              <div class="order-id">
                #${order.id.slice(0,8)}
              </div>

              <div class="order-customer">
                ${escapeHTML(order.customerName || "")}
              </div>

            </div>

            <select
              class="status-select"
              data-status="${order.id}"
            >

              ${[
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
              ].map(status => `

                <option
                  value="${status}"
                  ${order.status === status ? "selected" : ""}
                >
                  ${status}
                </option>

              `).join("")}

            </select>

          </div>


          <div class="order-info">

            Phone:
            ${escapeHTML(order.customerPhone || "")}
            <br>

            Address:
            ${escapeHTML(order.customerAddress || "")}
            <br>

            Payment:
            ${escapeHTML(order.paymentMethod || "")}
            <br>

            Total:
            <strong>
              ৳${Number(order.total || 0).toLocaleString()}
            </strong>

          </div>

        </div>

      `;

    }).join("");


  container.innerHTML = html;

  recent.innerHTML =
    allOrders.slice(0,5).map(order => `

      <div class="order">

        <div class="order-customer">
          ${escapeHTML(order.customerName || "")}
        </div>

        <div class="order-info">
          ৳${Number(order.total || 0).toLocaleString()}
          — ${order.status || "Pending"}
        </div>

      </div>

    `).join("");


  document.querySelectorAll("[data-status]")
    .forEach(select => {

      select.onchange = async () => {

        await updateDoc(
          doc(db,"orders",select.dataset.status),
          {
            status:select.value,
            updatedAt:serverTimestamp()
          }
        );

        loadOrders();

      };

    });

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value){

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}
