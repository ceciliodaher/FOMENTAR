// Variáveis globais
let spedData = null;
let fomentarData = null;

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

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Inicializar navegação por abas
    initializeTabs();
    
    // Inicializar conversor SPED original
    initializeSpedConverter();
    
    // Inicializar módulo FOMENTAR
    initializeFomentar();
    
    // Adicionar listeners para configurações
    addConfigurationListeners();
}

function initializeTabs() {
    const tabConverter = document.getElementById('tabConverter');
    const tabFomentar = document.getElementById('tabFomentar');
    const converterPanel = document.getElementById('converterPanel');
    const fomentarPanel = document.getElementById('fomentarPanel');
    
    tabConverter.addEventListener('click', () => {
        switchTab('converter');
    });
    
    tabFomentar.addEventListener('click', () => {
        switchTab('fomentar');
    });
}

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
    }
}

function initializeSpedConverter() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('spedFile');
    const convertButton = document.getElementById('convertButton');
    const progressBar = document.getElementById('progressBar');
    const statusMessage = document.getElementById('statusMessage');
    const selectedFileText = document.getElementById('selectedSpedFile');
    
    // Drag and drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());
    
    // File input
    fileInput.addEventListener('change', handleFileSelect);
    
    // Convert button
    convertButton.addEventListener('click', convertSpedToExcel);
    
    function handleDragOver(e) {
        e.preventDefault();
        dropZone.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    }
    
    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.backgroundColor = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }
    
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    }
    
    function processFile(file) {
        if (!file.name.endsWith('.txt')) {
            logMessage('Erro: Selecione um arquivo .txt válido', 'error');
            return;
        }
        
        selectedFileText.textContent = `Arquivo selecionado: ${file.name}`;
        selectedFileText.style.color = '#28a745';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            spedData = e.target.result;
            logMessage(`Arquivo ${file.name} carregado com sucesso`, 'success');
            convertButton.disabled = false;
        };
        reader.readAsText(file);
    }
    
    function convertSpedToExcel() {
        if (!spedData) {
            logMessage('Erro: Nenhum arquivo SPED carregado', 'error');
            return;
        }
        
        statusMessage.textContent = 'Convertendo arquivo SPED...';
        updateProgress(10);
        
        try {
            const parsedData = parseSpedData(spedData);
            updateProgress(50);
            
            const excelData = convertToExcelFormat(parsedData);
            updateProgress(80);
            
            const fileName = document.getElementById('excelFileName').value || 'ConversaoSPED.xlsx';
            downloadExcel(excelData, fileName);
            updateProgress(100);
            
            statusMessage.textContent = 'Conversão concluída com sucesso!';
            logMessage('Arquivo Excel gerado e baixado com sucesso', 'success');
            
        } catch (error) {
            logMessage(`Erro na conversão: ${error.message}`, 'error');
            statusMessage.textContent = 'Erro na conversão do arquivo';
            updateProgress(0);
        }
    }
    
    function updateProgress(percentage) {
        progressBar.style.width = percentage + '%';
        progressBar.textContent = percentage + '%';
    }
}

function initializeFomentar() {
    const importButton = document.getElementById('importSpedFomentar');
    const exportButton = document.getElementById('exportFomentar');
    const printButton = document.getElementById('printFomentar');
    
    importButton.addEventListener('click', importSpedForFomentar);
    exportButton.addEventListener('click', exportFomentarReport);
    printButton.addEventListener('click', printFomentarReport);
}

function addConfigurationListeners() {
    const programType = document.getElementById('programType');
    const percentualFinanciamento = document.getElementById('percentualFinanciamento');
    
    programType.addEventListener('change', function() {
        const maxPercentual = this.value === 'MICROPRODUZIR' ? 90 : 73;
        percentualFinanciamento.max = maxPercentual;
        if (parseFloat(percentualFinanciamento.value) > maxPercentual) {
            percentualFinanciamento.value = maxPercentual;
        }
        
        if (fomentarData) {
            calculateFomentar();
        }
    });
    
    percentualFinanciamento.addEventListener('input', function() {
        if (fomentarData) {
            calculateFomentar();
        }
    });
    
    document.getElementById('icmsPorMedia').addEventListener('input', function() {
        if (fomentarData) {
            calculateFomentar();
        }
    });
    
    document.getElementById('saldoCredorAnterior').addEventListener('input', function() {
        if (fomentarData) {
            calculateFomentar();
        }
    });
    
    // Adicionar listeners para inputs dos Quadros D e E quando a página carregar
    setTimeout(addQuadroListeners, 1000);
}

function addQuadroListeners() {
    // Listeners para Quadro D
    const quadroDInputs = [
        'itemD45', 'itemD46', 'itemD47', 'itemD48', 'itemD49', 'itemD50', 'itemD51', 'itemD52',
        'itemD53', 'itemD54', 'itemD55', 'itemD56', 'itemD57', 'itemD58', 'itemD59', 'itemD60',
        'itemD62', 'itemD63', 'itemD64', 'itemD65', 'itemD66', 'itemD67', 'itemD68', 'itemD69', 'itemD70'
    ];
    
    quadroDInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                if (fomentarData) {
                    calculateFomentar();
                }
            });
            
            input.addEventListener('blur', function() {
                // Formatar o valor quando sair do campo
                const value = parseFloat(this.value) || 0;
                this.value = value.toFixed(2);
                if (fomentarData) {
                    calculateFomentar();
                }
            });
        }
    });
    
    // Listeners para Quadro E
    const quadroEInputs = ['itemE73', 'itemE74', 'itemE78'];
    
    quadroEInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                if (fomentarData) {
                    calculateFomentar();
                }
            });
            
            input.addEventListener('blur', function() {
                // Formatar o valor quando sair do campo
                const value = parseFloat(this.value) || 0;
                this.value = value.toFixed(2);
                if (fomentarData) {
                    calculateFomentar();
                }
            });
        }
    });
}

function importSpedForFomentar() {
    if (!spedData) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    spedData = e.target.result;
                    processFomentarData();
                };
                reader.readAsText(file);
            }
        };
        input.click();
    } else {
        processFomentarData();
    }
}

function processFomentarData() {
    try {
        logMessage('Processando dados SPED para apuração FOMENTAR...', 'info');
        
        const parsedData = parseSpedData(spedData);
        fomentarData = classifyOperations(parsedData);
        
        // Validar se há dados suficientes
        const totalOperacoes = fomentarData.saidasIncentivadas.length + fomentarData.saidasNaoIncentivadas.length + 
                              fomentarData.entradasIncentivadas.length + fomentarData.entradasNaoIncentivadas.length;
        
        if (totalOperacoes === 0) {
            throw new Error('SPED não contém operações suficientes para apuração FOMENTAR');
        }
        
        document.getElementById('fomentarSpedStatus').textContent = 
            `Arquivo SPED importado: ${totalOperacoes} operações processadas (${fomentarData.saidasIncentivadas.length} saídas incentivadas, ${fomentarData.saidasNaoIncentivadas.length} saídas não incentivadas)`;
        document.getElementById('fomentarSpedStatus').style.color = '#28a745';
        
        calculateFomentar();
        document.getElementById('fomentarResults').style.display = 'block';
        
        logMessage(`Apuração FOMENTAR calculada: ${totalOperacoes} operações analisadas`, 'success');
        logMessage('Revise os valores calculados e ajuste os campos editáveis conforme necessário', 'info');
        
    } catch (error) {
        logMessage(`Erro ao processar dados FOMENTAR: ${error.message}`, 'error');
        document.getElementById('fomentarSpedStatus').textContent = `Erro: ${error.message}`;
        document.getElementById('fomentarSpedStatus').style.color = '#dc3545';
    }
}

