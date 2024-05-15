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

document.addEventListener("DOMContentLoaded", function() {
    const addToCartButton = document.querySelector('.addToCart');

    if (addToCartButton) {
        addToCartButton.addEventListener("click", addToCartHandler);
    }
});

// Sepete ürün eklemek için olay dinleyicisi fonksiyonu
function addToCartHandler(event) {
    event.preventDefault(); // Form submitini engellemek için

    // Kullanıcının oturum açıp açık olup olmadığını kontrol et
    const user = firebase.auth().currentUser;
    if (!user) {
        // Kullanıcı oturum açık değilse, oturum açma sayfasına yönlendir
        window.location.href = "/signin.html"; // Oturum açma sayfasının yolunu doğru şekilde belirtin
        return;
    }

    // Ürün detaylarını al
    const productName = document.querySelector(".display-5").textContent;
    const productPrice = parseFloat(document.querySelector(".lead").textContent.slice(1)); // "$15" gibi olan fiyatı sayıya çevir

    // Kullanıcının UID'sini al
    const currentUserUID = user.uid;

    // Kullanıcının altındaki "cart" düğümüne ürünü ekle
    const userCartRef = database.ref("users/" + currentUserUID + "/cart");

    // Ürün zaten sepette mi kontrol et
    userCartRef.orderByChild("name").equalTo(productName).once("value", function(snapshot) {
        if (snapshot.exists()) {
            // Ürün sepette ise, sadece adeti arttır
            snapshot.forEach(function(childSnapshot) {
                const key = childSnapshot.key;
                const quantity = childSnapshot.val().quantity || 1; // Ürünün adeti varsa al, yoksa 1 olarak varsay
                userCartRef.child(key).update({
                    quantity: quantity + 1
                });
            });
        } else {
            // Ürün sepette değilse, yeni ürün olarak ekle
            userCartRef.push({
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
    })
    .then(() => {
        // Sepete ekleme işlemi başarılı olduğunda bildirim gösterilebilir veya başka bir işlem yapılabilir
        console.log('Ürün sepete eklendi');
    })
    .catch(error => {
        console.error('Hata:', error.message);
    });
}

// Kullanıcı oturum durumunu izleme fonksiyonu
firebase.auth().onAuthStateChanged(function(user) {
    const cartCountElement = document.getElementById("cartCount");

    if (user) {
        // Kullanıcı oturum açıkken
        const userCartRef = database.ref("users/" + user.uid + "/cart");
        updateCartCountAndListen(userCartRef, cartCountElement);
    } else {
        // Kullanıcı oturum kapattığında
        if (cartCountElement) {
            cartCountElement.textContent = "0"; // Sepette hiç ürün olmadığında, 0 olarak göster
        }
    }
});

// Sepet sayacını güncelleme ve dinleme fonksiyonu
function updateCartCountAndListen(cartRef, cartCountElement) {
    cartRef.on("value", function(snapshot) {
        let totalQuantity = 0;
        snapshot.forEach(function(childSnapshot) {
            totalQuantity += childSnapshot.val().quantity;
        });
        if (cartCountElement) {
            cartCountElement.textContent = totalQuantity; // Sepet sayacını güncelle
        }
    });
}
