import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, set, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);

function isValidName(name) {
    return /^[a-zA-Z\s]+$/.test(name);
}

// Function to validate the contact number format
function isValidContactNo(staffcontactNoInput) {
    // Check if the number starts with 9 and has 9 more digits
    return /^9\d{9}$/.test(staffcontactNoInput);
}

let userID = 0;
let tbody = document.getElementById('tbody1');

let staffcontactNoInput = document.getElementById('editContactNo');
let staff_FirstnameInput = document.getElementById('editFirstname');
let staff_MiddlenameInput = document.getElementById('editMiddlename');
let staff_LastnameInput = document.getElementById('editLastname');

function StaffManagement(idnumber, position, staff_firstname, staff_lastname) {
    let trow = document.createElement("tr");

    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    let td5 = document.createElement('td');
    let td6 = document.createElement('td');

    td1.classList.add('text-center');
    td2.classList.add('text-center');
    td3.classList.add('text-center');
    td4.classList.add('text-center');
    td5.classList.add('text-center');
    td6.classList.add('text-center');

    td1.innerHTML = ++userID;
    td2.innerHTML = idnumber;
    td3.innerHTML = position;
    td4.innerHTML = staff_firstname;
    td5.innerHTML = staff_lastname;

    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-center', 'flex-column', 'gap-2', 'flex-sm-row');

    let editBtn = document.createElement('button');
    editBtn.type = "button";
    editBtn.className = "btn text-sm";
    editBtn.style.backgroundColor = "#50a742";
    editBtn.style.color = "white";
    editBtn.innerHTML = "<img src='images/icons/edit.png' alt='Edit'> Edit";
    editBtn.addEventListener('click', function () {
        editButtonClicked(idnumber);
    });

    let viewBtn = document.createElement('button');
    viewBtn.type = "button";
    viewBtn.className = "btn text-sm";
    viewBtn.style.backgroundColor = "rgb(49, 101, 147)";
    viewBtn.style.color = "white";
    viewBtn.innerHTML = "<img src='images/icons/view.png' alt='View'> View";
    viewBtn.addEventListener('click', function () {
        viewButtonClicked(idnumber);
    });

    let deleteBtn = document.createElement('button');
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-danger text-sm";
    deleteBtn.innerHTML = "<img src='images/icons/delete_user.png' alt='Delete'> Delete";
    deleteBtn.addEventListener('click', function (e) {
        deleteButtonClicked(e, idnumber);
    });

    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(viewBtn);
    buttonContainer.appendChild(deleteBtn);

    td6.appendChild(buttonContainer);

    trow.appendChild(td1);
    trow.appendChild(td2);
    trow.appendChild(td3);
    trow.appendChild(td4);
    trow.appendChild(td5);
    trow.appendChild(td6);

    tbody.appendChild(trow);
}

function AddAllItemsToTable(TheUser) {
    userID = 0;
    tbody.innerHTML = "";

    TheUser.reverse().forEach(element => {
        StaffManagement(element.idnumber, element.position, element.staff_firstname, element.staff_lastname);
    });

    if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().clear();
        $('#example').DataTable().destroy();
    }

    $(document).ready(function () {
        var table = $('#example').DataTable({
            buttons: [
                { extend: 'copy', exportOptions: { columns: ':not(:last-child)' } },
                { extend: 'csv', exportOptions: { columns: ':not(:last-child)' } },
                { extend: 'excel', exportOptions: { columns: ':not(:last-child)' } },
                { extend: 'pdf', exportOptions: { columns: ':not(:last-child)' } },
                { extend: 'print', exportOptions: { columns: ':not(:last-child)' } }
            ]
        });

        table.buttons().container().appendTo('#example_wrapper .col-md-6:eq(0)');
    });
}

function GetAllDataOnce() {
    const user = auth.currentUser;

    if (user) {
        const uid = user.uid; // Get the UID of the logged-in user
        const dbRef = ref(db, `Registered_Accounts/${uid}/Staff_Management`);

        onValue(dbRef, (snapshot) => {
            let users = [];

            snapshot.forEach(childSnapshot => {
                users.push(childSnapshot.val());
            });

            AddAllItemsToTable(users);
        });
    } else {
        console.error("User is not logged in.");
    }
}

auth.onAuthStateChanged((user) => {
    if (user) {
        GetAllDataOnce();
    } else {
        console.error("No user is currently logged in.");
    }
});


// Edit Button Functionality
// function editButtonClicked(idnumber) {
//     const user = auth.currentUser;

//     if (user) {
//         const uid = user.uid;
//         const dbRef = ref(db, `Registered_Accounts/${uid}/Staff_Management`);

//         onValue(dbRef, (snapshot) => {
//             snapshot.forEach((childSnapshot) => {
//                 if (childSnapshot.val().idnumber === idnumber) {
//                     const userData = childSnapshot.val();

//                     console.log("Fetched Data: ", userData);