function parseSpedData(data) {
    const lines = data.split('\n');
    const result = {
        registroC100: [],
        registroC170: [],
        registroD100: [],
        registroD190: [],
        registroE100: [],
        registroE110: []
    };
    
    let lineNumber = 0;
    let hasSpedData = false;
    
    lines.forEach(line => {
        lineNumber++;
        const trimmedLine = line.trim();
        
        if (!trimmedLine || trimmedLine.length < 5) {
            return; // Pular linhas vazias ou muito curtas
        }
        
        try {
            if (trimmedLine.startsWith('|C100|')) {
                result.registroC100.push(parseC100Line(trimmedLine));
                hasSpedData = true;
            } else if (trimmedLine.startsWith('|C170|')) {
                result.registroC170.push(parseC170Line(trimmedLine));
                hasSpedData = true;
            } else if (trimmedLine.startsWith('|D100|')) {
                result.registroD100.push(parseD100Line(trimmedLine));
                hasSpedData = true;
            } else if (trimmedLine.startsWith('|D190|')) {
                result.registroD190.push(parseD190Line(trimmedLine));
                hasSpedData = true;
            } else if (trimmedLine.startsWith('|E100|')) {
                result.registroE100.push(parseE100Line(trimmedLine));
                hasSpedData = true;
            } else if (trimmedLine.startsWith('|E110|')) {
                result.registroE110.push(parseE110Line(trimmedLine));
                hasSpedData = true;
            }
        } catch (error) {
            logMessage(`Erro ao processar linha ${lineNumber}: ${error.message}`, 'warning');
        }
    });
    
    if (!hasSpedData) {
        throw new Error('Arquivo SPED não contém dados válidos para apuração FOMENTAR');
    }
    
    logMessage(`SPED processado: ${result.registroC100.length} reg. C100, ${result.registroC170.length} reg. C170, ${result.registroD100.length} reg. D100, ${result.registroD190.length} reg. D190`, 'info');
    
    return result;
}

function parseC100Line(line) {
    const fields = line.split('|');
    if (fields.length < 12) {
        throw new Error('Registro C100 com formato inválido');
    }
    
    return {
        tipo: 'C100',
        cfop: fields[7] || '',
        valorOperacao: parseFloat(fields[9]?.replace(',', '.') || '0'),
        valorIcms: parseFloat(fields[11]?.replace(',', '.') || '0'),
        tipoOperacao: fields[4] === '0' ? 'ENTRADA' : 'SAIDA'
    };
}

function parseC170Line(line) {
    const fields = line.split('|');
    if (fields.length < 12) {
        throw new Error('Registro C170 com formato inválido');
    }
    
    return {
        tipo: 'C170',
        cfop: fields[7] || '',
        valorOperacao: parseFloat(fields[8]?.replace(',', '.') || '0'),
        valorIcms: parseFloat(fields[11]?.replace(',', '.') || '0')
    };
}

function parseD100Line(line) {
    const fields = line.split('|');
    if (fields.length < 14) {
        throw new Error('Registro D100 com formato inválido');
    }
    
    return {
        tipo: 'D100',
        cfop: fields[9] || '',
        valorOperacao: parseFloat(fields[12]?.replace(',', '.') || '0'),
        valorIcms: parseFloat(fields[13]?.replace(',', '.') || '0'),
        tipoOperacao: fields[4] === '0' ? 'ENTRADA' : 'SAIDA'
    };
}

function parseD190Line(line) {
    const fields = line.split('|');
    if (fields.length < 6) {
        throw new Error('Registro D190 com formato inválido');
    }
    
    return {
        tipo: 'D190',
        cfop: fields[2] || '',
        valorOperacao: parseFloat(fields[3]?.replace(',', '.') || '0'),
        valorIcms: parseFloat(fields[5]?.replace(',', '.') || '0')
    };
}

function parseE100Line(line) {
    const fields = line.split('|');
    if (fields.length < 7) {
        throw new Error('Registro E100 com formato inválido');
    }
    
    return {
        tipo: 'E100',
        valorCredito: parseFloat(fields[4]?.replace(',', '.') || '0'),
        valorDebito: parseFloat(fields[5]?.replace(',', '.') || '0'),
        saldoCredor: parseFloat(fields[6]?.replace(',', '.') || '0')
    };
}

function parseE110Line(line) {
    const fields = line.split('|');
    if (fields.length < 5) {
        throw new Error('Registro E110 com formato inválido');
    }
    
    return {
        tipo: 'E110',
        valorCredito: parseFloat(fields[3]?.replace(',', '.') || '0'),
        valorDebito: parseFloat(fields[4]?.replace(',', '.') || '0')
    };
}

function classifyOperations(parsedData) {
    const operations = {
        entradasIncentivadas: [],
        entradasNaoIncentivadas: [],
        saidasIncentivadas: [],
        saidasNaoIncentivadas: [],
        creditosEntradas: 0,
        debitosOperacoes: 0,
        saldoCredorAnterior: 0
    };
    
    // Processar registros C100 e C170
    [...parsedData.registroC100, ...parsedData.registroC170].forEach(registro => {
        const cfop = registro.cfop;
        const isIncentivada = registro.tipoOperacao === 'ENTRADA' 
            ? CFOP_ENTRADAS_INCENTIVADAS.includes(cfop)
            : CFOP_SAIDAS_INCENTIVADAS.includes(cfop);
        
        if (registro.tipoOperacao === 'ENTRADA') {
            if (isIncentivada) {
                operations.entradasIncentivadas.push(registro);
            } else {
                operations.entradasNaoIncentivadas.push(registro);
            }
            operations.creditosEntradas += registro.valorIcms;
        } else {
            if (isIncentivada) {
                operations.saidasIncentivadas.push(registro);
            } else {
                operations.saidasNaoIncentivadas.push(registro);
            }
            operations.debitosOperacoes += registro.valorIcms;
        }
    });
    
    // Processar registros D100 e D190
    [...parsedData.registroD100, ...parsedData.registroD190].forEach(registro => {
        const cfop = registro.cfop;
        const isIncentivada = registro.tipoOperacao === 'ENTRADA' 
            ? CFOP_ENTRADAS_INCENTIVADAS.includes(cfop)
            : CFOP_SAIDAS_INCENTIVADAS.includes(cfop);
        
        if (registro.tipoOperacao === 'ENTRADA') {
            if (isIncentivada) {
                operations.entradasIncentivadas.push(registro);
            } else {
                operations.entradasNaoIncentivadas.push(registro);
            }
            operations.creditosEntradas += registro.valorIcms;
        } else {
            if (isIncentivada) {
                operations.saidasIncentivadas.push(registro);
            } else {
                operations.saidasNaoIncentivadas.push(registro);
            }
            operations.debitosOperacoes += registro.valorIcms;
        }
    });
    
    return operations;
}

