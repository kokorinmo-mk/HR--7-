import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Твой конфиг Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA8qFPrmIXQXNxdwE18rVK38t72NQ6LDzo",
    authDomain: "august2026-b6693.firebaseapp.com",
    projectId: "august2026-b6693",
    storageBucket: "august2026-b6693.firebasestorage.app",
    messagingSenderId: "473438787105",
    appId: "1:473438787105:web:7e486b3aa1fa8e7380b560",
    measurementId: "G-FDR9WNYYYX"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// === МАСКА ДЛЯ ТЕЛЕФОНА ===
function phoneMask(input) {
    // Убираем всё кроме цифр
    let digits = input.value.replace(/\D/g, '');
    
    // Ограничиваем 11 цифрами (без +7)
    if (digits.length > 11) digits = digits.slice(0, 11);
    
    // Форматируем
    let formatted = '';
    if (digits.length === 0) {
        formatted = '';
    } else {
        // Начинаем с +7
        formatted = '+7';
        
        // Код оператора (3 цифры)
        if (digits.length >= 1) {
            formatted += ' (' + digits.slice(0, 3);
        }
        if (digits.length >= 4) {
            formatted += ') ' + digits.slice(3, 6);
        }
        if (digits.length >= 7) {
            formatted += '-' + digits.slice(6, 8);
        }
        if (digits.length >= 9) {
            formatted += '-' + digits.slice(8, 10);
        }
    }
    
    input.value = formatted;
    
    // Ставим курсор в конец
    const len = input.value.length;
    input.setSelectionRange(len, len);
}

// Обработчик ввода телефона
function setupPhoneMask() {
    const phoneInput = document.querySelector('input[name="phone"]');
    
    phoneInput.addEventListener('input', function(e) {
        phoneMask(this);
    });
    
    phoneInput.addEventListener('keydown', function(e) {
        // Разрешаем backspace, delete, tab, escape, enter и т.д.
        const key = e.key;
        if (key === 'Backspace' || key === 'Delete' || key === 'Tab' || 
            key === 'Escape' || key === 'Enter' || key === 'ArrowLeft' || 
            key === 'ArrowRight' || key === 'Home' || key === 'End') {
            return;
        }
        
        // Запрещаем ввод не-цифр
        if (!/^\d$/.test(key)) {
            e.preventDefault();
        }
    });
    
    // Очищаем поле при фокусе, если там только +7
    phoneInput.addEventListener('focus', function() {
        if (this.value === '+7') {
            this.value = '';
        }
    });
    
    // Убираем курсор если поле пустое
    phoneInput.addEventListener('blur', function() {
        if (this.value === '' || this.value === '+7') {
            this.value = '';
        }
    });
}

// === ОБРАБОТЧИК РЕГИСТРАЦИИ ===
const form = document.getElementById('registrationForm');

// Инициализируем маску при загрузке
setupPhoneMask();

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fio = form.fio.value.trim();
    const inn = form.inn.value.trim();
    let phone = form.phone.value.trim();
    const email = form.email.value.trim();

    // Валидация телефона (должен содержать 11 цифр)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
        alert("❌ Введите корректный номер телефона (11 цифр после +7)");
        return;
    }

    if (!fio || !inn || !phone || !email) {
        alert("Пожалуйста, заполните все поля");
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Регистрация...";

    try {
        await addDoc(collection(db, "registrations"), {
            fio: fio,
            inn: inn,
            phone: phone,
            email: email,
            registeredAt: new Date().toISOString()
        });

        alert("✅ Вы успешно зарегистрированы! Ждём вас 7 августа.");
        form.reset();
    } catch (error) {
        console.error("Ошибка:", error);
        alert("❌ Ошибка регистрации. Попробуйте позже.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Зарегистрироваться";
    }
});