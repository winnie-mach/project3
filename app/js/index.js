import '../scss/index.scss';
import '../css/index.css';
import * as THREE from "three";
import dat from "dat.gui"; //a library that is a controller so you can tumble, pan etc.
import OrbitControls from "three-orbitcontrols";


const colours = {  //global variables
	blue01: 0x97b5e6,
  blue02: 0x78afc4,
  blue03: 0xb8ccd7,
  green01: 0x424f23,
  green02: 0x88842b,
  green03: 0xb2b854,
  brown01: 0x9b4d26,
  brown02: 0x804e45,
	brown03: 0xad7d67,
  red01: 0xa54338,
  orange01: 0x9b4d26,
  orange02: 0xad5b29,
  white01: 0xfff6e2,
  white02: 0xffdecf,
	grey01: 0x9d8c72,
	grey02: 0x9a9693
};

let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, controls;  //global variables


///// CREATE SCENE, CAMERA, RENDERER ///////

const createScene = () => {
  //Get the width and the height of the screen,
  //Use them to set up the aspect ratio of the camera
  //and the size of the render.
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Create the SCENE
  scene = new THREE.Scene();

  // Add a fog effect to the scene, same colour as the background colour used in stylesheet
  // scene.fog = new THREE.Fog(colours.blue03, 1, 1000);
  console.log(scene.fog);

  // Create the CAMERA
// 	 camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
// scene.add( camera );
  aspectRatio = WIDTH / HEIGHT; //set up aspect ratio with WIDTH + HEIGHT
  fieldOfView = 60;
  nearPlane = 0.1;
  farPlane = 10000;

  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  //Set camera position
// camera.position.x = 0;
// camera.position.y = 583; //150
// camera.position.z = 1722; //200
// camera.position.set(-1.967815596819599, 540.7557260060261, 318.5893451250931)
camera.position.x = 0;
camera.position.y = 325;
camera.position.z = 400;
// camera.rotation.set(-0.6435011087932843,  0,  0)
// camera.lookAt(scene.position);
camera.lookAt({x: 0, y: 100.00000000000001, z: 450})
camera.setFocalLength(70); // default at 35

//Create the RENDERER
renderer = new THREE.WebGLRenderer({
  // Allow transparency to show the gradient background we defined in css.
  alpha: true,
  //Activate anti-aliasing, this is less performant, but as the project is low poly, should be fine.
  antialias: true
});
// Define size of renderer, in this case it will fill the entire screen.
renderer.setSize(WIDTH, HEIGHT);
//Enable shadow rendering
renderer.setPixelRatio(window.devicePixelRation ||  1); //setting it to the pixel ratio settings of your pc or 1 if it's not defined.
renderer.shadowMap.enabled = true;

///// ADDING AXIS GIZMO ///////////
let axes = new THREE.AxesHelper(200);
console.log('axes:', axes);
scene.add(axes);

// Add the DOM element of the renderer to the container we created in the HTML.
container = document.getElementById('world');
container.appendChild(renderer.domElement);
console.log('renderer:', renderer);
}

/////// CREATE LIGHTS /////////

let hemisphereLight, shadowLight; //global variables

const createLights = () => {
  // A hemisphere Light is a gradient coloured light;
  //First param is the sky colour, second param is the ground colour, third param is the intensity of the light.
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);
  console.log('hemispherelight:', hemisphereLight);

  // A directional light shines from a specific direction.
  //Acts like the sun, means all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  //Set the direction of the direcitonal light
  shadowLight.position.set(150, 350, 350);
  //Allow directional light to cast shadows
  shadowLight.castShadow = true;
  //Define the visible area of the projected shadow
  shadowLight.shadow.camera.left = - 400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = - 400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = - 1000;
  // Define the resolution of the shadow, the higher the better but also more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // To activate the lights, just add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);

}

////// DEFINING A GROUND /////////////
// This function is defining what a sea would look like
const defineGround = function() { //(global variable)
  	let geo = new THREE.SphereGeometry(300, 30, 30);
  	var mat = new THREE.MeshStandardMaterial( { color: colours.orange02,flatShading: true} )

  this.mesh = new THREE.Mesh( geo, mat );
  	this.mesh.receiveShadow = true;
  	this.mesh.castShadow= false;
  	this.mesh.rotation.z= - Math.PI/2;
  };


////////// CREATING AN INSTANCE OF GROUND /////////////
// Instantiate the ground and add it to the scene:
let ground; //(global variable)

const createGround = function(){
  ground = new defineGround();
  //Push it a little bit at the bottom of the scene
  console.log('ground:', ground);
  // debugger;
  ground.mesh.position.y= 0; // -150
  ground.mesh.position.z= 0; //150
  // Add the mesh of the sea to the scene
  scene.add(ground.mesh);
}

