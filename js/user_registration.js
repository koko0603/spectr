// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, set, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your web app's Firebase configuration
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
const auth = getAuth(app);


// Function to validate name fields (only letters allowed)
function isValidName(name) {
    return /^[a-zA-Z\s]+$/.test(name);
}

// Function to validate the contact number format
function isValidContactNo(contactNo) {
    // Check if the number starts with 9 and has 9 more digits
    return /^9\d{9}$/.test(contactNo);
}

// Function to validate that the email ends with @gmail.com
function isValidEmail(email) {
    return /^[^@]+@gmail\.com$/.test(email);
}

//Function to validate the company email
function isValidCompanyEmail(companyEmail) {
    // List of valid TLDs (you can expand this list as needed)
    const validTlds = [
        'com', 'org', 'net', 'gov', 'edu', 'io', 'co', 'ph', 'com.ph', 'co.ph', 'net.ph', 'org.ph', 'gov.ph', 'edu.ph'
    ];

    // Regex pattern to match emails with no double dots, allowing Gmail and Yahoo with .com and .ph
    const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

    // Check if the email matches the general pattern
    if (!emailPattern.test(companyEmail)) {
        return false;
    }

    // Extract the TLD part (after the last dot)
    const tld = companyEmail.split('.').pop();

    // Check if the TLD is in the list of valid TLDs
    if (!validTlds.includes(tld)) {
        return false; // Reject if the TLD is not in the validTlds list
    }

    // Additional validations: Ensure no consecutive dots, no other special characters except "@", 
    // and no starting or ending dot in the local part of the email
    return !/\.\./.test(companyEmail) && // Ensure there are no consecutive dots
        /^[a-zA-Z0-9@._%+-]+$/.test(companyEmail) && // Ensure no other special characters/symbols except "@"
        !/^\./.test(companyEmail.split('@')[0]) && // Ensure the local part does not start with a dot
        !/\.$/.test(companyEmail.split('@')[0]);   // Ensure the local part does not end with a dot
}


// Password validation function
function isValidPassword(password) {
    const minLength = 8;
    const maxLength = 12;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    return (
        password.length >= minLength &&
        password.length <= maxLength &&
        uppercase.test(password) &&
        lowercase.test(password) &&
        number.test(password) &&
        specialChar.test(password)
    );
}

// Function to validate the telephone number format (00-000-0000 or 000-000-0000)
function isValidTelephoneNo(telephoneNo) {
    // Check if the number matches either 00-000-0000 or 000-000-0000
    return /^(\d{2}|\d{3})-\d{3}-\d{4}$/.test(telephoneNo);
}

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
const companyEmail = document.getElementById('companyEmail');
const companyTelephoneNo = document.getElementById('companyTelephoneNo');
const companyAddress = document.getElementById('companyAddress');
const companyRegion = document.getElementById('companyRegion');
const companyProvince = document.getElementById('companyProvince');
const companyCity = document.getElementById('companyCity');
const companyBarangay = document.getElementById('companyBarangay');