function calculateFomentar() {
    if (!fomentarData) return;
    
    // Configurações
    const percentualFinanciamento = parseFloat(document.getElementById('percentualFinanciamento').value) / 100;
    const icmsPorMedia = parseFloat(document.getElementById('icmsPorMedia').value) || 0;
    const saldoCredorAnterior = parseFloat(document.getElementById('saldoCredorAnterior').value) || 0;
    
    // Obter valores do Quadro D
    const getQuadroDValue = (id) => parseFloat(document.getElementById(id)?.value || 0);
    
    // QUADRO A - Proporção dos Créditos
    const saidasIncentivadas = fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
    const totalSaidas = saidasIncentivadas + fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorOperacao, 0);
    const percentualSaidasIncentivadas = totalSaidas > 0 ? (saidasIncentivadas / totalSaidas) * 100 : 0;
    
    const creditosEntradas = fomentarData.creditosEntradas;
    const outrosCreditos = 0; // Configurável pelos quadros D
    const estornoDebitos = 0; // Configurável
    const totalCreditos = creditosEntradas + outrosCreditos + estornoDebitos + saldoCredorAnterior;
    
    const creditoIncentivadas = (percentualSaidasIncentivadas / 100) * totalCreditos;
    const creditoNaoIncentivadas = totalCreditos - creditoIncentivadas;
    
    // QUADRO A.1 - Créditos não submetidos à proporção (item 10.1)
    const creditosNaoSubmetidosProporcao = 0; // Art. 4° da IN 1208/2015-GSF
    const creditoIncentivadaTotal = creditoIncentivadas + creditosNaoSubmetidosProporcao;
    
    // QUADRO B - Operações Incentivadas
    const debitoIncentivadas = fomentarData.saidasIncentivadas.reduce((total, op) => total + op.valorIcms, 0);
    const debitoBonificacao = 0; // Item 11.1 - Saídas a título de bonificação
    const outrosDebitosIncentivadas = 0;
    const estornoCreditosIncentivadas = 0;
    const deducoesIncentivadas = 0;
    const creditoSaldoCredorNaoIncentivadas = 0; // Item 16
    
    const saldoDevedorIncentivadas = (debitoIncentivadas + debitoBonificacao + outrosDebitosIncentivadas + estornoCreditosIncentivadas) - 
                                   (creditoIncentivadaTotal + deducoesIncentivadas + creditoSaldoCredorNaoIncentivadas);
    
    const deducoesCompensacoes64 = getQuadroDValue('itemD64'); // Item 19
    const saldoPagarMedia = icmsPorMedia - deducoesCompensacoes64; // Item 20
    const icmsBaseFomentar = Math.max(0, saldoDevedorIncentivadas - icmsPorMedia); // Item 21
    const icmsSujeitoFinanciamento = icmsBaseFomentar * percentualFinanciamento; // Item 23
    const icmsExcedenteNaoSujeito = 0; // Item 24
    const icmsFinanciado = icmsSujeitoFinanciamento - icmsExcedenteNaoSujeito; // Item 25
    const parcelaNaoFinanciada = icmsBaseFomentar - icmsSujeitoFinanciamento; // Item 26
    const deducoesCompensacoes65 = getQuadroDValue('itemD65'); // Item 27
    const saldoPagarParcelaNaoFinanciada = Math.max(0, parcelaNaoFinanciada - deducoesCompensacoes65); // Item 28
    
    // Saldo Credor das Operações Incentivadas
    const saldoCredorIncentivadas = Math.max(0, (creditoIncentivadaTotal + deducoesIncentivadas) - 
                                           (debitoIncentivadas + debitoBonificacao + outrosDebitosIncentivadas + estornoCreditosIncentivadas)); // Item 29
    const saldoCredorUtilizadoNaoIncentivadas = 0; // Item 30
    const saldoCredorTransportar = saldoCredorIncentivadas - saldoCredorUtilizadoNaoIncentivadas; // Item 31
    
    // QUADRO C - Operações Não Incentivadas
    const debitoNaoIncentivadas = fomentarData.saidasNaoIncentivadas.reduce((total, op) => total + op.valorIcms, 0);
    const outrosDebitosNaoIncentivadas = 0;
    const estornoCreditosNaoIncentivadas = 0;
    const icmsExcedenteNaoIncentivadas = icmsExcedenteNaoSujeito; // Item 35 - transportado do item 24
    const deducoesNaoIncentivadas = 0;
    const creditoSaldoCredorIncentivadas = saldoCredorUtilizadoNaoIncentivadas; // Item 38
    
    const saldoDevedorNaoIncentivadas = (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoIncentivadas) - 
                                      (creditoNaoIncentivadas + deducoesNaoIncentivadas + creditoSaldoCredorIncentivadas);
    
    const deducoesCompensacoes63 = getQuadroDValue('itemD63'); // Item 40
    const saldoPagarNaoIncentivadas = Math.max(0, saldoDevedorNaoIncentivadas - deducoesCompensacoes63); // Item 41
    
    // Saldo Credor das Operações Não Incentivadas
    const saldoCredorNaoIncentivadas = Math.max(0, (creditoNaoIncentivadas + deducoesNaoIncentivadas) - 
                                              (debitoNaoIncentivadas + outrosDebitosNaoIncentivadas + estornoCreditosNaoIncentivadas + icmsExcedenteNaoIncentivadas)); // Item 42
    const saldoCredorUtilizadoIncentivadas = 0; // Item 43
    const saldoCredorTransportarNaoIncentivadas = saldoCredorNaoIncentivadas - saldoCredorUtilizadoIncentivadas; // Item 44
    
    // QUADRO D - Buscar valores dos inputs
    const quadroDValues = {
        item45: getQuadroDValue('itemD45'), item46: getQuadroDValue('itemD46'), item47: getQuadroDValue('itemD47'), 
        item48: getQuadroDValue('itemD48'), item49: getQuadroDValue('itemD49'), item50: getQuadroDValue('itemD50'), 
        item51: getQuadroDValue('itemD51'), item52: getQuadroDValue('itemD52'), item53: getQuadroDValue('itemD53'), 
        item54: getQuadroDValue('itemD54'), item55: getQuadroDValue('itemD55'), item56: getQuadroDValue('itemD56'), 
        item57: getQuadroDValue('itemD57'), item58: getQuadroDValue('itemD58'), item59: getQuadroDValue('itemD59'), 
        item60: getQuadroDValue('itemD60'), item62: getQuadroDValue('itemD62'), item63: getQuadroDValue('itemD63'), 
        item64: getQuadroDValue('itemD64'), item65: getQuadroDValue('itemD65'), item66: getQuadroDValue('itemD66'), 
        item67: getQuadroDValue('itemD67'), item68: getQuadroDValue('itemD68'), item69: getQuadroDValue('itemD69'), 
        item70: getQuadroDValue('itemD70')
    };
    
    const totalCreditosD = quadroDValues.item45 + quadroDValues.item46 + quadroDValues.item47 + quadroDValues.item48 + 
                          quadroDValues.item49 + quadroDValues.item50 + quadroDValues.item51 + quadroDValues.item52 + 
                          quadroDValues.item53 + quadroDValues.item54 + quadroDValues.item55 + quadroDValues.item56 + 
                          quadroDValues.item57 + quadroDValues.item58 + quadroDValues.item59 + quadroDValues.item60;
    
    const totalDeducoesD = quadroDValues.item62 + quadroDValues.item63 + quadroDValues.item64 + quadroDValues.item65 + 
                          quadroDValues.item66 + quadroDValues.item67 + quadroDValues.item68 + quadroDValues.item69 + 
                          quadroDValues.item70;
    
    const saldoCredorTransportarD = totalCreditosD - totalDeducoesD;
    
    // QUADRO E - Mercadorias Importadas
    const totalMercadoriasImportadas = parseFloat(document.getElementById('itemE73')?.value || 0); // Item 73
    const outrosAcrescimosImportacao = parseFloat(document.getElementById('itemE74')?.value || 0); // Item 74
    const totalOperacoesImportacao = totalMercadoriasImportadas + outrosAcrescimosImportacao; // Item 75
    const totalEntradasPeriodo = fomentarData.entradasIncentivadas.reduce((total, op) => total + op.valorOperacao, 0) + 
                                fomentarData.entradasNaoIncentivadas.reduce((total, op) => total + op.valorOperacao, 0); // Item 76
    const percentualOperacoesImportacao = totalEntradasPeriodo > 0 ? (totalOperacoesImportacao / totalEntradasPeriodo) * 100 : 0; // Item 77
    const icmsSobreImportacao = parseFloat(document.getElementById('itemE78')?.value || 0); // Item 78
    const mercadoriasImportadasExcedentes = totalEntradasPeriodo > 0 ? Math.max(0, (totalEntradasPeriodo * (percentualOperacoesImportacao - 30)) / 100) : 0; // Item 79
    const icmsImportacaoExcedente = totalOperacoesImportacao > 0 ? icmsSobreImportacao * (mercadoriasImportadasExcedentes / totalOperacoesImportacao) : 0; // Item 80
    const icmsImportacaoExcedenteNaoSujeito = icmsImportacaoExcedente * percentualFinanciamento; // Item 81
    const icmsImportacaoSujeitoIncentivo = icmsSobreImportacao - icmsImportacaoExcedente; // Item 82
    const icmsImportacaoParcelaNaoFinanciada = icmsSobreImportacao * (1 - percentualFinanciamento); // Item 83
    const saldoIcmsImportacaoPagar = icmsImportacaoExcedenteNaoSujeito + icmsImportacaoParcelaNaoFinanciada; // Item 84
    
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
        item10: creditoNaoIncentivadas,
        item101: creditosNaoSubmetidosProporcao
    });
    
    updateQuadroB({
        item11: debitoIncentivadas,
        item111: debitoBonificacao,
        item12: outrosDebitosIncentivadas,
        item13: estornoCreditosIncentivadas,
        item14: creditoIncentivadaTotal,
        item15: deducoesIncentivadas,
        item16: creditoSaldoCredorNaoIncentivadas,
        item17: saldoDevedorIncentivadas,
        item18: icmsPorMedia,
        item19: deducoesCompensacoes64,
        item20: saldoPagarMedia,
        item21: icmsBaseFomentar,
        item22: percentualFinanciamento * 100,
        item23: icmsSujeitoFinanciamento,
        item24: icmsExcedenteNaoSujeito,
        item25: icmsFinanciado,
        item26: parcelaNaoFinanciada,
        item27: deducoesCompensacoes65,
        item28: saldoPagarParcelaNaoFinanciada,
        item29: saldoCredorIncentivadas,
        item30: saldoCredorUtilizadoNaoIncentivadas,
        item31: saldoCredorTransportar
    });
    
    updateQuadroC({
        item32: debitoNaoIncentivadas,
        item33: outrosDebitosNaoIncentivadas,
        item34: estornoCreditosNaoIncentivadas,
        item35: icmsExcedenteNaoIncentivadas,
        item36: creditoNaoIncentivadas,
        item37: deducoesNaoIncentivadas,
        item38: creditoSaldoCredorIncentivadas,
        item39: saldoDevedorNaoIncentivadas,
        item40: deducoesCompensacoes63,
        item41: saldoPagarNaoIncentivadas,
        item42: saldoCredorNaoIncentivadas,
        item43: saldoCredorUtilizadoIncentivadas,
        item44: saldoCredorTransportarNaoIncentivadas
    });
    
    updateQuadroD({
        ...quadroDValues,
        item61: totalCreditosD,
        item71: totalDeducoesD,
        item72: saldoCredorTransportarD
    });
    
    updateQuadroE({
        item73: totalMercadoriasImportadas,
        item74: outrosAcrescimosImportacao,
        item75: totalOperacoesImportacao,
        item76: totalEntradasPeriodo,
        item77: percentualOperacoesImportacao,
        item78: icmsSobreImportacao,
        item79: mercadoriasImportadasExcedentes,
        item80: icmsImportacaoExcedente,
        item81: icmsImportacaoExcedenteNaoSujeito,
        item82: icmsImportacaoSujeitoIncentivo,
        item83: icmsImportacaoParcelaNaoFinanciada,
        item84: saldoIcmsImportacaoPagar
    });
    
    updateResumo({
        totalIncentivadas: saldoPagarParcelaNaoFinanciada,
        totalNaoIncentivadas: saldoPagarNaoIncentivadas,
        valorFinanciamento: icmsFinanciado,
        totalGeral: saldoPagarParcelaNaoFinanciada + saldoPagarNaoIncentivadas + saldoIcmsImportacaoPagar
    });
    
    // Adicionar listeners após primeira execução
    if (!window.listenersAdded) {
        addQuadroListeners();
        window.listenersAdded = true;
    }
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

