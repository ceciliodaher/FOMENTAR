// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const spedFileButtonLabel = document.querySelector('label[for="spedFile"]');
    const spedFileInput = document.getElementById('spedFile');
    const selectedSpedFileText = document.getElementById('selectedSpedFile');
    const excelFileNameInput = document.getElementById('excelFileName');
    const progressBar = document.getElementById('progressBar');
    const statusMessage = document.getElementById('statusMessage');
    const convertButton = document.getElementById('convertButton');
    const dropZone = document.getElementById('dropZone');
    const logWindow = document.getElementById('logWindow'); // Added logWindow

    // --- Global/Shared Variables ---
    let spedFile = null;
    let spedFileContent = '';
    let sharedNomeEmpresa = "Empresa"; // For sharing extracted header info
    let sharedPeriodo = "";
    let fomentarData = null; // FOMENTAR specific data
    let registrosCompletos = null; // Complete SPED records for FOMENTAR
    
    // Multi-period variables
    let multiPeriodData = []; // Array of period data objects
    let selectedPeriodIndex = 0; // Currently selected period for display
    let currentImportMode = 'single'; // 'single' or 'multiple'
    
    // ProGoiás variables
    let progoisData = null; // ProGoiás specific data
    let progoisRegistrosCompletos = null; // Complete SPED records for ProGoiás
    let progoisMultiPeriodData = []; // Array of ProGoiás period data objects
    let progoisSelectedPeriodIndex = 0; // Currently selected period for ProGoiás display
    let progoisCurrentImportMode = 'single'; // 'single' or 'multiple' for ProGoiás

    // --- Event Listeners ---
    // spedFileButtonLabel.addEventListener('click', () => { // This is handled by <label for="spedFile">
    //     spedFileInput.click(); 
    // });

    // convertButton listener remains
    convertButton.addEventListener('click', iniciarConversao);

    // Tab navigation listeners
    document.getElementById('tabConverter').addEventListener('click', () => switchTab('converter'));
    document.getElementById('tabFomentar').addEventListener('click', () => switchTab('fomentar'));
    document.getElementById('tabProgoias').addEventListener('click', () => switchTab('progoias'));

    // FOMENTAR listeners
    document.getElementById('importSpedFomentar').addEventListener('click', importSpedForFomentar);
    document.getElementById('exportFomentar').addEventListener('click', exportFomentarReport);
    document.getElementById('exportFomentarMemoria').addEventListener('click', exportFomentarMemoriaCalculo);
    document.getElementById('printFomentar').addEventListener('click', printFomentarReport);
    
    // ProGoiás listeners
    document.getElementById('importSpedProgoias').addEventListener('click', importSpedForProgoias);
    document.getElementById('exportProgoias').addEventListener('click', exportProgoisReport);
    document.getElementById('exportProgoisMemoria').addEventListener('click', exportProgoisMemoriaCalculo);
    document.getElementById('printProgoias').addEventListener('click', printProgoisReport);
    
    // Configuration listeners
    document.getElementById('programType').addEventListener('change', handleConfigChange);
    document.getElementById('percentualFinanciamento').addEventListener('input', handleConfigChange);
    document.getElementById('icmsPorMedia').addEventListener('input', handleConfigChange);
    document.getElementById('saldoCredorAnterior').addEventListener('input', handleConfigChange);
    
    // ProGoiás Configuration listeners
    document.getElementById('progoisTipoEmpresa').addEventListener('change', handleProgoisConfigChange);
    document.getElementById('progoisAno').addEventListener('change', handleProgoisConfigChange);
    document.getElementById('progoisIcmsPorMedia').addEventListener('input', handleProgoisConfigChange);
    document.getElementById('progoisSaldoCredorAnterior').addEventListener('input', handleProgoisConfigChange);
    document.getElementById('processProgoisData').addEventListener('click', processProgoisData);
    
    // Multi-period listeners
    document.querySelectorAll('input[name="importMode"]').forEach(radio => {
        radio.addEventListener('change', handleImportModeChange);
    });
    document.getElementById('selectMultipleSpeds').addEventListener('click', () => {
        document.getElementById('multipleSpedFiles').click();
    });
    document.getElementById('multipleSpedFiles').addEventListener('change', handleMultipleSpedSelection);
    document.getElementById('processMultipleSpeds').addEventListener('click', processMultipleSpeds);
    document.getElementById('viewSinglePeriod').addEventListener('click', () => switchView('single'));
    document.getElementById('viewComparative').addEventListener('click', () => switchView('comparative'));
    document.getElementById('exportComparative').addEventListener('click', exportComparativeReport);
    document.getElementById('exportPDF').addEventListener('click', exportComparativePDF);
    
    // ProGoiás Multi-period listeners
    document.querySelectorAll('input[name="importModeProgoias"]').forEach(radio => {
        radio.addEventListener('change', handleProgoisImportModeChange);
    });
    document.getElementById('selectMultipleSpedsProgoias').addEventListener('click', () => {
        document.getElementById('multipleSpedFilesProgoias').click();
    });
    document.getElementById('multipleSpedFilesProgoias').addEventListener('change', handleProgoisMultipleSpedSelection);
    document.getElementById('progoisViewSinglePeriod').addEventListener('click', () => switchProgoisView('single'));
    document.getElementById('progoisViewComparative').addEventListener('click', () => switchProgoisView('comparative'));
    document.getElementById('exportProgoisComparative').addEventListener('click', exportProgoisComparativeReport);
    document.getElementById('exportProgoisPDF').addEventListener('click', exportProgoisComparativePDF);

    // Drag and Drop Event Listeners for dropZone (main converter)
    if (dropZone) {
        // For the drop zone itself
        dropZone.addEventListener('dragenter', handleDragEnter, false);
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('dragleave', handleDragLeave, false);
        dropZone.addEventListener('drop', handleFileDrop, false); // Renamed from handleDrop to avoid conflict if any

        // For the document body - to prevent browser default behavior for unhandled drops / drags
        document.body.addEventListener('dragover', function(e) {
            e.preventDefault(); // Only prevent default to allow drop cursor, don't highlight body
            e.stopPropagation();
        }, false);
        document.body.addEventListener('drop', function(e) {
            e.preventDefault(); // Prevent browser opening file if dropped outside zone
            e.stopPropagation();
        }, false);
    }
    
    // Drag and Drop Event Listeners for FOMENTAR single dropZone
    const fomentarDropZone = document.getElementById('fomentarDropZone');
    if (fomentarDropZone) {
        fomentarDropZone.addEventListener('dragenter', handleFomentarDragEnter, false);
        fomentarDropZone.addEventListener('dragover', handleFomentarDragOver, false);
        fomentarDropZone.addEventListener('dragleave', handleFomentarDragLeave, false);
        fomentarDropZone.addEventListener('drop', handleFomentarFileDrop, false);
    }
    
    // Drag and Drop Event Listeners for multipleDropZone
    const multipleDropZone = document.getElementById('multipleDropZone');
    if (multipleDropZone) {
        multipleDropZone.addEventListener('dragenter', handleMultipleDragEnter, false);
        multipleDropZone.addEventListener('dragover', handleMultipleDragOver, false);
        multipleDropZone.addEventListener('dragleave', handleMultipleDragLeave, false);
        multipleDropZone.addEventListener('drop', handleMultipleFileDrop, false);
    }
    
    // Drag and Drop Event Listeners for ProGoiás single dropZone
    const progoisDropZone = document.getElementById('progoisDropZone');
    if (progoisDropZone) {
        progoisDropZone.addEventListener('dragenter', handleProgoisDragEnter, false);
        progoisDropZone.addEventListener('dragover', handleProgoisDragOver, false);
        progoisDropZone.addEventListener('dragleave', handleProgoisDragLeave, false);
        progoisDropZone.addEventListener('drop', handleProgoisFileDrop, false);
    }

    // Drag and Drop Event Listeners for ProGoiás multipleDropZone
    const multipleDropZoneProgoias = document.getElementById('multipleDropZoneProgoias');
    if (multipleDropZoneProgoias) {
        multipleDropZoneProgoias.addEventListener('dragenter', handleProgoisMultipleDragEnter, false);
        multipleDropZoneProgoias.addEventListener('dragover', handleProgoisMultipleDragOver, false);
        multipleDropZoneProgoias.addEventListener('dragleave', handleProgoisMultipleDragLeave, false);
        multipleDropZoneProgoias.addEventListener('drop', handleProgoisMultipleFileDrop, false);
    }

    // --- Functions --- (New/Modified Drag and Drop handlers)

    // Keep preventDefaults as a general utility if needed elsewhere, or inline its logic
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDragEnter(e) {
        preventDefaults(e);
        highlight(e); // Existing highlight function
    }

    function handleDragOver(e) {
        preventDefaults(e);
        highlight(e); // Keep highlighted if dragging over
    }

    function handleDragLeave(e) {
        preventDefaults(e);
        if (!dropZone.contains(e.relatedTarget)) {
          unhighlight(e); 
        }
    }
    
    // === FOMENTAR Single File Drag and Drop Handlers ===
    function highlightFomentarZone() {
        const fomentarDropZone = document.getElementById('fomentarDropZone');
        if (fomentarDropZone) {
            fomentarDropZone.classList.add('dragover');
        }
    }
    
    function unhighlightFomentarZone() {
        const fomentarDropZone = document.getElementById('fomentarDropZone');
        if (fomentarDropZone) {
            fomentarDropZone.classList.remove('dragover');
        }
    }
    
    function handleFomentarDragEnter(e) {
        preventDefaults(e);
        highlightFomentarZone();
    }
    
    function handleFomentarDragOver(e) {
        preventDefaults(e);
        highlightFomentarZone();
    }
    
    function handleFomentarDragLeave(e) {
        preventDefaults(e);
        const fomentarDropZone = document.getElementById('fomentarDropZone');
        if (!fomentarDropZone.contains(e.relatedTarget)) {
            unhighlightFomentarZone();
        }
    }
    
    function handleFomentarFileDrop(e) {
        preventDefaults(e);
        unhighlightFomentarZone();
        
        const files = Array.from(e.dataTransfer.files);
        const txtFiles = files.filter(file => file.name.toLowerCase().endsWith('.txt'));
        
        if (txtFiles.length === 0) {
            addLog('Erro: Nenhum arquivo .txt encontrado para FOMENTAR', 'error');
            return;
        }
        
        if (txtFiles.length > 1) {
            addLog('Aviso: Múltiplos arquivos detectados. Usando apenas o primeiro.', 'warning');
        }
        
        const file = txtFiles[0];
        addLog(`Arquivo SPED detectado para FOMENTAR: ${file.name}`, 'info');
        
        // Processar o arquivo usando a função existente
        processSpedFile(file).then(() => {
            if (spedFileContent) {
                processFomentarData();
            }
        });
    }
    
    function highlight(e) {
        // preventDefaults(e); // Called by specific handlers
        dropZone.classList.add('highlight');
        dropZone.classList.add('dragover');
        // addLog("Arquivo detectado sobre a área de soltar.", "info"); // Optional: can be verbose
    }

    function unhighlight(e) {
        // preventDefaults(e); // Called by specific handlers
        dropZone.classList.remove('highlight');
        dropZone.classList.remove('dragover');
        // addLog("Detecção de arquivo sobre a área removida.", "info"); // Optional: can be verbose
    }
    
    // === Multiple Files Drag and Drop Handlers ===
    
    function handleMultipleDragEnter(e) {
        preventDefaults(e);
        highlightMultipleZone();
    }
    
    function handleMultipleDragOver(e) {
        preventDefaults(e);
        highlightMultipleZone();
    }
    
    function handleMultipleDragLeave(e) {
        preventDefaults(e);
        const multipleDropZone = document.getElementById('multipleDropZone');
        if (!multipleDropZone.contains(e.relatedTarget)) {
            unhighlightMultipleZone();
        }
    }
    
    function handleMultipleFileDrop(e) {
        preventDefaults(e);
        unhighlightMultipleZone();
        
        const files = Array.from(e.dataTransfer.files);
        const txtFiles = files.filter(file => file.name.toLowerCase().endsWith('.txt'));
        
        if (txtFiles.length === 0) {
            addLog('Erro: Nenhum arquivo .txt encontrado', 'error');
            return;
        }
        
        if (txtFiles.length !== files.length) {
            addLog(`Aviso: ${files.length - txtFiles.length} arquivo(s) ignorado(s) (apenas .txt são aceitos)`, 'warning');
        }
        
        // Set files to the input element
        const dt = new DataTransfer();
        txtFiles.forEach(file => dt.items.add(file));
        document.getElementById('multipleSpedFiles').files = dt.files;
        
        // Trigger the selection handler
        handleMultipleSpedSelection({ target: { files: txtFiles } });
        
        addLog(`${txtFiles.length} arquivo(s) SPED adicionado(s) via drag & drop`, 'success');
    }
    
    function highlightMultipleZone() {
        const multipleDropZone = document.getElementById('multipleDropZone');
        if (multipleDropZone) {
            multipleDropZone.classList.add('dragover');
        }
    }
    
    function unhighlightMultipleZone() {
        const multipleDropZone = document.getElementById('multipleDropZone');
        if (multipleDropZone) {
            multipleDropZone.classList.remove('dragover');
        }
    }

    function handleFileDrop(e) { 
        preventDefaults(e); 
        unhighlight(e);

        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const fileToProcess = files[0]; 
            addLog(`Arquivo "${fileToProcess.name}" solto na área.`, "info");
            if (fileToProcess.name.toLowerCase().endsWith('.txt')) {
                processSpedFile(fileToProcess); 
            } else {
                addLog(`Tipo de arquivo "${fileToProcess.name}" não suportado. Use .txt.`, 'error');
                showError("Por favor, solte apenas arquivos .txt (SPED).");
                // updateStatus is called by showError
            }
        } else {
            addLog("Nenhum arquivo foi solto.", 'warn');
        }
    }


    // Refactor existing file selection logic
    // Old: spedFileInput.addEventListener('change', handleSpedFileSelect);
    // New:
    spedFileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            processSpedFile(files[0]);
        }
    });


    // New function to process the file, whether from input or drop
    async function processSpedFile(fileToProcess) {
        clearLogs(); // Clear logs for new file processing
        addLog(`Processando arquivo: ${fileToProcess.name}`, "info");

        if (!fileToProcess) {
            selectedSpedFileText.textContent = 'Nenhum arquivo selecionado';
            excelFileNameInput.value = '';
            spedFile = null;
            spedFileContent = '';
            addLog("Nenhum arquivo para processar.", "warn");
            return;
        }

        spedFile = fileToProcess; 
        selectedSpedFileText.textContent = `Arquivo selecionado: ${spedFile.name}`;
        updateStatus('Analisando arquivo...', 5);
        // addLog('Analisando arquivo...', 'info'); // Redundant with updateStatus if it also logs

        try {
            updateStatus('Lendo arquivo SPED...', 10);
            addLog('Lendo arquivo SPED...', 'info');
            const arrayBuffer = await spedFile.arrayBuffer(); 
            const { encoding, content } = await detectAndRead(arrayBuffer);
            spedFileContent = content; 
            addLog(`Encoding detectado: ${encoding}`, 'info');

            if (!spedFileContent) {
                addLog('Falha ao ler o conteúdo do arquivo.', 'error');
                showError('Não foi possível ler o conteúdo do arquivo. Tente UTF-8 ou Latin-1.');
                // updateStatus is called by showError
                return;
            }

            updateStatus('Extraindo informações do cabeçalho...', 30);
            addLog('Extraindo informações do cabeçalho...', 'info');
            const registrosHeader = lerArquivoSpedParaHeader(spedFileContent); 
            const { nomeEmpresa, periodo } = extrairInformacoesHeader(registrosHeader);
            sharedNomeEmpresa = nomeEmpresa; // Assign to shared variable
            sharedPeriodo = periodo;       // Assign to shared variable
            addLog(`Cabeçalho: Empresa "${nomeEmpresa}", Período "${periodo}"`, 'info');

            const suggestedExcelName = processarNomeArquivo(nomeEmpresa, periodo, spedFile.name);
            excelFileNameInput.value = suggestedExcelName;
            addLog(`Nome de arquivo Excel sugerido: ${suggestedExcelName}`, 'info');

            updateStatus('Pronto para converter.', 0);
            addLog('Arquivo analisado e pronto para conversão.', 'info');
            // console.log(...) // console logs can be replaced by addLog if desired

        } catch (error) {
            // console.error(...)
            addLog(`Erro ao processar arquivo: ${error.message}`, 'error');
            showError(`Erro ao processar arquivo: ${error.message}`);
            selectedSpedFileText.textContent = 'Erro ao ler o arquivo.';
            excelFileNameInput.value = '';
            // updateStatus is called by showError
            spedFile = null;
            spedFileContent = '';
        }
    }
    
    /**
     * Tries to detect encoding (UTF-8 or Latin-1) and read file content.
     * More sophisticated detection would require a library.
     */
    async function detectAndRead(arrayBuffer) {
        const decoders = [
            { encoding: 'UTF-8', decoder: new TextDecoder('utf-8', { fatal: true }) },
            { encoding: 'ISO-8859-1', decoder: new TextDecoder('iso-8859-1') } // Latin-1
        ];

        for (const { encoding, decoder } of decoders) {
            try {
                const content = decoder.decode(arrayBuffer);
                console.log(`Arquivo lido com sucesso usando ${encoding}`);
                return { encoding, content };
            } catch (e) {
                console.warn(`Falha ao decodificar como ${encoding}:`, e.message);
            }
        }
        // Fallback if specific error handling for decoding is needed
        try {
            // Try UTF-8 with non-fatal to get at least some content if possible,
            // but this might lead to mojibake for other encodings.
            const content = new TextDecoder('utf-8').decode(arrayBuffer);
            console.warn('Decodificado como UTF-8 com possíveis erros (fallback).');
            return { encoding: 'UTF-8 (fallback)', content };
        } catch (e) {
            console.error('Falha final ao decodificar o ArrayBuffer:', e);
            throw new Error('Não foi possível decodificar o arquivo com os encodings suportados.');
        }
    }


    /**
     * Placeholder for SPED file reading for header.
     * A more complete version will parse all lines.
     */
    function lerArquivoSpedParaHeader(fileContent) {
        const registros = { '0000': [] }; // Using an object for defaultdict-like behavior
        const lines = fileContent.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (isLinhaValida(trimmedLine)) {
                const campos = trimmedLine.split('|');
                if (campos.length > 1 && campos[1] === '0000') {
                     // Remove empty first and last element if they exist due to split('|')
                    registros['0000'].push(campos.slice(1, -1));
                }
                if (registros['0000'].length > 0) break; // Found 0000, no need to parse further for header
            }
        }
        return registros;
    }


    /**
     * Extracts header information from SPED records (specifically '0000').
     * Mimics `extrair_informacoes_header` from Python.
     */
    function extrairInformacoesHeader(registros) {
        let nomeEmpresa = "Empresa";
        let periodo = "";

        if (registros['0000'] && registros['0000'].length > 0) {
            const reg0000 = registros['0000'][0]; // reg0000 is already without the initial/final pipe chars
            // Python code: nome_empresa = reg_0000[6] if len(reg_0000) > 6 else "Empresa"
            // Python code: data_inicial = reg_0000[4] if len(reg_0000) > 4 else ""
            // Indexes need to be adjusted because Python's split('|') results in an empty string at the start and end.
            // ['','REG','COD_VER', ..., 'NOME', ..., ''] for a line |REG|COD_VER|...|NOME|...|
            // So, in Python, after `campos = linha.split('|')`, `campos[1]` is REG.
            // `reg_0000` in Python was `registros['0000'][0]` which is `campos`.
            // So `reg_0000[6]` (NOME) and `reg_0000[4]` (DT_INI).

            // Our `reg0000` is `campos.slice(1, -1)` from `lerArquivoSpedParaHeader`
            // So, `reg0000[0]` is REG, `reg0000[1]` is COD_VER etc.
            // DT_INI is at index 3 (original index 4, minus 1)
            // NOME is at index 5 (original index 6, minus 1)

            const dtIniIndex = 3; // Corresponds to reg_0000[4] in Python's full split
            const nomeIndex = 5;  // Corresponds to reg_0000[6] in Python's full split

            if (reg0000.length > nomeIndex) {
                nomeEmpresa = reg0000[nomeIndex] || "Empresa";
            }
            if (reg0000.length > dtIniIndex) {
                const dataInicial = reg0000[dtIniIndex];
                if (dataInicial && dataInicial.length === 8) {
                    periodo = `${dataInicial.substring(0, 2)}/${dataInicial.substring(2, 4)}/${dataInicial.substring(4, 8)}`;
                }
            }
        }
        return { nomeEmpresa, periodo };
    }

    /**
     * Processes the Excel filename based on company name and period.
     * Mimics `processar_nome_arquivo` from Python.
     */
    function processarNomeArquivo(nomeEmpresa, periodo, originalSpedName = "SPED_convertido") {
        try {
            const primeiroNome = nomeEmpresa.split(' ')[0].trim() || "Empresa";
            if (periodo) {
                const partesData = periodo.split('/');
                if (partesData.length === 3) {
                    const mes = partesData[1];
                    const ano = partesData[2];
                    return `${primeiroNome}_SPED_${mes}_${ano}.xlsx`;
                }
            }
            // Fallback using original SPED name if company/period processing fails
            const baseName = originalSpedName.substring(0, originalSpedName.lastIndexOf('.')) || primeiroNome + "_SPED";
            return `${baseName}.xlsx`;

        } catch (error) {
            console.error("Erro ao processar nome do arquivo:", error);
            const baseName = originalSpedName.substring(0, originalSpedName.lastIndexOf('.')) || "SPED_convertido";
            return `${baseName}.xlsx`;
        }
    }

    /**
     * Validates a SPED line.
     * Mimics `is_linha_valida` from Python.
     */
    function isLinhaValida(linha) {
        linha = linha.trim();
        if (!linha) return false;
        if (!linha.startsWith('|') || !linha.endsWith('|')) return false;

        const campos = linha.split('|');
        if (campos.length < 3) return false; // Must have at least |REG|FIELD|

        const regCode = campos[1];
        if (!regCode) return false;

        // Regex for SPED record codes (e.g., 0000, C100, M210, 1990)
        const padraoRegistro = /^[A-Z0-9]?\d{3,4}$/; // Adjusted to include alphanumeric prefix like 'M'
        return padraoRegistro.test(regCode);
    }


    /**
     * Initiates the conversion process.
     * Mimics `iniciar_conversao` from Python.
     */
    async function iniciarConversao() {
        if (!validarEntrada()) { // validarEntrada might call showError, which calls updateStatus
            addLog("Validação de entrada falhou.", "warn");
            return;
        }
        addLog("Validação de entrada bem-sucedida.", "info");

        const outputFileName = excelFileNameInput.value.trim();
        let fullOutputFileName = outputFileName;
        if (!fullOutputFileName.toLowerCase().endsWith('.xlsx')) {
            fullOutputFileName += '.xlsx';
        }

        convertButton.disabled = true;
        updateStatus('Convertendo...', 0, false, true); // Start indeterminate progress
        addLog(`Iniciando conversão para: ${fullOutputFileName}`, 'info');

        try {
            await new Promise(resolve => setTimeout(resolve, 50)); 
            await converter(fullOutputFileName);
        } catch (error) {
            // This catch might be redundant if 'converter' calls conversaoConcluida itself
            // console.error('Erro ao iniciar conversão (nível iniciarConversao):', error);
            // conversaoConcluida(false, error.message); // conversaoConcluida will log
        }
    }

    /**
     * Validates user inputs.
     * Mimics `validar_entrada` from Python.
     */
    function validarEntrada() {
        if (!spedFile) {
            showError("Selecione o arquivo SPED");
            return false;
        }
        if (!excelFileNameInput.value.trim()) {
            showError("Digite um nome para o arquivo Excel");
            return false;
        }
        // File existence is implicitly true if spedFile object exists from input
        return true;
    }

    /**
     * Main conversion function (placeholder for actual SPED to Excel logic).
     * Mimics `converter` from Python.
     */
    async function converter(caminhoExcel) {
        // console.log(`Iniciando conversão para: ${caminhoExcel}`); // Already logged by iniciarConversao
        try {
            updateStatus('Processando arquivo SPED...', 10);
            // addLog('Processando arquivo SPED...', 'info'); // Covered by processarSpedParaExcel logs
            await new Promise(resolve => setTimeout(resolve, 200));

            await processarSpedParaExcel(spedFileContent, caminhoExcel); // This function will call gerarExcel

            // Success is handled by gerarExcel calling conversaoConcluida(true)
            // console.log("Conversão (simulada) concluída."); // Logged by conversaoConcluida
        } catch (error) {
            // console.error('Erro durante a conversão (nível converter):', error);
            // conversaoConcluida will be called by processarSpedParaExcel or gerarExcel's catch block
            // If error bubbles up to here without conversaoConcluida being called, then call it:
            if (!statusMessage.textContent.includes("Erro na conversão") && !statusMessage.textContent.includes("sucesso")) {
                 conversaoConcluida(false, error.message);
            }
        }
    }

    /**
     * Processes the SPED file content and generates the Excel file.
     * This function will be expanded significantly.
     * Mimics `processar_sped_para_excel` from Python.
     */
    async function processarSpedParaExcel(fileContent, caminhoSaidaExcel) {
        updateStatus('Lendo e normalizando registros SPED...', 20);
        addLog('Lendo e normalizando todos os registros SPED...', 'info');
        await new Promise(resolve => setTimeout(resolve, 100)); 

        const registros = lerArquivoSpedCompleto(fileContent); // Assuming this is synchronous for now
        addLog(`Total de ${Object.keys(registros).length} tipos de registros lidos.`, 'info');
        // const { nomeEmpresa, periodo } = extrairInformacoesHeader(registros); // Already done in processSpedFile

        updateStatus('Gerando arquivo Excel...', 50);
        addLog('Iniciando geração do arquivo Excel...', 'info');
        await new Promise(resolve => setTimeout(resolve, 100)); 

        try {
            // Pass nomeEmpresa and periodo from the global scope if they are set there by processSpedFile
            await gerarExcel(registros, sharedNomeEmpresa, sharedPeriodo, caminhoSaidaExcel);
        } catch (e) {
            // console.error("Falha em processarSpedParaExcel:", e);
            conversaoConcluida(false, `Falha na geração do Excel: ${e.message}`); // Will log error
        }
    }

    /**
     * Reads the entire SPED file and organizes records.
     * Mimics `ler_arquivo_sped` from Python (more complete version).
     */
    function lerArquivoSpedCompleto(fileContent) {
        const registros = {}; // Using an object like defaultdict(list)
        const lines = fileContent.split('\n'); // Ensure consistent line splitting

        for (const rawLine of lines) {
            const linha = rawLine.trim();
            if (isLinhaValida(linha)) {
                const campos = linha.split('|');
                // campos[0] is empty, campos[1] is REG, ..., campos[campos.length-1] is empty
                const tipoRegistro = campos[1];
                const dadosRegistro = campos; // Keep the raw split including empty start/end

                if (!registros[tipoRegistro]) {
                    registros[tipoRegistro] = [];
                }
                registros[tipoRegistro].push(dadosRegistro);
            }
        }
        console.log("SPED Completo Lido e Estruturado. Contagem de Tipos:", Object.keys(registros).length);
        return registros;
    }


    // --- Excel Generation Functions (Placeholders - to be implemented) ---
    /**
     * Generates the Excel file using xlsx-populate.
     * Mimics `gerar_excel` from Python.
     */
    async function gerarExcel(registros, nomeEmpresa, periodo, caminhoSaida) {
        // console.log("Iniciando geração do Excel com XlsxPopulate..."); // Logged by caller
        updateStatus('Preparando dados para Excel...', 60);
        // addLog('Preparando dados para Excel...', 'info'); // Redundant with updateStatus

        try {
            const workbook = await XlsxPopulate.fromBlankAsync();
            addLog('Novo workbook Excel criado.', 'info');
            
            // Pass necessary global/state variables or objects
            const context = {
                registros, 
                workbook,
                writer: workbook, 
                obterLayoutRegistro, 
                logger: { 
                    info: (msg) => addLog(msg, 'info'), // Route logger to addLog
                    error: (msg) => addLog(msg, 'error'),
                    warn: (msg) => addLog(msg, 'warn')
                },
                ajustarColunas: _ajustarColunas, 
                formatarPlanilha: _formatarPlanilha, 
                nomeEmpresa, // Pass already received nomeEmpresa
                periodo,   // Pass already received periodo
                addLog     // Pass addLog itself if sub-functions need more granular logging not covered by logger
            };


            updateStatus('Processando registros principais...', 70);
            addLog('Processando registros principais para abas individuais...', 'info');
            await _processarRegistros(context); 
            addLog('Registros principais processados.', 'info');

            updateStatus('Criando aba consolidada...', 80);
            addLog('Criando aba consolidada...', 'info');
            await _criarAbaConsolidada(context);
            addLog('Aba consolidada criada.', 'info');

            updateStatus('Processando outras obrigações...', 85);
            addLog('Processando outras obrigações (C197/D197)...', 'info');
            await _processarOutrasObrigacoes(context);
            addLog('Outras obrigações processadas.', 'info');
            
            /**if (!context.e110E111Processado) {
                 updateStatus('Processando E110/E111...', 88);
                 addLog('Processando registros E110/E111...', 'info');
                 await _processarRegistrosE110E111(context);
                 addLog('Registros E110/E111 processados.', 'info');
            }*/
            
            // Remove a aba padrão criada automaticamente
            try {
                const defaultSheet = workbook.sheet(0); // Primeira aba (Sheet1)
                if (defaultSheet && (defaultSheet.name() === 'Sheet1' || defaultSheet.name() === 'Sheet')) {
                    workbook.deleteSheet(defaultSheet);
                }
            } catch (e) {
                // Se não conseguir deletar, apenas continua
            }

            updateStatus('Finalizando arquivo Excel...', 95);
            addLog('Gerando blob do arquivo Excel...', 'info');
            const excelData = await workbook.outputAsync(); 
            const blob = new Blob([excelData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

            addLog('Iniciando download do arquivo Excel...', 'info');
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = caminhoSaida;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href); 

            // console.log("Arquivo Excel gerado e download iniciado."); // Logged by conversaoConcluida
            conversaoConcluida(true, caminhoSaida); // This will call addLog for success

        } catch (error) {
            // console.error("Erro em gerarExcel:", error);
            conversaoConcluida(false, `Erro ao gerar Excel: ${error.message}`); // This will call addLog for error
        }
    }

    /**
     * Mimics Python's _processar_registros
     * context: { registros, writer, formatarData, obterLayoutRegistro, logger, ajustarColunas, formatarPlanilha, nomeEmpresa, periodo }
     */
    async function _processarRegistros(context) {
        const { registros, writer, obterLayoutRegistro, logger, ajustarColunas, formatarPlanilha } = context;
        
        const ordemBlocos = ['0', 'B', 'C', 'D', 'E', 'G', 'H', 'K', '1', '9'];
        let registrosOrdenados = [];

        for (const bloco of ordemBlocos) {
            let registrosBloco = Object.entries(registros)
                .filter(([k, v]) => k.startsWith(bloco))
                .sort(([ka], [kb]) => ka.localeCompare(kb));
            registrosOrdenados.push(...registrosBloco);
        }

        let outrosRegistros = Object.entries(registros)
            .filter(([k, v]) => !ordemBlocos.some(b => k.startsWith(b)))
            .sort(([ka], [kb]) => ka.localeCompare(kb));
        registrosOrdenados.push(...outrosRegistros);
        
        context.e110E111Processado = false; // Initialize flag

        for (const [tipoRegistro, linhas] of registrosOrdenados) {
            /**if (tipoRegistro === 'E110' || tipoRegistro === 'E111') {
                // These are handled by _processarRegistrosE110E111, typically called after E100 or at the end
                continue;
            }*/
            if (!linhas || linhas.length === 0) continue;

            try {
                // Python: df = pd.DataFrame(linhas)
                // Python: df = df.iloc[:, 1:-1]
                // JS: map `linhas` (which are arrays of strings from split('|'))
                // Each `linha` in `linhas` is like: ['', 'REG', 'FIELD1', ..., 'FIELDN', '']
                const dadosParaDf = linhas.map(linhaCompleta => linhaCompleta.slice(1, -1));
                
                if (dadosParaDf.length === 0 || dadosParaDf[0].length === 0) continue;

                let colunasNomes = obterLayoutRegistro(tipoRegistro);
                if (colunasNomes) {
                    colunasNomes = ajustarColunas(dadosParaDf[0].length, colunasNomes); // Pass df width and layout
                } else {
                    colunasNomes = Array.from({ length: dadosParaDf[0].length }, (_, i) => `Campo_${i + 1}`);
                }

                const sheetName = tipoRegistro.substring(0, 31);
                const worksheet = writer.addSheet(sheetName);

                // Header style
                const headerStyle = { bold: true, fill: "D7E4BC", border: true }; // Simplified
                colunasNomes.forEach((colName, colIdx) => {
                    worksheet.cell(1, colIdx + 1).value(colName).style(headerStyle);
                });

                // Data
                dadosParaDf.forEach((row, rowIdx) => {
                    row.forEach((cellValue, colIdx) => {
                        // Attempt to convert to number if applicable based on column name or content
                        let finalValue = cellValue;
                        const isNumericField = colunasNomes[colIdx] && (colunasNomes[colIdx].startsWith('VL_') || colunasNomes[colIdx].startsWith('ALIQ_') || colunasNomes[colIdx].startsWith('QTD'));
                        if (isNumericField && typeof cellValue === 'string' && cellValue.trim() !== '') {
                            const num = parseFloat(cellValue.replace(',', '.'));
                            if (!isNaN(num)) {
                                finalValue = num;
                            }
                        }
                        worksheet.cell(rowIdx + 2, colIdx + 1).value(finalValue);
                    });
                });
                
                formatarPlanilha(worksheet, colunasNomes, dadosParaDf);


                // Store data for consolidated sheet if needed (this was handled differently in Python)
                // For JS, _criarAbaConsolidada will pull directly from context.registros

                /**if (tipoRegistro === 'E100' && !context.e110E111Processado) {
                    logger.info("Registro E100 encontrado, processando E110/E111...");
                    await _processarRegistrosE110E111(context);
                    context.e110E111Processado = true;
                }*/

            } catch (e) {
                logger.error(`Erro ao processar registro ${tipoRegistro} em _processarRegistros: ${e.message}`);
                console.error(e); // Log stack
            }
        }
        logger.info(`Registros processados (JS): ${registrosOrdenados.map(r => r[0]).join(', ')}`);
    }


    /**
     * Mimics Python's _ajustar_colunas
     * dfWidth: number of columns in the data
     * colunas: array of layout column names
     */
    function _ajustarColunas(dfWidth, colunasOriginal) {
        let colunas = [...colunasOriginal]; // Create a copy
        if (colunas.length > dfWidth) {
            return colunas.slice(0, dfWidth);
        } else if (colunas.length < dfWidth) {
            for (let i = colunas.length; i < dfWidth; i++) {
                colunas.push(`Campo_${i + 1}`);
            }
        }
        return colunas;
    }

    /**
     * Mimics Python's _formatar_planilha
     * worksheet: XlsxPopulate worksheet object
     * columns: array of column names (headers)
     * data: array of arrays representing rows of data
     */
    function _formatarPlanilha(worksheet, columns, data) {
        columns.forEach((colName, colIdx) => {
            let maxLength = colName.length;
            data.forEach(row => {
                const cellValue = row[colIdx];
                if (cellValue !== null && cellValue !== undefined) {
                    const cellLength = String(cellValue).length;
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                }
            });
            // xlsx-populate uses different column width units than xlsxwriter.
            // A rough approximation: Excel's character width unit is complex.
            // xlsx-populate's `columnWidth` is in "average characters"
            // Let's try maxLength + a small buffer. Max 50 like in Python.
            worksheet.column(colIdx + 1).width(Math.min(maxLength + 5, 50));
        });
    }


    /**
     * Placeholder for _criar_aba_consolidada
     * context: { registros, writer, formatarData, obterLayoutRegistro, logger, nomeEmpresa, periodo }
     */
    async function _criarAbaConsolidada(context) {
        const { registros, writer, logger, nomeEmpresa, periodo, obterLayoutRegistro } = context; // Ensure obterLayoutRegistro is in context
        logger.info("Iniciando _criarAbaConsolidada (JS)...");

        try {
            const worksheet = writer.addSheet('Consolidado_Fiscal');
            
            const mainHeaderStyle = { bold: true, horizontalAlignment: "center", fill: "D7E4BC", border: true };
            const headerStyle = { bold: true, fill: "D7E4BC", border: true };
            const numStyle = { numberFormat: "#,##0.00", border: true };
            const codeStyle = { numberFormat: "0", border: true };
            const dateStyle = { numberFormat: "dd/mm/yyyy", border: true }; // XlsxPopulate expects JS Date for date styles
            const cellStyle = { border: true };

            let cnpj = "";
            if (registros['0000'] && registros['0000'][0] && registros['0000'][0].length > 7 + 1) {
                cnpj = registros['0000'][0][7];
            }
            const empresaCnpj = cnpj ? `${nomeEmpresa} - CNPJ: ${cnpj}` : nomeEmpresa;
            worksheet.range("A1:L1").merged(true).value(empresaCnpj).style(mainHeaderStyle);

            const colunasOrdem = ['Data', 'CST_ICMS', 'CFOP', 'ALIQ_ICMS', 'VL_OPR', 'VL_BC_ICMS',
                                 'VL_ICMS', 'VL_BC_ICMS_ST', 'VL_ICMS_ST', 'VL_RED_BC', 'VL_IPI',
                                 'COD_OBS', 'Tipo_Registro'];

            colunasOrdem.forEach((colName, idx) => {
                worksheet.cell(3, idx + 1).value(colName).style(headerStyle);
            });

            let dataSped = null;
            if (registros['0000'] && registros['0000'][0] && registros['0000'][0].length > 4 + 1) {
                const dataStr = registros['0000'][0][4]; 
                if (dataStr && dataStr.length === 8) {
                    // Converter para objeto Date (formato: DDMMAAAA -> AAAA-MM-DD)
                    const dia = dataStr.substring(0, 2);
                    const mes = dataStr.substring(2, 4);
                    const ano = dataStr.substring(4, 8);
                    dataSped = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia)); // mes - 1 porque Date usa 0-11
                }
            }

            let currentRow = 4;
            const registrosDadosConsolidados = []; 

            const tiposRegConsolidado = ['C190', 'C590', 'D190', 'D590'];
            tiposRegConsolidado.forEach(tipoReg => {
                if (registros[tipoReg]) {
                    const layout = obterLayoutRegistro(tipoReg);
                    if (!layout) {
                        logger.warn(`Layout não encontrado para o registro ${tipoReg} na aba consolidada.`);
                        return;
                    }
                    
                    // Helper to get value from dados by field name, returns default if not found or field empty
                    const getValue = (dadosRegistro, fieldName, defaultValue = 0, isNumeric = true) => {
                        const index = layout.indexOf(fieldName);
                        if (index === -1 || index >= dadosRegistro.length || dadosRegistro[index] === '') {
                            return defaultValue;
                        }
                        const val = dadosRegistro[index];
                        if (isNumeric) {
                            const num = parseFloat(String(val).replace(',', '.'));
                            return isNaN(num) ? defaultValue : num;
                        }
                        return val; // For non-numeric like COD_OBS
                    };
                    
                    const getMinLength = (regLayout) => {
                        // Determine a reasonable minimum length, e.g., up to VL_ICMS or a key field
                        const keyFields = ['VL_ICMS', 'VL_OPR'];
                        let minIdx = 0;
                        keyFields.forEach(kf => {
                            let idx = regLayout.indexOf(kf);
                            if (idx > minIdx) minIdx = idx;
                        });
                        return minIdx + 1; // +1 because indexOf is 0-based and length is 1-based
                    };

                    const minExpectedDadosLength = getMinLength(layout);

                    registros[tipoReg].forEach(linhaCompleta => {
                        const dados = linhaCompleta.slice(1, -1); // Data fields for the current record

                        if (dados.length < minExpectedDadosLength) { // Basic check
                            // logger.warn(`Registro ${tipoReg} com menos campos (${dados.length}) que o esperado (${minExpectedDadosLength}). Linha: ${linhaCompleta.join('|')}`);
                            // continue; // Skip this line or handle as per requirements
                        }

                        const registroConsolidado = {
                            'Data': dataSped,
                            'CST_ICMS': parseInt(getValue(dados, 'CST_ICMS', '0', false)) || 0, // CST is not float
                            'CFOP': parseInt(getValue(dados, 'CFOP', '0', false)) || 0, // CFOP is not float
                            'ALIQ_ICMS': getValue(dados, 'ALIQ_ICMS', 0),
                            'VL_OPR': getValue(dados, 'VL_OPR', 0),
                            'VL_BC_ICMS': getValue(dados, 'VL_BC_ICMS', 0),
                            'VL_ICMS': getValue(dados, 'VL_ICMS', 0),
                            'VL_BC_ICMS_ST': getValue(dados, 'VL_BC_ICMS_ST', 0),
                            'VL_ICMS_ST': getValue(dados, 'VL_ICMS_ST', 0),
                            'VL_RED_BC': getValue(dados, 'VL_RED_BC', 0),
                            'VL_IPI': getValue(dados, 'VL_IPI', 0),
                            'COD_OBS': getValue(dados, 'COD_OBS', '', false),
                            'Tipo_Registro': tipoReg
                        };
                        registrosDadosConsolidados.push(registroConsolidado);

                        worksheet.cell(currentRow, 1).value(registroConsolidado.Data).style(dateStyle);
                        worksheet.cell(currentRow, 2).value(registroConsolidado.CST_ICMS).style(codeStyle);
                        worksheet.cell(currentRow, 3).value(registroConsolidado.CFOP).style(codeStyle);
                        worksheet.cell(currentRow, 4).value(registroConsolidado.ALIQ_ICMS).style(numStyle);
                        worksheet.cell(currentRow, 5).value(registroConsolidado.VL_OPR).style(numStyle);
                        worksheet.cell(currentRow, 6).value(registroConsolidado.VL_BC_ICMS).style(numStyle);
                        worksheet.cell(currentRow, 7).value(registroConsolidado.VL_ICMS).style(numStyle);
                        worksheet.cell(currentRow, 8).value(registroConsolidado.VL_BC_ICMS_ST).style(numStyle);
                        worksheet.cell(currentRow, 9).value(registroConsolidado.VL_ICMS_ST).style(numStyle);
                        worksheet.cell(currentRow, 10).value(registroConsolidado.VL_RED_BC).style(numStyle);
                        worksheet.cell(currentRow, 11).value(registroConsolidado.VL_IPI).style(numStyle);
                        worksheet.cell(currentRow, 12).value(registroConsolidado.COD_OBS).style(cellStyle);
                        worksheet.cell(currentRow, 13).value(registroConsolidado.Tipo_Registro).style(cellStyle);
                        currentRow++;
                    });
                }
            });

            // Tabela de Conferência (using registrosDadosConsolidados)
            const ultimaColunaDados = colunasOrdem.length;
            const inicioConferenciaCol = ultimaColunaDados + 2;
            const linhaInicioConferencia = 3;

            worksheet.cell(linhaInicioConferencia, inicioConferenciaCol).value("Tipo de Registro").style(headerStyle);
            worksheet.cell(linhaInicioConferencia, inicioConferenciaCol + 1).value("Registros na Origem").style(headerStyle);
            worksheet.cell(linhaInicioConferencia, inicioConferenciaCol + 2).value("Registros Consolidados").style(headerStyle);
            worksheet.cell(linhaInicioConferencia, inicioConferenciaCol + 3).value("Status").style(headerStyle);

            const statusOkStyle = { border: true, fill: "C6EFCE", fontColor: "006100", bold: true };
            const statusDivergenteStyle = { border: true, fill: "FFC7CE", fontColor: "9C0006", bold: true };
            const intStyle = { numberFormat: "#,##0", border: true };

            let linhaAtualConf = linhaInicioConferencia + 1;
            tiposRegConsolidado.forEach(tipoReg => { // Iterate again for the conference table
                const qtdOrigem = registros[tipoReg] ? registros[tipoReg].length : 0;
                const qtdConsolidado = registrosDadosConsolidados.filter(r => r.Tipo_Registro === tipoReg).length;
                const status = (qtdOrigem === qtdConsolidado) ? "OK" : "DIVERGENTE";
                const statusStyleToApply = (status === "OK") ? statusOkStyle : statusDivergenteStyle;

                worksheet.cell(linhaAtualConf, inicioConferenciaCol).value(tipoReg).style(cellStyle);
                worksheet.cell(linhaAtualConf, inicioConferenciaCol + 1).value(qtdOrigem).style(intStyle);
                worksheet.cell(linhaAtualConf, inicioConferenciaCol + 2).value(qtdConsolidado).style(intStyle);
                worksheet.cell(linhaAtualConf, inicioConferenciaCol + 3).value(status).style(statusStyleToApply);
                linhaAtualConf++;
            });

            for (let i = 1; i <= ultimaColunaDados; i++) worksheet.column(i).width(15);
            worksheet.column(inicioConferenciaCol).width(20);
            worksheet.column(inicioConferenciaCol + 1).width(20);
            worksheet.column(inicioConferenciaCol + 2).width(22);
            worksheet.column(inicioConferenciaCol + 3).width(15);

            logger.info("_criarAbaConsolidada (JS) concluída.");
        } catch (e) {
            logger.error(`Erro em _criarAbaConsolidada (JS): ${e.message}`);
            console.error(e); 
            throw e;
        }
    }


    /**
     * Placeholder for _processarOutrasObrigacoes (C197, D197)
     * context: { registros, writer, logger }
     */
    async function _processarOutrasObrigacoes(context) {
        const { registros, writer, logger } = context;
        logger.info("Iniciando _processarOutrasObrigacoes (JS)...");

        try {
            const layout197 = ['REG', 'COD_AJ', 'DESCR_COMPL_AJ', 'COD_ITEM',
                               'VL_BC_ICMS', 'ALIQ_ICMS', 'VL_ICMS', 'VL_OUTROS'];
            const registros197Data = [];

            ['C197', 'D197'].forEach(tipoReg => {
                if (registros[tipoReg]) {
                    registros[tipoReg].forEach(linhaCompleta => {
                        const registro = linhaCompleta.slice(1, -1); // Remove leading/trailing empty strings
                        // Pad if necessary
                        const paddedRegistro = [...registro];
                        while (paddedRegistro.length < layout197.length) {
                            paddedRegistro.push('');
                        }
                        registros197Data.push(paddedRegistro.slice(0, layout197.length)); // Ensure correct length
                    });
                }
            });

            if (registros197Data.length > 0) {
                const worksheet = writer.addSheet('Outras_Obrigacoes_197');
                const headerStyle = { bold: true, fill: "D7E4BC", border: true, wrapText: true, verticalAlignment: 'top' };
                const numStyle = { numberFormat: "#,##0.00", border: true };
                const defaultCellStyle = { border: true };

                layout197.forEach((header, idx) => {
                    worksheet.cell(1, idx + 1).value(header).style(headerStyle);
                });

                const camposNumericosIndices = [4, 5, 6, 7]; // Indices in layout197

                registros197Data.forEach((row, rowIdx) => {
                    row.forEach((value, colIdx) => {
                        let cellValue = value;
                        // Determine the style: numeric gets numStyle, others get defaultCellStyle.
                        let currentStyle = defaultCellStyle; // Default for non-numeric cells with border

                        if (camposNumericosIndices.includes(colIdx)) {
                            // Attempt to convert to number only if it's a numeric column
                            if (String(value).trim() !== '') {
                                const num = parseFloat(String(value).replace(',', '.'));
                                cellValue = isNaN(num) ? 0 : num; // Use 0 if parsing fails, or original string? Python used fillna(0)
                            } else {
                                cellValue = 0; // Or null, depending on desired output for empty numeric strings
                            }
                            currentStyle = numStyle; // Apply numeric style
                        }
                        // Apply the determined style
                        worksheet.cell(rowIdx + 2, colIdx + 1).value(cellValue).style(currentStyle);
                    });
                });
                
                // Auto width
                layout197.forEach((col, i) => worksheet.column(i + 1).width(Math.max(col.length, 15) + 2));


                // Tabela Resumo 197
                await _criarTabelaResumo197(registros197Data, layout197, writer, logger);
            }

            logger.info("_processarOutrasObrigacoes (JS) concluída.");
        } catch (e) {
            logger.error(`Erro em _processarOutrasObrigacoes (JS): ${e.message}`);
            console.error(e);
            throw e;
        }
    }

    /**
     * Helper for _processarOutrasObrigacoes to create summary table.
     * df197Data: array of arrays (data for C197/D197)
     * layout197: column headers for df197Data
     */
    async function _criarTabelaResumo197(df197Data, layout197, writer, logger) {
        logger.info("Iniciando _criarTabelaResumo197 (JS)...");
        try {
            const vlIcmsIndex = layout197.indexOf('VL_ICMS');
            if (vlIcmsIndex === -1) {
                logger.error("Coluna VL_ICMS não encontrada no layout para resumo 197.");
                return;
            }

            const resumoMap = new Map(); // Key: "REG|COD_AJ|DESCR_COMPL_AJ", Value: { REG, COD_AJ, DESCR_COMPL_AJ, VL_ICMS_SUM }

            df197Data.forEach(row => {
                const reg = row[layout197.indexOf('REG')];
                const codAj = row[layout197.indexOf('COD_AJ')];
                const descrComplAj = row[layout197.indexOf('DESCR_COMPL_AJ')];
                let vlIcms = row[vlIcmsIndex];

                if (typeof vlIcms === 'string' && vlIcms.trim() !== '') {
                    vlIcms = parseFloat(vlIcms.replace(',', '.'));
                    if (isNaN(vlIcms)) vlIcms = 0;
                } else if (typeof vlIcms !== 'number') {
                    vlIcms = 0;
                }
                
                const key = `${reg}|${codAj}|${descrComplAj}`;
                if (!resumoMap.has(key)) {
                    resumoMap.set(key, { REG: reg, COD_AJ: codAj, DESCR_COMPL_AJ: descrComplAj, VL_ICMS_SUM: 0 });
                }
                resumoMap.get(key).VL_ICMS_SUM += vlIcms;
            });

            const resumoArray = Array.from(resumoMap.values());

            if (resumoArray.length > 0) {
                const worksheet = writer.addSheet('Resumo_Outras_Obrigacoes');
                const headerStyle = { bold: true, fill: "D7E4BC", border: true, wrapText: true, verticalAlignment: 'top' };
                const numStyle = { numberFormat: "#,##0.00", border: true };
                const defaultCellStyle = { border: true }; // Defined locally for clarity
                const headersResumo = ['REG', 'COD_AJ', 'DESCR_COMPL_AJ', 'VL_ICMS'];

                headersResumo.forEach((header, idx) => {
                    worksheet.cell(1, idx + 1).value(header).style(headerStyle);
                });

                resumoArray.forEach((row, rowIdx) => {
                    worksheet.cell(rowIdx + 2, 1).value(row.REG).style(defaultCellStyle);
                    worksheet.cell(rowIdx + 2, 2).value(row.COD_AJ).style(defaultCellStyle);
                    worksheet.cell(rowIdx + 2, 3).value(row.DESCR_COMPL_AJ).style(defaultCellStyle);
                    worksheet.cell(rowIdx + 2, 4).value(row.VL_ICMS_SUM).style(numStyle);
                });

                worksheet.column(1).width(15); // REG
                worksheet.column(2).width(20); // COD_AJ
                worksheet.column(3).width(50); // DESCR_COMPL_AJ
                worksheet.column(4).width(15); // VL_ICMS
            }
            logger.info("_criarTabelaResumo197 (JS) concluída.");
        } catch (e) {
            logger.error(`Erro em _criarTabelaResumo197 (JS): ${e.message}`);
            console.error(e);
            throw e;
        }
    }


    /**
     * Placeholder for _processar_registros_e110_e111
     * context: { registros, writer, logger }
     */
    async function _processarRegistrosE110E111(context) {
        const { registros, writer, logger } = context;
        logger.info("Iniciando _processarRegistrosE110E111 (JS)...");

        try {
            const layoutE110 = ['REG', 'VL_TOT_DEBITOS', 'VL_AJ_DEBITOS', 'VL_TOT_AJ_DEBITOS',
                                'VL_ESTORNOS_CRED', 'VL_TOT_CREDITOS', 'VL_AJ_CREDITOS',
                                'VL_TOT_AJ_CREDITOS', 'VL_ESTORNOS_DEB', 'VL_SLD_CREDOR_ANT',
                                'VL_SLD_APURADO', 'VL_TOT_DED', 'VL_ICMS_RECOLHER',
                                'VL_SLD_CREDOR_TRANSPORTAR', 'DEB_ESP'];
            const layoutE111 = ['REG', 'COD_AJ_APUR', 'DESCR_COMPL_AJ', 'VL_AJ_APUR'];

            const headerStyle = { bold: true, fill: "D7E4BC", border: true, wrapText: true, verticalAlignment: 'top' };
            const numStyle = { numberFormat: "#,##0.00", border: true };
            const defaultCellStyle = { border: true }; // Define default style for cells

            // Process E110
            if (registros['E110'] && registros['E110'].length > 0) {
                const sheetE110 = writer.sheet('E110') || writer.addSheet('E110');
                // Write headers only if it's a new sheet (or first time writing)
                if (sheetE110.cell(1,1).value() === null) { // Check if header is already written
                    layoutE110.forEach((header, idx) => {
                        sheetE110.cell(1, idx + 1).value(header).style(headerStyle);
                        sheetE110.column(idx + 1).width(Math.max(header.length, 15) + 2);
                    });
                }
                
                let e110RowOffset = sheetE110.usedRange() ? sheetE110.usedRange().endCell().rowNumber() : 1;
                if (e110RowOffset === 1 && sheetE110.cell(1,1).value() !== null) e110RowOffset = 1; // Header exists, start data at row 2
                else if (sheetE110.cell(1,1).value() === null) e110RowOffset = 0; // No header, start header at 1, data at 2
                
                registros['E110'].forEach(linhaCompleta => {
                    const dados = linhaCompleta.slice(1, -1);
                    dados.forEach((value, colIdx) => {
                        let cellValue = value;
                        let currentStyle = defaultCellStyle; // Start with default style
                        const colName = layoutE110[colIdx];

                        if (colName && (colName.startsWith('VL_') || colName.startsWith('DEB_'))) {
                            if (String(value).trim() !== '') {
                                const num = parseFloat(String(value).replace(',', '.'));
                                cellValue = isNaN(num) ? 0 : num;
                            } else {
                                cellValue = 0; // Default for empty numeric fields
                            }
                            currentStyle = numStyle; // Apply numeric style
                        }
                        sheetE110.cell(e110RowOffset + 1, colIdx + 1).value(cellValue).style(currentStyle);
                    });
                    e110RowOffset++;
                });
            }

            // Process E111
            if (registros['E111'] && registros['E111'].length > 0) {
                const sheetE111 = writer.sheet('E111') || writer.addSheet('E111');
                if (sheetE111.cell(1,1).value() === null) {
                    layoutE111.forEach((header, idx) => {
                        sheetE111.cell(1, idx + 1).value(header).style(headerStyle);
                        sheetE111.column(idx + 1).width(Math.max(header.length, 20) + 2);
                    });
                }

                let e111RowOffset = sheetE111.usedRange() ? sheetE111.usedRange().endCell().rowNumber() : 1;
                 if (e111RowOffset === 1 && sheetE111.cell(1,1).value() !== null) e111RowOffset = 1;
                 else if (sheetE111.cell(1,1).value() === null) e111RowOffset = 0;


                registros['E111'].forEach(linhaCompleta => {
                    const dados = linhaCompleta.slice(1, -1);
                    dados.forEach((value, colIdx) => {
                        let cellValue = value;
                        let currentStyle = defaultCellStyle; // Start with default style

                        if (layoutE111[colIdx] === 'VL_AJ_APUR') {
                            if (String(value).trim() !== '') {
                                const num = parseFloat(String(value).replace(',', '.'));
                                cellValue = isNaN(num) ? 0 : num;
                            } else {
                                cellValue = 0; // Default for empty numeric field
                            }
                            currentStyle = numStyle; // Apply numeric style
                        }
                        sheetE111.cell(e111RowOffset + 1, colIdx + 1).value(cellValue).style(currentStyle);
                    });
                    e111RowOffset++;
                });
            }
            context.e110E111Processado = true; // Mark as processed
            logger.info("_processarRegistrosE110E111 (JS) concluída.");
        } catch (e) {
            logger.error(`Erro em _processarRegistrosE110E111 (JS): ${e.message}`);
        console.error(e); // Log stack for debugging
            throw e;
        }
    }


    /**
     * Provides SPED record layouts (column names).
     * Mimics `obter_layout_registro` from Python.
     */
    function obterLayoutRegistro(tipoRegistro) {
        const layouts = {
            '0000': ['REG', 'COD_VER', 'COD_FIN', 'DT_INI', 'DT_FIN', 'NOME', 'CNPJ', 'CPF', 'UF', 'IE', 'COD_MUN', 'IM', 'SUFRAMA', 'IND_PERFIL', 'IND_ATIV'],
            'C100': ['REG', 'IND_OPER', 'IND_EMIT', 'COD_PART', 'COD_MOD', 'COD_SIT', 'SER', 'NUM_DOC', 'CHV_NFE', 'DT_DOC', 'DT_E_S', 'VL_DOC', 'IND_PGTO', 'VL_DESC', 'VL_ABAT_NT', 'VL_MERC', 'IND_FRT', 'VL_FRT', 'VL_SEG', 'VL_OUT_DA', 'VL_BC_ICMS', 'VL_ICMS', 'VL_BC_ICMS_ST', 'VL_ICMS_ST', 'VL_IPI', 'VL_PIS', 'VL_COFINS', 'VL_PIS_ST', 'VL_COFINS_ST'],
            'C170': ['REG', 'NUM_ITEM', 'COD_ITEM', 'DESCR_COMPL', 'QTD', 'UNID', 'VL_ITEM', 'VL_DESC', 'IND_MOV', 'CST_ICMS', 'CFOP', 'COD_NAT', 'VL_BC_ICMS', 'ALIQ_ICMS', 'VL_ICMS', 'VL_BC_ICMS_ST', 'ALIQ_ST', 'VL_ICMS_ST', 'IND_APUR', 'CST_IPI', 'COD_ENQ', 'VL_BC_IPI', 'ALIQ_IPI', 'VL_IPI', 'CST_PIS', 'VL_BC_PIS', 'ALIQ_PIS', 'QUANT_BC_PIS', 'VL_PIS', 'CST_COFINS', 'VL_BC_COFINS', 'ALIQ_COFINS', 'QUANT_BC_COFINS', 'VL_COFINS', 'COD_CTA', 'VL_ABAT_NT'],
            'C190': ['REG', 'CST_ICMS', 'CFOP', 'ALIQ_ICMS', 'VL_OPR', 'VL_BC_ICMS', 'VL_ICMS', 'VL_BC_ICMS_ST', 'VL_ICMS_ST', 'VL_RED_BC', 'VL_IPI', 'COD_OBS'],
            'C500': ['REG', 'IND_OPER', 'IND_EMIT', 'COD_PART', 'COD_MOD', 'COD_SIT', 'SER', 'SUB', 'COD_CONS', 'NUM_DOC', 'DT_DOC', 'DT_E_S', 'VL_DOC', 'VL_DESC', 'VL_FORN', 'VL_SERV_NT', 'VL_TERC', 'VL_DA', 'VL_BC_ICMS', 'VL_ICMS', 'VL_BC_ICMS_ST', 'VL_ICMS_ST', 'COD_INF', 'VL_PIS', 'VL_COFINS'],
            'C590': ['REG', 'CST_ICMS', 'CFOP', 'ALIQ_ICMS', 'VL_OPR', 'VL_BC_ICMS', 'VL_ICMS', 'VL_BC_ICMS_ST', 'VL_ICMS_ST', 'VL_RED_BC', 'COD_OBS'],
            'D100': ['REG', 'IND_OPER', 'IND_EMIT', 'COD_PART', 'COD_MOD', 'COD_SIT', 'SER', 'SUB', 'NUM_DOC', 'CHV_CTE', 'DT_DOC', 'DT_A_P', 'TP_CT-e', 'CHV_CTE_REF', 'VL_DOC', 'VL_DESC', 'IND_FRT', 'VL_SERV', 'VL_BC_ICMS', 'VL_ICMS', 'VL_NT', 'COD_INF', 'COD_CTA', 'COD_MUN_ORIG', 'COD_MUN_DEST'],
            'D190': ['REG', 'CST_ICMS', 'CFOP', 'ALIQ_ICMS', 'VL_OPR', 'VL_BC_ICMS', 'VL_ICMS', 'VL_RED_BC', 'COD_OBS'],
            'D500': ['REG', 'IND_OPER', 'IND_EMIT', 'COD_PART', 'COD_MOD', 'COD_SIT', 'SER', 'SUB', 'NUM_DOC', 'DT_DOC', 'DT_A_P', 'VL_DOC', 'VL_DESC', 'VL_SERV', 'VL_SERV_NT', 'VL_TERC', 'VL_DA', 'VL_BC_ICMS', 'VL_ICMS', 'COD_INF', 'VL_PIS', 'VL_COFINS', 'COD_CTA', 'TP_ASSINANTE'],
            'D590': ['REG', 'CST_ICMS', 'CFOP', 'ALIQ_ICMS', 'VL_OPR', 'VL_BC_ICMS', 'VL_ICMS', 'VL_BC_ICMS_ST', 'VL_ICMS_ST', 'VL_RED_BC', 'COD_OBS'],
            'E100': ['REG', 'DT_INI', 'DT_FIN'],
            'E110': ['REG', 'VL_TOT_DEBITOS', 'VL_AJ_DEBITOS', 'VL_TOT_AJ_DEBITOS', 'VL_ESTORNOS_CRED', 'VL_TOT_CREDITOS', 'VL_AJ_CREDITOS', 'VL_TOT_AJ_CREDITOS', 'VL_ESTORNOS_DEB', 'VL_SLD_CREDOR_ANT', 'VL_SLD_APURADO', 'VL_TOT_DED', 'VL_ICMS_RECOLHER', 'VL_SLD_CREDOR_TRANSPORTAR', 'DEB_ESP'],
            'E111': ['REG', 'COD_AJ_APUR', 'DESCR_COMPL_AJ', 'VL_AJ_APUR'],
            'E200': ['REG', 'UF', 'DT_INI', 'DT_FIN'],
            'E210': ['REG', 'IND_MOV_ST', 'VL_SLD_CRED_ANT_ST', 'VL_DEVOL_ST', 'VL_RESSARC_ST', 'VL_OUT_CRED_ST', 'VL_AJ_CREDITOS_ST', 'VL_RETENCAO_ST', 'VL_OUT_DEB_ST', 'VL_AJ_DEBITOS_ST', 'VL_SLD_DEV_ANT_ST', 'VL_DEDUCOES_ST', 'VL_ICMS_RECOL_ST', 'VL_SLD_CRED_ST_TRANSPORTAR', 'DEB_ESP_ST'],
            'E500': ['REG', 'IND_APUR', 'DT_INI', 'DT_FIN'],
            'E510': ['REG', 'CFOP', 'CST_IPI', 'VL_CONT_IPI', 'VL_BC_IPI', 'VL_IPI'],
            'E520': ['REG', 'VL_SD_ANT_IPI', 'VL_DEB_IPI', 'VL_CRED_IPI', 'VL_OD_IPI', 'VL_OC_IPI', 'VL_SC_IPI', 'VL_SD_IPI']
            // Add other layouts as needed from the Python script
        };
        return layouts[tipoRegistro] || null;
    }

    // --- UI Update Functions ---
    function updateStatus(message, progressPercent = -1, error = false, indeterminate = false) {
        statusMessage.textContent = message;
        if (error) {
            statusMessage.style.color = ''; // Remove direct style if CSS class handles it
            statusMessage.classList.add('error'); // Add error class
            progressBar.style.backgroundColor = '#ff8a80'; // Error color for progress bar (can also be class-based)
            // For progress bar container border, if you want to change it too:
            // if (progressBar.parentElement.classList.contains('progress-bar-container-style')) {
            //     progressBar.parentElement.style.borderColor = '#ff8a80'; 
            // }
        } else {
            statusMessage.style.color = ''; // Remove direct style
            statusMessage.classList.remove('error'); // Remove error class
            progressBar.style.backgroundColor = ''; // Revert to CSS default or specific color
            // Revert progress bar container border if changed for error
            // if (progressBar.parentElement.classList.contains('progress-bar-container-style')) {
            //    progressBar.parentElement.style.borderColor = ''; // Revert to CSS default
            // }
        }
        
        // Update progress text inside the bar
        if (progressPercent >= 0 && !indeterminate) {
            progressBar.textContent = `${Math.round(progressPercent)}%`;
        } else if (indeterminate) {
             progressBar.textContent = ''; // No text for indeterminate
        } else if (error) {
            progressBar.textContent = 'Erro!';
        }


        if (indeterminate) {
            progressBar.classList.add('indeterminate');
            progressBar.style.width = '100%'; 
        } else {
            progressBar.classList.remove('indeterminate');
            if (progressPercent >= 0) {
                progressBar.style.width = `${progressPercent}%`;
            } else {
                progressBar.style.width = '0%'; // Reset on error if no specific progress
            }
        }
    }

    function showError(message) {
        console.error("Interface Error:", message);
        addLog(`ERRO UI: ${message}`, 'error'); // Log the UI error
        updateStatus(`Erro: ${message}`, -1, true); 
    }

    /**
     * Finalizes the conversion process UI-wise.
     * Mimics `conversao_concluida` from Python.
     */
    function conversaoConcluida(sucesso, mensagemOuErro = "") {
        progressBar.classList.remove('indeterminate');
        progressBar.style.width = sucesso ? '100%' : progressBar.style.width; 
        convertButton.disabled = false;

        if (sucesso) {
            updateStatus("Conversão concluída com sucesso!", 100);
            addLog(`Arquivo Excel "${mensagemOuErro}" gerado com sucesso.`, 'success');
            addLog("Log encerrado com sucesso.", 'success'); // Final success log
            // console.log("Sucesso! Arquivo Excel gerado: " + mensagemOuErro);
        } else {
            updateStatus(`Erro na conversão: ${mensagemOuErro}`, -1, true); // updateStatus adds .error class
            addLog(`ERRO NA CONVERSÃO: ${mensagemOuErro}`, 'error');
            addLog("Log encerrado com falha.", 'error'); // Final error log
            // console.error(`Erro na conversão: ${mensagemOuErro}`);
        }
    }

    // --- New Logging Function ---
    function addLog(message, type = 'info') {
        if (!logWindow) return;

        const logEntry = document.createElement('div'); // Or 'p'
        logEntry.classList.add('log-message');
        logEntry.classList.add(`log-${type}`); // e.g., log-info, log-error, log-success, log-warn
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logWindow.appendChild(logEntry);
        logWindow.scrollTop = logWindow.scrollHeight; // Auto-scroll to bottom
    }

    // --- Function to clear logs ---
    function clearLogs() {
        if (logWindow) {
            logWindow.innerHTML = '';
        }
        addLog("Log inicializado. Aguardando ação...", "info");
    }


    // --- FOMENTAR Constants ---
    // CFOPs para classificação de operações incentivadas (baseado na IN 885/07-GSF)
    const CFOP_ENTRADAS_INCENTIVADAS = [
        '1101', '1116', '1120', '1122', '1124', '1125', '1131', '1135', '1151', '1159',
        '1201', '1203', '1206', '1208', '1212', '1213', '1214', '1215', '1252', '1257',
        '1352', '1360', '1401', '1406', '1408', '1410', '1414', '1453', '1454', '1455',
        '1503', '1505', '1551', '1552', '1651', '1653', '1658', '1660', '1661', '1662',
        '1910', '1911', '1917', '1918', '1932', '1949',
        '2101', '2116', '2120', '2122', '2124', '2125', '2131', '2135', '2151', '2159',
        '2201', '2203', '2206', '2208', '2212', '2213', '2214', '2215', '2252', '2257',
        '2352', '2401', '2406', '2408', '2410', '2414', '2453', '2454', '2455',
        '2503', '2505', '2551', '2552', '2651', '2653', '2658', '2660', '2661', '2662', '2664',
        '2910', '2911', '2917', '2918', '2932', '2949',
        '3101', '3127', '3129', '3201', '3206', '3211', '3212', '3352', '3551', '3651', '3653', '3949'
    ];

    const CFOP_SAIDAS_INCENTIVADAS = [
        '5101', '5103', '5105', '5109', '5116', '5118', '5122', '5124', '5125', '5129',
        '5131', '5132', '5151', '5155', '5159', '5201', '5206', '5207', '5208', '5213',
        '5214', '5215', '5216', '5401', '5402', '5408', '5410', '5451', '5452', '5456',
        '5501', '5651', '5652', '5653', '5658', '5660', '5910', '5911', '5917', '5918',
        '5927', '5928',
        '6101', '6103', '6105', '6107', '6109', '6116', '6118', '6122', '6124', '6125',
        '6129', '6131', '6132', '6151', '6155', '6159', '6201', '6206', '6207', '6208',
        '6213', '6214', '6215', '6216', '6401', '6402', '6408', '6410', '6451', '6452',
        '6456', '6501', '6651', '6652', '6653', '6658', '6660', '6663', '6905', '6910',
        '6911', '6917', '6918', '6934',
        '7101', '7105', '7127', '7129', '7201', '7206', '7207', '7211', '7212', '7251',
        '7504', '7651', '7667'
    ];

    // Códigos de ajuste incentivados conforme Anexo III da IN 885/07-GSF
    const CODIGOS_AJUSTE_INCENTIVADOS = [
        // Estorno de débitos
        'GO030003', 'GO20000000',

        // Outros créditos GO020xxx
        'GO020159', 'GO020007', 'GO020160', 'GO020162', 'GO020014', 'GO020021', 
        'GO020023', 'GO020025', 'GO020026', 'GO020027', 'GO020029', 'GO020030', 
        'GO020031', 'GO020033', 'GO020034', 'GO020035', 'GO020036', 'GO020039', 
        'GO020041', 'GO020048', 'GO020050', 'GO020051', 'GO020052', 'GO020059', 
        'GO020063', 'GO020069', 'GO020070', 'GO020072', 'GO020079', 'GO020081', 
        'GO020093', 'GO020102', 'GO020103', 'GO020104', 'GO020105', 'GO020107', 
        'GO020110', 'GO020111', 'GO020114', 'GO020122', 'GO020124', 'GO020125', 
        'GO020128', 'GO020129', 'GO020133', 'GO020142', 'GO020151', 'GO020152', 
        'GO020153', 'GO020155', 'GO020156', 'GO020157',

        // Outros créditos GO00xxx e GO10xxx
        'GO00009037', 'GO10990020', 'GO10990025', 'GO10991019', 'GO10991023', 
        'GO10993022', 'GO10993024',

        // Estorno de créditos (débitos para o contribuinte)
        'GO010016', 'GO010017', 'GO010068', 'GO010063', 'GO010064', 'GO010026', 
        'GO010028', 'GO010034', 'GO010036', 'GO010065', 'GO010066', 'GO010067', 
        'GO010047', 'GO010053', 'GO010054', 'GO010055', 'GO010060', 'GO010061',

        // Outros débitos GO40xxx
        'GO40009035', 'GO40990021', 'GO40991022', 'GO40993020'
    ];

    // Códigos de ajuste incentivados específicos do ProGoiás conforme IN 1478/2020
    const CODIGOS_AJUSTE_INCENTIVADOS_PROGOIAS = [
        // Estorno de débitos
        'GO030003', 'GO20000000',

        // Outros créditos GO020xxx
        'GO020159', 'GO020007', 'GO020160', 'GO020162', 'GO020014', 'GO020021', 
        'GO020023', 'GO020025', 'GO020026', 'GO020027', 'GO020029', 'GO020030', 
        'GO020031', 'GO020033', 'GO020034', 'GO020035', 'GO020036', 'GO020039', 
        'GO020041', 'GO020048', 'GO020050', 'GO020051', 'GO020052', 'GO020059', 
        'GO020063', 'GO020069', 'GO020070', 'GO020072', 'GO020079', 'GO020081', 
        'GO020093', 'GO020102', 'GO020103', 'GO020104', 'GO020105', 'GO020107', 
        'GO020110', 'GO020111', 'GO020114', 'GO020122', 'GO020124', 'GO020125', 
        'GO020128', 'GO020129', 'GO020133', 'GO020142', 'GO020151', 'GO020152', 
        'GO020153', 'GO020155', 'GO020156', 'GO020157',

        // Outros créditos GO00xxx e GO10xxx
        'GO00009037', 'GO10990020', 'GO10990025', 'GO10991019', 'GO10991023', 
        'GO10993022', 'GO10993024',

        // Estorno de créditos (débitos para o contribuinte)
        'GO010016', 'GO010017', 'GO010068', 'GO010063', 'GO010064', 'GO010026', 
        'GO010028', 'GO010034', 'GO010036', 'GO010065', 'GO010066', 'GO010067', 
        'GO010047', 'GO010053', 'GO010054', 'GO010055', 'GO010060', 'GO010061',

        // Outros débitos GO40xxx
        'GO40009035', 'GO40990021', 'GO40991022', 'GO40993020'
    ];

    // Códigos de crédito FOMENTAR/PRODUZIR/MICROPRODUZIR que devem ser EXCLUÍDOS da base de cálculo
    const CODIGOS_CREDITO_FOMENTAR = [
        'GO040007', // FOMENTAR
        'GO040008', // PRODUZIR  
        'GO040009', // MICROPRODUZIR
        'GO040010', // FOMENTAR variação
        'GO040011', // PRODUZIR variação
        'GO040012',  // MICROPRODUZIR variação        
        'GO040137'  // Créditos oriundos do registro 1200 (conforme art. 9º IN 1478)
    ];

    // --- Tab Navigation Functions ---
    function switchTab(tab) {
        const tabs = document.querySelectorAll('.tab-button');
        const panels = document.querySelectorAll('.tab-content');
        
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        if (tab === 'converter') {
            document.getElementById('tabConverter').classList.add('active');
            document.getElementById('converterPanel').classList.add('active');
        } else if (tab === 'fomentar') {
            document.getElementById('tabFomentar').classList.add('active');
            document.getElementById('fomentarPanel').classList.add('active');
        } else if (tab === 'progoias') {
            document.getElementById('tabProgoias').classList.add('active');
            document.getElementById('progoisPanel').classList.add('active');
        }
    }

    // --- FOMENTAR Functions ---
    function importSpedForFomentar() {
        if (!spedFileContent) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    processSpedFile(file).then(() => {
                        if (spedFileContent) {
                            processFomentarData();
                        }
                    });
                }
            };
            input.click();
        } else {
            processFomentarData();
        }
    }

    function processFomentarData() {
        try {
            addLog('Processando dados SPED para apuração FOMENTAR...', 'info');
            
            registrosCompletos = lerArquivoSpedCompleto(spedFileContent);
            fomentarData = classifyOperations(registrosCompletos);
            
            // Validar se há dados suficientes
            const totalOperacoes = fomentarData.saidasIncentivadas.length + fomentarData.saidasNaoIncentivadas.length + 
                                  fomentarData.entradasIncentivadas.length + fomentarData.entradasNaoIncentivadas.length;
            
            if (totalOperacoes === 0) {
                throw new Error('SPED não contém operações suficientes para apuração FOMENTAR');
            }
            
            document.getElementById('fomentarSpedStatus').textContent = 
                `Arquivo SPED importado: ${totalOperacoes} operações processadas (${fomentarData.saidasIncentivadas.length} saídas incentivadas, ${fomentarData.saidasNaoIncentivadas.length} saídas não incentivadas)`;
            document.getElementById('fomentarSpedStatus').style.color = '#20e3b2';
            
            calculateFomentar();
            document.getElementById('fomentarResults').style.display = 'block';
            
            addLog(`Apuração FOMENTAR calculada: ${totalOperacoes} operações analisadas`, 'success');
            addLog('Revise os valores calculados e ajuste os campos editáveis conforme necessário', 'info');
            
        } catch (error) {
            addLog(`Erro ao processar dados FOMENTAR: ${error.message}`, 'error');
            document.getElementById('fomentarSpedStatus').textContent = `Erro: ${error.message}`;
            document.getElementById('fomentarSpedStatus').style.color = '#f857a6';
        }
    }

    function classifyOperations(registros) {
        const operations = {
            entradasIncentivadas: [],
            entradasNaoIncentivadas: [],
            saidasIncentivadas: [],
            saidasNaoIncentivadas: [],
            creditosEntradas: 0,
            debitosOperacoes: 0,
            outrosCreditos: 0,
            outrosDebitos: 0,
            saldoCredorAnterior: 0,
            
            // Separação para ProGoiás - créditos e débitos incentivados/não incentivados
            creditosEntradasIncentivadas: 0,
            creditosEntradasNaoIncentivadas: 0,
            outrosCreditosIncentivados: 0,
            outrosCreditosNaoIncentivados: 0,
            outrosDebitosIncentivados: 0,
            outrosDebitosNaoIncentivados: 0,
            
            // Memória de cálculo detalhada
            memoriaCalculo: {
                operacoesDetalhadas: [],
                ajustesE111: [],
                ajustesC197: [],
                ajustesD197: [],
                totalCreditos: {
                    porEntradas: 0,
                    porAjustesE111: 0,
                    total: 0
                },
                totalDebitos: {
                    porOperacoes: 0,
                    porAjustesE111: 0,
                    porAjustesC197: 0,
                    porAjustesD197: 0,
                    total: 0
                },
                exclusoes: []
            }
        };
        
        addLog('Processando registros consolidados C190, C590, D190, D590...', 'info');
        
        // Processar registros consolidados C190 (NF-e) e C590 (NF-e Energia/Telecom)
        [...(registros.C190 || []), ...(registros.C590 || [])].forEach(registro => {
            const campos = registro.slice(1, -1);
            const tipoRegistro = registro[1]; // C190 ou C590
            
            let layout, cfopIndex, valorOprIndex, valorIcmsIndex;
            
            if (tipoRegistro === 'C190') {
                layout = obterLayoutRegistro('C190');
                cfopIndex = layout.indexOf('CFOP');
                valorOprIndex = layout.indexOf('VL_OPR');
                valorIcmsIndex = layout.indexOf('VL_ICMS');
            } else { // C590
                layout = obterLayoutRegistro('C590');
                cfopIndex = layout.indexOf('CFOP');
                valorOprIndex = layout.indexOf('VL_OPR');
                valorIcmsIndex = layout.indexOf('VL_ICMS');
            }
            
            const cfop = campos[cfopIndex] || '';
            const valorOperacao = parseFloat(campos[valorOprIndex] || '0');
            const valorIcms = parseFloat(campos[valorIcmsIndex] || '0');
            
            // Determinar tipo de operação pelo CFOP
            const tipoOperacao = cfop.startsWith('1') || cfop.startsWith('2') || cfop.startsWith('3') ? 'ENTRADA' : 'SAIDA';
            
            const isIncentivada = tipoOperacao === 'ENTRADA' 
                ? CFOP_ENTRADAS_INCENTIVADAS.includes(cfop)
                : CFOP_SAIDAS_INCENTIVADAS.includes(cfop);
            
            const operacao = {
                tipo: tipoRegistro,
                cfop: cfop,
                valorOperacao: valorOperacao,
                valorIcms: valorIcms,
                tipoOperacao: tipoOperacao
            };
            
            // Adicionar à memória de cálculo detalhada
            operations.memoriaCalculo.operacoesDetalhadas.push({
                origem: tipoRegistro,
                cfop: cfop,
                tipoOperacao: tipoOperacao,
                incentivada: isIncentivada,
                valorOperacao: valorOperacao,
                valorIcms: valorIcms,
                categoria: `${tipoOperacao} ${isIncentivada ? 'INCENTIVADA' : 'NÃO INCENTIVADA'}`
            });
            
            if (tipoOperacao === 'ENTRADA') {
                if (isIncentivada) {
                    operations.entradasIncentivadas.push(operacao);
                    operations.creditosEntradasIncentivadas += valorIcms;
                } else {
                    operations.entradasNaoIncentivadas.push(operacao);
                    operations.creditosEntradasNaoIncentivadas += valorIcms;
                }
                operations.creditosEntradas += valorIcms;
                operations.memoriaCalculo.totalCreditos.porEntradas += valorIcms;
            } else {
                if (isIncentivada) {
                    operations.saidasIncentivadas.push(operacao);
                } else {
                    operations.saidasNaoIncentivadas.push(operacao);
                }
                operations.debitosOperacoes += valorIcms;
                operations.memoriaCalculo.totalDebitos.porOperacoes += valorIcms;
            }
        });
        
        // Processar registros consolidados D190 (CT-e) e D590 (CT-e Consolidado)
        [...(registros.D190 || []), ...(registros.D590 || [])].forEach(registro => {
            const campos = registro.slice(1, -1);
            const tipoRegistro = registro[1]; // D190 ou D590
            
            let layout, cfopIndex, valorOprIndex, valorIcmsIndex;
            
            if (tipoRegistro === 'D190') {
                layout = obterLayoutRegistro('D190');
                cfopIndex = layout.indexOf('CFOP');
                valorOprIndex = layout.indexOf('VL_OPR');
                valorIcmsIndex = layout.indexOf('VL_ICMS');
            } else { // D590
                layout = obterLayoutRegistro('D590');
                cfopIndex = layout.indexOf('CFOP');
                valorOprIndex = layout.indexOf('VL_OPR');
                valorIcmsIndex = layout.indexOf('VL_ICMS');
            }
            
            const cfop = campos[cfopIndex] || '';
            const valorOperacao = parseFloat(campos[valorOprIndex] || '0');
            const valorIcms = parseFloat(campos[valorIcmsIndex] || '0');
            
            // Determinar tipo de operação pelo CFOP
            const tipoOperacao = cfop.startsWith('1') || cfop.startsWith('2') || cfop.startsWith('3') ? 'ENTRADA' : 'SAIDA';
            
            const isIncentivada = tipoOperacao === 'ENTRADA' 
                ? CFOP_ENTRADAS_INCENTIVADAS.includes(cfop)
                : CFOP_SAIDAS_INCENTIVADAS.includes(cfop);
            
            const operacao = {
                tipo: tipoRegistro,
                cfop: cfop,
                valorOperacao: valorOperacao,
                valorIcms: valorIcms,
                tipoOperacao: tipoOperacao
            };
            
            // Adicionar à memória de cálculo detalhada
            operations.memoriaCalculo.operacoesDetalhadas.push({
                origem: tipoRegistro,
                cfop: cfop,
                tipoOperacao: tipoOperacao,
                incentivada: isIncentivada,
                valorOperacao: valorOperacao,
                valorIcms: valorIcms,
                categoria: `${tipoOperacao} ${isIncentivada ? 'INCENTIVADA' : 'NÃO INCENTIVADA'}`
            });
            
            if (tipoOperacao === 'ENTRADA') {
                if (isIncentivada) {
                    operations.entradasIncentivadas.push(operacao);
                    operations.creditosEntradasIncentivadas += valorIcms;
                } else {
                    operations.entradasNaoIncentivadas.push(operacao);
                    operations.creditosEntradasNaoIncentivadas += valorIcms;
                }
                operations.creditosEntradas += valorIcms;
                operations.memoriaCalculo.totalCreditos.porEntradas += valorIcms;
            } else {
                if (isIncentivada) {
                    operations.saidasIncentivadas.push(operacao);
                } else {
                    operations.saidasNaoIncentivadas.push(operacao);
                }
                operations.debitosOperacoes += valorIcms;
                operations.memoriaCalculo.totalDebitos.porOperacoes += valorIcms;
            }
        });

        // Processar E111 para outros créditos e débitos
        if (registros.E111 && registros.E111.length > 0) {
            addLog(`Processando ${registros.E111.length} registros E111 para outros créditos/débitos...`, 'info');
            
            registros.E111.forEach(registro => {
                const campos = registro.slice(1, -1);
                const layout = obterLayoutRegistro('E111');
                const codAjuste = campos[layout.indexOf('COD_AJ_APUR')] || '';
                const valorAjuste = parseFloat(campos[layout.indexOf('VL_AJ_APUR')] || '0');
                
                // EXCLUIR os créditos do próprio FOMENTAR/PRODUZIR/MICROPRODUZIR da base de cálculo
                const isCreditoFomentar = CODIGOS_CREDITO_FOMENTAR.some(cod => codAjuste.includes(cod));
                if (isCreditoFomentar) {
                    operations.memoriaCalculo.exclusoes.push({
                        origem: 'E111',
                        codigo: codAjuste,
                        valor: Math.abs(valorAjuste),
                        motivo: 'Crédito FOMENTAR/PRODUZIR/MICROPRODUZIR - excluído da base de cálculo',
                        tipo: 'CREDITO_PROGRAMA_INCENTIVO'
                    });
                    addLog(`E111 EXCLUÍDO (crédito programa incentivo): ${codAjuste} = R$ ${formatCurrency(Math.abs(valorAjuste))} - NÃO computado em outros créditos`, 'warn');
                    return; // Pular este registro
                }
                
                // EXCLUIR o crédito do próprio ProGoiás (GO020158) da base de cálculo
                if (codAjuste.includes('GO020158')) {
                    operations.memoriaCalculo.exclusoes.push({
                        origem: 'E111',
                        codigo: codAjuste,
                        valor: Math.abs(valorAjuste),
                        motivo: 'Crédito ProGoiás - excluído da base de cálculo',
                        tipo: 'CREDITO_PROGOIAS'
                    });
                    addLog(`E111 EXCLUÍDO (crédito ProGoiás): ${codAjuste} = R$ ${formatCurrency(Math.abs(valorAjuste))} - NÃO computado em outros créditos`, 'warn');
                    return; // Pular este registro
                }
                
                // Verificar se o código de ajuste é incentivado conforme Anexo III da IN 885
                const isIncentivado = CODIGOS_AJUSTE_INCENTIVADOS.some(cod => codAjuste.includes(cod));
                
                if (valorAjuste !== 0) {
                    const ajusteDetalhado = {
                        origem: 'E111',
                        codigo: codAjuste,
                        valor: Math.abs(valorAjuste),
                        tipo: valorAjuste > 0 ? 'CREDITO' : 'DEBITO',
                        incentivado: isIncentivado,
                        observacao: isIncentivado ? 'Incentivado conforme Anexo III IN 885' : 'Não incentivado'
                    };
                    
                    operations.memoriaCalculo.ajustesE111.push(ajusteDetalhado);
                    
                    if (valorAjuste > 0) { // Crédito
                        operations.outrosCreditos += valorAjuste;
                        operations.memoriaCalculo.totalCreditos.porAjustesE111 += valorAjuste;
                        
                        // Separar créditos incentivados/não incentivados para ProGoiás
                        if (isIncentivado) {
                            operations.outrosCreditosIncentivados += valorAjuste;
                        } else {
                            operations.outrosCreditosNaoIncentivados += valorAjuste;
                        }
                        
                        addLog(`E111 Crédito: ${codAjuste} = R$ ${formatCurrency(valorAjuste)} ${isIncentivado ? '(Incentivado)' : '(Não Incentivado)'}`, 'info');
                    } else { // Débito
                        operations.outrosDebitos += Math.abs(valorAjuste);
                        operations.memoriaCalculo.totalDebitos.porAjustesE111 += Math.abs(valorAjuste);
                        
                        // Separar débitos incentivados/não incentivados para ProGoiás
                        if (isIncentivado) {
                            operations.outrosDebitosIncentivados += Math.abs(valorAjuste);
                        } else {
                            operations.outrosDebitosNaoIncentivados += Math.abs(valorAjuste);
                        }
                        
                        addLog(`E111 Débito: ${codAjuste} = R$ ${formatCurrency(Math.abs(valorAjuste))} ${isIncentivado ? '(Incentivado)' : '(Não Incentivado)'}`, 'info');
                    }
                }
            });
        }
        
        // Função para identificar se é débito especial (códigos que começam com GO7)
        function isDebitoEspecial(codigo) {
            return codigo.startsWith('GO7');
        }
        
        // Função para identificar se é débito GO4 que deve ser incluído no cálculo
        function isDebitoGO4(codigo) {
            return codigo.startsWith('GO4');
        }
        
        // Função para verificar se código é incentivado no ProGoiás
        function isIncentivadonProGoias(codigo) {
            return CODIGOS_AJUSTE_INCENTIVADOS_PROGOIAS.some(cod => codigo.includes(cod));
        }
        
        // Processar C197 para ajustes de débitos adicionais
        if (registros.C197 && registros.C197.length > 0) {
            addLog(`Processando ${registros.C197.length} registros C197 para ajustes de débitos...`, 'info');
            
            registros.C197.forEach(registro => {
                const campos = registro.slice(1, -1);
                const codAjuste = campos[1] || ''; // COD_AJ
                const valorIcms = parseFloat(campos[6] || '0'); // VL_ICMS
                
                if (valorIcms !== 0 && codAjuste) {
                    // Verificar tipo de código de ajuste
                    const ehDebitoEspecial = isDebitoEspecial(codAjuste); // GO7*
                    const ehDebitoGO4 = isDebitoGO4(codAjuste); // GO4*
                    const ehIncentivadoProgoias = isIncentivadonProGoias(codAjuste);
                    
                    const ajusteDetalhado = {
                        origem: 'C197',
                        codigo: codAjuste,
                        valor: Math.abs(valorIcms),
                        tipo: 'DEBITO_ADICIONAL',
                        categoria: ehDebitoEspecial ? 'DEBITO_ESPECIAL_GO7' : 
                                  ehDebitoGO4 ? 'DEBITO_GO4' : 'DEBITO_OUTROS',
                        incentivadoProgoias: ehIncentivadoProgoias,
                        incluido: !ehDebitoEspecial
                    };
                    
                    operations.memoriaCalculo.ajustesC197.push(ajusteDetalhado);
                    
                    if (ehDebitoEspecial) {
                        // Excluir débitos especiais GO7* (duplicidade)
                        operations.memoriaCalculo.exclusoes.push({
                            origem: 'C197',
                            codigo: codAjuste,
                            valor: Math.abs(valorIcms),
                            motivo: 'Débito especial GO7* - pode causar duplicidade na apuração',
                            tipo: 'DEBITO_ESPECIAL_GO7_EXCLUIDO'
                        });
                        addLog(`C197 EXCLUÍDO (débito especial GO7): ${codAjuste} = R$ ${formatCurrency(Math.abs(valorIcms))} - duplicidade evitada`, 'warn');
                    } else {
                        // Incluir débitos GO4* e outros no cálculo
                        operations.outrosDebitos += Math.abs(valorIcms);
                        operations.memoriaCalculo.totalDebitos.porAjustesC197 += Math.abs(valorIcms);
                        
                        // Separar débitos incentivados/não incentivados para ProGoiás
                        if (ehIncentivadoProgoias) {
                            operations.outrosDebitosIncentivados += Math.abs(valorIcms);
                        } else {
                            operations.outrosDebitosNaoIncentivados += Math.abs(valorIcms);
                        }
                        
                        const tipoLog = ehDebitoGO4 ? 
                            (ehIncentivadoProgoias ? 'GO4 Incentivado ProGoiás' : 'GO4 Não Incentivado') : 
                            'Débito Comum';
                        addLog(`C197 Débito (${tipoLog}): ${codAjuste} = R$ ${formatCurrency(Math.abs(valorIcms))}`, 'info');
                    }
                }
            });
        }
        
        // Processar D197 para ajustes de débitos adicionais
        if (registros.D197 && registros.D197.length > 0) {
            addLog(`Processando ${registros.D197.length} registros D197 para ajustes de débitos...`, 'info');
            
            registros.D197.forEach(registro => {
                const campos = registro.slice(1, -1);
                const codAjuste = campos[1] || ''; // COD_AJ
                const valorIcms = parseFloat(campos[6] || '0'); // VL_ICMS
                
                if (valorIcms !== 0 && codAjuste) {
                    // Verificar tipo de código de ajuste
                    const ehDebitoEspecial = isDebitoEspecial(codAjuste); // GO7*
                    const ehDebitoGO4 = isDebitoGO4(codAjuste); // GO4*
                    const ehIncentivadoProgoias = isIncentivadonProGoias(codAjuste);
                    
                    const ajusteDetalhado = {
                        origem: 'D197',
                        codigo: codAjuste,
                        valor: Math.abs(valorIcms),
                        tipo: 'DEBITO_ADICIONAL',
                        categoria: ehDebitoEspecial ? 'DEBITO_ESPECIAL_GO7' : 
                                  ehDebitoGO4 ? 'DEBITO_GO4' : 'DEBITO_OUTROS',
                        incentivadoProgoias: ehIncentivadoProgoias,
                        incluido: !ehDebitoEspecial
                    };
                    
                    operations.memoriaCalculo.ajustesD197.push(ajusteDetalhado);
                    
                    if (ehDebitoEspecial) {
                        // Excluir débitos especiais GO7* (duplicidade)
                        operations.memoriaCalculo.exclusoes.push({
                            origem: 'D197',
                            codigo: codAjuste,
                            valor: Math.abs(valorIcms),
                            motivo: 'Débito especial GO7* - pode causar duplicidade na apuração',
                            tipo: 'DEBITO_ESPECIAL_GO7_EXCLUIDO'
                        });
                        addLog(`D197 EXCLUÍDO (débito especial GO7): ${codAjuste} = R$ ${formatCurrency(Math.abs(valorIcms))} - duplicidade evitada`, 'warn');
                    } else {
                        // Incluir débitos GO4* e outros no cálculo
                        operations.outrosDebitos += Math.abs(valorIcms);
                        operations.memoriaCalculo.totalDebitos.porAjustesD197 += Math.abs(valorIcms);
                        
                        const tipoLog = ehDebitoGO4 ? 
                            (ehIncentivadoProgoias ? 'GO4 Incentivado ProGoiás' : 'GO4 Não Incentivado') : 
                            'Débito Comum';
                        addLog(`D197 Débito (${tipoLog}): ${codAjuste} = R$ ${formatCurrency(Math.abs(valorIcms))}`, 'info');
                    }
                }
            });
        }
        
        // Finalizar totais da memória de cálculo
        operations.memoriaCalculo.totalCreditos.total = operations.creditosEntradas + operations.outrosCreditos;
        operations.memoriaCalculo.totalDebitos.total = operations.debitosOperacoes + operations.outrosDebitos;
        
        // Log resumo das operações processadas
        addLog(`Resumo: ${operations.saidasIncentivadas.length} saídas incentivadas, ${operations.saidasNaoIncentivadas.length} saídas não incentivadas`, 'success');
        addLog(`Créditos de entradas: R$ ${formatCurrency(operations.creditosEntradas)}, Outros créditos: R$ ${formatCurrency(operations.outrosCreditos)}`, 'success');
        addLog(`Débitos de operações: R$ ${formatCurrency(operations.debitosOperacoes)}, Outros débitos (E111+C197+D197): R$ ${formatCurrency(operations.outrosDebitos)}`, 'success');
        addLog(`Total de exclusões aplicadas: ${operations.memoriaCalculo.exclusoes.length}`, 'info');
        
        // LOGS DE SEPARAÇÃO PARA DEBUG PROGOIÁS
        addLog('=== DEBUG SEPARAÇÃO PROGOIÁS ===', 'warn');
        addLog(`Outros Débitos TOTAL: R$ ${formatCurrency(operations.outrosDebitos)}`, 'info');
        addLog(`  - Incentivados: R$ ${formatCurrency(operations.outrosDebitosIncentivados)} (${operations.outrosDebitos > 0 ? ((operations.outrosDebitosIncentivados / operations.outrosDebitos) * 100).toFixed(1) : 0}%)`, 'info');
        addLog(`  - Não Incentivados: R$ ${formatCurrency(operations.outrosDebitosNaoIncentivados)}`, 'info');
        addLog(`  - Soma: R$ ${formatCurrency(operations.outrosDebitosIncentivados + operations.outrosDebitosNaoIncentivados)} - ${Math.abs((operations.outrosDebitosIncentivados + operations.outrosDebitosNaoIncentivados) - operations.outrosDebitos) < 0.01 ? 'OK' : 'ERRO'}`, Math.abs((operations.outrosDebitosIncentivados + operations.outrosDebitosNaoIncentivados) - operations.outrosDebitos) < 0.01 ? 'success' : 'error');
        
        addLog(`Outros Créditos TOTAL: R$ ${formatCurrency(operations.outrosCreditos)}`, 'info');
        addLog(`  - Incentivados: R$ ${formatCurrency(operations.outrosCreditosIncentivados)} (${operations.outrosCreditos > 0 ? ((operations.outrosCreditosIncentivados / operations.outrosCreditos) * 100).toFixed(1) : 0}%)`, 'info');
        addLog(`  - Não Incentivados: R$ ${formatCurrency(operations.outrosCreditosNaoIncentivados)}`, 'info');
        
        addLog(`Créditos Entradas TOTAL: R$ ${formatCurrency(operations.creditosEntradas)}`, 'info');
        addLog(`  - Incentivados: R$ ${formatCurrency(operations.creditosEntradasIncentivadas)} (${operations.creditosEntradas > 0 ? ((operations.creditosEntradasIncentivadas / operations.creditosEntradas) * 100).toFixed(1) : 0}%)`, 'info');
        addLog(`  - Não Incentivados: R$ ${formatCurrency(operations.creditosEntradasNaoIncentivadas)}`, 'info');
        
        return operations;
    }

    function calculateFomentar() {
        if (!fomentarData) return;
        
        // Configurações
        const percentualFinanciamento = parseFloat(document.getElementById('percentualFinanciamento').value) / 100;
        const icmsPorMedia = parseFloat(document.getElementById('icmsPorMedia').value) || 0;
        const saldoCredorAnterior = parseFloat(document.getElementById('saldoCredorAnterior').value) || 0;
        
        // QUADRO A - Proporção dos Créditos
        const saidasIncentivadas = fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
        const totalSaidas = saidasIncentivadas + fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
        const percentualSaidasIncentivadas = totalSaidas > 0 ? (saidasIncentivadas / totalSaidas) * 100 : 0;
        
        const creditosEntradas = fomentarData.creditosEntradas;
        const outrosCreditos = fomentarData.outrosCreditos;
        const estornoDebitos = 0; // Configurável
        const totalCreditos = creditosEntradas + outrosCreditos + estornoDebitos + saldoCredorAnterior;
        
        const creditoIncentivadas = (percentualSaidasIncentivadas / 100) * totalCreditos;
        const creditoNaoIncentivadas = totalCreditos - creditoIncentivadas;
        
        // QUADRO B - Operações Incentivadas
        const debitoIncentivadas = fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorIcms, 0);
        const outrosDebitosIncentivadas = fomentarData.outrosDebitos * (percentualSaidasIncentivadas / 100);
        const estornoCreditosIncentivadas = 0;
        const deducoesIncentivadas = 0;
        const creditoSaldoCredorNaoIncentivadas = 0;
        
        const saldoDevedorIncentivadas = (debitoIncentivadas + outrosDebitosIncentivadas + estornoCreditosIncentivadas) - 
                                       (creditoIncentivadas + deducoesIncentivadas + creditoSaldoCredorNaoIncentivadas);
        
        const icmsBaseFomentar = Math.max(0, saldoDevedorIncentivadas - icmsPorMedia);
        const icmsSujeitoFinanciamento = icmsBaseFomentar * percentualFinanciamento;
        const icmsFinanciado = icmsSujeitoFinanciamento;
        const parcelaNaoFinanciada = icmsBaseFomentar - icmsSujeitoFinanciamento;
        const saldoPagarParcelaNaoFinanciada = Math.max(0, parcelaNaoFinanciada);
        
        // QUADRO C - Operações Não Incentivadas
        const debitoNaoIncentivadas = fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorIcms, 0);
        const outrosDebitosNaoIncentivadas = fomentarData.outrosDebitos * ((100 - percentualSaidasIncentivadas) / 100);
        const estornoCreditosNaoIncentivadas = 0;
        const deducoesNaoIncentivadas = 0;
        const creditoSaldoCredorIncentivadas = 0;
        
        const saldoDevedorNaoIncentivadas = (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas) - 
                                          (creditoNaoIncentivadas + deducoesNaoIncentivadas + creditoSaldoCredorIncentivadas);
        
        const saldoPagarNaoIncentivadas = Math.max(0, saldoDevedorNaoIncentivadas);
        
        // Atualizar interface
        updateQuadroA({
            item1: saidasIncentivadas,
            item2: totalSaidas,
            item3: percentualSaidasIncentivadas,
            item4: creditosEntradas,
            item5: outrosCreditos,
            item6: estornoDebitos,
            item7: saldoCredorAnterior,
            item8: totalCreditos,
            item9: creditoIncentivadas,
            item10: creditoNaoIncentivadas
        });
        
        updateQuadroB({
            item11: debitoIncentivadas,
            item12: outrosDebitosIncentivadas,
            item13: estornoCreditosIncentivadas,
            item14: creditoIncentivadas,
            item15: deducoesIncentivadas,
            item17: saldoDevedorIncentivadas,
            item18: icmsPorMedia,
            item21: icmsBaseFomentar,
            item22: percentualFinanciamento * 100,
            item23: icmsSujeitoFinanciamento,
            item25: icmsFinanciado,
            item26: parcelaNaoFinanciada,
            item28: saldoPagarParcelaNaoFinanciada
        });
        
        updateQuadroC({
            item32: debitoNaoIncentivadas,
            item33: outrosDebitosNaoIncentivadas,
            item34: estornoCreditosNaoIncentivadas,
            item36: creditoNaoIncentivadas,
            item37: deducoesNaoIncentivadas,
            item39: saldoDevedorNaoIncentivadas,
            item41: saldoPagarNaoIncentivadas
        });
        
        updateResumo({
            totalIncentivadas: saldoPagarParcelaNaoFinanciada,
            totalNaoIncentivadas: saldoPagarNaoIncentivadas,
            valorFinanciamento: icmsFinanciado,
            totalGeral: saldoPagarParcelaNaoFinanciada + saldoPagarNaoIncentivadas
        });
    }

    function updateQuadroA(values) {
        document.getElementById('itemA1').textContent = formatCurrency(values.item1);
        document.getElementById('itemA2').textContent = formatCurrency(values.item2);
        document.getElementById('itemA3').textContent = values.item3.toFixed(2) + '%';
        document.getElementById('itemA4').textContent = formatCurrency(values.item4);
        document.getElementById('itemA5').textContent = formatCurrency(values.item5);
        document.getElementById('itemA6').textContent = formatCurrency(values.item6);
        document.getElementById('itemA7').textContent = formatCurrency(values.item7);
        document.getElementById('itemA8').textContent = formatCurrency(values.item8);
        document.getElementById('itemA9').textContent = formatCurrency(values.item9);
        document.getElementById('itemA10').textContent = formatCurrency(values.item10);
    }

    function updateQuadroB(values) {
        document.getElementById('itemB11').textContent = formatCurrency(values.item11);
        document.getElementById('itemB12').textContent = formatCurrency(values.item12);
        document.getElementById('itemB13').textContent = formatCurrency(values.item13);
        document.getElementById('itemB14').textContent = formatCurrency(values.item14);
        document.getElementById('itemB15').textContent = formatCurrency(values.item15);
        document.getElementById('itemB17').textContent = formatCurrency(values.item17);
        document.getElementById('itemB18').textContent = formatCurrency(values.item18);
        document.getElementById('itemB21').textContent = formatCurrency(values.item21);
        document.getElementById('itemB22').textContent = values.item22.toFixed(0) + '%';
        document.getElementById('itemB23').textContent = formatCurrency(values.item23);
        document.getElementById('itemB25').textContent = formatCurrency(values.item25);
        document.getElementById('itemB26').textContent = formatCurrency(values.item26);
        document.getElementById('itemB28').textContent = formatCurrency(values.item28);
    }

    function updateQuadroC(values) {
        document.getElementById('itemC32').textContent = formatCurrency(values.item32);
        document.getElementById('itemC33').textContent = formatCurrency(values.item33);
        document.getElementById('itemC34').textContent = formatCurrency(values.item34);
        document.getElementById('itemC36').textContent = formatCurrency(values.item36);
        document.getElementById('itemC37').textContent = formatCurrency(values.item37);
        document.getElementById('itemC39').textContent = formatCurrency(values.item39);
        document.getElementById('itemC41').textContent = formatCurrency(values.item41);
    }

    function updateResumo(values) {
        document.getElementById('totalPagarIncentivadas').textContent = formatCurrency(values.totalIncentivadas);
        document.getElementById('totalPagarNaoIncentivadas').textContent = formatCurrency(values.totalNaoIncentivadas);
        document.getElementById('valorFinanciamento').textContent = formatCurrency(values.valorFinanciamento);
        document.getElementById('totalGeralPagar').textContent = formatCurrency(values.totalGeral);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    function handleConfigChange() {
        const programType = document.getElementById('programType').value;
        const percentualInput = document.getElementById('percentualFinanciamento');
        
        let maxPercentual;
        switch(programType) {
            case 'FOMENTAR':
                maxPercentual = 70;
                break;
            case 'PRODUZIR':
                maxPercentual = 73;
                break;
            case 'MICROPRODUZIR':
                maxPercentual = 90;
                break;
            default:
                maxPercentual = 73;
        }
        
        percentualInput.max = maxPercentual;
        if (parseFloat(percentualInput.value) > maxPercentual) {
            percentualInput.value = maxPercentual;
        }
        
        addLog(`Programa alterado para ${programType} - Máximo: ${maxPercentual}%`, 'info');
        
        if (fomentarData) {
            calculateFomentar();
        }
    }

    async function exportFomentarReport() {
        // Determinar se é período único ou múltiplos períodos
        const isMultiplePeriods = multiPeriodData.length > 1;
        const periodsData = isMultiplePeriods ? multiPeriodData : [{ 
            periodo: sharedPeriodo, 
            nomeEmpresa: sharedNomeEmpresa, 
            fomentarData: fomentarData, 
            calculatedValues: fomentarData 
        }];
        
        if (!periodsData.length || (!isMultiplePeriods && !fomentarData)) {
            addLog('Erro: Nenhum dado FOMENTAR disponível para exportação', 'error');
            return;
        }
        
        try {
            addLog('Gerando relatório FOMENTAR para exportação...', 'info');
            
            const workbook = await XlsxPopulate.fromBlankAsync();
            const mainSheet = workbook.sheet(0);
            mainSheet.name('Demonstrativo FOMENTAR');
            
            let currentRow = 1;
            
            // Cabeçalho principal
            mainSheet.cell(`A${currentRow}`).value('DEMONSTRATIVO DE APURAÇÃO FOMENTAR/PRODUZIR/MICROPRODUZIR')
                .style('bold', true)
                .style('fontSize', 16)
                .style('horizontalAlignment', 'center')
                .style('fill', 'E3F2FD');
            
            // Mesclar células do título
            const lastCol = String.fromCharCode(66 + periodsData.length); // B + number of periods
            mainSheet.range(`A${currentRow}:${lastCol}${currentRow}`).merged(true);
            currentRow += 2;
            
            // Informações da empresa
            mainSheet.cell(`A${currentRow}`).value(`Empresa: ${periodsData[0].nomeEmpresa}`)
                .style('bold', true).style('fontSize', 12);
            currentRow++;
            
            if (isMultiplePeriods) {
                mainSheet.cell(`A${currentRow}`).value(`Períodos: ${periodsData.map(p => p.periodo).join(', ')}`)
                    .style('bold', true).style('fontSize', 12);
            } else {
                mainSheet.cell(`A${currentRow}`).value(`Período: ${periodsData[0].periodo}`)
                    .style('bold', true).style('fontSize', 12);
            }
            currentRow++;
            
            mainSheet.cell(`A${currentRow}`).value(`Gerado em: ${new Date().toLocaleString('pt-BR')}`)
                .style('fontSize', 10).style('italic', true);
            currentRow += 2;
            
            // Função para criar seção do quadro
            const createQuadroSection = (title, items, startRow) => {
                let row = startRow;
                
                // Título da seção
                mainSheet.cell(`A${row}`).value(title)
                    .style('bold', true)
                    .style('fontSize', 14)
                    .style('fill', 'F5F5F5')
                    .style('horizontalAlignment', 'center');
                mainSheet.range(`A${row}:${lastCol}${row}`).merged(true);
                row++;
                
                // Cabeçalhos
                mainSheet.cell(`A${row}`).value('Item')
                    .style('bold', true)
                    .style('fill', 'E8F5E8')
                    .style('horizontalAlignment', 'center')
                    .style('border', true);
                    
                mainSheet.cell(`B${row}`).value('Descrição')
                    .style('bold', true)
                    .style('fill', 'E8F5E8')
                    .style('horizontalAlignment', 'center')
                    .style('border', true);
                
                // Cabeçalhos dos períodos
                periodsData.forEach((period, index) => {
                    const col = String.fromCharCode(67 + index); // C, D, E, etc.
                    mainSheet.cell(`${col}${row}`).value(period.periodo)
                        .style('bold', true)
                        .style('fill', 'E8F5E8')
                        .style('horizontalAlignment', 'center')
                        .style('border', true);
                });
                row++;
                
                // Dados
                items.forEach(item => {
                    mainSheet.cell(`A${row}`).value(item.item)
                        .style('horizontalAlignment', 'center')
                        .style('border', true);
                        
                    mainSheet.cell(`B${row}`).value(item.desc)
                        .style('border', true);
                    
                    // Valores por período
                    periodsData.forEach((period, index) => {
                        const col = String.fromCharCode(67 + index); // C, D, E, etc.
                        const data = period.calculatedValues || period.fomentarData;
                        const value = data && data[item.field] !== undefined ? data[item.field] : 0;
                        
                        mainSheet.cell(`${col}${row}`).value(value)
                            .style('numberFormat', '#,##0.00')
                            .style('horizontalAlignment', 'right')
                            .style('border', true);
                    });
                    row++;
                });
                
                return row + 1; // Retorna próxima linha disponível
            };
            
            // QUADRO A - PROPORÇÃO DOS CRÉDITOS APROPRIADOS
            const quadroA = [
                {item: '1', desc: 'Saídas de Operações Incentivadas', field: 'saidasIncentivadas'},
                {item: '2', desc: 'Total das Saídas', field: 'totalSaidas'},
                {item: '3', desc: 'Percentual das Saídas de Operações Incentivadas (%)', field: 'percentualSaidasIncentivadas'},
                {item: '4', desc: 'Créditos por Entradas', field: 'creditosEntradas'},
                {item: '5', desc: 'Outros Créditos', field: 'outrosCreditos'},
                {item: '6', desc: 'Estorno de Débitos', field: 'estornoDebitos'},
                {item: '7', desc: 'Saldo Credor do Período Anterior', field: 'saldoCredorAnterior'},
                {item: '8', desc: 'Total dos Créditos do Período', field: 'totalCreditos'},
                {item: '9', desc: 'Crédito para Operações Incentivadas', field: 'creditoIncentivadas'},
                {item: '10', desc: 'Crédito para Operações Não Incentivadas', field: 'creditoNaoIncentivadas'}
            ];
            
            currentRow = createQuadroSection('QUADRO A - PROPORÇÃO DOS CRÉDITOS APROPRIADOS', quadroA, currentRow);
            
            // QUADRO B - APURAÇÃO DOS SALDOS DAS OPERAÇÕES INCENTIVADAS
            const quadroB = [
                {item: '11', desc: 'Débito do ICMS das Operações Incentivadas', field: 'debitoIncentivadas'},
                {item: '12', desc: 'Outros Débitos das Operações Incentivadas', field: 'outrosDebitosIncentivadas'},
                {item: '13', desc: 'Estorno de Créditos das Operações Incentivadas', field: 'estornoCreditosIncentivadas'},
                {item: '14', desc: 'Crédito para Operações Incentivadas', field: 'creditoIncentivadas'},
                {item: '15', desc: 'Deduções das Operações Incentivadas', field: 'deducoesIncentivadas'},
                {item: '17', desc: 'Saldo Devedor do ICMS das Operações Incentivadas', field: 'saldoDevedorIncentivadas'},
                {item: '18', desc: 'ICMS por Média', field: 'icmsPorMedia'},
                {item: '21', desc: 'ICMS Base para FOMENTAR/PRODUZIR', field: 'icmsBaseFomentar'},
                {item: '22', desc: 'Percentagem do Financiamento (%)', field: 'percentualFinanciamento'},
                {item: '23', desc: 'ICMS Sujeito a Financiamento', field: 'icmsSujeitoFinanciamento'},
                {item: '25', desc: 'ICMS Financiado', field: 'icmsFinanciado'},
                {item: '26', desc: 'Saldo do ICMS da Parcela Não Financiada', field: 'saldoNaoFinanciada'},
                {item: '28', desc: 'Saldo do ICMS a Pagar da Parcela Não Financiada', field: 'saldoPagarNaoFinanciada'}
            ];
            
            currentRow = createQuadroSection('QUADRO B - APURAÇÃO DOS SALDOS DAS OPERAÇÕES INCENTIVADAS', quadroB, currentRow);
            
            // QUADRO C - APURAÇÃO DOS SALDOS DAS OPERAÇÕES NÃO INCENTIVADAS
            const quadroC = [
                {item: '32', desc: 'Débito do ICMS das Operações Não Incentivadas', field: 'debitoNaoIncentivadas'},
                {item: '33', desc: 'Outros Débitos das Operações Não Incentivadas', field: 'outrosDebitosNaoIncentivadas'},
                {item: '34', desc: 'Estorno de Créditos das Operações Não Incentivadas', field: 'estornoCreditosNaoIncentivadas'},
                {item: '36', desc: 'Crédito para Operações Não Incentivadas', field: 'creditoNaoIncentivadas'},
                {item: '37', desc: 'Deduções das Operações Não Incentivadas', field: 'deducoesNaoIncentivadas'},
                {item: '39', desc: 'Saldo Devedor do ICMS das Operações Não Incentivadas', field: 'saldoDevedorNaoIncentivadas'},
                {item: '41', desc: 'Saldo do ICMS a Pagar das Operações Não Incentivadas', field: 'saldoPagarNaoIncentivadas'}
            ];
            
            currentRow = createQuadroSection('QUADRO C - APURAÇÃO DOS SALDOS DAS OPERAÇÕES NÃO INCENTIVADAS', quadroC, currentRow);
            
            // RESUMO FINAL
            mainSheet.cell(`A${currentRow}`).value('RESUMO DA APURAÇÃO')
                .style('bold', true)
                .style('fontSize', 14)
                .style('fill', 'FFF3E0')
                .style('horizontalAlignment', 'center');
            mainSheet.range(`A${currentRow}:${lastCol}${currentRow}`).merged(true);
            currentRow++;
            
            const resumoItems = [
                {desc: 'Total a Pagar - Operações Incentivadas', field: 'totalPagarIncentivadas'},
                {desc: 'Total a Pagar - Operações Não Incentivadas', field: 'totalPagarNaoIncentivadas'},
                {desc: 'Valor do Financiamento FOMENTAR', field: 'valorFinanciamento'},
                {desc: 'Total Geral a Pagar', field: 'totalGeralPagar'}
            ];
            
            resumoItems.forEach((item, index) => {
                mainSheet.cell(`A${currentRow}`).value(item.desc)
                    .style('bold', true)
                    .style('border', true)
                    .style('fill', index === 3 ? 'E8F5E8' : 'F5F5F5'); // Destaque no total geral
                
                periodsData.forEach((period, periodIndex) => {
                    const col = String.fromCharCode(66 + periodIndex); // B, C, D, etc.
                    const data = period.calculatedValues || period.fomentarData;
                    const value = data && data[item.field] !== undefined ? data[item.field] : 0;
                    
                    mainSheet.cell(`${col}${currentRow}`).value(value)
                        .style('numberFormat', '#,##0.00')
                        .style('horizontalAlignment', 'right')
                        .style('border', true)
                        .style('bold', index === 3) // Negrito no total geral
                        .style('fill', index === 3 ? 'E8F5E8' : 'F5F5F5');
                });
                currentRow++;
            });
            
            // Ajustar largura das colunas
            mainSheet.column('A').width(8);
            mainSheet.column('B').width(50);
            for (let i = 0; i < periodsData.length; i++) {
                const col = String.fromCharCode(67 + i); // C, D, E, etc.
                mainSheet.column(col).width(16);
            }
            
            // Gerar nome do arquivo
            let fileName;
            if (isMultiplePeriods) {
                const firstPeriod = periodsData[0].periodo.replace(/\//g, '_');
                const lastPeriod = periodsData[periodsData.length - 1].periodo.replace(/\//g, '_');
                fileName = `Demonstrativo_FOMENTAR_${firstPeriod}_a_${lastPeriod}.xlsx`;
            } else {
                fileName = `Demonstrativo_FOMENTAR_${periodsData[0].periodo.replace(/\//g, '_')}.xlsx`;
            }
            
            // Gerar e baixar o arquivo
            const blob = await workbook.outputAsync();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            addLog('Relatório FOMENTAR exportado com sucesso', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar relatório FOMENTAR:', error);
            addLog('Erro ao exportar relatório FOMENTAR: ' + error.message, 'error');
        }
    }

    function printFomentarReport() {
        if (!fomentarData) {
            addLog('Erro: Nenhum dado FOMENTAR disponível para impressão', 'error');
            return;
        }
        
        addLog('Enviando relatório FOMENTAR para impressão...', 'info');
        window.print();
    }

    // === Multi-Period Functions ===
    
    function handleImportModeChange(event) {
        currentImportMode = event.target.value;
        const singleSection = document.getElementById('singleImportSection');
        const multipleSection = document.getElementById('multipleImportSection');
        
        if (currentImportMode === 'single') {
            singleSection.style.display = 'block';
            multipleSection.style.display = 'none';
        } else {
            singleSection.style.display = 'none';
            multipleSection.style.display = 'block';
        }
        
        addLog(`Modo de importação alterado para: ${currentImportMode === 'single' ? 'Período Único' : 'Múltiplos Períodos'}`, 'info');
    }
    
    function handleMultipleSpedSelection(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        const filesList = document.getElementById('multipleSpedsList');
        const processButton = document.getElementById('processMultipleSpeds');
        
        filesList.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'selected-file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-period">Período: Aguardando análise...</div>
                </div>
                <span class="remove-file" onclick="removeFile(${index})">×</span>
            `;
            filesList.appendChild(fileItem);
        });
        
        processButton.style.display = files.length > 0 ? 'block' : 'none';
        addLog(`${files.length} arquivo(s) SPED selecionado(s) para processamento`, 'info');
    }
    
    function removeFile(index) {
        const fileInput = document.getElementById('multipleSpedFiles');
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);
        
        files.forEach((file, i) => {
            if (i !== index) dt.items.add(file);
        });
        
        fileInput.files = dt.files;
        handleMultipleSpedSelection({ target: fileInput });
    }
    
    async function processMultipleSpeds() {
        const files = Array.from(document.getElementById('multipleSpedFiles').files);
        if (files.length === 0) return;
        
        addLog('Iniciando processamento de múltiplos SPEDs...', 'info');
        multiPeriodData = [];
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            addLog(`Processando arquivo ${i + 1}/${files.length}: ${file.name}`, 'info');
            
            try {
                const fileContent = await readFileContent(file);
                const periodData = await processSingleSpedForPeriod(fileContent, file.name);
                multiPeriodData.push(periodData);
                
                // Update file item with period info
                const fileItems = document.querySelectorAll('.selected-file-item');
                if (fileItems[i]) {
                    const periodSpan = fileItems[i].querySelector('.file-period');
                    periodSpan.textContent = `Período: ${periodData.periodo}`;
                }
                
            } catch (error) {
                addLog(`Erro ao processar ${file.name}: ${error.message}`, 'error');
            }
        }
        
        // Sort by period chronologically
        multiPeriodData.sort((a, b) => {
            const periodA = parsePeriod(a.periodo);
            const periodB = parsePeriod(b.periodo);
            return periodA.getTime() - periodB.getTime();
        });
        
        // Apply automatic saldo credor carryover
        applyAutomaticSaldoCredorCarryover();
        
        // Show results
        showMultiPeriodResults();
        
        addLog(`Processamento concluído. ${multiPeriodData.length} períodos processados em ordem cronológica.`, 'success');
    }
    
    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    }
    
    async function processSingleSpedForPeriod(fileContent, fileName) {
        const registros = lerArquivoSpedCompleto(fileContent);
        const dadosEmpresa = extrairDadosEmpresa(registros);
        
        // Log do processamento
        addLog(`Processando: ${fileName} - ${dadosEmpresa.nome} (${dadosEmpresa.periodo})`, 'info');
        
        // Process FOMENTAR data
        const operations = classifyOperations(registros);
        const periodData = {
            fileName: fileName,
            periodo: dadosEmpresa.periodo,
            nomeEmpresa: dadosEmpresa.nome,
            fomentarData: operations,
            registrosCompletos: registros,
            calculatedValues: null
        };
        
        return periodData;
    }
    
    function extrairDadosEmpresa(registros) {
        let nome = "Empresa";
        let periodo = "";
        let dataInicial = "";
        let dataFinal = "";
        
        if (registros['0000'] && registros['0000'].length > 0) {
            const reg0000 = registros['0000'][0];
            
            // Índices corretos para lerArquivoSpedCompleto (mantém pipes vazios):
            // Array completo: ['', REG, COD_VER, TIPO_ESC, DT_INI, DT_FIN, NOME, CNPJ, ...]
            // 0='', 1=REG, 2=COD_VER, 3=TIPO_ESC, 4=DT_INI, 5=DT_FIN, 6=NOME, 7=CNPJ
            
            const dtIniIndex = 4;  // DT_INI
            const dtFinIndex = 5;  // DT_FIN  
            const nomeIndex = 6;   // NOME
            
            // Extrair nome da empresa (campo 6)
            if (reg0000.length > nomeIndex) {
                nome = reg0000[nomeIndex] || "Empresa";
            }
            
            // Extrair data inicial (campo 4)
            if (reg0000.length > dtIniIndex) {
                dataInicial = reg0000[dtIniIndex];
                if (dataInicial && dataInicial.length === 8) {
                    // Converte DDMMAAAA para MM/AAAA
                    const dia = dataInicial.substring(0, 2);
                    const mes = dataInicial.substring(2, 4);
                    const ano = dataInicial.substring(4, 8);
                    periodo = `${mes}/${ano}`;
                }
            }
            
            // Extrair data final (campo 5)
            if (reg0000.length > dtFinIndex) {
                dataFinal = reg0000[dtFinIndex];
            }
        }
        
        return { 
            nome, 
            periodo, 
            dataInicial, 
            dataFinal 
        };
    }
    
    function parsePeriod(periodo) {
        // Convert period string like "01/2024" to Date object
        const [month, year] = periodo.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    
    function applyAutomaticSaldoCredorCarryover() {
        for (let i = 1; i < multiPeriodData.length; i++) {
            const previousPeriod = multiPeriodData[i - 1];
            const currentPeriod = multiPeriodData[i];
            
            // Calculate previous period if not done yet
            if (!previousPeriod.calculatedValues) {
                previousPeriod.calculatedValues = calculateFomentarForPeriod(previousPeriod.fomentarData, 0);
            }
            
            // Get saldo credor from previous period (simplified - would need actual calculation)
            const saldoCredorAnterior = previousPeriod.calculatedValues.saldoCredorFinal || 0;
            
            // Calculate current period with carryover
            currentPeriod.calculatedValues = calculateFomentarForPeriod(currentPeriod.fomentarData, saldoCredorAnterior);
            
            addLog(`Período ${currentPeriod.periodo}: Saldo credor anterior R$ ${saldoCredorAnterior.toFixed(2)}`, 'info');
        }
        
        // Calculate first period (no carryover)
        if (multiPeriodData.length > 0 && !multiPeriodData[0].calculatedValues) {
            multiPeriodData[0].calculatedValues = calculateFomentarForPeriod(multiPeriodData[0].fomentarData, 0);
        }
    }
    
    function calculateFomentarForPeriod(fomentarData, saldoCredorAnterior, configOverrides = {}) {
        // Configuration values
        const percentualFinanciamento = configOverrides.percentualFinanciamento || 0.70;
        const icmsPorMedia = configOverrides.icmsPorMedia || 0;
        
        // QUADRO A - Proporção dos Créditos
        const saidasIncentivadas = fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
        const saidasNaoIncentivadas = fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
        const totalSaidas = saidasIncentivadas + saidasNaoIncentivadas;
        const percentualSaidas = totalSaidas > 0 ? (saidasIncentivadas / totalSaidas) * 100 : 0;
        
        const creditosEntradas = fomentarData.creditosEntradas || 0;
        const outrosCreditos = fomentarData.outrosCreditos || 0;
        const estornoDebitos = 0; // Default
        const totalCreditos = creditosEntradas + outrosCreditos + estornoDebitos + saldoCredorAnterior;
        
        const creditoIncentivadas = (percentualSaidas / 100) * totalCreditos;
        const creditoNaoIncentivadas = totalCreditos - creditoIncentivadas;
        
        // QUADRO B - Operações Incentivadas
        const debitoIncentivadas = fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorIcms, 0);
        const outrosDebitosIncentivadas = (fomentarData.outrosDebitos || 0) * (percentualSaidas / 100);
        const estornoCreditosIncentivadas = 0;
        const deducoesIncentivadas = 0;
        
        const saldoDevedorIncentivadas = Math.max(0, 
            (debitoIncentivadas + outrosDebitosIncentivadas + estornoCreditosIncentivadas) - 
            (creditoIncentivadas + deducoesIncentivadas)
        );
        
        const icmsBaseFomentar = Math.max(0, saldoDevedorIncentivadas - icmsPorMedia);
        const icmsSujeitoFinanciamento = icmsBaseFomentar * percentualFinanciamento;
        const icmsFinanciado = icmsSujeitoFinanciamento;
        const parcelaNaoFinanciada = icmsBaseFomentar - icmsSujeitoFinanciamento;
        const saldoPagarParcelaNaoFinanciada = Math.max(0, parcelaNaoFinanciada);
        
        // QUADRO C - Operações Não Incentivadas
        const debitoNaoIncentivadas = fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorIcms, 0);
        const outrosDebitosNaoIncentivadas = (fomentarData.outrosDebitos || 0) * ((100 - percentualSaidas) / 100);
        const estornoCreditosNaoIncentivadas = 0;
        const deducoesNaoIncentivadas = 0;
        
        const saldoDevedorNaoIncentivadas = Math.max(0,
            (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas) - 
            (creditoNaoIncentivadas + deducoesNaoIncentivadas)
        );
        
        const saldoPagarNaoIncentivadas = Math.max(0, saldoDevedorNaoIncentivadas);
        
        // Cálculos finais
        const totalPagarIncentivadas = saldoPagarParcelaNaoFinanciada;
        const totalPagarNaoIncentivadas = saldoPagarNaoIncentivadas;
        const valorFinanciamento = icmsFinanciado;
        const totalGeralPagar = totalPagarIncentivadas + totalPagarNaoIncentivadas;
        
        // Saldo credor final (simplificado)
        const saldoCredorFinal = Math.max(0, totalCreditos - (debitoIncentivadas + debitoNaoIncentivadas + outrosDebitosIncentivadas + outrosDebitosNaoIncentivadas));
        
        return {
            // Quadro A
            saidasIncentivadas,
            saidasNaoIncentivadas,
            totalSaidas,
            percentualSaidas,
            creditosEntradas,
            outrosCreditos,
            estornoDebitos,
            saldoCredorAnterior,
            totalCreditos,
            creditoIncentivadas,
            creditoNaoIncentivadas,
            
            // Quadro B
            debitoIncentivadas,
            outrosDebitosIncentivadas,
            estornoCreditosIncentivadas,
            deducoesIncentivadas,
            saldoDevedorIncentivadas,
            icmsPorMedia,
            icmsBaseFomentar,
            percentualFinanciamento: percentualFinanciamento * 100,
            icmsSujeitoFinanciamento,
            icmsFinanciado,
            parcelaNaoFinanciada,
            saldoPagarParcelaNaoFinanciada,
            
            // Quadro C
            debitoNaoIncentivadas,
            outrosDebitosNaoIncentivadas,
            estornoCreditosNaoIncentivadas,
            deducoesNaoIncentivadas,
            saldoDevedorNaoIncentivadas,
            saldoPagarNaoIncentivadas,
            
            // Resumo
            totalPagarIncentivadas,
            totalPagarNaoIncentivadas,
            valorFinanciamento,
            totalGeralPagar,
            saldoCredorFinal
        };
    }
    
    function showMultiPeriodResults() {
        const periodsSelector = document.getElementById('periodsSelector');
        const periodsButtons = document.getElementById('periodsButtons');
        const fomentarResults = document.getElementById('fomentarResults');
        
        periodsSelector.style.display = 'block';
        fomentarResults.style.display = 'block';
        
        // Create period buttons
        periodsButtons.innerHTML = '';
        multiPeriodData.forEach((period, index) => {
            const button = document.createElement('button');
            button.className = 'period-button';
            button.textContent = period.periodo;
            button.onclick = () => selectPeriod(index);
            if (index === 0) button.classList.add('active');
            periodsButtons.appendChild(button);
        });
        
        // Show first period by default
        selectPeriod(0);
    }
    
    function selectPeriod(index) {
        selectedPeriodIndex = index;
        const period = multiPeriodData[index];
        
        // Update active button
        document.querySelectorAll('.period-button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        
        // Update display with period data
        fomentarData = period.fomentarData;
        
        // Set saldo credor anterior in the form
        document.getElementById('saldoCredorAnterior').value = period.calculatedValues?.saldoCredorAnterior || 0;
        
        // Recalculate and display
        calculateFomentar();
        
        addLog(`Exibindo dados do período: ${period.periodo}`, 'info');
    }
    
    function switchView(viewType) {
        const singleBtn = document.getElementById('viewSinglePeriod');
        const comparativeBtn = document.getElementById('viewComparative');
        const exportComparativeBtn = document.getElementById('exportComparative');
        const exportPDFBtn = document.getElementById('exportPDF');
        
        if (viewType === 'single') {
            singleBtn.classList.add('active');
            comparativeBtn.classList.remove('active');
            exportComparativeBtn.style.display = 'none';
            exportPDFBtn.style.display = 'none';
            
            // Show individual period view
            showIndividualPeriodView();
        } else {
            singleBtn.classList.remove('active');
            comparativeBtn.classList.add('active');
            exportComparativeBtn.style.display = 'inline-block';
            exportPDFBtn.style.display = 'inline-block';
            
            // Show comparative view
            showComparativeView();
        }
    }
    
    function showIndividualPeriodView() {
        // Show normal quadros
        document.querySelectorAll('.quadro-section').forEach(section => {
            section.style.display = 'block';
        });
        
        // Hide comparative table if exists
        const comparativeTable = document.getElementById('comparativeTable');
        if (comparativeTable) {
            comparativeTable.style.display = 'none';
        }
    }
    
    function showComparativeView() {
        // Hide normal quadros
        document.querySelectorAll('.quadro-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show or create comparative table
        createComparativeTable();
    }
    
    function createComparativeTable() {
        let comparativeTable = document.getElementById('comparativeTable');
        
        if (!comparativeTable) {
            comparativeTable = document.createElement('div');
            comparativeTable.id = 'comparativeTable';
            comparativeTable.innerHTML = '<h3>📊 Relatório Comparativo Multi-Período</h3>';
            
            const fomentarResults = document.getElementById('fomentarResults');
            fomentarResults.appendChild(comparativeTable);
        }
        
        // Build comparative table HTML
        const tableHTML = buildComparativeTableHTML();
        comparativeTable.innerHTML = '<h3>📊 Relatório Comparativo Multi-Período</h3>' + tableHTML;
        comparativeTable.style.display = 'block';
    }
    
    function buildComparativeTableHTML() {
        if (multiPeriodData.length === 0) return '<p>Nenhum período processado.</p>';
        
        // Table headers with periods info
        let html = '<div class="table-info">';
        html += `<p><strong>Períodos analisados:</strong> ${multiPeriodData.map(p => p.periodo).join(', ')}</p>`;
        html += `<p><strong>Empresa:</strong> ${multiPeriodData[0].nomeEmpresa}</p>`;
        html += '</div>';
        
        html += '<table class="comparative-table"><thead><tr>';
        html += '<th class="description-col">Item</th>';
        html += '<th class="description-col">Descrição</th>';
        multiPeriodData.forEach(period => {
            html += `<th class="period-header">${period.periodo}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        // Table rows for each calculation item
        const items = [
            { id: 'saidasIncentivadas', label: 'Saídas Incentivadas' },
            { id: 'totalSaidas', label: 'Total das Saídas' },
            { id: 'percentualSaidas', label: 'Percentual Saídas Incentivadas (%)' },
            { id: 'creditoIncentivadas', label: 'Crédito para Operações Incentivadas' },
            { id: 'saldoCredorAnterior', label: 'Saldo Credor Anterior' },
            { id: 'valorFinanciamento', label: 'Valor do Financiamento' },
            { id: 'totalGeralPagar', label: 'Total Geral a Pagar' }
        ];
        
        items.forEach(item => {
            html += `<tr><td class="description-col">${item.id || ''}</td>`;
            html += `<td class="description-col">${item.label}</td>`;
            multiPeriodData.forEach(period => {
                const value = period.calculatedValues?.[item.id] || 0;
                html += `<td class="value-col">R$ ${value.toFixed(2)}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        return html;
    }
    
    async function exportComparativeReport() {
        if (multiPeriodData.length === 0) {
            addLog('Erro: Nenhum período processado para exportação comparativa', 'error');
            return;
        }
        
        addLog('Gerando relatório comparativo multi-período conforme modelo oficial...', 'info');
        
        try {
            // Create workbook based on official template structure
            const workbook = await XlsxPopulate.fromBlankAsync();
            
            // Set main sheet name
            const mainSheet = workbook.sheet(0);
            mainSheet.name("Demonstrativo FOMENTAR Multi-Período");
            
            // Create header section
            await createComparativeExcelHeader(mainSheet);
            
            // Create Quadro A - Proporção dos Créditos
            let currentRow = await createQuadroAComparative(mainSheet, 9);
            
            // Create Quadro B - Operações Incentivadas  
            currentRow = await createQuadroBComparative(mainSheet, currentRow + 3);
            
            // Create Quadro C - Operações Não Incentivadas
            currentRow = await createQuadroCComparative(mainSheet, currentRow + 3);
            
            // Create summary section
            await createSummaryComparative(mainSheet, currentRow + 3);
            
            // Apply formatting
            await formatComparativeSheet(mainSheet);
            
            // Generate download
            const fileName = `FOMENTAR_Comparativo_${multiPeriodData[0].periodo.replace('/', '-')}_a_${multiPeriodData[multiPeriodData.length-1].periodo.replace('/', '-')}.xlsx`;
            
            const excelData = await workbook.outputAsync();
            const blob = new Blob([excelData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            addLog(`Relatório comparativo exportado: ${fileName}`, 'success');
            
        } catch (error) {
            addLog(`Erro ao gerar relatório comparativo: ${error.message}`, 'error');
        }
    }
    
    async function createComparativeExcelHeader(sheet) {
        // Header do demonstrativo conforme modelo oficial
        sheet.cell("A1").value("DEMONSTRATIVO DA APURAÇÃO MENSAL - FOMENTAR/PRODUZIR/MICROPRODUZIR");
        sheet.cell("A2").value("RELATÓRIO COMPARATIVO MULTI-PERÍODO");
        sheet.cell("A3").value(`Empresa: ${multiPeriodData[0].nomeEmpresa}`);
        sheet.cell("A4").value(`Períodos analisados: ${multiPeriodData.map(p => p.periodo).join(', ')}`);
        sheet.cell("A5").value(`Período de análise: ${multiPeriodData[0].periodo} a ${multiPeriodData[multiPeriodData.length-1].periodo}`);
        
        // Calculate merge range based on number of periods
        const lastColumn = String.fromCharCode('B'.charCodeAt(0) + multiPeriodData.length);
        
        // Merge header cells
        sheet.range(`A1:${lastColumn}1`).merged(true);
        sheet.range(`A2:${lastColumn}2`).merged(true);
        sheet.range(`A3:${lastColumn}3`).merged(true);
        sheet.range(`A4:${lastColumn}4`).merged(true);
        sheet.range(`A5:${lastColumn}5`).merged(true);
    }
    
    async function createQuadroAComparative(sheet, startRow) {
        // Quadro A header
        sheet.cell(`A${startRow}`).value("A - PROPORÇÃO DOS CRÉDITOS APROPRIADOS");
        sheet.range(`A${startRow}:H${startRow}`).merged(true);
        
        startRow++;
        
        // Column headers
        sheet.cell(`A${startRow}`).value("Item");
        sheet.cell(`B${startRow}`).value("Descrição");
        
        let col = 'C';
        multiPeriodData.forEach(period => {
            sheet.cell(`${col}${startRow}`).value(period.periodo);
            col = String.fromCharCode(col.charCodeAt(0) + 1);
        });
        
        startRow++;
        
        // Quadro A items
        const quadroAItems = [
            { id: '1', desc: 'Saídas das Operações Incentivadas', field: 'saidasIncentivadas' },
            { id: '2', desc: 'Total das Saídas', field: 'totalSaidas' },
            { id: '3', desc: 'Percentual das Saídas das Operações Incentivadas (%)', field: 'percentualSaidas' },
            { id: '4', desc: 'Créditos por Entradas', field: 'creditosEntradas' },
            { id: '5', desc: 'Outros Créditos', field: 'outrosCreditos' },
            { id: '6', desc: 'Estorno de Débitos', field: 'estornoDebitos' },
            { id: '7', desc: 'Saldo Credor do Período Anterior', field: 'saldoCredorAnterior' },
            { id: '8', desc: 'Total dos Créditos do Período', field: 'totalCreditos' },
            { id: '9', desc: 'Crédito para Operações Incentivadas', field: 'creditoIncentivadas' },
            { id: '10', desc: 'Crédito para Operações Não Incentivadas', field: 'creditoNaoIncentivadas' }
        ];
        
        quadroAItems.forEach(item => {
            sheet.cell(`A${startRow}`).value(item.id);
            sheet.cell(`B${startRow}`).value(item.desc);
            
            let col = 'C';
            multiPeriodData.forEach(period => {
                const value = period.calculatedValues?.[item.field] || 0;
                sheet.cell(`${col}${startRow}`).value(value);
                col = String.fromCharCode(col.charCodeAt(0) + 1);
            });
            
            startRow++;
        });
        
        return startRow;
    }
    
    async function createQuadroBComparative(sheet, startRow) {
        // Quadro B header
        sheet.cell(`A${startRow}`).value("B - APURAÇÃO DOS SALDOS DAS OPERAÇÕES INCENTIVADAS");
        sheet.range(`A${startRow}:H${startRow}`).merged(true);
        
        startRow++;
        
        // Column headers
        sheet.cell(`A${startRow}`).value("Item");
        sheet.cell(`B${startRow}`).value("Descrição");
        
        let col = 'C';
        multiPeriodData.forEach(period => {
            sheet.cell(`${col}${startRow}`).value(period.periodo);
            col = String.fromCharCode(col.charCodeAt(0) + 1);
        });
        
        startRow++;
        
        // Quadro B items
        const quadroBItems = [
            { id: '11', desc: 'Débito do ICMS das Operações Incentivadas', field: 'debitoIncentivadas' },
            { id: '12', desc: 'Outros Débitos das Operações Incentivadas', field: 'outrosDebitosIncentivadas' },
            { id: '13', desc: 'Estorno de Créditos das Operações Incentivadas', field: 'estornoCreditosIncentivadas' },
            { id: '14', desc: 'Crédito para Operações Incentivadas', field: 'creditoIncentivadas' },
            { id: '15', desc: 'Deduções das Operações Incentivadas', field: 'deducoesIncentivadas' },
            { id: '17', desc: 'Saldo Devedor do ICMS das Operações Incentivadas', field: 'saldoDevedorIncentivadas' },
            { id: '18', desc: 'ICMS por Média', field: 'icmsPorMedia' },
            { id: '21', desc: 'ICMS Base para FOMENTAR/PRODUZIR', field: 'icmsBaseFomentar' },
            { id: '22', desc: 'Percentagem do Financiamento (%)', field: 'percentualFinanciamento' },
            { id: '23', desc: 'ICMS Sujeito a Financiamento', field: 'icmsSujeitoFinanciamento' },
            { id: '25', desc: 'ICMS Financiado', field: 'icmsFinanciado' },
            { id: '26', desc: 'Saldo do ICMS da Parcela Não Financiada', field: 'parcelaNaoFinanciada' },
            { id: '28', desc: 'Saldo do ICMS a Pagar da Parcela Não Financiada', field: 'saldoPagarParcelaNaoFinanciada' }
        ];
        
        quadroBItems.forEach(item => {
            sheet.cell(`A${startRow}`).value(item.id);
            sheet.cell(`B${startRow}`).value(item.desc);
            
            let col = 'C';
            multiPeriodData.forEach(period => {
                const value = period.calculatedValues?.[item.field] || 0;
                sheet.cell(`${col}${startRow}`).value(value);
                col = String.fromCharCode(col.charCodeAt(0) + 1);
            });
            
            startRow++;
        });
        
        return startRow;
    }
    
    async function createQuadroCComparative(sheet, startRow) {
        // Quadro C header
        sheet.cell(`A${startRow}`).value("C - APURAÇÃO DOS SALDOS DAS OPERAÇÕES NÃO INCENTIVADAS");
        sheet.range(`A${startRow}:H${startRow}`).merged(true);
        
        startRow++;
        
        // Column headers
        sheet.cell(`A${startRow}`).value("Item");
        sheet.cell(`B${startRow}`).value("Descrição");
        
        let col = 'C';
        multiPeriodData.forEach(period => {
            sheet.cell(`${col}${startRow}`).value(period.periodo);
            col = String.fromCharCode(col.charCodeAt(0) + 1);
        });
        
        startRow++;
        
        // Quadro C items
        const quadroCItems = [
            { id: '32', desc: 'Débito do ICMS das Operações Não Incentivadas', field: 'debitoNaoIncentivadas' },
            { id: '33', desc: 'Outros Débitos das Operações Não Incentivadas', field: 'outrosDebitosNaoIncentivadas' },
            { id: '34', desc: 'Estorno de Créditos das Operações Não Incentivadas', field: 'estornoCreditosNaoIncentivadas' },
            { id: '36', desc: 'Crédito para Operações Não Incentivadas', field: 'creditoNaoIncentivadas' },
            { id: '37', desc: 'Deduções das Operações Não Incentivadas', field: 'deducoesNaoIncentivadas' },
            { id: '39', desc: 'Saldo Devedor do ICMS das Operações Não Incentivadas', field: 'saldoDevedorNaoIncentivadas' },
            { id: '41', desc: 'Saldo do ICMS a Pagar das Operações Não Incentivadas', field: 'saldoPagarNaoIncentivadas' }
        ];
        
        quadroCItems.forEach(item => {
            sheet.cell(`A${startRow}`).value(item.id);
            sheet.cell(`B${startRow}`).value(item.desc);
            
            let col = 'C';
            multiPeriodData.forEach(period => {
                const value = period.calculatedValues?.[item.field] || 0;
                sheet.cell(`${col}${startRow}`).value(value);
                col = String.fromCharCode(col.charCodeAt(0) + 1);
            });
            
            startRow++;
        });
        
        return startRow;
    }
    
    async function createSummaryComparative(sheet, startRow) {
        // Summary header
        sheet.cell(`A${startRow}`).value("RESUMO DA APURAÇÃO");
        sheet.range(`A${startRow}:H${startRow}`).merged(true);
        
        startRow++;
        
        // Column headers
        sheet.cell(`A${startRow}`).value("Descrição");
        sheet.cell(`B${startRow}`).value("");
        
        let col = 'C';
        multiPeriodData.forEach(period => {
            sheet.cell(`${col}${startRow}`).value(period.periodo);
            col = String.fromCharCode(col.charCodeAt(0) + 1);
        });
        
        startRow++;
        
        // Summary items
        const summaryItems = [
            { desc: 'Total a Pagar - Operações Incentivadas', field: 'totalPagarIncentivadas' },
            { desc: 'Total a Pagar - Operações Não Incentivadas', field: 'totalPagarNaoIncentivadas' },
            { desc: 'Valor do Financiamento FOMENTAR', field: 'valorFinanciamento' },
            { desc: 'Total Geral a Pagar', field: 'totalGeralPagar' }
        ];
        
        summaryItems.forEach(item => {
            sheet.cell(`A${startRow}`).value(item.desc);
            
            let col = 'C';
            multiPeriodData.forEach(period => {
                const value = period.calculatedValues?.[item.field] || 0;
                sheet.cell(`${col}${startRow}`).value(value);
                col = String.fromCharCode(col.charCodeAt(0) + 1);
            });
            
            startRow++;
        });
        
        return startRow;
    }
    
    async function formatComparativeSheet(sheet) {
        // Apply number formatting for currency values
        const lastColumn = String.fromCharCode('B'.charCodeAt(0) + multiPeriodData.length);
        
        // Format header rows
        const headerRange = `A1:${lastColumn}5`;
        sheet.range(headerRange).style({
            fontFamily: "Arial",
            fontSize: 12,
            bold: true,
            horizontalAlignment: "center",
            fill: "E8F4F8"
        });
        
        // Format section headers
        const sectionRows = ["A8", "A19", "A32", "A42"]; // Adjust based on actual rows
        sectionRows.forEach(cell => {
            if (sheet.cell(cell).value()) {
                sheet.row(sheet.cell(cell).rowNumber()).style({
                    fontFamily: "Arial",
                    fontSize: 11,
                    bold: true,
                    fill: "D6EAF8",
                    horizontalAlignment: "center"
                });
            }
        });
        
        // Format value columns as currency
        for (let col = 'C'; col <= lastColumn; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
            sheet.column(col).style({
                numberFormat: "#,##0.00",
                horizontalAlignment: "right"
            });
        }
        
        // Auto-fit columns
        sheet.column("A").width(8);
        sheet.column("B").width(50);
        for (let col = 'C'; col <= lastColumn; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
            sheet.column(col).width(15);
        }
    }
    
    // === PDF Export Functions ===
    
    async function exportComparativePDF() {
        if (multiPeriodData.length === 0) {
            addLog('Erro: Nenhum período processado para exportação PDF', 'error');
            return;
        }
        
        addLog('Gerando relatório PDF comparativo multi-período...', 'info');
        
        try {
            // Create PDF document
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape', 'mm', 'a4');
            
            // Set font
            doc.setFont('helvetica');
            
            // Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('DEMONSTRATIVO DA APURAÇÃO MENSAL - FOMENTAR/PRODUZIR/MICROPRODUZIR', 20, 20);
            
            doc.setFontSize(14);
            doc.text('RELATÓRIO COMPARATIVO MULTI-PERÍODO', 20, 30);
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Empresa: ${multiPeriodData[0].nomeEmpresa}`, 20, 40);
            doc.text(`Períodos analisados: ${multiPeriodData.map(p => p.periodo).join(', ')}`, 20, 50);
            doc.text(`Período de análise: ${multiPeriodData[0].periodo} a ${multiPeriodData[multiPeriodData.length-1].periodo}`, 20, 60);
            
            let yPosition = 70;
            
            // Quadro A
            yPosition = await addQuadroToPDF(doc, 'A - PROPORÇÃO DOS CRÉDITOS APROPRIADOS', getQuadroAData(), yPosition);
            
            // Quadro B
            yPosition = await addQuadroToPDF(doc, 'B - APURAÇÃO DOS SALDOS DAS OPERAÇÕES INCENTIVADAS', getQuadroBData(), yPosition + 10);
            
            // Check if need new page
            if (yPosition > 140) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Quadro C
            yPosition = await addQuadroToPDF(doc, 'C - APURAÇÃO DOS SALDOS DAS OPERAÇÕES NÃO INCENTIVADAS', getQuadroCData(), yPosition + 10);
            
            // Summary
            if (yPosition > 110) {
                doc.addPage();
                yPosition = 20;
            }
            yPosition = await addQuadroToPDF(doc, 'RESUMO DA APURAÇÃO', getSummaryData(), yPosition + 10);
            
            // Save PDF
            const fileName = `FOMENTAR_Comparativo_${multiPeriodData[0].periodo.replace('/', '-')}_a_${multiPeriodData[multiPeriodData.length-1].periodo.replace('/', '-')}.pdf`;
            doc.save(fileName);
            
            addLog(`Relatório PDF exportado: ${fileName}`, 'success');
            
        } catch (error) {
            addLog(`Erro ao gerar relatório PDF: ${error.message}`, 'error');
        }
    }
    
    async function addQuadroToPDF(doc, title, data, yPosition) {
        // Title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, yPosition);
        
        yPosition += 10;
        
        // Prepare table data
        const headers = ['Item', 'Descrição', ...multiPeriodData.map(p => p.periodo)];
        const rows = data.map(item => [
            item.id || '',
            item.desc,
            ...multiPeriodData.map(period => {
                const value = period.calculatedValues?.[item.field] || 0;
                return typeof value === 'number' ? 
                    (value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)) : 
                    value.toString();
            })
        ]);
        
        // Add table
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: yPosition,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                lineColor: [0, 0, 0],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [200, 220, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 80, halign: 'left' }
            },
            margin: { left: 20, right: 20 }
        });
        
        return doc.lastAutoTable.finalY;
    }
    
    function getQuadroAData() {
        return [
            { id: '1', desc: 'Saídas das Operações Incentivadas', field: 'saidasIncentivadas' },
            { id: '2', desc: 'Total das Saídas', field: 'totalSaidas' },
            { id: '3', desc: 'Percentual das Saídas das Operações Incentivadas (%)', field: 'percentualSaidas' },
            { id: '4', desc: 'Créditos por Entradas', field: 'creditosEntradas' },
            { id: '5', desc: 'Outros Créditos', field: 'outrosCreditos' },
            { id: '6', desc: 'Estorno de Débitos', field: 'estornoDebitos' },
            { id: '7', desc: 'Saldo Credor do Período Anterior', field: 'saldoCredorAnterior' },
            { id: '8', desc: 'Total dos Créditos do Período', field: 'totalCreditos' },
            { id: '9', desc: 'Crédito para Operações Incentivadas', field: 'creditoIncentivadas' },
            { id: '10', desc: 'Crédito para Operações Não Incentivadas', field: 'creditoNaoIncentivadas' }
        ];
    }
    
    function getQuadroBData() {
        return [
            { id: '11', desc: 'Débito do ICMS das Operações Incentivadas', field: 'debitoIncentivadas' },
            { id: '12', desc: 'Outros Débitos das Operações Incentivadas', field: 'outrosDebitosIncentivadas' },
            { id: '13', desc: 'Estorno de Créditos das Operações Incentivadas', field: 'estornoCreditosIncentivadas' },
            { id: '14', desc: 'Crédito para Operações Incentivadas', field: 'creditoIncentivadas' },
            { id: '15', desc: 'Deduções das Operações Incentivadas', field: 'deducoesIncentivadas' },
            { id: '17', desc: 'Saldo Devedor do ICMS das Operações Incentivadas', field: 'saldoDevedorIncentivadas' },
            { id: '18', desc: 'ICMS por Média', field: 'icmsPorMedia' },
            { id: '21', desc: 'ICMS Base para FOMENTAR/PRODUZIR', field: 'icmsBaseFomentar' },
            { id: '22', desc: 'Percentagem do Financiamento (%)', field: 'percentualFinanciamento' },
            { id: '23', desc: 'ICMS Sujeito a Financiamento', field: 'icmsSujeitoFinanciamento' },
            { id: '25', desc: 'ICMS Financiado', field: 'icmsFinanciado' },
            { id: '26', desc: 'Saldo do ICMS da Parcela Não Financiada', field: 'parcelaNaoFinanciada' },
            { id: '28', desc: 'Saldo do ICMS a Pagar da Parcela Não Financiada', field: 'saldoPagarParcelaNaoFinanciada' }
        ];
    }
    
    function getQuadroCData() {
        return [
            { id: '32', desc: 'Débito do ICMS das Operações Não Incentivadas', field: 'debitoNaoIncentivadas' },
            { id: '33', desc: 'Outros Débitos das Operações Não Incentivadas', field: 'outrosDebitosNaoIncentivadas' },
            { id: '34', desc: 'Estorno de Créditos das Operações Não Incentivadas', field: 'estornoCreditosNaoIncentivadas' },
            { id: '36', desc: 'Crédito para Operações Não Incentivadas', field: 'creditoNaoIncentivadas' },
            { id: '37', desc: 'Deduções das Operações Não Incentivadas', field: 'deducoesNaoIncentivadas' },
            { id: '39', desc: 'Saldo Devedor do ICMS das Operações Não Incentivadas', field: 'saldoDevedorNaoIncentivadas' },
            { id: '41', desc: 'Saldo do ICMS a Pagar das Operações Não Incentivadas', field: 'saldoPagarNaoIncentivadas' }
        ];
    }
    
    function getSummaryData() {
        return [
            { desc: 'Total a Pagar - Operações Incentivadas', field: 'totalPagarIncentivadas' },
            { desc: 'Total a Pagar - Operações Não Incentivadas', field: 'totalPagarNaoIncentivadas' },
            { desc: 'Valor do Financiamento FOMENTAR', field: 'valorFinanciamento' },
            { desc: 'Total Geral a Pagar', field: 'totalGeralPagar' }
        ];
    }
    
    // --- ProGoiás Constants ---
    const PROGOIAS_CONFIG = {
        PERCENTUAIS_POR_ANO: {
            1: 64, // 1º ano
            2: 65, // 2º ano
            3: 66  // 3º ano ou mais
        },
        PROTEGE_POR_ANO: {
            0: 0,  // Sem PROTEGE
            1: 10, // 1º ano
            2: 8,  // 2º ano
            3: 6   // 3º ano ou mais
        },
        TIPOS_EMPRESA: {
            MICRO: { limite: 360000 },
            PEQUENA: { limite: 4800000 },
            MEDIA: { limite: 300000000 }
        }
    };
    
    // --- ProGoiás Functions ---
    function importSpedForProgoias() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                processProgoisSpedFile(file);
            }
        };
        input.click();
    }
    
    function processProgoisSpedFile(file) {
        addLog(`Carregando arquivo SPED para ProGoiás: ${file.name}`, 'info');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                
                // Apenas carregar e validar o SPED, não processar ainda
                const registros = lerArquivoSpedCompleto(content);
                
                if (!registros || Object.keys(registros).length === 0) {
                    throw new Error('SPED não contém operações válidas');
                }
                
                // Armazenar dados para processamento posterior
                progoisRegistrosCompletos = registros;
                
                // Atualizar status e mostrar botão de processamento
                document.getElementById('progoisSpedStatus').textContent = 
                    `${registros.empresa || 'Empresa'} - ${registros.periodo || 'Período'} (Arquivo carregado)`;
                
                document.getElementById('processProgoisData').style.display = 'block';
                
                addLog('Arquivo SPED carregado com sucesso. Configure os parâmetros e clique em "Processar Apuração".', 'success');
                
            } catch (error) {
                console.error('Erro ao carregar arquivo SPED para ProGoiás:', error);
                addLog(`Erro ao carregar arquivo SPED: ${error.message}`, 'error');
                document.getElementById('processProgoisData').style.display = 'none';
            }
        };
        
        reader.onerror = function() {
            addLog('Erro ao ler o arquivo SPED', 'error');
        };
        
        reader.readAsText(file);
    }
    
    function processProgoisData() {
        if (!progoisRegistrosCompletos) {
            addLog('Nenhum arquivo SPED carregado para processar', 'error');
            return;
        }
        
        // Verificar se estamos no modo múltiplos períodos
        if (progoisCurrentImportMode === 'multiple') {
            // Processar múltiplos SPEDs
            processProgoisMultipleSpeds();
            return;
        }
        
        // Processar período único
        try {
            addLog('Iniciando processamento da apuração ProGoiás...', 'info');
            
            const calculoProgoias = calculateProgoias(progoisRegistrosCompletos);
            progoisData = calculoProgoias;
            
            // Atualizar interface
            updateProgoisUI(calculoProgoias);
            document.getElementById('progoisResults').style.display = 'block';
            
            // Atualizar status
            document.getElementById('progoisSpedStatus').textContent = 
                `${calculoProgoias.empresa} - ${calculoProgoias.periodo} (${calculoProgoias.totalOperacoes} operações processadas)`;
            
            addLog(`Apuração ProGoiás concluída com sucesso!`, 'success');
            
        } catch (error) {
            console.error('Erro ao processar apuração ProGoiás:', error);
            addLog(`Erro ao processar apuração ProGoiás: ${error.message}`, 'error');
        }
    }
    
    function calculateProgoias(registros) {
        const ano = parseInt(document.getElementById('progoisAno').value) || 1;
        
        const config = {
            tipoEmpresa: document.getElementById('progoisTipoEmpresa').value,
            ano: ano,
            percentualIncentivo: PROGOIAS_CONFIG.PERCENTUAIS_POR_ANO[ano] || 64,
            percentualProtege: ano === 0 ? 0 : PROGOIAS_CONFIG.PROTEGE_POR_ANO[ano] || 0,
            icmsPorMedia: parseFloat(document.getElementById('progoisIcmsPorMedia').value) || 0,
            saldoCredorAnterior: parseFloat(document.getElementById('progoisSaldoCredorAnterior').value) || 0,
            ajustePeridoAnterior: 0  // GO100007 - Ajuste da base de cálculo ProGoiás período anterior
        };
        
        // Usar as mesmas funções de classificação do FOMENTAR
        addLog('Classificando operações para ProGoiás...', 'info');
        const operacoesClassificadas = classifyOperations(registros);
        
        // Debug: verificar dados classificados
        addLog(`Operações classificadas: ${operacoesClassificadas.saidasIncentivadas?.length || 0} saídas incentivadas, ${operacoesClassificadas.saidasNaoIncentivadas?.length || 0} saídas não incentivadas`, 'info');
        addLog(`Créditos de entradas: R$ ${formatCurrency(operacoesClassificadas.creditosEntradas || 0)}, Outros créditos: R$ ${formatCurrency(operacoesClassificadas.outrosCreditos || 0)}`, 'info');
        
        // Calcular conforme IN 1478/2020
        addLog('Calculando ProGoiás conforme IN 1478/2020...', 'info');
        const quadroA = calculateProgoisApuracao(operacoesClassificadas, config);        // Cálculo do ProGoiás
        const quadroB = calculateIcmsComProgoias(quadroA, operacoesClassificadas, config); // ICMS com crédito ProGoiás
        const quadroC = calculateDemonstrativoDetalhado(operacoesClassificadas, config);    // Demonstrativo detalhado
        
        return {
            empresa: registros.empresa || 'Empresa',
            periodo: registros.periodo || 'Período',
            config: config,
            quadroA: quadroA,
            quadroB: quadroB,
            quadroC: quadroC,
            totalOperacoes: (operacoesClassificadas.entradasIncentivadas?.length || 0) + 
                           (operacoesClassificadas.saidasIncentivadas?.length || 0) + 
                           (operacoesClassificadas.entradasNaoIncentivadas?.length || 0) + 
                           (operacoesClassificadas.saidasNaoIncentivadas?.length || 0)
        };
    }
    
    function calculateProgoisApuracao(operacoes, config) {
        // ABA 1 - CÁLCULO DO PROGOIÁS (conforme Progoias.xlsx)
        // Seguindo exatamente a estrutura da planilha oficial
        
        addLog('=== ABA 1: CÁLCULO DO PROGOIÁS (Planilha Oficial) ===', 'info');
        
        // ITENS CONFORME PLANILHA PROGOIAS.XLSX
        
        // GO100002 = ICMS correspondente às saídas incentivadas (Anexo I)
        const GO100002 = (operacoes.saidasIncentivadas || [])
            .reduce((total, op) => total + (op.valorIcms || 0), 0);
        
        // GO100003 = ICMS correspondente às entradas incentivadas (Anexo I)
        const GO100003 = operacoes.creditosEntradasIncentivadas || 0;
        
        // GO100004 = Outros Créditos e Estorno de Débitos (APENAS códigos incentivados do Anexo II)
        const GO100004 = operacoes.outrosCreditosIncentivados || 0;
        
        // GO100005 = Outros Débitos e Estorno de Créditos (APENAS códigos incentivados do Anexo II)
        const GO100005 = operacoes.outrosDebitosIncentivados || 0;
        
        // LOGS DETALHADOS PARA DEBUG
        addLog(`=== DEBUG ABA 1 - COMPONENTES ===`, 'info');
        addLog(`GO100002 (Saídas Incentivadas): ${operacoes.saidasIncentivadas?.length || 0} registros = R$ ${formatCurrency(GO100002)}`, 'info');
        addLog(`GO100003 (Entradas Incentivadas): R$ ${formatCurrency(GO100003)}`, 'info');
        addLog(`GO100004 (Outros Créditos Incentivados): R$ ${formatCurrency(GO100004)}`, 'info');
        addLog(`GO100005 (Outros Débitos Incentivados): R$ ${formatCurrency(GO100005)}`, 'info');
        addLog(`VERIFICAÇÃO: GO100005 <= Outros Débitos Total? ${GO100005} <= ${operacoes.outrosDebitos || 0} = ${GO100005 <= (operacoes.outrosDebitos || 0)}`, 'warn');
        
        // GO100007 = Ajuste da base de cálculo do período anterior
        const GO100007 = parseFloat(config.ajustePeridoAnterior) || 0;
        
        // GO100006 = Média (se aplicável)
        const GO100006 = parseFloat(config.icmsPorMedia) || 0;
        
        // GO100001 = Percentual do Crédito Outorgado ProGoiás
        const GO100001 = config.percentualIncentivo;
        
        // CÁLCULO CONFORME PLANILHA:
        // Base = GO100002 - GO100003 - GO100004 + GO100005 - GO100007 - GO100006
        const baseCalculo = GO100002 - GO100003 - GO100004 + GO100005 - GO100007 - GO100006;
        
        // GO100009 = Valor do Crédito Outorgado ProGoiás
        let GO100009 = 0;
        let GO100008 = 0; // Ajuste para transportar
        
        if (baseCalculo > 0) {
            GO100009 = baseCalculo * (GO100001 / 100);
            addLog(`Base positiva: R$ ${formatCurrency(baseCalculo)} x ${GO100001}% = R$ ${formatCurrency(GO100009)}`, 'info');
        } else {
            GO100009 = 0;
            GO100008 = Math.abs(baseCalculo); // Transportar saldo negativo
            addLog(`Base negativa: R$ ${formatCurrency(baseCalculo)} - Transportar para próximo período`, 'warn');
        }
        
        // Logs finais da ABA 1
        addLog(`=== RESULTADO ABA 1 ===`, 'info');
        addLog(`Fórmula: ${formatCurrency(GO100002)} - ${formatCurrency(GO100003)} - ${formatCurrency(GO100004)} + ${formatCurrency(GO100005)} - ${formatCurrency(GO100007)} - ${formatCurrency(GO100006)}`, 'info');
        addLog(`Base de Cálculo: R$ ${formatCurrency(baseCalculo)}`, 'info');
        addLog(`Percentual (GO100001): ${GO100001}%`, 'info');
        addLog(`GO100009 (CRÉDITO OUTORGADO PROGOIÁS): R$ ${formatCurrency(GO100009)}`, 'success');
        if (GO100008 > 0) {
            addLog(`GO100008 (Transportar próximo): R$ ${formatCurrency(GO100008)}`, 'warn');
        }
        
        return {
            // Códigos conforme planilha oficial
            GO100001: GO100001,  // Percentual
            GO100002: GO100002,  // ICMS Saídas Incentivadas
            GO100003: GO100003,  // ICMS Entradas Incentivadas
            GO100004: GO100004,  // Outros Créditos
            GO100005: GO100005,  // Outros Débitos
            GO100006: GO100006,  // Média
            GO100007: GO100007,  // Ajuste Período Anterior
            GO100008: GO100008,  // Ajuste para Próximo Período
            GO100009: GO100009,  // Crédito Outorgado ProGoiás
            
            // Cálculos
            baseCalculo: baseCalculo,
            creditoOutorgadoProgoias: GO100009  // Alias para compatibilidade
        };
    }
    
    function calculateIcmsComProgoias(quadroA, operacoes, config) {
        // ABA 2 - APURAÇÃO DO ICMS (conforme Progoias.xlsx)
        // Inclui o crédito outorgado ProGoiás da Aba 1
        
        addLog('=== ABA 2: APURAÇÃO DO ICMS (Planilha Oficial) ===', 'info');
        
        // ESTRUTURA CONFORME PLANILHA DE APURAÇÃO
        
        // 1. DÉBITOS DO ICMS
        const item01_debitoIcms = [...(operacoes.saidasIncentivadas || []), ...(operacoes.saidasNaoIncentivadas || [])]
            .reduce((total, op) => total + (op.valorIcms || 0), 0);
        
        const item02_outrosDebitos = operacoes.outrosDebitos || 0;
        const item03_estornoCreditos = 0; // Configurável
        const item04_totalDebitos = item01_debitoIcms + item02_outrosDebitos + item03_estornoCreditos;
        
        // 2. CRÉDITOS DO ICMS
        const item05_creditosEntradas = operacoes.creditosEntradas || 0;
        const item06_outrosCreditos = operacoes.outrosCreditos || 0;
        const item07_estornoDebitos = 0; // Configurável
        const item08_saldoCredorAnterior = config.saldoCredorAnterior || 0;
        
        // 3. CRÉDITO PROGOIÁS (da Aba 1)
        const item09_creditoProgoias = quadroA.GO100009;
        
        const item10_totalCreditos = item05_creditosEntradas + item06_outrosCreditos + 
                                   item07_estornoDebitos + item08_saldoCredorAnterior + item09_creditoProgoias;
        
        // 4. SALDO DEVEDOR
        const item11_saldoDevedor = Math.max(0, item04_totalDebitos - item10_totalCreditos);
        
        // 5. DEDUÇÕES
        const item12_deducoes = 0; // Configurável
        
        // 6. ICMS A RECOLHER
        const item13_icmsARecolher = Math.max(0, item11_saldoDevedor - item12_deducoes);
        
        // 7. PROTEGE (separado)
        const percentualProtege = config.percentualProtege || 0;
        const item14_valorProtege = item13_icmsARecolher * (percentualProtege / 100);
        
        // 8. ICMS FINAL
        const item15_icmsFinal = Math.max(0, item13_icmsARecolher - item14_valorProtege);
        
        // 9. ECONOMIA TOTAL
        const economiaTotal = item09_creditoProgoias + item14_valorProtege;
        
        // LOGS DETALHADOS PARA DEBUG ABA 2
        addLog(`=== DEBUG ABA 2 - COMPONENTES ===`, 'info');
        addLog(`01. Débito ICMS: ${[...(operacoes.saidasIncentivadas || []), ...(operacoes.saidasNaoIncentivadas || [])].length} registros = R$ ${formatCurrency(item01_debitoIcms)}`, 'info');
        addLog(`02. Outros Débitos TOTAL: R$ ${formatCurrency(item02_outrosDebitos)}`, 'info');
        addLog(`    COMPARAÇÃO: GO100005 (${formatCurrency(quadroA.GO100005)}) vs Total (${formatCurrency(item02_outrosDebitos)})`, 'warn');
        addLog(`05. Créditos Entradas TOTAL: R$ ${formatCurrency(item05_creditosEntradas)}`, 'info');
        addLog(`    COMPARAÇÃO: GO100003 (${formatCurrency(quadroA.GO100003)}) vs Total (${formatCurrency(item05_creditosEntradas)})`, 'warn');
        addLog(`06. Outros Créditos TOTAL: R$ ${formatCurrency(item06_outrosCreditos)}`, 'info');
        addLog(`    COMPARAÇÃO: GO100004 (${formatCurrency(quadroA.GO100004)}) vs Total (${formatCurrency(item06_outrosCreditos)})`, 'warn');
        addLog(`09. Crédito ProGoiás (da ABA 1): R$ ${formatCurrency(item09_creditoProgoias)}`, 'info');
        
        addLog(`=== RESULTADO ABA 2 ===`, 'info');
        addLog(`Total Débitos: R$ ${formatCurrency(item04_totalDebitos)}`, 'info');
        addLog(`Total Créditos: R$ ${formatCurrency(item10_totalCreditos)}`, 'info');
        addLog(`ICMS a Recolher: R$ ${formatCurrency(item13_icmsARecolher)}`, 'info');
        addLog(`PROTEGE (${percentualProtege}%): R$ ${formatCurrency(item14_valorProtege)}`, 'info');
        addLog(`ICMS FINAL: R$ ${formatCurrency(item15_icmsFinal)}`, 'success');
        addLog(`ECONOMIA TOTAL: R$ ${formatCurrency(economiaTotal)}`, 'success');
        
        return {
            // Itens conforme planilha
            item01_debitoIcms: item01_debitoIcms,
            item02_outrosDebitos: item02_outrosDebitos,
            item03_estornoCreditos: item03_estornoCreditos,
            item04_totalDebitos: item04_totalDebitos,
            item05_creditosEntradas: item05_creditosEntradas,
            item06_outrosCreditos: item06_outrosCreditos,
            item07_estornoDebitos: item07_estornoDebitos,
            item08_saldoCredorAnterior: item08_saldoCredorAnterior,
            item09_creditoProgoias: item09_creditoProgoias,
            item10_totalCreditos: item10_totalCreditos,
            item11_saldoDevedor: item11_saldoDevedor,
            item12_deducoes: item12_deducoes,
            item13_icmsARecolher: item13_icmsARecolher,
            item14_valorProtege: item14_valorProtege,
            item15_icmsFinal: item15_icmsFinal,
            
            // Resultado
            percentualProtege: percentualProtege,
            economiaTotal: economiaTotal
        };
    }
    
    function calculateDemonstrativoDetalhado(operacoes, config) {
        // QUADRO III - DEMONSTRATIVO DETALHADO DE OPERAÇÕES E ICMS
        // Inclui valores das operações E valores do ICMS separadamente
        
        addLog('=== QUADRO III: DEMONSTRATIVO DETALHADO ===', 'info');
        
        // SAÍDAS - Valores das operações
        const valorSaidasIncentivadas = (operacoes.saidasIncentivadas || [])
            .reduce((total, op) => total + (op.valorOperacao || 0), 0);
        const valorSaidasNaoIncentivadas = (operacoes.saidasNaoIncentivadas || [])
            .reduce((total, op) => total + (op.valorOperacao || 0), 0);
        const totalValorSaidas = valorSaidasIncentivadas + valorSaidasNaoIncentivadas;
        
        // SAÍDAS - ICMS
        const icmsSaidasIncentivadas = (operacoes.saidasIncentivadas || [])
            .reduce((total, op) => total + (op.valorIcms || 0), 0);
        const icmsSaidasNaoIncentivadas = (operacoes.saidasNaoIncentivadas || [])
            .reduce((total, op) => total + (op.valorIcms || 0), 0);
        const totalIcmsSaidas = icmsSaidasIncentivadas + icmsSaidasNaoIncentivadas;
        
        // ENTRADAS - Valores das operações
        const valorEntradasIncentivadas = (operacoes.entradasIncentivadas || [])
            .reduce((total, op) => total + (op.valorOperacao || 0), 0);
        const valorEntradasNaoIncentivadas = (operacoes.entradasNaoIncentivadas || [])
            .reduce((total, op) => total + (op.valorOperacao || 0), 0);
        const totalValorEntradas = valorEntradasIncentivadas + valorEntradasNaoIncentivadas;
        
        // ENTRADAS - ICMS (créditos)
        const icmsEntradasIncentivadas = operacoes.creditosEntradasIncentivadas || 0;
        const icmsEntradasNaoIncentivadas = operacoes.creditosEntradasNaoIncentivadas || 0;
        const totalIcmsEntradas = icmsEntradasIncentivadas + icmsEntradasNaoIncentivadas;
        
        addLog(`Saídas Incentivadas - Valor: R$ ${formatCurrency(valorSaidasIncentivadas)}, ICMS: R$ ${formatCurrency(icmsSaidasIncentivadas)}`, 'info');
        addLog(`Saídas Não Incentivadas - Valor: R$ ${formatCurrency(valorSaidasNaoIncentivadas)}, ICMS: R$ ${formatCurrency(icmsSaidasNaoIncentivadas)}`, 'info');
        addLog(`Entradas Incentivadas - Valor: R$ ${formatCurrency(valorEntradasIncentivadas)}, ICMS: R$ ${formatCurrency(icmsEntradasIncentivadas)}`, 'info');
        addLog(`Entradas Não Incentivadas - Valor: R$ ${formatCurrency(valorEntradasNaoIncentivadas)}, ICMS: R$ ${formatCurrency(icmsEntradasNaoIncentivadas)}`, 'info');
        
        return {
            // Saídas - Valores
            valorSaidasIncentivadas: valorSaidasIncentivadas,
            valorSaidasNaoIncentivadas: valorSaidasNaoIncentivadas,
            totalValorSaidas: totalValorSaidas,
            
            // Saídas - ICMS
            icmsSaidasIncentivadas: icmsSaidasIncentivadas,
            icmsSaidasNaoIncentivadas: icmsSaidasNaoIncentivadas,
            totalIcmsSaidas: totalIcmsSaidas,
            
            // Entradas - Valores
            valorEntradasIncentivadas: valorEntradasIncentivadas,
            valorEntradasNaoIncentivadas: valorEntradasNaoIncentivadas,
            totalValorEntradas: totalValorEntradas,
            
            // Entradas - ICMS
            icmsEntradasIncentivadas: icmsEntradasIncentivadas,
            icmsEntradasNaoIncentivadas: icmsEntradasNaoIncentivadas,
            totalIcmsEntradas: totalIcmsEntradas,
            
            // Aliases para compatibilidade
            saidasComIncentivo: valorSaidasIncentivadas,
            saidasSemIncentivo: valorSaidasNaoIncentivadas,
            totalSaidas: totalValorSaidas,
            entradasComIncentivo: valorEntradasIncentivadas,
            entradasSemIncentivo: valorEntradasNaoIncentivadas,
            totalEntradas: totalValorEntradas
        };
    }
    
    function updateProgoisUI(dados) {
        if (!dados) return;
        
        const { quadroA, quadroB, quadroC } = dados;
        
        // ABA 1 - CÁLCULO DO PROGOIÁS (conforme Progoias.xlsx)
        // Itens conforme estrutura da planilha oficial
        document.getElementById('progoisItemA01').textContent = formatCurrency(quadroA.GO100002);   // ICMS Saídas Incentivadas
        document.getElementById('progoisItemA02').textContent = formatCurrency(quadroA.GO100003);   // ICMS Entradas Incentivadas
        document.getElementById('progoisItemA03').textContent = formatCurrency(quadroA.GO100004);   // Outros Créditos
        document.getElementById('progoisItemA04').textContent = formatCurrency(quadroA.GO100005);   // Outros Débitos
        document.getElementById('progoisItemA05').textContent = formatCurrency(quadroA.GO100007);   // Ajuste Período Anterior
        document.getElementById('progoisItemA06').textContent = formatCurrency(quadroA.GO100006);   // Média
        document.getElementById('progoisItemA07').textContent = formatCurrency(quadroA.baseCalculo); // Base de Cálculo
        document.getElementById('progoisItemA08').textContent = quadroA.GO100001.toFixed(2) + '%';  // Percentual ProGoiás
        document.getElementById('progoisItemA09').textContent = formatCurrency(quadroA.GO100009);   // Crédito Outorgado
        document.getElementById('progoisItemA10').textContent = formatCurrency(quadroA.GO100008);   // Ajuste Próximo Período
        
        // ABA 2 - APURAÇÃO DO ICMS (conforme Progoias.xlsx)
        // Itens numerados conforme planilha de apuração
        document.getElementById('progoisItemB13').textContent = formatCurrency(quadroB.item01_debitoIcms);        // 01. Débito ICMS
        document.getElementById('progoisItemB14').textContent = formatCurrency(quadroB.item02_outrosDebitos);     // 02. Outros Débitos
        document.getElementById('progoisItemB15').textContent = formatCurrency(quadroB.item03_estornoCreditos);   // 03. Estorno Créditos
        document.getElementById('progoisItemB16').textContent = formatCurrency(quadroB.item04_totalDebitos);      // 04. Total Débitos
        document.getElementById('progoisItemB17').textContent = formatCurrency(quadroB.item05_creditosEntradas);  // 05. Créditos Entradas
        document.getElementById('progoisItemB18').textContent = formatCurrency(quadroB.item06_outrosCreditos);    // 06. Outros Créditos
        document.getElementById('progoisItemB19').textContent = formatCurrency(quadroB.item09_creditoProgoias);   // 09. Crédito ProGoiás
        
        // DEMONSTRATIVO DETALHADO - VALORES E ICMS
        document.getElementById('progoisItemC18').textContent = formatCurrency(quadroC.valorSaidasIncentivadas);    // Saídas Incentivadas - Valor
        document.getElementById('progoisItemC19').textContent = formatCurrency(quadroC.valorSaidasNaoIncentivadas); // Saídas Não Incentivadas - Valor
        document.getElementById('progoisItemC20').textContent = formatCurrency(quadroC.totalValorSaidas);           // Total Saídas - Valor
        document.getElementById('progoisItemC21').textContent = formatCurrency(quadroC.valorEntradasIncentivadas);  // Entradas Incentivadas - Valor
        document.getElementById('progoisItemC22').textContent = formatCurrency(quadroC.valorEntradasNaoIncentivadas); // Entradas Não Incentivadas - Valor
        document.getElementById('progoisItemC23').textContent = formatCurrency(quadroC.totalValorEntradas);         // Total Entradas - Valor
        
        // ICMS das operações (se elementos existirem)
        const icmsElements = {
            'progoisItemC18Icms': quadroC.icmsSaidasIncentivadas,
            'progoisItemC19Icms': quadroC.icmsSaidasNaoIncentivadas,
            'progoisItemC20Icms': quadroC.totalIcmsSaidas,
            'progoisItemC21Icms': quadroC.icmsEntradasIncentivadas,
            'progoisItemC22Icms': quadroC.icmsEntradasNaoIncentivadas,
            'progoisItemC23Icms': quadroC.totalIcmsEntradas
        };
        
        Object.keys(icmsElements).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = formatCurrency(icmsElements[id]);
            }
        });
        
        // RESUMO PRINCIPAL - conforme planilha
        const elementos = {
            'progoisIcmsDevido': quadroB.item13_icmsARecolher,   // ICMS a Recolher
            'progoisValorProtege': quadroB.item14_valorProtege,  // PROTEGE
            'progoisIcmsRecolher': quadroB.item15_icmsFinal,     // ICMS Final
            'progoisEconomiaTotal': quadroB.economiaTotal        // Economia Total
        };
        
        // Atualizar elementos do resumo
        Object.keys(elementos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = 'R$ ' + formatCurrency(elementos[id]);
            }
        });
        
        // Status
        const statusElement = document.getElementById('progoisSpedStatus');
        if (statusElement) {
            statusElement.textContent = `${dados.empresa} - ${dados.periodo} (${dados.totalOperacoes} operações)`;
        }
        
        // Verificação de consistência
        addLog('=== VERIFICAÇÃO DE CONSISTÊNCIA ===', 'warn');
        const consistenciaOK = (
            quadroA.GO100005 <= quadroB.item02_outrosDebitos &&
            quadroA.GO100003 <= quadroB.item05_creditosEntradas &&
            quadroA.GO100004 <= quadroB.item06_outrosCreditos
        );
        addLog(`Consistência Lógica: ${consistenciaOK ? 'OK' : 'ERRO'}`, consistenciaOK ? 'success' : 'error');
        
        addLog('=== RESUMO FINAL ===', 'info');
        addLog(`ABA 1 - Crédito ProGoiás: R$ ${formatCurrency(quadroA.GO100009)}`, 'success');
        addLog(`ABA 2 - ICMS Final: R$ ${formatCurrency(quadroB.item15_icmsFinal)}`, 'success');
        addLog(`ECONOMIA TOTAL: R$ ${formatCurrency(quadroB.economiaTotal)}`, 'success');
    }
    
    function handleProgoisConfigChange() {
        // Apenas indicar que as configurações mudaram
        if (progoisRegistrosCompletos) {
            addLog('Configurações alteradas. Clique em "Processar Apuração" para recalcular.', 'info');
        }
    }
    
    function exportProgoisReport() {
        if (!progoisData) {
            alert('Nenhum dado ProGoiás para exportar. Importe um arquivo SPED primeiro.');
            return;
        }
        
        try {
            generateProgoisExcel(progoisData);
            addLog('Relatório ProGoiás exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar relatório ProGoiás:', error);
            addLog(`Erro ao exportar relatório ProGoiás: ${error.message}`, 'error');
        }
    }
    
    function printProgoisReport() {
        if (!progoisData) {
            alert('Nenhum dado ProGoiás para imprimir. Importe um arquivo SPED primeiro.');
            return;
        }
        
        window.print();
    }
    
    function generateProgoisExcel(dados) {
        // Implementar geração de Excel específica para ProGoiás
        // Similar ao generateFomentarExcel mas com layout ProGoiás
        const workbook = XlsxPopulate.fromBlankSync();
        const worksheet = workbook.sheet("ProGoiás");
        
        // Cabeçalho
        worksheet.cell("A1").value("APURAÇÃO PROGOIÁS - " + dados.empresa);
        worksheet.cell("A2").value("Período: " + dados.periodo);
        worksheet.cell("A3").value("Gerado em: " + new Date().toLocaleString());
        
        // Quadro A
        let row = 5;
        worksheet.cell(`A${row}`).value("QUADRO A - APURAÇÃO DO ICMS");
        row += 2;
        
        const quadroAData = [
            ["01", "Débito do ICMS", dados.quadroA.debitoIcms],
            ["02", "Outros Débitos", dados.quadroA.outrosDebitos],
            ["03", "Estorno de Créditos", dados.quadroA.estornoCreditos],
            ["04", "Total de Débitos", dados.quadroA.totalDebitos],
            ["05", "Créditos por Entradas", dados.quadroA.creditoEntradas],
            ["06", "Outros Créditos", dados.quadroA.outrosCreditos],
            ["07", "Estorno de Débitos", dados.quadroA.estornoDebitos],
            ["08", "Saldo Credor do Período Anterior", dados.quadroA.saldoCredorAnterior],
            ["09", "Total de Créditos", dados.quadroA.totalCreditos],
            ["10", "Saldo Devedor do ICMS", dados.quadroA.saldoDevedor],
            ["11", "Deduções", dados.quadroA.deducoes],
            ["12", "ICMS a Recolher", dados.quadroA.icmsRecolher]
        ];
        
        quadroAData.forEach(([item, desc, valor]) => {
            worksheet.cell(`A${row}`).value(item);
            worksheet.cell(`B${row}`).value(desc);
            worksheet.cell(`C${row}`).value(valor);
            row++;
        });
        
        // Quadro B
        row += 2;
        worksheet.cell(`A${row}`).value("QUADRO B - CÁLCULO DO INCENTIVO PROGOIÁS");
        row += 2;
        
        const quadroBData = [
            ["13", "Base de Cálculo para o Incentivo", dados.quadroB.baseCalculo],
            ["14", "Percentual do Incentivo (%)", dados.quadroB.percentualIncentivo],
            ["15", "Valor do Incentivo ProGoiás", dados.quadroB.valorIncentivo],
            ["16", "ICMS Devido após Incentivo", dados.quadroB.icmsAposIncentivo],
            ["17", "Valor da Economia Fiscal", dados.quadroB.economiaFiscal]
        ];
        
        quadroBData.forEach(([item, desc, valor]) => {
            worksheet.cell(`A${row}`).value(item);
            worksheet.cell(`B${row}`).value(desc);
            worksheet.cell(`C${row}`).value(valor);
            row++;
        });
        
        // Quadro C
        row += 2;
        worksheet.cell(`A${row}`).value("QUADRO C - DEMONSTRATIVO DE OPERAÇÕES");
        row += 2;
        
        const quadroCData = [
            ["18", "Saídas com Incentivo", dados.quadroC.saidasComIncentivo],
            ["19", "Saídas sem Incentivo", dados.quadroC.saidasSemIncentivo],
            ["20", "Total das Saídas", dados.quadroC.totalSaidas],
            ["21", "Entradas com Incentivo", dados.quadroC.entradasComIncentivo],
            ["22", "Entradas sem Incentivo", dados.quadroC.entradasSemIncentivo],
            ["23", "Total das Entradas", dados.quadroC.totalEntradas]
        ];
        
        quadroCData.forEach(([item, desc, valor]) => {
            worksheet.cell(`A${row}`).value(item);
            worksheet.cell(`B${row}`).value(desc);
            worksheet.cell(`C${row}`).value(valor);
            row++;
        });
        
        // Salvar arquivo
        const filename = `ProGoias_${dados.empresa}_${dados.periodo}.xlsx`;
        workbook.outputAsync().then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    // Funções auxiliares para múltiplos períodos e outras funcionalidades do ProGoiás
    function handleProgoisImportModeChange(event) {
        progoisCurrentImportMode = event.target.value;
        
        if (progoisCurrentImportMode === 'single') {
            document.getElementById('singleImportSectionProgoias').style.display = 'block';
            document.getElementById('multipleImportSectionProgoias').style.display = 'none';
        } else {
            document.getElementById('singleImportSectionProgoias').style.display = 'none';
            document.getElementById('multipleImportSectionProgoias').style.display = 'block';
        }
    }
    
    function handleProgoisMultipleSpedSelection(event) {
        const files = Array.from(event.target.files);
        const filesList = document.getElementById('multipleSpedListProgoias');
        
        filesList.innerHTML = '';
        if (files.length > 0) {
            files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.textContent = file.name;
                filesList.appendChild(fileItem);
            });
            
            // Mostrar o botão principal de processamento ao invés do específico
            document.getElementById('processProgoisData').style.display = 'block';
            addLog(`${files.length} arquivo(s) SPED selecionado(s). Configure os parâmetros e clique em "Processar Apuração".`, 'info');
        }
    }
    
    async function processProgoisMultipleSpeds() {
        const files = Array.from(document.getElementById('multipleSpedFilesProgoias').files);
        if (files.length === 0) {
            addLog('Nenhum arquivo selecionado para processamento ProGoiás', 'warning');
            return;
        }
        
        addLog('Iniciando processamento de múltiplos SPEDs para ProGoiás...', 'info');
        progoisMultiPeriodData = [];
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            addLog(`Processando arquivo ProGoiás ${i + 1}/${files.length}: ${file.name}`, 'info');
            
            try {
                const fileContent = await readFileContent(file);
                const periodData = await processProgoisSingleSpedForPeriod(fileContent, file.name);
                progoisMultiPeriodData.push(periodData);
                
                // Update file item with period info
                const fileItems = document.querySelectorAll('#multipleSpedListProgoias .file-item');
                if (fileItems[i]) {
                    fileItems[i].innerHTML = `${file.name}<br><small>Período: ${periodData.periodo}</small>`;
                }
                
            } catch (error) {
                addLog(`Erro ao processar ProGoiás ${file.name}: ${error.message}`, 'error');
            }
        }
        
        // Sort by period chronologically
        progoisMultiPeriodData.sort((a, b) => {
            if (a.periodo < b.periodo) return -1;
            if (a.periodo > b.periodo) return 1;
            return 0;
        });
        
        if (progoisMultiPeriodData.length > 0) {
            // Update UI for multiple periods
            updateProgoisMultiplePeriodUI();
            addLog(`Processamento concluído: ${progoisMultiPeriodData.length} períodos ProGoiás processados`, 'success');
        }
    }
    
    async function processProgoisSingleSpedForPeriod(content, filename) {
        return new Promise((resolve, reject) => {
            try {
                const registros = lerArquivoSpedCompleto(content);
                
                if (!registros || Object.keys(registros).length === 0) {
                    throw new Error('SPED não contém dados válidos');
                }
                
                const calculoProgoias = calculateProgoias(registros);
                
                resolve({
                    filename: filename,
                    empresa: registros.empresa || 'Empresa',
                    periodo: registros.periodo || 'Período',
                    registros: registros,
                    calculo: calculoProgoias
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    function updateProgoisMultiplePeriodUI() {
        // Show periods selector
        document.getElementById('progoisPeriodsSelector').style.display = 'block';
        
        // Create period buttons
        const periodsButtonsContainer = document.getElementById('progoisPeriodsButtons');
        periodsButtonsContainer.innerHTML = '';
        
        progoisMultiPeriodData.forEach((periodData, index) => {
            const button = document.createElement('button');
            button.className = 'btn-style btn-small period-button';
            button.textContent = periodData.periodo;
            button.onclick = () => {
                progoisSelectedPeriodIndex = index;
                updateProgoisSinglePeriodView();
                
                // Update active button
                document.querySelectorAll('#progoisPeriodsButtons .period-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            };
            
            if (index === 0) {
                button.classList.add('active');
            }
            
            periodsButtonsContainer.appendChild(button);
        });
        
        // Show first period by default
        progoisSelectedPeriodIndex = 0;
        updateProgoisSinglePeriodView();
        
        // Show export buttons for multiple periods
        document.getElementById('exportProgoisComparative').style.display = 'inline-block';
        document.getElementById('exportProgoisPDF').style.display = 'inline-block';
    }
    
    function updateProgoisSinglePeriodView() {
        if (progoisMultiPeriodData.length === 0) return;
        
        const periodData = progoisMultiPeriodData[progoisSelectedPeriodIndex];
        if (!periodData) return;
        
        // Update UI with selected period data
        updateProgoisUI(periodData.calculo);
    }
    
    function switchProgoisView(view) {
        // Update active button
        document.querySelectorAll('#progoisPeriodsSelector .view-options .btn-style').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (view === 'single') {
            document.getElementById('progoisViewSinglePeriod').classList.add('active');
            updateProgoisSinglePeriodView();
            addLog('Visualização individual ativada para ProGoiás', 'info');
        } else if (view === 'comparative') {
            document.getElementById('progoisViewComparative').classList.add('active');
            updateProgoisComparativeView();
            addLog('Visualização comparativa ativada para ProGoiás', 'info');
        }
    }
    
    function updateProgoisComparativeView() {
        if (progoisMultiPeriodData.length < 2) {
            addLog('Necessários pelo menos 2 períodos para visualização comparativa', 'warning');
            return;
        }
        
        // Implementar visualização comparativa - por enquanto mostra o primeiro período
        updateProgoisSinglePeriodView();
        addLog('Visualização comparativa ainda em desenvolvimento', 'info');
    }
    
    function exportProgoisComparativeReport() {
        if (progoisMultiPeriodData.length === 0) {
            alert('Nenhum dado ProGoiás para exportar. Processe múltiplos SPEDs primeiro.');
            return;
        }
        
        try {
            generateProgoisComparativeExcel();
            addLog('Relatório comparativo ProGoiás exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar relatório comparativo ProGoiás:', error);
            addLog(`Erro ao exportar relatório comparativo ProGoiás: ${error.message}`, 'error');
        }
    }
    
    function exportProgoisComparativePDF() {
        if (progoisMultiPeriodData.length === 0) {
            alert('Nenhum dado ProGoiás para exportar PDF. Processe múltiplos SPEDs primeiro.');
            return;
        }
        
        addLog('Exportação PDF comparativo ProGoiás ainda em desenvolvimento', 'info');
    }
    
    function generateProgoisComparativeExcel() {
        const workbook = XlsxPopulate.fromBlankSync();
        const worksheet = workbook.sheet("Comparativo ProGoiás");
        
        // Cabeçalho
        worksheet.cell("A1").value("RELATÓRIO COMPARATIVO PROGOIÁS");
        worksheet.cell("A2").value("Gerado em: " + new Date().toLocaleString());
        
        let row = 4;
        
        // Cabeçalho da tabela
        worksheet.cell(`A${row}`).value("Período");
        worksheet.cell(`B${row}`).value("Empresa");
        worksheet.cell(`C${row}`).value("ICMS Devido");
        worksheet.cell(`D${row}`).value("ProGoiás (%)");
        worksheet.cell(`E${row}`).value("Valor ProGoiás");
        worksheet.cell(`F${row}`).value("PROTEGE (%)");
        worksheet.cell(`G${row}`).value("Valor PROTEGE");
        worksheet.cell(`H${row}`).value("Total Incentivos");
        worksheet.cell(`I${row}`).value("ICMS a Recolher");
        worksheet.cell(`J${row}`).value("Economia Total");
        row++;
        
        // Dados
        progoisMultiPeriodData.forEach(periodData => {
            const { calculo } = periodData;
            worksheet.cell(`A${row}`).value(periodData.periodo);
            worksheet.cell(`B${row}`).value(periodData.empresa);
            worksheet.cell(`C${row}`).value(calculo.quadroA.icmsRecolher);
            worksheet.cell(`D${row}`).value(calculo.quadroB.percentualProgoias + '%');
            worksheet.cell(`E${row}`).value(calculo.quadroB.valorProgoias);
            worksheet.cell(`F${row}`).value(calculo.quadroB.percentualProtege + '%');
            worksheet.cell(`G${row}`).value(calculo.quadroB.valorProtege);
            worksheet.cell(`H${row}`).value(calculo.quadroB.totalIncentivos);
            worksheet.cell(`I${row}`).value(calculo.quadroB.icmsAposIncentivos);
            worksheet.cell(`J${row}`).value(calculo.quadroB.economiaFiscalTotal);
            row++;
        });
        
        // Salvar arquivo
        const filename = `Comparativo_ProGoias_${progoisMultiPeriodData.length}_periodos.xlsx`;
        workbook.outputAsync().then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    // Funções auxiliares de drag and drop para ProGoiás - Single
    function highlightProgoisZone() {
        const progoisDropZone = document.getElementById('progoisDropZone');
        if (progoisDropZone) {
            progoisDropZone.classList.add('dragover');
        }
    }
    
    function unhighlightProgoisZone() {
        const progoisDropZone = document.getElementById('progoisDropZone');
        if (progoisDropZone) {
            progoisDropZone.classList.remove('dragover');
        }
    }

    // Funções auxiliares de drag and drop para ProGoiás - Multiple
    function highlightProgoisMultipleZone() {
        const multipleDropZoneProgoias = document.getElementById('multipleDropZoneProgoias');
        if (multipleDropZoneProgoias) {
            multipleDropZoneProgoias.classList.add('dragover');
        }
    }
    
    function unhighlightProgoisMultipleZone() {
        const multipleDropZoneProgoias = document.getElementById('multipleDropZoneProgoias');
        if (multipleDropZoneProgoias) {
            multipleDropZoneProgoias.classList.remove('dragover');
        }
    }

    // Funções de drag and drop para ProGoiás - Single File
    function handleProgoisDragEnter(e) {
        preventDefaults(e);
        highlightProgoisZone();
    }
    
    function handleProgoisDragOver(e) {
        preventDefaults(e);
        highlightProgoisZone();
    }
    
    function handleProgoisDragLeave(e) {
        preventDefaults(e);
        const progoisDropZone = document.getElementById('progoisDropZone');
        if (!progoisDropZone.contains(e.relatedTarget)) {
            unhighlightProgoisZone();
        }
    }
    
    function handleProgoisFileDrop(e) {
        preventDefaults(e);
        unhighlightProgoisZone();
        
        const files = Array.from(e.dataTransfer.files);
        const txtFiles = files.filter(file => file.name.toLowerCase().endsWith('.txt'));
        
        if (txtFiles.length === 0) {
            addLog('Erro: Nenhum arquivo .txt encontrado para ProGoiás', 'error');
            return;
        }
        
        if (txtFiles.length > 1) {
            addLog('Aviso: Múltiplos arquivos detectados. Usando apenas o primeiro.', 'warning');
        }
        
        const file = txtFiles[0];
        addLog(`Arquivo SPED detectado para ProGoiás: ${file.name}`, 'info');
        
        // Processar o arquivo específico para ProGoiás
        processProgoisSpedFile(file);
    }

    // Funções de drag and drop para ProGoiás - Multiple Files
    function handleProgoisMultipleDragEnter(e) {
        preventDefaults(e);
        highlightProgoisMultipleZone();
    }
    
    function handleProgoisMultipleDragOver(e) {
        preventDefaults(e);
        highlightProgoisMultipleZone();
    }
    
    function handleProgoisMultipleDragLeave(e) {
        preventDefaults(e);
        const multipleDropZoneProgoias = document.getElementById('multipleDropZoneProgoias');
        if (!multipleDropZoneProgoias.contains(e.relatedTarget)) {
            unhighlightProgoisMultipleZone();
        }
    }
    
    function handleProgoisMultipleFileDrop(e) {
        preventDefaults(e);
        unhighlightProgoisMultipleZone();
        
        const files = Array.from(e.dataTransfer.files);
        const txtFiles = files.filter(file => file.name.toLowerCase().endsWith('.txt'));
        
        if (txtFiles.length === 0) {
            addLog('Erro: Nenhum arquivo .txt encontrado para ProGoiás', 'error');
            return;
        }
        
        addLog(`${txtFiles.length} arquivo(s) SPED detectado(s) para ProGoiás`, 'info');
        
        // Atualizar lista de arquivos
        const filesList = document.getElementById('multipleSpedListProgoias');
        filesList.innerHTML = '';
        
        txtFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.textContent = file.name;
            filesList.appendChild(fileItem);
        });
        
        // Mostrar botão de processamento e armazenar arquivos
        document.getElementById('processProgoisData').style.display = 'block';
        
        // Simular a seleção no input para manter consistência
        const input = document.getElementById('multipleSpedFilesProgoias');
        const dt = new DataTransfer();
        txtFiles.forEach(file => dt.items.add(file));
        input.files = dt.files;
    }

    // Funções para exportar memória de cálculo
    function exportFomentarMemoriaCalculo() {
        if (!fomentarData || !fomentarData.memoriaCalculo) {
            addLog('Erro: Nenhuma memória de cálculo FOMENTAR disponível', 'error');
            return;
        }
        
        exportMemoriaCalculo(fomentarData.memoriaCalculo, 'FOMENTAR');
    }
    
    function exportProgoisMemoriaCalculo() {
        if (!progoisData || !progoisRegistrosCompletos) {
            addLog('Erro: Nenhuma memória de cálculo ProGoiás disponível', 'error');
            return;
        }
        
        // Obter dados classificados do ProGoiás
        const operacoes = classifyOperations(progoisRegistrosCompletos);
        exportMemoriaCalculo(operacoes.memoriaCalculo, 'ProGoiás');
    }
    
    async function exportMemoriaCalculo(memoriaCalculo, tipoPrograma) {
        try {
            addLog(`Gerando memória de cálculo detalhada ${tipoPrograma}...`, 'info');
            
            const workbook = await XlsxPopulate.fromBlankAsync();
            const mainSheet = workbook.sheet(0);
            mainSheet.name(`Memória Cálculo ${tipoPrograma}`);
            
            let currentRow = 1;
            
            // Cabeçalho
            mainSheet.cell(`A${currentRow}`).value(`MEMÓRIA DE CÁLCULO DETALHADA - ${tipoPrograma.toUpperCase()}`);
            mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 14);
            currentRow += 2;
            
            mainSheet.cell(`A${currentRow}`).value(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
            currentRow += 2;
            
            // 1. OPERAÇÕES DETALHADAS
            mainSheet.cell(`A${currentRow}`).value('1. OPERAÇÕES PROCESSADAS (C190, C590, D190, D590)');
            mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 12);
            currentRow += 1;
            
            // Cabeçalhos das operações
            const operHeaders = ['Origem SPED', 'CFOP', 'Tipo Operação', 'Incentivada', 'Valor Operação', 'Valor ICMS', 'Categoria'];
            operHeaders.forEach((header, index) => {
                const col = String.fromCharCode(65 + index); // A, B, C, etc.
                mainSheet.cell(`${col}${currentRow}`).value(header).style('bold', true);
            });
            currentRow++;
            
            // Dados das operações
            memoriaCalculo.operacoesDetalhadas.forEach(op => {
                mainSheet.cell(`A${currentRow}`).value(op.origem);
                mainSheet.cell(`B${currentRow}`).value(op.cfop);
                mainSheet.cell(`C${currentRow}`).value(op.tipoOperacao);
                mainSheet.cell(`D${currentRow}`).value(op.incentivada ? 'SIM' : 'NÃO');
                mainSheet.cell(`E${currentRow}`).value(op.valorOperacao);
                mainSheet.cell(`F${currentRow}`).value(op.valorIcms);
                mainSheet.cell(`G${currentRow}`).value(op.categoria);
                currentRow++;
            });
            
            currentRow += 2;
            
            // 2. AJUSTES E111
            mainSheet.cell(`A${currentRow}`).value('2. AJUSTES E111 (Outros Créditos/Débitos)');
            mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 12);
            currentRow += 1;
            
            const e111Headers = ['Origem', 'Código Ajuste', 'Valor', 'Tipo', 'Incentivado', 'Observação'];
            e111Headers.forEach((header, index) => {
                const col = String.fromCharCode(65 + index);
                mainSheet.cell(`${col}${currentRow}`).value(header).style('bold', true);
            });
            currentRow++;
            
            memoriaCalculo.ajustesE111.forEach(ajuste => {
                mainSheet.cell(`A${currentRow}`).value(ajuste.origem);
                mainSheet.cell(`B${currentRow}`).value(ajuste.codigo);
                mainSheet.cell(`C${currentRow}`).value(ajuste.valor);
                mainSheet.cell(`D${currentRow}`).value(ajuste.tipo);
                mainSheet.cell(`E${currentRow}`).value(ajuste.incentivado ? 'SIM' : 'NÃO');
                mainSheet.cell(`F${currentRow}`).value(ajuste.observacao);
                currentRow++;
            });
            
            currentRow += 2;
            
            // 3. AJUSTES C197
            mainSheet.cell(`A${currentRow}`).value('3. AJUSTES C197 (Débitos Adicionais)');
            mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 12);
            currentRow += 1;
            
            const c197Headers = ['Origem', 'Código Ajuste', 'Valor', 'Categoria', 'Incentivado ProGoiás', 'Status'];
            c197Headers.forEach((header, index) => {
                const col = String.fromCharCode(65 + index);
                mainSheet.cell(`${col}${currentRow}`).value(header).style('bold', true);
            });
            currentRow++;
            
            memoriaCalculo.ajustesC197.forEach(ajuste => {
                mainSheet.cell(`A${currentRow}`).value(ajuste.origem);
                mainSheet.cell(`B${currentRow}`).value(ajuste.codigo);
                mainSheet.cell(`C${currentRow}`).value(ajuste.valor);
                mainSheet.cell(`D${currentRow}`).value(ajuste.categoria || ajuste.tipo);
                mainSheet.cell(`E${currentRow}`).value(ajuste.incentivadoProgoias ? 'SIM' : 'NÃO');
                mainSheet.cell(`F${currentRow}`).value(ajuste.incluido ? 'INCLUÍDO' : 'EXCLUÍDO');
                if (!ajuste.incluido) {
                    mainSheet.cell(`F${currentRow}`).style('fontColor', 'red');
                }
                currentRow++;
            });
            
            currentRow += 2;
            
            // 4. AJUSTES D197
            mainSheet.cell(`A${currentRow}`).value('4. AJUSTES D197 (Débitos Adicionais)');
            mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 12);
            currentRow += 1;
            
            const d197Headers = ['Origem', 'Código Ajuste', 'Valor', 'Categoria', 'Incentivado ProGoiás', 'Status'];
            d197Headers.forEach((header, index) => {
                const col = String.fromCharCode(65 + index);
                mainSheet.cell(`${col}${currentRow}`).value(header).style('bold', true);
            });
            currentRow++;
            
            memoriaCalculo.ajustesD197.forEach(ajuste => {
                mainSheet.cell(`A${currentRow}`).value(ajuste.origem);
                mainSheet.cell(`B${currentRow}`).value(ajuste.codigo);
                mainSheet.cell(`C${currentRow}`).value(ajuste.valor);
                mainSheet.cell(`D${currentRow}`).value(ajuste.categoria || ajuste.tipo);
                mainSheet.cell(`E${currentRow}`).value(ajuste.incentivadoProgoias ? 'SIM' : 'NÃO');
                mainSheet.cell(`F${currentRow}`).value(ajuste.incluido ? 'INCLUÍDO' : 'EXCLUÍDO');
                if (!ajuste.incluido) {
                    mainSheet.cell(`F${currentRow}`).style('fontColor', 'red');
                }
                currentRow++;
            });
            
            currentRow += 2;
            
            // 5. EXCLUSÕES APLICADAS
            mainSheet.cell(`A${currentRow}`).value('5. EXCLUSÕES APLICADAS');
            mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 12);
            currentRow += 1;
            
            const exclHeaders = ['Origem', 'Código', 'Valor Excluído', 'Motivo', 'Tipo Exclusão'];
            exclHeaders.forEach((header, index) => {
                const col = String.fromCharCode(65 + index);
                mainSheet.cell(`${col}${currentRow}`).value(header).style('bold', true);
            });
            currentRow++;
            
            memoriaCalculo.exclusoes.forEach(exclusao => {
                mainSheet.cell(`A${currentRow}`).value(exclusao.origem);
                mainSheet.cell(`B${currentRow}`).value(exclusao.codigo);
                mainSheet.cell(`C${currentRow}`).value(exclusao.valor);
                mainSheet.cell(`D${currentRow}`).value(exclusao.motivo);
                mainSheet.cell(`E${currentRow}`).value(exclusao.tipo);
                mainSheet.row(currentRow).style('fontColor', 'red');
                currentRow++;
            });
            
            currentRow += 2;
            
            // 6. RESUMO DOS TOTAIS
            mainSheet.cell(`A${currentRow}`).value('6. RESUMO DOS TOTAIS');
            mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 12);
            currentRow += 1;
            
            const resumoData = [
                ['Créditos por Entradas:', memoriaCalculo.totalCreditos.porEntradas],
                ['Créditos por Ajustes E111:', memoriaCalculo.totalCreditos.porAjustesE111],
                ['TOTAL CRÉDITOS:', memoriaCalculo.totalCreditos.total],
                ['', ''],
                ['Débitos por Operações:', memoriaCalculo.totalDebitos.porOperacoes],
                ['Débitos por Ajustes E111:', memoriaCalculo.totalDebitos.porAjustesE111],
                ['Débitos por Ajustes C197:', memoriaCalculo.totalDebitos.porAjustesC197],
                ['Débitos por Ajustes D197:', memoriaCalculo.totalDebitos.porAjustesD197],
                ['TOTAL DÉBITOS:', memoriaCalculo.totalDebitos.total]
            ];
            
            resumoData.forEach(([descricao, valor]) => {
                mainSheet.cell(`A${currentRow}`).value(descricao).style('bold', true);
                if (valor !== '') {
                    mainSheet.cell(`B${currentRow}`).value(valor);
                }
                currentRow++;
            });
            
            // Ajustar largura das colunas
            mainSheet.column("A").width(25);
            mainSheet.column("B").width(20);
            mainSheet.column("C").width(15);
            mainSheet.column("D").width(20);
            mainSheet.column("E").width(20);
            mainSheet.column("F").width(30);
            mainSheet.column("G").width(25);
            
            // Gerar download
            const fileName = `Memoria_Calculo_${tipoPrograma}_${new Date().toISOString().split('T')[0]}.xlsx`;
            const excelData = await workbook.outputAsync();
            const blob = new Blob([excelData], { 
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
            });
            
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            addLog(`Memória de cálculo ${tipoPrograma} exportada: ${fileName}`, 'success');
            
        } catch (error) {
            addLog(`Erro ao gerar memória de cálculo ${tipoPrograma}: ${error.message}`, 'error');
        }
    }

    // Initialize UI
    // updateStatus("Aguardando arquivo SPED..."); // Initial status is now set by clearLogs
    excelFileNameInput.placeholder = "NomeDoArquivoModerno.xlsx"; // From new HTML
    clearLogs(); // Initialize log area and set initial status message via addLog

}); // End DOMContentLoaded
