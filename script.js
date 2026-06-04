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

// === ПРОСТАЯ МАСКА ТЕЛЕФОНА (без багов) ===
function setupPhoneMask() {
    const phoneInput = document.querySelector('input[name="phone"]');
    
    phoneInput.addEventListener('input', function(e) {
        // Запоминаем, где был курсор
        const cursorPos = this.selectionStart;
        
        // Убираем всё кроме цифр
        let digits = this.value.replace(/\D/g, '');
        
        // Ограничиваем 11 цифрами
        if (digits.length > 11) digits = digits.slice(0, 11);
        
        // Форматируем
        let formatted = '';
        if (digits.length > 0) {
            // Первая цифра всегда 7 (или заменяем на 7)
            if (digits[0] !== '7') {
                digits = '7' + digits.slice(1);
            }
            formatted = '+7';
            
            if (digits.length > 1) {
                const code = digits.slice(1, 4);
                formatted += ' (' + code;
            }
            if (digits.length > 4) {
                const part1 = digits.slice(4, 7);
                formatted += ') ' + part1;
            }
            if (digits.length > 7) {
                const part2 = digits.slice(7, 9);
                formatted += '-' + part2;
            }
            if (digits.length > 9) {
                const part3 = digits.slice(9, 11);
                formatted += '-' + part3;
            }
            
            // Добавляем закрывающую скобку если есть код
            if (digits.length >= 4 && digits.length <= 7) {
                formatted = formatted.replace('(', '+7 (').replace(')', '');
                if (digits.length >= 4) formatted = formatted.slice(0, 6) + ')' + formatted.slice(6);
            }
        }
        
        // Упрощённый вариант форматирования
        if (digits.length === 0) {
            formatted = '';
        } else if (digits.length <= 1) {
            formatted = '+7';
        } else if (digits.length <= 4) {
            formatted = `+7 (${digits.slice(1)}`;
        } else if (digits.length <= 7) {
            formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
        } else if (digits.length <= 9) {
            formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        } else {
            formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
        }
        
        // Обновляем значение
        this.value = formatted;
        
        // Пытаемся восстановить курсор
        let newCursorPos = cursorPos;
        if (formatted.length < cursorPos) {
            newCursorPos = formatted.length;
        }
        this.setSelectionRange(newCursorPos, newCursorPos);
    });
    
    // Обработка клавиш
    phoneInput.addEventListener('keydown', function(e) {
        // Разрешаем Backspace, Delete, стрелки
        const navigationKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
                               'ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (navigationKeys.includes(e.key)) {
            return;
        }
        
        // Разрешаем Ctrl/Cmd комбинации
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        
        // Остальное — только цифры
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });
    
    // При фокусе, если пусто — ставим +7
    phoneInput.addEventListener('focus', function() {
        if (this.value === '') {
            this.value = '+7';
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

    // Проверяем телефон (должно быть 11 цифр)
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