import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

const status = document.querySelector("#status");
const startButton = document.querySelector("#startButton");

status.innerHTML = "JavaScript caricato ✓";

let mindarThree;

try {

    status.innerHTML += "<br>Creazione MindAR...";

    mindarThree = new MindARThree({
        container: document.querySelector("#ar-container"),
        imageTargetSrc: "./asset/image.mind"
    });

    status.innerHTML += "<br>MindAR creato ✓";

    const { renderer, scene, camera } = mindarThree;

    const anchor = mindarThree.addAnchor(0);

    const geometry = new THREE.PlaneGeometry(1, 1);

    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7
    });

    const plane = new THREE.Mesh(geometry, material);

    anchor.group.add(plane);

    status.innerHTML += "<br>Anchor creato ✓";

    startButton.addEventListener("click", async () => {

        try {

            status.innerHTML += "<br>Avvio fotocamera...";

            await mindarThree.start();

            status.innerHTML += "<br>Fotocamera avviata ✓";

            startButton.style.display = "none";

            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });

        } catch (error) {

            status.innerHTML += `
                <br><strong style="color:red">
                ERRORE START:<br>
                ${error.message || error}
                </strong>
            `;

            console.error(error);
        }

    });

} catch (error) {

    status.innerHTML += `
        <br><strong style="color:red">
        ERRORE INIZIALIZZAZIONE:<br>
        ${error.message || error}
        </strong>
    `;

    console.error(error);
}
