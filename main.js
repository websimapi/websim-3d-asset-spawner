import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ASSETS = [
    "/Plant_7_Big.gltf", "/Petal_4.gltf", "/Pebble_Round_4.gltf", "/Flower_4_Group.gltf", 
    "/Bush_Common_Flowers.gltf", "/Clover_2.gltf", "/RockPath_Round_Small_3.gltf", 
    "/Flower_3_Single.gltf", "/Pine_4.gltf", "/Pine_1.gltf", "/Pebble_Round_1.gltf", 
    "/Grass_Common_Tall.gltf", "/RockPath_Round_Thin.gltf", "/DeadTree_5.gltf", 
    "/Rock_Medium_1.gltf", "/Pebble_Square_5.gltf", "/4_18_2025.glb", "/TwistedTree_3.gltf", 
    "/Grass_Wispy_Short.gltf", "/DeadTree_3.gltf", "/TwistedTree_5.gltf", "/pine_tree_high.glb", 
    "/Fern_1.gltf", "/TwistedTree_2.gltf", "/pine_tree_low.glb", "/TwistedTree_1.gltf", 
    "/Plant_1_Big.gltf", "/Grass_Common_Short.gltf", "/trash_bin.glb", 
    "/RockPath_Square_Small_2.gltf", "/Mushroom_Common.gltf", "/Petal_2.gltf", 
    "/Bush_Common.gltf", "/CommonTree_1.gltf", "/Rock_Medium_2.gltf", "/Plant_1.gltf", 
    "/Pine_3.gltf", "/RockPath_Round_Wide.gltf", "/RockPath_Square_Small_1.gltf", 
    "/CommonTree_4.gltf", "/RockPath_Square_Wide.gltf", "/Pebble_Square_6.gltf", 
    "/Petal_5.gltf", "/RockPath_Round_Small_1.gltf", "/Petal_1.gltf", "/DeadTree_4.gltf", 
    "/Flower_4_Single.gltf", "/TwistedTree_4.gltf", "/Petal_3.gltf", "/city.glb", 
    "/Pebble_Round_2.gltf", "/RockPath_Square_Small_3.gltf", "/Pebble_Round_3.gltf", 
    "/Pebble_Square_1.gltf", "/Pebble_Square_2.gltf", "/Mushroom_Laetiporus.gltf", 
    "/CommonTree_5.gltf", "/Pine_5.gltf", "/Pine_2.gltf", "/Pebble_Round_5.gltf", 
    "/Rock_Medium_3.gltf", "/Pebble_Square_3.gltf", "/Plant_7.gltf", 
    "/RockPath_Square_Thin.gltf", "/Pebble_Square_4.gltf", "/Flower_3_Group.gltf", 
    "/RockPath_Round_Small_2.gltf", "/Clover_1.gltf", "/Grass_Wispy_Tall.gltf", 
    "/DeadTree_1.gltf", "/CommonTree_3.gltf", "/DeadTree_2.gltf", "/CommonTree_2.gltf"
];

// Scene components
let scene, camera, renderer, controls;

// DOM Elements
const adminMenu = document.getElementById('admin-menu');
const assetListUl = document.getElementById('asset-list');
const infoBox = document.getElementById('info');

// Loaders
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333344);
    scene.fog = new THREE.Fog(0x333344, 10, 80);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera from going under the ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4a5d45, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Populate Asset Menu
    ASSETS.forEach(path => {
        const li = document.createElement('li');
        const name = path.split('/').pop().replace(/\.(gltf|glb)$/, '').replace(/_/g, ' ');
        li.textContent = name;
        li.dataset.path = path;
        assetListUl.appendChild(li);
    });

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyDown, false);
    assetListUl.addEventListener('click', onAssetClick, false);
    
    // Start animation loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (event.key === '`' || event.key === '~') {
        event.preventDefault();
        adminMenu.classList.toggle('visible');
    }
}

function onAssetClick(event) {
    if (event.target.tagName === 'LI') {
        const path = event.target.dataset.path;
        if (path) {
            infoBox.textContent = `Loading ${event.target.textContent}...`;
            gltfLoader.load(path, 
                (gltf) => {
                    const model = gltf.scene;
                    
                    // Center and scale model
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());
                    
                    model.position.sub(center);
                    
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 0) { // Avoid division by zero
                       // a heuristic for scaling, can be adjusted
                       const scale = 2 / maxDim;
                       // but don't overscale small things
                       if (maxDim < 0.5) model.scale.set(1,1,1);
                    }

                    // Random position on the ground plane
                    model.position.x += (Math.random() - 0.5) * 40;
                    model.position.z += (Math.random() - 0.5) * 40;
                    
                    // Enable shadows for all meshes in the model
                    model.traverse(function(node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    });

                    scene.add(model);
                    infoBox.textContent = `${event.target.textContent} added!`;
                    setTimeout(() => infoBox.textContent = 'Press `~` to toggle asset menu', 2000);
                },
                undefined, // onProgress callback (optional)
                (error) => {
                    console.error('An error happened while loading the model:', error);
                    infoBox.textContent = `Error loading ${event.target.textContent}`;
                }
            );
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();

