document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    const form = document.getElementById('courseRegistrationForm');
    const statusMessage = document.getElementById('form-status-message');

    // החלף את ה-URL הזה ב-URL של ה-Web App שלך מ-Google Apps Script (תקבל אותו בשלב הבא)
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbza9JFY8My0NzkdsfeQz8BBgWg4ZWFjT4qNAlVieWywwmOJahkGqJ5vbTw45C-wk9Cwvw/exec'; 

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // מונע שליחה רגילה של הטופס

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!name || !email) {
            displayMessage('אנא מלאו את כל השדות.', 'error');
            return;
        }

        // וידוא בסיסי של כתובת מייל (אפשר להוסיף Regex מורכב יותר)
        if (!validateEmail(email)) {
            displayMessage('אנא הזינו כתובת מייל תקינה.', 'error');
            return;
        }

        // הצגת הודעת "שולח..."
        displayMessage('שולח הרשמה...', 'processing');
        const submitButton = form.querySelector('.form-submit-button');
        submitButton.disabled = true;
        submitButton.textContent = 'מעבד בקשה...';


        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        
        // במקום להשתמש ב-fetch ישירות ל-Google Sheets (שלא אפשרי בצד לקוח בצורה מאובטחת),
        // נשתמש ב-fetch כדי לשלוח את הנתונים ל-Web App של Google Apps Script.
        fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData // FormData מתאים ל-doPost ב-Apps Script
        })
        .then(response => response.json()) // Apps Script Web App אמור להחזיר JSON
        .then(data => {
            if (data.result === "success") {
                displayMessage('תודה על הרשמתך! המייל הראשון בדרך אליך.', 'success');
                form.reset(); // איפוס הטופס
            } else if (data.error && data.error.includes("already registered")) {
                displayMessage('כתובת המייל הזו כבר רשומה לקורס.', 'error');
            }
            else {
                console.error('Server response error:', data);
                displayMessage('אירעה שגיאה ברישום. אנא נסו שוב מאוחר יותר.', 'error');
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            displayMessage('אירעה שגיאה בתקשורת. אנא בדקו את חיבור האינטרנט ונסו שוב.', 'error');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'אני רוצה להצטרף לקורס!';
        });
    });

    function displayMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type; // 'success', 'error', or 'processing' for styling
    }

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});