const RegisterUser = async (evt) => {
    evt.preventDefault();

    // Trigger custom validation and stop if the form is invalid
    if (!mainForm.checkValidity()) {
        mainForm.classList.add('was-validated');
        return;
    }

    // Check if the email field is empty
    if (!email.value) {
        email.classList.add('is-invalid');
        emailFeedback.innerText = "*Please provide a valid email.";
        emailFeedback.style.display = 'block';
        return; // Stop processing
    }

    // Validate company email uniqueness
    if (!isValidCompanyEmail(companyEmail.value)) {
        companyEmail.classList.add('is-invalid');
        companyEmailFeedback.innerText = "*Please provide a valid company email.";
        companyEmailFeedback.style.display = 'block';
        return; // Stop processing
    } else {
        // Check if company email already exists in Firebase Database
        const companyEmailRef = ref(db, `UsersAuthList/`);
        const snapshot = await get(companyEmailRef);
        let isEmailTaken = false;

        snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            if (userData.company_email === companyEmail.value) {
                isEmailTaken = true;
            }
        });

        if (isEmailTaken) {
            companyEmail.classList.add('is-invalid');
            companyEmailFeedback.innerText = "Company email is already taken.";
            companyEmailFeedback.style.display = 'block';
            return;
        } else {
            companyEmail.classList.remove('is-invalid');
            companyEmail.classList.add('is-valid');
            companyEmailFeedback.style.display = 'none';
        }
    }

    // Validate password format
    if (!isValidPassword(password.value)) {
        password.classList.remove('is-valid'); // Ensure 'is-valid' is removed
        password.classList.add('is-invalid');
        passwordFeedback.innerText = "Password must be 8-12 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
        passwordFeedback.style.display = 'block';
        return;
    } else {
        password.classList.remove('is-invalid');
        password.classList.add('is-valid'); // Optional: Add 'is-valid' if you want a green border on success
        passwordFeedback.style.display = 'none';
    }

    // Check password confirmation
    if (password.value !== confirmPassword.value) {
        confirmPassword.classList.remove('is-valid'); // Ensure 'is-valid' is removed
        confirmPassword.classList.add('is-invalid');
        confirmPasswordFeedback.innerText = "*Password does not match.";
        confirmPasswordFeedback.style.display = 'block';
        return;
    } else {
        confirmPassword.classList.remove('is-invalid');
        confirmPassword.classList.add('is-valid'); // Optional: Add 'is-valid' if you want a green border on success
        confirmPasswordFeedback.style.display = 'none';
    }

    const contactNumberWithPrefix = "+63" + contactNo.value;

    // Create user in Firebase Auth
    createUserWithEmailAndPassword(auth, email.value, password.value)
        .then((credentials) => {
            // Save user data in Firebase Database
            set(ref(db, 'Registered_Accounts/' + credentials.user.uid), {
                firstname: firstName.value,
                middlename: middleName.value,
                lastname: lastName.value,
                contact_no: contactNumberWithPrefix,
                gender: gender.value,
                region: region.value,
                province: province.value,
                city: city.value,
                barangay: barangay.value,
                address_info: addressInfo.value,
                email: email.value,
                company_name: companyName.value,
                company_email: companyEmail.value,
                company_telephone_no: companyTelephoneNo.value,
                company_address: companyAddress.value,
                company_region: companyRegion.value,
                company_province: companyProvince.value,
                company_city: companyCity.value,
                company_barangay: companyBarangay.value
            });
            let successModal = new bootstrap.Modal(document.getElementById('staffSuccessModal'));
            successModal.show();
        })
        .catch((error) => {
            // Check if the error is because the email is already taken
            if (error.code === 'auth/email-already-in-use') {
                email.classList.add('is-invalid');
                email.classList.remove('is-valid'); // Ensure the valid class is removed
                emailFeedback.innerText = "Email is already taken. Try another.";
                emailFeedback.style.display = 'block';
                email.style.borderColor = 'red'; // Force red border
            } else {
                alert(error.message);
            }
        });
};


// Event listeners for first name, middle name, and last name
firstName.addEventListener('input', () => {
    if (isValidName(firstName.value)) {
        firstName.classList.remove('is-invalid');
        firstName.classList.add('is-valid');
        firstNameFeedback.style.display = 'none';
    } else {
        firstName.classList.remove('is-valid');
        firstName.classList.add('is-invalid');
        firstNameFeedback.innerText = "*Invalid first name.";
        firstNameFeedback.style.display = 'block';
    }
});

middleName.addEventListener('input', () => {
    if (isValidName(middleName.value)) {
        middleName.classList.remove('is-invalid');
        middleName.classList.add('is-valid');
        middleNameFeedback.style.display = 'none';
    } else {
        middleName.classList.remove('is-valid');
        middleName.classList.add('is-invalid');
        middleNameFeedback.innerText = "*Invalid middle name.";
        middleNameFeedback.style.display = 'block';
    }
});

