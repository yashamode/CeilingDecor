// Scene setup
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#ADD8E6');
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor('#ADD8E6');
const isDesktop = window.matchMedia("(min-width: 1200px)").matches;
const offset = isDesktop ? 370 : 300;


const light = new THREE.DirectionalLight( 0xFFFFFF );
scene.add( light );

// const controls = new OrbitControls( camera, renderer.domElement );

const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 10, 10, 10 );
scene.add( spotLight );

renderer.setSize(window.innerWidth - offset, window.innerHeight);
const rightDiv = document.querySelector('.right');
rightDiv.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 4);
pointLight.position.set(0, 2, 5);
scene.add(pointLight);

// Wall material
const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080, // Wall color
    roughness: 0.2,  // Lower value makes it smoother
    metalness: 0.5,  // Lower value keeps it non-metallic
    side: THREE.DoubleSide // Ensure both sides are rendered
});

let walls = {}; // Store references to the walls
let ceilingTop, ceilingBottom; // References to the ceiling meshes
let currentModel = null; // Reference to the currently loaded GLB model

// Function to create walls for a rectangular room
function createRectangularRoom() {
    removeCurrentWalls();
    removeCurrentCeiling(); // Remove the existing ceiling
    removeCurrentModel(); // Remove the existing GLB model

    walls.backWall = new THREE.Mesh(new THREE.PlaneGeometry(15, 5), wallMaterial);
    walls.backWall.position.set(0, 0, -4);
    scene.add(walls.backWall);

    walls.leftWall = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 5), wallMaterial);
    walls.leftWall.position.set(-7.5, 0, 0);
    walls.leftWall.rotation.y = Math.PI / 2;
    scene.add(walls.leftWall);

    walls.rightWall = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 5), wallMaterial);
    walls.rightWall.position.set(7.5, 0, 0);
    walls.rightWall.rotation.y = -Math.PI / 2;
    scene.add(walls.rightWall);

    createCeiling(15, 7.5); // Create the ceiling with rectangular dimensions
}

// Function to create walls for a square room
function createSquareRoom() {
    removeCurrentWalls();
    removeCurrentCeiling(); // Remove the existing ceiling
    removeCurrentModel(); // Remove the existing GLB model

    walls.backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), wallMaterial);
    walls.backWall.position.set(0, 0, -5);
    scene.add(walls.backWall);

    walls.leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), wallMaterial);
    walls.leftWall.position.set(-5, 0, 0);
    walls.leftWall.rotation.y = Math.PI / 2;
    scene.add(walls.leftWall);

    walls.rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), wallMaterial);
    walls.rightWall.position.set(5, 0, 0);
    walls.rightWall.rotation.y = -Math.PI / 2;
    scene.add(walls.rightWall);

    createCeiling(10, 10); // Create the ceiling with square dimensions
}

// Function to create the ceiling
function createCeiling(width, depth) {
    // Remove existing ceiling if present
    removeCurrentCeiling();

    // Top side of the ceiling
    ceilingTop = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
    ceilingTop.position.set(0, 2.5, 0);
    ceilingTop.rotation.x = -Math.PI / 2;
    scene.add(ceilingTop);

    // Bottom side of the ceiling
    ceilingBottom = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    ceilingBottom.position.set(0, 2.5, 0);
    ceilingBottom.rotation.x = Math.PI / 2;
    scene.add(ceilingBottom);
}

// Function to remove current walls
function removeCurrentWalls() {
    for (const key in walls) {
        if (walls.hasOwnProperty(key)) {
            scene.remove(walls[key]);
        }
    }
    walls = {};
}

// Function to remove current ceiling
function removeCurrentCeiling() {
    if (ceilingTop) {
        scene.remove(ceilingTop);
        ceilingTop = null;
    }
    if (ceilingBottom) {
        scene.remove(ceilingBottom);
        ceilingBottom = null;
    }
}

// Function to remove the current GLB model
function removeCurrentModel() {
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }
}

//changeGlbColor
function changeGLBColor(gltf, color) {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            if (child.material) {
                // If the material supports color, change it
                if (child.material.color) {
                    child.material.color.set(color);
                }
            }
        }
    });
}

//changeGlbTexturee
// function changeGLBTexture(gltf, texturePath) {
//     const textureLoader = new THREE.TextureLoader();
//     const texture = textureLoader.load(texturePath);

