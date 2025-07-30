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
    let progoiasData = null; // ProGoiás specific data
    let progoiasRegistrosCompletos = null; // Complete SPED records for ProGoiás
    let progoiasMultiPeriodData = []; // Array of ProGoiás period data objects
    let progoiasSelectedPeriodIndex = 0; // Currently selected period for ProGoiás display
    let progoiasCurrentImportMode = 'single'; // 'single' or 'multiple' for ProGoiás
    
    // Correção de códigos E111 variables - FOMENTAR
    let codigosCorrecao = {}; // Mapeamento de códigos originais para códigos corrigidos
    let codigosEncontrados = []; // Lista de códigos E111 encontrados
    let isMultiplePeriods = false; // Flag para múltiplos períodos
    
    // Correção de códigos E111 variables - ProGoiás
    let progoiasCodigosCorrecao = {}; // Mapeamento de códigos originais para códigos corrigidos (ProGoiás)
    let progoiasCodigosEncontrados = []; // Lista de códigos E111 encontrados (ProGoiás)
    let progoiasIsMultiplePeriods = false; // Flag para múltiplos períodos (ProGoiás)
    
    // Configuração de CFOPs Genéricos variables - FOMENTAR
    let cfopsGenericosEncontrados = []; // Lista de CFOPs genéricos encontrados no SPED
    let cfopsGenericosConfig = {}; // Configuração do usuário: {cfop: 'incentivado'|'nao-incentivado'|'padrao'}
    let cfopsGenericosDetectados = false; // Flag se CFOPs genéricos foram detectados

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
    document.getElementById('exportValidationReport').addEventListener('click', showValidationReport);
    document.getElementById('closeValidationReport').addEventListener('click', hideValidationReport);
    document.getElementById('exportValidationExcel').addEventListener('click', exportValidationExcel);
    document.getElementById('exportValidationPDF').addEventListener('click', exportValidationPDF);
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
    document.getElementById('progoiasTipoEmpresa').addEventListener('change', handleProgoisConfigChange);
    document.getElementById('progoiasOpcaoCalculo').addEventListener('change', handleProgoisOpcaoCalculoChange);
    document.getElementById('progoiasAnoFruicao').addEventListener('change', handleProgoisConfigChange);
    document.getElementById('progoiasPercentualManual').addEventListener('input', handleProgoisConfigChange);
    document.getElementById('progoiasIcmsPorMedia').addEventListener('input', handleProgoisConfigChange);
    document.getElementById('progoiasSaldoCredorAnterior').addEventListener('input', handleProgoisConfigChange);
    document.getElementById('processProgoisData').addEventListener('click', processProgoisData);
    
    // ProGoiás Multiple Period Configuration listeners  
    document.getElementById('progoiasMultipleTipoEmpresa').addEventListener('change', handleProgoisMultipleConfigChange);
    document.getElementById('progoiasMultipleMesInicio').addEventListener('change', handleProgoisMultipleConfigChange);
    document.getElementById('progoiasMultipleAnoInicio').addEventListener('input', handleProgoisMultipleConfigChange);
    document.getElementById('progoiasMultipleIcmsPorMedia').addEventListener('input', handleProgoisMultipleConfigChange);
    document.getElementById('progoiasMultipleSaldoCredor').addEventListener('input', handleProgoisMultipleConfigChange);
    document.getElementById('progoiasMultipleAjustePeriodoAnterior').addEventListener('input', handleProgoisMultipleConfigChange);
    
    // ProGoiás Single Period - adicionar novo campo  
    document.getElementById('progoiasAjustePeriodoAnterior').addEventListener('input', handleProgoisConfigChange);
    
    // Correção de códigos E111 listeners - FOMENTAR
    document.getElementById('btnAplicarCorrecoes').addEventListener('click', aplicarCorrecoesECalcular);
    document.getElementById('btnPularCorrecoes').addEventListener('click', pularCorrecoesECalcular);
    
    // Correção de códigos E111 listeners - ProGoiás
    document.getElementById('btnAplicarCorrecoesProgoias').addEventListener('click', aplicarCorrecoesECalcularProgoias);
    document.getElementById('btnPularCorrecoesProgoias').addEventListener('click', pularCorrecoesECalcularProgoias);
    
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
    document.getElementById('progoiasViewSinglePeriod').addEventListener('click', () => switchProgoisView('single'));
    document.getElementById('progoiasViewComparative').addEventListener('click', () => switchProgoisView('comparative'));
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
    const progoiasDropZone = document.getElementById('progoiasDropZone');
    if (progoiasDropZone) {
        progoiasDropZone.addEventListener('dragenter', handleProgoisDragEnter, false);
        progoiasDropZone.addEventListener('dragover', handleProgoisDragOver, false);
        progoiasDropZone.addEventListener('dragleave', handleProgoisDragLeave, false);
        progoiasDropZone.addEventListener('drop', handleProgoisFileDrop, false);
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
        // Sempre mostrar no console para debug
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        if (type === 'error') {
            console.error(logMessage);
        } else if (type === 'warn') {
            console.warn(logMessage);
        } else if (type === 'success') {
            console.log(`✅ ${logMessage}`);
        } else {
            console.log(logMessage);
        }
        
        // Também adicionar à interface se existir
        if (logWindow) {
            const logEntry = document.createElement('div');
            logEntry.classList.add('log-message');
            logEntry.classList.add(`log-${type}`);
            logEntry.textContent = logMessage;
            
            logWindow.appendChild(logEntry);
            logWindow.scrollTop = logWindow.scrollHeight;
        }
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

    // === CONSTANTES CFOP GENÉRICO ===
    const CFOPS_GENERICOS = [
        '1910', '1911', '1917', '1918', '1949', // Entradas genéricas
        '2905', '2910', '2911', '2917', '2918', '2934', '2949', // Transfer/Devoluções/Outras
        '3949', // Entrada genérica
        '5910', '5917', '5918', '5927', '5928', '5949', // Saídas genéricas 
        '6905', '6910', '6917', '6918', '6934', '6949', // Saídas interestaduais genéricas
        '7949' // Saída para exterior genérica
    ];
    
    const CFOPS_GENERICOS_DESCRICOES = {
        '1910': 'Entrada - Outros (genérico)',
        '1911': 'Entrada - Devolução (genérico)', 
        '1917': 'Entrada - Aquisição de serviço (genérico)',
        '1918': 'Entrada - Operação diversa (genérico)',
        '1949': 'Entrada - Outra operação (genérico)',
        '2905': 'Transfer - Entrada via armazém geral (genérico)',
        '2910': 'Transfer - Entrada outros (genérico)',
        '2911': 'Transfer - Entrada devolução (genérico)', 
        '2917': 'Transfer - Entrada serviço (genérico)',
        '2918': 'Transfer - Entrada operação diversa (genérico)',
        '2934': 'Transfer - Entrada complementar ICMS (genérico)',
        '2949': 'Transfer - Entrada outra operação (genérico)',
        '3949': 'Entrada - Outra operação (genérico)',
        '5910': 'Saída - Outros (genérico)',
        '5917': 'Saída - Prestação de serviço (genérico)',
        '5918': 'Saída - Operação diversa (genérico)',
        '5927': 'Saída - Lançamento efetuado a título de simples faturamento (genérico)',
        '5928': 'Saída - Lançamento efetuado a título de simples faturamento decorrente de venda (genérico)',
        '5949': 'Saída - Outra operação (genérico)',
        '6905': 'Saída Interestadual - Via armazém geral (genérico)',
        '6910': 'Saída Interestadual - Outros (genérico)',
        '6917': 'Saída Interestadual - Prestação de serviço (genérico)',
        '6918': 'Saída Interestadual - Operação diversa (genérico)',
        '6934': 'Saída Interestadual - Complementar ICMS (genérico)',
        '6949': 'Saída Interestadual - Outra operação (genérico)',
        '7949': 'Saída Exterior - Outra operação (genérico)'
    };

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
            document.getElementById('progoiasPanel').classList.add('active');
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
            
            // Validar se há dados suficientes para operações
            const temOperacoes = (registrosCompletos.C190 && registrosCompletos.C190.length > 0) ||
                               (registrosCompletos.C590 && registrosCompletos.C590.length > 0) ||
                               (registrosCompletos.D190 && registrosCompletos.D190.length > 0) ||
                               (registrosCompletos.D590 && registrosCompletos.D590.length > 0);
            
            if (!temOperacoes) {
                throw new Error('SPED não contém operações suficientes para apuração FOMENTAR');
            }
            
            // Verificar CFOPs genéricos primeiro, depois E111
            const temCfopsGenericos = verificarExistenciaCfopsGenericos(registrosCompletos);
            
            if (temCfopsGenericos) {
                // Detectar e configurar CFOPs genéricos encontrados
                addLog('CFOPs genéricos detectados. Iniciando configuração...', 'info');
                detectarCfopsGenericosIndividuais(registrosCompletos);
                return; // Parar aqui até a configuração de CFOPs
            } else {
                // Não há CFOPs genéricos, prosseguir diretamente para E111
                const temCodigosParaCorrigir = analisarCodigosE111(registrosCompletos, false);
            
                if (temCodigosParaCorrigir) {
                // Mostrar interface de correção e parar aqui
                addLog('Códigos de ajuste E111 encontrados. Verifique se há necessidade de correção antes de prosseguir.', 'warn');
                
                // Atualizar status
                document.getElementById('fomentarSpedStatus').textContent = 
                    `Arquivo SPED importado. Códigos E111 encontrados para possível correção.`;
                document.getElementById('fomentarSpedStatus').style.color = '#FF6B35';
                
                return; // Parar aqui até o usuário decidir sobre as correções
            } else {
                    // Não há códigos para corrigir, prosseguir diretamente
                    addLog('Nenhum código de ajuste E111 encontrado. Prosseguindo com cálculo...', 'info');
                    continuarCalculoFomentar();
                }
            }
            
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
            const valorOperacao = parseFloat((campos[valorOprIndex] || '0').replace(',', '.'));
            const valorIcms = parseFloat((campos[valorIcmsIndex] || '0').replace(',', '.'));
            
            // Determinar tipo de operação pelo CFOP
            const tipoOperacao = cfop.startsWith('1') || cfop.startsWith('2') || cfop.startsWith('3') ? 'ENTRADA' : 'SAIDA';
            
            // Verificar se é CFOP genérico configurado pelo usuário
            let isIncentivada;
            
            // Primeiro, usar lógica normativa como padrão
            const isIncentivadiaPadrao = tipoOperacao === 'ENTRADA' 
                ? CFOP_ENTRADAS_INCENTIVADAS.includes(cfop)
                : CFOP_SAIDAS_INCENTIVADAS.includes(cfop);
            
            // Se é CFOP genérico E foi configurado pelo usuário, aplicar configuração
            if (CFOPS_GENERICOS.includes(cfop) && cfopsGenericosConfig && cfopsGenericosConfig[cfop]) {
                const config = cfopsGenericosConfig[cfop];
                if (config === 'incentivado') {
                    isIncentivada = true;
                } else if (config === 'nao-incentivado') {
                    isIncentivada = false;
                } else {
                    // config === 'padrao' ou qualquer outro valor - usar lógica normativa
                    isIncentivada = isIncentivadiaPadrao;
                }
            } else {
                // CFOP normal ou genérico não configurado - usar lógica normativa
                isIncentivada = isIncentivadiaPadrao;
            }
            
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
            const valorOperacao = parseFloat((campos[valorOprIndex] || '0').replace(',', '.'));
            const valorIcms = parseFloat((campos[valorIcmsIndex] || '0').replace(',', '.'));
            
            // Determinar tipo de operação pelo CFOP
            const tipoOperacao = cfop.startsWith('1') || cfop.startsWith('2') || cfop.startsWith('3') ? 'ENTRADA' : 'SAIDA';
            
            // Verificar se é CFOP genérico configurado pelo usuário
            let isIncentivada;
            
            // Primeiro, usar lógica normativa como padrão
            const isIncentivadiaPadrao = tipoOperacao === 'ENTRADA' 
                ? CFOP_ENTRADAS_INCENTIVADAS.includes(cfop)
                : CFOP_SAIDAS_INCENTIVADAS.includes(cfop);
            
            // Se é CFOP genérico E foi configurado pelo usuário, aplicar configuração
            if (CFOPS_GENERICOS.includes(cfop) && cfopsGenericosConfig && cfopsGenericosConfig[cfop]) {
                const config = cfopsGenericosConfig[cfop];
                if (config === 'incentivado') {
                    isIncentivada = true;
                } else if (config === 'nao-incentivado') {
                    isIncentivada = false;
                } else {
                    // config === 'padrao' ou qualquer outro valor - usar lógica normativa
                    isIncentivada = isIncentivadiaPadrao;
                }
            } else {
                // CFOP normal ou genérico não configurado - usar lógica normativa
                isIncentivada = isIncentivadiaPadrao;
            }
            
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
                const valorAjuste = parseFloat((campos[layout.indexOf('VL_AJ_APUR')] || '0').replace(',', '.'));
                
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
                        tipo: determinarTipoAjustePorCodigo(codAjuste),
                        incentivado: isIncentivado,
                        observacao: isIncentivado ? 'Incentivado conforme Anexo III IN 885' : 'Não incentivado'
                    };
                    
                    operations.memoriaCalculo.ajustesE111.push(ajusteDetalhado);
                    
                    const tipoAjuste = determinarTipoAjustePorCodigo(codAjuste);
                    const valorAbsoluto = Math.abs(valorAjuste);
                    
                    // Classificar baseado no código, não no sinal do valor
                    if (tipoAjuste === 'CRÉDITO') {
                        operations.outrosCreditos += valorAbsoluto;
                        operations.memoriaCalculo.totalCreditos.porAjustesE111 += valorAbsoluto;
                        
                        // Separar créditos incentivados/não incentivados para ProGoiás
                        if (isIncentivado) {
                            operations.outrosCreditosIncentivados += valorAbsoluto;
                        } else {
                            operations.outrosCreditosNaoIncentivados += valorAbsoluto;
                        }
                        
                        operations.memoriaCalculo.detalhesOutrosCreditos = operations.memoriaCalculo.detalhesOutrosCreditos || [];
                        operations.memoriaCalculo.detalhesOutrosCreditos.push({
                            origem: 'E111 - Ajustes da Apuração do ICMS',
                            codigo: codAjuste,
                            valor: valorAbsoluto,
                            incentivado: isIncentivado,
                            descricao: `Crédito E111: ${codAjuste}`,
                            tipo: 'CRÉDITO'
                        });
                        addLog(`E111 Crédito: ${codAjuste} = R$ ${formatCurrency(valorAbsoluto)} ${isIncentivado ? '(Incentivado)' : '(Não Incentivado)'}`, 'info');
                    } else if (tipoAjuste === 'DÉBITO') {
                        operations.outrosDebitos += valorAbsoluto;
                        operations.memoriaCalculo.totalDebitos.porAjustesE111 += valorAbsoluto;
                        
                        // Separar débitos incentivados/não incentivados para ProGoiás
                        if (isIncentivado) {
                            operations.outrosDebitosIncentivados += valorAbsoluto;
                        } else {
                            operations.outrosDebitosNaoIncentivados += valorAbsoluto;
                        }
                        
                        operations.memoriaCalculo.detalhesOutrosDebitos = operations.memoriaCalculo.detalhesOutrosDebitos || [];
                        operations.memoriaCalculo.detalhesOutrosDebitos.push({
                            origem: 'E111 - Ajustes da Apuração do ICMS',
                            codigo: codAjuste,
                            valor: valorAbsoluto,
                            incentivado: isIncentivado,
                            descricao: `Débito E111: ${codAjuste}`,
                            tipo: 'DÉBITO'
                        });
                        addLog(`E111 Débito: ${codAjuste} = R$ ${formatCurrency(valorAbsoluto)} ${isIncentivado ? '(Incentivado)' : '(Não Incentivado)'}`, 'info');
                    } else if (tipoAjuste === 'DEDUÇÃO') {
                        // Deduções são tratadas separadamente no cálculo
                        operations.memoriaCalculo.deducoes = operations.memoriaCalculo.deducoes || [];
                        operations.memoriaCalculo.deducoes.push({
                            origem: 'E111 - Ajustes da Apuração do ICMS',
                            codigo: codAjuste,
                            valor: valorAbsoluto,
                            tipo: 'DEDUÇÃO'
                        });
                        addLog(`E111 Dedução: ${codAjuste} = R$ ${formatCurrency(valorAbsoluto)}`, 'info');
                    } else {
                        addLog(`E111 Tipo indeterminado: ${codAjuste} (${tipoAjuste}) = R$ ${formatCurrency(valorAbsoluto)}`, 'warn');
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
                const valorIcms = parseFloat((campos[6] || '0').replace(',', '.')); // VL_ICMS
                
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
                        
                        operations.memoriaCalculo.detalhesOutrosDebitos = operations.memoriaCalculo.detalhesOutrosDebitos || [];
                        operations.memoriaCalculo.detalhesOutrosDebitos.push({
                            origem: 'C197 - Outras Obrigações Tributárias, Ajustes e Informações de Valores Provenientes de Documento Fiscal',
                            codigo: codAjuste,
                            valor: Math.abs(valorIcms),
                            incentivado: ehIncentivadoProgoias,
                            descricao: `Débito C197: ${codAjuste}`,
                            tipo: 'DEBITO'
                        });
                        
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
                const valorIcms = parseFloat((campos[6] || '0').replace(',', '.')); // VL_ICMS
                
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
        
        // MEMÓRIA DE CÁLCULO DETALHADA
        addLog('=== MEMÓRIA DE CÁLCULO DETALHADA ===', 'warn');
        if (operations.memoriaCalculo.detalhesOutrosCreditos?.length > 0) {
            addLog(`OUTROS CRÉDITOS (${operations.memoriaCalculo.detalhesOutrosCreditos.length} registros):`, 'info');
            operations.memoriaCalculo.detalhesOutrosCreditos.forEach(item => {
                addLog(`  ${item.origem} | ${item.codigo}: R$ ${formatCurrency(item.valor)} ${item.incentivado ? '(Incentivado)' : '(Não Incentivado)'}`, 'info');
            });
        }
        if (operations.memoriaCalculo.detalhesOutrosDebitos?.length > 0) {
            addLog(`OUTROS DÉBITOS (${operations.memoriaCalculo.detalhesOutrosDebitos.length} registros):`, 'info');
            operations.memoriaCalculo.detalhesOutrosDebitos.forEach(item => {
                addLog(`  ${item.origem} | ${item.codigo}: R$ ${formatCurrency(item.valor)} ${item.incentivado ? '(Incentivado)' : '(Não Incentivado)'}`, 'info');
            });
        }
        
        return operations;
    }
    
    // === FUNÇÕES DE CFOP GENÉRICO ===
    
    function verificarExistenciaCfopsGenericos(registros) {
        cfopsGenericosEncontrados = [];
        cfopsGenericosDetectados = false;
        
        // Verificar registros consolidados C190, C590, D190, D590
        ['C190', 'C590', 'D190', 'D590'].forEach(tipoRegistro => {
            if (registros[tipoRegistro]) {
                registros[tipoRegistro].forEach((registro, index) => {
                    const layout = obterLayoutRegistro(tipoRegistro);
                    const campos = registro.slice(1, -1);
                    const cfop = campos[layout.indexOf('CFOP')] || '';
                    
                    if (cfop && CFOPS_GENERICOS.includes(cfop)) {
                        cfopsGenericosEncontrados.push({
                            cfop: cfop,
                            tipoRegistro: tipoRegistro,
                            indiceRegistro: index,
                            descricao: CFOPS_GENERICOS_DESCRICOES[cfop] || 'Sem descrição'
                        });
                    }
                });
            }
        });
        
        if (cfopsGenericosEncontrados.length > 0) {
            cfopsGenericosDetectados = true;
            return true;
        }
        
        return false;
    }
    
    function detectarCfopsGenericosIndividuais(registros) {
        cfopsGenericosEncontrados = [];
        cfopsGenericosDetectados = false;
        
        // Verificar registros consolidados C190, C590, D190, D590
        ['C190', 'C590', 'D190', 'D590'].forEach(tipoRegistro => {
            if (registros[tipoRegistro]) {
                registros[tipoRegistro].forEach((registro, index) => {
                    const layout = obterLayoutRegistro(tipoRegistro);
                    const campos = registro.slice(1, -1);
                    const cfop = campos[layout.indexOf('CFOP')] || '';
                    
                    if (cfop && CFOPS_GENERICOS.includes(cfop)) {
                        const valorOperacao = parseFloat((campos[layout.indexOf('VL_OPR')] || '0').replace(',', '.'));
                        const valorIcms = parseFloat((campos[layout.indexOf('VL_ICMS')] || '0').replace(',', '.'));
                        
                        cfopsGenericosEncontrados.push({
                            cfop: cfop,
                            tipoRegistro: tipoRegistro,
                            indiceRegistro: index,
                            descricao: CFOPS_GENERICOS_DESCRICOES[cfop] || 'Sem descrição',
                            valorOperacao: valorOperacao,
                            valorIcms: valorIcms,
                            classificacao: 'padrao' // Padrão inicial
                        });
                    }
                });
            }
        });
        
        if (cfopsGenericosEncontrados.length > 0) {
            cfopsGenericosDetectados = true;
            mostrarInterfaceCfopsGenericosIndividuais();
        }
    }
    
    function mostrarInterfaceCfopsGenericosIndividuais() {
        const container = document.getElementById('cfopGenericoSection');
        if (!container) {
            addLog('ERRO: Seção cfopGenericoSection não encontrada no HTML', 'error');
            // Prosseguir para E111
            prosseguirParaE111();
            return;
        }
        
        let html = '<h3>🔧 Configuração de CFOPs Genéricos</h3>';
        html += '<p>Os seguintes CFOPs genéricos foram encontrados. Configure se devem ser tratados como incentivados ou não incentivados:</p>';
        
        html += '<div class="cfops-individuais">';
        cfopsGenericosEncontrados.forEach((cfopInfo, index) => {
            html += `
                <div class="cfop-individual-item">
                    <div class="cfop-info">
                        <strong>CFOP ${cfopInfo.cfop}</strong> - ${cfopInfo.descricao}<br>
                        <small>Registro: ${cfopInfo.tipoRegistro}[${cfopInfo.indiceRegistro + 1}] | 
                        Valor Op: R$ ${cfopInfo.valorOperacao.toLocaleString('pt-BR', {minimumFractionDigits: 2})} | 
                        ICMS: R$ ${cfopInfo.valorIcms.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</small>
                    </div>
                    <div class="cfop-opcoes">
                        <label>
                            <input type="radio" name="cfop_${index}" value="incentivado">
                            Incentivado
                        </label>
                        <label>
                            <input type="radio" name="cfop_${index}" value="nao-incentivado">
                            Não Incentivado
                        </label>
                        <label>
                            <input type="radio" name="cfop_${index}" value="padrao" checked>
                            Padrão (Conforme Normativa)
                        </label>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        html += `
            <div class="cfop-actions">
                <button id="btnAplicarCfops" class="btn-style">✅ Aplicar Configuração</button>
                <button id="btnPularCfops" class="btn-style">⏭️ Usar Configuração Padrão</button>
            </div>
        `;
        
        container.innerHTML = html;
        container.style.display = 'block';
        
        // Event listeners
        document.getElementById('btnAplicarCfops').addEventListener('click', aplicarCfopsEContinuar);
        document.getElementById('btnPularCfops').addEventListener('click', pularCfopsEContinuar);
        
        addLog(`${cfopsGenericosEncontrados.length} CFOPs genéricos encontrados. Configure conforme necessário.`, 'info');
    }
    
    function aplicarCfopsEContinuar() {
        // Capturar configurações do usuário
        cfopsGenericosConfig = {};
        let configuracaoIndividual = {};
        
        cfopsGenericosEncontrados.forEach((cfopInfo, index) => {
            const radios = document.querySelectorAll(`input[name="cfop_${index}"]`);
            let classificacaoEscolhida = 'padrao';
            
            radios.forEach(radio => {
                if (radio.checked) {
                    classificacaoEscolhida = radio.value;
                }
            });
            
            cfopInfo.classificacao = classificacaoEscolhida;
            cfopsGenericosConfig[cfopInfo.cfop] = classificacaoEscolhida;
            configuracaoIndividual[index] = {
                cfop: cfopInfo.cfop,
                tipoRegistro: cfopInfo.tipoRegistro,
                indiceRegistro: cfopInfo.indiceRegistro,
                classificacao: classificacaoEscolhida
            };
        });
        
        // Log das configurações aplicadas
        const configuracoes = Object.entries(configuracaoIndividual)
            .map(([indice, config]) => `${config.cfop}[${config.tipoRegistro}#${config.indiceRegistro + 1}]: ${config.classificacao}`)
            .join(', ');
        addLog(`Configurações individuais de CFOP aplicadas: ${configuracoes}`, 'success');
        
        // Ocultar seção de CFOPs
        document.getElementById('cfopGenericoSection').style.display = 'none';
        
        // Prosseguir para E111
        prosseguirParaE111();
    }
    
    function pularCfopsEContinuar() {
        // Usar configuração padrão (conforme normativa)
        cfopsGenericosConfig = {};
        cfopsGenericosEncontrados.forEach(cfopInfo => {
            cfopsGenericosConfig[cfopInfo.cfop] = 'padrao';
        });
        
        addLog('Configuração padrão de CFOPs aplicada conforme normativa.', 'info');
        
        // Ocultar seção de CFOPs
        document.getElementById('cfopGenericoSection').style.display = 'none';
        
        // Prosseguir para E111
        prosseguirParaE111();
    }
    
    function prosseguirParaE111() {
        // Analisar códigos E111 para possível correção
        const temCodigosParaCorrigir = analisarCodigosE111(registrosCompletos, false);
        
        if (temCodigosParaCorrigir) {
            // Mostrar interface de correção E111 e parar aqui
            addLog('Códigos de ajuste E111 encontrados. Verifique se há necessidade de correção antes de prosseguir.', 'warn');
            
            // Atualizar status
            document.getElementById('fomentarSpedStatus').textContent = 
                `Arquivo SPED importado. Códigos E111 encontrados para possível correção.`;
            document.getElementById('fomentarSpedStatus').style.color = '#FF6B35';
            
            return; // Parar aqui até o usuário decidir sobre as correções E111
        } else {
            // Não há códigos E111 para corrigir, prosseguir diretamente com o cálculo
            addLog('Nenhum código de ajuste E111 encontrado. Prosseguindo com cálculo...', 'info');
            continuarCalculoFomentar();
        }
    }

    // === FUNÇÕES DE CORREÇÃO DE CÓDIGOS E111 ===
    
    function analisarCodigosE111(registros, isMultiple = false) {
        codigosEncontrados = [];
        isMultiplePeriods = isMultiple;
        
        if (isMultiple && Array.isArray(registros)) {
            // Múltiplos períodos
            registros.forEach((periodoData, index) => {
                if (periodoData.registrosCompletos && periodoData.registrosCompletos.E111) {
                    periodoData.registrosCompletos.E111.forEach(registro => {
                        processarRegistroE111(registro, index, periodoData.periodo);
                    });
                }
            });
        } else {
            // Período único
            if (registros.E111) {
                registros.E111.forEach(registro => {
                    processarRegistroE111(registro, 0, 'Período único');
                });
            }
        }
        
        // Consolidar códigos para múltiplos períodos
        if (isMultiple) {
            const codigosConsolidados = new Map();
            
            codigosEncontrados.forEach(codigo => {
                if (codigosConsolidados.has(codigo.codigo)) {
                    // Adicionar período ao código existente
                    const codigoExistente = codigosConsolidados.get(codigo.codigo);
                    if (codigo.periodos && codigo.periodos.length > 0) {
                        codigoExistente.periodos.push(...codigo.periodos);
                        codigoExistente.valor += codigo.valor;
                    }
                } else {
                    // Novo código
                    codigosConsolidados.set(codigo.codigo, { ...codigo });
                }
            });
            
            codigosEncontrados = Array.from(codigosConsolidados.values());
        } else {
            // Para período único, apenas remover duplicatas simples
            const codigosUnicos = [];
            const codigosVistos = new Set();
            
            codigosEncontrados.forEach(codigo => {
                if (!codigosVistos.has(codigo.codigo)) {
                    codigosVistos.add(codigo.codigo);
                    codigosUnicos.push(codigo);
                }
            });
            
            codigosEncontrados = codigosUnicos;
        }
        
        if (codigosEncontrados.length > 0) {
            exibirCodigosParaCorrecao();
            return true; // Tem códigos para corrigir
        }
        
        return false; // Não tem códigos para corrigir
    }
    
    function processarRegistroE111(registro, periodoIndex, periodoNome) {
        const campos = registro.slice(1, -1);
        const layout = obterLayoutRegistro('E111');
        const codAjuste = campos[layout.indexOf('COD_AJ_APUR')] || '';
        const valorAjuste = parseFloat((campos[layout.indexOf('VL_AJ_APUR')] || '0').replace(',', '.'));
        const descricao = campos[layout.indexOf('DESCR_COMPL_AJ')] || 'Sem descrição';
        
        if (codAjuste && valorAjuste !== 0) {
            const codigoExistente = codigosEncontrados.find(c => c.codigo === codAjuste);
            
            if (codigoExistente) {
                if (isMultiplePeriods) {
                    codigoExistente.periodos.push({
                        index: periodoIndex,
                        nome: periodoNome,
                        valor: valorAjuste
                    });
                } else {
                    codigoExistente.valor += valorAjuste;
                }
            } else {
                const novoCodigo = {
                    codigo: codAjuste,
                    descricao: descricao,
                    valor: valorAjuste,
                    tipo: determinarTipoAjustePorCodigo(codAjuste),
                    isIncentivado: CODIGOS_AJUSTE_INCENTIVADOS.some(cod => codAjuste.includes(cod)),
                    novocodigo: '', // Campo para correção
                    aplicarTodos: true // Para múltiplos períodos
                };
                
                if (isMultiplePeriods) {
                    novoCodigo.periodos = [{
                        index: periodoIndex,
                        nome: periodoNome,
                        valor: valorAjuste
                    }];
                    novoCodigo.aplicarTodos = false; // Padrão para períodos específicos
                    novoCodigo.periodosEscolhidos = []; // Inicializar vazio
                }
                
                codigosEncontrados.push(novoCodigo);
            }
        }
    }
    
    function determinarTipoAjustePorCodigo(codigoAjuste) {
        // Baseado na normativa: Distinção de Débito e Crédito nos Códigos de Ajuste
        // Estrutura: AABCDDDD onde C (4º dígito) determina o tipo
        
        if (!codigoAjuste || codigoAjuste.length !== 8) {
            return 'INDEFINIDO';
        }
        
        const quartoDigito = codigoAjuste.charAt(3);
        
        switch (quartoDigito) {
            case '0': // Outros débitos
                return 'DÉBITO';
            case '1': // Estorno de créditos (reduz créditos, logo aumenta débito líquido)
                return 'DÉBITO';
            case '2': // Outros créditos
                return 'CRÉDITO';
            case '3': // Estorno de débitos (reduz débitos, logo aumenta crédito líquido)
                return 'CRÉDITO';
            case '4': // Deduções do imposto apurado
                return 'DEDUÇÃO';
            case '5': // Débitos especiais
                return 'DÉBITO';
            case '9': // Controle extra-apuração
                return 'CONTROLE';
            default:
                return 'INDEFINIDO';
        }
    }
    
    function exibirCodigosParaCorrecao() {
        const container = document.getElementById('codigosEncontrados');
        const section = document.getElementById('codigoCorrecaoSection');
        
        container.innerHTML = '';
        
        if (codigosEncontrados.length === 0) {
            container.innerHTML = '<p class="no-codes-message">Nenhum código de ajuste E111 encontrado.</p>';
            section.style.display = 'none';
            return;
        }
        
        const header = document.createElement('h4');
        header.textContent = `Códigos de Ajuste E111 Encontrados (${codigosEncontrados.length})`;
        header.style.marginBottom = '15px';
        container.appendChild(header);
        
        codigosEncontrados.forEach((codigo, index) => {
            const codigoDiv = criarElementoCodigoCorrecao(codigo, index);
            container.appendChild(codigoDiv);
        });
        
        section.style.display = 'block';
        addLog(`Encontrados ${codigosEncontrados.length} códigos de ajuste E111 para possível correção`, 'info');
    }
    
    function criarElementoCodigoCorrecao(codigo, index) {
        const div = document.createElement('div');
        div.className = `codigo-item ${isMultiplePeriods ? 'multiplo-periodo' : ''}`;
        
        // Informações do código
        const infoDiv = document.createElement('div');
        infoDiv.className = 'codigo-info';
        infoDiv.innerHTML = `
            <h4>${codigo.codigo}</h4>
            <p><strong>Tipo:</strong> ${codigo.tipo}</p>
            <p><strong>Incentivado:</strong> ${codigo.isIncentivado ? 'Sim' : 'Não'}</p>
            <p><strong>Descrição:</strong> ${codigo.descricao}</p>
        `;
        
        // Valor
        const valorDiv = document.createElement('div');
        valorDiv.className = `codigo-valor ${codigo.valor < 0 ? 'negativo' : ''}`;
        
        if (isMultiplePeriods && codigo.periodos) {
            const valorTotal = codigo.periodos.reduce((sum, p) => sum + p.valor, 0);
            valorDiv.innerHTML = `
                <strong>Total: R$ ${formatCurrency(Math.abs(valorTotal))}</strong><br>
                <small>${codigo.periodos.length} período(s)</small>
            `;
        } else {
            valorDiv.innerHTML = `<strong>R$ ${formatCurrency(Math.abs(codigo.valor))}</strong>`;
        }
        
        // Campo de correção
        const correcaoDiv = document.createElement('div');
        correcaoDiv.className = 'codigo-correcao';
        correcaoDiv.innerHTML = `
            <label for="novoCodigo_${index}">Novo Código (se incorreto):</label>
            <input type="text" id="novoCodigo_${index}" 
                   placeholder="Ex: GO020001" 
                   value="${codigo.novocodigo}"
                   onchange="atualizarCodigoCorrecao(${index}, this.value)">
        `;
        
        // Opções para múltiplos períodos
        let periodosDiv = null;
        if (isMultiplePeriods && codigo.periodos) {
            periodosDiv = document.createElement('div');
            periodosDiv.className = 'periodo-options';
            
            let periodosHTML = `
                <div class="aplicacao-options">
                    <label>
                        <input type="radio" name="aplicar_${index}" value="todos" 
                               ${codigo.aplicarTodos ? 'checked' : ''}
                               onchange="atualizarAplicacaoCorrecao(${index}, 'todos')">
                        Aplicar em todos os períodos
                    </label>
                    <label>
                        <input type="radio" name="aplicar_${index}" value="especifico"
                               ${!codigo.aplicarTodos ? 'checked' : ''}
                               onchange="atualizarAplicacaoCorrecao(${index}, 'especifico')">
                        Períodos específicos
                    </label>
                </div>
                <div id="periodosEspecificos_${index}" class="periodos-especificos" style="display: ${codigo.aplicarTodos ? 'none' : 'block'};">
                    <h5>Selecione os períodos para aplicar a correção:</h5>
                    <div class="periodos-grid">
            `;
            
            // Adicionar checkbox para cada período
            codigo.periodos.forEach((periodo, periodoIndex) => {
                const isSelected = codigo.periodosEscolhidos && codigo.periodosEscolhidos.includes(periodoIndex);
                periodosHTML += `
                    <label class="periodo-checkbox">
                        <input type="checkbox" 
                               name="periodo_${index}_${periodoIndex}" 
                               value="${periodoIndex}"
                               ${isSelected ? 'checked' : ''}
                               onchange="atualizarPeriodoEspecifico(${index}, ${periodoIndex}, this.checked)">
                        <span class="periodo-info">
                            <strong>Período ${periodoIndex + 1}</strong><br>
                            <small>${periodo.nome || `${periodoIndex + 1}º período`}</small><br>
                            <small>R$ ${formatCurrency(Math.abs(periodo.valor))}</small>
                        </span>
                    </label>
                `;
            });
            
            periodosHTML += `
                    </div>
                </div>
            `;
            
            periodosDiv.innerHTML = periodosHTML;
        }
        
        // Ações
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'codigo-actions';
        actionsDiv.innerHTML = `
            <button class="btn-remover-codigo" onclick="removerCodigoCorrecao(${index})">
                🗑️ Remover
            </button>
        `;
        
        div.appendChild(infoDiv);
        div.appendChild(valorDiv);
        div.appendChild(correcaoDiv);
        if (periodosDiv) div.appendChild(periodosDiv);
        div.appendChild(actionsDiv);
        
        return div;
    }
    
    // Funções globais para manipulação de códigos (chamadas pelos eventos inline)
    window.atualizarCodigoCorrecao = function(index, novoCodigo) {
        if (codigosEncontrados[index]) {
            codigosEncontrados[index].novocodigo = novoCodigo.trim();
            addLog(`Código ${codigosEncontrados[index].codigo} será substituído por: ${novoCodigo}`, 'info');
        }
    };
    
    window.atualizarAplicacaoCorrecao = function(index, tipo) {
        if (codigosEncontrados[index]) {
            codigosEncontrados[index].aplicarTodos = (tipo === 'todos');
            
            // Mostrar/ocultar seção de períodos específicos
            const periodosEspecificosDiv = document.getElementById(`periodosEspecificos_${index}`);
            if (periodosEspecificosDiv) {
                periodosEspecificosDiv.style.display = tipo === 'todos' ? 'none' : 'block';
            }
            
            const acao = tipo === 'todos' ? 'todos os períodos' : 'períodos específicos';
            addLog(`Correção do código ${codigosEncontrados[index].codigo} será aplicada em: ${acao}`, 'info');
        }
    };
    
    window.atualizarPeriodoEspecifico = function(index, periodoIndex, checked) {
        if (codigosEncontrados[index]) {
            // Inicializar array de períodos escolhidos se não existir
            if (!codigosEncontrados[index].periodosEscolhidos) {
                codigosEncontrados[index].periodosEscolhidos = [];
            }
            
            if (checked) {
                // Adicionar período se não estiver na lista
                if (!codigosEncontrados[index].periodosEscolhidos.includes(periodoIndex)) {
                    codigosEncontrados[index].periodosEscolhidos.push(periodoIndex);
                }
            } else {
                // Remover período da lista
                codigosEncontrados[index].periodosEscolhidos = 
                    codigosEncontrados[index].periodosEscolhidos.filter(p => p !== periodoIndex);
            }
            
            const totalSelecionados = codigosEncontrados[index].periodosEscolhidos.length;
            const acao = checked ? 'adicionado' : 'removido';
            addLog(`Período ${periodoIndex + 1} ${acao} para correção do código ${codigosEncontrados[index].codigo} (${totalSelecionados} período(s) selecionado(s))`, 'info');
        }
    };

    window.removerCodigoCorrecao = function(index) {
        if (codigosEncontrados[index]) {
            const codigoRemovido = codigosEncontrados[index].codigo;
            codigosEncontrados.splice(index, 1);
            exibirCodigosParaCorrecao(); // Recriar a lista
            addLog(`Código ${codigoRemovido} removido da lista de correções`, 'warn');
        }
    };
    
    function aplicarCorrecoesECalcular() {
        // Construir mapeamento de correções
        codigosCorrecao = {};
        let correcoesAplicadas = 0;
        
        codigosEncontrados.forEach(codigo => {
            if (codigo.novocodigo && codigo.novocodigo.trim() !== '') {
                codigosCorrecao[codigo.codigo] = {
                    novoCodigo: codigo.novocodigo.trim(),
                    aplicarTodos: codigo.aplicarTodos,
                    periodos: codigo.periodos || [],
                    periodosEscolhidos: codigo.periodosEscolhidos || []
                };
                correcoesAplicadas++;
                
                // Log detalhado sobre onde será aplicada a correção
                if (codigo.aplicarTodos) {
                    addLog(`Correção configurada: ${codigo.codigo} → ${codigo.novocodigo.trim()} (todos os períodos)`, 'success');
                } else if (codigo.periodosEscolhidos && codigo.periodosEscolhidos.length > 0) {
                    const periodosTexto = codigo.periodosEscolhidos.map(p => p + 1).join(', ');
                    addLog(`Correção configurada: ${codigo.codigo} → ${codigo.novocodigo.trim()} (períodos: ${periodosTexto})`, 'success');
                } else {
                    addLog(`Correção configurada: ${codigo.codigo} → ${codigo.novocodigo.trim()} (nenhum período específico selecionado)`, 'warn');
                }
            }
        });
        
        // Esconder seção de correção
        document.getElementById('codigoCorrecaoSection').style.display = 'none';
        
        if (correcoesAplicadas > 0) {
            addLog(`${correcoesAplicadas} correção(ões) de código aplicada(s). Recalculando...`, 'success');
        } else {
            addLog('Nenhuma correção de código aplicada. Prosseguindo com cálculo normal...', 'info');
        }
        
        // Proceder com o cálculo
        continuarCalculoFomentar();
    }
    
    function pularCorrecoesECalcular() {
        // Limpar correções
        codigosCorrecao = {};
        
        // Esconder seção de correção
        document.getElementById('codigoCorrecaoSection').style.display = 'none';
        
        addLog('Correções de código puladas. Prosseguindo com códigos originais...', 'info');
        
        // Proceder com o cálculo
        continuarCalculoFomentar();
    }
    
    function continuarCalculoFomentar() {
        addLog('🔄 Iniciando continuarCalculoFomentar...', 'info');
        
        try {
            // Aplicar correções aos dados se existirem
            if (Object.keys(codigosCorrecao).length > 0) {
                addLog('Aplicando correções E111...', 'info');
                aplicarCorrecoesAosRegistros();
            }
            
            // Prosseguir com classificação e cálculo
            if (currentImportMode === 'multiple' && multiPeriodData.length > 0) {
                // Múltiplos períodos - usar função específica
                addLog('Processando múltiplos períodos...', 'info');
                continuarCalculoMultiplosPeriodos();
            } else {
                // Período único
                addLog('Iniciando classificação de operações...', 'info');
                
                // Debug: verificar configurações CFOP
                if (Object.keys(cfopsGenericosConfig).length > 0) {
                    const configLog = Object.entries(cfopsGenericosConfig)
                        .map(([cfop, config]) => `${cfop}: ${config}`)
                        .join(', ');
                    addLog(`Configurações CFOP aplicadas: ${configLog}`, 'info');
                }
                
                fomentarData = classifyOperations(registrosCompletos);
                addLog('Classificação de operações concluída', 'success');
                
                // Validar se há dados suficientes
                const totalOperacoes = fomentarData.saidasIncentivadas.length + fomentarData.saidasNaoIncentivadas.length + 
                                      fomentarData.entradasIncentivadas.length + fomentarData.entradasNaoIncentivadas.length;
                
                addLog(`Total de operações classificadas: ${totalOperacoes}`, 'info');
                addLog(`- Saídas incentivadas: ${fomentarData.saidasIncentivadas.length}`, 'info');
                addLog(`- Saídas não incentivadas: ${fomentarData.saidasNaoIncentivadas.length}`, 'info');
                addLog(`- Entradas incentivadas: ${fomentarData.entradasIncentivadas.length}`, 'info');
                addLog(`- Entradas não incentivadas: ${fomentarData.entradasNaoIncentivadas.length}`, 'info');
                
                if (totalOperacoes === 0) {
                    throw new Error('SPED não contém operações suficientes para apuração FOMENTAR');
                }
                
                addLog('Executando cálculo FOMENTAR...', 'info');
                calculateFomentar();
                addLog('Cálculo FOMENTAR executado com sucesso', 'success');
                
                // MOSTRAR RESULTADOS NA INTERFACE
                const fomentarResults = document.getElementById('fomentarResults');
                if (fomentarResults) {
                    fomentarResults.style.display = 'block';
                    addLog('Interface de resultados FOMENTAR exibida', 'success');
                } else {
                    addLog('AVISO: Seção fomentarResults não encontrada no HTML', 'warn');
                }
                
                // Atualizar status
                document.getElementById('fomentarSpedStatus').textContent = 
                    `Arquivo SPED processado: ${totalOperacoes} operações analisadas (${fomentarData.saidasIncentivadas.length} saídas incentivadas, ${fomentarData.saidasNaoIncentivadas.length} saídas não incentivadas)`;
                document.getElementById('fomentarSpedStatus').style.color = '#20e3b2';
                
                addLog(`Apuração FOMENTAR calculada: ${totalOperacoes} operações analisadas`, 'success');
                addLog('Revise os valores calculados e ajuste os campos editáveis conforme necessário', 'info');
                addLog('✅ Processo concluído com sucesso!', 'success');
            }
        } catch (error) {
            addLog(`❌ ERRO em continuarCalculoFomentar: ${error.message}`, 'error');
            console.error('Erro detalhado:', error);
            document.getElementById('fomentarSpedStatus').textContent = `Erro: ${error.message}`;
            document.getElementById('fomentarSpedStatus').style.color = '#f857a6';
        }
    }
    
    // CLAUDE-CONTEXT: Funções específicas para correção de códigos E111 no ProGoiás
    // CLAUDE-CAREFUL: Mantém a mesma lógica do FOMENTAR mas com variáveis específicas do ProGoiás
    
    
    function mostrarInterfaceCorrecaoProgoias() {
        // Verificar se existe a seção de correção para ProGoiás
        const section = document.getElementById('progoiasCodigoCorrecaoSection');
        if (!section) {
            addLog('Seção de correção ProGoiás não encontrada na interface', 'error');
            // Prosseguir sem correção
            continuarCalculoProgoias();
            return;
        }
        
        section.style.display = 'block';
        exibirCodigosParaCorrecaoProgoias();
        
        // Scroll para a seção
        section.scrollIntoView({ behavior: 'smooth' });
        
        addLog('Interface de correção de códigos E111 (ProGoiás) exibida. Revise e ajuste conforme necessário.', 'info');
    }
    
    function exibirCodigosParaCorrecaoProgoias() {
        const container = document.getElementById('progoiasCodigosEncontrados');
        if (!container) {
            addLog('Container de códigos ProGoiás não encontrado', 'error');
            return;
        }
        
        container.innerHTML = '';
        
        if (progoiasCodigosEncontrados.length === 0) {
            container.innerHTML = '<p style="color: #666;">Nenhum código E111 encontrado para correção.</p>';
            return;
        }
        
        // Cabeçalho
        const header = document.createElement('h4');
        header.textContent = `Códigos de Ajuste E111 Encontrados - ProGoiás (${progoiasCodigosEncontrados.length})`;
        header.style.marginBottom = '15px';
        container.appendChild(header);
        
        // Lista de códigos
        progoiasCodigosEncontrados.forEach((codigo, index) => {
            const codigoDiv = criarElementoCorrecaoProgoias(codigo, index);
            container.appendChild(codigoDiv);
        });
        
        addLog(`ProGoiás: Encontrados ${progoiasCodigosEncontrados.length} códigos de ajuste E111 para possível correção`, 'info');
    }
    
    function criarElementoCorrecaoProgoias(codigo, index) {
        const div = document.createElement('div');
        div.className = 'codigo-correcao-item';
        div.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: #f9f9f9;
        `;
        
        const isMultiple = progoiasIsMultiplePeriods || (codigo.periodos && codigo.periodos.length > 1);
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div>
                    <strong style="color: #2c3e50;">${codigo.codigo}</strong>
                    <span style="color: #666; margin-left: 10px;">${codigo.descricao}</span>
                    <span style="color: #27ae60; font-weight: bold; margin-left: 10px;">R$ ${codigo.valor.toFixed(2)}</span>
                </div>
                <button onclick="removerCodigoCorrecaoProgoias(${index})" 
                        style="background: #e74c3c; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;">
                    Remover
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; align-items: center;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Novo Código:</label>
                    <input type="text" 
                           id="novoCodigo_progoias_${index}" 
                           placeholder="Digite o código correto..."
                           style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                           onchange="atualizarNovoCodigoProgoias(${index}, this.value)">
                </div>
                
                ${isMultiple ? `
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Aplicar em:</label>
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 5px;">
                            <input type="radio" name="aplicacao_progoias_${index}" value="todos" checked
                                   onchange="alterarAplicacaoProgoias(${index}, 'todos')">
                            Todos os períodos
                        </label>
                        <label style="display: block;">
                            <input type="radio" name="aplicacao_progoias_${index}" value="especificos"
                                   onchange="alterarAplicacaoProgoias(${index}, 'especificos')">
                            Períodos específicos
                        </label>
                    </div>
                    <div id="periodosEspecificos_progoias_${index}" style="display: none;">
                        ${codigo.periodos.map(p => `
                            <label style="display: inline-block; margin-right: 15px; margin-bottom: 5px;">
                                <input type="checkbox" value="${p}" 
                                       onchange="togglePeriodoProgoias(${index}, ${p}, this.checked)">
                                Período ${p + 1}
                            </label>
                        `).join('')}
                    </div>
                </div>
                ` : `
                <div style="color: #666; font-style: italic;">
                    Período único
                </div>
                `}
            </div>
        `;
        
        return div;
    }
    
    // Funções auxiliares para ProGoiás (equivalentes às do FOMENTAR)
    window.atualizarNovoCodigoProgoias = function(index, novoCodigo) {
        if (progoiasCodigosEncontrados[index]) {
            progoiasCodigosEncontrados[index].novocodigo = novoCodigo.trim();
            addLog(`ProGoiás: Código ${progoiasCodigosEncontrados[index].codigo} será substituído por: ${novoCodigo}`, 'info');
        }
    };
    
    window.alterarAplicacaoProgoias = function(index, tipo) {
        if (progoiasCodigosEncontrados[index]) {
            progoiasCodigosEncontrados[index].aplicarTodos = (tipo === 'todos');
            
            const container = document.getElementById(`periodosEspecificos_progoias_${index}`);
            if (container) {
                container.style.display = tipo === 'especificos' ? 'block' : 'none';
            }
            
            const acao = tipo === 'todos' ? 'todos os períodos' : 'períodos específicos';
            addLog(`ProGoiás: Correção do código ${progoiasCodigosEncontrados[index].codigo} será aplicada em: ${acao}`, 'info');
        }
    };
    
    window.togglePeriodoProgoias = function(index, periodoIndex, incluir) {
        if (progoiasCodigosEncontrados[index]) {
            if (!progoiasCodigosEncontrados[index].periodosEscolhidos) {
                progoiasCodigosEncontrados[index].periodosEscolhidos = [];
            }
            
            if (incluir) {
                if (!progoiasCodigosEncontrados[index].periodosEscolhidos.includes(periodoIndex)) {
                    progoiasCodigosEncontrados[index].periodosEscolhidos.push(periodoIndex);
                }
            } else {
                progoiasCodigosEncontrados[index].periodosEscolhidos = 
                    progoiasCodigosEncontrados[index].periodosEscolhidos.filter(p => p !== periodoIndex);
            }
            
            const totalSelecionados = progoiasCodigosEncontrados[index].periodosEscolhidos.length;
            const acao = incluir ? 'selecionado' : 'desmarcado';
            addLog(`ProGoiás: Período ${periodoIndex + 1} ${acao} para correção do código ${progoiasCodigosEncontrados[index].codigo} (${totalSelecionados} período(s) selecionado(s))`, 'info');
        }
    };

    window.removerCodigoCorrecaoProgoias = function(index) {
        if (progoiasCodigosEncontrados[index]) {
            const codigoRemovido = progoiasCodigosEncontrados[index].codigo;
            progoiasCodigosEncontrados.splice(index, 1);
            exibirCodigosParaCorrecaoProgoias(); // Recriar a lista
            addLog(`ProGoiás: Código ${codigoRemovido} removido da lista de correções`, 'warn');
        }
    };
    
    function aplicarCorrecoesECalcularProgoias() {
        // Construir mapeamento de correções
        progoiasCodigosCorrecao = {};
        let correcoesAplicadas = 0;
        
        progoiasCodigosEncontrados.forEach(codigo => {
            if (codigo.novocodigo && codigo.novocodigo.trim() !== '') {
                progoiasCodigosCorrecao[codigo.codigo] = {
                    novoCodigo: codigo.novocodigo.trim(),
                    aplicarTodos: codigo.aplicarTodos,
                    periodos: codigo.periodos || [],
                    periodosEscolhidos: codigo.periodosEscolhidos || []
                };
                correcoesAplicadas++;
                
                // Log detalhado sobre onde será aplicada a correção
                if (codigo.aplicarTodos) {
                    addLog(`ProGoiás: Correção configurada: ${codigo.codigo} → ${codigo.novocodigo.trim()} (todos os períodos)`, 'success');
                } else if (codigo.periodosEscolhidos && codigo.periodosEscolhidos.length > 0) {
                    const periodosTexto = codigo.periodosEscolhidos.map(p => p + 1).join(', ');
                    addLog(`ProGoiás: Correção configurada: ${codigo.codigo} → ${codigo.novocodigo.trim()} (períodos: ${periodosTexto})`, 'success');
                } else {
                    addLog(`ProGoiás: Correção configurada: ${codigo.codigo} → ${codigo.novocodigo.trim()} (nenhum período específico selecionado)`, 'warn');
                }
            }
        });
        
        // Esconder seção de correção
        document.getElementById('progoiasCodigoCorrecaoSection').style.display = 'none';
        
        if (correcoesAplicadas > 0) {
            addLog(`ProGoiás: ${correcoesAplicadas} correção(ões) de código aplicada(s). Recalculando...`, 'success');
        } else {
            addLog('ProGoiás: Nenhuma correção de código aplicada. Prosseguindo com cálculo normal...', 'info');
        }
        
        // CLAUDE-CONTEXT: Para período único, mostrar botão de processamento após correções
        if (progoiasCurrentImportMode === 'single') {
            // Atualizar status e mostrar botão de processamento
            document.getElementById('progoiasSpedStatus').textContent = 
                `Arquivo SPED processado - Correções aplicadas (${correcoesAplicadas})`;
            document.getElementById('progoiasSpedStatus').style.color = '#20e3b2';
            document.getElementById('processProgoisData').style.display = 'block';
            addLog('Correções aplicadas. Configure os parâmetros e clique em "Processar Apuração".', 'success');
        } else {
            // Para múltiplos períodos, prosseguir diretamente
            continuarCalculoProgoisMultiplos();
        }
    }
    
    function pularCorrecoesECalcularProgoias() {
        // Limpar correções
        progoiasCodigosCorrecao = {};
        
        // Esconder seção de correção
        document.getElementById('progoiasCodigoCorrecaoSection').style.display = 'none';
        
        addLog('ProGoiás: Correções de código puladas. Prosseguindo com códigos originais...', 'info');
        
        // CLAUDE-CONTEXT: Para período único, mostrar botão de processamento após pular correções
        if (progoiasCurrentImportMode === 'single') {
            // Atualizar status e mostrar botão de processamento
            document.getElementById('progoiasSpedStatus').textContent = 
                `Arquivo SPED carregado - Correções puladas`;
            document.getElementById('progoiasSpedStatus').style.color = '#20e3b2';
            document.getElementById('processProgoisData').style.display = 'block';
            addLog('Correções puladas. Configure os parâmetros e clique em "Processar Apuração".', 'success');
        } else {
            // Para múltiplos períodos, prosseguir diretamente
            continuarCalculoProgoisMultiplos();
        }
    }
    
    function aplicarCorrecoesAosRegistrosProgoias() {
        if (!progoiasCodigosCorrecao || Object.keys(progoiasCodigosCorrecao).length === 0) {
            return;
        }
        
        addLog('ProGoiás: Aplicando correções aos registros E111...', 'info');
        
        if (progoiasCurrentImportMode === 'multiple' && progoiasMultiPeriodData.length > 0) {
            // Múltiplos períodos
            progoiasMultiPeriodData.forEach((periodo, periodoIndex) => {
                if (periodo.registros && periodo.registros.E111) {
                    periodo.registros.E111.forEach(registro => {
                        const codAjusteOriginal = registro.COD_AJ;
                        const correcao = progoiasCodigosCorrecao[codAjusteOriginal];
                        
                        if (correcao) {
                            const deveAplicar = correcao.aplicarTodos || 
                                              (correcao.periodosEscolhidos && correcao.periodosEscolhidos.includes(periodoIndex));
                            
                            if (deveAplicar) {
                                registro.COD_AJ = correcao.novoCodigo;
                                addLog(`ProGoiás P${periodoIndex + 1}: E111 ${codAjusteOriginal} → ${correcao.novoCodigo} (R$ ${parseFloat(registro.VL_AJ || 0).toFixed(2)})`, 'success');
                            }
                        }
                    });
                }
            });
        } else if (progoiasRegistrosCompletos && progoiasRegistrosCompletos.E111) {
            // Período único
            progoiasRegistrosCompletos.E111.forEach(registro => {
                const codAjusteOriginal = registro.COD_AJ;
                const correcao = progoiasCodigosCorrecao[codAjusteOriginal];
                
                if (correcao) {
                    registro.COD_AJ = correcao.novoCodigo;
                    addLog(`ProGoiás: E111 ${codAjusteOriginal} → ${correcao.novoCodigo} (R$ ${parseFloat(registro.VL_AJ || 0).toFixed(2)})`, 'success');
                }
            });
        }
        
        const totalCorrecoes = Object.keys(progoiasCodigosCorrecao).length;
        addLog(`ProGoiás: ${totalCorrecoes} tipo(s) de código E111 corrigido(s) com sucesso`, 'success');
    }
    
    function continuarCalculoProgoisMultiplos() {
        // Aplicar correções se existirem
        if (Object.keys(progoiasCodigosCorrecao).length > 0) {
            aplicarCorrecoesAosRegistrosProgoias();
        }
        
        // Prosseguir com o cálculo e exibição dos múltiplos períodos
        updateProgoisMultiplePeriodUI();
        addLog(`🎉 Processamento concluído: ${progoiasMultiPeriodData.length} períodos ProGoiás processados com sucesso!`, 'success');
    }
    
    function aplicarCorrecoesAosRegistros() {
        const registrosParaCorrigir = currentImportMode === 'multiple' ? multiPeriodData : [{ registrosCompletos: registrosCompletos }];
        
        registrosParaCorrigir.forEach((periodoData, periodoIndex) => {
            const registros = periodoData.registrosCompletos;
            
            if (registros && registros.E111) {
                registros.E111.forEach(registro => {
                    const campos = registro.slice(1, -1);
                    const layout = obterLayoutRegistro('E111');
                    const codAjusteIndex = layout.indexOf('COD_AJ_APUR');
                    const codAjusteOriginal = campos[codAjusteIndex];
                    
                    const correcao = codigosCorrecao[codAjusteOriginal];
                    if (correcao) {
                        // Verificar se deve aplicar correção neste período
                        let aplicarCorrecao = false;
                        
                        if (currentImportMode === 'multiple') {
                            if (correcao.aplicarTodos) {
                                aplicarCorrecao = true;
                            } else {
                                // Verificar se este período foi selecionado especificamente
                                aplicarCorrecao = correcao.periodosEscolhidos && 
                                               correcao.periodosEscolhidos.includes(periodoIndex);
                            }
                        } else {
                            aplicarCorrecao = true;
                        }
                        
                        if (aplicarCorrecao) {
                            campos[codAjusteIndex] = correcao.novoCodigo;
                            registro[codAjusteIndex + 1] = correcao.novoCodigo; // +1 porque o primeiro elemento é o tipo do registro
                            
                            addLog(`Código corrigido no período ${periodoIndex + 1}: ${codAjusteOriginal} → ${correcao.novoCodigo}`, 'success');
                        }
                    }
                });
            }
        });
    }

    function calculateFomentar() {
        if (!fomentarData) return;
        
        // Configurações
        const percentualFinanciamento = parseFloat(document.getElementById('percentualFinanciamento').value) / 100;
        const icmsPorMedia = parseFloat(document.getElementById('icmsPorMedia').value) || 0;
        const saldoCredorAnterior = parseFloat(document.getElementById('saldoCredorAnterior').value) || 0;
        
        // QUADRO A - Conforme IN 885/07-GSF, Art. 2º (sem cálculo proporcional)
        const saidasIncentivadas = fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
        const totalSaidas = saidasIncentivadas + fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
        const percentualSaidasIncentivadas = totalSaidas > 0 ? (saidasIncentivadas / totalSaidas) * 100 : 0;
        
        // Créditos conforme Anexos I, II e III da IN 885/07-GSF
        const creditosEntradasIncentivadas = fomentarData.creditosEntradasIncentivadas || 0;
        const creditosEntradasNaoIncentivadas = fomentarData.creditosEntradasNaoIncentivadas || 0;
        const outrosCreditosIncentivados = fomentarData.outrosCreditosIncentivados || 0;
        const outrosCreditosNaoIncentivados = fomentarData.outrosCreditosNaoIncentivados || 0;
        
        const estornoDebitos = 0; // Configurável
        
        // Total de créditos por categoria conforme IN 885
        const creditoIncentivadas = creditosEntradasIncentivadas + outrosCreditosIncentivados + saldoCredorAnterior + estornoDebitos;
        const creditoNaoIncentivadas = creditosEntradasNaoIncentivadas + outrosCreditosNaoIncentivados;
        
        const totalCreditos = creditoIncentivadas + creditoNaoIncentivadas;
        
        // QUADRO B - Operações Incentivadas (conforme Demonstrativo versão 3.51)
        
        // 11.1 - Débito do ICMS das Saídas a Título de Bonificação ou Semelhante Incentivadas
        // Identificar operações de bonificação (CFOPs específicos ou natureza da operação)
        const debitoBonificacaoIncentivadas = fomentarData.saidasIncentivadas
            .filter(op => {
                // CFOPs típicos de bonificação: 5910, 5911, 6910, 6911
                const cfopsBonificacao = ['5910', '5911', '6910', '6911'];
                return cfopsBonificacao.includes(op.cfop);
            })
            .reduce((total, op) => total + op.valorIcms, 0);
        
        // 11 - Débito do ICMS das Operações Incentivadas (EXCETO item 11.1)
        const debitoIncentivadas = fomentarData.saidasIncentivadas
            .filter(op => {
                // Excluir CFOPs de bonificação que já estão no item 11.1
                const cfopsBonificacao = ['5910', '5911', '6910', '6911'];
                return !cfopsBonificacao.includes(op.cfop);
            })
            .reduce((total, op) => total + op.valorIcms, 0);
        
        // 12 - Outros Débitos das Operações Incentivadas  
        const outrosDebitosIncentivadas = fomentarData.outrosDebitosIncentivados || 0;
        
        // 13 - Estorno de Créditos das Operações Incentivadas
        const estornoCreditosIncentivadas = 0; // Configurável
        
        // 14 - Crédito para Operações Incentivadas (mantido cálculo atual conforme IN 885)
        const creditoOperacoesIncentivadas = creditoIncentivadas;
        
        // 15 - Deduções das Operações Incentivadas
        const deducoesIncentivadas = 0; // Configurável
        
        // QUADRO C - OPERAÇÕES NÃO INCENTIVADAS (calcular primeiro para obter saldos credores)
        
        // Itens básicos do Quadro C
        const debitoNaoIncentivadas = fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorIcms, 0);
        const outrosDebitosNaoIncentivadas = fomentarData.outrosDebitosNaoIncentivados || 0;
        const estornoCreditosNaoIncentivadas = 0; // Configurável
        const icmsExcedenteNaoSujeitoIncentivo = 0; // Será calculado depois (item 35)
        const creditoOperacoesNaoIncentivadas = creditoNaoIncentivadas;
        const deducoesNaoIncentivadas = 0; // Configurável
        
        // 42 - Saldo Credor do Período das Operações Não Incentivadas [(36+37)-(32+33+34+35)]
        const saldoCredorPeriodoNaoIncentivadas = Math.max(0, 
            (creditoOperacoesNaoIncentivadas + deducoesNaoIncentivadas) - 
            (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoSujeitoIncentivo)
        );
        
        // 43 - Saldo Credor do Período Utilizado nas Operações Incentivadas (vai para o item 16 do Quadro B)
        const saldoCredorNaoIncentUsadoIncentivadas = saldoCredorPeriodoNaoIncentivadas; // Todo o saldo credor pode ser usado
        
        // 44 - Saldo Credor a Transportar para o Período Seguinte (42-43)
        const saldoCredorTransportarNaoIncentivadas = saldoCredorPeriodoNaoIncentivadas - saldoCredorNaoIncentUsadoIncentivadas;
        
        // QUADRO B - OPERAÇÕES INCENTIVADAS
        
        // 16 - Crédito Referente a Saldo Credor do Período das Operações Não Incentivadas
        const creditoSaldoCredorNaoIncentivadas = saldoCredorNaoIncentUsadoIncentivadas;
        
        // 17 - Saldo Devedor do ICMS das Operações Incentivadas [(11+11.1+12+13) - (14+15+16)]
        const saldoDevedorIncentivadas = Math.max(0, 
            (debitoIncentivadas + debitoBonificacaoIncentivadas + outrosDebitosIncentivadas + estornoCreditosIncentivadas) - 
            (creditoOperacoesIncentivadas + deducoesIncentivadas + creditoSaldoCredorNaoIncentivadas)
        );
        
        // 18 - ICMS por Média
        const icmsPorMediaCalc = icmsPorMedia;
        
        // 19 - Deduções/Compensações (64) - conforme instrução oficial
        const deducoesCompensacoes = 0; // Configurável - valores que a legislação permite sejam deduzidos da média
        
        // 20 - Saldo do ICMS a Pagar por Média - resultado da expressão (18-19)
        const saldoIcmsPagarPorMedia = Math.max(0, icmsPorMediaCalc - deducoesCompensacoes);
        
        // 21 - ICMS Base para Fomentar/Produzir - resultado da expressão (17-18) - INSTRUÇÃO OFICIAL
        const icmsBaseFomentar = Math.max(0, saldoDevedorIncentivadas - icmsPorMediaCalc);
        
        // 22 - Percentagem do Financiamento
        const percentualFinanciamentoCalc = percentualFinanciamento * 100;
        
        // 23 - ICMS Sujeito a Financiamento - resultado da expressão [(21x22)/100]
        const icmsSujeitoFinanciamento = icmsBaseFomentar * percentualFinanciamento;
        
        // 24 - ICMS Excedente Não Sujeito ao Incentivo - conforme instrução oficial
        // icmsExcedenteNaoSujeitoIncentivo = 0; // Já declarado anteriormente, pode ser alterado conforme necessário
        
        // 25 - ICMS Financiado - resultado da expressão (23-24) - conforme instrução oficial
        const icmsFinanciado = icmsSujeitoFinanciamento - icmsExcedenteNaoSujeitoIncentivo;
        
        // 26 - Saldo do ICMS da Parcela Não Financiada - resultado da expressão (21-23)
        const parcelaNaoFinanciada = icmsBaseFomentar - icmsSujeitoFinanciamento;
        
        // 27 - Compensação de Saldo Credor de Período Anterior (Parcela Não Financiada)
        const compensacaoSaldoCredorAnterior = 0; // Configurável
        
        // 28 - Saldo do ICMS a Pagar da Parcela Não Financiada
        const saldoPagarParcelaNaoFinanciada = Math.max(0, parcelaNaoFinanciada - compensacaoSaldoCredorAnterior);
        
        // 29 - Saldo Credor do Período das Operações Incentivadas [(14+15)-(11+11.1+12+13)]
        const saldoCredorPeriodoIncentivadas = Math.max(0, 
            (creditoOperacoesIncentivadas + deducoesIncentivadas) - 
            (debitoIncentivadas + debitoBonificacaoIncentivadas + outrosDebitosIncentivadas + estornoCreditosIncentivadas)
        );
        
        // 30 - Saldo Credor do Período Utilizado nas Operações Não Incentivadas
        const saldoCredorIncentUsadoNaoIncentivadas = saldoCredorPeriodoIncentivadas; // Todo o saldo credor pode ser usado
        
        // 31 - Saldo Credor a Transportar para o Período Seguinte (29-30)
        const saldoCredorTransportarIncentivadas = saldoCredorPeriodoIncentivadas - saldoCredorIncentUsadoNaoIncentivadas;
        
        // QUADRO C - CONTINUAÇÃO DOS CÁLCULOS (já temos os saldos credores calculados)
        
        // Agora vou calcular o item 35 - ICMS Excedente Não Sujeito ao Incentivo
        // Regra complexa conforme instrução de preenchimento
        let icmsExcedenteNaoSujeitoIncentivoFinal;
        
        // Valor base do item 24 (valor transportado)
        const valorTransportadoItem24 = icmsFinanciado;
        
        // Calcular ICMS Excedente: (24/22) x 100
        const icmsExcedente = percentualFinanciamentoCalc > 0 ? (valorTransportadoItem24 / percentualFinanciamentoCalc) * 100 : 0;
        
        // Verificar condição: ICMS por Média (18) > [Saldo Devedor (17) - ICMS Excedente]
        const condicaoEspecial = icmsPorMediaCalc > (saldoDevedorIncentivadas - icmsExcedente);
        
        if (condicaoEspecial) {
            // Usar: ICMS Base FOMENTAR (21) - Parcela Não Financiada (26)
            icmsExcedenteNaoSujeitoIncentivoFinal = icmsBaseFomentar - parcelaNaoFinanciada;
        } else {
            // Usar valor transportado do item 24
            icmsExcedenteNaoSujeitoIncentivoFinal = valorTransportadoItem24;
        }
        
        // Garantir que não seja negativo
        icmsExcedenteNaoSujeitoIncentivoFinal = Math.max(0, icmsExcedenteNaoSujeitoIncentivoFinal);
        
        // Recalcular o saldo credor período não incentivadas com o item 35 correto
        const saldoCredorPeriodoNaoIncentivadasFinal = Math.max(0, 
            (creditoOperacoesNaoIncentivadas + deducoesNaoIncentivadas) - 
            (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoSujeitoIncentivoFinal)
        );
        
        // 38 - Saldo Devedor Bruto das Operações Não Incentivadas (32+33+34+35) - (36+37)
        const saldoDevedorBrutoNaoIncentivadas = Math.max(0, 
            (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoSujeitoIncentivoFinal) - 
            (creditoOperacoesNaoIncentivadas + deducoesNaoIncentivadas)
        );
        
        // 39 - Saldo Devedor das Operações Não Incentivadas (após compensação com saldo credor incentivadas)
        const saldoDevedorNaoIncentivadas = Math.max(0, saldoDevedorBrutoNaoIncentivadas - saldoCredorIncentUsadoNaoIncentivadas);
        
        // 40 - Compensação de Saldo Credor de Período Anterior (Não Incentivadas)
        const compensacaoSaldoCredorAnteriorNaoIncentivadas = 0; // Configurável
        
        // 41 - Saldo do ICMS a Pagar das Operações Não Incentivadas
        const saldoPagarNaoIncentivadas = Math.max(0, saldoDevedorNaoIncentivadas - compensacaoSaldoCredorAnteriorNaoIncentivadas);
        
        // RESUMO FINAL
        const totalGeralPagar = saldoPagarParcelaNaoFinanciada + saldoPagarNaoIncentivadas;
        const valorFinanciamento = icmsFinanciado;
        const saldoCredorProximoPeriodo = saldoCredorTransportarIncentivadas + saldoCredorTransportarNaoIncentivadas;
        
        // Atualizar interface
        updateQuadroA({
            item1: saidasIncentivadas,
            item2: totalSaidas,
            item3: percentualSaidasIncentivadas,
            item4: creditosEntradasIncentivadas + creditosEntradasNaoIncentivadas,
            item5: outrosCreditosIncentivados + outrosCreditosNaoIncentivados,
            item6: estornoDebitos,
            item7: saldoCredorAnterior,
            item8: totalCreditos,
            item9: creditoIncentivadas,
            item10: creditoNaoIncentivadas
        });
        
        updateQuadroB({
            item11: debitoIncentivadas,
            item11_1: debitoBonificacaoIncentivadas, 
            item12: outrosDebitosIncentivadas, 
            item13: estornoCreditosIncentivadas, 
            item14: creditoOperacoesIncentivadas, 
            item15: deducoesIncentivadas,
            item16: creditoSaldoCredorNaoIncentivadas, 
            item17: saldoDevedorIncentivadas,
            item18: icmsPorMediaCalc,
            item19: deducoesCompensacoes, // Item 19 - Deduções/Compensações
            item20: saldoIcmsPagarPorMedia, // Item 20 - Saldo do ICMS a Pagar por Média 
            item21: icmsBaseFomentar,
            item22: percentualFinanciamentoCalc, 
            item23: icmsSujeitoFinanciamento,
            item24: icmsExcedenteNaoSujeitoIncentivo, // Item 24 é ICMS Excedente, não Valor Financiado 
            item25: icmsFinanciado,
            item26: parcelaNaoFinanciada,
            item27: compensacaoSaldoCredorAnterior,
            item28: saldoPagarParcelaNaoFinanciada,
            item29: saldoCredorPeriodoIncentivadas,
            item30: saldoCredorIncentUsadoNaoIncentivadas,
            item31: saldoCredorTransportarIncentivadas
        });
        
        updateQuadroC({
            item32: debitoNaoIncentivadas,
            item33: outrosDebitosNaoIncentivadas,
            item34: estornoCreditosNaoIncentivadas,
            item35: icmsExcedenteNaoSujeitoIncentivoFinal,
            item36: creditoOperacoesNaoIncentivadas,
            item37: deducoesNaoIncentivadas,
            item38: saldoDevedorBrutoNaoIncentivadas,
            item39: saldoDevedorNaoIncentivadas,
            item40: compensacaoSaldoCredorAnteriorNaoIncentivadas,
            item41: saldoPagarNaoIncentivadas,
            item42: saldoCredorPeriodoNaoIncentivadasFinal,
            item43: saldoCredorNaoIncentUsadoIncentivadas,
            item44: saldoCredorTransportarNaoIncentivadas
        });
        
        updateResumo({
            saldoPagarParcelaNaoFinanciada: saldoPagarParcelaNaoFinanciada,
            saldoPagarNaoIncentivadas: saldoPagarNaoIncentivadas,
            valorFinanciamento: valorFinanciamento,
            totalGeralPagar: totalGeralPagar,
            saldoCredorProximoPeriodo: saldoCredorProximoPeriodo
        });
        
        // SALVAR VALORES CALCULADOS PARA EXPORTAÇÃO
        if (!fomentarData.calculatedValues) {
            fomentarData.calculatedValues = {};
        }
        
        // Extrair dados do SPED para validação (mover para depois dos calculatedValues)
        let spedValidationData = null;
        let validationReport = null;
        if (registrosCompletos) {
            addLog('Extraindo dados SPED para validação...', 'info');
            spedValidationData = extractSpedValidationData(registrosCompletos);
        }
        
        // Salvar todos os valores calculados com nomes descritivos
        fomentarData.calculatedValues = {
            // Quadro A - Proporção dos Créditos Apropriados
            saidasIncentivadas: saidasIncentivadas,
            totalSaidas: totalSaidas,
            percentualSaidasIncentivadas: percentualSaidasIncentivadas,
            creditosEntradas: creditosEntradasIncentivadas + creditosEntradasNaoIncentivadas,
            outrosCreditos: outrosCreditosIncentivados + outrosCreditosNaoIncentivados,
            estornoDebitos: estornoDebitos,
            saldoCredorAnterior: saldoCredorAnterior,
            totalCreditos: totalCreditos,
            creditoIncentivadas: creditoIncentivadas,
            creditoNaoIncentivadas: creditoNaoIncentivadas,
            
            // Quadro B - Operações Incentivadas (completo conforme demonstrativo versão 3.51)
            debitoIncentivadas: debitoIncentivadas,
            debitoBonificacaoIncentivadas: debitoBonificacaoIncentivadas,
            outrosDebitosIncentivadas: outrosDebitosIncentivadas,
            estornoCreditosIncentivadas: estornoCreditosIncentivadas,
            creditoOperacoesIncentivadas: creditoOperacoesIncentivadas,
            deducoesIncentivadas: deducoesIncentivadas,
            creditoSaldoCredorNaoIncentivadas: creditoSaldoCredorNaoIncentivadas,
            saldoDevedorIncentivadas: saldoDevedorIncentivadas,
            icmsPorMedia: icmsPorMediaCalc,
            deducoesCompensacoes: deducoesCompensacoes, // Item 19 - Deduções/Compensações
            saldoIcmsPagarPorMedia: saldoIcmsPagarPorMedia, // Item 20 - Saldo do ICMS a Pagar por Média
            // Campos antigos para compatibilidade:
            saldoAposMedia: deducoesCompensacoes, 
            outrosAbatimentos: saldoIcmsPagarPorMedia,
            icmsBaseFomentar: icmsBaseFomentar,
            percentualFinanciamento: percentualFinanciamentoCalc,
            icmsSujeitoFinanciamento: icmsSujeitoFinanciamento,
            valorFinanciamentoConcedido: icmsFinanciado, // Compatibilidade - usar icmsFinanciado
            icmsFinanciado: icmsFinanciado,
            parcelaNaoFinanciada: parcelaNaoFinanciada,
            compensacaoSaldoCredorAnterior: compensacaoSaldoCredorAnterior,
            saldoPagarParcelaNaoFinanciada: saldoPagarParcelaNaoFinanciada,
            saldoCredorPeriodoIncentivadas: saldoCredorPeriodoIncentivadas,
            saldoCredorIncentUsadoNaoIncentivadas: saldoCredorIncentUsadoNaoIncentivadas,
            saldoCredorTransportarIncentivadas: saldoCredorTransportarIncentivadas,
            
            // Quadro C - Operações Não Incentivadas (completo conforme demonstrativo versão 3.51)
            debitoNaoIncentivadas: debitoNaoIncentivadas,
            outrosDebitosNaoIncentivadas: outrosDebitosNaoIncentivadas,
            estornoCreditosNaoIncentivadas: estornoCreditosNaoIncentivadas,
            icmsExcedenteNaoSujeitoIncentivo: icmsExcedenteNaoSujeitoIncentivoFinal,
            creditoOperacoesNaoIncentivadas: creditoOperacoesNaoIncentivadas,
            deducoesNaoIncentivadas: deducoesNaoIncentivadas,
            saldoDevedorBrutoNaoIncentivadas: saldoDevedorBrutoNaoIncentivadas,
            saldoDevedorNaoIncentivadas: saldoDevedorNaoIncentivadas,
            compensacaoSaldoCredorAnteriorNaoIncentivadas: compensacaoSaldoCredorAnteriorNaoIncentivadas,
            saldoPagarNaoIncentivadas: saldoPagarNaoIncentivadas,
            saldoCredorPeriodoNaoIncentivadas: saldoCredorPeriodoNaoIncentivadasFinal,
            saldoCredorNaoIncentUsadoIncentivadas: saldoCredorNaoIncentUsadoIncentivadas,
            saldoCredorTransportarNaoIncentivadas: saldoCredorTransportarNaoIncentivadas,
            
            // Resumo Final
            totalGeralPagar: totalGeralPagar,
            valorFinanciamento: valorFinanciamento,
            saldoCredorProximoPeriodo: saldoCredorProximoPeriodo,
            
            // Compatibilidade com exportações existentes
            totalIncentivadas: saldoPagarParcelaNaoFinanciada,
            totalNaoIncentivadas: saldoPagarNaoIncentivadas,
            totalGeral: totalGeralPagar
        };
        
        // Criar relatório de validação após calculatedValues estar completo
        if (spedValidationData) {
            fomentarData.spedValidationData = spedValidationData;
            fomentarData.validationReport = createValidationReport(
                fomentarData.calculatedValues,
                spedValidationData,
                sharedPeriodo,
                sharedNomeEmpresa
            );
            addLog('Relatório de confronto gerado', 'success');
        }
        
        addLog('Valores calculados salvos para exportação', 'info');
        
        // Debug: Mostrar TODOS os valores salvos
        addLog(`Debug - Quadro A: saidasIncentivadas=${saidasIncentivadas}, totalSaidas=${totalSaidas}, percentualSaidasIncentivadas=${percentualSaidasIncentivadas}`, 'info');
        addLog(`Debug - Quadro B: debitoIncentivadas=${debitoIncentivadas}, icmsBaseFomentar=${icmsBaseFomentar}, icmsFinanciado=${icmsFinanciado}`, 'info');
        addLog(`Debug - Quadro C: debitoNaoIncentivadas=${debitoNaoIncentivadas}, saldoPagarNaoIncentivadas=${saldoPagarNaoIncentivadas}`, 'info');
        addLog(`Debug - Resumo: saldoPagarParcelaNaoFinanciada=${saldoPagarParcelaNaoFinanciada}, saldoPagarNaoIncentivadas=${saldoPagarNaoIncentivadas}, valorFinanciamento=${icmsFinanciado}`, 'info');
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
        document.getElementById('itemB11_1').textContent = formatCurrency(values.item11_1);
        document.getElementById('itemB12').textContent = formatCurrency(values.item12);
        document.getElementById('itemB13').textContent = formatCurrency(values.item13);
        document.getElementById('itemB14').textContent = formatCurrency(values.item14);
        document.getElementById('itemB15').textContent = formatCurrency(values.item15);
        document.getElementById('itemB16').textContent = formatCurrency(values.item16);
        document.getElementById('itemB17').textContent = formatCurrency(values.item17);
        document.getElementById('itemB18').textContent = formatCurrency(values.item18);
        document.getElementById('itemB19').textContent = formatCurrency(values.item19);
        document.getElementById('itemB20').textContent = formatCurrency(values.item20);
        document.getElementById('itemB21').textContent = formatCurrency(values.item21);
        document.getElementById('itemB22').textContent = values.item22.toFixed(0) + '%';
        document.getElementById('itemB23').textContent = formatCurrency(values.item23);
        document.getElementById('itemB24_excedente').textContent = formatCurrency(values.item24);
        document.getElementById('itemB25').textContent = formatCurrency(values.item25);
        document.getElementById('itemB26').textContent = formatCurrency(values.item26);
        document.getElementById('itemB27').textContent = formatCurrency(values.item27);
        document.getElementById('itemB28').textContent = formatCurrency(values.item28);
        document.getElementById('itemB29').textContent = formatCurrency(values.item29);
        document.getElementById('itemB30').textContent = formatCurrency(values.item30);
        document.getElementById('itemB31').textContent = formatCurrency(values.item31);
    }

    function updateQuadroC(values) {
        document.getElementById('itemC32').textContent = formatCurrency(values.item32);
        document.getElementById('itemC33').textContent = formatCurrency(values.item33);
        document.getElementById('itemC34').textContent = formatCurrency(values.item34);
        document.getElementById('itemC35').textContent = formatCurrency(values.item35);
        document.getElementById('itemC36').textContent = formatCurrency(values.item36);
        document.getElementById('itemC37').textContent = formatCurrency(values.item37);
        document.getElementById('itemC38').textContent = formatCurrency(values.item38);
        document.getElementById('itemC39').textContent = formatCurrency(values.item39);
        document.getElementById('itemC40').textContent = formatCurrency(values.item40);
        document.getElementById('itemC41').textContent = formatCurrency(values.item41);
        document.getElementById('itemC42').textContent = formatCurrency(values.item42);
        document.getElementById('itemC43').textContent = formatCurrency(values.item43);
        document.getElementById('itemC44').textContent = formatCurrency(values.item44);
    }

    function updateResumo(values) {
        document.getElementById('totalPagarIncentivadas').textContent = formatCurrency(values.saldoPagarParcelaNaoFinanciada);
        document.getElementById('totalPagarNaoIncentivadas').textContent = formatCurrency(values.saldoPagarNaoIncentivadas);
        document.getElementById('valorFinanciamento').textContent = formatCurrency(values.valorFinanciamento);
        document.getElementById('totalGeralPagar').textContent = formatCurrency(values.totalGeralPagar);
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
            calculatedValues: fomentarData.calculatedValues 
        }];
        
        if (!periodsData.length || (!isMultiplePeriods && !fomentarData)) {
            addLog('Erro: Nenhum dado FOMENTAR disponível para exportação', 'error');
            return;
        }
        
        // Debug: verificar se calculatedValues existe
        if (!isMultiplePeriods && fomentarData.calculatedValues) {
            const calcValues = fomentarData.calculatedValues;
            addLog(`Valores para exportação: saidasIncentivadas=${calcValues.saidasIncentivadas}, debitoIncentivadas=${calcValues.debitoIncentivadas}, debitoNaoIncentivadas=${calcValues.debitoNaoIncentivadas}`, 'info');
        } else if (!isMultiplePeriods) {
            addLog('AVISO: calculatedValues não encontrado - valores podem aparecer como zero na exportação', 'warn');
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
                {item: '26', desc: 'Saldo do ICMS da Parcela Não Financiada', field: 'parcelaNaoFinanciada'},
                {item: '28', desc: 'Saldo do ICMS a Pagar da Parcela Não Financiada', field: 'saldoPagarParcelaNaoFinanciada'}
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
                {desc: 'Total a Pagar - Operações Incentivadas', field: 'saldoPagarParcelaNaoFinanciada'},
                {desc: 'Total a Pagar - Operações Não Incentivadas', field: 'saldoPagarNaoIncentivadas'},
                {desc: 'Valor do Financiamento FOMENTAR', field: 'valorFinanciamento'},
                {desc: 'Total Geral a Pagar', field: 'totalGeralPagar'}
            ];
            
            resumoItems.forEach((item, index) => {
                // Deixar coluna A vazia para manter alinhamento com outros quadros
                mainSheet.cell(`A${currentRow}`).value('')
                    .style('border', true)
                    .style('fill', index === 3 ? 'E8F5E8' : 'F5F5F5');
                
                // Descrição na coluna B
                mainSheet.cell(`B${currentRow}`).value(item.desc)
                    .style('bold', true)
                    .style('border', true)
                    .style('fill', index === 3 ? 'E8F5E8' : 'F5F5F5'); // Destaque no total geral
                
                // Valores a partir da coluna C
                periodsData.forEach((period, periodIndex) => {
                    const col = String.fromCharCode(67 + periodIndex); // C, D, E, etc.
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
        
        // Analisar códigos E111 para possível correção em múltiplos períodos
        const temCodigosParaCorrigir = analisarCodigosE111(multiPeriodData, true);
        
        if (temCodigosParaCorrigir) {
            // Mostrar interface de correção e parar aqui
            addLog('Códigos de ajuste E111 encontrados em múltiplos períodos. Verifique se há necessidade de correção antes de prosseguir.', 'warn');
            return; // Parar aqui até o usuário decidir sobre as correções
        } else {
            // Não há códigos para corrigir, prosseguir diretamente
            addLog('Nenhum código de ajuste E111 encontrado. Prosseguindo com cálculo...', 'info');
            continuarCalculoMultiplosPeriodos();
        }
    }
    
    function continuarCalculoMultiplosPeriodos() {
        addLog('Iniciando cálculo para múltiplos períodos...', 'info');
        
        // Aplicar correções aos dados se existirem
        if (Object.keys(codigosCorrecao).length > 0) {
            addLog('Aplicando correções aos registros...', 'info');
            aplicarCorrecoesAosRegistros();
        }
        
        // Classificar operações para cada período
        addLog('Classificando operações para cada período...', 'info');
        multiPeriodData.forEach((periodo, index) => {
            periodo.fomentarData = classifyOperations(periodo.registrosCompletos);
            // Preservar registros para validação SPED
            periodo.fomentarData.registros = periodo.registrosCompletos;
            addLog(`Período ${index + 1}: ${periodo.fomentarData.saidasIncentivadas.length} saídas incentivadas classificadas`, 'info');
        });
        
        // Calcular FOMENTAR para múltiplos períodos
        addLog('Calculando FOMENTAR para múltiplos períodos...', 'info');
        calculateMultiPeriodFomentar();
        
        addLog('Exibindo resultados...', 'info');
        showMultiPeriodResults();
        
        addLog(`Cálculo FOMENTAR concluído para ${multiPeriodData.length} períodos!`, 'success');
    }
    
    function calculateMultiPeriodFomentar() {
        if (!multiPeriodData || multiPeriodData.length === 0) {
            addLog('Nenhum dado de múltiplos períodos encontrado para calcular', 'error');
            return;
        }
        
        // Configurações gerais
        const percentualFinanciamento = parseFloat(document.getElementById('percentualFinanciamento').value) / 100 || 0.70;
        const icmsPorMedia = parseFloat(document.getElementById('icmsPorMedia').value) || 0;
        const saldoCredorInicial = parseFloat(document.getElementById('saldoCredorAnterior').value) || 0;
        
        let saldoCredorCarryOver = saldoCredorInicial;
        
        // Calcular FOMENTAR para cada período
        multiPeriodData.forEach((periodo, index) => {
            if (!periodo.fomentarData) {
                addLog(`Erro: dados FOMENTAR não encontrados para período ${index + 1}`, 'error');
                return;
            }
            
            // Configurações específicas do período
            const configPeriodo = {
                percentualFinanciamento: percentualFinanciamento,
                icmsPorMedia: icmsPorMedia
            };
            
            // Calcular FOMENTAR para este período
            periodo.calculatedValues = calculateFomentarForPeriod(
                periodo.fomentarData, 
                saldoCredorCarryOver, 
                configPeriodo
            );
            
            // Criar relatório de validação para o período
            if (periodo.calculatedValues.spedValidationData) {
                periodo.validationReport = createValidationReport(
                    periodo.calculatedValues,
                    periodo.calculatedValues.spedValidationData,
                    periodo.periodo,
                    periodo.nomeEmpresa
                );
            }
            
            // Atualizar saldo credor para o próximo período
            saldoCredorCarryOver = periodo.calculatedValues.saldoCredorFinal || 0;
            
            addLog(`Período ${index + 1} (${periodo.periodo}): ICMS Financiado = R$ ${formatCurrency(periodo.calculatedValues.icmsFinanciado)}`, 'success');
        });
        
        addLog(`Cálculo FOMENTAR concluído para ${multiPeriodData.length} períodos`, 'success');
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
        
        // QUADRO A - Conforme IN 885/07-GSF, Art. 2º (sem cálculo proporcional)
        const saidasIncentivadas = fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
        const totalSaidas = saidasIncentivadas + fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
        const percentualSaidasIncentivadas = totalSaidas > 0 ? (saidasIncentivadas / totalSaidas) * 100 : 0;
        
        // Créditos conforme Anexos I, II e III da IN 885/07-GSF
        const creditosEntradasIncentivadas = fomentarData.creditosEntradasIncentivadas || 0;
        const creditosEntradasNaoIncentivadas = fomentarData.creditosEntradasNaoIncentivadas || 0;
        const outrosCreditosIncentivados = fomentarData.outrosCreditosIncentivados || 0;
        const outrosCreditosNaoIncentivados = fomentarData.outrosCreditosNaoIncentivados || 0;
        
        const estornoDebitos = 0; // Configurável
        
        // Total de créditos por categoria conforme IN 885
        const creditoIncentivadas = creditosEntradasIncentivadas + outrosCreditosIncentivados + saldoCredorAnterior + estornoDebitos;
        const creditoNaoIncentivadas = creditosEntradasNaoIncentivadas + outrosCreditosNaoIncentivados;
        
        const totalCreditos = creditoIncentivadas + creditoNaoIncentivadas;
        
        // QUADRO B - Operações Incentivadas (conforme Demonstrativo versão 3.51)
        
        // 11.1 - Débito do ICMS das Saídas a Título de Bonificação ou Semelhante Incentivadas
        // Identificar operações de bonificação (CFOPs específicos ou natureza da operação)
        const debitoBonificacaoIncentivadas = fomentarData.saidasIncentivadas
            .filter(op => {
                // CFOPs típicos de bonificação: 5910, 5911, 6910, 6911
                const cfopsBonificacao = ['5910', '5911', '6910', '6911'];
                return cfopsBonificacao.includes(op.cfop);
            })
            .reduce((total, op) => total + op.valorIcms, 0);
        
        // 11 - Débito do ICMS das Operações Incentivadas (EXCETO item 11.1)
        const debitoIncentivadas = fomentarData.saidasIncentivadas
            .filter(op => {
                // Excluir CFOPs de bonificação que já estão no item 11.1
                const cfopsBonificacao = ['5910', '5911', '6910', '6911'];
                return !cfopsBonificacao.includes(op.cfop);
            })
            .reduce((total, op) => total + op.valorIcms, 0);
        
        // 12 - Outros Débitos das Operações Incentivadas  
        const outrosDebitosIncentivadas = fomentarData.outrosDebitosIncentivados || 0;
        
        // 13 - Estorno de Créditos das Operações Incentivadas
        const estornoCreditosIncentivadas = 0; // Configurável
        
        // 14 - Crédito para Operações Incentivadas
        const creditoOperacoesIncentivadas = creditoIncentivadas;
        
        // 15 - Deduções das Operações Incentivadas
        const deducoesIncentivadas = 0; // Configurável
        
        // QUADRO C - OPERAÇÕES NÃO INCENTIVADAS (calcular primeiro para obter saldos credores)
        
        // Itens básicos do Quadro C
        const debitoNaoIncentivadas = fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorIcms, 0);
        const outrosDebitosNaoIncentivadas = fomentarData.outrosDebitosNaoIncentivados || 0;
        const estornoCreditosNaoIncentivadas = 0; // Configurável
        const icmsExcedenteNaoSujeitoIncentivo = 0; // Será calculado depois (item 35)
        const creditoOperacoesNaoIncentivadas = creditoNaoIncentivadas;
        const deducoesNaoIncentivadas = 0; // Configurável
        
        // 42 - Saldo Credor do Período das Operações Não Incentivadas [(36+37)-(32+33+34+35)]
        const saldoCredorPeriodoNaoIncentivadas = Math.max(0, 
            (creditoOperacoesNaoIncentivadas + deducoesNaoIncentivadas) - 
            (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoSujeitoIncentivo)
        );
        
        // 43 - Saldo Credor do Período Utilizado nas Operações Incentivadas (vai para o item 16 do Quadro B)
        const saldoCredorNaoIncentUsadoIncentivadas = saldoCredorPeriodoNaoIncentivadas; // Todo o saldo credor pode ser usado
        
        // 44 - Saldo Credor a Transportar para o Período Seguinte (42-43)
        const saldoCredorTransportarNaoIncentivadas = saldoCredorPeriodoNaoIncentivadas - saldoCredorNaoIncentUsadoIncentivadas;
        
        // QUADRO B - OPERAÇÕES INCENTIVADAS
        
        // 16 - Crédito Referente a Saldo Credor do Período das Operações Não Incentivadas
        const creditoSaldoCredorNaoIncentivadas = saldoCredorNaoIncentUsadoIncentivadas;
        
        // 17 - Saldo Devedor do ICMS das Operações Incentivadas [(11+11.1+12+13) - (14+15+16)]
        const saldoDevedorIncentivadas = Math.max(0, 
            (debitoIncentivadas + debitoBonificacaoIncentivadas + outrosDebitosIncentivadas + estornoCreditosIncentivadas) - 
            (creditoOperacoesIncentivadas + deducoesIncentivadas + creditoSaldoCredorNaoIncentivadas)
        );
        
        // 18 - ICMS por Média
        const icmsPorMediaCalc = icmsPorMedia;
        
        // 19 - Deduções/Compensações (64) - conforme instrução oficial
        const deducoesCompensacoes = 0; // Configurável - valores que a legislação permite sejam deduzidos da média
        
        // 20 - Saldo do ICMS a Pagar por Média - resultado da expressão (18-19)
        const saldoIcmsPagarPorMedia = Math.max(0, icmsPorMediaCalc - deducoesCompensacoes);
        
        // 21 - ICMS Base para Fomentar/Produzir - resultado da expressão (17-18) - INSTRUÇÃO OFICIAL
        const icmsBaseFomentar = Math.max(0, saldoDevedorIncentivadas - icmsPorMediaCalc);
        
        // 22 - Percentagem do Financiamento
        const percentualFinanciamentoCalc = percentualFinanciamento * 100;
        
        // 23 - ICMS Sujeito a Financiamento - resultado da expressão [(21x22)/100]
        const icmsSujeitoFinanciamento = icmsBaseFomentar * percentualFinanciamento;
        
        // 24 - ICMS Excedente Não Sujeito ao Incentivo - conforme instrução oficial
        // icmsExcedenteNaoSujeitoIncentivo = 0; // Já declarado anteriormente, pode ser alterado conforme necessário
        
        // 25 - ICMS Financiado - resultado da expressão (23-24) - conforme instrução oficial
        const icmsFinanciado = icmsSujeitoFinanciamento - icmsExcedenteNaoSujeitoIncentivo;
        
        // 26 - Saldo do ICMS da Parcela Não Financiada - resultado da expressão (21-23)
        const parcelaNaoFinanciada = icmsBaseFomentar - icmsSujeitoFinanciamento;
        
        // 27 - Compensação de Saldo Credor de Período Anterior (Parcela Não Financiada)
        const compensacaoSaldoCredorAnterior = 0; // Configurável
        
        // 28 - Saldo do ICMS a Pagar da Parcela Não Financiada
        const saldoPagarParcelaNaoFinanciada = Math.max(0, parcelaNaoFinanciada - compensacaoSaldoCredorAnterior);
        
        // 29 - Saldo Credor do Período das Operações Incentivadas [(14+15)-(11+11.1+12+13)]
        const saldoCredorPeriodoIncentivadas = Math.max(0, 
            (creditoOperacoesIncentivadas + deducoesIncentivadas) - 
            (debitoIncentivadas + debitoBonificacaoIncentivadas + outrosDebitosIncentivadas + estornoCreditosIncentivadas)
        );
        
        // 30 - Saldo Credor do Período Utilizado nas Operações Não Incentivadas
        const saldoCredorIncentUsadoNaoIncentivadas = saldoCredorPeriodoIncentivadas; // Todo o saldo credor pode ser usado
        
        // 31 - Saldo Credor a Transportar para o Período Seguinte (29-30)
        const saldoCredorTransportarIncentivadas = saldoCredorPeriodoIncentivadas - saldoCredorIncentUsadoNaoIncentivadas;
        
        // QUADRO C - CONTINUAÇÃO DOS CÁLCULOS (já temos os saldos credores calculados)
        
        // Agora vou calcular o item 35 - ICMS Excedente Não Sujeito ao Incentivo
        // Regra complexa conforme instrução de preenchimento
        let icmsExcedenteNaoSujeitoIncentivoFinal;
        
        // Valor base do item 24 (valor transportado)
        const valorTransportadoItem24 = icmsFinanciado;
        
        // Calcular ICMS Excedente: (24/22) x 100
        const icmsExcedente = percentualFinanciamentoCalc > 0 ? (valorTransportadoItem24 / percentualFinanciamentoCalc) * 100 : 0;
        
        // Verificar condição: ICMS por Média (18) > [Saldo Devedor (17) - ICMS Excedente]
        const condicaoEspecial = icmsPorMediaCalc > (saldoDevedorIncentivadas - icmsExcedente);
        
        if (condicaoEspecial) {
            // Usar: ICMS Base FOMENTAR (21) - Parcela Não Financiada (26)
            icmsExcedenteNaoSujeitoIncentivoFinal = icmsBaseFomentar - parcelaNaoFinanciada;
        } else {
            // Usar valor transportado do item 24
            icmsExcedenteNaoSujeitoIncentivoFinal = valorTransportadoItem24;
        }
        
        // Garantir que não seja negativo
        icmsExcedenteNaoSujeitoIncentivoFinal = Math.max(0, icmsExcedenteNaoSujeitoIncentivoFinal);
        
        // Recalcular o saldo credor período não incentivadas com o item 35 correto
        const saldoCredorPeriodoNaoIncentivadasFinal = Math.max(0, 
            (creditoOperacoesNaoIncentivadas + deducoesNaoIncentivadas) - 
            (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoSujeitoIncentivoFinal)
        );
        
        // 38 - Saldo Devedor Bruto das Operações Não Incentivadas (32+33+34+35) - (36+37)
        const saldoDevedorBrutoNaoIncentivadas = Math.max(0, 
            (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoSujeitoIncentivoFinal) - 
            (creditoOperacoesNaoIncentivadas + deducoesNaoIncentivadas)
        );
        
        // 39 - Saldo Devedor das Operações Não Incentivadas (após compensação com saldo credor incentivadas)
        const saldoDevedorNaoIncentivadas = Math.max(0, saldoDevedorBrutoNaoIncentivadas - saldoCredorIncentUsadoNaoIncentivadas);
        
        // 40 - Compensação de Saldo Credor de Período Anterior (Não Incentivadas)
        const compensacaoSaldoCredorAnteriorNaoIncentivadas = 0; // Configurável
        
        // 41 - Saldo do ICMS a Pagar das Operações Não Incentivadas
        const saldoPagarNaoIncentivadas = Math.max(0, saldoDevedorNaoIncentivadas - compensacaoSaldoCredorAnteriorNaoIncentivadas);
        
        // RESUMO FINAL
        const totalGeralPagar = saldoPagarParcelaNaoFinanciada + saldoPagarNaoIncentivadas;
        const valorFinanciamento = icmsFinanciado;
        const saldoCredorProximoPeriodo = saldoCredorTransportarIncentivadas + saldoCredorTransportarNaoIncentivadas;
        
        return {
            // Quadro A - Proporção dos Créditos Apropriados
            saidasIncentivadas: saidasIncentivadas,
            totalSaidas: totalSaidas,
            percentualSaidasIncentivadas: percentualSaidasIncentivadas,
            creditosEntradas: creditosEntradasIncentivadas + creditosEntradasNaoIncentivadas,
            outrosCreditos: outrosCreditosIncentivados + outrosCreditosNaoIncentivados,
            estornoDebitos: estornoDebitos,
            saldoCredorAnterior: saldoCredorAnterior,
            totalCreditos: totalCreditos,
            creditoIncentivadas: creditoIncentivadas,
            creditoNaoIncentivadas: creditoNaoIncentivadas,
            
            // Quadro B - Operações Incentivadas (completo conforme demonstrativo versão 3.51)
            debitoIncentivadas: debitoIncentivadas,
            debitoBonificacaoIncentivadas: debitoBonificacaoIncentivadas,
            outrosDebitosIncentivadas: outrosDebitosIncentivadas,
            estornoCreditosIncentivadas: estornoCreditosIncentivadas,
            creditoOperacoesIncentivadas: creditoOperacoesIncentivadas,
            deducoesIncentivadas: deducoesIncentivadas,
            creditoSaldoCredorNaoIncentivadas: creditoSaldoCredorNaoIncentivadas,
            saldoDevedorIncentivadas: saldoDevedorIncentivadas,
            icmsPorMedia: icmsPorMediaCalc,
            deducoesCompensacoes: deducoesCompensacoes, // Item 19 - Deduções/Compensações
            saldoIcmsPagarPorMedia: saldoIcmsPagarPorMedia, // Item 20 - Saldo do ICMS a Pagar por Média
            // Campos antigos para compatibilidade:
            saldoAposMedia: deducoesCompensacoes, 
            outrosAbatimentos: saldoIcmsPagarPorMedia,
            icmsBaseFomentar: icmsBaseFomentar,
            percentualFinanciamento: percentualFinanciamentoCalc,
            icmsSujeitoFinanciamento: icmsSujeitoFinanciamento,
            valorFinanciamentoConcedido: icmsFinanciado, // Compatibilidade - usar icmsFinanciado
            icmsFinanciado: icmsFinanciado,
            parcelaNaoFinanciada: parcelaNaoFinanciada,
            compensacaoSaldoCredorAnterior: compensacaoSaldoCredorAnterior,
            saldoPagarParcelaNaoFinanciada: saldoPagarParcelaNaoFinanciada,
            saldoCredorPeriodoIncentivadas: saldoCredorPeriodoIncentivadas,
            saldoCredorIncentUsadoNaoIncentivadas: saldoCredorIncentUsadoNaoIncentivadas,
            saldoCredorTransportarIncentivadas: saldoCredorTransportarIncentivadas,
            
            // Quadro C - Operações Não Incentivadas (completo conforme demonstrativo versão 3.51)
            debitoNaoIncentivadas: debitoNaoIncentivadas,
            outrosDebitosNaoIncentivadas: outrosDebitosNaoIncentivadas,
            estornoCreditosNaoIncentivadas: estornoCreditosNaoIncentivadas,
            icmsExcedenteNaoSujeitoIncentivo: icmsExcedenteNaoSujeitoIncentivoFinal,
            creditoOperacoesNaoIncentivadas: creditoOperacoesNaoIncentivadas,
            deducoesNaoIncentivadas: deducoesNaoIncentivadas,
            saldoDevedorBrutoNaoIncentivadas: saldoDevedorBrutoNaoIncentivadas,
            saldoDevedorNaoIncentivadas: saldoDevedorNaoIncentivadas,
            compensacaoSaldoCredorAnteriorNaoIncentivadas: compensacaoSaldoCredorAnteriorNaoIncentivadas,
            saldoPagarNaoIncentivadas: saldoPagarNaoIncentivadas,
            saldoCredorPeriodoNaoIncentivadas: saldoCredorPeriodoNaoIncentivadasFinal,
            saldoCredorNaoIncentUsadoIncentivadas: saldoCredorNaoIncentUsadoIncentivadas,
            saldoCredorTransportarNaoIncentivadas: saldoCredorTransportarNaoIncentivadas,
            
            // Resumo Final
            totalGeralPagar: totalGeralPagar,
            valorFinanciamento: valorFinanciamento,
            saldoCredorFinal: saldoCredorProximoPeriodo,
            
            // Dados de validação SPED (se disponíveis)
            spedValidationData: fomentarData.registros ? extractSpedValidationData(fomentarData.registros) : null
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
        // Show normal quadros instead of hiding them
        document.querySelectorAll('.quadro-section').forEach(section => {
            section.style.display = 'block';
        });
        
        // Show or create comparative table showing official quadros A, B, C
        createOfficialComparativeTable();
    }
    
    function createOfficialComparativeTable() {
        let comparativeTable = document.getElementById('comparativeTable');
        
        if (!comparativeTable) {
            comparativeTable = document.createElement('div');
            comparativeTable.id = 'comparativeTable';
            comparativeTable.innerHTML = '<h3>📊 Relatório Comparativo Multi-Período - Demonstrativo Oficial</h3>';
            
            const fomentarResults = document.getElementById('fomentarResults');
            fomentarResults.appendChild(comparativeTable);
        }
        
        // Build official comparative table HTML with quadros A, B, C
        const officialTableHTML = buildOfficialComparativeTableHTML();
        comparativeTable.innerHTML = '<h3>📊 Relatório Comparativo Multi-Período - Demonstrativo Oficial</h3>' + officialTableHTML;
        comparativeTable.style.display = 'block';
    }

    function createComparativeTable() {
        // Manter função original para compatibilidade
        createOfficialComparativeTable();
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
            { id: 'percentualSaidasIncentivadas', label: 'Percentual Saídas Incentivadas (%)' },
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

    function buildOfficialComparativeTableHTML() {
        if (multiPeriodData.length === 0) return '<p>Nenhum período processado.</p>';
        
        // Table headers with periods info
        let html = '<div class="table-info">';
        html += `<p><strong>Períodos analisados:</strong> ${multiPeriodData.map(p => p.periodo).join(', ')}</p>`;
        html += `<p><strong>Empresa:</strong> ${multiPeriodData[0].nomeEmpresa}</p>`;
        html += `<p><strong>Demonstrativo:</strong> Conforme Instrução Normativa nº 885/07-GSF - Versão 3.51</p>`;
        html += '</div>';

        // QUADRO A - PROPORÇÃO DOS CRÉDITOS APROPRIADOS
        html += '<div class="comparative-quadro">';
        html += '<h4>📈 QUADRO A - PROPORÇÃO DOS CRÉDITOS APROPRIADOS</h4>';
        html += '<table class="comparative-table"><thead><tr>';
        html += '<th class="item-col">Item</th>';
        html += '<th class="description-col">Descrição</th>';
        multiPeriodData.forEach(period => {
            html += `<th class="value-col">${period.periodo}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        const quadroA = [
            { item: '1', label: 'Saídas com Incidência do Incentivo', key: 'saidasIncentivadas' },
            { item: '2', label: 'Total das Saídas', key: 'totalSaidas' },
            { item: '3', label: 'Percentual das Saídas com Incentivo (%)', key: 'percentualSaidasIncentivadas', isPercent: true },
            { item: '4', label: 'Crédito do ICMS das Entradas', key: 'creditosEntradas' },
            { item: '5', label: 'Outros Créditos do ICMS', key: 'outrosCreditos' },
            { item: '6', label: 'Estorno de Débitos do ICMS', key: 'estornoDebitos' },
            { item: '7', label: 'Saldo Credor do Período Anterior', key: 'saldoCredorAnterior' },
            { item: '8', label: 'Total dos Créditos (4+5+6+7)', key: 'totalCreditos' },
            { item: '9', label: 'Crédito para Operações Incentivadas (8x3%)', key: 'creditoIncentivadas' },
            { item: '10', label: 'Crédito para Operações Não Incentivadas (8-9)', key: 'creditoNaoIncentivadas' }
        ];
        
        quadroA.forEach(row => {
            html += '<tr>';
            html += `<td class="item-cell">${row.item}</td>`;
            html += `<td class="description-cell">${row.label}</td>`;
            
            multiPeriodData.forEach(period => {
                const calc = period.calculatedValues;
                let value = calc ? calc[row.key] : 0;
                
                if (row.isPercent) {
                    html += `<td class="value-cell">${(value || 0).toFixed(2)}%</td>`;
                } else {
                    html += `<td class="value-cell">R$ ${formatCurrency(value || 0)}</td>`;
                }
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        // QUADRO B - OPERAÇÕES INCENTIVADAS  
        html += '<div class="comparative-quadro">';
        html += '<h4>🎯 QUADRO B - APURAÇÃO DOS SALDOS DAS OPERAÇÕES INCENTIVADAS</h4>';
        html += '<table class="comparative-table"><thead><tr>';
        html += '<th class="item-col">Item</th>';
        html += '<th class="description-col">Descrição</th>';
        multiPeriodData.forEach(period => {
            html += `<th class="value-col">${period.periodo}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        const quadroB = [
            { item: '11', label: 'Débito do ICMS das Operações Incentivadas', key: 'debitoIncentivadas' },
            { item: '11.1', label: 'Débito do ICMS das Saídas a Título de Bonificação', key: 'debitoBonificacaoIncentivadas' },
            { item: '24', label: 'ICMS Base para Cálculo do FOMENTAR', key: 'icmsBaseFomentar' },
            { item: '25', label: 'Parcela não Financiada', key: 'parcelaNaoFinanciada' },
            { item: '27', label: 'Saldo a Pagar - Parcela não Financiada', key: 'saldoPagarParcelaNaoFinanciada' },
            { item: '29', label: 'Saldo Credor do Período - Operações Incentivadas', key: 'saldoCredorPeriodoIncentivadas' }
        ];
        
        quadroB.forEach(row => {
            html += '<tr>';
            html += `<td class="item-cell">${row.item}</td>`;
            html += `<td class="description-cell">${row.label}</td>`;
            
            multiPeriodData.forEach(period => {
                const calc = period.calculatedValues;
                const value = calc ? calc[row.key] : 0;
                html += `<td class="value-cell">R$ ${formatCurrency(value || 0)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        // QUADRO C - OPERAÇÕES NÃO INCENTIVADAS
        html += '<div class="comparative-quadro">';
        html += '<h4>📋 QUADRO C - APURAÇÃO DOS SALDOS DAS OPERAÇÕES NÃO INCENTIVADAS</h4>';
        html += '<table class="comparative-table"><thead><tr>';
        html += '<th class="item-col">Item</th>';
        html += '<th class="description-col">Descrição</th>';
        multiPeriodData.forEach(period => {
            html += `<th class="value-col">${period.periodo}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        const quadroC = [
            { item: '32', label: 'Débito do ICMS das Operações Não Incentivadas', key: 'debitoNaoIncentivadas' },
            { item: '35', label: 'ICMS Excedente Não Sujeito ao Incentivo', key: 'icmsExcedenteNaoSujeitoIncentivo' },
            { item: '41', label: 'Saldo a Pagar - Operações Não Incentivadas', key: 'saldoPagarNaoIncentivadas' },
            { item: '42', label: 'Saldo Credor do Período - Operações Não Incentivadas', key: 'saldoCredorPeriodoNaoIncentivadas' }
        ];
        
        quadroC.forEach(row => {
            html += '<tr>';
            html += `<td class="item-cell">${row.item}</td>`;
            html += `<td class="description-cell">${row.label}</td>`;
            
            multiPeriodData.forEach(period => {
                const calc = period.calculatedValues;
                const value = calc ? calc[row.key] : 0;
                html += `<td class="value-cell">R$ ${formatCurrency(value || 0)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        // RESUMO FINAL
        html += '<div class="comparative-quadro">';
        html += '<h4>💰 RESUMO DA APURAÇÃO</h4>';
        html += '<table class="comparative-table"><thead><tr>';
        html += '<th class="item-col">Item</th>';
        html += '<th class="description-col">Descrição</th>';
        multiPeriodData.forEach(period => {
            html += `<th class="value-col">${period.periodo}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        const resumo = [
            { item: 'I', label: 'Total a Pagar - Operações Incentivadas', key: 'saldoPagarParcelaNaoFinanciada' },
            { item: 'II', label: 'Total a Pagar - Operações Não Incentivadas', key: 'saldoPagarNaoIncentivadas' },
            { item: 'III', label: 'Valor do Financiamento FOMENTAR', key: 'valorFinanciamento' },
            { item: 'IV', label: 'Total Geral a Pagar (I + II)', key: 'totalGeralPagar' }
        ];
        
        resumo.forEach(row => {
            html += '<tr>';
            html += `<td class="item-cell"><strong>${row.item}</strong></td>`;
            html += `<td class="description-cell"><strong>${row.label}</strong></td>`;
            
            multiPeriodData.forEach(period => {
                const calc = period.calculatedValues;
                const value = calc ? calc[row.key] : 0;
                html += `<td class="value-cell"><strong>R$ ${formatCurrency(value || 0)}</strong></td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        
        return html;
    }
    
    // === RELATÓRIO DE CONFRONTO SPED vs SISTEMA ===
    
    function extractSpedValidationData(registros) {
        const validationData = {
            e110: null,
            e111: [],
            e115: [],
            icmsApurado: 0,
            icmsRecolher: 0,
            saldoCredorAnterior: 0,
            saldoCredorTransportar: 0,
            beneficiosFomentar: 0,
            beneficiosProgoias: 0,
            totalDebitos: 0,
            totalCreditos: 0
        };
        
        try {
            // Extrair dados do E110 (Apuração do ICMS)
            if (registros.E110 && registros.E110.length > 0) {
                const registroE110 = registros.E110[0]; // Primeiro registro E110
                const campos = registroE110.slice(1, -1);
                const layout = ['REG', 'VL_TOT_DEBITOS', 'VL_AJ_DEBITOS', 'VL_TOT_AJ_DEBITOS',
                               'VL_ESTORNOS_CRED', 'VL_TOT_CREDITOS', 'VL_AJ_CREDITOS',
                               'VL_TOT_AJ_CREDITOS', 'VL_ESTORNOS_DEB', 'VL_SLD_CREDOR_ANT',
                               'VL_SLD_APURADO', 'VL_TOT_DED', 'VL_ICMS_RECOLHER',
                               'VL_SLD_CREDOR_TRANSPORTAR', 'DEB_ESP'];
                
                validationData.e110 = {
                    totalDebitos: parseFloat((campos[layout.indexOf('VL_TOT_DEBITOS')] || '0').replace(',', '.')),
                    ajustesDebitos: parseFloat((campos[layout.indexOf('VL_AJ_DEBITOS')] || '0').replace(',', '.')),
                    totalCreditos: parseFloat((campos[layout.indexOf('VL_TOT_CREDITOS')] || '0').replace(',', '.')),
                    ajustesCreditos: parseFloat((campos[layout.indexOf('VL_AJ_CREDITOS')] || '0').replace(',', '.')),
                    saldoCredorAnterior: parseFloat((campos[layout.indexOf('VL_SLD_CREDOR_ANT')] || '0').replace(',', '.')),
                    saldoApurado: parseFloat((campos[layout.indexOf('VL_SLD_APURADO')] || '0').replace(',', '.')),
                    icmsRecolher: parseFloat((campos[layout.indexOf('VL_ICMS_RECOLHER')] || '0').replace(',', '.')),
                    saldoCredorTransportar: parseFloat((campos[layout.indexOf('VL_SLD_CREDOR_TRANSPORTAR')] || '0').replace(',', '.'))
                };
                
                validationData.icmsApurado = validationData.e110.saldoApurado;
                validationData.icmsRecolher = validationData.e110.icmsRecolher;
                validationData.saldoCredorAnterior = validationData.e110.saldoCredorAnterior;
                validationData.saldoCredorTransportar = validationData.e110.saldoCredorTransportar;
                validationData.totalDebitos = validationData.e110.totalDebitos;
                validationData.totalCreditos = validationData.e110.totalCreditos;
            }
            
            // Extrair dados do E111 (Ajustes)
            if (registros.E111 && registros.E111.length > 0) {
                const layout = ['REG', 'COD_AJ_APUR', 'DESCR_COMPL_AJ', 'VL_AJ_APUR'];
                
                registros.E111.forEach(registro => {
                    const campos = registro.slice(1, -1);
                    const codigo = campos[layout.indexOf('COD_AJ_APUR')] || '';
                    const valor = parseFloat((campos[layout.indexOf('VL_AJ_APUR')] || '0').replace(',', '.'));
                    const descricao = campos[layout.indexOf('DESCR_COMPL_AJ')] || '';
                    
                    validationData.e111.push({
                        codigo: codigo,
                        valor: valor,
                        descricao: descricao
                    });
                    
                    // Identificar benefícios FOMENTAR (créditos)
                    if (codigo.includes('GO040007') || codigo.includes('GO040008') || 
                        codigo.includes('GO040009') || codigo.includes('GO040010')) {
                        validationData.beneficiosFomentar += Math.abs(valor);
                        
                        // Log para debug
                        console.log(`FOMENTAR encontrado no SPED: ${codigo} = R$ ${Math.abs(valor).toFixed(2)}`);
                    }
                    
                    // Identificar benefícios ProGoiás  
                    if (codigo.includes('GO020158')) {
                        validationData.beneficiosProgoias += Math.abs(valor);
                    }
                });
            }
            
            // Extrair dados do E115 (Demonstrativo ProGoiás) se existir
            if (registros.E115 && registros.E115.length > 0) {
                registros.E115.forEach(registro => {
                    const campos = registro.slice(1, -1);
                    // Layout do E115 pode variar, mas normalmente contém informações do ProGoiás
                    validationData.e115.push({
                        registro: campos.join('|')
                    });
                });
            }
            
        } catch (error) {
            addLog(`Erro ao extrair dados de validação do SPED: ${error.message}`, 'error');
        }
        
        // Log para debug
        console.log('Dados de validação SPED extraídos:', {
            icmsRecolher: validationData.icmsRecolher,
            beneficiosFomentar: validationData.beneficiosFomentar,
            totalE111: validationData.e111.length
        });
        
        return validationData;
    }
    
    function createValidationReport(calculatedValues, spedValidationData, periodo, nomeEmpresa) {
        const report = {
            periodo: periodo,
            empresa: nomeEmpresa,
            sistema: calculatedValues,
            sped: spedValidationData,
            diferencas: {},
            status: 'OK'
        };
        
        // Confrontar ICMS Apurado
        // Sistema: Item 28 (saldoPagarParcelaNaoFinanciada) + Item 41 (saldoPagarNaoIncentivadas)
        // Se for saldo credor: Item 31 (saldoCredorTransportarIncentivadas) + Item 44 (saldoCredorTransportarNaoIncentivadas)
        
        const item28 = calculatedValues.saldoPagarParcelaNaoFinanciada || 0;
        const item41 = calculatedValues.saldoPagarNaoIncentivadas || 0;
        const item31 = calculatedValues.saldoCredorTransportarIncentivadas || 0;
        const item44 = calculatedValues.saldoCredorTransportarNaoIncentivadas || 0;
        
        // Se há saldo a pagar, usar itens 28 + 41; se há saldo credor, usar itens 31 + 44
        const temSaldoPagar = (item28 + item41) > 0;
        const icmsApuradoSistema = temSaldoPagar ? (item28 + item41) : -(item31 + item44);
        
        // CORREÇÃO: VL_ICMS_RECOLHER já tem benefícios deduzidos, vamos usar VL_SLD_APURADO
        const icmsApuradoSped = spedValidationData.e110?.saldoApurado || spedValidationData.icmsRecolher || 0;
        const diferencaIcms = Math.abs(icmsApuradoSistema - icmsApuradoSped);
        
        report.diferencas.icmsApurado = {
            sistema: icmsApuradoSistema,
            sped: icmsApuradoSped,
            diferenca: diferencaIcms,
            percentual: icmsApuradoSped > 0 ? (diferencaIcms / icmsApuradoSped * 100) : 0,
            status: diferencaIcms < 0.01 ? 'OK' : 'DIVERGENTE',
            detalhes: {
                item28: item28,
                item41: item41,
                item31: item31,
                item44: item44,
                tipoSaldo: temSaldoPagar ? 'DEVEDOR' : 'CREDOR'
            }
        };
        
        // Confrontar Benefício FOMENTAR  
        // Sistema: Item 24 (Valor do Financiamento Concedido)
        const beneficioSistema = calculatedValues.icmsFinanciado || 0;
        const beneficioSped = spedValidationData.beneficiosFomentar || 0;
        const diferencaBeneficio = Math.abs(beneficioSistema - beneficioSped);
        
        report.diferencas.beneficioFomentar = {
            sistema: beneficioSistema,
            sped: beneficioSped,
            diferenca: diferencaBeneficio,
            percentual: beneficioSped > 0 ? (diferencaBeneficio / beneficioSped * 100) : 0,
            status: diferencaBeneficio < 0.01 ? 'OK' : 'DIVERGENTE',
            detalhes: {
                item24: beneficioSistema,
                codigoSped: 'GO040007'
            }
        };
        
        // Status geral do relatório
        if (report.diferencas.icmsApurado.status === 'DIVERGENTE' || 
            report.diferencas.beneficioFomentar.status === 'DIVERGENTE') {
            report.status = 'DIVERGENTE';
        }
        
        // Log para debug
        console.log(`Relatório de validação criado para ${periodo}:`, {
            icmsCalculado: icmsApuradoSistema,
            icmsSped: icmsApuradoSped,
            beneficioCalculado: beneficioSistema,
            beneficioSped: beneficioSped,
            status: report.status
        });
        
        return report;
    }
    
    function generateValidationHTML(validationReport) {
        let html = '<div class="validation-report">';
        html += `<h3>🔍 Relatório de Confronto - ${validationReport.periodo}</h3>`;
        html += `<p><strong>Empresa:</strong> ${validationReport.empresa}</p>`;
        html += `<p><strong>Status Geral:</strong> <span class="status-${validationReport.status.toLowerCase()}">${validationReport.status}</span></p>`;
        
        // Tabela de confronto
        html += '<table class="validation-table">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Item</th>';
        html += '<th>Sistema FOMENTAR</th>';
        html += '<th>SPED Oficial</th>';
        html += '<th>Diferença</th>';
        html += '<th>% Diferença</th>';
        html += '<th>Status</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        
        // ICMS Apurado
        const icms = validationReport.diferencas.icmsApurado;
        const tipoSaldo = icms.detalhes ? icms.detalhes.tipoSaldo : 'DEVEDOR';
        const descricaoIcms = tipoSaldo === 'DEVEDOR' 
            ? 'ICMS a Pagar (Itens 28+41)' 
            : 'Saldo Credor (Itens 31+44)';
        
        html += '<tr>';
        html += `<td><strong>${descricaoIcms}</strong></td>`;
        html += `<td>R$ ${formatCurrency(Math.abs(icms.sistema))}</td>`;
        html += `<td>R$ ${formatCurrency(Math.abs(icms.sped))}</td>`;
        html += `<td>R$ ${formatCurrency(icms.diferenca)}</td>`;
        html += `<td>${icms.percentual.toFixed(2)}%</td>`;
        html += `<td><span class="status-${icms.status.toLowerCase()}">${icms.status}</span></td>`;
        html += '</tr>';
        
        // Benefício FOMENTAR
        const beneficio = validationReport.diferencas.beneficioFomentar;
        html += '<tr>';
        html += '<td><strong>Benefício FOMENTAR (Item 24)</strong></td>';
        html += `<td>R$ ${formatCurrency(beneficio.sistema)}</td>`;
        html += `<td>R$ ${formatCurrency(beneficio.sped)}</td>`;
        html += `<td>R$ ${formatCurrency(beneficio.diferenca)}</td>`;
        html += `<td>${beneficio.percentual.toFixed(2)}%</td>`;
        html += `<td><span class="status-${beneficio.status.toLowerCase()}">${beneficio.status}</span></td>`;
        html += '</tr>';
        
        html += '</tbody>';
        html += '</table>';
        
        // Detalhes dos Itens do Demonstrativo
        html += '<h4>📋 Detalhes dos Itens do Demonstrativo</h4>';
        html += '<table class="sped-details-table">';
        
        if (icms.detalhes) {
            html += '<tr><td><strong>Item 28 - Saldo a Pagar Parcela Não Financiada:</strong></td><td>R$ ' + formatCurrency(icms.detalhes.item28) + '</td></tr>';
            html += '<tr><td><strong>Item 41 - Saldo a Pagar Operações Não Incentivadas:</strong></td><td>R$ ' + formatCurrency(icms.detalhes.item41) + '</td></tr>';
            html += '<tr><td><strong>Item 31 - Saldo Credor Transportar Incentivadas:</strong></td><td>R$ ' + formatCurrency(icms.detalhes.item31) + '</td></tr>';
            html += '<tr><td><strong>Item 44 - Saldo Credor Transportar Não Incentivadas:</strong></td><td>R$ ' + formatCurrency(icms.detalhes.item44) + '</td></tr>';
            html += '<tr><td><strong>Tipo de Saldo:</strong></td><td>' + icms.detalhes.tipoSaldo + '</td></tr>';
        }
        
        if (beneficio.detalhes) {
            html += '<tr><td><strong>Item 24 - Valor do Financiamento Concedido:</strong></td><td>R$ ' + formatCurrency(beneficio.detalhes.item24) + '</td></tr>';
            html += '<tr><td><strong>Código SPED Esperado:</strong></td><td>' + beneficio.detalhes.codigoSped + '</td></tr>';
        }
        
        html += '</table>';
        
        // Detalhes adicionais do SPED
        if (validationReport.sped.e110) {
            html += '<h4>📋 Detalhes da Apuração SPED (E110)</h4>';
            html += '<table class="sped-details-table">';
            html += '<tr><td>Total Débitos:</td><td>R$ ' + formatCurrency(validationReport.sped.e110.totalDebitos) + '</td></tr>';
            html += '<tr><td>Total Créditos:</td><td>R$ ' + formatCurrency(validationReport.sped.e110.totalCreditos) + '</td></tr>';
            html += '<tr><td>Saldo Apurado:</td><td>R$ ' + formatCurrency(validationReport.sped.e110.saldoApurado) + '</td></tr>';
            html += '<tr><td>ICMS a Recolher:</td><td>R$ ' + formatCurrency(validationReport.sped.e110.icmsRecolher) + '</td></tr>';
            html += '<tr><td>Saldo Credor Anterior:</td><td>R$ ' + formatCurrency(validationReport.sped.e110.saldoCredorAnterior) + '</td></tr>';
            html += '</table>';
        }
        
        // Ajustes E111 relevantes
        if (validationReport.sped.e111.length > 0) {
            html += '<h4>⚖️ Ajustes Relevantes (E111)</h4>';
            html += '<table class="e111-table">';
            html += '<thead><tr><th>Código</th><th>Valor</th><th>Descrição</th></tr></thead>';
            html += '<tbody>';
            
            validationReport.sped.e111.forEach(ajuste => {
                if (Math.abs(ajuste.valor) > 0.01) { // Mostrar apenas ajustes significativos
                    html += '<tr>';
                    html += `<td>${ajuste.codigo}</td>`;
                    html += `<td>R$ ${formatCurrency(Math.abs(ajuste.valor))}</td>`;
                    html += `<td>${ajuste.descricao}</td>`;
                    html += '</tr>';
                }
            });
            
            html += '</tbody></table>';
        }
        
        html += '</div>';
        return html;
    }
    
    // === FUNÇÕES DO RELATÓRIO DE CONFRONTO ===
    
    function showValidationReport() {
        const isMultiplePeriods = multiPeriodData.length > 1;
        
        if (isMultiplePeriods) {
            showMultiPeriodValidationReport();
        } else {
            showSinglePeriodValidationReport();
        }
    }
    
    function showSinglePeriodValidationReport() {
        if (!fomentarData) {
            addLog('Erro: Nenhum dado FOMENTAR disponível. Execute o cálculo primeiro.', 'error');
            return;
        }
        
        if (!fomentarData.validationReport) {
            addLog('Erro: Relatório de confronto não foi gerado. Verifique se o SPED contém registros E110/E111.', 'error');
            console.log('Debug fomentarData:', {
                hasSpedValidationData: !!fomentarData.spedValidationData,
                hasCalculatedValues: !!fomentarData.calculatedValues,
                hasValidationReport: !!fomentarData.validationReport
            });
            return;
        }
        
        const container = document.getElementById('validationReportContainer');
        const section = document.getElementById('validationReportSection');
        
        container.innerHTML = generateValidationHTML(fomentarData.validationReport);
        section.style.display = 'block';
        
        // Scroll para a seção do relatório
        section.scrollIntoView({ behavior: 'smooth' });
        
        addLog('Relatório de confronto SPED exibido', 'success');
    }
    
    function showMultiPeriodValidationReport() {
        if (multiPeriodData.length === 0) {
            addLog('Erro: Nenhum período processado para confronto', 'error');
            return;
        }
        
        const container = document.getElementById('validationReportContainer');
        const section = document.getElementById('validationReportSection');
        
        let html = '<div class="multi-validation-report">';
        html += '<h3>🔍 Relatório de Confronto Multi-Período</h3>';
        html += `<p><strong>Períodos analisados:</strong> ${multiPeriodData.map(p => p.periodo).join(', ')}</p>`;
        html += `<p><strong>Empresa:</strong> ${multiPeriodData[0].nomeEmpresa}</p>`;
        
        // Resumo geral
        let totalDivergencias = 0;
        let statusGeral = 'OK';
        
        multiPeriodData.forEach(period => {
            if (period.validationReport && period.validationReport.status === 'DIVERGENTE') {
                totalDivergencias++;
                statusGeral = 'DIVERGENTE';
            }
        });
        
        html += `<p><strong>Status Geral:</strong> <span class="status-${statusGeral.toLowerCase()}">${statusGeral}</span></p>`;
        html += `<p><strong>Períodos com Divergências:</strong> ${totalDivergencias} de ${multiPeriodData.length}</p>`;
        
        // Tabela comparativa multi-período
        html += '<table class="multi-validation-table">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Período</th>';
        html += '<th>ICMS Sistema</th>';
        html += '<th>ICMS SPED</th>';
        html += '<th>Dif. ICMS</th>';
        html += '<th>Benefício Sistema</th>';
        html += '<th>Benefício SPED</th>';
        html += '<th>Dif. Benefício</th>';
        html += '<th>Status</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        
        multiPeriodData.forEach(period => {
            if (period.validationReport) {
                const report = period.validationReport;
                const icms = report.diferencas.icmsApurado;
                const beneficio = report.diferencas.beneficioFomentar;
                
                html += '<tr>';
                html += `<td><strong>${period.periodo}</strong></td>`;
                html += `<td>R$ ${formatCurrency(icms.sistema)}</td>`;
                html += `<td>R$ ${formatCurrency(icms.sped)}</td>`;
                html += `<td class="${icms.status.toLowerCase()}">R$ ${formatCurrency(icms.diferenca)}</td>`;
                html += `<td>R$ ${formatCurrency(beneficio.sistema)}</td>`;
                html += `<td>R$ ${formatCurrency(beneficio.sped)}</td>`;
                html += `<td class="${beneficio.status.toLowerCase()}">R$ ${formatCurrency(beneficio.diferenca)}</td>`;
                html += `<td><span class="status-${report.status.toLowerCase()}">${report.status}</span></td>`;
                html += '</tr>';
            }
        });
        
        html += '</tbody>';
        html += '</table>';
        
        // Detalhes por período (apenas períodos com divergências)
        multiPeriodData.forEach(period => {
            if (period.validationReport && period.validationReport.status === 'DIVERGENTE') {
                html += `<div class="period-validation-details">`;
                html += `<h4>📋 Detalhes - ${period.periodo}</h4>`;
                html += generateValidationHTML(period.validationReport);
                html += `</div>`;
            }
        });
        
        html += '</div>';
        
        container.innerHTML = html;
        section.style.display = 'block';
        
        // Scroll para a seção do relatório
        section.scrollIntoView({ behavior: 'smooth' });
        
        addLog('Relatório de confronto multi-período exibido', 'success');
    }
    
    function hideValidationReport() {
        document.getElementById('validationReportSection').style.display = 'none';
        addLog('Relatório de confronto fechado', 'info');
    }
    
    async function exportValidationExcel() {
        const isMultiplePeriods = multiPeriodData.length > 1;
        
        try {
            const workbook = await XlsxPopulate.fromBlankAsync();
            const worksheet = workbook.sheet(0);
            worksheet.name('Confronto SPED vs Sistema');
            
            if (isMultiplePeriods) {
                await createMultiPeriodValidationExcel(worksheet);
            } else {
                await createSinglePeriodValidationExcel(worksheet);
            }
            
            const buffer = await workbook.outputAsync();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const fileName = isMultiplePeriods 
                ? `Confronto_SPED_MultiPeriodo_${new Date().toISOString().slice(0, 10)}.xlsx`
                : `Confronto_SPED_${sharedPeriodo.replace('/', '')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            
            addLog(`Relatório de confronto exportado: ${fileName}`, 'success');
            
        } catch (error) {
            addLog(`Erro ao exportar relatório de confronto: ${error.message}`, 'error');
        }
    }
    
    async function exportValidationPDF() {
        addLog('Função de exportação PDF em desenvolvimento', 'info');
    }
    
    async function createSinglePeriodValidationExcel(worksheet) {
        if (!fomentarData || !fomentarData.validationReport) {
            throw new Error('Nenhum relatório de confronto disponível');
        }
        
        const report = fomentarData.validationReport;
        
        // Cabeçalho
        worksheet.cell("A1").value("RELATÓRIO DE CONFRONTO SPED vs SISTEMA");
        worksheet.cell("A1").style('bold', true).style('fontSize', 14);
        
        worksheet.cell("A2").value(`Empresa: ${report.empresa}`);
        worksheet.cell("A3").value(`Período: ${report.periodo}`);
        worksheet.cell("A4").value(`Status: ${report.status}`);
        
        // Tabela de confronto
        worksheet.cell("A6").value("Item");
        worksheet.cell("B6").value("Sistema FOMENTAR");
        worksheet.cell("C6").value("SPED Oficial");
        worksheet.cell("D6").value("Diferença");
        worksheet.cell("E6").value("% Diferença");
        worksheet.cell("F6").value("Status");
        
        // Estilo do cabeçalho
        for (let col = 1; col <= 6; col++) {
            worksheet.cell(6, col).style('bold', true).style('fill', 'D7E4BC');
        }
        
        // Dados ICMS
        const icms = report.diferencas.icmsApurado;
        worksheet.cell("A7").value("ICMS Total a Recolher");
        worksheet.cell("B7").value(icms.sistema);
        worksheet.cell("C7").value(icms.sped);
        worksheet.cell("D7").value(icms.diferenca);
        worksheet.cell("E7").value(icms.percentual / 100); // Excel percentual format
        worksheet.cell("F7").value(icms.status);
        
        // Dados Benefício
        const beneficio = report.diferencas.beneficioFomentar;
        worksheet.cell("A8").value("Benefício FOMENTAR");
        worksheet.cell("B8").value(beneficio.sistema);
        worksheet.cell("C8").value(beneficio.sped);
        worksheet.cell("D8").value(beneficio.diferenca);
        worksheet.cell("E8").value(beneficio.percentual / 100);
        worksheet.cell("F8").value(beneficio.status);
        
        // Formatação de valores
        for (let row = 7; row <= 8; row++) {
            for (let col = 2; col <= 4; col++) {
                worksheet.cell(row, col).style('numberFormat', '#,##0.00');
            }
            worksheet.cell(row, 5).style('numberFormat', '0.00%');
        }
        
        // Detalhes do SPED
        if (report.sped.e110) {
            worksheet.cell("A11").value("DETALHES DA APURAÇÃO SPED (E110)");
            worksheet.cell("A11").style('bold', true);
            
            const e110 = report.sped.e110;
            worksheet.cell("A12").value("Total Débitos:");
            worksheet.cell("B12").value(e110.totalDebitos);
            worksheet.cell("A13").value("Total Créditos:");
            worksheet.cell("B13").value(e110.totalCreditos);
            worksheet.cell("A14").value("Saldo Apurado:");
            worksheet.cell("B14").value(e110.saldoApurado);
            worksheet.cell("A15").value("ICMS a Recolher:");
            worksheet.cell("B15").value(e110.icmsRecolher);
            
            for (let row = 12; row <= 15; row++) {
                worksheet.cell(row, 2).style('numberFormat', '#,##0.00');
            }
        }
    }
    
    async function createMultiPeriodValidationExcel(worksheet) {
        // Implementação da planilha multi-período
        worksheet.cell("A1").value("RELATÓRIO DE CONFRONTO MULTI-PERÍODO");
        worksheet.cell("A1").style('bold', true).style('fontSize', 14);
        
        worksheet.cell("A2").value(`Períodos: ${multiPeriodData.map(p => p.periodo).join(', ')}`);
        worksheet.cell("A3").value(`Empresa: ${multiPeriodData[0].nomeEmpresa}`);
        
        // Cabeçalhos da tabela
        const headers = ['Período', 'ICMS Sistema', 'ICMS SPED', 'Dif. ICMS', 'Benefício Sistema', 'Benefício SPED', 'Dif. Benefício', 'Status'];
        headers.forEach((header, index) => {
            worksheet.cell(5, index + 1).value(header);
            worksheet.cell(5, index + 1).style('bold', true).style('fill', 'D7E4BC');
        });
        
        // Dados de cada período
        multiPeriodData.forEach((period, index) => {
            const row = 6 + index;
            
            worksheet.cell(row, 1).value(period.periodo);
            
            if (period.validationReport) {
                const report = period.validationReport;
                const icms = report.diferencas.icmsApurado;
                const beneficio = report.diferencas.beneficioFomentar;
                
                worksheet.cell(row, 2).value(icms.sistema);
                worksheet.cell(row, 3).value(icms.sped);
                worksheet.cell(row, 4).value(icms.diferenca);
                worksheet.cell(row, 5).value(beneficio.sistema);
                worksheet.cell(row, 6).value(beneficio.sped);
                worksheet.cell(row, 7).value(beneficio.diferenca);
                worksheet.cell(row, 8).value(report.status);
                
                // Formatação
                for (let col = 2; col <= 7; col++) {
                    worksheet.cell(row, col).style('numberFormat', '#,##0.00');
                }
            }
        });
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
            { id: '3', desc: 'Percentual das Saídas das Operações Incentivadas (%)', field: 'percentualSaidasIncentivadas' },
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
        
        // Quadro B items - Todos os 44 itens conforme demonstrativo versão 3.51
        const quadroBItems = [
            { id: '11', desc: 'Débito do ICMS das Operações Incentivadas', field: 'debitoIncentivadas' },
            { id: '11.1', desc: 'Débito do ICMS das Saídas a Título de Bonificação ou Semelhante Incentivadas', field: 'debitoBonificacaoIncentivadas' },
            { id: '12', desc: 'Outros Débitos das Operações Incentivadas', field: 'outrosDebitosIncentivadas' },
            { id: '13', desc: 'Estorno de Créditos das Operações Incentivadas', field: 'estornoCreditosIncentivadas' },
            { id: '14', desc: 'Crédito para Operações Incentivadas', field: 'creditoOperacoesIncentivadas' },
            { id: '15', desc: 'Deduções das Operações Incentivadas', field: 'deducoesIncentivadas' },
            { id: '16', desc: 'Crédito Referente a Saldo Credor do Período das Operações Não Incentivadas', field: 'creditoSaldoCredorNaoIncentivadas' },
            { id: '17', desc: 'Saldo Devedor do ICMS das Operações Incentivadas', field: 'saldoDevedorIncentivadas' },
            { id: '18', desc: 'ICMS por Média', field: 'icmsPorMedia' },
            { id: '19', desc: 'Deduções/Compensações (64)', field: 'deducoesCompensacoes' },
            { id: '20', desc: 'Saldo do ICMS a Pagar por Média', field: 'saldoIcmsPagarPorMedia' },
            { id: '21', desc: 'ICMS Base para FOMENTAR/PRODUZIR', field: 'icmsBaseFomentar' },
            { id: '22', desc: 'Percentagem do Financiamento (%)', field: 'percentualFinanciamento' },
            { id: '23', desc: 'ICMS Sujeito a Financiamento', field: 'icmsSujeitoFinanciamento' },
            { id: '24', desc: 'ICMS Excedente Não Sujeito ao Incentivo', field: 'icmsExcedenteNaoSujeitoIncentivo' },
            { id: '25', desc: 'ICMS Financiado', field: 'icmsFinanciado' },
            { id: '26', desc: 'Saldo do ICMS da Parcela Não Financiada', field: 'parcelaNaoFinanciada' },
            { id: '27', desc: 'Compensação de Saldo Credor de Período Anterior (Parcela Não Financiada)', field: 'compensacaoSaldoCredorAnterior' },
            { id: '28', desc: 'Saldo do ICMS a Pagar da Parcela Não Financiada', field: 'saldoPagarParcelaNaoFinanciada' },
            { id: '29', desc: 'Saldo Credor do Período das Operações Incentivadas', field: 'saldoCredorPeriodoIncentivadas' },
            { id: '30', desc: 'Saldo Credor do Período Utilizado nas Operações Não Incentivadas', field: 'saldoCredorIncentUsadoNaoIncentivadas' },
            { id: '31', desc: 'Saldo Credor a Transportar para o Período Seguinte', field: 'saldoCredorTransportarIncentivadas' }
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
        
        // Quadro C items - Todos os itens conforme demonstrativo versão 3.51
        const quadroCItems = [
            { id: '32', desc: 'Débito do ICMS das Operações Não Incentivadas', field: 'debitoNaoIncentivadas' },
            { id: '33', desc: 'Outros Débitos das Operações Não Incentivadas', field: 'outrosDebitosNaoIncentivadas' },
            { id: '34', desc: 'Estorno de Créditos das Operações Não Incentivadas', field: 'estornoCreditosNaoIncentivadas' },
            { id: '35', desc: 'ICMS Excedente Não Sujeito ao Incentivo', field: 'icmsExcedenteNaoSujeitoIncentivo' },
            { id: '36', desc: 'Crédito para Operações Não Incentivadas', field: 'creditoOperacoesNaoIncentivadas' },
            { id: '37', desc: 'Deduções das Operações Não Incentivadas', field: 'deducoesNaoIncentivadas' },
            { id: '38', desc: 'Saldo Devedor Bruto das Operações Não Incentivadas', field: 'saldoDevedorBrutoNaoIncentivadas' },
            { id: '39', desc: 'Saldo Devedor das Operações Não Incentivadas', field: 'saldoDevedorNaoIncentivadas' },
            { id: '40', desc: 'Compensação de Saldo Credor de Período Anterior (Não Incentivadas)', field: 'compensacaoSaldoCredorAnteriorNaoIncentivadas' },
            { id: '41', desc: 'Saldo do ICMS a Pagar das Operações Não Incentivadas', field: 'saldoPagarNaoIncentivadas' },
            { id: '42', desc: 'Saldo Credor do Período das Operações Não Incentivadas', field: 'saldoCredorPeriodoNaoIncentivadas' },
            { id: '43', desc: 'Saldo Credor do Período Utilizado nas Operações Incentivadas', field: 'saldoCredorNaoIncentUsadoIncentivadas' },
            { id: '44', desc: 'Saldo Credor a Transportar para o Período Seguinte', field: 'saldoCredorTransportarNaoIncentivadas' }
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
            { desc: 'Total a Pagar - Operações Incentivadas', field: 'saldoPagarParcelaNaoFinanciada' },
            { desc: 'Total a Pagar - Operações Não Incentivadas', field: 'saldoPagarNaoIncentivadas' },
            { desc: 'Valor do Financiamento FOMENTAR', field: 'valorFinanciamento' },
            { desc: 'Total Geral a Pagar', field: 'totalGeralPagar' },
            { desc: 'Saldo Credor para Próximo Período', field: 'saldoCredorFinal' }
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
            { id: '3', desc: 'Percentual das Saídas das Operações Incentivadas (%)', field: 'percentualSaidasIncentivadas' },
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
            { desc: 'Total a Pagar - Operações Incentivadas', field: 'saldoPagarParcelaNaoFinanciada' },
            { desc: 'Total a Pagar - Operações Não Incentivadas', field: 'saldoPagarNaoIncentivadas' },
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
                
                // Processar dados imediatamente (igual ao FOMENTAR)
                processProgoisData_Internal(registros);
                
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
    
    function processProgoisData_Internal(registros) {
        try {
            addLog('Processando dados SPED para apuração ProGoiás...', 'info');
            
            // Armazenar dados para processamento posterior
            progoiasRegistrosCompletos = registros;
            
            // Validar se há dados suficientes para operações
            const temOperacoes = (registros.C190 && registros.C190.length > 0) ||
                               (registros.C590 && registros.C590.length > 0) ||
                               (registros.D190 && registros.D190.length > 0) ||
                               (registros.D590 && registros.D590.length > 0);
            
            if (!temOperacoes) {
                throw new Error('SPED não contém operações suficientes para apuração ProGoiás');
            }
            
            // CLAUDE-CONTEXT: Analisar códigos E111 imediatamente (igual ao FOMENTAR)
            const temCodigosParaCorrigir = analisarCodigosE111Progoias(registros, false);
            
            if (temCodigosParaCorrigir) {
                // Mostrar interface de correção e parar aqui
                addLog('Códigos de ajuste E111 encontrados. Verifique se há necessidade de correção antes de prosseguir.', 'warn');
                
                // Atualizar status
                document.getElementById('progoiasSpedStatus').textContent = 
                    `${registros.empresa || 'Empresa'} - ${registros.periodo || 'Período'} - Códigos E111 encontrados para correção`;
                document.getElementById('progoiasSpedStatus').style.color = '#FF6B35';
                
                return; // Parar aqui até o usuário decidir sobre as correções
            } else {
                // Não há códigos para corrigir, mostrar botão de processamento
                addLog('Nenhum código de ajuste E111 encontrado. Arquivo pronto para processamento.', 'info');
                
                // Atualizar status e mostrar botão de processamento
                document.getElementById('progoiasSpedStatus').textContent = 
                    `${registros.empresa || 'Empresa'} - ${registros.periodo || 'Período'} (Arquivo carregado)`;
                document.getElementById('progoiasSpedStatus').style.color = '#20e3b2';
                
                document.getElementById('processProgoisData').style.display = 'block';
                
                addLog('Arquivo SPED carregado com sucesso. Configure os parâmetros e clique em "Processar Apuração".', 'success');
            }
            
        } catch (error) {
            addLog(`Erro ao processar dados ProGoiás: ${error.message}`, 'error');
            document.getElementById('progoiasSpedStatus').textContent = `Erro: ${error.message}`;
            document.getElementById('progoiasSpedStatus').style.color = '#f857a6';
        }
    }
    
    function analisarCodigosE111Progoias(registros, isMultiple = false) {
        progoiasCodigosEncontrados = [];
        progoiasIsMultiplePeriods = isMultiple;
        
        if (isMultiple && Array.isArray(registros)) {
            // Múltiplos períodos
            registros.forEach((periodoData, index) => {
                if (periodoData.registros && periodoData.registros.E111) {
                    periodoData.registros.E111.forEach(registro => {
                        processarRegistroE111Progoias(registro, index, periodoData.periodo);
                    });
                }
            });
        } else {
            // Período único
            if (registros.E111) {
                registros.E111.forEach(registro => {
                    processarRegistroE111Progoias(registro, 0, 'Período único');
                });
            }
        }
        
        // Consolidar códigos para múltiplos períodos
        if (isMultiple) {
            const codigosConsolidados = new Map();
            
            progoiasCodigosEncontrados.forEach(codigo => {
                if (codigosConsolidados.has(codigo.codigo)) {
                    // Adicionar período ao código existente
                    const codigoExistente = codigosConsolidados.get(codigo.codigo);
                    if (codigo.periodos && codigo.periodos.length > 0) {
                        codigoExistente.periodos.push(...codigo.periodos);
                        codigoExistente.valor += codigo.valor;
                    }
                } else {
                    // Novo código
                    codigosConsolidados.set(codigo.codigo, { ...codigo });
                }
            });
            
            progoiasCodigosEncontrados = Array.from(codigosConsolidados.values());
        } else {
            // Para período único, apenas remover duplicatas simples
            const codigosUnicos = [];
            const codigosVistos = new Set();
            
            progoiasCodigosEncontrados.forEach(codigo => {
                if (!codigosVistos.has(codigo.codigo)) {
                    codigosVistos.add(codigo.codigo);
                    codigosUnicos.push(codigo);
                }
            });
            
            progoiasCodigosEncontrados = codigosUnicos;
        }
        
        // Exibir interface se houver códigos
        if (progoiasCodigosEncontrados.length > 0) {
            exibirCodigosParaCorrecaoProgoias();
        }
        
        return progoiasCodigosEncontrados.length > 0;
    }
    
    function processarRegistroE111Progoias(registro, periodoIndex, periodoNome) {
        const codAjuste = registro.COD_AJ || '';
        if (codAjuste) {
            // Verificar se já existe um código para este período
            const codigoExistente = progoiasCodigosEncontrados.find(c => c.codigo === codAjuste);
            
            if (codigoExistente) {
                // Adicionar período se não existir
                if (!codigoExistente.periodos.includes(periodoIndex)) {
                    codigoExistente.periodos.push(periodoIndex);
                    codigoExistente.valor += parseFloat(registro.VL_AJ) || 0;
                }
            } else {
                // Novo código
                const novoCodigo = {
                    codigo: codAjuste,
                    descricao: registro.DESCR_COMPL_AJ || 'Sem descrição',
                    valor: parseFloat(registro.VL_AJ) || 0,
                    periodos: [periodoIndex],
                    periodo: periodoNome,
                    aplicarTodos: true
                };
                progoiasCodigosEncontrados.push(novoCodigo);
            }
        }
    }
    
    function processProgoisData() {
        // Verificar se estamos no modo múltiplos períodos
        if (progoiasCurrentImportMode === 'multiple') {
            // Processar múltiplos SPEDs
            processProgoisMultipleSpeds();
            return;
        }
        
        // Para modo único, verificar se o arquivo foi carregado
        if (!progoiasRegistrosCompletos) {
            addLog('Nenhum arquivo SPED carregado para processar', 'error');
            return;
        }
        
        // CLAUDE-CONTEXT: Prosseguir direto com o cálculo (códigos E111 já foram verificados na importação)
        continuarCalculoProgoias();
    }
    
    function continuarCalculoProgoias() {
        // Processar período único
        try {
            addLog('Iniciando processamento da apuração ProGoiás...', 'info');
            
            // Aplicar correções se existirem
            if (Object.keys(progoiasCodigosCorrecao).length > 0) {
                aplicarCorrecoesAosRegistrosProgoias();
            }
            
            const calculoProgoias = calculateProgoias(progoiasRegistrosCompletos);
            progoiasData = calculoProgoias;
            
            // Atualizar interface
            updateProgoisUI(calculoProgoias);
            document.getElementById('progoiasResults').style.display = 'block';
            
            // Atualizar status
            document.getElementById('progoiasSpedStatus').textContent = 
                `${calculoProgoias.empresa} - ${calculoProgoias.periodo} (${calculoProgoias.totalOperacoes} operações processadas)`;
            
            addLog(`Apuração ProGoiás concluída com sucesso!`, 'success');
            
        } catch (error) {
            console.error('Erro ao processar apuração ProGoiás:', error);
            addLog(`Erro ao processar apuração ProGoiás: ${error.message}`, 'error');
            document.getElementById('progoiasResults').style.display = 'block';
        }
    }
    
    function calculateProgoias(registros) {
        // Obter percentual calculado ou usar default
        let percentualIncentivo = 64; // Default
        
        const opcaoCalculo = document.getElementById('progoiasOpcaoCalculo').value;
        switch(opcaoCalculo) {
            case 'ano':
                const anoFruicao = parseInt(document.getElementById('progoiasAnoFruicao').value);
                if (anoFruicao) {
                    percentualIncentivo = PROGOIAS_CONFIG.PERCENTUAIS_POR_ANO[anoFruicao] || 64;
                }
                break;
            case 'manual':
                const percentualManual = parseFloat(document.getElementById('progoiasPercentualManual').value);
                if (percentualManual && percentualManual > 0) {
                    percentualIncentivo = percentualManual;
                }
                break;
        }
        
        const config = {
            tipoEmpresa: document.getElementById('progoiasTipoEmpresa').value,
            opcaoCalculo: opcaoCalculo,
            percentualIncentivo: percentualIncentivo,
            icmsPorMedia: parseFloat(document.getElementById('progoiasIcmsPorMedia').value) || 0,
            saldoCredorAnterior: parseFloat(document.getElementById('progoiasSaldoCredorAnterior').value) || 0,
            ajustePeridoAnterior: parseFloat(document.getElementById('progoiasAjustePeriodoAnterior').value) || 0
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
            operacoes: operacoesClassificadas,
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
        
        // CÁLCULO CONFORME ESPECIFICAÇÃO CORRETA:
        // Base = ICMS Saídas Incentivadas + Outros Débitos (Anexo II) - ICMS Entradas Incentivadas - Outros Créditos (Anexo II) - Ajuste Período Anterior - Média ICMS
        // Base = GO100002 + GO100005 - GO100003 - GO100004 - GO100007 - GO100006
        const baseCalculoFormula = GO100002 + GO100005 - GO100003 - GO100004 - GO100007 - GO100006;
        
        // Se o resultado for positivo, essa é a base de cálculo. Se negativo, base = 0 e valor absoluto vai para próximo período
        let baseCalculo, ajusteProximoPeriodo;
        if (baseCalculoFormula > 0) {
            baseCalculo = baseCalculoFormula;
            ajusteProximoPeriodo = 0;
        } else {
            baseCalculo = 0;
            ajusteProximoPeriodo = Math.abs(baseCalculoFormula);
        }
        
        // GO100009 = Valor do Crédito Outorgado ProGoiás
        const GO100009 = baseCalculo > 0 ? baseCalculo * (GO100001 / 100) : 0;
        
        // GO100008 = Ajuste para Próximo Período (valor absoluto quando resultado for negativo)
        const GO100008 = ajusteProximoPeriodo;
        
        if (baseCalculo > 0) {
            addLog(`Base positiva: R$ ${formatCurrency(baseCalculo)} x ${GO100001}% = R$ ${formatCurrency(GO100009)}`, 'info');
        } else {
            addLog(`Resultado negativo: R$ ${formatCurrency(baseCalculoFormula)} - Base = 0, Ajuste Próximo Período = R$ ${formatCurrency(GO100008)}`, 'warn');
        }
        
        // Logs finais da ABA 1
        addLog(`=== RESULTADO ABA 1 ===`, 'info');
        addLog(`Fórmula CORRIGIDA: ${formatCurrency(GO100002)} + ${formatCurrency(GO100005)} - ${formatCurrency(GO100003)} - ${formatCurrency(GO100004)} - ${formatCurrency(GO100007)} - ${formatCurrency(GO100006)} = ${formatCurrency(baseCalculoFormula)}`, 'info');
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
        addLog(`DEBUG: updateProgoisUI chamada`, 'info');
        
        if (!dados) {
            addLog(`DEBUG: updateProgoisUI - dados está null/undefined`, 'warning');
            return;
        }
        
        addLog(`DEBUG: updateProgoisUI - dados recebidos com sucesso`, 'info');
        
        const { quadroA, quadroB, quadroC } = dados;
        
        if (!quadroA || !quadroB || !quadroC) {
            addLog(`DEBUG: updateProgoisUI - quadros faltando: A=${!!quadroA}, B=${!!quadroB}, C=${!!quadroC}`, 'warning');
            return;
        }
        
        addLog(`DEBUG: updateProgoisUI - todos os quadros presentes, atualizando interface`, 'info');
        
        // ABA 1 - CÁLCULO DO PROGOIÁS (conforme Progoias.xlsx)
        // Itens conforme estrutura da planilha oficial
        document.getElementById('progoiasItemA01').textContent = formatCurrency(quadroA.GO100002);   // ICMS Saídas Incentivadas
        document.getElementById('progoiasItemA02').textContent = formatCurrency(quadroA.GO100003);   // ICMS Entradas Incentivadas
        document.getElementById('progoiasItemA03').textContent = formatCurrency(quadroA.GO100004);   // Outros Créditos
        document.getElementById('progoiasItemA04').textContent = formatCurrency(quadroA.GO100005);   // Outros Débitos
        document.getElementById('progoiasItemA05').textContent = formatCurrency(quadroA.GO100007);   // Ajuste Período Anterior
        document.getElementById('progoiasItemA06').textContent = formatCurrency(quadroA.GO100006);   // Média
        document.getElementById('progoiasItemA07').textContent = formatCurrency(quadroA.baseCalculo); // Base de Cálculo
        document.getElementById('progoiasItemA08').textContent = quadroA.GO100001.toFixed(2) + '%';  // Percentual ProGoiás
        document.getElementById('progoiasItemA09').textContent = formatCurrency(quadroA.GO100009);   // Crédito Outorgado
        document.getElementById('progoiasItemA10').textContent = formatCurrency(quadroA.GO100008);   // Ajuste Próximo Período
        
        // ABA 2 - APURAÇÃO DO ICMS (conforme Progoias.xlsx)
        // Itens numerados conforme planilha de apuração
        document.getElementById('progoiasItemB13').textContent = formatCurrency(quadroB.item01_debitoIcms);        // 01. Débito ICMS
        document.getElementById('progoiasItemB14').textContent = formatCurrency(quadroB.item02_outrosDebitos);     // 02. Outros Débitos
        document.getElementById('progoiasItemB15').textContent = formatCurrency(quadroB.item03_estornoCreditos);   // 03. Estorno Créditos
        document.getElementById('progoiasItemB16').textContent = formatCurrency(quadroB.item04_totalDebitos);      // 04. Total Débitos
        document.getElementById('progoiasItemB17').textContent = formatCurrency(quadroB.item05_creditosEntradas);  // 05. Créditos Entradas
        document.getElementById('progoiasItemB18').textContent = formatCurrency(quadroB.item06_outrosCreditos);    // 06. Outros Créditos
        document.getElementById('progoiasItemB19').textContent = formatCurrency(quadroB.item09_creditoProgoias);   // 09. Crédito ProGoiás
        
        // DEMONSTRATIVO DETALHADO - VALORES E ICMS
        document.getElementById('progoiasItemC18').textContent = formatCurrency(quadroC.valorSaidasIncentivadas);    // Saídas Incentivadas - Valor
        document.getElementById('progoiasItemC19').textContent = formatCurrency(quadroC.valorSaidasNaoIncentivadas); // Saídas Não Incentivadas - Valor
        document.getElementById('progoiasItemC20').textContent = formatCurrency(quadroC.totalValorSaidas);           // Total Saídas - Valor
        document.getElementById('progoiasItemC21').textContent = formatCurrency(quadroC.valorEntradasIncentivadas);  // Entradas Incentivadas - Valor
        document.getElementById('progoiasItemC22').textContent = formatCurrency(quadroC.valorEntradasNaoIncentivadas); // Entradas Não Incentivadas - Valor
        document.getElementById('progoiasItemC23').textContent = formatCurrency(quadroC.totalValorEntradas);         // Total Entradas - Valor
        
        // ICMS das operações (se elementos existirem)
        const icmsElements = {
            'progoiasItemC18Icms': quadroC.icmsSaidasIncentivadas,
            'progoiasItemC19Icms': quadroC.icmsSaidasNaoIncentivadas,
            'progoiasItemC20Icms': quadroC.totalIcmsSaidas,
            'progoiasItemC21Icms': quadroC.icmsEntradasIncentivadas,
            'progoiasItemC22Icms': quadroC.icmsEntradasNaoIncentivadas,
            'progoiasItemC23Icms': quadroC.totalIcmsEntradas
        };
        
        Object.keys(icmsElements).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = formatCurrency(icmsElements[id]);
            }
        });
        
        // RESUMO PRINCIPAL - conforme planilha
        const elementos = {
            'progoiasIcmsDevido': quadroB.item13_icmsARecolher,   // ICMS a Recolher
            'progoiasValorProtege': quadroB.item14_valorProtege,  // PROTEGE
            'progoiasIcmsRecolher': quadroB.item15_icmsFinal,     // ICMS Final
            'progoiasEconomiaTotal': quadroB.economiaTotal        // Economia Total
        };
        
        // Atualizar elementos do resumo
        Object.keys(elementos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = 'R$ ' + formatCurrency(elementos[id]);
            }
        });
        
        // Status
        const statusElement = document.getElementById('progoiasSpedStatus');
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
        // Calcular percentual automaticamente baseado no período de fruição
        calculateProgoisPercentual();
        
        // Apenas indicar que as configurações mudaram
        if (progoiasRegistrosCompletos) {
            addLog('Configurações alteradas. Clique em "Processar Apuração" para recalcular.', 'info');
        }
    }
    
    function handleProgoisOpcaoCalculoChange() {
        const opcao = document.getElementById('progoiasOpcaoCalculo').value;
        
        // Ocultar todos os grupos primeiro
        document.getElementById('progoiasGrupoAno').style.display = 'none';
        document.getElementById('progoiasGrupoManual').style.display = 'none';
        
        // Limpar campos
        document.getElementById('progoiasAnoFruicao').value = '';
        document.getElementById('progoiasPercentualManual').value = '';
        document.getElementById('progoiasPercentualCalculado').value = '';
        
        // Mostrar grupo relevante
        switch(opcao) {
            case 'ano':
                document.getElementById('progoiasGrupoAno').style.display = 'block';
                break;
            case 'manual':
                document.getElementById('progoiasGrupoManual').style.display = 'block';
                break;
        }
        
        calculateProgoisPercentual();
    }
    
    function calculateProgoisPercentual() {
        const opcaoCalculo = document.getElementById('progoiasOpcaoCalculo').value;
        const percentualCalculadoField = document.getElementById('progoiasPercentualCalculado');
        
        let percentualFinal = null;
        let textoExplicativo = '';
        
        switch(opcaoCalculo) {
            case 'ano':
                const anoFruicao = parseInt(document.getElementById('progoiasAnoFruicao').value);
                if (anoFruicao) {
                    percentualFinal = PROGOIAS_CONFIG.PERCENTUAIS_POR_ANO[anoFruicao] || 64;
                    textoExplicativo = `${percentualFinal}% (${anoFruicao}º ano de fruição)`;
                    addLog(`Selecionado: ${percentualFinal}% para ${anoFruicao}º ano de fruição`, 'info');
                }
                break;
                
            case 'manual':
                const percentualManual = parseFloat(document.getElementById('progoiasPercentualManual').value);
                if (percentualManual && percentualManual > 0) {
                    percentualFinal = percentualManual;
                    textoExplicativo = `${percentualFinal}% (informado manualmente)`;
                    addLog(`Percentual manual: ${percentualFinal}%`, 'info');
                }
                break;
        }
        
        // Atualizar campo de resultado
        if (percentualFinal) {
            percentualCalculadoField.value = textoExplicativo;
        } else {
            percentualCalculadoField.value = '';
        }
    }
    
    async function exportProgoisReport() {
        if (!progoiasData) {
            alert('Nenhum dado ProGoiás para exportar. Importe um arquivo SPED primeiro.');
            return;
        }
        
        try {
            await generateProgoisExcel(progoiasData);
            addLog('Relatório ProGoiás exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar relatório ProGoiás:', error);
            addLog(`Erro ao exportar relatório ProGoiás: ${error.message}`, 'error');
        }
    }
    
    function printProgoisReport() {
        // Verificar se há dados (período único ou múltiplos períodos)
        const hasData = progoiasData || (progoiasMultiPeriodData && progoiasMultiPeriodData.length > 0);
        
        if (!hasData) {
            alert('Nenhum dado ProGoiás para imprimir. Importe um arquivo SPED primeiro.');
            return;
        }
        
        window.print();
    }
    
    async function generateProgoisExcel(dados) {
        // Implementar geração de Excel específica para ProGoiás
        // Similar ao generateFomentarExcel mas com layout ProGoiás
        const workbook = await XlsxPopulate.fromBlankAsync();
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
        
        // Adicionar aba de Memória de Cálculo
        const memoriaWorksheet = workbook.addSheet("Memória de Cálculo");
        let memoriaRow = 1;
        
        memoriaWorksheet.cell(`A${memoriaRow}`).value("MEMÓRIA DE CÁLCULO DETALHADA");
        memoriaWorksheet.cell(`A${memoriaRow + 1}`).value(`Empresa: ${dados.empresa}`);
        memoriaWorksheet.cell(`A${memoriaRow + 2}`).value(`Período: ${dados.periodo}`);
        memoriaRow += 4;
        
        // Cabeçalho da tabela
        memoriaWorksheet.cell(`A${memoriaRow}`).value("ORIGEM");
        memoriaWorksheet.cell(`B${memoriaRow}`).value("CÓDIGO");
        memoriaWorksheet.cell(`C${memoriaRow}`).value("DESCRIÇÃO");
        memoriaWorksheet.cell(`D${memoriaRow}`).value("TIPO");
        memoriaWorksheet.cell(`E${memoriaRow}`).value("VALOR");
        memoriaWorksheet.cell(`F${memoriaRow}`).value("INCENTIVADO");
        memoriaRow++;
        
        // Adicionar outros créditos
        if (dados.operacoes?.memoriaCalculo?.detalhesOutrosCreditos?.length > 0) {
            dados.operacoes.memoriaCalculo.detalhesOutrosCreditos.forEach(item => {
                memoriaWorksheet.cell(`A${memoriaRow}`).value(item.origem);
                memoriaWorksheet.cell(`B${memoriaRow}`).value(item.codigo);
                memoriaWorksheet.cell(`C${memoriaRow}`).value(item.descricao);
                memoriaWorksheet.cell(`D${memoriaRow}`).value(item.tipo);
                memoriaWorksheet.cell(`E${memoriaRow}`).value(item.valor);
                memoriaWorksheet.cell(`F${memoriaRow}`).value(item.incentivado ? "SIM" : "NÃO");
                memoriaRow++;
            });
        }
        
        // Adicionar outros débitos
        if (dados.operacoes?.memoriaCalculo?.detalhesOutrosDebitos?.length > 0) {
            dados.operacoes.memoriaCalculo.detalhesOutrosDebitos.forEach(item => {
                memoriaWorksheet.cell(`A${memoriaRow}`).value(item.origem);
                memoriaWorksheet.cell(`B${memoriaRow}`).value(item.codigo);
                memoriaWorksheet.cell(`C${memoriaRow}`).value(item.descricao);
                memoriaWorksheet.cell(`D${memoriaRow}`).value(item.tipo);
                memoriaWorksheet.cell(`E${memoriaRow}`).value(item.valor);
                memoriaWorksheet.cell(`F${memoriaRow}`).value(item.incentivado ? "SIM" : "NÃO");
                memoriaRow++;
            });
        }
        
        // Salvar arquivo
        const filename = `ProGoias_${dados.empresa}_${dados.periodo}.xlsx`;
        const blob = await workbook.outputAsync();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Funções auxiliares para múltiplos períodos e outras funcionalidades do ProGoiás
    
    function convertPeriodToSortable(periodo) {
        // Converter formatos como "01/2024", "2024-01", "012024" para "2024-01"
        if (!periodo) return '';
        
        const str = periodo.toString();
        
        // Formato MM/YYYY
        if (str.match(/^\d{2}\/\d{4}$/)) {
            const [mes, ano] = str.split('/');
            return `${ano}-${mes}`;
        }
        
        // Formato YYYY-MM
        if (str.match(/^\d{4}-\d{2}$/)) {
            return str;
        }
        
        // Formato MMYYYY (ex: 012024)
        if (str.match(/^\d{6}$/) && parseInt(str.substring(0, 2)) <= 12) {
            const mes = str.substring(0, 2);
            const ano = str.substring(2, 6);
            return `${ano}-${mes}`;
        }
        
        // Formato YYYYMM (ex: 202401)
        if (str.match(/^\d{6}$/) && parseInt(str.substring(0, 4)) > 1900) {
            const ano = str.substring(0, 4);
            const mes = str.substring(4, 6);
            return `${ano}-${mes}`;
        }
        
        return str; // Retornar como está se não reconhecer formato
    }
    
    function calculateAutomaticAdjustments() {
        addLog('Calculando ajustes automáticos entre períodos...', 'info');
        
        for (let i = 0; i < progoiasMultiPeriodData.length; i++) {
            const currentPeriod = progoiasMultiPeriodData[i];
            
            // Ajuste Período Anterior (GO100007)
            if (i > 0) {
                const previousPeriod = progoiasMultiPeriodData[i - 1];
                const ajustePeriodoAnterior = previousPeriod.calculo?.quadroA?.GO100008 || 0;
                
                if (currentPeriod.calculo?.quadroA) {
                    currentPeriod.calculo.quadroA.GO100007 = ajustePeriodoAnterior;
                    addLog(`Período ${currentPeriod.periodo}: Ajuste Período Anterior = R$ ${ajustePeriodoAnterior.toFixed(2)}`, 'info');
                }
            } else {
                // Primeiro período não tem ajuste anterior
                if (currentPeriod.calculo?.quadroA) {
                    currentPeriod.calculo.quadroA.GO100007 = 0;
                }
            }
            
            // Ajuste Próximo Período (GO100008)
            if (i < progoiasMultiPeriodData.length - 1) {
                // Calcular ajuste baseado no crédito outorgado atual
                const creditoOutorgado = currentPeriod.calculo?.quadroA?.GO100009 || 0;
                const baseCalculo = currentPeriod.calculo?.quadroA?.baseCalculo || 0;
                
                // Regra: Se crédito outorgado excede 73% da base de cálculo, o excesso vai para próximo período
                const limiteCredito = baseCalculo * 0.73;
                const ajusteProximoPeriodo = Math.max(0, creditoOutorgado - limiteCredito);
                
                if (currentPeriod.calculo?.quadroA) {
                    currentPeriod.calculo.quadroA.GO100008 = ajusteProximoPeriodo;
                    addLog(`Período ${currentPeriod.periodo}: Ajuste Próximo Período = R$ ${ajusteProximoPeriodo.toFixed(2)}`, 'info');
                }
            } else {
                // Último período não tem ajuste para próximo
                if (currentPeriod.calculo?.quadroA) {
                    currentPeriod.calculo.quadroA.GO100008 = 0;
                }
            }
            
            // Recalcular base de cálculo considerando ajustes
            if (currentPeriod.calculo?.quadroA) {
                const quadroA = currentPeriod.calculo.quadroA;
                // FÓRMULA CORRIGIDA IGUAL AO PERÍODO ÚNICO:
                // Base = ICMS Saídas Incentivadas + Outros Débitos (Anexo II) - ICMS Entradas Incentivadas - Outros Créditos (Anexo II) - Ajuste Período Anterior - Média ICMS
                const baseCalculoFormula = (quadroA.GO100002 || 0) + 
                                         (quadroA.GO100005 || 0) - 
                                         (quadroA.GO100003 || 0) - 
                                         (quadroA.GO100004 || 0) - 
                                         (quadroA.GO100007 || 0) - 
                                         (quadroA.GO100006 || 0);
                
                // Se o resultado for positivo, essa é a base de cálculo. Se negativo, base = 0 e valor absoluto vai para próximo período
                if (baseCalculoFormula > 0) {
                    quadroA.baseCalculo = baseCalculoFormula;
                    quadroA.GO100008 = 0; // Sem ajuste para próximo período
                } else {
                    quadroA.baseCalculo = 0;
                    quadroA.GO100008 = Math.abs(baseCalculoFormula); // Valor absoluto para próximo período
                }
                
                // Recalcular crédito outorgado (igual ao período único)
                const percentualPrograma = quadroA.GO100001 || 0;
                quadroA.GO100009 = quadroA.baseCalculo > 0 ? quadroA.baseCalculo * (percentualPrograma / 100) : 0;
            }
        }
        
        addLog(`Ajustes automáticos calculados para ${progoiasMultiPeriodData.length} períodos`, 'success');
    }
    
    function handleProgoisImportModeChange(event) {
        progoiasCurrentImportMode = event.target.value;
        
        if (progoiasCurrentImportMode === 'single') {
            document.getElementById('singleImportSectionProgoias').style.display = 'block';
            document.getElementById('multipleImportSectionProgoias').style.display = 'none';
            document.getElementById('progoiasSingleConfig').style.display = 'block';
            document.getElementById('progoiasMultipleConfig').style.display = 'none';
            document.getElementById('processProgoisData').style.display = 'none';
        } else {
            document.getElementById('singleImportSectionProgoias').style.display = 'none';
            document.getElementById('multipleImportSectionProgoias').style.display = 'block';
            document.getElementById('progoiasSingleConfig').style.display = 'none';
            document.getElementById('progoiasMultipleConfig').style.display = 'block';
        }
        
        addLog(`ProGoiás - Modo alterado para: ${progoiasCurrentImportMode === 'single' ? 'Período Único' : 'Múltiplos Períodos'}`, 'info');
    }
    
    function handleProgoisMultipleConfigChange() {
        // Validar se início de fruição está preenchido para mostrar preview dos percentuais
        const mesInicio = document.getElementById('progoiasMultipleMesInicio').value;
        const anoInicio = parseInt(document.getElementById('progoiasMultipleAnoInicio').value);
        
        if (mesInicio && anoInicio) {
            addLog(`Configuração de múltiplos períodos: início da fruição definido para ${mesInicio}/${anoInicio}`, 'info');
            addLog('✓ Percentuais serão calculados automaticamente para cada período baseado no tempo de fruição', 'success');
        } else if (progoiasMultiPeriodData && progoiasMultiPeriodData.length > 0) {
            addLog('⚠️ Início de fruição não informado - será usado percentual padrão (1º ano - 64%)', 'warning');
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
        
        // Configurar interface durante processamento
        const processButton = document.getElementById('processProgoisData');
        const progressSection = document.getElementById('progoiasProgressSection');
        const progressBar = document.getElementById('progoiasProgressBar');
        const progressMessage = document.getElementById('progoiasProgressMessage');
        
        const originalButtonText = processButton.innerHTML;
        processButton.disabled = true;
        processButton.innerHTML = '<span class="btn-icon">⏳</span> Processando...';
        
        // Mostrar barra de progresso
        progressSection.style.display = 'block';
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        progressMessage.textContent = 'Iniciando processamento...';
        
        addLog('Iniciando processamento de múltiplos SPEDs para ProGoiás...', 'info');
        progoiasMultiPeriodData = [];
        
        // Process each file with delay to prevent UI blocking
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progressPercent = Math.round(((i + 1) / files.length) * 100);
            
            // Atualizar barra de progresso
            progressBar.style.width = `${progressPercent}%`;
            progressBar.textContent = `${progressPercent}%`;
            progressMessage.textContent = `Processando ${file.name} (${i + 1}/${files.length})`;
            
            addLog(`Processando arquivo ProGoiás ${i + 1}/${files.length} (${progressPercent}%): ${file.name}`, 'info');
            
            try {
                const fileContent = await readFileContent(file);
                
                // Reduzir delay para melhorar velocidade
                await new Promise(resolve => setTimeout(resolve, 50));
                
                const periodData = await processProgoisSingleSpedForPeriod(fileContent, file.name);
                progoiasMultiPeriodData.push(periodData);
                
                // Update file item with period info
                const fileItems = document.querySelectorAll('#multipleSpedListProgoias .file-item');
                if (fileItems[i]) {
                    fileItems[i].innerHTML = `${file.name}<br><small>Período: ${periodData.periodo} - ${periodData.anoFruicao}º ano</small>`;
                    fileItems[i].style.backgroundColor = '#e8f5e8'; // Verde claro para sucesso
                }
                
                addLog(`✅ Arquivo ${file.name} processado com sucesso`, 'success');
                
            } catch (error) {
                console.error(`Erro detalhado ao processar ${file.name}:`, error);
                console.error('Stack trace:', error.stack);
                addLog(`❌ ERRO DETALHADO ao processar ProGoiás ${file.name}:`, 'error');
                addLog(`Mensagem: ${error.message}`, 'error');
                addLog(`Tipo: ${error.name}`, 'error');
                if (error.stack) {
                    addLog(`Stack: ${error.stack.substring(0, 200)}...`, 'error');
                }
                
                // Marcar arquivo com erro
                const fileItems = document.querySelectorAll('#multipleSpedListProgoias .file-item');
                if (fileItems[i]) {
                    fileItems[i].style.backgroundColor = '#ffebee'; // Vermelho claro para erro
                    fileItems[i].innerHTML += `<br><small style="color: red;">❌ Erro: ${error.message}</small>`;
                }
            }
            
            // Allow UI to update - menor delay
            await new Promise(resolve => setTimeout(resolve, 25));
        }
        
        // Sort by period chronologically
        progoiasMultiPeriodData.sort((a, b) => {
            // Converter período para formato comparable (YYYY-MM)
            const periodA = convertPeriodToSortable(a.periodo);
            const periodB = convertPeriodToSortable(b.periodo);
            
            if (periodA < periodB) return -1;
            if (periodA > periodB) return 1;
            return 0;
        });
        
        // Calcular ajustes automáticos após ordenação
        calculateAutomaticAdjustments();
        
        // Finalizar processamento
        progressBar.style.width = '100%';
        progressBar.textContent = '100%';
        progressMessage.textContent = 'Processamento concluído!';
        
        // Restaurar botão original após pequeno delay
        setTimeout(() => {
            processButton.disabled = false;
            processButton.innerHTML = originalButtonText;
            progressSection.style.display = 'none';
        }, 2000);
        
        if (progoiasMultiPeriodData.length > 0) {
            // CLAUDE-CONTEXT: Analisar códigos E111 para múltiplos períodos (igual ao FOMENTAR)
            const temCodigosParaCorrigir = analisarCodigosE111Progoias(progoiasMultiPeriodData, true);
            
            if (temCodigosParaCorrigir) {
                // Mostrar interface de correção e parar aqui
                addLog('Códigos de ajuste E111 encontrados em múltiplos períodos. Verifique se há necessidade de correção antes de prosseguir.', 'warn');
                return; // Parar aqui até o usuário decidir sobre as correções
            } else {
                // Não há códigos para corrigir, prosseguir diretamente
                addLog('Nenhum código de ajuste E111 encontrado. Prosseguindo com cálculo...', 'info');
                continuarCalculoProgoisMultiplos();
            }
        } else {
            addLog('❌ Nenhum período foi processado com sucesso', 'error');
        }
    }
    
    async function processProgoisSingleSpedForPeriod(content, filename) {
        return new Promise((resolve, reject) => {
            try {
                addLog(`DEBUG: Processando arquivo ${filename}`, 'info');
                
                addLog(`DEBUG: Iniciando lerArquivoSpedCompleto para ${filename}`, 'info');
                const registros = lerArquivoSpedCompleto(content);
                addLog(`DEBUG: lerArquivoSpedCompleto concluído para ${filename}`, 'info');
                
                if (!registros || Object.keys(registros).length === 0) {
                    throw new Error('SPED não contém dados válidos');
                }
                
                // Extrair dados da empresa e período
                addLog(`DEBUG: Extraindo dados da empresa para ${filename}`, 'info');
                const dadosEmpresa = extrairDadosEmpresa(registros);
                
                // Adicionar dados extraídos ao objeto registros
                registros.empresa = dadosEmpresa.nome;
                registros.periodo = dadosEmpresa.periodo;
                
                addLog(`DEBUG: Registros carregados para ${filename} - empresa: ${registros.empresa}, período: ${registros.periodo}`, 'info');
                
                // Calcular ano de fruição baseado no período do SPED e configuração
                addLog(`DEBUG: Calculando ano de fruição para período ${registros.periodo}`, 'info');
                const config = getProgoisMultipleConfig();
                const calculoPercentual = calculateProgoisPercentualForPeriod(
                    registros.periodo, 
                    config.mesInicioFruicao, 
                    config.anoInicioFruicao
                );
                const anoFruicao = calculoPercentual.anoFruicao;
                addLog(`DEBUG: Ano de fruição calculado: ${anoFruicao} (${calculoPercentual.percentual}%)`, 'info');
                
                addLog(`DEBUG: Iniciando cálculo ProGoiás para ${filename}`, 'info');
                const calculoProgoias = calculateProgoisWithFruitionYear(registros, anoFruicao);
                addLog(`DEBUG: Cálculo ProGoiás concluído para ${filename}`, 'info');
                
                resolve({
                    filename: filename,
                    empresa: registros.empresa || 'Empresa',
                    periodo: registros.periodo || 'Período',
                    anoFruicao: anoFruicao,
                    registros: registros,
                    calculo: calculoProgoias
                });
                
            } catch (error) {
                addLog(`DEBUG: Erro em processProgoisSingleSpedForPeriod para ${filename}: ${error.message}`, 'error');
                console.error(`Erro em processProgoisSingleSpedForPeriod para ${filename}:`, error);
                reject(error);
            }
        });
    }
    
    function calculateProgoisFruitionYear(periodoSped) {
        try {
            addLog(`DEBUG: calculateProgoisFruitionYear chamada com período: ${periodoSped}`, 'info');
            
            // Verificar se o período foi fornecido
            if (!periodoSped || periodoSped === undefined || periodoSped === null) {
                addLog(`DEBUG: Período SPED está undefined/null, usando 1º ano como padrão`, 'warning');
                return 1;
            }
            
            // Obter configurações do período inicial
            const mesInicialElement = document.getElementById('progoiasPeriodoInicialMes');
            const anoInicialElement = document.getElementById('progoiasPeriodoInicialAno');
            
            if (!mesInicialElement || !anoInicialElement) {
                throw new Error('Elementos de configuração de período inicial não encontrados na página');
            }
            
            const mesInicial = parseInt(mesInicialElement.value);
            const anoInicial = parseInt(anoInicialElement.value);
            
            addLog(`DEBUG: Período inicial configurado: ${mesInicial}/${anoInicial}`, 'info');
            
            // Extrair mês e ano do período do SPED (formato esperado: MM/YYYY)
            let mesSped, anoSped;
            
            if (periodoSped.includes('/')) {
                // Formato MM/YYYY (formato padrão da função extrairDadosEmpresa)
                const parts = periodoSped.split('/');
                mesSped = parseInt(parts[0]);
                anoSped = parseInt(parts[1]);
                addLog(`DEBUG: Formato MM/YYYY detectado: ${mesSped}/${anoSped}`, 'info');
            } else if (periodoSped.length === 6) {
                // Formato MMYYYY (alternativo)
                mesSped = parseInt(periodoSped.substring(0, 2));
                anoSped = parseInt(periodoSped.substring(2, 6));
                addLog(`DEBUG: Formato MMYYYY detectado: ${mesSped}/${anoSped}`, 'info');
            } else {
                // Tentar outros formatos
                addLog(`DEBUG: Tentando detectar formato do período: ${periodoSped}`, 'info');
                
                // Se o período contém números, tentar extrair
                const numerosPeriodo = periodoSped.replace(/\D/g, '');
                if (numerosPeriodo.length >= 6) {
                    mesSped = parseInt(numerosPeriodo.substring(0, 2));
                    anoSped = parseInt(numerosPeriodo.substring(2, 6));
                    addLog(`DEBUG: Formato numérico detectado: ${mesSped}/${anoSped}`, 'info');
                } else {
                    addLog(`Formato de período não reconhecido: ${periodoSped}. Assumindo 1º ano.`, 'warning');
                    return 1;
                }
            }
            
            // Validar valores extraídos
            if (isNaN(mesSped) || isNaN(anoSped) || mesSped < 1 || mesSped > 12 || anoSped < 2020 || anoSped > 2030) {
                addLog(`DEBUG: Valores de período inválidos: mês=${mesSped}, ano=${anoSped}. Assumindo 1º ano.`, 'warning');
                return 1;
            }
            
            // Calcular diferença em meses
            const periodoInicialTotal = anoInicial * 12 + mesInicial;
            const periodoSpedTotal = anoSped * 12 + mesSped;
            
            const diferencaMeses = periodoSpedTotal - periodoInicialTotal;
            addLog(`DEBUG: Diferença em meses: ${diferencaMeses}`, 'info');
            
            // Determinar ano de fruição
            if (diferencaMeses < 0) {
                addLog(`Período do SPED (${periodoSped}) é anterior ao início da fruição (${mesInicial}/${anoInicial}). Assumindo 1º ano.`, 'warning');
                return 1;
            }
            
            const anoFruicao = Math.floor(diferencaMeses / 12) + 1;
            
            // Limitar ao máximo de 3 anos (3º ano ou mais)
            const anoFruicaoFinal = Math.min(anoFruicao, 3);
            
            addLog(`DEBUG: Ano de fruição calculado: ${anoFruicaoFinal}`, 'info');
            
            return anoFruicaoFinal;
            
        } catch (error) {
            addLog(`DEBUG: Erro em calculateProgoisFruitionYear: ${error.message}`, 'error');
            console.error('Erro em calculateProgoisFruitionYear:', error);
            // Em caso de erro, retornar 1º ano como fallback
            return 1;
        }
    }
    
    function calculateProgoisWithFruitionYear(registros, anoFruicao) {
        try {
            addLog(`DEBUG: calculateProgoisWithFruitionYear chamada com ano ${anoFruicao}`, 'info');
            
            // Criar configuração específica para este cálculo
            const config = getProgoisMultipleConfig();
            
            // Calcular percentual baseado no ano de fruição informado
            const percentualIncentivo = PROGOIAS_CONFIG.PERCENTUAIS_POR_ANO[anoFruicao] || 64;
            config.percentualIncentivo = percentualIncentivo;
            
            addLog(`DEBUG: Usando percentual ${percentualIncentivo}% para ano ${anoFruicao}`, 'info');
            
            // Classificar operações
            const operacoesClassificadas = classifyOperations(registros);
            
            // Calcular ProGoiás
            const quadroA = calculateProgoisApuracao(operacoesClassificadas, config);
            const quadroB = calculateIcmsComProgoias(quadroA, operacoesClassificadas, config);
            
            const resultado = {
                quadroA: quadroA,
                quadroB: quadroB,
                operacoes: operacoesClassificadas,
                empresa: registros.empresa || 'Empresa',
                periodo: registros.periodo,
                anoFruicaoCalculado: anoFruicao,
                percentualUtilizado: percentualIncentivo
            };
            
            addLog(`DEBUG: calculateProgoias concluído com sucesso`, 'info');
            return resultado;
        } catch (error) {
            addLog(`DEBUG: Erro em calculateProgoisWithFruitionYear: ${error.message}`, 'error');
            console.error('Erro em calculateProgoisWithFruitionYear:', error);
            throw error;
        }
    }
    
    function getProgoisMultipleConfig() {
        return {
            tipoEmpresa: document.getElementById('progoiasMultipleTipoEmpresa').value,
            mesInicioFruicao: document.getElementById('progoiasMultipleMesInicio').value,
            anoInicioFruicao: parseInt(document.getElementById('progoiasMultipleAnoInicio').value) || null,
            icmsPorMedia: parseFloat(document.getElementById('progoiasMultipleIcmsPorMedia').value) || 0,
            saldoCredorAnterior: parseFloat(document.getElementById('progoiasMultipleSaldoCredor').value) || 0,
            ajustePeridoAnterior: parseFloat(document.getElementById('progoiasMultipleAjustePeriodoAnterior').value) || 0
        };
    }
    
    function calculateProgoisPercentualForPeriod(periodoSped, inicioFruicaoMes, inicioFruicaoAno) {
        try {
            if (!inicioFruicaoMes || !inicioFruicaoAno || !periodoSped) {
                // Se não há início de fruição, usar 1º ano como padrão
                return { anoFruicao: 1, percentual: 64 };
            }
            
            // Extrair ano e mês do período SPED (formato: "MM/AAAA")
            const [mesSped, anoSped] = periodoSped.split('/').map(Number);
            
            if (!mesSped || !anoSped) {
                return { anoFruicao: 1, percentual: 64 };
            }
            
            // Calcular diferença em meses
            const inicioFruicao = new Date(inicioFruicaoAno, inicioFruicaoMes - 1, 1);
            const periodoCalculo = new Date(anoSped, mesSped - 1, 1);
            
            const diffTime = periodoCalculo.getTime() - inicioFruicao.getTime();
            const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
            
            let anoFruicao;
            if (diffMonths <= 12) {
                anoFruicao = 1;
            } else if (diffMonths <= 24) {
                anoFruicao = 2;
            } else {
                anoFruicao = 3;
            }
            
            const percentual = PROGOIAS_CONFIG.PERCENTUAIS_POR_ANO[anoFruicao] || 64;
            
            return { anoFruicao, percentual };
        } catch (error) {
            console.error('Erro ao calcular percentual para período:', error);
            return { anoFruicao: 1, percentual: 64 };
        }
    }
    
    function updateProgoisMultiplePeriodUI() {
        addLog(`DEBUG: updateProgoisMultiplePeriodUI chamada com ${progoiasMultiPeriodData.length} períodos`, 'info');
        
        // Show results section first
        document.getElementById('progoiasResults').style.display = 'block';
        addLog(`DEBUG: progoiasResults section mostrada`, 'info');
        
        // Show periods selector
        document.getElementById('progoiasPeriodsSelector').style.display = 'block';
        addLog(`DEBUG: progoiasPeriodsSelector mostrado`, 'info');
        
        // Create period buttons
        const periodsButtonsContainer = document.getElementById('progoiasPeriodsButtons');
        periodsButtonsContainer.innerHTML = '';
        
        progoiasMultiPeriodData.forEach((periodData, index) => {
            const button = document.createElement('button');
            button.className = 'btn-style btn-small period-button';
            button.innerHTML = `${periodData.periodo}<br><small>${periodData.anoFruicao}º ano</small>`;
            button.onclick = () => {
                progoiasSelectedPeriodIndex = index;
                updateProgoisSinglePeriodView();
                
                // Update active button
                document.querySelectorAll('#progoiasPeriodsButtons .period-button').forEach(btn => {
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
        progoiasSelectedPeriodIndex = 0;
        updateProgoisSinglePeriodView();
        
        // Show export buttons for multiple periods
        document.getElementById('exportProgoisComparative').style.display = 'inline-block';
        document.getElementById('exportProgoisPDF').style.display = 'inline-block';
    }
    
    function updateProgoisSinglePeriodView() {
        addLog(`DEBUG: updateProgoisSinglePeriodView chamada`, 'info');
        
        if (progoiasMultiPeriodData.length === 0) {
            addLog(`DEBUG: Nenhum dado de período disponível`, 'warning');
            return;
        }
        
        const periodData = progoiasMultiPeriodData[progoiasSelectedPeriodIndex];
        if (!periodData) {
            addLog(`DEBUG: Dados do período ${progoiasSelectedPeriodIndex} não encontrados`, 'warning');
            return;
        }
        
        addLog(`DEBUG: Atualizando UI para período ${periodData.periodo}`, 'info');
        
        // Update UI with selected period data
        addLog(`DEBUG: Dados do período para UI:`, 'info');
        addLog(`DEBUG: - Período: ${periodData.periodo}`, 'info');
        addLog(`DEBUG: - Ano fruição: ${periodData.anoFruicao}`, 'info');
        addLog(`DEBUG: - Cálculo disponível: ${!!periodData.calculo}`, 'info');
        
        if (periodData.calculo) {
            addLog(`DEBUG: - Quadro A: ${!!periodData.calculo.quadroA}`, 'info');
            addLog(`DEBUG: - Quadro B: ${!!periodData.calculo.quadroB}`, 'info');
            addLog(`DEBUG: - Quadro C: ${!!periodData.calculo.quadroC}`, 'info');
        }
        
        updateProgoisUI(periodData.calculo);
        addLog(`DEBUG: UI atualizada com sucesso`, 'info');
    }
    
    function switchProgoisView(view) {
        // Update active button
        document.querySelectorAll('#progoiasPeriodsSelector .view-options .btn-style').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (view === 'single') {
            document.getElementById('progoiasViewSinglePeriod').classList.add('active');
            updateProgoisSinglePeriodView();
            addLog('Visualização individual ativada para ProGoiás', 'info');
        } else if (view === 'comparative') {
            document.getElementById('progoiasViewComparative').classList.add('active');
            updateProgoisComparativeView();
            addLog('Visualização comparativa ativada para ProGoiás', 'info');
        }
    }
    
    function updateProgoisComparativeView() {
        if (progoiasMultiPeriodData.length < 2) {
            addLog('Necessários pelo menos 2 períodos para visualização comparativa', 'warning');
            return;
        }
        
        addLog('Gerando visualização comparativa ProGoiás...', 'info');
        
        // Criar estrutura baseada na visão única mas com períodos em colunas
        const periodsSelector = document.getElementById('progoiasPeriodsSelector');
        
        // Criar cabeçalho da tabela comparativa com períodos como colunas
        const headerCols = progoiasMultiPeriodData.map(period => 
            `<th>${period.periodo}<br><small>${period.anoFruicao}º ano</small></th>`
        ).join('');
        
        // Rubricas da ABA 1 - CÁLCULO DO PROGOIÁS
        const quadroARows = [
            { id: 'progoiasItemA01', desc: 'ICMS Saídas Incentivadas', field: 'GO100002' },
            { id: 'progoiasItemA02', desc: 'ICMS Entradas Incentivadas', field: 'GO100003' },
            { id: 'progoiasItemA03', desc: 'Outros Créditos (Anexo II)', field: 'GO100004' },
            { id: 'progoiasItemA04', desc: 'Outros Débitos (Anexo II)', field: 'GO100005' },
            { id: 'progoiasItemA05', desc: 'Ajuste Período Anterior', field: 'GO100007' },
            { id: 'progoiasItemA06', desc: 'Média ICMS', field: 'GO100006' },
            { id: 'progoiasItemA07', desc: 'Base de Cálculo', field: 'baseCalculo' },
            { id: 'progoiasItemA08', desc: 'Percentual ProGoiás (%)', field: 'GO100001' },
            { id: 'progoiasItemA09', desc: 'Crédito Outorgado ProGoiás', field: 'GO100009' },
            { id: 'progoiasItemA10', desc: 'Ajuste Próximo Período', field: 'GO100008' }
        ];
        
        // Rubricas da ABA 2 - APURAÇÃO DO ICMS
        const quadroBRows = [
            { id: 'progoiasItemB13', desc: 'Débito do ICMS', field: 'item01_debitoIcms' },
            { id: 'progoiasItemB14', desc: 'Outros Débitos', field: 'item02_outrosDebitos' },
            { id: 'progoiasItemB15', desc: 'Estorno de Créditos', field: 'item03_estornoCreditos' },
            { id: 'progoiasItemB16', desc: 'Total de Débitos', field: 'item04_totalDebitos' },
            { id: 'progoiasItemB17', desc: 'Créditos por Entradas', field: 'item05_creditosEntradas' },
            { id: 'progoiasItemB18', desc: 'Outros Créditos', field: 'item06_outrosCreditos' },
            { id: 'progoiasItemB19', desc: 'Crédito ProGoiás', field: 'item09_creditoProgoias' },
            { id: 'progoiasIcmsDevido', desc: 'ICMS a Recolher', field: 'item13_icmsARecolher' },
            { id: 'progoiasValorProtege', desc: 'PROTEGE', field: 'item14_valorProtege' },
            { id: 'progoiasIcmsRecolher', desc: 'ICMS Final', field: 'item15_icmsFinal' },
            { id: 'progoiasEconomiaTotal', desc: 'Economia Total', field: 'economiaTotal' }
        ];
        
        // Gerar linhas da tabela comparativa
        const generateRows = (rows, quadro) => {
            return rows.map(row => {
                const valores = progoiasMultiPeriodData.map(period => {
                    const data = quadro === 'A' ? period.calculo?.quadroA : period.calculo?.quadroB;
                    let value = data?.[row.field] || 0;
                    
                    // Formatação especial para percentuais
                    if (row.field === 'GO100001') {
                        return `<td>${value.toFixed(2)}%</td>`;
                    }
                    
                    return `<td>${formatCurrency(value)}</td>`;
                }).join('');
                
                return `<tr><td class="rubrica-desc">${row.desc}</td>${valores}</tr>`;
            }).join('');
        };
        
        const comparativeHTML = `
            <div id="progoiasPeriodsSelector" class="periods-selector">
                <h3>📅 Períodos Processados</h3>
                <div id="progoiasPeriodsButtons" class="periods-buttons">
                    ${progoiasMultiPeriodData.map((period, index) => 
                        `<button class="btn-style btn-small period-button ${index === progoiasSelectedPeriodIndex ? 'active' : ''}" 
                                onclick="progoiasSelectedPeriodIndex=${index}; updateProgoisSinglePeriodView();">
                            ${period.periodo}<br><small>${period.anoFruicao}º ano</small>
                        </button>`
                    ).join('')}
                </div>
                <div class="view-options">
                    <button id="progoiasViewSinglePeriod" class="btn-style btn-small">Visão Individual</button>
                    <button id="progoiasViewComparative" class="btn-style btn-small active">Visão Comparativa</button>
                </div>
            </div>
            
            <!-- ABA 1: CÁLCULO DO PROGOIÁS -->
            <div class="quadro-section">
                <h3>📋 ABA 1 - CÁLCULO DO PROGOIÁS (Comparativo)</h3>
                <div class="quadro-table">
                    <table class="fomentar-table comparative-table">
                        <thead>
                            <tr>
                                <th>Rubrica</th>
                                ${headerCols}
                            </tr>
                        </thead>
                        <tbody>
                            ${generateRows(quadroARows, 'A')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- ABA 2: APURAÇÃO DO ICMS -->
            <div class="quadro-section">
                <h3>📈 ABA 2 - APURAÇÃO DO ICMS (Comparativo)</h3>
                <div class="quadro-table">
                    <table class="fomentar-table comparative-table">
                        <thead>
                            <tr>
                                <th>Rubrica</th>
                                ${headerCols}
                            </tr>
                        </thead>
                        <tbody>
                            ${generateRows(quadroBRows, 'B')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Resumo Final -->
            <div class="resumo-section">
                <h3>💰 RESUMO CONSOLIDADO</h3>
                <div class="resumo-grid">
                    <div class="resumo-item">
                        <label>Total Incentivos Acumulados:</label>
                        <span class="valor-destaque valor-economia">R$ ${formatCurrency(progoiasMultiPeriodData.reduce((sum, p) => sum + ((p.calculo?.quadroA?.GO100009 || 0) + (p.calculo?.quadroB?.item14_valorProtege || 0)), 0))}</span>
                    </div>
                    <div class="resumo-item">
                        <label>Economia Total Acumulada:</label>
                        <span class="valor-destaque valor-total">R$ ${formatCurrency(progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroB?.economiaTotal || 0), 0))}</span>
                    </div>
                    <div class="resumo-item">
                        <label>Média de Economia por Período:</label>
                        <span class="valor-destaque">R$ ${formatCurrency(progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroB?.economiaTotal || 0), 0) / progoiasMultiPeriodData.length)}</span>
                    </div>
                    <div class="resumo-item">
                        <label>ICMS Total Recolhido:</label>
                        <span class="valor-destaque">R$ ${formatCurrency(progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroB?.item15_icmsFinal || 0), 0))}</span>
                    </div>
                </div>
            </div>
            
            <!-- Ações -->
            <div class="fomentar-actions">
                <button id="exportProgoisComparative" class="btn-style btn-export">
                    <span class="btn-icon">📈</span> Exportar Relatório Comparativo
                </button>
                <button id="exportProgoisPDF" class="btn-style btn-export">
                    <span class="btn-icon">📄</span> Exportar PDF Comparativo
                </button>
                <button id="exportProgoisMemoria" class="btn-style btn-export">
                    <span class="btn-icon">🔍</span> Exportar Memória de Cálculo
                </button>
                <button id="printProgoias" class="btn-style btn-secondary">
                    <span class="btn-icon">🖨️</span> Imprimir
                </button>
            </div>
        `;
        
        // Atualizar o conteúdo mantendo a estrutura original
        document.getElementById('progoiasResults').innerHTML = comparativeHTML;
        
        // Reativar os event listeners dos botões
        setupProgoisComparativeEventListeners();
        
        addLog(`Visualização comparativa gerada com ${progoiasMultiPeriodData.length} períodos`, 'success');
    }
    
    function setupProgoisComparativeEventListeners() {
        // Reativar event listeners para botões na visão comparativa
        const exportComparativeBtn = document.getElementById('exportProgoisComparative');
        const exportPDFBtn = document.getElementById('exportProgoisPDF');
        const exportMemoriaBtn = document.getElementById('exportProgoisMemoria');
        const printBtn = document.getElementById('printProgoias');
        const viewSingleBtn = document.getElementById('progoiasViewSinglePeriod');
        const viewComparativeBtn = document.getElementById('progoiasViewComparative');
        
        if (exportComparativeBtn) {
            exportComparativeBtn.onclick = exportProgoisComparativeReport;
        }
        
        if (exportPDFBtn) {
            exportPDFBtn.onclick = exportProgoisComparativePDF;
        }
        
        if (exportMemoriaBtn) {
            exportMemoriaBtn.onclick = exportProgoisMemoriaCalculo;
        }
        
        if (printBtn) {
            printBtn.onclick = printProgoisReport;
        }
        
        if (viewSingleBtn) {
            viewSingleBtn.onclick = () => switchProgoisView('single');
        }
        
        if (viewComparativeBtn) {
            viewComparativeBtn.onclick = () => switchProgoisView('comparative');
        }
    }
    
    async function exportProgoisComparativeReport() {
        if (progoiasMultiPeriodData.length === 0) {
            alert('Nenhum dado ProGoiás para exportar. Processe múltiplos SPEDs primeiro.');
            return;
        }
        
        try {
            await generateProgoisComparativeExcel();
            addLog('Relatório comparativo ProGoiás exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar relatório comparativo ProGoiás:', error);
            addLog(`Erro ao exportar relatório comparativo ProGoiás: ${error.message}`, 'error');
        }
    }
    
    function exportProgoisComparativePDF() {
        if (progoiasMultiPeriodData.length === 0) {
            alert('Nenhum dado ProGoiás para exportar PDF. Processe múltiplos SPEDs primeiro.');
            return;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape', 'mm', 'a4');
            
            // Configuração
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10;
            let yPosition = margin;
            
            // Cabeçalho
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('RELATÓRIO COMPARATIVO PROGOIÁS', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 5;
            
            doc.text(`Períodos: ${progoiasMultiPeriodData[0]?.periodo} a ${progoiasMultiPeriodData[progoiasMultiPeriodData.length - 1]?.periodo}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;
            
            // Preparar dados para tabela
            const headers = ['Rubrica', ...progoiasMultiPeriodData.map(p => `${p.periodo}\n(${p.anoFruicao}º ano)`)];
            
            // Dados do Quadro A
            const quadroAData = [
                ['ICMS Saídas Incentivadas', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroA?.GO100002 || 0))],
                ['ICMS Entradas Incentivadas', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroA?.GO100003 || 0))],
                ['Outros Créditos', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroA?.GO100004 || 0))],
                ['Outros Débitos', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroA?.GO100005 || 0))],
                ['Base de Cálculo', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroA?.baseCalculo || 0))],
                ['Percentual ProGoiás (%)', ...progoiasMultiPeriodData.map(p => (p.calculo?.quadroA?.GO100001 || 0).toFixed(2) + '%')],
                ['Crédito ProGoiás', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroA?.GO100009 || 0))]
            ];
            
            // Usar autoTable para criar tabela
            doc.autoTable({
                head: [headers],
                body: quadroAData,
                startY: yPosition,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [255, 42, 42], textColor: 255, fontStyle: 'bold' },
                columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' } },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                    // Adicionar título da seção
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'bold');
                    doc.text('ABA 1 - CÁLCULO DO PROGOIÁS', margin, data.settings.startY - 5);
                }
            });
            
            yPosition = doc.lastAutoTable.finalY + 20;
            
            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 60) {
                doc.addPage();
                yPosition = margin;
            }
            
            // Dados do Quadro B
            const quadroBData = [
                ['Débito do ICMS', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item01_debitoIcms || 0))],
                ['Outros Débitos', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item02_outrosDebitos || 0))],
                ['Total de Débitos', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item04_totalDebitos || 0))],
                ['Créditos por Entradas', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item05_creditosEntradas || 0))],
                ['Outros Créditos', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item06_outrosCreditos || 0))],
                ['Crédito ProGoiás', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item09_creditoProgoias || 0))],
                ['ICMS a Recolher', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item13_icmsARecolher || 0))],
                ['PROTEGE', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item14_valorProtege || 0))],
                ['ICMS Final', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.item15_icmsFinal || 0))],
                ['Economia Total', ...progoiasMultiPeriodData.map(p => formatCurrency(p.calculo?.quadroB?.economiaTotal || 0))]
            ];
            
            doc.autoTable({
                head: [headers],
                body: quadroBData,
                startY: yPosition,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [27, 27, 59], textColor: 255, fontStyle: 'bold' },
                columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' } },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'bold');
                    doc.text('ABA 2 - APURAÇÃO DO ICMS', margin, data.settings.startY - 5);
                }
            });
            
            // Resumo final
            yPosition = doc.lastAutoTable.finalY + 20;
            
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = margin;
            }
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('RESUMO CONSOLIDADO', margin, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            const totalIncentivos = progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroA?.GO100009 || 0), 0);
            const totalProtege = progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroB?.item14_valorProtege || 0), 0);
            const economiaTotal = progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroB?.economiaTotal || 0), 0);
            
            doc.text(`Total Incentivos ProGoiás: R$ ${formatCurrency(totalIncentivos)}`, margin, yPosition);
            yPosition += 7;
            doc.text(`Total PROTEGE: R$ ${formatCurrency(totalProtege)}`, margin, yPosition);
            yPosition += 7;
            doc.text(`Economia Fiscal Total: R$ ${formatCurrency(economiaTotal)}`, margin, yPosition);
            yPosition += 7;
            doc.text(`Número de Períodos: ${progoiasMultiPeriodData.length}`, margin, yPosition);
            
            // Salvar PDF
            const filename = `Comparativo_ProGoias_${progoiasMultiPeriodData.length}_periodos.pdf`;
            doc.save(filename);
            
            addLog(`PDF comparativo ProGoiás exportado: ${filename}`, 'success');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            addLog(`Erro ao gerar PDF comparativo: ${error.message}`, 'error');
        }
    }
    
    async function generateProgoisComparativeExcel() {
        try {
            // Usar método assíncrono correto
            const workbook = await XlsxPopulate.fromBlankAsync();
            const worksheet = workbook.sheet("Sheet1");
            worksheet.name("Comparativo ProGoiás");
            
            // Função auxiliar para converter número de coluna para letra
            function getColumnLetter(colNum) {
                let result = '';
                while (colNum > 0) {
                    colNum--;
                    result = String.fromCharCode(65 + (colNum % 26)) + result;
                    colNum = Math.floor(colNum / 26);
                }
                return result;
            }
            
            // Cabeçalho
            worksheet.cell("A1").value("RELATÓRIO COMPARATIVO PROGOIÁS");
            worksheet.cell("A1").style('bold', true).style('fontSize', 14);
            
            worksheet.cell("A2").value("Gerado em: " + new Date().toLocaleString('pt-BR'));
            worksheet.cell("A3").value(`Períodos: ${progoiasMultiPeriodData[0]?.periodo} a ${progoiasMultiPeriodData[progoiasMultiPeriodData.length - 1]?.periodo}`);
            
            let row = 5;
            
            // === ABA 1: CÁLCULO DO PROGOIÁS ===
            worksheet.cell(`A${row}`).value("ABA 1 - CÁLCULO DO PROGOIÁS").style('bold', true).style('fontSize', 12);
            row += 2;
            
            // Cabeçalho com períodos em colunas
            worksheet.cell(`A${row}`).value("Rubrica").style('bold', true);
            let col = 2; // Coluna B
            progoiasMultiPeriodData.forEach(period => {
                const colLetter = getColumnLetter(col);
                worksheet.cell(`${colLetter}${row}`).value(`${period.periodo} (${period.anoFruicao}º ano)`).style('bold', true);
                col++;
            });
            row++;
            
            // Rubricas da ABA 1
            const quadroARows = [
                { desc: 'ICMS Saídas Incentivadas', field: 'GO100002' },
                { desc: 'ICMS Entradas Incentivadas', field: 'GO100003' },
                { desc: 'Outros Créditos (Anexo II)', field: 'GO100004' },
                { desc: 'Outros Débitos (Anexo II)', field: 'GO100005' },
                { desc: 'Ajuste Período Anterior', field: 'GO100007' },
                { desc: 'Média ICMS', field: 'GO100006' },
                { desc: 'Base de Cálculo', field: 'baseCalculo' },
                { desc: 'Percentual ProGoiás (%)', field: 'GO100001' },
                { desc: 'Crédito Outorgado ProGoiás', field: 'GO100009' },
                { desc: 'Ajuste Próximo Período', field: 'GO100008' }
            ];
            
            quadroARows.forEach(rubrica => {
                worksheet.cell(`A${row}`).value(rubrica.desc);
                let col = 2;
                progoiasMultiPeriodData.forEach(period => {
                    const colLetter = getColumnLetter(col);
                    let value = period.calculo?.quadroA?.[rubrica.field] || 0;
                    
                    if (rubrica.field === 'GO100001') {
                        worksheet.cell(`${colLetter}${row}`).value(value.toFixed(2) + '%');
                    } else {
                        worksheet.cell(`${colLetter}${row}`).value(value).style('numberFormat', '#,##0.00');
                    }
                    col++;
                });
                row++;
            });
            
            row += 2;
            
            // === ABA 2: APURAÇÃO DO ICMS ===
            worksheet.cell(`A${row}`).value("ABA 2 - APURAÇÃO DO ICMS").style('bold', true).style('fontSize', 12);
            row += 2;
            
            // Cabeçalho novamente
            worksheet.cell(`A${row}`).value("Rubrica").style('bold', true);
            col = 2;
            progoiasMultiPeriodData.forEach(period => {
                const colLetter = getColumnLetter(col);
                worksheet.cell(`${colLetter}${row}`).value(`${period.periodo} (${period.anoFruicao}º ano)`).style('bold', true);
                col++;
            });
            row++;
            
            // Rubricas da ABA 2
            const quadroBRows = [
                { desc: 'Débito do ICMS', field: 'item01_debitoIcms' },
                { desc: 'Outros Débitos', field: 'item02_outrosDebitos' },
                { desc: 'Estorno de Créditos', field: 'item03_estornoCreditos' },
                { desc: 'Total de Débitos', field: 'item04_totalDebitos' },
                { desc: 'Créditos por Entradas', field: 'item05_creditosEntradas' },
                { desc: 'Outros Créditos', field: 'item06_outrosCreditos' },
                { desc: 'Crédito ProGoiás', field: 'item09_creditoProgoias' },
                { desc: 'ICMS a Recolher', field: 'item13_icmsARecolher' },
                { desc: 'PROTEGE', field: 'item14_valorProtege' },
                { desc: 'ICMS Final', field: 'item15_icmsFinal' },
                { desc: 'Economia Total', field: 'economiaTotal' }
            ];
            
            quadroBRows.forEach(rubrica => {
                worksheet.cell(`A${row}`).value(rubrica.desc);
                let col = 2;
                progoiasMultiPeriodData.forEach(period => {
                    const colLetter = getColumnLetter(col);
                    const value = period.calculo?.quadroB?.[rubrica.field] || 0;
                    worksheet.cell(`${colLetter}${row}`).value(value).style('numberFormat', '#,##0.00');
                    col++;
                });
                row++;
            });
            
            row += 2;
            
            // === RESUMO CONSOLIDADO ===
            worksheet.cell(`A${row}`).value("RESUMO CONSOLIDADO").style('bold', true).style('fontSize', 12);
            row += 2;
            
            const resumoRows = [
                { 
                    desc: 'Total Incentivos ProGoiás', 
                    values: progoiasMultiPeriodData.map(p => p.calculo?.quadroA?.GO100009 || 0) 
                },
                { 
                    desc: 'Total PROTEGE', 
                    values: progoiasMultiPeriodData.map(p => p.calculo?.quadroB?.item14_valorProtege || 0) 
                },
                { 
                    desc: 'Economia Total por Período', 
                    values: progoiasMultiPeriodData.map(p => p.calculo?.quadroB?.economiaTotal || 0) 
                },
                { 
                    desc: 'ICMS Final por Período', 
                    values: progoiasMultiPeriodData.map(p => p.calculo?.quadroB?.item15_icmsFinal || 0) 
                }
            ];
            
            resumoRows.forEach(resumo => {
                worksheet.cell(`A${row}`).value(resumo.desc).style('bold', true);
                let col = 2;
                resumo.values.forEach(value => {
                    const colLetter = getColumnLetter(col);
                    worksheet.cell(`${colLetter}${row}`).value(value).style('numberFormat', '#,##0.00');
                    col++;
                });
                row++;
            });
            
            // Totais acumulados
            row += 1;
            worksheet.cell(`A${row}`).value("TOTAIS ACUMULADOS").style('bold', true);
            row++;
            
            const totalIncentivos = progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroA?.GO100009 || 0), 0);
            const totalProtege = progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroB?.item14_valorProtege || 0), 0);
            const economiaTotal = progoiasMultiPeriodData.reduce((sum, p) => sum + (p.calculo?.quadroB?.economiaTotal || 0), 0);
            
            worksheet.cell(`A${row}`).value("Total Geral Incentivos ProGoiás:");
            worksheet.cell(`B${row}`).value(totalIncentivos).style('numberFormat', '#,##0.00').style('bold', true);
            row++;
            
            worksheet.cell(`A${row}`).value("Total Geral PROTEGE:");
            worksheet.cell(`B${row}`).value(totalProtege).style('numberFormat', '#,##0.00').style('bold', true);
            row++;
            
            worksheet.cell(`A${row}`).value("Economia Fiscal Total Acumulada:");
            worksheet.cell(`B${row}`).value(economiaTotal).style('numberFormat', '#,##0.00').style('bold', true);
            
            // Ajustar largura das colunas
            worksheet.column("A").width(35);
            for (let i = 2; i <= progoiasMultiPeriodData.length + 1; i++) {
                const colLetter = getColumnLetter(i);
                worksheet.column(colLetter).width(18);
            }
            
            // Adicionar aba de Memória de Cálculo
            const memoriaWorksheet = workbook.addSheet("Memória de Cálculo");
            let memoriaRow = 1;
            
            memoriaWorksheet.cell(`A${memoriaRow}`).value("MEMÓRIA DE CÁLCULO DETALHADA - MÚLTIPLOS PERÍODOS");
            memoriaWorksheet.cell(`A${memoriaRow + 1}`).value(`Total de Períodos: ${progoiasMultiPeriodData.length}`);
            memoriaRow += 3;
            
            // Cabeçalho da tabela
            memoriaWorksheet.cell(`A${memoriaRow}`).value("PERÍODO");
            memoriaWorksheet.cell(`B${memoriaRow}`).value("ORIGEM");
            memoriaWorksheet.cell(`C${memoriaRow}`).value("CÓDIGO");
            memoriaWorksheet.cell(`D${memoriaRow}`).value("DESCRIÇÃO");
            memoriaWorksheet.cell(`E${memoriaRow}`).value("TIPO");
            memoriaWorksheet.cell(`F${memoriaRow}`).value("VALOR");
            memoriaWorksheet.cell(`G${memoriaRow}`).value("INCENTIVADO");
            memoriaRow++;
            
            // Adicionar dados de cada período
            progoiasMultiPeriodData.forEach(periodo => {
                if (periodo.calculo?.operacoes?.memoriaCalculo?.detalhesOutrosCreditos?.length > 0) {
                    periodo.calculo.operacoes.memoriaCalculo.detalhesOutrosCreditos.forEach(item => {
                        memoriaWorksheet.cell(`A${memoriaRow}`).value(periodo.periodo);
                        memoriaWorksheet.cell(`B${memoriaRow}`).value(item.origem);
                        memoriaWorksheet.cell(`C${memoriaRow}`).value(item.codigo);
                        memoriaWorksheet.cell(`D${memoriaRow}`).value(item.descricao);
                        memoriaWorksheet.cell(`E${memoriaRow}`).value(item.tipo);
                        memoriaWorksheet.cell(`F${memoriaRow}`).value(item.valor);
                        memoriaWorksheet.cell(`G${memoriaRow}`).value(item.incentivado ? "SIM" : "NÃO");
                        memoriaRow++;
                    });
                }
                if (periodo.calculo?.operacoes?.memoriaCalculo?.detalhesOutrosDebitos?.length > 0) {
                    periodo.calculo.operacoes.memoriaCalculo.detalhesOutrosDebitos.forEach(item => {
                        memoriaWorksheet.cell(`A${memoriaRow}`).value(periodo.periodo);
                        memoriaWorksheet.cell(`B${memoriaRow}`).value(item.origem);
                        memoriaWorksheet.cell(`C${memoriaRow}`).value(item.codigo);
                        memoriaWorksheet.cell(`D${memoriaRow}`).value(item.descricao);
                        memoriaWorksheet.cell(`E${memoriaRow}`).value(item.tipo);
                        memoriaWorksheet.cell(`F${memoriaRow}`).value(item.valor);
                        memoriaWorksheet.cell(`G${memoriaRow}`).value(item.incentivado ? "SIM" : "NÃO");
                        memoriaRow++;
                    });
                }
            });
            
            // Ajustar largura das colunas da memória de cálculo
            memoriaWorksheet.column("A").width(12);
            memoriaWorksheet.column("B").width(50);
            memoriaWorksheet.column("C").width(15);
            memoriaWorksheet.column("D").width(25);
            memoriaWorksheet.column("E").width(10);
            memoriaWorksheet.column("F").width(15);
            memoriaWorksheet.column("G").width(12);
            
            // Salvar arquivo
            const filename = `Comparativo_ProGoias_${progoiasMultiPeriodData.length}_periodos.xlsx`;
            const blob = await workbook.outputAsync();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Erro ao gerar Excel:', error);
            addLog(`Erro ao gerar Excel comparativo: ${error.message}`, 'error');
            throw error;
        }
    }
    
    // Funções auxiliares de drag and drop para ProGoiás - Single
    function highlightProgoisZone() {
        const progoiasDropZone = document.getElementById('progoiasDropZone');
        if (progoiasDropZone) {
            progoiasDropZone.classList.add('dragover');
        }
    }
    
    function unhighlightProgoisZone() {
        const progoiasDropZone = document.getElementById('progoiasDropZone');
        if (progoiasDropZone) {
            progoiasDropZone.classList.remove('dragover');
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
        const progoiasDropZone = document.getElementById('progoiasDropZone');
        if (!progoiasDropZone.contains(e.relatedTarget)) {
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
        // Verificar se há dados (período único ou múltiplos períodos)
        const hasData = progoiasData || (progoiasMultiPeriodData && progoiasMultiPeriodData.length > 0);
        
        if (!hasData) {
            addLog('Erro: Nenhuma memória de cálculo ProGoiás disponível', 'error');
            return;
        }
        
        // Se múltiplos períodos, usar dados do período selecionado
        if (progoiasMultiPeriodData && progoiasMultiPeriodData.length > 0) {
            const selectedPeriod = progoiasMultiPeriodData[progoiasSelectedPeriodIndex] || progoiasMultiPeriodData[0];
            const operacoes = classifyOperations(selectedPeriod.registros);
            exportMemoriaCalculo(operacoes.memoriaCalculo, `ProGoiás_${selectedPeriod.periodo}`);
        } else {
            // Período único
            const operacoes = classifyOperations(progoiasRegistrosCompletos);
            exportMemoriaCalculo(operacoes.memoriaCalculo, 'ProGoiás');
        }
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
            
            // 6. OUTROS CRÉDITOS DETALHADOS
            if (memoriaCalculo.detalhesOutrosCreditos && memoriaCalculo.detalhesOutrosCreditos.length > 0) {
                mainSheet.cell(`A${currentRow}`).value('6. OUTROS CRÉDITOS - DETALHAMENTO COMPLETO');
                mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 12);
                currentRow += 1;
                
                const creditosHeaders = ['Origem SPED', 'Código Ajuste', 'Descrição', 'Tipo', 'Valor', 'Incentivado'];
                creditosHeaders.forEach((header, index) => {
                    const col = String.fromCharCode(65 + index);
                    mainSheet.cell(`${col}${currentRow}`).value(header).style('bold', true);
                });
                currentRow++;
                
                memoriaCalculo.detalhesOutrosCreditos.forEach(item => {
                    mainSheet.cell(`A${currentRow}`).value(item.origem);
                    mainSheet.cell(`B${currentRow}`).value(item.codigo);
                    mainSheet.cell(`C${currentRow}`).value(item.descricao);
                    mainSheet.cell(`D${currentRow}`).value(item.tipo);
                    mainSheet.cell(`E${currentRow}`).value(item.valor);
                    mainSheet.cell(`F${currentRow}`).value(item.incentivado ? 'SIM' : 'NÃO');
                    currentRow++;
                });
                
                currentRow += 2;
            }
            
            // 7. OUTROS DÉBITOS DETALHADOS
            if (memoriaCalculo.detalhesOutrosDebitos && memoriaCalculo.detalhesOutrosDebitos.length > 0) {
                mainSheet.cell(`A${currentRow}`).value('7. OUTROS DÉBITOS - DETALHAMENTO COMPLETO');
                mainSheet.cell(`A${currentRow}`).style('bold', true).style('fontSize', 12);
                currentRow += 1;
                
                const debitosHeaders = ['Origem SPED', 'Código Ajuste', 'Descrição', 'Tipo', 'Valor', 'Incentivado'];
                debitosHeaders.forEach((header, index) => {
                    const col = String.fromCharCode(65 + index);
                    mainSheet.cell(`${col}${currentRow}`).value(header).style('bold', true);
                });
                currentRow++;
                
                memoriaCalculo.detalhesOutrosDebitos.forEach(item => {
                    mainSheet.cell(`A${currentRow}`).value(item.origem);
                    mainSheet.cell(`B${currentRow}`).value(item.codigo);
                    mainSheet.cell(`C${currentRow}`).value(item.descricao);
                    mainSheet.cell(`D${currentRow}`).value(item.tipo);
                    mainSheet.cell(`E${currentRow}`).value(item.valor);
                    mainSheet.cell(`F${currentRow}`).value(item.incentivado ? 'SIM' : 'NÃO');
                    currentRow++;
                });
                
                currentRow += 2;
            }
            
            // 8. RESUMO DOS TOTAIS
            mainSheet.cell(`A${currentRow}`).value('8. RESUMO DOS TOTAIS');
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
