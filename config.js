const firebaseConfig = {
  apiKey: "AIzaSyCP7Nlbbo6BfFKsDJsqIFdbXLh3va5LbOs",
  authDomain: "webtechv3.firebaseapp.com",
  databaseURL: "https://webtechv3-default-rtdb.firebaseio.com", // Firebase Realtime Database URL'si
  projectId: "webtechv3",
  storageBucket: "webtechv3.appspot.com",
  messagingSenderId: "316228727012",
  appId: "1:316228727012:web:0aabf963396d1d03a4fcf1"
};

  // Firebase'i başlat
  firebase.initializeApp(firebaseConfig);

  //Değişkenleri başlat
  const auth = firebase.auth();
  const database = firebase.database();
  
  function register() {
      // Tüm giriş alanlarımızı alın
      const email = document.getElementById('emailUp').value;
      const password = document.getElementById('passwordUp').value;
      const first_name = document.getElementById('fname').value;
      const last_name = document.getElementById('lname').value;
  
      // Giriş alanlarını doğrula
      if (!validate_email(email) || !validate_password(password)) {
          alert('Email or Password is not valid!');
          return;
      }
  
      if (!validate_field(first_name) || !validate_field(last_name)) {
          alert('One or more extra fields are not valid!');
          return;
      }
  
      // Auth'a devam et
      auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Kullanıcı değişkenini bildirin
        const user = userCredential.user;
    
        // Bu kullanıcıyı Firebase Veritabanına ekle
        const database_ref = database.ref();
    
        // Kullanıcı verileri oluştur
        const user_data = {
            email: email,
            first_name: first_name,
            last_name: last_name
        };
    
        // Firebase Veritabanına Gönder
        database_ref.child('users/' + user.uid).set(user_data)
            .then(() => {
                // Tamam
                alert('User Created!!');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                // RTDB'ye yazarken hatayı işleme
                alert('Error while writing to RTDB: ' + error.message);
            });
    })
    .catch((error) => {
        // Firebase bunu hatalarını uyarmak için kullanacak
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
    });
    
  }
  
  // Giriş fonksiyonumuzu ayarlayın
  function login() {
      // Tüm giriş alanlarımızı alın
      const email = document.getElementById('emailIn').value;
      const password = document.getElementById('passwordIn').value;
  
      // Giriş alanlarını doğrula
      if (!validate_email(email) || !validate_password(password)) {
          alert('Email or Password is not valid!');
          return;
      }
  
      auth.signInWithEmailAndPassword(email, password)
          .then(() => {
              // Kullanıcı değişkenini bildirin
              const user = auth.currentUser;
  
              // Bu kullanıcıyı Firebase Veritabanına ekle
              const database_ref = database.ref();
  
              // Kullanıcı verileri oluştur
              const user_data = {
                  last_login: Date.now()
              };
  
              // Firebase Veritabanına Gönder
              database_ref.child('users/' + user.uid).update(user_data);
  
              // Oldu
              alert('User Logged In!!');
              window.location.href = 'products.html';
          })
          .catch((error) => {
              // Firebase bunu hatalarını uyarmak için kullanacak
              const errorCode = error.code;
              const errorMessage = error.message;
              alert(errorMessage);
          });
  }
  
  // İşlevleri Doğrula
  function validate_email(email) {
      const expression = /^[^@]+@\w+(\.\w+)+\w$/;
      return expression.test(email);
  }
  
  function validate_password(password) {
      // Firebase yalnızca 6'ya eşit veya daha büyük uzunlukları kabul eder
      return password.length >= 6;
  }
  
  function validate_field(field) {
      return field && field.trim() !== '';
  }