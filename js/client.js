var userID = 0;
        var tbody = document.getElementById('tbody1');

        function StaffManagement(idnumber, position, firstname, lastname) {
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
            td4.innerHTML = firstname;
            td5.innerHTML = lastname;

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

            let deleteBtn = document.createElement('button');
            deleteBtn.type = "button";
            deleteBtn.className = "btn btn-danger text-sm";
            deleteBtn.innerHTML = "<img src='images/icons/delete_user.png' alt='Delete'> Delete";
            deleteBtn.addEventListener('click', function (e) {
                deleteButtonClicked(e, idnumber);
            });

            buttonContainer.appendChild(editBtn);
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
        
            // Populate the table with the new data
            TheUser.reverse().forEach(element => {
                StaffManagement(element.idnumber, element.position, element.firstname, element.lastname);
            });
        
            // Check if the DataTable is already initialized and destroy it
            if ($.fn.DataTable.isDataTable('#example')) {
                $('#example').DataTable().clear();  // Clear the data in the DataTable
                $('#example').DataTable().destroy();  // Destroy the existing DataTable instance
            }
        
            // Reinitialize the DataTable
            $(document).ready(function () {
                var table = $('#example').DataTable({
                    buttons: [
                        {
                            extend: 'copy',
                            exportOptions: { columns: ':not(:last-child)' }  // Exclude the last column
                        },
                        {
                            extend: 'csv',
                            exportOptions: { columns: ':not(:last-child)' }
                        },
                        {
                            extend: 'excel',
                            exportOptions: { columns: ':not(:last-child)' }
                        },
                        {
                            extend: 'pdf',
                            exportOptions: { columns: ':not(:last-child)' }
                        },
                        {
                            extend: 'print',
                            exportOptions: { columns: ':not(:last-child)' }
                        }
                    ]
                });
        
                // Move the buttons to a specific location
                table.buttons().container().appendTo('#example_wrapper .col-md-6:eq(0)');
            });
        }
        



        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
        import { getDatabase, set, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

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

        function GetAllDataOnce() {
            const dbRef = ref(db, "Staff_Management");

            onValue(dbRef, (snapshot) => {
                var users = [];

                snapshot.forEach(childSnapshot => {
                    users.push(childSnapshot.val());
                });

                AddAllItemsToTable(users);
            });
        }

        window.onload = GetAllDataOnce;

        let originalData = {}; // Store original data here

        function editButtonClicked(idnumber) {
            const dbRef = ref(db, "Staff_Management");

            onValue(dbRef, (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    if (childSnapshot.val().idnumber === idnumber) {
                        const userData = childSnapshot.val();

                        // Populate modal fields with selected user data
                        document.getElementById("editIDNumber").value = userData.idnumber;
                        document.getElementById("editPosition").value = userData.position;
                        document.getElementById("editFirstname").value = userData.firstname;
                        document.getElementById("editMiddlename").value = userData.middlename;
                        document.getElementById("editLastname").value = userData.lastname;
                        document.getElementById("editContactNo").value = userData.contact_no;
                        document.getElementById("editHouseNo").value = userData.house_no;
                        document.getElementById("editStreet").value = userData.street;
                        document.getElementById("editBarangay").value = userData.barangay;
                        document.getElementById("editCity").value = userData.city;
                        document.getElementById("editProvince").value = userData.province;

                        // Save the original data for comparison
                        originalData = { ...userData };

                        // Set the user key in the Save button attribute
                        document.getElementById("saveEditBtn").setAttribute("data-user-key", childSnapshot.key);

                        // Show the modal
                        $('#editStaffModal').modal('show');
                    }
                });
            }, { onlyOnce: true });
        }


        document.getElementById("saveEditBtn").addEventListener("click", function () {
            const userKey = this.getAttribute("data-user-key");

            // Updated data from modal inputs
            const updatedData = {
                idnumber: document.getElementById("editIDNumber").value,
                position: document.getElementById("editPosition").value,
                firstname: document.getElementById("editFirstname").value,
                middlename: document.getElementById("editMiddlename").value,
                lastname: document.getElementById("editLastname").value,
                contact_no: document.getElementById("editContactNo").value,
                house_no: document.getElementById("editHouseNo").value,
                street: document.getElementById("editStreet").value,
                barangay: document.getElementById("editBarangay").value,
                city: document.getElementById("editCity").value,
                province: document.getElementById("editProvince").value
            };

            // Check if any data has changed
            const dataHasChanged = Object.keys(updatedData).some(key => updatedData[key] !== originalData[key]);

            if (dataHasChanged && userKey) {
                const userRef = ref(db, `Staff_Management/${userKey}`);

                set(userRef, updatedData)
                    .then(() => {
                        // Hide the edit staff modal
                        $('#editStaffModal').modal('hide');

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
        });


        function deleteButtonClicked(e, idnumber) {
            e.stopPropagation();
            $('#confirmationModal').modal('show');

            document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
                $('#confirmationModal').modal('hide');
                const dbRef = ref(db, "Staff_Management");

                onValue(dbRef, (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        if (childSnapshot.val().idnumber === idnumber) {
                            remove(ref(db, `Staff_Management/${childSnapshot.key}`))
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
                });
            });
        }