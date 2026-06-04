import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

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

// Маска телефона
function setupPhoneMask() {
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput && window.Inputmask) {
        Inputmask({
            mask: "+7 999 999-99-99",
            showMaskOnHover: false,
            showMaskOnFocus: true,
            clearIncomplete: false,
            placeholder: "_",
            removeMaskOnSubmit: false
        }).mask(phoneInput);
    }
}

const form = document.getElementById('registrationForm');

document.addEventListener('DOMContentLoaded', function() {
    setupPhoneMask();
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fio = form.fio.value.trim();
    const inn = form.inn.value.trim();
    let phone = form.phone.value.trim();
    const email = form.email.value.trim().toLowerCase();

    const phoneDigits = phone.replace(/\D/g, '');
    
    if (phoneDigits.length !== 11) {
        alert("❌ Введите корректный номер телефона (11 цифр)");
        return;
    }

    if (!fio || !inn || !email) {
        alert("❌ Пожалуйста, заполните все поля");
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        alert("❌ Введите корректный email");
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Проверка...";

    try {
        // ПРОВЕРКА НА ДУБЛИКАТЫ
        // Проверяем email
        const emailQuery = query(collection(db, "registrations"), where("email", "==", email));
        const emailResult = await getDocs(emailQuery);
        
        if (!emailResult.empty) {
            alert("❌ Этот email уже зарегистрирован на мероприятие");
            submitBtn.disabled = false;
            submitBtn.textContent = "Зарегистрироваться";
            return;
        }
        
        // Проверяем телефон
        const phoneQuery = query(collection(db, "registrations"), where("phone", "==", phoneDigits));
        const phoneResult = await getDocs(phoneQuery);
        
        if (!phoneResult.empty) {
            alert("❌ Этот номер телефона уже зарегистрирован на мероприятие");
            submitBtn.disabled = false;
            submitBtn.textContent = "Зарегистрироваться";
            return;
        }
        
        // Если всё ок — регистрируем
        submitBtn.textContent = "Регистрация...";
        
        await addDoc(collection(db, "registrations"), {
            fio: fio,
            inn: inn,
            phone: phoneDigits,
            email: email,
            registeredAt: new Date().toISOString()
        });

        alert("✅ Вы успешно зарегистрированы! Ждём вас 7 августа.");
        form.reset();
        
        setTimeout(() => {
            const phoneInput = document.querySelector('input[name="phone"]');
            if (phoneInput) phoneInput.value = '';
        }, 10);
        
    } catch (error) {
        console.error("Ошибка:", error);
        alert("❌ Ошибка регистрации. Попробуйте позже.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Зарегистрироваться";
    }
});