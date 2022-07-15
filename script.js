import './style.css'
import * as THREE from 'https://cdn.skypack.dev/three@0.127.0/build/three.module.js';
//import * as THREE from 'https://unpkg.com/three@0.138/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'dat.gui'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.127.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/postprocessing/SMAAPass.js';

import { VignetteShader } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/shaders/VignetteShader.js';
import { PixelShader } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/shaders/PixelShader.js'; 
import { FXAAShader } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/shaders/FXAAShader.js'; 
import * as TWEEN from 'https://cdn.skypack.dev/@tweenjs/tween.js'
import {CSS3DRenderer, CSS3DObject} from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/renderers/CSS3DRenderer.js';
import * as dat from 'https://cdn.skypack.dev/dat.gui';

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
const cssScene = new THREE.Scene();
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
    alpha: false, 
    antialias: false,
    alphaBuffer: false,
    depth: false,
    powerPreference: "high-performance"
});

var delta = 0.001;

//** CSS3dRENDERER AND ELEMENT FUNCTION */
var Element = function ( id, x, y, z, ry , divId, width, height) {
    var div = document.createElement( 'div' );
    
    var iframe = document.createElement( 'iframe' );
    iframe.style.border = '0px';
    iframe.src = [ 'https://www.youtube.com/embed/', id, '' ].join( '' );
    //?rel=0&autoplay=1&mute=1
    iframe.id = divId;
    if(width)
    {
        div.style.backgroundColor = '';
        div.style.width = width;
        div.style.height = height;
        iframe.style.width = width;
        iframe.style.height = height;
    }
    else
    {
        div.style.backgroundColor = '#000';
        div.style.width = '1920px';
        div.style.height = '1080px';
        iframe.style.width = '1920px';
        iframe.style.height = '1080px';
    }

    div.appendChild( iframe );
    var object = new CSS3DObject( div );
    object.position.set( x, y, z );
    object.rotation.y = ry;
    object.scale.set(0.001, 0.001, 0.001);
    return object;
};

const cssRenderer = new CSS3DRenderer();
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = 0;
cssRenderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById('css').appendChild(cssRenderer.domElement);

//** EFFECT COMPOSER */
let composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);

//** RENDER PASSES */
let filmPass = new FilmPass(
    0.5,   // noise intensity
    0.1,  // scanline intensity
    648,    // scanline count
    false,  // grayscale
);
filmPass.renderToScreen = true;
//** VINGETTE */
const shaderVignette = VignetteShader;
const effectVignette = new ShaderPass(shaderVignette);
effectVignette.uniforms[ 'offset' ].value = 1;
effectVignette.uniforms[ 'darkness' ].value = 1;
//** PIXEL SHADER */
const shaderPixel = PixelShader;
const effectPixel = new ShaderPass(shaderPixel);
effectPixel.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
effectPixel.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
effectPixel.uniforms[ 'pixelSize' ].value = 3;

const shaderFXAA = FXAAShader;
const effectFXAA = new ShaderPass(shaderFXAA);
var pixelRatio = renderer.getPixelRatio() * 5;
effectFXAA.material.uniforms[ 'resolution' ].value.x = 1 / ( canvas.offsetWidth * pixelRatio );
effectFXAA.material.uniforms[ 'resolution' ].value.y = 1 / ( canvas.offsetHeight * pixelRatio );

const smaaPass = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio() );

composer.addPass(new RenderPass(scene, camera));
composer.addPass(effectFXAA);
composer.addPass(new UnrealBloomPass({x: 1024, y: 1024}, 0.5, 0.0, 0.9));
composer.addPass(filmPass);
composer.addPass(effectVignette);

controlSetup();
function controlSetup()
{
    controls.minDistance = 1.0;
    controls.maxDistance = 3.0;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = true;

    controls.minPolarAngle = Math.PI/3;
    controls.maxPolarAngle = Math.PI/2;

    controls.minAzimuthAngle = Math.PI * -1.5;
    controls.maxAzimuthAngle = Math.PI * 1.5;

    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: null,
        RIGHT: null
    }
}

