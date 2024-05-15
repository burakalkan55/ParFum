// Firebase projenize ait yapılandırma bilgileri
const firebaseConfig = {
    apiKey: "AIzaSyCP7Nlbbo6BfFKsDJsqIFdbXLh3va5LbOs",
    authDomain: "webtechv3.firebaseapp.com",
    databaseURL: "https://webtechv3-default-rtdb.firebaseio.com", // Firebase Realtime Database URL'si
    projectId: "webtechv3",
    storageBucket: "webtechv3.appspot.com",
    messagingSenderId: "316228727012",
    appId: "1:316228727012:web:0aabf963396d1d03a4fcf1"
};

// Firebase projenize bağlan
firebase.initializeApp(firebaseConfig);

// Firebase veritabanına erişim için database değişkenini tanımla
const database = firebase.database();

// Kullanıcının oturum durumunu izle
firebase.auth().onAuthStateChanged(function(user) {
    const addButton = document.querySelectorAll('.addToCart');
    const cartCountElement = document.getElementById("cartCount");

    if (user) {
        addButton.forEach(function(button) {
            button.disabled = false;

            button.addEventListener("click", function(event) {
                event.preventDefault();
                button.disabled = true;
                addToCartHandler(event);
            });
        });

        updateCartCountAndListen(database.ref("users/" + user.uid + "/cart"), cartCountElement); // Sepet sayacını güncelle ve dinle
    } else {
        addButton.forEach(function(button) {
            button.disabled = true;
        });

        if (cartCountElement) {
            cartCountElement.textContent = 0;
            localStorage.setItem('cartCount', 0);
        }
    }
});

// Sepete ürün eklemek için olay dinleyicisi fonksiyonu
function addToCartHandler(event) {
    const product = event.target.closest(".card");
    const productName = product.querySelector(".card-title").textContent;
    const productPrice = parseFloat(product.querySelector(".text-muted").textContent.slice(1));

    const currentUserUID = firebase.auth().currentUser.uid;
    const userCartRef = database.ref("users/" + currentUserUID + "/cart");

    userCartRef.orderByChild("name").equalTo(productName).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(function(childSnapshot) {
                const key = childSnapshot.key;
                const quantity = childSnapshot.val().quantity || 1;
                userCartRef.child(key).update({
                    quantity: quantity + 1
                });
            });
        } else {
            userCartRef.push({
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
    })
    .then(() => {
        event.target.disabled = false;
    })
    .catch(error => {
        console.error('Hata:', error.message);
        event.target.disabled = false;
    });
}

// Sepet sayacını güncelleme ve dinleme fonksiyonu
function updateCartCountAndListen(cartRef, cartCountElement) {
    cartRef.on("value", function(snapshot) {
        let totalQuantity = 0;
        snapshot.forEach(function(childSnapshot) {
            totalQuantity += childSnapshot.val().quantity;
        });
        if (cartCountElement) {
            cartCountElement.textContent = totalQuantity; // Sepet sayacını güncelle
            localStorage.setItem('cartCount', totalQuantity);
        }
    });
}

// Sayfa yüklendiğinde sepet sayacını güncelle
document.addEventListener("DOMContentLoaded", function() {
    const cartCountElement = document.getElementById("cartCount");
    
    const cartCountFromStorage = localStorage.getItem('cartCount');
    if (cartCountElement && cartCountFromStorage) {
        cartCountElement.textContent = cartCountFromStorage;
    } else {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            updateCartCountAndListen(database.ref("users/" + currentUser.uid + "/cart"), cartCountElement);
        }
    }
});
