var btnNext = document.getElementById("next");
var scoreElement = document.getElementById("score");
var timerElement = document.getElementById("timer");
const timerBox = document.querySelector(".timer-box");

var teller = localStorage.getItem("score") ? parseInt(localStorage.getItem("score")) : 0;
var timer;
var currentQuestionIndex = 0;
var questions = [];  // Hier slaan we de vragen van de API op


document.addEventListener("DOMContentLoaded", function () {
    let score = localStorage.getItem("score") || 0;

    // Controleer of de vragen beschikbaar zijn
    if (scoreElement) {
        if (questions.length > 0) {
            scoreElement.textContent = `Jouw Score: ${score} van ${questions.length}`;
        } else {
            scoreElement.textContent = `Jouw Score: ${score} van 0`; // Zet het aantal op 0 als vragen nog niet geladen zijn
        }
    } else if (window.location.pathname.includes("vragen.html")) { 
        // Alleen quiz starten als we op de juiste pagina zitten
        fetchQuestions();
    }
});

async function fetchQuestions() {
    try {
        // let response = await fetch("https://opentdb.com/api.php?amount=3&category=21&difficulty=medium&type=multiple"); // 3 sport vragen
        // let response = await fetch("https://opentdb.com/api.php?amount=5&category=17&difficulty=easy&type=multiple"); //5 science vragen
        // let response = await fetch("https://opentdb.com/api.php?amount=4&category=19&difficulty=hard&type=multiple"); //5 mathematic vragen
        // let response = await fetch("https://opentdb.com/api.php?amount=4&category=18&difficulty=easy&type=multiple"); //5 compterscience vragen

        let category = localStorage.getItem("selectedCategory");

        let aantalVragen = 4; //hoeveel vragen?
        let moeilijkHeidsgraag = "easy"; // easy, medium, hard, 
        
        let response = await fetch(`https://opentdb.com/api.php?amount=${aantalVragen}&category=${category}&difficulty=${moeilijkHeidsgraag}&type=multiple`);
        let data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("Geen vragen gevonden!");
        }

        questions = data.results;
        localStorage.setItem("totalQuestions", questions.length); // Opslaan van het aantal vragen
        showQuestion();
    } catch (error) {
        console.error("Fout bij ophalen van vragen:", error);
    }
}


function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        localStorage.setItem("score", teller); // Sla de score op
        window.location.href = "result.html"; // Verwijs naar de resultatenpagina
    }
    

    let questionData = questions[currentQuestionIndex];
    console.log("Huidige vraag:", questionData); // Debug-log

    let questionText = document.getElementById("question");
    let answerList = document.getElementById("answers");

    if (!questionText || !answerList) {
        console.error("Elementen voor vragen of antwoorden niet gevonden!");
        return;
    }

   
    // Weergeven van de vraagnummers
    questionText.innerHTML = `Vraag ${currentQuestionIndex + 1} van ${questions.length}: ${questionData.question}`; 


    let answers = [...questionData.incorrect_answers.map(decodeHTML), decodeHTML(questionData.correct_answer)];
    answers.sort(() => Math.random() - 0.5);

    answerList.innerHTML = "";
    answers.forEach(answer => {
        let button = document.createElement("button");
        button.innerHTML = answer;
        button.addEventListener("click", function () {
            checkAnswer(button, answer === questionData.correct_answer);
        });
        answerList.appendChild(button);
    });

    startTimer();
}

function checkAnswer(button, isCorrect) {
    // console.log("checkAnswer aangeroepen!");
    timerBox.style.display = "none";
    btnNext.style.display = "block";

    clearInterval(timer);
    timerElement.textContent = "";
    disableButtons();

    if (isCorrect) {
        button.style.backgroundColor = "green";
        teller++;
    } else {
        button.style.backgroundColor = "red";

         // Markeer ook het juiste antwoord groen
         document.querySelectorAll("#answers button").forEach(btn => {
            if (btn.innerHTML === decodeHTML(questions[currentQuestionIndex].correct_answer)) {
                btn.style.backgroundColor = "green";
            }
        });
    }

    localStorage.setItem("score", teller);
    updateScore();
    
    if (currentQuestionIndex >= questions.length - 1) {
        // Wacht een korte tijd en stuur de gebruiker naar de scorepagina
        setTimeout(() => {
            window.location.href = "result.html"; // Zorg dat deze URL klopt
        }, 1500);
        }
    }

function disableButtons() {
    document.querySelectorAll("#answers button").forEach(btn => btn.disabled = true);
}

function startTimer() {
    var timeLeft = 30;
    timerElement.textContent = `Tijd over: ${timeLeft}s`;
    
    timer = setInterval(function () {
        if (timeLeft > 0) {
            timeLeft--;
            timerElement.textContent = `Tijd over: ${timeLeft}s`;
        } else {
            clearInterval(timer);
            disableButtons();
            btnNext.style.display = "block"; 
            timerBox.style.display = "none"; 

            // Markeer ook het juiste antwoord groen
            document.querySelectorAll("#answers button").forEach(btn => {
                if (btn.innerHTML === decodeHTML(questions[currentQuestionIndex].correct_answer)) {
                    btn.style.backgroundColor = "green";
            }
        });      
        }
    }, 1000);
}

btnNext.addEventListener("click", function () {
    currentQuestionIndex++;
    btnNext.style.display = "none";
    timerBox.style.display = "block";
    showQuestion();
});

function updateScore() {
    
    scoreElement.textContent = `Score: ${teller}`;
}


function decodeHTML(html) {
    let txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}



