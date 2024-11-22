// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, get, ref, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD56TvVuz9rl9wvRN9VhkJH_Gz8WHpFh_Q",
    authDomain: "spectre-8f79c.firebaseapp.com",
    databaseURL: "https://spectre-8f79c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "spectre-8f79c",
    storageBucket: "spectre-8f79c.appspot.com",
    messagingSenderId: "875337744237",
    appId: "1:875337744237:web:d2dd76f311523b30b56464",
    measurementId: "G-13VZ185YFT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth();
const dbref = ref(db);


const mainForm = document.getElementById('mainform');
const firstName = document.getElementById('firstName');
const middleName = document.getElementById('middleName');
const lastName = document.getElementById('lastName');
const contactNo = document.getElementById('contactNo');
const gender = document.getElementById('gender');
const region = document.getElementById('region');
const province = document.getElementById('province');
const city = document.getElementById('city');
const barangay = document.getElementById('barangay');
const addressInfo = document.getElementById('addressInfo');

const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const passwordFeedback = document.getElementById('passwordFeedback');

const companyName = document.getElementById('companyName');
const companyBranch = document.getElementById('companyBranch');
const companyEmail = document.getElementById('companyEmail');
const companyTelephoneNo = document.getElementById('companyTelephoneNo');
const companyAddress = document.getElementById('companyAddress');
const companyRegion = document.getElementById('companyRegion');
const companyProvince = document.getElementById('companyProvince');
const companyCity = document.getElementById('companyCity');
const companyBarangay = document.getElementById('companyBarangay');

let SignInUser = evt => {
    evt.preventDefault();

    // Trigger custom validation and stop if the form is invalid
    if (!mainForm.checkValidity()) {
        mainForm.classList.add('was-validated');
        return;
    }

    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((credentials) => {
            get(child(dbref, 'Registered_Accounts/' + credentials.user.uid)).then((snapshot) => {
                if (snapshot.exists) {
                    sessionStorage.setItem("user-info", JSON.stringify({
                        firstname: snapshot.val().firstname,
                        middlename: snapshot.val().middlename,
                        lastname: snapshot.val().lastname,
                        contact_no: snapshot.val().contact_no,
                        gender: snapshot.val().gender,
                        region: snapshot.val().region,
                        province: snapshot.val().province,
                        city: snapshot.val().city,
                        barangay: snapshot.val().barangay,
                        address_info: snapshot.val().address_info,
                        email: snapshot.val().email,
                        company_name: snapshot.val().company_name,
                        company_branch: snapshot.val().company_branch,
                        company_email: snapshot.val().company_email,
                        company_telephone_no: snapshot.val().company_telephone_no,
                        company_address: snapshot.val().company_address,
                        company_region: snapshot.val().company_region,
                        company_province: snapshot.val().company_province,
                        company_city: snapshot.val().company_city,
                        company_barangay: snapshot.val().company_barangay
                    }))
                    sessionStorage.setItem("user-creds", JSON.stringify(credentials.user));
                    window.location.href = 'client.html';
                }
            })
        })
        .catch((error) => {
            alert(error.message);
            console.log(error.code);
            console.log(error.message);
        })
}

mainForm.addEventListener('submit', SignInUser);