//                     // Populate modal fields with user data
//                     document.getElementById("editIDNumber").value = userData.idnumber;
//                     document.getElementById("editPosition").value = userData.position;
//                     document.getElementById("editFirstname").value = userData.staff_firstname;
//                     document.getElementById("editMiddlename").value = userData.staff_middlename;
//                     document.getElementById("editLastname").value = userData.staff_lastname;
//                     document.getElementById("editContactNo").value = userData.staff_contact_no;
//                     document.getElementById('editGender').value = userData.staff_gender;
//                     document.getElementById('editAddressInfo').value = userData.staff_address_info;

//                     // Save the user key in the Save button attribute
//                     document.getElementById("saveEditBtn").setAttribute("data-user-key", childSnapshot.key);
//                 }
//             });
//         }, { onlyOnce: true });
//     } else {
//         console.error("User is not logged in.");
//     }
// }

let originalData = {}; // Store original data globally

function editButtonClicked(idnumber) {
    event.preventDefault();

    document.getElementById('content3').style.display = 'none';
    document.getElementById('content7').style.display = 'block';

    window.location.hash = '#staff_management/#add_staff';

    const user = auth.currentUser;

    if (user) {
        const uid = user.uid;
        const dbRef = ref(db, `Registered_Accounts/${uid}/Staff_Management`);

        onValue(dbRef, (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().idnumber === idnumber) {
                    const userData = childSnapshot.val();

                    console.log("Fetched Data: ", userData);

                    // Store the original data for comparison later
                    originalData = { ...userData }; // Create a shallow copy

                    // Populate modal fields with user data
                    document.getElementById("editIDNumber").value = userData.idnumber;
                    document.getElementById("editPosition").value = userData.position;
                    document.getElementById("editFirstname").value = userData.staff_firstname;
                    document.getElementById("editMiddlename").value = userData.staff_middlename;
                    document.getElementById("editLastname").value = userData.staff_lastname;
                    document.getElementById("editContactNo").value = userData.staff_contact_no.slice(3); // Remove the "+63"
                    document.getElementById('editGender').value = userData.staff_gender;
                    document.getElementById('editAddressInfo').value = userData.staff_address_info;
                    document.getElementById('displayRegion').value = userData.staff_region;
                    document.getElementById('displayProvince').value = userData.staff_province;
                    document.getElementById('displayCity').value = userData.staff_city;
                    document.getElementById('displayBarangay').value = userData.staff_barangay;

                    // Save the user key in the Save button attribute
                    document.getElementById("saveEditBtn").setAttribute("data-user-key", childSnapshot.key);
                }
            });
        }, { onlyOnce: true });
    } else {
        console.error("User is not logged in.");
    }
}

function isAddressComplete() {
    const region = document.getElementById('editRegion').value;
    const province = document.getElementById('editProvince').value;
    const city = document.getElementById('editCity').value;
    const barangay = document.getElementById('editBarangay').value;

    // Check if any of the address fields are empty
    if (!region || !province || !city || !barangay) {
        return false;
    }

    return true;
}

document.getElementById("saveEditBtn").addEventListener("click", function () {
    const user = auth.currentUser;

    let contactNumber = document.getElementById('editContactNo').value;

    // Check if the contact number starts with '63' and prepend '+' if not
    if (!contactNumber.startsWith("+63")) {
        contactNumber = "+63" + contactNumber; // Add the prefix if missing
    }

    // Check if address information is complete
    if (!isAddressComplete()) {
        alert("Please complete the address information.");
        return; // Stop execution if address is incomplete
    }

    if (user) {
        const uid = user.uid;
        const userKey = this.getAttribute("data-user-key");

        // Get updated data from modal inputs
        const updatedData = {
            idnumber: document.getElementById("editIDNumber").value,
            position: document.getElementById("editPosition").value,
            staff_firstname: document.getElementById("editFirstname").value,
            staff_middlename: document.getElementById("editMiddlename").value,
            staff_lastname: document.getElementById("editLastname").value,
            staff_contact_no: contactNumber,
            staff_gender: document.getElementById('editGender').value,
            staff_region: document.getElementById('editRegion').value,
            staff_province: document.getElementById('editProvince').value,
            staff_city: document.getElementById('editCity').value,
            staff_barangay: document.getElementById('editBarangay').value,
            staff_address_info: document.getElementById('editAddressInfo').value
        };

        // Compare each field between originalData and updatedData
        let dataHasChanged = false;

        // Iterate over the updatedData and check for differences
        for (let key in updatedData) {
            if (updatedData[key] !== originalData[key]) {
                dataHasChanged = true;
                break; // Exit loop once we find any change
            }
        }

        // If data has changed, proceed with saving and showing the modal
        if (dataHasChanged && userKey) {
            const userRef = ref(db, `Registered_Accounts/${uid}/Staff_Management/${userKey}`);

            set(userRef, updatedData)
                .then(() => {
                    // Show the save changes modal
                    let savechangesModal = new bootstrap.Modal(document.getElementById('savechangesModal'));
                    savechangesModal.show();

                    // Refresh the table data
                    GetAllDataOnce();
                })
                .catch((error) => {
                    console.error("Error updating user:", error.message);
                    alert("Error updating user. Please try again.");
                });
        } else if (!dataHasChanged) {
            alert("No changes detected. Please make edits before saving.");
        } else {
            alert("User key not found. Please try again.");
        }
    }
});