//     gltf.scene.traverse((child) => {
//         if (child.isMesh) {
//             if (child.material) {
//                 child.material.map = texture;
//                 child.material.needsUpdate = true; // Ensure the material updates
//             }
//         }
//     });
// }


document.getElementById('room-picker').addEventListener('change', function() {
    const selectedRoomType = this.value;
    const templates = document.querySelectorAll('.ceiling-card');

    templates.forEach(template => {
        if (template.getAttribute('data-room-type') === selectedRoomType) {
            template.style.display = 'block';
        } else {
            template.style.display = 'none';
        }
    });
});

// GLTF loader setup
const loader = new THREE.GLTFLoader();

// Function to load GLB model
function loadGLBModel(path, roomType) {
    removeCurrentModel(); // Remove any existing model before loading a new one
    // scene.remove(ceilingBottom)
    // scene.remove(ceilingTop)
    if (roomType === 'Rectangle') {
        loader.load(path, (gltf) => {
            currentModel = gltf.scene;
            currentModel.scale.set(2.5, 1.5, 1.7); // Adjust the scale as needed
            currentModel.position.set(-7.5, 2, -3.5); // Center it in the ceiling area
              // Apply the initial color from the color picker
        applyColorToModel(currentModel, document.getElementById('ceilingColorPicker').value);
            scene.add(currentModel);
        }, undefined, (error) => {
            console.error('An error occurred while loading the GLB ceiling model:', error);
        });
    }
    else if (roomType === 'Square') {
        loader.load(path, (gltf) => {
            currentModel = gltf.scene;
            currentModel.scale.set(2.5, 2, 2.6); // Adjust the scale as needed
            currentModel.position.set(-5, 1.8, -5.5); // Center it in the ceiling area
            // changeGLBTexture(gltf, '../textures/red_fabric.avif');
              // Apply the initial color from the color picker
        applyColorToModel(currentModel, document.getElementById('ceilingColorPicker').value);

            scene.add(currentModel);
        }, undefined, (error) => {
            console.error('An error occurred while loading the GLB ceiling model:', error);
        });
    }
}

// Handle design button clicks
document.querySelectorAll('.btn[data-design]').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor behavior

        // Get the design path from the clicked button
        const selectedDesign = event.currentTarget.getAttribute('data-design');
        const selectedRoomType = event.currentTarget.getAttribute('room-type');

        // Load the selected design
        loadGLBModel(selectedDesign, selectedRoomType);
    });
});

// Function to apply color to the model
function applyColorToModel(model, color) {
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.color.set(color);
        }
    });
}

// Listen to color picker changes
document.getElementById('ceilingColorPicker').addEventListener('input', (event) => {
    const selectedColor = event.target.value;

    // Apply the selected color to the current model
    if (currentModel) {
        applyColorToModel(currentModel, selectedColor);
    }
});
// Load the initial room and model
createRectangularRoom();
loadGLBModel('./glbs/falseCeiling2.glb');

// Function to handle room type change
function onRoomTypeChange() {
    removeCurrentModel(); // Ensure the GLB model is removed before changing the room type
    const selectedRoom = document.getElementById('room-picker').value;
    if (selectedRoom === 'rectangular') {
        createRectangularRoom();
    } else if (selectedRoom === 'square') {
        createSquareRoom();
    }
    loadGLBModel(document.getElementById('design-picker').value); // Reload model to position correctly
}

// Handle room picker changes
document.getElementById('room-picker').addEventListener('change', onRoomTypeChange);


// // Handle design picker changes
// document.getElementById('design-picker').addEventListener('change', (event) => {
//     const selectedDesign = event.target.value;
//     loadGLBModel(selectedDesign);
// });

// Position the camera
camera.position.z = 10;

// Mouse controls
let isMouseDown = false;
let previousMousePosition = { x: 0, y: 0 };

function rotateWalls(deltaX, deltaY) {
    scene.rotation.y += deltaX * 0.005;
    scene.rotation.x += deltaY * 0.005;
}

// Mouse events
window.addEventListener('mousedown', (event) => {
    isMouseDown = true;
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

window.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        rotateWalls(deltaX, deltaY);
    }
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

// Ceiling bottom color change
// const colorPicker = document.getElementById('color-picker');
// colorPicker.addEventListener('input', (event) => {
//     const selectedColor = event.target.value;
//     ceilingBottom.material.color.set(selectedColor);
// });

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Adjust on window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
