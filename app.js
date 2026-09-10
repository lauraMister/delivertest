import * as THREE from "three";
import { MindARThree } from "mindar-image-three";


/* =========================================
   ELEMENTI INTERFACCIA
========================================= */

const welcomeScreen =
    document.querySelector("#welcome-screen");

const welcomeText =
    document.querySelector("#welcome-text");

const instructions =
    document.querySelector("#instructions");

const typingText =
    document.querySelector("#typing-text");

const startButton =
    document.querySelector("#start-button");

const arMessage =
    document.querySelector("#ar-message");

const arVideo =
    document.querySelector("#ar-video");


let firstStep = true;

let mindarThree = null;

let arStarted = false;


/* =========================================
   EFFETTO MACCHINA DA SCRIVERE
========================================= */

function typeWriter(
    text,
    element,
    speed = 35,
    callback
) {

    let i = 0;

    element.innerHTML = "";

    element.style.opacity = "1";

    element.classList.add("cursor");


    function type() {

        if (i < text.length) {

            if (
                text.substring(i, i + 4) === "<br>"
            ) {

                element.innerHTML += "<br>";

                i += 4;

            } else {

                element.innerHTML +=
                    text.charAt(i);

                i++;
            }


            setTimeout(
                type,
                speed
            );

        } else {

            element.classList.remove(
                "cursor"
            );


            if (callback) {
                callback();
            }
        }
    }


    type();
}



/* =========================================
   CREA ESPERIENZA AR
========================================= */

function createAR() {

    mindarThree =
        new MindARThree({

            container:
                document.querySelector(
                    "#ar-container"
                ),

            imageTargetSrc:
                "./asset/image.mind",

            filterMinCF:
                0.001,

            filterBeta:
                0.001
        });


    const {
        renderer,
        scene,
        camera
    } = mindarThree;


    /* -----------------------------------------
       Anchor associato al target index 0
    ----------------------------------------- */

    const anchor =
        mindarThree.addAnchor(0);



    /* -----------------------------------------
       VIDEO TEXTURE
    ----------------------------------------- */

    const videoTexture =
        new THREE.VideoTexture(arVideo);


    videoTexture.colorSpace =
        THREE.SRGBColorSpace;


    videoTexture.minFilter =
        THREE.LinearFilter;

    videoTexture.magFilter =
        THREE.LinearFilter;


    const geometry =
        new THREE.PlaneGeometry(
            1,
            0.5625
        );


    const material =
        new THREE.MeshBasicMaterial({

            map:
                videoTexture,

            side:
                THREE.DoubleSide

        });


    const videoPlane =
        new THREE.Mesh(
            geometry,
            material
        );


    /*
       Il piano viene posizionato leggermente
       davanti al target per evitare flickering.
    */

    videoPlane.position.z =
        0.01;


    anchor.group.add(
        videoPlane
    );



    /* =========================================
       TARGET TROVATO
    ========================================= */

    anchor.onTargetFound = () => {

        console.log(
            "Target trovato"
        );


        arMessage.style.display =
            "none";


        arVideo.play()
            .catch((error) => {

                console.warn(
                    "Impossibile avviare il video:",
                    error
                );

            });

    };



    /* =========================================
       TARGET PERSO
    ========================================= */

    anchor.onTargetLost = () => {

        console.log(
            "Target perso"
        );


        arVideo.pause();


        arMessage.textContent =
            "Inquadra la mappa";


        arMessage.style.display =
            "block";

    };



    return {
        renderer,
        scene,
        camera
    };
}



/* =========================================
   AVVIA MINDAR
========================================= */

async function startAR() {

    if (arStarted) {
        return;
    }


    arStarted = true;


    try {

        /*
           Importante:
           MindAR parte SOLO dopo il click
           dell'utente.

           È questa la configurazione che nel
           test ha fatto funzionare correttamente
           la fotocamera.
        */

        const {
            renderer,
            scene,
            camera
        } = createAR();


        arMessage.textContent =
            "Avvio fotocamera...";


        arMessage.style.display =
            "block";


        await mindarThree.start();


        console.log(
            "MindAR avviato"
        );


        arMessage.textContent =
            "Inquadra la mappa";


        /*
           Prepariamo il video tramite gesture
           dell'utente.

           Serve soprattutto su iPhone/Safari.
        */

        try {

            await arVideo.play();

            arVideo.pause();

            arVideo.currentTime = 0;

        } catch (error) {

            console.log(
                "Video in attesa del target",
                error
            );

        }



        renderer.setAnimationLoop(
            () => {

                renderer.render(
                    scene,
                    camera
                );

            }
        );


    } catch (error) {

        console.error(
            "Errore MindAR:",
            error
        );


        /*
           Ripuliamo l'istanza MindAR fallita
           prima di permettere un nuovo tentativo,
           altrimenti un retry richiama createAR()
           e crea una SECONDA istanza sopra quella
           vecchia (doppia richiesta fotocamera,
           stream duplicati, memory leak).
        */

        if (mindarThree) {

            try {

                mindarThree.renderer
                    ?.setAnimationLoop(null);

                await mindarThree.stop();

            } catch (cleanupError) {

                console.warn(
                    "Errore durante il cleanup di MindAR:",
                    cleanupError
                );

            }

            mindarThree = null;

        }


        arStarted = false;


        arMessage.innerHTML =
            `
            Errore durante l'avvio AR.<br>
            ${error.message || error}
            `;


        arMessage.style.display =
            "block";

    }
}



/* =========================================
   PULSANTE INTRO
========================================= */

startButton.addEventListener(
    "click",
    async () => {


        /* -------------------------------------
           PRIMO CLICK
        ------------------------------------- */

        if (firstStep) {

            welcomeText.classList.add(
                "fade-out-up"
            );


            startButton.classList.add(
                "hidden"
            );


            setTimeout(
                () => {

                    instructions.classList.add(
                        "fade-in-up"
                    );


                    startButton.textContent =
                        "vai";


                    setTimeout(
                        () => {

                            typeWriter(
                                "quando si apre la fotocamera,<br>inquadra la mappa",
                                typingText,
                                35,
                                () => {

                                    startButton.classList.remove(
                                        "hidden"
                                    );

                                }
                            );

                        },
                        600
                    );

                },
                600
            );


            firstStep = false;

            return;
        }



        /* -------------------------------------
           SECONDO CLICK: AVVIO AR
        ------------------------------------- */

        startButton.classList.add(
            "hidden"
        );


        welcomeScreen.style.display =
            "none";


        await startAR();

    }
);