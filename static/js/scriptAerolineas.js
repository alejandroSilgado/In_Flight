document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previousUploads = document.getElementById('previousUploads');
    const editExcelModal = new bootstrap.Modal(document.getElementById('editExcelModal'));
    let hot; // Handsontable instance

    // Drag and drop functionality
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
        uploadArea.classList.add('dragover');
    }

    function unhighlight() {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        ([...files]).forEach(uploadFile);
    }

    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload-airline-excel', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error uploading file');
            }

            const result = await response.json();
            addExcelToList({
                name: file.name,
                date: new Date().toLocaleDateString(),
                size: formatBytes(file.size)
            });
            console.log('File uploaded successfully:', result);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function addExcelToList(excel) {
        const excelElement = document.createElement('div');
        excelElement.className = 'col-md-4';
        excelElement.innerHTML = `
            <div class="excel-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${excel.name}</span>
                    <button class="btn btn-sm btn-outline-light edit-excel">Editar</button>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        <strong>Fecha de carga:</strong> ${excel.date}<br>
                        <strong>Tamaño:</strong> ${excel.size}
                    </p>
                </div>
            </div>
        `;
        previousUploads.appendChild(excelElement);

        excelElement.querySelector('.edit-excel').addEventListener('click', () => openExcelEditor(excel));
    }

    function openExcelEditor(excel) {
        // In a real application, you would load the actual Excel data here
        const sampleData = [
            ['Aerolínea', 'Código', 'País'],
            ['Delta Air Lines', 'DL', 'Estados Unidos'],
            ['Lufthansa', 'LH', 'Alemania'],
            ['Emirates', 'EK', 'Emiratos Árabes Unidos']
        ];

        const container = document.getElementById('excelEditor');
        hot = new Handsontable(container, {
            data: sampleData,
            rowHeaders: true,
            colHeaders: true,
            height: 'auto',
            licenseKey: 'non-commercial-and-evaluation'
        });

        editExcelModal.show();
    }

    document.getElementById('saveExcelChanges').addEventListener('click', function() {
        // Here you would typically send the updated data to your server
        console.log('Excel data saved:', hot.getData());
        editExcelModal.hide();
    });

    // Simulate some initial uploads
    const sampleUploads = [
        { name: 'Aerolineas_2023.xlsx', date: '2023-06-01', size: '1.2 MB' },
        { name: 'Nuevas_rutas.xlsx', date: '2023-05-15', size: '890 KB' }
    ];

    sampleUploads.forEach(addExcelToList);
});
