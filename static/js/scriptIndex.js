// Fetch dashboard data
async function fetchDashboardData() {
    try {
        const response = await fetch('/dashboard-data');
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

// Update dashboard elements
function updateDashboard(data) {
    document.getElementById('totalPassengers').textContent = data.total_passengers;
    document.getElementById('totalAirlines').textContent = data.total_airlines;

    updateAirlinePieChart(data.all_airlines);
    updateTopCitiesChart(data.top_cities);
    updateFlightHistogram(data.flight_info);
}

// Update airline pie chart
function updateAirlinePieChart(allAirlines) {
    const ctx = document.getElementById('airlineBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(allAirlines),
            datasets: [{
                label: 'Distribución de Aerolíneas',
                data: Object.values(allAirlines),
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            }
        }
    });
}

// Update top cities bar chart
function updateTopCitiesChart(topCities) {
    const ctx = document.getElementById('topDestinationsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(topCities),
            datasets: [{
                label: 'Top 3 Ciudades',
                data: Object.values(topCities),
                backgroundColor: 'rgba(153, 102, 255, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update flight information histogram
function updateFlightHistogram(flightInfo) {
    const ctx = document.getElementById('flightHistogram').getContext('2d');
    const labels = flightInfo.map(info => info.passenger_name);
    const reservationCodes = flightInfo.map(info => info.reservation_code);
    const statuses = flightInfo.map(info => info.status);
    const colors = statuses.map(status => status === 'Fecha pasada' ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75, 192, 192, 0.6)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Código de reserva',
                data: reservationCodes,
                backgroundColor: colors,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const status = statuses[tooltipItem.dataIndex];
                            return `${tooltipItem.label}: ${reservationCodes[tooltipItem.dataIndex]} (${status})`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize dashboard
async function initDashboard() {
    const data = await fetchDashboardData();
    if (data) {
        updateDashboard(data);
    }
}

// Call initDashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard);
