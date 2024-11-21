import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
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

let userID = 0;
let tbody = document.getElementById('tbody1');

function StaffManagement(company_email, company_name, company_branch, company_city) {
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
    td2.innerHTML = company_email;
    td3.innerHTML = company_name;
    td4.innerHTML = company_branch;
    td5.innerHTML = company_city;

    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-center', 'flex-column', 'gap-2', 'flex-sm-row');

    let viewBtn = document.createElement('button');
    viewBtn.type = "button";
    viewBtn.className = "btn text-sm";
    viewBtn.style.backgroundColor = "rgb(49, 101, 147)";
    viewBtn.style.color = "white";
    viewBtn.innerHTML = "<img src='images/icons/view.png' alt='View'> View";
    viewBtn.addEventListener('click', function () {
        viewButtonClicked(company_email);
    });

    buttonContainer.appendChild(viewBtn);

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
        StaffManagement(element.company_email, element.company_name, element.company_branch, element.company_city);
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
    const dbRef = ref(db, "Registered_Accounts");

    onValue(dbRef, (snapshot) => {
        var users = [];

        snapshot.forEach(childSnapshot => {
            users.push(childSnapshot.val());
        });

        AddAllItemsToTable(users);
    });
}

window.onload = GetAllDataOnce;

function viewButtonClicked(company_email) {
    const dbRef = ref(db, "Registered_Accounts");

    onValue(dbRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().company_email === company_email) {
                const userData = childSnapshot.val();

                // Populate modal fields with user data
                document.getElementById("viewFirstname").value = userData.firstname;
                document.getElementById("viewMiddlename").value = userData.middlename;
                document.getElementById("viewLastname").value = userData.lastname;
                document.getElementById("viewContactNo").value = userData.contact_no.slice(3);
                document.getElementById('viewGender').value = userData.gender;
                document.getElementById('viewEmail').value = userData.email;
                document.getElementById('viewRegion').value = userData.region;
                document.getElementById('viewProvince').value = userData.province;
                document.getElementById('viewCity').value = userData.city;
                document.getElementById('viewBarangay').value = userData.barangay;
                document.getElementById('viewAddressInfo').value = userData.address_info;
                document.getElementById('viewCompanyName').value = userData.company_name;
                document.getElementById('viewCompanyBranch').value = userData.company_branch;
                document.getElementById('viewCompanyEmail').value = userData.company_email;
                document.getElementById('viewTelephoneNo').value = userData.company_telephone_no;
                document.getElementById('viewCompanyAddressInfo').value = userData.company_address;
                document.getElementById('viewCompanyRegion').value = userData.company_region;
                document.getElementById('viewCompanyProvince').value = userData.company_province;
                document.getElementById('viewCompanyCity').value = userData.company_city;
                document.getElementById('viewCompanyBarangay').value = userData.company_barangay;

                // Show the modal
                $('#viewAccountModal').modal('show');
            }
        });
    }, { onlyOnce: true });
}
