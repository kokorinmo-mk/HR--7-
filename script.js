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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// === МАСКА ТЕЛЕФОНА (исправленная) ===
function setupPhoneMask() {
    const phoneInput = document.querySelector('input[name="phone"]');
    let previousValue = '';
    
    phoneInput.addEventListener('input', function(e) {
        let cursorPos = this.selectionStart;
        let digits = this.value.replace(/\D/g, '');
        
        // Ограничиваем 11 цифрами
        if (digits.length > 11) digits = digits.slice(0, 11);
        
        // Форматируем
        let formatted = '';
        if (digits.length > 0) {
            formatted = '+7';
            if (digits.length >= 2) {
                formatted += ' (' + digits.slice(1, 4);
            }
            if (digits.length >= 5) {
                formatted += ') ' + digits.slice(4, 7);
            }
            if (digits.length >= 8) {
                formatted += '-' + digits.slice(7, 9);
            }
            if (digits.length >= 10) {
                formatted += '-' + digits.slice(9, 11);
            }
        }
        
        // Если удаляли и стало короче — корректируем курсор
        if (formatted.length < previousValue.length) {
            cursorPos = cursorPos - (previousValue.length - formatted.length);
            if (cursorPos < 0) cursorPos = 0;
        }
        
        this.value = formatted;
        previousValue = formatted;
        
        // Восстанавливаем позицию курсора
        if (cursorPos <= formatted.length) {
            this.setSelectionRange(cursorPos, cursorPos);
        }
    });
    
    phoneInput.addEventListener('keydown', function(e) {
        // Разрешаем все навигационные клавиши
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End'
        ];
        
        if (allowedKeys.includes(e.key)) {
            return; // Всё ок, маска сама обработает
        }
        
        // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Cmd+A и т.д.
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        
        // Разрешаем только цифры
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });
    
    // Инициализация при фокусе
    phoneInput.addEventListener('focus', function() {
        if (this.value === '') {
            this.value = '+7';
            previousValue = '+7';
        }
    });
}

// === ОБРАБОТЧИК РЕГИСТРАЦИИ ===
const form = document.getElementById('registrationForm');

setupPhoneMask();

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fio = form.fio.value.trim();
    const inn = form.inn.value.trim();
    let phone = form.phone.value.trim();
    const email = form.email.value.trim();

    // Извлекаем цифры из телефона
    const phoneDigits = phone.replace(/\D/g, '');
    
    if (phoneDigits.length !== 11) {
        alert("❌ Введите корректный номер телефона (11 цифр после +7)");
        return;
    }

    if (!fio || !inn || !email) {
        alert("❌ Пожалуйста, заполните все поля");
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
        // После сброса возвращаем +7 в поле телефона
        const phoneInput = document.querySelector('input[name="phone"]');
        phoneInput.value = '+7';
    } catch (error) {
        console.error("Ошибка:", error);
        alert("❌ Ошибка регистрации. Попробуйте позже.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Зарегистрироваться";
    }
});