//////// DEFINING A CLOUD //////////

const defineCloud = function() {
  // Create an empty container that will hold the different parts of the cloud
  this.mesh = new THREE.Object3D();

  //Create a cube geometry;
  //this shape will be duplicated to create the cloud
  let geo = new THREE.IcosahedronGeometry(15); //30, 30, 30

  //Create a material; a simple white material
  let mat = new THREE.MeshPhongMaterial({
    color:colours.white02,
  })

  // Duplicate the geometry a random number of times
  let numOfBlocs = 3+Math.floor(Math.random()*3);
  //Loop to create duplicates
  for (let i = 0; i < numOfBlocs; i++){
    //Create the mesh with the geometry + material
    let blocs = new THREE.Mesh(geo, mat);
    //Set the position and rotation of each cube randomly
    blocs.position.x = i*15;
    blocs.position.y = Math.random()*10;
    blocs.position.z = Math.random()*10;
    blocs.rotation.z = Math.random()*Math.PI*2;
    blocs.rotation.y = Math.random()*Math.PI*2;
    //Set the size of the cube randomly
    let size = .1 + Math.random()*.9;
    blocs.scale.set(size,size,size);

    //Alow each cube to cast and receive shadows
    blocs.castShadow = true;
    blocs.receiveShadow = true;

    // Add the cube to the container we created at the beginning.
    this.mesh.add(blocs);
  }
}

///// DEFINING THE SKY OBJECT WITH OUR CLOUDS //////////
const defineSky = function() { //(global variable)
  //Create an empty container
  this.mesh = new THREE.Object3D();
  //Choose a number of clouds to be scattered in the sky
  this.numOfClouds = 20;
  //To distribute the clouds consistently, need to place according to a uniform angle
  let stepAngle = Math.PI*2 / this.numOfClouds;

  //////////CREATE CLOUD INSTANCES INSIDE SKY OBJECT  //////////
  for (let i = 0; i < this.numOfClouds; i++) {
    let cloud = new defineCloud();
    // Set the rotation and position of each cloud using some trigonometry
    let a = stepAngle*i; //final angle of cloud group.
    let h = 750 + Math.random()*200; //this is the distance between the centre of the axis and the cloud itself
    //Trigonometry: Converting polar coordinates(angle, distance) into Cartesian coordinates(x, y)
    cloud.mesh.position.y = Math.sin(a)*h;
    cloud.mesh.position.x = Math.cos(a)*h;
    //Rotate the cloud according to it's position
    cloud.mesh.rotation.z = a + Math.PI/2;
    //For a better result we position the clouds at random depths inside the scene using the z (depth) axis.
    // cloud.mesh.position.z = - 400 - Math.random()*400;
    cloud.mesh.position.z = - 600; // - 600
    //Also setting a random scale for each cloud
    let size = 1 + Math.random()*3;
    cloud.mesh.scale.set(size,size,size);

    //Finally, adding the cloud to the scene
    this.mesh.add(cloud.mesh);
  }
};

//////// CREATE AN INSTANCE OF THE SKY ///////////

let sky; //(global variable)
function createSky(){
  sky = new defineSky();
  //Push its centre a bit towards the bottom of the screen
  sky.mesh.position.y = - 500; // - 300
  // TODO: sky will be moving towards user as they move on the z axis.
  // sky.mesh.position.z = 300;
  scene.add(sky.mesh);
};



////////////// TREE 1: DEFINE PINE TREE /////////////////
const definePineTree = function() {
	this.mesh = new THREE.Object3D();
	let pineTrunkGeo = new THREE.BoxGeometry(2, 13, 2);
	let pineTrunkMat = new THREE.MeshStandardMaterial({color: colours.brown01, flatShading: true});
	let pineTrunk = new THREE.Mesh(pineTrunkGeo, pineTrunkMat);
	pineTrunk.castShadow = true;
	pineTrunk.receiveShadow = true;
	this.mesh.add(pineTrunk);
	let pineTopGeo = new THREE.ConeGeometry( 6, 14, 8 );
	let pineTopMat = new THREE.MeshStandardMaterial({color:colours.green02, flatShading:true})
	let pineTreeTop = new THREE.Mesh(pineTopGeo, pineTopMat);
	pineTreeTop.castShadow = true;
	pineTreeTop.receiveShadow = true;
	pineTreeTop.position.y = 3;
	this.mesh.add(pineTreeTop);
}

