// ---------- DOM elements ----------
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const clearBtn = document.getElementById('clearBtn');
const resultsDiv = document.getElementById('results');
const progressStepsDiv = document.getElementById('progressSteps');
const themeToggle = document.getElementById('themeToggle');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const historyListDiv = document.getElementById('historyList');
const languageSelect = document.getElementById('languageSelect');

// ---------- Global variables ----------
let currentAnalysis = null;
let conversationHistory = [];

// ---------- Multi-language support ----------
let currentLocale = 'en';
const translations = {};

async function loadTranslations(locale) {
    try {
        const res = await fetch(`/static/locales/${locale}.json`);
        if (!res.ok) throw new Error('Translation file not found');
        const data = await res.json();
        translations[locale] = data;
        applyTranslations(locale);
    } catch (err) {
        console.error('Failed to load translations', err);
    }
}

function applyTranslations(locale) {
    const t = translations[locale];
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
                el.placeholder = t[key];
            } else {
                el.innerHTML = t[key];
            }
        }
    });
    const emptyHist = document.querySelector('.empty-history');
    if (emptyHist && t.empty_history) emptyHist.innerHTML = t.empty_history;
    const chatInput = document.getElementById('chatInput');
    if (chatInput && t.chat_placeholder) chatInput.placeholder = t.chat_placeholder;
    const selectBtnText = document.getElementById('selectBtn');
    if (selectBtnText && t.select_btn) selectBtnText.innerHTML = t.select_btn;
    const clearBtnText = document.getElementById('clearBtn');
    if (clearBtnText && t.clear_btn) clearBtnText.innerHTML = t.clear_btn;
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn && t.export_csv) exportBtn.innerHTML = t.export_csv;
    const sendBtn = document.getElementById('sendChatBtn');
    if (sendBtn && t.send_btn) sendBtn.innerHTML = t.send_btn;
}

async function changeLanguage(locale) {
    currentLocale = locale;
    localStorage.setItem('locale', locale);
    await loadTranslations(locale);
}

const savedLocale = localStorage.getItem('locale') || 'en';
if (languageSelect) languageSelect.value = savedLocale;
loadTranslations(savedLocale).then(() => changeLanguage(savedLocale));
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
}

// ---------- Theme (dark/light) ----------
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.body.classList.add('dark');
}
initTheme();
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
}

// ---------- Utility functions ----------
function updateProgress(stepId, status) {
    const step = document.getElementById(stepId);
    if (!step) return;
    if (status === 'active') {
        step.classList.add('active');
        step.classList.remove('completed');
    } else if (status === 'completed') {
        step.classList.remove('active');
        step.classList.add('completed');
    }
}

function resetProgress() {
    const steps = ['stepUpload', 'stepFeatures', 'stepAnalysis', 'stepReport'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active', 'completed');
    });
}

async function simulateStep(stepId, delayMs) {
    return new Promise(resolve => {
        updateProgress(stepId, 'active');
        setTimeout(() => {
            updateProgress(stepId, 'completed');
            resolve();
        }, delayMs);
    });
}

