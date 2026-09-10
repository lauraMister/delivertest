import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

const start = async () => {

    console.log("Avvio MindAR...");

    const mindarThree = new MindARThree({
        container: document.querySelector("#ar-container"),
        imageTargetSrc: "./asset/image.mind"
    });

    const { renderer, scene, camera } = mindarThree;

    const anchor = mindarThree.addAnchor(0);

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true
    });

    const cube = new THREE.Mesh(geometry, material);

    cube.position.z = 0.5;

    anchor.group.add(cube);

    try {

        console.log("Richiesta accesso fotocamera...");

        await mindarThree.start();

        console.log("MindAR avviato correttamente");

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });

    } catch (error) {

        console.error("ERRORE MINDAR:", error);

        document.body.innerHTML = `
            <div style="
                padding:20px;
                font-family:Arial;
                color:red;
                background:white;
            ">
                <h2>Errore MindAR</h2>
                <pre>${error.message || error}</pre>
            </div>
        `;
    }
};

start();
