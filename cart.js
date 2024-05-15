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
// Kullanıcının oturum durumunu izle
firebase.auth().onAuthStateChanged(function(user) {
    const cartList = document.getElementById("cartList");
    const cartItemCountLabel = document.getElementById("cartItemCountLabel");
    const subtotalElement = document.getElementById("subtotal");
    const cartItemCount = document.getElementById("cartItemCount");

    if (user) {
        // Kullanıcının UID'sini al
        const currentUserUID = user.uid;

        // Kullanıcının altındaki "cart" düğümüne erişim sağla
        const userCartRef = database.ref("users/" + currentUserUID + "/cart");
        const userSubtotalRef = database.ref("users/" + currentUserUID + "/subtotal");

        // Ürünleri Firebase'den al ve tabloya ekle
        userCartRef.on("value", function(snapshot) {
            cartList.innerHTML = ""; // Önceki içeriği temizle
            let itemCount = 0;
            let subtotal = 0;

            snapshot.forEach(function(childSnapshot) {
                const productKey = childSnapshot.key;
                const productData = childSnapshot.val();
                const productName = productData.name;
                const productPrice = productData.price;
                const productQuantity = productData.quantity;

                // Yeni bir satır oluştur ve tabloya ekle
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>${productName}</td>
                    <td>$${productPrice.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm decreaseBtn" data-product-key="${productKey}">-</button>
                        <span>${productQuantity}</span>
                        <button class="btn btn-primary btn-sm increaseBtn" data-product-key="${productKey}">+</button>
                    </td>
                    <td><button class="btn btn-danger btn-sm deleteBtn" data-product-key="${productKey}">Delete</button></td>
                `;
                cartList.appendChild(newRow);

                // Ürün sayısını ve toplamı güncelle
                itemCount += productQuantity;
                subtotal += productPrice * productQuantity;
            });

            // Toplam ürün sayısını, sepetteki ürün sayısını ve toplam tutarı güncelle
            cartItemCountLabel.textContent = itemCount;
            subtotalElement.textContent = "$" + subtotal.toFixed(2);
            cartItemCount.textContent = itemCount; // Sepetteki ürün sayısını güncelle
            
            // Subtotal değerini RTDB'ye kaydet
            userSubtotalRef.set(subtotal)
                .then(() => {
                    console.log("Subtotal RTDB'ye kaydedildi.");
                })
                .catch(error => {
                    console.error("Hata:", error.message);
                });
        });
    } else {
        cartList.innerHTML = ""; // Kullanıcı oturum açmamışsa, tabloyu temizle
        cartItemCountLabel.textContent = "0";
        subtotalElement.textContent = "$0.00";
        cartItemCount.textContent = "0"; // Sepetteki ürün sayısını sıfırla
    }
});


// Arttırma ve azaltma düğmelerini dinle
document.addEventListener("click", function(event) {
    if (event.target.classList.contains("increaseBtn") || event.target.classList.contains("decreaseBtn")) {
        const isIncrease = event.target.classList.contains("increaseBtn");
        const productKey = event.target.dataset.productKey;
        const currentUserUID = firebase.auth().currentUser.uid;
        const userCartRef = database.ref("users/" + currentUserUID + "/cart/" + productKey);

        userCartRef.once("value", function(snapshot) {
            const productData = snapshot.val();
            let productQuantity = productData.quantity;

            if (isIncrease) {
                productQuantity++;
            } else {
                if (productQuantity > 1) {
                    productQuantity--;
                } else {
                    // Ürün miktarı 1'den küçük olamaz
                    return;
                }
            }

            // Miktarı güncelle
            userCartRef.update({ quantity: productQuantity })
                .then(() => {
                    console.log("Ürün miktarı güncellendi.");
                })
                .catch(error => {
                    console.error("Hata:", error.message);
                });
        });
    }
});

// Silme düğmelerini dinle
document.addEventListener("click", function(event) {
    if (event.target.classList.contains("deleteBtn")) {
        const productKey = event.target.dataset.productKey;
        const currentUserUID = firebase.auth().currentUser.uid;
        const userCartRef = database.ref("users/" + currentUserUID + "/cart/" + productKey);

        // Ürünü Firebase'den sil
        userCartRef.remove()
            .then(() => {
                console.log("Ürün başarıyla silindi.");
            })
            .catch(error => {
                console.error("Hata:", error.message);
            });
    }
});
