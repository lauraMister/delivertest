document.addEventListener('DOMContentLoaded', function() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const welcomeText = document.getElementById('welcome-text');
    const instructionsText = document.getElementById('instructions');
    const typingTextElement = document.getElementById('typing-text');
    const startButton = document.getElementById('start-button');
    const arScene = document.getElementById('ar-scene');
    const arVideo = document.getElementById('ar-video');

    let isFirstStep = true;

    function typeWriter(text, element, speed = 50, callback) {
        let i = 0;
        element.innerHTML = "";
        element.classList.add('cursor');
        element.style.opacity = "1";
        
        function type() {
            if (i < text.length) {
                if (text.substring(i, i + 4) === "<br>") {
                    element.innerHTML += "<br>";
                    i += 4;
                } else {
                    element.innerHTML += text.charAt(i);
                    i++;
                }
                setTimeout(type, speed);
            } else {
                element.classList.remove('cursor');
                if (callback) callback();
            }
        }
        type();
    }

    startButton.addEventListener('click', () => {
        if (isFirstStep) {
            welcomeText.classList.add('fade-out-up');
            startButton.classList.add('hidden');
            
            setTimeout(() => {
                instructionsText.classList.add('fade-in-up');
                startButton.textContent = "vai";
                
                setTimeout(() => {
                    typeWriter("quando si apre la fotocamera,<br>inquadra la mappa", typingTextElement, 10, () => {
                        startButton.classList.remove('hidden');
                    });
                }, 800);
            }, 800);
            
            isFirstStep = false;
        } else {
            // Nasconde la schermata di benvenuto e mostra la scena AR
            welcomeScreen.style.display = 'none';
            arScene.style.display = 'block';

            // Avvia esplicitamente il motore MindAR e richiede i permessi della fotocamera
            const arSystem = arScene.systems["mindar-image-system"];
            arSystem.start();

            // Gestione della riproduzione del video al rilevamento del target
            const targetEntity = document.querySelector('[mindar-image-target]');
            
            targetEntity.addEventListener('targetFound', () => {
                arVideo.play();
            });

            targetEntity.addEventListener('targetLost', () => {
                arVideo.pause();
            });
        }
    });
});