// ---------- Load history from backend ----------
async function loadHistory() {
    try {
        const res = await fetch('/history');
        const history = await res.json();
        if (!history.length) {
            historyListDiv.innerHTML = '<p class="empty-history" data-i18n="empty_history">No analyses yet. Upload an image.</p>';
            if (translations[currentLocale] && translations[currentLocale].empty_history) {
                document.querySelector('.empty-history').innerHTML = translations[currentLocale].empty_history;
            }
            return;
        }
        historyListDiv.innerHTML = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <span class="history-score">O‑RADS ${item.orad_score}</span>
                <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
            </div>
        `).join('');
        document.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = parseInt(el.dataset.id);
                const analysis = history.find(h => h.id === id);
                if (analysis) displayResultFromHistory(analysis);
            });
        });
    } catch (err) {
        console.error('Failed to load history', err);
    }
}

// ---------- Display result from history ----------
function displayResultFromHistory(data) {
    const dangerClass = data.orad_score >= 3 ? 'danger' : 'safe';
    const clinical = data.clinical_features;
    const clinicalHtml = `
        <div class="clinical-card">
            <h3>🏥 Clinical Features</h3>
            <div class="feature-grid">
                <div><strong>Size:</strong> ${clinical.size_mm} mm</div>
                <div><strong>Cyst Type:</strong> ${clinical.cyst_type}</div>
                <div><strong>Solid Components:</strong> ${clinical.solid_components_percentage}%</div>
                <div><strong>Vascularity:</strong> ${clinical.vascularity}</div>
                <div><strong>Septations:</strong> ${clinical.septations}</div>
                <div><strong>Wall Irregularity:</strong> ${clinical.wall_irregularity}</div>
            </div>
        </div>
    `;
    resultsDiv.innerHTML = `
        <div class="result-card ${dangerClass}">
            <h2>📊 O-RADS Score: ${data.orad_score}</h2>
            <p><strong>Confidence:</strong> ${data.confidence}%</p>
            <div class="suggestion">${data.suggestion}</div>
            ${clinicalHtml}
            <div class="llm-analysis">
                <h3>🤖 AI Analysis:</h3>
                <p>${(data.llm_analysis || '').replace(/\n/g, '<br>')}</p>
            </div>
            <button id="pdfReportBtn" class="btn-primary" style="margin-top:12px;" data-i18n="download_pdf">📄 Download PDF Report</button>
            <div class="qr-container">
                <p data-i18n="qr_code_label">Scan QR code to view this analysis on your phone</p>
                <div id="qrCode"></div>
            </div>
            <details>
                <summary>Technical Details</summary>
                <pre>${JSON.stringify(data.image_features, null, 2)}</pre>
            </details>
        </div>
    `;
    resultsDiv.classList.remove('hidden');
    const pdfBtn = document.getElementById('pdfReportBtn');
    if (pdfBtn) pdfBtn.addEventListener('click', () => generatePDF(data));
    // QR code with shortened text
    const qrDiv = document.getElementById('qrCode');
    if (qrDiv && window.QRCode) {
        qrDiv.innerHTML = '';
        const shortSummary = `O-RADS ${data.orad_score} (${data.confidence}%) | ${clinical.size_mm}mm ${clinical.cyst_type} | Solid ${clinical.solid_components_percentage}% | ${clinical.vascularity}`;
        try {
            new QRCode(qrDiv, { text: shortSummary, width: 100, height: 100 });
        } catch (e) {
            qrDiv.innerHTML = '<p style="color:red;">QR error (text too long)</p>';
            console.error(e);
        }
    }
    if (translations[currentLocale]) {
        const t = translations[currentLocale];
        if (t.download_pdf && pdfBtn) pdfBtn.innerHTML = t.download_pdf;
        const qrLabel = document.querySelector('.qr-container p');
        if (qrLabel && t.qr_code_label) qrLabel.innerHTML = t.qr_code_label;
    }
}

// ---------- PDF generation ----------
async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('O‑RADS Ultrasound Analysis Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`O‑RADS Score: ${data.orad_score} (Confidence: ${data.confidence}%)`, 20, 50);
    doc.text(`Suggestion: ${data.suggestion}`, 20, 65);
    doc.text('Clinical Features:', 20, 80);
    let y = 90;
    for (const [key, val] of Object.entries(data.clinical_features)) {
        doc.text(`${key}: ${val}`, 25, y);
        y += 8;
    }
    doc.text('AI Analysis:', 20, y+5);
    const lines = doc.splitTextToSize(data.llm_analysis || '', 170);
    doc.text(lines, 20, y+15);
    doc.save(`O-RADS_Report_${Date.now()}.pdf`);
}

// ---------- Upload and predict ----------
async function uploadFile(file) {
    resultsDiv.classList.add('hidden');
    progressStepsDiv.classList.remove('hidden');
    resetProgress();

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    await simulateStep('stepUpload', 500);
    await simulateStep('stepFeatures', 800);
    updateProgress('stepAnalysis', 'active');

    try {
        const response = await fetch('/predict', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        currentAnalysis = data;
        updateProgress('stepAnalysis', 'completed');
        await simulateStep('stepReport', 600);
        progressStepsDiv.classList.add('hidden');
        displayResult(data);
        await loadHistory();
    } catch (err) {
        progressStepsDiv.classList.add('hidden');
        resultsDiv.innerHTML = `<div class="error">Error: ${err.message}</div>`;
        resultsDiv.classList.remove('hidden');
    }
}

function displayResult(data) {
    const dangerClass = data.danger_flag ? 'danger' : 'safe';
    const clinical = data.clinical_features;
    const clinicalHtml = `
        <div class="clinical-card">
            <h3>🏥 Clinical Features</h3>
            <div class="feature-grid">
                <div><strong>Size:</strong> ${clinical.size_mm} mm</div>
                <div><strong>Cyst Type:</strong> ${clinical.cyst_type}</div>
                <div><strong>Solid Components:</strong> ${clinical.solid_components_percentage}%</div>
                <div><strong>Vascularity:</strong> ${clinical.vascularity}</div>
                <div><strong>Septations:</strong> ${clinical.septations}</div>
                <div><strong>Wall Irregularity:</strong> ${clinical.wall_irregularity}</div>
            </div>
        </div>
    `;
    resultsDiv.innerHTML = `
        <div class="result-card ${dangerClass}">
            <h2>📊 O-RADS Score: ${data.orad_score}</h2>
            <p><strong>Confidence:</strong> ${data.confidence}%</p>
            <div class="suggestion">${data.suggestion}</div>
            ${clinicalHtml}
            <div class="llm-analysis">
                <h3>🤖 AI Analysis:</h3>
                <p>${data.llm_analysis.replace(/\n/g, '<br>')}</p>
            </div>
            <button id="pdfReportBtn" class="btn-primary" style="margin-top:12px;" data-i18n="download_pdf">📄 Download PDF Report</button>
            <div class="qr-container">
                <p data-i18n="qr_code_label">Scan QR code to view this analysis on your phone</p>
                <div id="qrCode"></div>
            </div>
            <details>
                <summary>Technical Details</summary>
                <pre>${JSON.stringify(data.image_features, null, 2)}</pre>
            </details>
        </div>
    `;
    resultsDiv.classList.remove('hidden');
    const pdfBtn = document.getElementById('pdfReportBtn');
    if (pdfBtn) pdfBtn.addEventListener('click', () => generatePDF(data));
    // QR code with shortened text (fix overflow)
    const qrDiv = document.getElementById('qrCode');
    if (qrDiv && window.QRCode) {
        qrDiv.innerHTML = '';
        const shortSummary = `O-RADS ${data.orad_score} (${data.confidence}%) | ${clinical.size_mm}mm ${clinical.cyst_type} | Solid ${clinical.solid_components_percentage}% | ${clinical.vascularity}`;
        try {
            new QRCode(qrDiv, { text: shortSummary, width: 100, height: 100 });
        } catch (e) {
            qrDiv.innerHTML = '<p style="color:red;">QR error (text too long)</p>';
            console.error(e);
        }
    }
    if (translations[currentLocale]) {
        const t = translations[currentLocale];
        if (t.download_pdf && pdfBtn) pdfBtn.innerHTML = t.download_pdf;
        const qrLabel = document.querySelector('.qr-container p');
        if (qrLabel && t.qr_code_label) qrLabel.innerHTML = t.qr_code_label;
    }
}

// ---------- Export CSV ----------
async function exportCSV() {
    try {
        const res = await fetch('/history');
        const history = await res.json();
        if (!history.length) {
            alert('No history to export.');
            return;
        }
        const headers = ['ID', 'Timestamp', 'O-RADS Score', 'Confidence', 'Suggestion', 'Size mm', 'Cyst Type', 'Solid %', 'Vascularity', 'Wall Irregularity'];
        const rows = history.map(h => {
            const c = h.clinical_features;
            return [h.id, h.timestamp, h.orad_score, h.confidence, h.suggestion, c.size_mm, c.cyst_type, c.solid_components_percentage, c.vascularity, c.wall_irregularity];
        });
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `O-RADS_History_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        alert('Failed to export CSV');
    }
}