function updateQuadroD(values) {
    // Os valores de entrada já estão nos inputs, só precisamos atualizar os totais calculados
    document.getElementById('itemD61Display').textContent = formatCurrency(values.item61 || 0);
    document.getElementById('itemD71Display').textContent = formatCurrency(values.item71 || 0);
    document.getElementById('itemD72Display').textContent = formatCurrency(values.item72 || 0);
}

function updateQuadroE(values) {
    // Os itens editáveis ficam nos inputs, os calculados nos displays
    document.getElementById('itemE75Display').textContent = formatCurrency(values.item75 || 0);
    document.getElementById('itemE76Display').textContent = formatCurrency(values.item76 || 0);
    document.getElementById('itemE77Display').textContent = (values.item77 || 0).toFixed(2) + '%';
    document.getElementById('itemE79Display').textContent = formatCurrency(values.item79 || 0);
    document.getElementById('itemE80Display').textContent = formatCurrency(values.item80 || 0);
    document.getElementById('itemE81Display').textContent = formatCurrency(values.item81 || 0);
    document.getElementById('itemE82Display').textContent = formatCurrency(values.item82 || 0);
    document.getElementById('itemE83Display').textContent = formatCurrency(values.item83 || 0);
    document.getElementById('itemE84Display').textContent = formatCurrency(values.item84 || 0);
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

function convertToExcelFormat(parsedData) {
    // Implementação da conversão para Excel (mantida da versão original)
    const workbook = [];
    
    // Criar planilhas para cada tipo de registro
    const sheets = {
        'C100': parsedData.registroC100,
        'C170': parsedData.registroC170,
        'D100': parsedData.registroD100,
        'D190': parsedData.registroD190,
        'E100': parsedData.registroE100,
        'E110': parsedData.registroE110
    };
    
    Object.keys(sheets).forEach(sheetName => {
        if (sheets[sheetName].length > 0) {
            workbook.push({
                name: sheetName,
                data: sheets[sheetName]
            });
        }
    });
    
    return workbook;
}

function downloadExcel(data, fileName) {
    // Implementação simplificada do download Excel
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName.replace('.xlsx', '.csv'));
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function convertToCSV(data) {
    let csv = '';
    data.forEach(sheet => {
        csv += `\n\n=== ${sheet.name} ===\n`;
        if (sheet.data.length > 0) {
            const headers = Object.keys(sheet.data[0]);
            csv += headers.join(',') + '\n';
            sheet.data.forEach(row => {
                csv += headers.map(header => row[header] || '').join(',') + '\n';
            });
        }
    });
    return csv;
}

function exportFomentarReport() {
    if (!fomentarData) {
        logMessage('Erro: Nenhum dado FOMENTAR disponível para exportação', 'error');
        return;
    }
    
    // Criar relatório em Excel/CSV
    const reportData = generateFomentarReport();
    const fileName = `DemonstrativoFOMENTAR_${new Date().toISOString().slice(0, 10)}.csv`;
    
    const csvContent = convertFomentarToCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        logMessage('Relatório FOMENTAR exportado com sucesso', 'success');
    }
}

function generateFomentarReport() {
    // Coletar todos os dados calculados
    const report = {
        quadroA: extractQuadroAData(),
        quadroB: extractQuadroBData(),
        quadroC: extractQuadroCData(),
        quadroD: extractQuadroDData(),
        quadroE: extractQuadroEData(),
        resumo: extractResumoData(),
        configuracoes: {
            programa: document.getElementById('programType').value,
            percentualFinanciamento: document.getElementById('percentualFinanciamento').value + '%',
            icmsPorMedia: document.getElementById('icmsPorMedia').value,
            saldoCredorAnterior: document.getElementById('saldoCredorAnterior').value
        }
    };
    
    return report;
}