////////////// TREE 2: DEFINE ROUND TREE /////////////
const defineRoundTree = function() {
	this.mesh = new THREE.Object3D();
	let roundTrunkGeo = new THREE.BoxGeometry(2, 20, 2);
	let roundTrunkMat = new THREE.MeshStandardMaterial({color: colours.brown02, flatShading: true});
	let roundTrunk = new THREE.Mesh(roundTrunkGeo, roundTrunkMat);
	roundTrunk.castShadow = true;
	roundTrunk.receiveShadow = true;
	this.mesh.add(roundTrunk);


	let roundTopGeo = new THREE.SphereGeometry( 7, 7, 8 );
	let roundTopMat = new THREE.MeshStandardMaterial({color:colours.green02, flatShading:true})
	let roundTreeTop = new THREE.Mesh(roundTopGeo, roundTopMat);
	roundTreeTop.castShadow = true;
	roundTreeTop.receiveShadow = true;
	roundTreeTop.position.y = 5;
	this.mesh.add(roundTreeTop);
}

////////// DEFINE APPLE TREETOP ////////////
const defineAppleTreeTop = function() {
  // Create an empty container that will hold the blocks of the tree top
  this.mesh = new THREE.Object3D();
	this.mesh.scale.set(1.5, 1.5, 1.5);

  //Create a cube geometry;
  //this shape will be duplicated to create the cloud
  let appleTreeTopGeo = new THREE.BoxGeometry(2, 2, 2); //30, 30, 30

  //Create a material; a simple white material
  let appleTreeTopMat = new THREE.MeshPhongMaterial({
    color:colours.green02,
  })

  // Duplicate the geometry a random number of times
  let numOfBlocs = 30+Math.floor(Math.random()*3);
  //Loop to create duplicates
  for (let i = 0; i < numOfBlocs; i++){
    //Create the mesh with the geometry + material
    let blocs = new THREE.Mesh(appleTreeTopGeo, appleTreeTopMat);
    //Set the position and rotation of each cube randomly
    blocs.position.x = i*.5;
    blocs.position.y = Math.random()*10;
    blocs.position.z = Math.random()*10;
    blocs.rotation.z = Math.random()*Math.PI*2;
    blocs.rotation.y = Math.random()*Math.PI*2;
    //Set the size of the cube randomly
    let size = .7 + Math.random()*2;
    blocs.scale.set(size,size,size);

    //Alow each cube to cast and receive shadows
    blocs.castShadow = true;
    blocs.receiveShadow = true;
    // Add the cube to the container we created at the beginning.
    this.mesh.add(blocs);
  }
}
///////////// TREE 3: DEFINE APPLE TREE //////////////
const defineAppleTree = function() {
	this.mesh = new THREE.Object3D();
	let appleTreeTrunkGeo = new THREE.BoxGeometry(2, 20, 2);
	let appleTreeTrunkMat = new THREE.MeshStandardMaterial({color: colours.brown02, flatShading: true});
	let appleTreeTrunk = new THREE.Mesh(appleTreeTrunkGeo, appleTreeTrunkMat);
	appleTreeTrunk.castShadow = true;
	appleTreeTrunk.receiveShadow = true;
	this.mesh.add(appleTreeTrunk);

	let appleTreeTop = new defineAppleTreeTop();
	// appleTreeTop.mesh.position.x = - 10;
	// appleTreeTop.mesh.position.y = 5;
	appleTreeTop.mesh.position.set(-10, 5, -5);
	this.mesh.add(appleTreeTop.mesh);
}

///////// DEFINE SPOTTY TREETOP ////////////
const defineSpottyTreeTop = function() {
  // Create an empty container that will hold the blocks of the tree top
  this.mesh = new THREE.Object3D();
	this.mesh.scale.set(1.5, 1.5, 1.5);

  //Create a cube geometry;
  //this shape will be duplicated to create the cloud
  let spottyTreeTopGeo = new THREE.SphereGeometry(2, 6, 6); //30, 30, 30

  //Create a material; a simple white material
  let spottyTreeTopMat = new THREE.MeshPhongMaterial({
    color:colours.green02,flatShading: true});

  // Duplicate the geometry a random number of times
  let numOfBlocs = 15+Math.floor(Math.random()*3);
  //Loop to create duplicates
  for (let i = 0; i < numOfBlocs; i++){
    //Create the mesh with the geometry + material
    let blocs = new THREE.Mesh(spottyTreeTopGeo, spottyTreeTopMat);
    //Set the position and rotation of each cube randomly
    blocs.position.x = i*.5;
    blocs.position.y = Math.random()*10;
    blocs.position.z = Math.random()*10;
    blocs.rotation.z = Math.random()*Math.PI*2;
    blocs.rotation.y = Math.random()*Math.PI*2;
    //Set the size of the cube randomly
    let size = .7 + Math.random()*2;
    blocs.scale.set(size,size,size);

    //Alow each cube to cast and receive shadows
    blocs.castShadow = true;
    blocs.receiveShadow = true;
    // Add the cube to the container we created at the beginning.
    this.mesh.add(blocs);
  }
}
/////////////TREE 4: DEFINE SPOTTY TREE //////////////
const defineSpottyTree = function() {
	this.mesh = new THREE.Object3D();
	let spottyTreeTrunkGeo = new THREE.BoxGeometry(4, 20, 4);
	let spottyTreeTrunkMat = new THREE.MeshStandardMaterial({color: colours.brown02, flatShading: true});
	let spottyTreeTrunk = new THREE.Mesh(spottyTreeTrunkGeo, spottyTreeTrunkMat);
	spottyTreeTrunk.castShadow = true;
	spottyTreeTrunk.receiveShadow = true;
	this.mesh.add(spottyTreeTrunk);

	let spottyTreeTop = new defineSpottyTreeTop();
	spottyTreeTop.mesh.position.set(-8, 6, -5);
	this.mesh.add(spottyTreeTop.mesh);
}

