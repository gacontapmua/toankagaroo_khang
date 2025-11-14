// script.js

// Dữ liệu quizData đã được chèn vào index.html từ data.json
// Nếu data.json được load đúng cách (đây là cách đơn giản nhất cho JSON tĩnh):
// Bạn cần đảm bảo data.json chỉ chứa mảng [...] và được đặt TÊN KHÁC
// hoặc bạn phải sử dụng Fetch API. 
// Để đơn giản, ta sẽ copy mảng JSON vào đây và đổi tên file thành script.js:
// BỎ DÒNG SAU KHI DÙNG JSON
// const quizData = [ /* Dán toàn bộ nội dung JSON vào đây */ ];

// *** PHẢI SỬ DỤNG FETCH API ĐỂ TẢI JSON ***
// Do trình duyệt hiện đại không cho phép load file JSON trực tiếp như script tag.

let quizData = [];
let currentPage = 1;
const questionsPerPage = 5;
const totalPages = 10;

const quizContainer = document.getElementById('quiz-container');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// --- 1. Tải dữ liệu JSON (Cần chạy trên Server/GitHub Pages để hoạt động) ---
async function loadQuizData() {
    try {
        // Fetch data.json
        const response = await fetch('data.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        quizData = await response.json();
        
        // Sau khi tải xong, load trang đầu tiên
        loadPage(currentPage); 
        updatePaginationButtons();

    } catch (error) {
        console.error("Không thể tải dữ liệu quiz:", error);
        quizContainer.innerHTML = "<p class='incorrect'>Lỗi: Không thể tải câu hỏi. Hãy đảm bảo file data.json nằm đúng vị trí.</p>";
    }
}


// --- 2. Hàm chính để hiển thị câu hỏi của một trang ---
function loadPage(page) {
    currentPage = page;
    quizContainer.innerHTML = ''; // Xóa nội dung cũ

    const startIdx = (page - 1) * questionsPerPage;
    const endIdx = startIdx + questionsPerPage;
    
    // Lọc ra 5 câu hỏi cho trang hiện tại
    const currentQuestions = quizData.slice(startIdx, endIdx);

    currentQuestions.forEach(q => {
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.id = `q-${q.id}`;
        
        // Tiêu đề câu hỏi
        let questionHTML = `<h3>${q.question}</h3>`;
        
        // Hình ảnh (Nếu có)
        if (q.image_url) {
            // Dùng alt text để nhắc nhở về ảnh
            questionHTML += `<img src="${q.image_url}" alt="[Vui lòng thay thế ảnh Q${q.id}]">`; 
        }

        questionHTML += `<div class="options" onchange="checkAnswer(${q.id})">`;
        
        // Các lựa chọn đáp án (Mặc định là A, B, C, D, E)
        for (const key in q.options) {
            questionHTML += `
                <label>
                    <input type="radio" name="q${q.id}" value="${key}">
                    ${key}. ${q.options[key]}
                </label>
            `;
        }
        
        questionHTML += `</div><div id="result-${q.id}"></div>`; // Khu vực hiển thị kết quả
        
        questionBlock.innerHTML = questionHTML;
        quizContainer.appendChild(questionBlock);
    });

    updatePaginationButtons();
}


// --- 3. Logic kiểm tra đáp án ngay lập tức ---
function checkAnswer(questionId) {
    const question = quizData.find(q => q.id === questionId);
    if (!question) return;

    // Lấy lựa chọn của người dùng
    const selectedOption = document.querySelector(`input[name="q${questionId}"]:checked`);
    
    if (selectedOption) {
        const userAnswer = selectedOption.value;
        const resultDiv = document.getElementById(`result-${questionId}`);
        const allLabels = document.querySelectorAll(`#q-${questionId} .options label`);

        // Xóa tất cả các trạng thái đã đánh dấu trước đó
        allLabels.forEach(label => label.classList.remove('correct', 'incorrect'));
        resultDiv.innerHTML = '';

        // Hiển thị kết quả
        if (userAnswer === question.correct_answer) {
            resultDiv.innerHTML = `<p class="result-message correct">✅ Chính xác!</p>`;
            selectedOption.parentElement.classList.add('correct');
        } else {
            resultDiv.innerHTML = `<p class="result-message incorrect">❌ Sai rồi.</p>`;
            selectedOption.parentElement.classList.add('incorrect');
            
            // Đánh dấu đáp án đúng
            const correctAnswerLabel = document.querySelector(`input[name="q${questionId}"][value="${question.correct_answer}"]`).parentElement;
            correctAnswerLabel.classList.add('correct');
        }
        
        // Hiển thị giải thích
        resultDiv.innerHTML += `<div class="explanation"><strong>Giải thích:</strong> ${question.explanation}</div>`;

        // Vô hiệu hóa tất cả các lựa chọn sau khi trả lời
        document.querySelectorAll(`input[name="q${questionId}"]`).forEach(input => {
            input.disabled = true;
        });
    }
}


// --- 4. Logic phân trang ---
function updatePaginationButtons() {
    pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        loadPage(currentPage - 1);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        loadPage(currentPage + 1);
    }
});


// Khởi chạy ứng dụng
loadQuizData();