function extractQuadroAData() {
    return {
        item1: document.getElementById('itemA1').textContent,
        item2: document.getElementById('itemA2').textContent,
        item3: document.getElementById('itemA3').textContent,
        item4: document.getElementById('itemA4').textContent,
        item5: document.getElementById('itemA5').textContent,
        item6: document.getElementById('itemA6').textContent,
        item7: document.getElementById('itemA7').textContent,
        item8: document.getElementById('itemA8').textContent,
        item9: document.getElementById('itemA9').textContent,
        item10: document.getElementById('itemA10').textContent
    };
}

function extractQuadroBData() {
    return {
        item11: document.getElementById('itemB11').textContent,
        item12: document.getElementById('itemB12').textContent,
        item13: document.getElementById('itemB13').textContent,
        item14: document.getElementById('itemB14').textContent,
        item15: document.getElementById('itemB15').textContent,
        item17: document.getElementById('itemB17').textContent,
        item18: document.getElementById('itemB18').textContent,
        item21: document.getElementById('itemB21').textContent,
        item22: document.getElementById('itemB22').textContent,
        item23: document.getElementById('itemB23').textContent,
        item25: document.getElementById('itemB25').textContent,
        item26: document.getElementById('itemB26').textContent,
        item28: document.getElementById('itemB28').textContent
    };
}

function extractQuadroCData() {
    return {
        item32: document.getElementById('itemC32').textContent,
        item33: document.getElementById('itemC33').textContent,
        item34: document.getElementById('itemC34').textContent,
        item36: document.getElementById('itemC36').textContent,
        item37: document.getElementById('itemC37').textContent,
        item39: document.getElementById('itemC39').textContent,
        item41: document.getElementById('itemC41').textContent
    };
}

function extractQuadroDData() {
    return {
        item45: document.getElementById('itemD45')?.value || '0,00',
        item46: document.getElementById('itemD46')?.value || '0,00',
        item47: document.getElementById('itemD47')?.value || '0,00',
        item48: document.getElementById('itemD48')?.value || '0,00',
        item49: document.getElementById('itemD49')?.value || '0,00',
        item50: document.getElementById('itemD50')?.value || '0,00',
        item51: document.getElementById('itemD51')?.value || '0,00',
        item52: document.getElementById('itemD52')?.value || '0,00',
        item53: document.getElementById('itemD53')?.value || '0,00',
        item54: document.getElementById('itemD54')?.value || '0,00',
        item55: document.getElementById('itemD55')?.value || '0,00',
        item56: document.getElementById('itemD56')?.value || '0,00',
        item57: document.getElementById('itemD57')?.value || '0,00',
        item58: document.getElementById('itemD58')?.value || '0,00',
        item59: document.getElementById('itemD59')?.value || '0,00',
        item60: document.getElementById('itemD60')?.value || '0,00',
        item61: document.getElementById('itemD61Display').textContent,
        item62: document.getElementById('itemD62')?.value || '0,00',
        item63: document.getElementById('itemD63')?.value || '0,00',
        item64: document.getElementById('itemD64')?.value || '0,00',
        item65: document.getElementById('itemD65')?.value || '0,00',
        item66: document.getElementById('itemD66')?.value || '0,00',
        item67: document.getElementById('itemD67')?.value || '0,00',
        item68: document.getElementById('itemD68')?.value || '0,00',
        item69: document.getElementById('itemD69')?.value || '0,00',
        item70: document.getElementById('itemD70')?.value || '0,00',
        item71: document.getElementById('itemD71Display').textContent,
        item72: document.getElementById('itemD72Display').textContent
    };
}

function extractQuadroEData() {
    return {
        item73: document.getElementById('itemE73')?.value || '0,00',
        item74: document.getElementById('itemE74')?.value || '0,00',
        item75: document.getElementById('itemE75Display').textContent,
        item76: document.getElementById('itemE76Display').textContent,
        item77: document.getElementById('itemE77Display').textContent,
        item78: document.getElementById('itemE78')?.value || '0,00',
        item79: document.getElementById('itemE79Display').textContent,
        item80: document.getElementById('itemE80Display').textContent,
        item81: document.getElementById('itemE81Display').textContent,
        item82: document.getElementById('itemE82Display').textContent,
        item83: document.getElementById('itemE83Display').textContent,
        item84: document.getElementById('itemE84Display').textContent
    };
}

function extractResumoData() {
    return {
        totalIncentivadas: document.getElementById('totalPagarIncentivadas').textContent,
        totalNaoIncentivadas: document.getElementById('totalPagarNaoIncentivadas').textContent,
        valorFinanciamento: document.getElementById('valorFinanciamento').textContent,
        totalGeral: document.getElementById('totalGeralPagar').textContent
    };
}

