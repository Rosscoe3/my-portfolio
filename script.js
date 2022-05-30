import './style.css'
import * as THREE from 'https://cdn.skypack.dev/three@0.127.0/build/three.module.js';
//import * as THREE from 'https://unpkg.com/three@0.138/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'dat.gui'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/loaders/RGBELoader.js';
import * as TWEEN from 'https://cdn.skypack.dev/@tweenjs/tween.js'

// import * as THREE from 'three';
// import { OrbitControls } from 'OrbitControls'
// import { GLTFLoader } from 'GLTFLoader';
// import { RGBELoader } from 'RGBELoader';
// import * as TWEEN from 'TWEEN'

// Debug
//const gui = new dat.GUI()

//** CANVAS AND SCENE */
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
//scene.background = new THREE.Color("#ffffff");

//** SCREEN */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//** CAMERA AND CONTROLS */
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100000)
const mainCamera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100000)
const controls = new OrbitControls(camera, canvas)
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})

controlSetup();
function controlSetup()
{
    controls.minDistance = 2.0;
    controls.maxDistance = 3.0;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = true;

    // controls.minPolarAngle = Math.PI/3;
    // controls.maxPolarAngle = Math.PI/1.75;

    // controls.minAzimuthAngle = Math.PI * -1.25;
    // controls.maxAzimuthAngle = Math.PI * 1;

    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: null,
        RIGHT: null
    }
}

// Materials
const material = new THREE.MeshBasicMaterial({wireframe: true})
const focismaterial = new THREE.MeshBasicMaterial({wireframe: true, transparent: true})
material.color = new THREE.Color(0xffffff)

// Mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
var meModel = new THREE.Group();
var icyPlanet = new THREE.Group();
var icyPlanetClouds = new THREE.Group();
var spaceApartment = new THREE.Group();
const sphere = new THREE.Mesh(geometry,material);
const focusBox = new THREE.Mesh(geometry, focismaterial);
var cameraFocus = new THREE.Object3D();
var planetHologram, planetHologramChild, planetHologramChild2;
var mug, screenFrame;

//** VARIOUS VARIABLES */
document.body.onscroll = scrollWindow
const clock = new THREE.Clock()
var mixer;
var orbit1Index = 0;
var mouse = new THREE.Vector2();
var viewIndex = 0;

// Lights
const pointLight = new THREE.PointLight( 'white', 50, 10 );
//const hemisphereLight = new THREE.ambi(0xf2f2f2, 0xf2f2f2, 1.0);
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
const helper = new THREE.DirectionalLightHelper( directionalLight, 1 );
//scene.add( helper );
directionalLight.rotation.y = Math.PI/4;

const light = new THREE.AmbientLight( 0x404040, 1 ); // soft white light
scene.add( light );


//** 3D GEOMETRY && MATERIALS **/
const planeGeometry = new THREE.PlaneGeometry( 10, 10 );
const material1 = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( planeGeometry, material1 );
plane.rotation.x = Math.PI / 2;
plane.position.y = -1;
//scene.add( plane );

const sphereGeometry = new THREE.SphereGeometry( 15, 32, 16 );
const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
var pivotPoint = new THREE.Object3D();
sphereMesh.add(pivotPoint);
sphereMesh.position.set(0, 0, 0);
sphereMesh.scale.set(0.5, 0.5, 0.5);
var planets;
var tween, camTween;

//** HTML REFERENCES **/
let portfolioButton = document.getElementById("porfolioButton");
let unityButton = document.getElementById("unityButton");
let blenderButton = document.getElementById("blenderButton");
let squareVideo = document.getElementById("video");
let squareVideoTexture = new THREE.VideoTexture(squareVideo);
//squareVideoTexture.minFilter = THREE.LinearFilter;
//squareVideoTexture.magFilter = THREE.LinearFilter;
var squareMovieMaterial = new THREE.MeshBasicMaterial({
    map: squareVideoTexture, 
    side: THREE.FrontSide, 
    toneMapped: false,
});