var RESOURCES_LOADED = false;

//** LOAD MANAGER */
const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Started loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  );
};
manager.onLoad = function () {
  console.log("Loading complete!");
  RESOURCES_LOADED = true;
  document.querySelector(".progress").classList.toggle("disabled");
  document.querySelector(".progressContainer").classList.toggle("disabled");
  introText.classList.toggle("active");
};
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  // console.log(
  //   "Loading file: " +
  //     url +
  //     ".\nLoaded " +
  //     itemsLoaded +
  //     " of " +
  //     itemsTotal +
  //     " files."
  // );

  var progress = (itemsLoaded/41) * 100;
  console.log("Progress: " + progress);

  //Prevent from going over 100%
  if (progress > 100.0) {
    progress = 90.0;
  }

  document.querySelector(".progress__fill").style.width = progress + "%";
};
manager.onError = function (url) {
  console.log("There was an error loading " + url);
};

// Materials
const material = new THREE.MeshBasicMaterial({wireframe: true})
const focismaterial = new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: "0%"})
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
var mug, screenFrame, aboutScreen, portfolioScreen;

//** VARIOUS VARIABLES */
document.body.onscroll = scrollWindow
const clock = new THREE.Clock()
var mixer;
var orbit1Index = 0;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var intersects, intersectObject;
var intersected = false;
var viewIndex = 0;
var grayscale = false;
var fromPlanet = false;
var camTween, focusTween;
var ytVid2;

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
const aboutboxMaterial = new THREE.MeshBasicMaterial({color: "white", opacity: "0%", transparent: true});
const resumeBoxMaterial = new THREE.MeshBasicMaterial({color: "white", opacity: "0%", transparent: true});
const artStationBoxMaterial = new THREE.MeshBasicMaterial({color: "white", opacity: "0%", transparent: true});
const linkedInBoxMaterial = new THREE.MeshBasicMaterial({color: "white", opacity: "0%", transparent: true});
const contactBoxMaterial = new THREE.MeshBasicMaterial({color: "white", opacity: "0%", transparent: true});
const blenderBoxMaterial = new THREE.MeshBasicMaterial({color: "white", opacity: "0%", transparent: true});
const unityBoxMaterial = new THREE.MeshBasicMaterial({color: "white", opacity: "0%", transparent: true});

const resumeBox = new THREE.Mesh(geometry, resumeBoxMaterial);
const artStationBox = new THREE.Mesh(geometry, artStationBoxMaterial);
const linkedInBox = new THREE.Mesh(geometry, linkedInBoxMaterial);
const contactBox = new THREE.Mesh(geometry, contactBoxMaterial);
const blenderBox = new THREE.Mesh(geometry, blenderBoxMaterial);
const unityBox = new THREE.Mesh(geometry, unityBoxMaterial);
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
var intro = true;

//** HTML REFERENCES **/
let animationButton = document.getElementById("animation");
let interactivesButton = document.getElementById("interactives");
let aboutButton = document.getElementById("about");
let titleButton = document.getElementById("title");
let squareVideo = document.getElementById("video");
let introText = document.getElementById("introText");
let blackAndWhiteButton = document.getElementById("blackAndWhite");

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

