const mindarThree = new window.MINDAR.IMAGE.MindARThree({
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

anchor.group.add(cube);

async function start() {
    await mindarThree.start();

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

start();