// ---------- Chat assistant ----------
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

function addMessageToChat(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;
    addMessageToChat(msg, 'user');
    conversationHistory.push({ role: 'user', content: msg });
    chatInput.value = '';

    const tempId = 'tempMsg' + Date.now();
    const tempDiv = document.createElement('div');
    tempDiv.id = tempId;
    tempDiv.classList.add('message', 'bot-message');
    tempDiv.textContent = '🤔 Thinking...';
    chatMessages.appendChild(tempDiv);

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, history: conversationHistory.slice(0, -1) })
        });
        const data = await res.json();
        document.getElementById(tempId)?.remove();
        if (data.error) {
            addMessageToChat(`⚠️ Error: ${data.error}`, 'bot');
            conversationHistory.push({ role: 'assistant', content: `Error: ${data.error}` });
        } else {
            addMessageToChat(data.answer, 'bot');
            conversationHistory.push({ role: 'assistant', content: data.answer });
        }
    } catch (err) {
        document.getElementById(tempId)?.remove();
        addMessageToChat('❌ Network error. Try again.', 'bot');
    }
}

if (sendChatBtn) sendChatBtn.addEventListener('click', sendChatMessage);
if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

// ---------- Event listeners ----------
if (selectBtn) selectBtn.addEventListener('click', () => fileInput.click());
if (fileInput) fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) uploadFile(e.target.files[0]);
});
if (clearBtn) clearBtn.addEventListener('click', () => {
    previewContainer.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    fileInput.value = '';
    currentAnalysis = null;
});
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => { uploadArea.classList.remove('drag-over'); });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) uploadFile(file);
    });
}
if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCSV);

// Initial load
loadHistory();