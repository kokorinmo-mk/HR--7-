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

function setupPhoneMask() {
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput && typeof Inputmask !== 'undefined') {
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

async function checkDuplicate(email, phoneDigits) {
    try {
        // Проверка по email
        const emailQuery = query(collection(db, "registrations"), where("email", "==", email));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
            return { isDuplicate: true, field: "email" };
        }
        
        // Проверка по телефону
        const phoneQuery = query(collection(db, "registrations"), where("phone", "==", phoneDigits));
        const phoneSnapshot = await getDocs(phoneQuery);
        
        if (!phoneSnapshot.empty) {
            return { isDuplicate: true, field: "phone" };
        }
        
        return { isDuplicate: false };
    } catch (error) {
        console.error("Ошибка при проверке дубликатов:", error);
        // Если ошибка, разрешаем регистрацию (чтобы не блокировать пользователя)
        return { isDuplicate: false, error: true };
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
        const duplicateCheck = await checkDuplicate(email, phoneDigits);
        
        if (duplicateCheck.isDuplicate) {
            if (duplicateCheck.field === "email") {
                alert("❌ Этот email уже зарегистрирован на мероприятие");
            } else if (duplicateCheck.field === "phone") {
                alert("❌ Этот номер телефона уже зарегистрирован на мероприятие");
            }
            submitBtn.disabled = false;
            submitBtn.textContent = "Зарегистрироваться";
            return;
        }
        
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
        console.error("Ошибка регистрации:", error);
        
        // Детальная обработка ошибок Firebase
        if (error.code === 'permission-denied') {
            alert("❌ Ошибка доступа к базе данных. Проверьте правила Firestore.");
        } else if (error.code === 'unavailable') {
            alert("❌ Сервер временно недоступен. Попробуйте позже.");
        } else {
            alert("❌ Ошибка регистрации: " + (error.message || "Попробуйте позже"));
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Зарегистрироваться";
    }
});