let aboutVideo = document.getElementById("aboutVid");
let aboutVideoTexture = new THREE.VideoTexture(aboutVideo);
aboutVideoTexture.minFilter = THREE.LinearFilter;
aboutVideoTexture.magFilter = THREE.LinearFilter;
var aboutMovieMaterial = new THREE.MeshBasicMaterial({
    map: aboutVideoTexture, 
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

// const points = curve.getPoints( 100 );
// const orbitGeometry = new THREE.BufferGeometry().setFromPoints( points );
// const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
// // Create the final object to add to the scene
// const orbit1 = new THREE.Line( orbitGeometry, lineMaterial );
// scene.add(orbit1);

init();

function init()
{
    //** CAMERA && Contrls*/
    // camera.position.x = -0.78;
    // camera.position.y = 0.44;
    // camera.position.z = -2.4;
    camera.position.set( -0.255, 0.83, -1.83 );
    //scene.add(camera);

    cssRenderer.setSize(sizes.width, sizes.height);
    //document.body.appendChild(cssRenderer.domElement);

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 3;
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
    directionalLight.target = new THREE.Object3D( 100, 1, -30 );
    scene.add( directionalLight );

    //** ABOUT CLICKABLE LINKS */

    resumeBox.name = 'resume';
    artStationBox.name = 'photo';
    linkedInBox.name = 'creative technologist';
    contactBox.name = 'contact';
    blenderBox.name = 'blender';
    unityBox.name = 'unity';

    resumeBox.userdata = "asdf";
    artStationBox.userdata = "https://www.artstation.com/rosscoe3/";
    linkedInBox.userdata = "https://www.linkedin.com/in/ross-walter-0043bb211/";
    contactBox.userdata = "https://www.linkedin.com/in/ross-walter-0043bb211/overlay/contact-info/";
    blenderBox.userdata = "https://www.artstation.com/rosscoe3/albums/6265419";
    unityBox.userdata = "https://www.artstation.com/rosscoe3/albums/5355287";
    
    resumeBox.scale.set(0.1, 0.075, 0.28);
    artStationBox.scale.set(0.1, 0.55, 0.55);
    linkedInBox.scale.set(0.1, 0.2, 0.55);
    contactBox.scale.set(0.1, 0.075, 0.3);
    blenderBox.scale.set(0.1, 0.125, 0.125);
    unityBox.scale.set(0.1, 0.125, 0.125);
    
    resumeBox.position.set(4.93, 0.426, -0.44);
    artStationBox.position.set(4.93, 1.009, -0.288);
    linkedInBox.position.set(4.93, 0.619, -0.31);
    contactBox.position.set(4.93, 0.31, 0);
    blenderBox.position.set(4.93, 0.085, -0.51);
    unityBox.position.set(4.93, 0.085, -0.36);
    
    scene.add(resumeBox);
    scene.add(artStationBox);
    scene.add(linkedInBox);
    scene.add(contactBox);
    scene.add(blenderBox);
    scene.add(unityBox);

    //** 3d OBJECTS */
    //** GTLF LOADER AND ANIMATIONS */
    var loader = new GLTFLoader(manager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' );
    loader.setDRACOLoader( dracoLoader );

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
    loader.load( '/models/Space-dreams-portfolio-update-4.glb', function ( gltf ) {
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
        //** COFFEE SCREEN */
        else if (o.name == "SCREEN-FRAME-2")
        {
            console.log(o.children);
            o.children[0].material = tallMovieMaterial;
            o.children[0].material.map.flipY = false;
        }
        //** PORTFOLIO SCREEN */
        else if (o.name == "SCREEN-FRAME-2002")
        {
            // o.children[0].material = tallMovieMaterial;
            // o.children[0].material.map.flipY = false;
            portfolioScreen = o;
            console.log(o.position);
        }
        //** ABOUT SCREEN */
        else if (o.name == "SCREEN-FRAME-2001")
        {
            console.log(o.children);
            aboutScreen = o;
            o.children[0].material = aboutMovieMaterial;
            o.children[0].material.map.flipY = false;
            //resumeBox.position.set(aboutScreen.position.x, aboutScreen.position.y, aboutScreen.position.z);
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
    const rgbeLoader = new RGBELoader(manager);
    rgbeLoader.load('/hdri/spaceHdri.hdr', function(texture){
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.enviroment = texture;
        console.log("LOADED IMAGE");
    });

    //** YOUTUBE VIDEO POSITION */
    var group = new THREE.Group();
    var portfolioPlay = new Element( 'playlist?list=PLeL95S0ZCy3wjDQrigPNbTm4olu4dYHGD', -4.026, 0.79, -6.25, 0, "animationYoutubeVideo");
    portfolioPlay.scale.set(.00076, .00076, .00076);
	group.add(portfolioPlay);
    cssScene.add( group );

    var youtubeVid2 = new THREE.Group();
    ytVid2 = new Element( 'GzhiGsciJJI?rel=0&loop=1&autoplay=1', -7.93, 0.535, -0.605, 0, "interactiveYoutubeVideo", "1080px", "1080px");
    ytVid2.scale.set(.00095, .00095, .00095);
    ytVid2.rotation.set(0, 1.6, 0);
    //youtubeVid2.position.set(-7.93, 0.535, -0.605);
    //youtubeVid2.position.set(-7.93, 0.489, -0.54);
	youtubeVid2.add(ytVid2);
    cssScene.add( youtubeVid2 );

    // add it to the css scene
    
    //cssObject.position.set(portfolioScreen.position);
    //cssObject.rotation.set(portfolioScreen.rotation);
    //cssScene.add(cssObject);

    //scene.add(focusBox);
    focusBox.scale.set(0.1, 0.1, 0.1);
    renderer.domElement.addEventListener("click", onclick, true);

    tallVideo.play();
    aboutVideo.play();
    squareVideo.play();
}

function scrollWindow() {
    const t = document.body.getBoundingClientRect().top;
    //camera.position.y = .001 * -t;
    sphere.rotation.z = .001 * t;

    let currentTimeline = window.pageYOffset / 3000;


    //console.log(currentTimeline);

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

    var tweenTime;

    if(camTween)
    {
        camTween.stop();
    }
    if(focusTween)
    {
        focusTween.stop();
    }

    if(fromPlanet)
    {
        tweenTime = 0;
        fromPlanet = false;
    }
    else
    {
        tweenTime = 5000;
    }
    
    if(index == 0)
    {
        camTween = new TWEEN.Tween(camera.position).to(
        {
            x: -3.35,
            y: 0.65,
            z: -0.81
        },
        tweenTime
        ).easing(TWEEN.Easing.Quadratic.Out)
        camTween.start();
        
        focusTween = new TWEEN.Tween(focusBox.position).to(
            {
            x: planetHologram.position.x - 1,
            y: planetHologram.position.y,
            z: planetHologram.position.z
            },
            tweenTime
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        focusTween.onComplete(cameraMoveComplete);
        viewIndex = 0;
    }
    else if(index == 1)
    {
        
        camTween = new TWEEN.Tween(camera.position).to(
        {
            x: 0.38,
            y: 0.64,
            z: -1.78
        },
        tweenTime
        ).easing(TWEEN.Easing.Quadratic.Out)
        camTween.start();
        
        focusTween = new TWEEN.Tween(focusBox.position).to(
        {
        x: mug.position.x,
        y: mug.position.y,
        z: mug.position.z
        },
        tweenTime
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        focusTween.onComplete(cameraMoveComplete);
        viewIndex = 1;
    }
    else if(index == 2)
    {
        camTween = new TWEEN.Tween(focusBox.position).to(
            {
            x: screenFrame.position.x,
            y: screenFrame.position.y,
            z: screenFrame.position.z
            },
            tweenTime
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        camTween.onComplete(cameraMoveComplete);
        viewIndex = 2;
    }
    else if(index == 3)
    {
        camTween = new TWEEN.Tween(focusBox.position).to(
            {
            x: aboutScreen.position.x,
            y: aboutScreen.position.y,
            z: aboutScreen.position.z
            },
            tweenTime
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        camTween.onComplete(cameraMoveComplete);
        viewIndex = 3;
    }
    else if(index == 4)
    {
        camTween = new TWEEN.Tween(focusBox.position).to(
            {
            x: portfolioScreen.position.x,
            y: portfolioScreen.position.y,
            z: portfolioScreen.position.z
            },
            tweenTime
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        camTween.onComplete(cameraMoveComplete);
        viewIndex = 4;
    }
    else if(index == 5)
    {
        fromPlanet = true;
        camTween = new TWEEN.Tween(focusBox.position).to(
            {
            x: icyPlanet.position.x,
            y: icyPlanet.position.y,
            z: icyPlanet.position.z
            },
            0
        ).easing(TWEEN.Easing.Quadratic.Out)
        .start();
        camTween.onComplete(cameraMoveComplete);
        viewIndex = 5;
    }
}

function cameraMoveComplete()
{
    console.log("TWEEN IS DONE");

    if(!controls.enabled)
    {
        controls.enabled = true;
    }
    controls.minDistance = 1;
    controls.maxDistance = 3;
    
    //INTERACTIVES//
    if(viewIndex == 0)
    {
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;

        controls.minAzimuthAngle = Infinity;
        controls.maxAzimuthAngle = Infinity;
    }
    //MAIN TITLE//
    else if(viewIndex == 1)
    {
        controls.minPolarAngle = Math.PI/3;
        controls.maxPolarAngle = Math.PI/2;

        controls.minAzimuthAngle = Math.PI * -1.5;
        controls.maxAzimuthAngle = Math.PI * 1.5;
    }
    //**INTERACTIVE */ 
    else if(viewIndex == 2)
    {
        controls.minPolarAngle = Math.PI/2.5;
        controls.maxPolarAngle = Math.PI/1.85;

        controls.minAzimuthAngle = Math.PI * -1.65;
        controls.maxAzimuthAngle = Math.PI * 0.9;
    }
    //**ABOUT SCREEN */
    else if(viewIndex == 3)
    {
        controls.minPolarAngle = Math.PI/2.5;
        controls.maxPolarAngle = Math.PI/1.65;

        controls.minAzimuthAngle = Math.PI * 1.1;
        controls.maxAzimuthAngle = Math.PI * 1.6;
    }
    //**ANIMATION SCREEN */ 
    else if(viewIndex == 4)
    {
        controls.minPolarAngle = Math.PI/2.5;
        controls.maxPolarAngle = Math.PI/1.5;

        controls.minAzimuthAngle = Math.PI * -0.25;
        controls.maxAzimuthAngle = Math.PI * 0.3;
    }
    //**PLANET SCREEN */ 
    else if(viewIndex == 5)
    {
        controls.minPolarAngle = Math.PI/2.5;
        controls.maxPolarAngle = Math.PI/1.5;

        controls.minAzimuthAngle = Math.PI * 0.75;
        controls.maxAzimuthAngle = Math.PI * -0.75;
        controls.enabled = true;

        controls.minDistance = 60;
        controls.maxDistance = 75;
    }
}

function hoverObject() {
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true);
    
    if(intersects.length > 0)
    {
        //console.log(intersects[0].object.name);
        if (intersects[0].object.name == "resume" ||
        intersects[0].object.name == "photo" || intersects[0].object.name == "creative technologist" || 
        intersects[0].object.name == "contact" || intersects[0].object.name == "blender" || 
        intersects[0].object.name == "unity")
        {
            intersectObject = intersects[0].object;
            intersected = true;
            intersectObject.material.opacity = 0.5;
            intersectObject.material.side = THREE.FrontSide;
            console.log("On Object");
            document.body.style.cursor = 'pointer' 
        }
        else if(intersects[0].object.name == "Clouds-icyPlanet001")
        {
            document.body.style.cursor = 'pointer' 
        }
        else if(intersects[0].object.name == "Room")
        {
            document.body.style.cursor = 'default' 
        }
        else
        {
            if (intersected) 
            {
                console.log("Off Object");
                document.body.style.cursor = 'default'
                intersected = false;
                intersectObject.material.opacity = 0;
                console.log(intersectObject);
                intersectObject = null;
            }
        }
    }
    else
    {
        document.body.style.cursor = 'default'
    }
}

function clickEvent() {
    var intersects;
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true);

    console.log(intersects[0]);

    if(intro)
    {
        introTextSequence();
        intro = false;
    }
    else
    {
        if(intersects[0])
        {
            intersectObject = intersects[0].object;

            if (intersects.length > 0 && 
            intersects[0].object.name == "photo" || intersects[0].object.name == "creative technologist" || 
            intersects[0].object.name == "contact" || intersects[0].object.name == "blender" || 
            intersects[0].object.name == "unity")
            {
                console.log("clicked about link");
                clickOpenURL(intersects, intersects[0].object.userdata);
            }
            else if(intersects.length > 0 && intersects[0].object.name == "Clouds-icyPlanet001")
            {
                lessonCameraMove(5);
            }
            else if(intersects.length > 0 && intersects[0].object.name == "resume")
            {
                // Download("/images/Ross Walter - Resume.pdf")''
                window.open("/images/Ross Walter - Resume.pdf", '_blank');
            }
            else if(intersects.length > 0 && intersects[0].object.name == "Cube001")
            {
                clickOpenURL(intersects, "https://open.spotify.com/artist/4z8B0p2AoxbT3usRPl1dS7");
            }
        }
    }

}

function introTextSequence()
{
    introText.classList.toggle("active");
    setTimeout(function() 
    {
        titleButton.classList.toggle("active");
        setTimeout(function() 
        {
            animationButton.classList.toggle("active");
            setTimeout(function() 
            {
                interactivesButton.classList.toggle("active");
                setTimeout(function() 
                {
                    aboutButton.classList.toggle("active");
                    setTimeout(function() 
                    {
                        introText.innerHTML = "Use the titles to navigate"
                        introText.classList.toggle("active");
                    }, 1000);
                }, 500);
            }, 500);
        }, 500);
    }, 500);
}

//** OPENS URLS ON HOVERCLICK */
function clickOpenURL(intersects, url) 
{
    if (intersects.length > 0) 
    {
        console.log("CLICK OPEN");
        //If it has a URL open in another window
        if (url) 
        {
            window.open(url,'_blank');
            console.log("Opening: " + url + " in a new tab");
        } 
        else 
        {
            console.log("UI does not have a link");
        }
    }
}

function Download(url) {
    document.getElementById('my_iframe').src = url;
};

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
    composer.render(delta);
    //renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);

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

    //renderer.render( scene, camera );
    composer.render(delta);
    //cssRenderer.render(cssScene, camera);
    //console.log(camera.position);

    //Video Textures
    tallVideoTexture.needsUpdate = true;
    squareVideoTexture.needsUpdate = true;

    //console.log("Scene polycount:", renderer.info.render.triangles)
    //console.log("Active Drawcalls:", renderer.info.render.calls)
    //console.log("Textures in Memory", renderer.info.memory.textures)
    //console.log("Geometries in Memory", renderer.info.memory.geometries)

    if(RESOURCES_LOADED)
    {
        hoverObject();
    }
    //console.log(renderer.info);

    //scene.enviroment.rotation += Math.PI;
    //scene.enviroment = texture;

    //console.log(camera.rotation);
    //console.log("ROT: " + camera.rotation);

    //lessonCameraMove();
}

// const gui = new dat.GUI();

// const guiWorld = {
//     xPos: {
//       x: 0,
//       y: 0,
//       z: 0,
//     },
//     rotPos:{
//       x: 0,
//       y: 0, 
//       z: 0,
//     }
//   };
  
// gui.add(guiWorld.xPos, "x", -10, 10).onChange(() => {
//     ytVid2.position.set(
//     guiWorld.xPos.x,
//     ytVid2.position.y,
//     ytVid2.position.z
// );
// console.log(ytVid2.position);
// });

// gui.add(guiWorld.xPos, "y", -1, 2).onChange(() => {
//     ytVid2.position.set(
//         ytVid2.position.x,
//     guiWorld.xPos.y,
//     ytVid2.position.z
// );
// console.log(ytVid2.position);
// });

// gui.add(guiWorld.xPos, "z", -1, 1).onChange(() => {
//     ytVid2.position.set(
//         ytVid2.position.x,
//         ytVid2.position.y,
//     guiWorld.xPos.z
// );
// console.log(ytVid2.position);
// });

//** BLOCKER FOR YOUTUBE VIDEOS */
var blocker = document.getElementById( 'blocker' );
blocker.style.display = 'none';
document.addEventListener( 'mousedown', function () {
    
    blocker.style.display = '';
    
} );
document.addEventListener( 'mouseup', function () {
    blocker.style.display = 'none';
} );

document.addEventListener('touchstart', function (event) {
    console.log("touchStart");
    if(intro)
    {
        intro = false;
        introTextSequence();
    }

    hoverObject();
    onclick(event);
});
document.addEventListener('touchend', function (event) {
    console.log("touchEND");
    onclick(event);
});

window.addEventListener("mousemove", function (event) {
    onMouseMove(event);
});
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
    
    // pixelRatio = renderer.getPixelRatio() * 7;
    // effectFXAA.material.uniforms[ 'resolution' ].value.x = 1 / ( canvas.offsetWidth * pixelRatio );
    // effectFXAA.material.uniforms[ 'resolution' ].value.y = 1 / ( canvas.offsetHeight * pixelRatio );

    cssRenderer.setSize(sizes.width, sizes.height);
});

window.addEventListener("click", () => {
    clickEvent();
});

titleButton.addEventListener("click", function (ev) {
    ev.stopPropagation(); // prevent event from bubbling up to .container
    console.log("PORTFOIO");
  
    lessonCameraMove(1);

    //** TURN OFF ANIMATION VIDEO IF ITS ON */
    if(document.getElementById("animationYoutubeVideo").classList.contains("active"))
    {
        document.getElementById("animationYoutubeVideo").classList.toggle("active");
    }
    if(introText.classList.contains("active"))
    {
        introText.classList.toggle("active");
    }
    if(document.getElementById("interactiveYoutubeVideo").classList.contains("active"))
    {
    document.getElementById("interactiveYoutubeVideo").classList.toggle("active");
    }
  });

animationButton.addEventListener("click", function (ev) {
  ev.stopPropagation(); // prevent event from bubbling up to .container
  console.log("ANIMATION");

  if(!document.getElementById("animationYoutubeVideo").classList.contains("active"))
  {
    document.getElementById("animationYoutubeVideo").classList.toggle("active");
  }
  if(introText.classList.contains("active"))
    {
        introText.classList.toggle("active");
    }
    if(document.getElementById("interactiveYoutubeVideo").classList.contains("active"))
    {
    document.getElementById("interactiveYoutubeVideo").classList.toggle("active");
    }
  

  lessonCameraMove(4);
});

interactivesButton.addEventListener("click", function (ev) {
    ev.stopPropagation(); // prevent event from bubbling up to .container
    console.log("INTERACTIVE");
    if(!document.getElementById("interactiveYoutubeVideo").classList.contains("active"))
    {
    document.getElementById("interactiveYoutubeVideo").classList.toggle("active");
    }
    if(introText.classList.contains("active"))
    {
        introText.classList.toggle("active");
    }
  
    lessonCameraMove(2);
  });

aboutButton.addEventListener("click", function (ev) {
    ev.stopPropagation(); // prevent event from bubbling up to .container
    console.log("ABOUT");

    if(introText.classList.contains("active"))
    {
        introText.classList.toggle("active");
    }
    if(document.getElementById("interactiveYoutubeVideo").classList.contains("active"))
    {
    document.getElementById("interactiveYoutubeVideo").classList.toggle("active");
    }

    lessonCameraMove(3);
});

blackAndWhiteButton.addEventListener("click", function (ev) {
    ev.stopPropagation(); // prevent event from bubbling up to .container
    console.log("BLACK &  WHITE");
    composer.removePass(filmPass);

    if(grayscale)
    {
        filmPass = new FilmPass(
            0.5,   // noise intensity
            0.1,  // scanline intensity
            648,    // scanline count
            false,  // grayscale
        );
        grayscale = false;
    }
    else
    {
        filmPass = new FilmPass(
            2.0,   // noise intensity
            0.5,  // scanline intensity
            1286,    // scanline count
            true,  // grayscale
        );
        grayscale = true;
    }
    
    composer.addPass(filmPass);
});


animate();
tick();