let tallVideo = document.getElementById("video2");
let tallVideoTexture = new THREE.VideoTexture(tallVideo);
tallVideoTexture.minFilter = THREE.LinearFilter;
tallVideoTexture.magFilter = THREE.LinearFilter;
var tallMovieMaterial = new THREE.MeshBasicMaterial({
    map: tallVideoTexture, 
    side: THREE.FrontSide, 
    toneMapped: false,
    transparent: true
});



//** DRAW A LINE */
const curve = new THREE.EllipseCurve(
    0,  0,            // ax, aY
    100, 80,           // xRadius, yRadius
    0,  2 * Math.PI,  // aStartAngle, aEndAngle
    true,            // aClockwise
    180                 // aRotation
);

const points = curve.getPoints( 100 );
const orbitGeometry = new THREE.BufferGeometry().setFromPoints( points );
const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
// Create the final object to add to the scene
const orbit1 = new THREE.Line( orbitGeometry, lineMaterial );
scene.add(orbit1);

init();

function init()
{

    //** CAMERA && Contrls*/
    camera.position.x = -0.78;
    camera.position.y = 0.44;
    camera.position.z = -2.4;
    //scene.add(camera);

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 7.5;
    renderer.outputEncoding = THREE.sRGBEncoding;

    //controls.target.y = 1;
    //controls.target = icyPlanet.position;

    //console.log(points[0])

    //** LIGHTS */
    pointLight.position.x = icyPlanet.position.x + 100;
    pointLight.position.y = icyPlanet.position.y;
    pointLight.position.z = icyPlanet.position.z;
    //scene.add(pointLight)
    //scene.add(hemisphereLight);
    scene.add( directionalLight );

    directionalLight.target = new THREE.Object3D( 100, 1, -30 );

    //** 3d OBJECTS */
    //** GTLF LOADER AND ANIMATIONS */
    var loader = new GLTFLoader();

    loader.load( '/models/IcePlanet.glb', function ( gltf ) {
        //scene.add(gltf.scene);

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        icyPlanet.add(gltf.scene);
        
        //mixer = new THREE.AnimationMixer( gltf.scene );
        var model = gltf.scene;
        icyPlanetClouds = model.children[0].children[0];
        icyPlanetClouds.scale.set(1.01, 1.01, 1.01);
        console.log(model.children[0].children[0].scale);
        
        model.traverse((o) => {
            if (o.isMesh)
            {
                o.material.transparent = true;
                o.castShadow = true; 
                o.receiveShadow = true;
                // if(o.material.map) o.material.map.anisotropy = 1;
                o.material.normalScale.set(2, 2);
                o.material.normalMapType = THREE.ObjectSpaceNormalMap;
            }
        });
    });
    
    loader.load( '/models/Space-dreams-portfolio.glb', function ( gltf ) {
        //scene.add(gltf.scene);

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        spaceApartment.add(gltf.scene);
        scene.add(spaceApartment);
        // spaceApartment.rotation.x = Math.PI / 2;
        
        //mixer = new THREE.AnimationMixer( gltf.scene );
        var model = gltf.scene;
        var newMaterial = new THREE.MeshStandardMaterial({});
        var model = gltf.scene;
    model.traverse((o) => 
    {
      if (o.isMesh)
      {
        //o.material.normalScale = {x: .000001, y: .000001};
        //o.material.bumpscale = .1;
        //o.material.normalMapType = 0;
        console.log("O:" + o.name);
        
        // o.material.map = arizona_height_texture;
        // o.material.map.flipY = false;
        // console.log( o.material );

        if(o.name == "Mug")
        {
            mug = o;
            focusBox.position.set(mug.position.x, mug.position.y, mug.position.z);
            controls.target = focusBox.position;
        }
        else if (o.name == "SCREEN-FRAME")
        {
            console.log(o.children);
            screenFrame = o;
            o.children[0].material = squareMovieMaterial;
            o.children[0].material.map.flipY = false;
        }
        else if (o.name == "SCREEN-FRAME-2")
        {
            console.log(o.children);
            o.children[0].material = tallMovieMaterial;
            o.children[0].material.map.flipY = false;
        }

        else if(o.name == "Sphere")
        {
            planetHologram = o;
            console.log(planetHologram);

            planetHologramChild = planetHologram.children[0];
            planetHologramChild2 = planetHologram.children[1];
        }
        else if(o.name == "Text")
        {
            tween = new TWEEN.Tween(o.position).to(
                {
                x: o.position.x,
                y: o.position.y + .02,
                z: o.position.z
                },
                2000
            ).yoyo(true)
            .repeat(Infinity)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        }
        else if (o.name == "Ship")
        {
            o.position.z -= 2;
        }
        
        var colorMap = o.material.map;
        
        var newMaterial = new THREE.MeshBasicMaterial({});
        o.material = newMaterial;
        o.material.aoMapIntensity = 0;
        o.material.map = colorMap;

        //o.material.needsUpdate = true;
      }
    });
    });
    //sphereMesh.add(icyPlanet);
    //icyPlanet.updateMatrixWorld(true);
    icyPlanet.position.set(1, 1, 100);
    icyPlanet.scale.set(10, 10, 10);
    scene.add(icyPlanet);
    
    //** HDRI LOADER */
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/hdri/spaceHdri.hdr', function(texture){
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.enviroment = texture;
        console.log("LOADED IMAGE");
    });



    //scene.add(focusBox);
    focusBox.scale.set(0.1, 0.1, 0.1);
    renderer.domElement.addEventListener("click", onclick, true);

    tallVideo.play();
    squareVideo.play();
}

