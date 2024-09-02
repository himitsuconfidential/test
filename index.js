const ROWS_PER_PAGE = 2000;
let allRows = [];
let selectedRows = [];
let currentPage = 1;
let totalPages = 1;

// Read the CSV file
fetch('flight_data.csv')
    .then(response => response.text())
    .then(csvData => {
        allRows = csvData.split('\r\n');
        selectedRows = csvData.split('\r\n')
        const tableBody = document.getElementById('flight-data-tbody');
        const tableHeader = document.getElementById('flight-data-table').querySelector('thead');
        
        // Create the table header
        const headerRow = document.createElement('tr');
        const headerColumns = allRows[0].split(',');
        headerColumns.forEach(column => {
            const headerCell = document.createElement('th');
            headerCell.textContent = column;
            headerRow.appendChild(headerCell);
        });
        tableHeader.appendChild(headerRow);

        totalPages = Math.ceil((allRows.length - 1) / ROWS_PER_PAGE);
        document.getElementById('total-pages').textContent = totalPages;

        renderPage(currentPage);

        // Add event listeners for pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
            }
        });

        document.getElementById('current-page').addEventListener('change', (e) => {
            const newPage = parseInt(e.target.value);
            if (newPage >= 1 && newPage <= totalPages) {
                currentPage = newPage;
                renderPage(currentPage);
            }
        });

        // Add event listener to apply filters button
        document.getElementById('apply-filters').addEventListener('click', applyFilters);

        // Add event listener for the download button
        document.getElementById('download-csv').addEventListener('click', downloadCSV);
    });

function renderPage(page) {
    const tableBody = document.getElementById('flight-data-tbody');
    tableBody.innerHTML = '';
    const start = (page - 1) * ROWS_PER_PAGE + 1;
    const end = Math.min(start + ROWS_PER_PAGE, selectedRows.length);

    for (let i = start; i < end; i++) {
        const columns = selectedRows[i].split(',');
        const tableRow = document.createElement('tr');
        tableRow.onclick = (event) => showDetails(tableRow);
        columns.forEach((column) => {
            const tableCell = document.createElement('td');
            tableCell.textContent = column;
            tableRow.appendChild(tableCell);
        });
        tableBody.appendChild(tableRow);
    }

    document.getElementById('current-page').value = page;
}

function applyFilters() {
    const ExtractionDateFilter = document.getElementById('extraction-number-filter').value;
    const DepartDateFilter = document.getElementById('depart-date-filter').value;
    const AirlineCodeFilter = document.getElementById('airline-code-filter').value;
    const DepartTimeFilter = document.getElementById('depart-time-filter').value;

    const filteredRows = allRows.filter((row, index) => {
        if (index === 0) return true; // include header row
        const columns = row.split(','); 
        return (ExtractionDateFilter === '' || new RegExp(ExtractionDateFilter).test(columns[0])) &&
               (DepartDateFilter === '' || new RegExp(DepartDateFilter).test(columns[1])) &&
               (AirlineCodeFilter === '' || new RegExp(AirlineCodeFilter).test(columns[3])) &&
               (DepartTimeFilter === '' || new RegExp(DepartTimeFilter).test(columns[5]));
    });

    selectedRows = filteredRows;
    totalPages = Math.ceil((selectedRows.length - 1) / ROWS_PER_PAGE);
    document.getElementById('total-pages').textContent = totalPages;
    currentPage = 1;
    renderPage(currentPage);
}

function downloadCSV() {
    if (selectedRows.length === 0) {
        alert('No data to download');
        return;
    }

    //selectedRows already has the header row in 0th position
    const csvContent = selectedRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'filtered_flight_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function showDetails(row) {
    console.log('showing details')
    var cells = row.getElementsByTagName("td");
    var locationMapping = {"HKG":"香港HKG", "NRT":"東京NRT", "HND":"東京HND"}
    var baggageMapping = {"YesYes": "Both checked baggage and carry on baggage", "YesNo": "Only checked baggage", "NoYes": "Only carry on baggage", "NoNo": "No baggage"}
    var baggageString = baggageMapping[cells[10].innerHTML + cells[11].innerHTML]
    var details = 
    `<p>Time: ${cells[1].innerHTML} ${cells[5].innerHTML} → ${cells[6].innerHTML} (Totally ${cells[7].innerHTML})</p>
    <p>Location: ${locationMapping[cells[8].innerHTML]} → ${locationMapping[cells[9].innerHTML]}</p>
    <p>Airline: ${cells[2].innerHTML} (${cells[3].innerHTML})</p>
    <p>Baggage policy: ${baggageString}</p>`;

    var morePriceData = ``
    const tableBody = document.getElementById('more-price-data-tbody');
    tableBody.innerHTML = '';
    const sameFlightRows = allRows.filter((row, index) => {
        const columns = row.split(',');
        
        for (let i of [1,2,3,5,6,7,8,9,10]){
            if (columns[i] !== cells[i].innerHTML) 
                return false;
        }

        return true;
    });
    console.log(sameFlightRows)
    for (let sameFlightRow of sameFlightRows) {
        const columns = sameFlightRow.split(',');
        const tableRow = document.createElement('tr');
        tableRow.innerHTML = `<td> ${columns[0]} </td> <td> ${columns[4]} </td>`
        
        tableBody.appendChild(tableRow);
    }
    
    document.getElementById("record-details").innerHTML = details + morePriceData;
    document.getElementById("modal").style.display = "block";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Close the modal when clicking or tapping outside of it
window.onclick = function(event) {
    var modal = document.getElementById("modaal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.querySelector('#modal').addEventListener('touchend', function(e) {
        closeModal();
        e.preventDefault();
});