lastName.addEventListener('input', () => {
    if (isValidName(lastName.value)) {
        lastName.classList.remove('is-invalid');
        lastName.classList.add('is-valid');
        lastNameFeedback.style.display = 'none';
    } else {
        lastName.classList.remove('is-valid');
        lastName.classList.add('is-invalid');
        lastNameFeedback.innerText = "*Invalid last name.";
        lastNameFeedback.style.display = 'block';
    }
});

// Event listener for contact number validation
contactNo.addEventListener('input', () => {
    const invalidFeedback = contactNo.nextElementSibling;

    if (isValidContactNo(contactNo.value)) {
        contactNo.classList.remove('is-invalid');
        contactNo.classList.add('is-valid');
        invalidFeedback.style.display = 'none';
    } else {
        contactNo.classList.remove('is-valid');
        contactNo.classList.add('is-invalid');
        invalidFeedback.innerText = "*Invalid contact number";
        invalidFeedback.style.display = 'block';
    }
});

email.addEventListener('input', () => {
    if (isValidEmail(email.value)) {
        email.classList.remove('is-invalid');
        email.classList.add('is-valid');
        emailFeedback.style.display = 'none';
    } else {
        email.classList.remove('is-valid');
        email.classList.add('is-invalid');
        emailFeedback.innerText = "*Invalid email.";
        emailFeedback.style.display = 'block';
    }
});

companyEmail.addEventListener('input', () => {
    if (isValidCompanyEmail(companyEmail.value)) {
        companyEmail.classList.remove('is-invalid');
        companyEmail.classList.add('is-valid');
        companyEmailFeedback.style.display = 'none';
    } else {
        companyEmail.classList.remove('is-valid');
        companyEmail.classList.add('is-invalid');
        companyEmailFeedback.innerText = "*Invalid company email format.";
        companyEmailFeedback.style.display = 'block';
    }
})


// Add event listener for password input validation as user types
password.addEventListener('input', () => {
    // Check if the password meets the criteria
    if (isValidPassword(password.value)) {
        // Password is valid: show green border
        password.classList.remove('is-invalid');
        password.classList.add('is-valid');
        passwordFeedback.style.display = 'none';
    } else {
        // Password is invalid: show red border and feedback
        password.classList.remove('is-valid');
        password.classList.add('is-invalid');
        passwordFeedback.innerText = "*Password must be 8-12 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
        passwordFeedback.style.display = 'block';
    }
});

confirmPassword.addEventListener('input', () => {
    if (confirmPassword.value != password.value) {
        confirmPassword.classList.remove('is-valid');
        confirmPassword.classList.add('is-invalid');
        confirmPasswordFeedback.innerText = "*Password does not match.";
        confirmPasswordFeedback.style.display = 'block';
    } else {
        confirmPassword.classList.remove('is-invalid');
        confirmPassword.classList.add('is-valid');
        confirmPasswordFeedback.innerText = "";
        confirmPasswordFeedback.style.display = 'block';
    }
});

companyTelephoneNo.addEventListener('input', () => {
    const companyTelephoneNoFeedback = companyTelephoneNo.nextElementSibling;

    if (isValidTelephoneNo(companyTelephoneNo.value)) {
        companyTelephoneNo.classList.remove('is-invalid');
        companyTelephoneNo.classList.add('is-valid');
        companyTelephoneNoFeedback.style.display = 'none';
    } else {
        companyTelephoneNo.classList.remove('is-valid');
        companyTelephoneNo.classList.add('is-invalid');
        companyTelephoneNoFeedback.innerText = "*Invalid telephone number.";
        companyTelephoneNoFeedback.style.display = 'block';
    }
});

mainForm.addEventListener('submit', RegisterUser);