/**
 * Animate
 */

function scrollWindow() {
    const t = document.body.getBoundingClientRect().top;
    //camera.position.y = .001 * -t;
    sphere.rotation.z = .001 * t;

    let currentTimeline = window.pageYOffset / 3000;


    console.log(currentTimeline);

    //camera.position.z = t * -0.01;
    //camera.position.x = t * -0.0002;
}

function onclick(event) {
    var selectedObject;
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    // if (intersects.length > 0) {
    //   tween = new TWEEN.Tween(camera.position).to(
    //     {
    //       x: newPos.x,
    //       y: newPos.y,
    //       z: newPos.z
    //     },
    //     2000
    //   );
    //   tween.easing(TWEEN.Easing.Quadratic.Out);
    //   tween.start();
    // }
}
  
function updateCameraOrbit() {
// Update OrbitControls target to a point just in front of the camera
var forward = new THREE.Vector3();
camera.getWorldDirection(forward);

controls.target.copy(camera.position).add(forward);
};

function lessonCameraMove(index) 
{
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;

    controls.minAzimuthAngle = Infinity;
    controls.maxAzimuthAngle = Infinity;
    
    if(index == 0)
    {
        const camTween = new TWEEN.Tween(camera.position).to(
        {
            x: -3.35,
            y: 0.65,
            z: -0.81
        },
        5000
        ).easing(TWEEN.Easing.Quadratic.Out)
        camTween.start();
        
        const focusTween = new TWEEN.Tween(focusBox.position).to(
            {
            x: planetHologram.position.x - 1,
            y: planetHologram.position.y,
            z: planetHologram.position.z
            },
            5000
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        focusTween.onComplete(cameraMoveComplete);
        viewIndex = 0;
    }
    else if(index == 1)
    {
        
        const camTween1 = new TWEEN.Tween(camera.position).to(
        {
            x: 0.38,
            y: 0.64,
            z: -1.78
        },
        5000
        ).easing(TWEEN.Easing.Quadratic.Out)
        camTween1.start();
        
        const focusTween1 = new TWEEN.Tween(focusBox.position).to(
        {
        x: mug.position.x,
        y: mug.position.y,
        z: mug.position.z
        },
        5000
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        focusTween1.onComplete(cameraMoveComplete);
        viewIndex = 1;
    }
    else if(index == 2)
    {
        const camTween2 = new TWEEN.Tween(focusBox.position).to(
            {
            x: screenFrame.position.x,
            y: screenFrame.position.y,
            z: screenFrame.position.z
            },
            5000
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        camTween2.onComplete(cameraMoveComplete);
        viewIndex = 2;
    }
}

function cameraMoveComplete()
{
    console.log("TWEEN IS DONE");
    
    if(viewIndex == 0)
    {
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;

        controls.minAzimuthAngle = Infinity;
        controls.maxAzimuthAngle = Infinity;
    }
    else if(viewIndex == 1)
    {
        controls.minPolarAngle = Math.PI/3;
        controls.maxPolarAngle = Math.PI/1.75;

        controls.minAzimuthAngle = Math.PI * -1.25;
        controls.maxAzimuthAngle = Math.PI * 1;
    } 
    else if(viewIndex == 2)
    {
        controls.minPolarAngle = Math.PI/2.5;
        controls.maxPolarAngle = Math.PI/1.85;

        controls.minAzimuthAngle = Math.PI * -1.65;
        controls.maxAzimuthAngle = Math.PI * 0.9;
    }
}

let v = new THREE.Vector3();

function onMouseMove(event) 
{
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //console.log(mouse);
}

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    let t = (elapsedTime * 0.005) % 1;

    // Update objects
    icyPlanet.rotation.y = .01 * elapsedTime
    icyPlanet.rotation.x = .005 * elapsedTime

    icyPlanetClouds.rotation.y = .01 * elapsedTime
    icyPlanetClouds.rotation.x = .005 * elapsedTime

    //Rotate hologram elements
    if(planetHologram)
    {
        planetHologram.rotation.y = .2 * elapsedTime;
        //planetHologramChild.rotation.x = .5 * elapsedTime;
        planetHologramChild2.rotation.z = -.1 * elapsedTime;
    }

    sphereMesh.rotateY(10);

    var pointAt = curve.getPointAt(t, v);

    //console.log(curve.getPointAt(t, v))

    //icyPlanet.position.copy(curve.getPointAt(t, v));
    //icyPlanetClouds.position.applyMatrix4(orbit1.matrixWorld);
    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    
    //var planet1_Pos = orbit1.getPoint(orbit1Index / 10000);

    // icyPlanet.position.x = planet1_Pos.x;
    // icyPlanet.position.y = planet1_Pos.y;
    // icyPlanet.position.z = planet1_Pos.z;

    var offset = new THREE.Vector3(2, 0, 2);
    //var newTargetPos = icyPlanet.position.add(offset)

    //console.log

    //camera.position.lerp(newTargetPos, .005);
}
function animate()
{
    TWEEN.update();

    requestAnimationFrame( animate );

    var delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );

    renderer.render( scene, camera );

    //Video Textures
    tallVideoTexture.needsUpdate = true;
    squareVideoTexture.needsUpdate = true;

    console.log(camera.rotation);
    //console.log("ROT: " + camera.rotation);

    //lessonCameraMove();
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener("mousemove", function (event) {
    onMouseMove(event);
  });

portfolioButton.addEventListener("click", function (ev) {
  ev.stopPropagation(); // prevent event from bubbling up to .container
  console.log("PORTFOIO");

  lessonCameraMove(0);
});

unityButton.addEventListener("click", function (ev) {
    ev.stopPropagation(); // prevent event from bubbling up to .container
    console.log("UNITY");
  
    lessonCameraMove(1);
  });

blenderButton.addEventListener("click", function (ev) {
    ev.stopPropagation(); // prevent event from bubbling up to .container
    console.log("UNITY");

    lessonCameraMove(2);
});


animate();
tick();