function viewButtonClicked(idnumber) {
    const user = auth.currentUser;

    if (user) {
        const uid = user.uid;
        const dbRef = ref(db, `Registered_Accounts/${uid}/Staff_Management`);

        onValue(dbRef, (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().idnumber === idnumber) {
                    const userData = childSnapshot.val();

                    console.log("Fetched Data: ", userData);

                    // Populate modal fields with user data
                    document.getElementById("viewIDNumber").value = userData.idnumber;
                    document.getElementById("viewPosition").value = userData.position;
                    document.getElementById("viewFirstname").value = userData.staff_firstname;
                    document.getElementById("viewMiddlename").value = userData.staff_middlename;
                    document.getElementById("viewLastname").value = userData.staff_lastname;
                    document.getElementById("viewContactNo").value = userData.staff_contact_no.slice(3);
                    document.getElementById('viewGender').value = userData.staff_gender;
                    document.getElementById('viewRegion').value = userData.staff_region;
                    document.getElementById('viewProvince').value = userData.staff_province;
                    document.getElementById('viewCity').value = userData.staff_city;
                    document.getElementById('viewBarangay').value = userData.staff_barangay;
                    document.getElementById('viewAddressInfo').value = userData.staff_address_info;

                    // Show the modal
                    $('#viewStaffModal').modal('show');
                }
            });
        }, { onlyOnce: true });
    } else {
        console.error("User is not logged in.");
    }
}





// Delete Button Functionality
function deleteButtonClicked(e, idnumber) {
    e.stopPropagation();

    const user = auth.currentUser;

    if (user) {
        const uid = user.uid;

        $('#confirmationModal').modal('show');

        document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
            $('#confirmationModal').modal('hide');

            const dbRef = ref(db, `Registered_Accounts/${uid}/Staff_Management`);

            onValue(dbRef, (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    if (childSnapshot.val().idnumber === idnumber) {
                        remove(ref(db, `Registered_Accounts/${uid}/Staff_Management/${childSnapshot.key}`))
                            .then(() => {
                                alert("User deleted successfully!");
                                GetAllDataOnce();
                            })
                            .catch((error) => {
                                console.error("Error deleting user: ", error.message);
                                alert("Error deleting user. Please try again.");
                            });
                    }
                });
            }, { onlyOnce: true });
        });
    } else {
        console.error("User is not logged in.");
    }
}

// Event listeners for first name, middle name, and last name
staff_FirstnameInput.addEventListener('input', () => {
    if (isValidName(staff_FirstnameInput.value)) {
        staff_FirstnameInput.classList.remove('is-invalid');
        staff_FirstnameInput.classList.add('is-valid');
        editstaff_firstNameFeedback.style.display = 'none';
    } else {
        staff_FirstnameInput.classList.remove('is-valid');
        staff_FirstnameInput.classList.add('is-invalid');
        editstaff_firstNameFeedback.innerText = "*Invalid first name.";
        editstaff_firstNameFeedback.style.display = 'block';
    }
});

//Middle name input validation
staff_MiddlenameInput.addEventListener('input', () => {
    if (isValidName(staff_MiddlenameInput.value)) {
        staff_MiddlenameInput.classList.remove('is-invalid');
        staff_MiddlenameInput.classList.add('is-valid');
        editstaff_middlenameFeedback.style.display = 'none';
    } else {
        staff_MiddlenameInput.classList.remove('is-valid');
        staff_MiddlenameInput.classList.add('is-invalid');
        editstaff_middleNameFeedback.innerText = "*Invalid middle name.";
        editstaff_middleNameFeedback.style.display = 'block';
    }
});

// Last name input validation
staff_LastnameInput.addEventListener('input', () => {
    if (isValidName(staff_LastnameInput.value)) {
        staff_LastnameInput.classList.remove('is-invalid');
        staff_LastnameInput.classList.add('is-valid');
        editstaff_lastNameFeedback.style.display = 'none';
    } else {
        staff_LastnameInput.classList.remove('is-valid');
        staff_LastnameInput.classList.add('is-invalid');
        editstaff_lastNameFeedback.innerText = "*Invalid last name.";
        editstaff_lastNameFeedback.style.display = 'block';
    }
});

// Event listener for contact number validation
staffcontactNoInput.addEventListener('input', () => {
    const invalidFeedback = staffcontactNoInput.nextElementSibling;

    if (isValidContactNo(staffcontactNoInput.value)) {
        staffcontactNoInput.classList.remove('is-invalid');
        staffcontactNoInput.classList.add('is-valid');
        invalidFeedback.style.display = 'none';
    } else {
        staffcontactNoInput.classList.remove('is-valid');
        staffcontactNoInput.classList.add('is-invalid');
        invalidFeedback.innerText = "*Invalid contact number";
        invalidFeedback.style.display = 'block';
    }
});