function convertFomentarToCSV(reportData) {
    let csv = 'DEMONSTRATIVO DA APURAÇÃO MENSAL - FOMENTAR/PRODUZIR/MICROPRODUZIR\n';
    csv += 'Conforme Instrução Normativa nº 885/07-GSF\n';
    csv += 'Gerado em: ' + new Date().toLocaleString('pt-BR') + '\n';
    csv += 'Programa: ' + reportData.configuracoes.programa + '\n';
    csv += 'Percentual de Financiamento: ' + reportData.configuracoes.percentualFinanciamento + '\n';
    csv += 'ICMS por Média: R$ ' + reportData.configuracoes.icmsPorMedia + '\n';
    csv += 'Saldo Credor Anterior: R$ ' + reportData.configuracoes.saldoCredorAnterior + '\n\n';
    
    csv += 'QUADRO A - PROPORÇÃO DOS CRÉDITOS APROPRIADOS\n';
    csv += 'Item,Descrição,Valor\n';
    csv += '1,Saídas de Operações Incentivadas,' + reportData.quadroA.item1 + '\n';
    csv += '2,Total das Saídas,' + reportData.quadroA.item2 + '\n';
    csv += '3,Percentual das Saídas de Operações Incentivadas,' + reportData.quadroA.item3 + '\n';
    csv += '4,Créditos por Entradas,' + reportData.quadroA.item4 + '\n';
    csv += '5,Outros Créditos,' + reportData.quadroA.item5 + '\n';
    csv += '6,Estorno de Débitos,' + reportData.quadroA.item6 + '\n';
    csv += '7,Saldo Credor do Período Anterior,' + reportData.quadroA.item7 + '\n';
    csv += '8,Total dos Créditos do Período,' + reportData.quadroA.item8 + '\n';
    csv += '9,Crédito para Operações Incentivadas,' + reportData.quadroA.item9 + '\n';
    csv += '10,Crédito para Operações Não Incentivadas,' + reportData.quadroA.item10 + '\n\n';
    
    csv += 'QUADRO B - APURAÇÃO DOS SALDOS DAS OPERAÇÕES INCENTIVADAS\n';
    csv += 'Item,Descrição,Valor\n';
    csv += '11,Débito do ICMS das Operações Incentivadas,' + reportData.quadroB.item11 + '\n';
    csv += '12,Outros Débitos das Operações Incentivadas,' + reportData.quadroB.item12 + '\n';
    csv += '13,Estorno de Créditos das Operações Incentivadas,' + reportData.quadroB.item13 + '\n';
    csv += '14,Crédito para Operações Incentivadas,' + reportData.quadroB.item14 + '\n';
    csv += '15,Deduções das Operações Incentivadas,' + reportData.quadroB.item15 + '\n';
    csv += '17,Saldo Devedor do ICMS das Operações Incentivadas,' + reportData.quadroB.item17 + '\n';
    csv += '18,ICMS por Média,' + reportData.quadroB.item18 + '\n';
    csv += '21,ICMS Base para FOMENTAR/PRODUZIR,' + reportData.quadroB.item21 + '\n';
    csv += '22,Percentagem do Financiamento,' + reportData.quadroB.item22 + '\n';
    csv += '23,ICMS Sujeito a Financiamento,' + reportData.quadroB.item23 + '\n';
    csv += '25,ICMS Financiado,' + reportData.quadroB.item25 + '\n';
    csv += '26,Saldo do ICMS da Parcela Não Financiada,' + reportData.quadroB.item26 + '\n';
    csv += '28,Saldo do ICMS a Pagar da Parcela Não Financiada,' + reportData.quadroB.item28 + '\n\n';
    
    csv += 'QUADRO C - APURAÇÃO DOS SALDOS DAS OPERAÇÕES NÃO INCENTIVADAS\n';
    csv += 'Item,Descrição,Valor\n';
    csv += '32,Débito do ICMS das Operações Não Incentivadas,' + reportData.quadroC.item32 + '\n';
    csv += '33,Outros Débitos das Operações Não Incentivadas,' + reportData.quadroC.item33 + '\n';
    csv += '34,Estorno de Créditos das Operações Não Incentivadas,' + reportData.quadroC.item34 + '\n';
    csv += '36,Crédito para Operações Não Incentivadas,' + reportData.quadroC.item36 + '\n';
    csv += '37,Deduções das Operações Não Incentivadas,' + reportData.quadroC.item37 + '\n';
    csv += '39,Saldo Devedor do ICMS das Operações Não Incentivadas,' + reportData.quadroC.item39 + '\n';
    csv += '41,Saldo do ICMS a Pagar das Operações Não Incentivadas,' + reportData.quadroC.item41 + '\n\n';
    
    csv += 'QUADRO D - DEMONSTRATIVO E UTILIZAÇÃO DOS CRÉDITOS\n';
    csv += 'DEMONSTRATIVO DOS CRÉDITOS\n';
    csv += 'Item,Descrição,Valor\n';
    csv += '45,Saldo Credor da Linha Observações do Período Anterior,' + reportData.quadroD.item45 + '\n';
    csv += '46,Cheque Moradia,' + reportData.quadroD.item46 + '\n';
    csv += '47,Protege Goiás,' + reportData.quadroD.item47 + '\n';
    csv += '48,Proesporte,' + reportData.quadroD.item48 + '\n';
    csv += '49,Goyazes,' + reportData.quadroD.item49 + '\n';
    csv += '50,Pagamento Antecipado,' + reportData.quadroD.item50 + '\n';
    csv += '51,ICMS Recebido em Transferência,' + reportData.quadroD.item51 + '\n';
    csv += '52,Crédito do Fabricante de Papel e Embalagem com Reciclado,' + reportData.quadroD.item52 + '\n';
    csv += '53,Crédito Relativo ao Adicional de 2% na Alíquota do ICMS,' + reportData.quadroD.item53 + '\n';
    csv += '54,Ajuste de Valor Pago por Força de Legislação,' + reportData.quadroD.item54 + '\n';
    csv += '55,Crédito Especial para Investimento,' + reportData.quadroD.item55 + '\n';
    csv += '56,Crédito do Industrial na Produção Interna do Biodiesel,' + reportData.quadroD.item56 + '\n';
    csv += '57,Crédito na Produção de Álcool Anidro,' + reportData.quadroD.item57 + '\n';
    csv += '58,Crédito do ICMS Pago em DARE Distinto,' + reportData.quadroD.item58 + '\n';
    csv += '59,Crédito Outorgado para Industrial de Veículo Automotor,' + reportData.quadroD.item59 + '\n';
    csv += '60,Outros Créditos Autorizados pela Legislação Tributária,' + reportData.quadroD.item60 + '\n';
    csv += '61,Total dos Créditos (45 a 60),' + reportData.quadroD.item61 + '\n\n';
    
    csv += 'UTILIZAÇÃO DOS CRÉDITOS\n';
    csv += 'Item,Descrição,Valor\n';
    csv += '62,ICMS Retido via DARE ou de Substituto Tributário,' + reportData.quadroD.item62 + '\n';
    csv += '63,ICMS sobre Operações Não Incentivadas,' + reportData.quadroD.item63 + '\n';
    csv += '64,ICMS por Média,' + reportData.quadroD.item64 + '\n';
    csv += '65,ICMS da Parcela Não Financiada,' + reportData.quadroD.item65 + '\n';
    csv += '66,Transferência para Terceiros e/ou para sua(s) Filial(ais),' + reportData.quadroD.item66 + '\n';
    csv += '67,Restituição de Crédito (em Moeda),' + reportData.quadroD.item67 + '\n';
    csv += '68,Quitação de Auto de Infração,' + reportData.quadroD.item68 + '\n';
    csv += '69,Estorno de Crédito Apropriado Indevidamente,' + reportData.quadroD.item69 + '\n';
    csv += '70,Outras Deduções/Compensações,' + reportData.quadroD.item70 + '\n';
    csv += '71,Total das Deduções/Compensações (62 a 70),' + reportData.quadroD.item71 + '\n';
    csv += '72,Saldo Credor a Transportar para Período Seguinte (61-71),' + reportData.quadroD.item72 + '\n\n';
    
    csv += 'QUADRO E - MERCADORIA IMPORTADA PARA COMERCIALIZAÇÃO\n';
    csv += 'Item,Descrição,Valor\n';
    csv += '73,Total das Mercadorias Importadas,' + reportData.quadroE.item73 + '\n';
    csv += '74,Outros Acréscimos sobre Importação,' + reportData.quadroE.item74 + '\n';
    csv += '75,Total das Operações de Importação (73+74),' + reportData.quadroE.item75 + '\n';
    csv += '76,Total das Entradas do Período,' + reportData.quadroE.item76 + '\n';
    csv += '77,Percentual das Operações de Importação [(75/76)x100],' + reportData.quadroE.item77 + '\n';
    csv += '78,ICMS sobre Importação,' + reportData.quadroE.item78 + '\n';
    csv += '79,Mercadorias Importadas Excedentes,' + reportData.quadroE.item79 + '\n';
    csv += '80,ICMS sobre Importação Excedente,' + reportData.quadroE.item80 + '\n';
    csv += '81,ICMS sobre Importação Excedente Não Sujeito a Incentivo,' + reportData.quadroE.item81 + '\n';
    csv += '82,ICMS sobre Importação Sujeito ao Incentivo,' + reportData.quadroE.item82 + '\n';
    csv += '83,ICMS sobre Importação da Parcela Não Financiada,' + reportData.quadroE.item83 + '\n';
    csv += '84,Saldo do ICMS sobre Importação a Pagar (81+83),' + reportData.quadroE.item84 + '\n\n';
    
    csv += 'RESUMO DA APURAÇÃO\n';
    csv += 'Descrição,Valor\n';
    csv += 'Total a Pagar - Operações Incentivadas,' + reportData.resumo.totalIncentivadas + '\n';
    csv += 'Total a Pagar - Operações Não Incentivadas,' + reportData.resumo.totalNaoIncentivadas + '\n';
    csv += 'Valor do Financiamento FOMENTAR,' + reportData.resumo.valorFinanciamento + '\n';
    csv += 'Total Geral a Pagar,' + reportData.resumo.totalGeral + '\n\n';
    
    csv += '© 2025 Expertzy Inteligência Tributária\n';
    csv += 'Demonstrativo gerado automaticamente conforme Instrução Normativa nº 885/07-GSF\n';
    
    return csv;
}

