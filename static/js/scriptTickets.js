document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const ticketsList = document.getElementById('ticketsList');

    if (!uploadArea || !fileInput || !ticketsList) {
        console.error('One or more required elements are missing from the DOM');
        return;
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.classList.add('highlight');
    }

    function unhighlight() {
        uploadArea.classList.remove('highlight');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        ([...files]).forEach(uploadFile);
    }

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('http://127.0.0.1:8000/upload', {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
    
            const result = await response.json();
            console.log('Upload result:', result);
            if (result.passenger) {
                addTicketToList(result.passenger);
            } else {
                console.error('Invalid response format:', result);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Failed to upload file: ${error.message}`);
        }
    }
    
    function addTicketToList(ticket) {
        if (!ticket || !ticket.airline_name || !ticket.reservation_code) {
            console.error('Invalid ticket data:', ticket);
            return;
        }
    
        const ticketElement = document.createElement('div');
        ticketElement.className = 'col-md-6 col-lg-4';
        ticketElement.innerHTML = `
            <div class="ticket-card">
                <div class="card-header d-flex align-items-center">
                    <img src="https://via.placeholder.com/50" alt="${ticket.airline_name} logo" class="airline-logo">
                    <span>${ticket.airline_name}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${ticket.reservation_code}</h5>
                    <p class="card-text">
                        <strong>From:</strong> ${ticket.origin || 'N/A'}<br>
                        <strong>To:</strong> ${ticket.destination || 'N/A'}<br>
                        <strong>Date:</strong> ${ticket.date || 'N/A'}<br>
                        <strong>Boarding Time:</strong> ${ticket.boarding_time || 'N/A'}<br>
                        <strong>Seat:</strong> ${ticket.seat_number || 'N/A'}<br>
                        <strong>Passenger:</strong> ${ticket.passenger_name || 'N/A'}
                    </p>
                </div>
            </div>
        `;
        ticketsList.appendChild(ticketElement);
    }

    async function loadExistingTickets() {
        try {
            const response = await fetch('http://127.0.0.1:8000/passengers');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new TypeError("Oops, we haven't got JSON!");
            }
            const tickets = await response.json();
            tickets.forEach(addTicketToList);
        } catch (error) {
            console.error('Error loading existing tickets:', error);
        }
    }

    loadExistingTickets();

    function initCharts() {
        const canvas = document.getElementById('myChartCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            //     type: 'bar',
            //     data: {
            //         labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            //         datasets: [{
            //             label: '# of Votes',
            //             data: [12, 19, 3, 5, 2, 3],
            //             backgroundColor: [
            //                 'rgba(255, 99, 132, 0.2)',
            //                 'rgba(54, 162, 235, 0.2)',
            //                 'rgba(255, 206, 86, 0.2)',
            //                 'rgba(75, 192, 192, 0.2)',
            //                 'rgba(153, 102, 255, 0.2)',
            //                 'rgba(255, 159, 64, 0.2)'
            //             ],
            //             borderColor: [
            //                 'rgba(255, 99, 132, 1)',
            //                 'rgba(54, 162, 235, 1)',
            //                 'rgba(255, 206, 86, 1)',
            //                 'rgba(75, 192, 192, 1)',
            //                 'rgba(153, 102, 255, 1)',
            //                 'rgba(255, 159, 64, 1)'
            //             ],
            //             borderWidth: 1
            //         }]
            //     },
            //     options: {
            //         scales: {
            //             y: {
            //                 beginAtZero: true
            //             }
            //         }
            //     }
            // });
        } else {
            console.error('Chart canvas not found');
        }
    }

    const chartCanvas = document.getElementById('myChartCanvas');
    if (chartCanvas) {
        initCharts();
    }
});