/////////////////// CREATE RANDOM FUCKING TREES ///////////////////

let trees;
function createTrees() {
	trees = new defineSpottyTree();


	trees.mesh.position.set(0, 305, 0);
	camera.lookAt(trees.mesh.position);
	// console.log(trees.mesh.position);
	scene.add(trees.mesh);
}

//TODO: Read rest of aviator tut, create hero, create trees, create rocks. Git and deploy.


////// DEFINE ROCK //////////////
const defineRock = function () {
	// this.mesh = new THREE.Object3D();
	let rockGeo = new THREE.BoxGeometry(3, 3, 3);
	let rockMat = new THREE.MeshStandardMaterial({color:colours.grey01, flatShading:true});
	let numOfBlocs = Math.floor(Math.random()*3);
	// Loop to create duplicates, 0-3 duplicates.
	for (let i = 0; i < numOfBlocs; i++){
	let blocs = new THREE.Mesh(rockGeo, rockMat);
	//Set the position and rotation of each cube randomly
	blocs.position.x = i*3;
	blocs.position.y = Math.random()*5;
	blocs.position.z = Math.random()*10;
	blocs.rotation.z = Math.random()*Math.PI*2;
	blocs.rotation.y = Math.random()*Math.PI*2;
	//Set the size of the cube randomly
	let size = 1 + Math.random()*2;
	blocs.scale.set(size,size,size);
	blocs.castShadow = true;
	blocs.receiveShadow = true;
	blocs.position.y = 300;
	this.mesh.add(blocs);
	}
}
//
// function createRocks(){
// 	numOfRocks = 30;
// 	for (var i = 0; i < array.length; i++) {
// 		array[i]
// 	}
// }














////////// INIT FUNCTION !!!!!!! ////////
function init() {  //add (event) afterwards
  //Set up the scene, camera and renderer
  createScene();


  //Add Lights
  createLights();

  //Add Objects
  createGround();
  createSky();
	createTrees();
	defineRock();

  /// FUCK ORBIT CONTROLS
  // addOrbitControls();


  // //Add MouseMove Event Listener
  // document.addEventListener('mousemove', handleMouseMove, false);

  //Start a loop that will update the objects' positions
  //And render the scene on each frame
  loop();
}

///////// LOOP ANIMATION ////////////

function loop() {
  //Rotate the propeller, sea and the sky
  // sea.mesh.rotation.z += .005;
  // sky.mesh.rotation.z += .01;
  //
  // //Update the plane on each frame
  // updatePlane();

  //Render the scene (+ its contents) and the camera. Need to rerender every time the animation changes.
  renderer.render(scene, camera);
	// console.log(camera.position);
	// console.log(camera.rotation);
	// console.log(camera.zoom);

  //Call the loop function again.
  requestAnimationFrame(loop);
}


///// HANDLE RESIZE CALLBACK  ////////

const handleWindowResize = () => {
  console.log('resizing renderer!');
  //update height and width of renderer and camera
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

//////////////// ORBIT CONTROLS //////////
function addOrbitControls() {
   controls = new OrbitControls(camera, renderer.domElement); //we want our camera that you want to change the position of, and the second argument is what you want to see.
  console.log('orbitcontrols added', controls);
  controls.update();
  console.log('updated controls', controls);
}


///// DOM BULLSHIT //////

  ////// INIT CALLBACK FUNCTION ON LOAD /////////
  window.addEventListener('load', init, false);

  ////// SCREEN RESIZE CALLBACK ///////
  window.addEventListener('resize', handleWindowResize, false);



	///// TRYING TO LOAD SOME OBJ SHIT ////
	// let manager = new THREE.LoadingManager();
	// 			manager.onProgress = function ( item, loaded, total ) {
	// 				console.log( item, loaded, total );
	// 			};
	//
	// let loader = new THREE.ObjectLoader(manager);
	// loader.load(
	// 	'../models/tree.obj',
	// 	function(object){
	// 		scene.add(object)
	// 	})