function printFomentarReport() {
    if (!fomentarData) {
        logMessage('Erro: Nenhum dado FOMENTAR disponível para impressão', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    logMessage('Relatório FOMENTAR enviado para impressão', 'success');
}

function generatePrintContent() {
    const reportData = generateFomentarReport();
    const currentDate = new Date().toLocaleString('pt-BR');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Demonstrativo FOMENTAR</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
            h1 { text-align: center; color: #333; font-size: 18px; margin-bottom: 10px; }
            h2 { color: #666; border-bottom: 2px solid #ddd; padding-bottom: 5px; font-size: 14px; margin-top: 20px; }
            h3 { color: #555; font-size: 13px; margin-top: 15px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 11px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .resumo { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
            .config { background-color: #f0f8ff; padding: 10px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #666; }
            .valor-destaque { font-weight: bold; }
            .valor-economia { color: #28a745; }
            .valor-total { color: #dc3545; }
            @media print { 
                body { margin: 10px; font-size: 10px; }
                h1 { font-size: 16px; }
                h2 { font-size: 12px; }
                th, td { padding: 4px; font-size: 10px; }
            }
        </style>
    </head>
    <body>
        <h1>DEMONSTRATIVO DA APURAÇÃO MENSAL</h1>
        <h1>FOMENTAR/PRODUZIR/MICROPRODUZIR</h1>
        <p style="text-align: center;"><strong>Gerado em:</strong> ${currentDate}</p>
        
        <div class="config">
            <h3>Configurações da Apuração</h3>
            <p><strong>Programa:</strong> ${reportData.configuracoes.programa}</p>
            <p><strong>Percentual de Financiamento:</strong> ${reportData.configuracoes.percentualFinanciamento}</p>
            <p><strong>ICMS por Média:</strong> R$ ${reportData.configuracoes.icmsPorMedia}</p>
            <p><strong>Saldo Credor Anterior:</strong> R$ ${reportData.configuracoes.saldoCredorAnterior}</p>
        </div>
        
        <h2>QUADRO A - PROPORÇÃO DOS CRÉDITOS APROPRIADOS</h2>
        <table>
            <tr><th>Item</th><th>Descrição</th><th>Valor</th></tr>
            <tr><td>1</td><td>Saídas de Operações Incentivadas</td><td>${reportData.quadroA.item1}</td></tr>
            <tr><td>2</td><td>Total das Saídas</td><td>${reportData.quadroA.item2}</td></tr>
            <tr><td>3</td><td>Percentual das Saídas de Operações Incentivadas</td><td>${reportData.quadroA.item3}</td></tr>
            <tr><td>4</td><td>Créditos por Entradas</td><td>${reportData.quadroA.item4}</td></tr>
            <tr><td>5</td><td>Outros Créditos</td><td>${reportData.quadroA.item5}</td></tr>
            <tr><td>6</td><td>Estorno de Débitos</td><td>${reportData.quadroA.item6}</td></tr>
            <tr><td>7</td><td>Saldo Credor do Período Anterior</td><td>${reportData.quadroA.item7}</td></tr>
            <tr><td>8</td><td>Total dos Créditos do Período</td><td class="valor-destaque">${reportData.quadroA.item8}</td></tr>
            <tr><td>9</td><td>Crédito para Operações Incentivadas</td><td class="valor-destaque">${reportData.quadroA.item9}</td></tr>
            <tr><td>10</td><td>Crédito para Operações Não Incentivadas</td><td class="valor-destaque">${reportData.quadroA.item10}</td></tr>
        </table>
        
        <h2>QUADRO B - APURAÇÃO DOS SALDOS DAS OPERAÇÕES INCENTIVADAS</h2>
        <table>
            <tr><th>Item</th><th>Descrição</th><th>Valor</th></tr>
            <tr><td>11</td><td>Débito do ICMS das Operações Incentivadas</td><td>${reportData.quadroB.item11}</td></tr>
            <tr><td>12</td><td>Outros Débitos das Operações Incentivadas</td><td>${reportData.quadroB.item12}</td></tr>
            <tr><td>13</td><td>Estorno de Créditos das Operações Incentivadas</td><td>${reportData.quadroB.item13}</td></tr>
            <tr><td>14</td><td>Crédito para Operações Incentivadas</td><td>${reportData.quadroB.item14}</td></tr>
            <tr><td>15</td><td>Deduções das Operações Incentivadas</td><td>${reportData.quadroB.item15}</td></tr>
            <tr><td>17</td><td>Saldo Devedor do ICMS das Operações Incentivadas</td><td class="valor-destaque">${reportData.quadroB.item17}</td></tr>
            <tr><td>18</td><td>ICMS por Média</td><td>${reportData.quadroB.item18}</td></tr>
            <tr><td>21</td><td>ICMS Base para FOMENTAR/PRODUZIR</td><td class="valor-destaque">${reportData.quadroB.item21}</td></tr>
            <tr><td>22</td><td>Percentagem do Financiamento</td><td>${reportData.quadroB.item22}</td></tr>
            <tr><td>23</td><td>ICMS Sujeito a Financiamento</td><td class="valor-economia">${reportData.quadroB.item23}</td></tr>
            <tr><td>25</td><td>ICMS Financiado</td><td class="valor-economia">${reportData.quadroB.item25}</td></tr>
            <tr><td>26</td><td>Saldo do ICMS da Parcela Não Financiada</td><td>${reportData.quadroB.item26}</td></tr>
            <tr><td>28</td><td>Saldo do ICMS a Pagar da Parcela Não Financiada</td><td class="valor-destaque">${reportData.quadroB.item28}</td></tr>
        </table>
        
        <h2>QUADRO C - APURAÇÃO DOS SALDOS DAS OPERAÇÕES NÃO INCENTIVADAS</h2>
        <table>
            <tr><th>Item</th><th>Descrição</th><th>Valor</th></tr>
            <tr><td>32</td><td>Débito do ICMS das Operações Não Incentivadas</td><td>${reportData.quadroC.item32}</td></tr>
            <tr><td>33</td><td>Outros Débitos das Operações Não Incentivadas</td><td>${reportData.quadroC.item33}</td></tr>
            <tr><td>34</td><td>Estorno de Créditos das Operações Não Incentivadas</td><td>${reportData.quadroC.item34}</td></tr>
            <tr><td>36</td><td>Crédito para Operações Não Incentivadas</td><td>${reportData.quadroC.item36}</td></tr>
            <tr><td>37</td><td>Deduções das Operações Não Incentivadas</td><td>${reportData.quadroC.item37}</td></tr>
            <tr><td>39</td><td>Saldo Devedor do ICMS das Operações Não Incentivadas</td><td class="valor-destaque">${reportData.quadroC.item39}</td></tr>
            <tr><td>41</td><td>Saldo do ICMS a Pagar das Operações Não Incentivadas</td><td class="valor-destaque">${reportData.quadroC.item41}</td></tr>
        </table>
        
        <h2>QUADRO D - DEMONSTRATIVO E UTILIZAÇÃO DOS CRÉDITOS</h2>
        <h3>Demonstrativo dos Créditos</h3>
        <table>
            <tr><th>Item</th><th>Descrição</th><th>Valor</th></tr>
            <tr><td>45</td><td>Saldo Credor da Linha Observações do Período Anterior</td><td>${reportData.quadroD.item45}</td></tr>
            <tr><td>46</td><td>Cheque Moradia</td><td>${reportData.quadroD.item46}</td></tr>
            <tr><td>47</td><td>Protege Goiás</td><td>${reportData.quadroD.item47}</td></tr>
            <tr><td>48</td><td>Proesporte</td><td>${reportData.quadroD.item48}</td></tr>
            <tr><td>49</td><td>Goyazes</td><td>${reportData.quadroD.item49}</td></tr>
            <tr><td>50</td><td>Pagamento Antecipado</td><td>${reportData.quadroD.item50}</td></tr>
            <tr><td>51</td><td>ICMS Recebido em Transferência</td><td>${reportData.quadroD.item51}</td></tr>
            <tr><td>52</td><td>Crédito do Fabricante de Papel e Embalagem com Reciclado</td><td>${reportData.quadroD.item52}</td></tr>
            <tr><td>53</td><td>Crédito Relativo ao Adicional de 2% na Alíquota do ICMS</td><td>${reportData.quadroD.item53}</td></tr>
            <tr><td>54</td><td>Ajuste de Valor Pago por Força de Legislação</td><td>${reportData.quadroD.item54}</td></tr>
            <tr><td>55</td><td>Crédito Especial para Investimento</td><td>${reportData.quadroD.item55}</td></tr>
            <tr><td>56</td><td>Crédito do Industrial na Produção Interna do Biodiesel</td><td>${reportData.quadroD.item56}</td></tr>
            <tr><td>57</td><td>Crédito na Produção de Álcool Anidro</td><td>${reportData.quadroD.item57}</td></tr>
            <tr><td>58</td><td>Crédito do ICMS Pago em DARE Distinto</td><td>${reportData.quadroD.item58}</td></tr>
            <tr><td>59</td><td>Crédito Outorgado para Industrial de Veículo Automotor</td><td>${reportData.quadroD.item59}</td></tr>
            <tr><td>60</td><td>Outros Créditos Autorizados pela Legislação Tributária</td><td>${reportData.quadroD.item60}</td></tr>
            <tr style="background: #e8f5e8;"><td>61</td><td><strong>Total dos Créditos (45 a 60)</strong></td><td><strong>${reportData.quadroD.item61}</strong></td></tr>
        </table>
        
        <h3>Utilização dos Créditos</h3>
        <table>
            <tr><th>Item</th><th>Descrição</th><th>Valor</th></tr>
            <tr><td>62</td><td>ICMS Retido via DARE ou de Substituto Tributário</td><td>${reportData.quadroD.item62}</td></tr>
            <tr><td>63</td><td>ICMS sobre Operações Não Incentivadas</td><td>${reportData.quadroD.item63}</td></tr>
            <tr><td>64</td><td>ICMS por Média</td><td>${reportData.quadroD.item64}</td></tr>
            <tr><td>65</td><td>ICMS da Parcela Não Financiada</td><td>${reportData.quadroD.item65}</td></tr>
            <tr><td>66</td><td>Transferência para Terceiros e/ou para sua(s) Filial(ais)</td><td>${reportData.quadroD.item66}</td></tr>
            <tr><td>67</td><td>Restituição de Crédito (em Moeda)</td><td>${reportData.quadroD.item67}</td></tr>
            <tr><td>68</td><td>Quitação de Auto de Infração</td><td>${reportData.quadroD.item68}</td></tr>
            <tr><td>69</td><td>Estorno de Crédito Apropriado Indevidamente</td><td>${reportData.quadroD.item69}</td></tr>
            <tr><td>70</td><td>Outras Deduções/Compensações</td><td>${reportData.quadroD.item70}</td></tr>
            <tr style="background: #ffe8e8;"><td>71</td><td><strong>Total das Deduções/Compensações (62 a 70)</strong></td><td><strong>${reportData.quadroD.item71}</strong></td></tr>
            <tr style="background: #e8f5e8;"><td>72</td><td><strong>Saldo Credor a Transportar para Período Seguinte (61-71)</strong></td><td><strong>${reportData.quadroD.item72}</strong></td></tr>
        </table>
        
        <h2>QUADRO E - MERCADORIA IMPORTADA PARA COMERCIALIZAÇÃO</h2>
        <table>
            <tr><th>Item</th><th>Descrição</th><th>Valor</th></tr>
            <tr><td>73</td><td>Total das Mercadorias Importadas</td><td>${reportData.quadroE.item73}</td></tr>
            <tr><td>74</td><td>Outros Acréscimos sobre Importação</td><td>${reportData.quadroE.item74}</td></tr>
            <tr><td>75</td><td>Total das Operações de Importação (73+74)</td><td>${reportData.quadroE.item75}</td></tr>
            <tr><td>76</td><td>Total das Entradas do Período</td><td>${reportData.quadroE.item76}</td></tr>
            <tr><td>77</td><td>Percentual das Operações de Importação [(75/76)x100]</td><td>${reportData.quadroE.item77}</td></tr>
            <tr><td>78</td><td>ICMS sobre Importação</td><td>${reportData.quadroE.item78}</td></tr>
            <tr><td>79</td><td>Mercadorias Importadas Excedentes</td><td>${reportData.quadroE.item79}</td></tr>
            <tr><td>80</td><td>ICMS sobre Importação Excedente</td><td>${reportData.quadroE.item80}</td></tr>
            <tr><td>81</td><td>ICMS sobre Importação Excedente Não Sujeito a Incentivo</td><td>${reportData.quadroE.item81}</td></tr>
            <tr><td>82</td><td>ICMS sobre Importação Sujeito ao Incentivo</td><td>${reportData.quadroE.item82}</td></tr>
            <tr><td>83</td><td>ICMS sobre Importação da Parcela Não Financiada</td><td>${reportData.quadroE.item83}</td></tr>
            <tr style="background: #ffe8e8;"><td>84</td><td><strong>Saldo do ICMS sobre Importação a Pagar (81+83)</strong></td><td><strong>${reportData.quadroE.item84}</strong></td></tr>
        </table>
        
        <div class="resumo">
            <h2>RESUMO DA APURAÇÃO</h2>
            <table>
                <tr><td><strong>Total a Pagar - Operações Incentivadas:</strong></td><td><strong>${reportData.resumo.totalIncentivadas}</strong></td></tr>
                <tr><td><strong>Total a Pagar - Operações Não Incentivadas:</strong></td><td><strong>${reportData.resumo.totalNaoIncentivadas}</strong></td></tr>
                <tr><td><strong>Valor do Financiamento FOMENTAR:</strong></td><td><strong class="valor-economia">${reportData.resumo.valorFinanciamento}</strong></td></tr>
                <tr><td><strong>Total Geral a Pagar:</strong></td><td><strong class="valor-total">${reportData.resumo.totalGeral}</strong></td></tr>
            </table>
        </div>
        
        <div class="footer">
            <p>© 2025 Expertzy Inteligência Tributária</p>
            <p>Demonstrativo gerado automaticamente conforme Instrução Normativa nº 885/07-GSF</p>
            <p><strong>Base Legal:</strong> Instrução Normativa nº 885/07-GSF, de 22 de novembro de 2007</p>
        </div>
    </body>
    </html>
    `;
}

function logMessage(message, type = 'info') {
    const logWindow = document.getElementById('logWindow');
    if (!logWindow) return;
    
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logEntry = document.createElement('div');
    logEntry.style.marginBottom = '5px';
    
    let color = '#333';
    let icon = 'ℹ️';
    
    switch (type) {
        case 'success':
            color = '#28a745';
            icon = '✅';
            break;
        case 'error':
            color = '#dc3545';
            icon = '❌';
            break;
        case 'warning':
            color = '#ffc107';
            icon = '⚠️';
            break;
        case 'info':
        default:
            color = '#17a2b8';
            icon = 'ℹ️';
            break;
    }
    
    logEntry.innerHTML = `<span style="color: ${color};">[${timestamp}] ${icon} ${message}</span>`;
    logWindow.appendChild(logEntry);
    logWindow.scrollTop = logWindow.scrollHeight;
}