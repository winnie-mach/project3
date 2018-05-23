import '../css/index.css';
import * as THREE from "three";
import dat from "dat.gui"; //a library that is a controller so you can tumble, pan etc.
import OrbitControls from "three-orbitcontrols";
// import imageURL from './grassDiff.jpg';
import grassDiffTexture from '../textures/grassDiff.jpg';
import grassBmpTexture from '../textures/grassBump.png';
import grassAOTexture from '../textures/grassAO.jpg';
import skydomeTexture from '../textures/daytonight.png'
const treeGeo = require('../models/tree.obj');


const colours = {  //global variables
	blue01: 0x97b5e6,
  blue02: 0x78afc4,
  blue03: 0xb8ccd7,
  green01: 0x424f23,
  green02: 0x88842b,
  green03: 0xb2b854,
	green04: 0x277c5c,
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

/// Light config stuff
let shadowConfig = {
	shadowCameraVisible: false,
	shadowCameraNear: 750,
	shadowCameraFar: 4000,
	shadowCameraFov: 30,
	shadowBias: -0.0002
};

let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, controls;  //global variables

let world, sky, ground, clouds, trees, rocks, mountain, camtree; //(global variable)


///// CREATE SCENE, CAMERA, RENDERER ///////

const createScene = () => {
  //Get the width and the height of the screen,
  //Use them to set up the aspect ratio of the camera
  //and the size of the render.
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Create the SCENE
  scene = new THREE.Scene();

  // Add a fog effect to the scene, same colour as the background colour
  scene.fog = new THREE.Fog(colours.blue03, 10, 2500);


  // Create the CAMERA
  aspectRatio = WIDTH / HEIGHT; //set up aspect ratio with WIDTH + HEIGHT
  fieldOfView = 60;
  nearPlane = 0.1;
  farPlane = 100000;

  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
	camera.position.x = 0;
	camera.position.y = 325;
	camera.position.z = 400;
	camera.lookAt({x: 0, y: 300.00000000000001, z: 450})
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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Add the DOM element of the renderer to the container we created in the HTML.
container = document.getElementById('world');
container.appendChild(renderer.domElement);
}

/////// CREATE LIGHTS /////////

let hemisphereLight, backLight, ambientLight, pointLight, sunLight; //global variables

const createLights = () => {
  // A hemisphere Light is a gradient coloured light;
  //First param is the sky colour, second param is the ground colour, third param is the intensity of the light.
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .0);

  // A directional light shines from a specific direction.
  //Acts like the sun, means all the rays produced are parallel.
  backLight = new THREE.DirectionalLight(0xffffff, .9);
  //Set the direction of the direcitonal light
  backLight.position.set(-500, -700, -400); //150, 350, 350
	backLight.rotation.set(0, 0, 0)
  //Allow directional light to cast shadows
  backLight.castShadow = false;
	// backLight.shadowCameraVisible = true;
  //Define the visible area of the projected shadow
  backLight.shadow.camera.left = - 400;
  backLight.shadow.camera.right = 400;
  backLight.shadow.camera.top = 400;
  backLight.shadow.camera.bottom = - 400;
  backLight.shadow.camera.near = 1;
  backLight.shadow.camera.far = - 1000;
  // Define the resolution of the shadow, the higher the better but also more expensive and less performant





	ambientLight = new THREE.AmbientLight( 0x3f2806 );
	pointLight = new THREE.PointLight( 0xffc95c, 1, 5000 );   //0xffaa00
	pointLight.position.set(0, 500, 0);
	sunLight = new THREE.SpotLight( 0xffffff, 0.3, 0, Math.PI/2 );
	sunLight.position.set( 1000, 2000, 1000 ); //1k, 2k, 1k
	sunLight.castShadow = true;
	sunLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( shadowConfig.shadowCameraFov, 1, shadowConfig.shadowCameraNear, shadowConfig.shadowCameraFar ) );
	sunLight.shadow.bias = shadowConfig.shadowBias;
  // To activate the lights, just add them to the
		scene.add( ambientLight );
		scene.add( pointLight );
		scene.add( sunLight );
  // scene.add(hemisphereLight);
  scene.add(backLight);

}

////////// SUNLIGHT ANIM BULLSHIT //////

var angle = 0;
var position = 0;

// direction vector for movement
var direction = new THREE.Vector3(1, 0, 0);
var up = new THREE.Vector3(0, 0, 1);
var axis = new THREE.Vector3();
// scalar to simulate speed
var speed = 0.5
let path;
var radius = 2000; //1100
var degreesStart = 360;  //75
var degreesEnd = 1; //30
var radiansStart = (degreesStart * Math.PI) / 180;
var radiansEnd = ((degreesEnd) * Math.PI) / 180;

// the path
  // path = new THREE.Path([
  //   new THREE.Vector2(-70, -70), //-50, -50
  //   new THREE.Vector2(-70, -70),
	// 	]);
		path = new THREE.EllipseCurve(0, 0, radius, radius, radiansStart, radiansEnd, true);

  // var arcRadius = 50;
	// path.set
  // path.moveTo(0, 0 - arcRadius);
  // path.absarc(0, 0, arcRadius, -Math.PI / 2, 0, false);
  // path.lineTo(50, 50);


  // Start angle and point
  let previousAngle = getAngle( position );
  let previousPoint = path.getPointAt( position );


function drawPath() {
  var vertices = path.getSpacedPoints(20);

  // Change 2D points to 3D points
  for (var i = 0; i < vertices.length; i++) {
		let point = vertices[i]
    vertices[i] = new THREE.Vector3(point.x, point.y, 0);
  }
  var lineGeometry = new THREE.Geometry();
  lineGeometry.vertices = vertices;
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xf7f052
  });
  var line = new THREE.Line(lineGeometry, lineMaterial)
  scene.add(line);
}

function move() {

  // add up to position for movement
  position += 0.001;

  // get the point at position
  var point = path.getPointAt(position);
  sunLight.position.x = point.x;
  sunLight.position.y = point.y;

  var angle = getAngle(position);
  // set the quaternion
  sunLight.quaternion.setFromAxisAngle( up, angle );

  sunLight.position.x += ( point.x - previousPoint.x );
  sunLight.position.y += ( point.y - previousPoint.y );

  // set the quaternion
  sunLight.rotation.z += ( angle - previousAngle );

  previousPoint = point;
  previousAngle = angle;

}

function getAngle( position ){
// get the 2Dtangent to the curve
  var tangent = path.getTangent(position).normalize();

  // change tangent to 3D
  angle = - Math.atan( tangent.x / tangent.y);

  return angle;
}

////////////////////////////////////////////////


THREE.ImageUtils.crossOrigin = ''; //Allow CORS

////// DEFINING A GROUND /////////////
// This function is defining what a sea would look like
const defineGround = function() { //(global variable)
  	let geo = new THREE.SphereGeometry(300, 30, 30);

		let grassDiffuse = new THREE.TextureLoader().load(grassDiffTexture);
		grassDiffuse.repeat.set(20,20)
		grassDiffuse.wrapS = grassDiffuse.wrapT = THREE.RepeatWrapping;
		grassDiffuse.anisotropy = 16;
		// grassDiffuse.needsUpdate = true;

		let grassBump = THREE.ImageUtils.loadTexture(grassBmpTexture);
		grassBump.repeat.set(20, 20);
		grassBump.wrapS = grassBump.wrapT = 	THREE.RepeatWrapping;
		grassBump.anisotropy = 16;
		// grassBump.needsUpdate = true;

		let grassAO = THREE.ImageUtils.loadTexture(grassAOTexture);
		console.log('AO', grassAO);
		grassAO.repeat.set(20, 20);
		grassAO.wrapS = grassBump.wrapT = 	THREE.RepeatWrapping;
		grassAO.anisotropy = 16;
		// grassAO.needsUpdate = true;

  	let mat = new THREE.MeshPhongMaterial( {
			flatShading: false,
			map: grassDiffuse,
			bumpMap: grassBump,
			bumpScale: .8,
			aoMap: grassAO,
			metalness: 0.0,
			reflectivity: 0.0,
			shininess: 0.0,
			wireframe: false
		} )
		console.log(mat);
  this.mesh = new THREE.Mesh( geo, mat );
  	this.mesh.receiveShadow = true;
  	this.mesh.castShadow= false;
  	this.mesh.rotation.z= - Math.PI/2;
  };



//////// DEFINING A CLOUD //////////

const defineCloud = function() {
  // Create an empty container that will hold the different parts of the cloud
  this.mesh = new THREE.Object3D();

  //Create a cube geometry;
  //this shape will be duplicated to create the cloud
  let geo = new THREE.IcosahedronGeometry(15); //30, 30, 30

  //Create a material; a simple white material
  let mat = new THREE.MeshStandardMaterial({
    color:colours.white02,
		opacity: .5
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

///// DEFINING A CLOUD GROUP WITH OUR CLOUDS //////////
const defineCloudRing = function() { //(global variable)
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
    // cloud.mesh.rotation.z = a + Math.PI/2;
    //For a better result we position the clouds at random depths inside the scene using the z (depth) axis.
    // cloud.mesh.position.z = - 600;
    //Also setting a random scale for each cloud
    let size = 1 + Math.random()*3;
    cloud.mesh.scale.set(size,size,size);

    //Finally, adding the cloud to the scene
    this.mesh.add(cloud.mesh);
  }
};

////////////// TREE 1: DEFINE PINE TREE /////////////////
const definePineTree = function() {
	this.mesh = new THREE.Object3D();
	let pineTrunkGeo = new THREE.BoxGeometry(2, 13, 2);
	let pineTrunkMat = new THREE.MeshStandardMaterial({
		color: colours.brown01,
		flatShading: true,
		metalness: 0.0,
		reflectivity: 0.0,
		shininess: 0.0});
	let pineTrunk = new THREE.Mesh(pineTrunkGeo, pineTrunkMat);
	pineTrunk.castShadow = true;
	pineTrunk.receiveShadow = true;
	pineTrunk.scale.set(1.5,1.5,1.5);
	this.mesh.add(pineTrunk);
	let pineTopGeo = new THREE.ConeGeometry( 6, 14, 8 );
	let pineTopMat = new THREE.MeshStandardMaterial({
		color:colours.green04,
		flatShading:true,
		metalness: 0.0,
		reflectivity: 0.0,
		shininess: 0.0})
	let pineTreeTop = new THREE.Mesh(pineTopGeo, pineTopMat);
	pineTreeTop.castShadow = true;
	pineTreeTop.receiveShadow = true;
	pineTreeTop.position.y = 10;
	pineTreeTop.scale.set(1.5,1.5,1.5);
	this.mesh.add(pineTreeTop);
}

////////////// TREE 2: DEFINE ROUND TREE /////////////
const defineRoundTree = function() {
	this.mesh = new THREE.Object3D();
	let roundTrunkGeo = new THREE.BoxGeometry(2, 20, 2);
	let roundTrunkMat = new THREE.MeshStandardMaterial({
		color: colours.brown02,
		 flatShading: true,
		 metalness: 0.0,
		 reflectivity: 0.0,
		 shininess: 0.0});
	let roundTrunk = new THREE.Mesh(roundTrunkGeo, roundTrunkMat);
	roundTrunk.castShadow = true;
	roundTrunk.receiveShadow = true;
	roundTrunk.scale.set(1.5,1.5,1.5);
	this.mesh.add(roundTrunk);


	let roundTopGeo = new THREE.SphereGeometry( 7, 7, 8 );
	let roundTopMat = new THREE.MeshStandardMaterial({
		color:colours.green03,
		flatShading:true,
		metalness: 0.0,
		reflectivity: 0.0,
		shininess: 0.0})
	let roundTreeTop = new THREE.Mesh(roundTopGeo, roundTopMat);
	roundTreeTop.castShadow = true;
	roundTreeTop.receiveShadow = true;
	roundTreeTop.position.y = 10;
	roundTreeTop.scale.set(1.5,1.5,1.5);
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
    color:colours.green01,
		flatShading: true,
		metalness: 0.0,
		reflectivity: 0.0,
		shininess: 0.0
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
	let appleTreeTrunkMat = new THREE.MeshStandardMaterial({
		color: colours.brown03,
		flatShading: true,
		metalness: 0.0,
		reflectivity: 0.0,
		shininess: 0.0});
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
    color:colours.green02,
		flatShading: true,
		metalness: 0.0,
		reflectivity: 0.0,
		shininess: 0.0});

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
	let spottyTreeTrunkMat = new THREE.MeshStandardMaterial({
		color: colours.orange01,
		 flatShading: true,
		 metalness: 0.0,
		 reflectivity: 0.0,
		 shininess: 0.0});
	let spottyTreeTrunk = new THREE.Mesh(spottyTreeTrunkGeo, spottyTreeTrunkMat);
	spottyTreeTrunk.castShadow = true;
	spottyTreeTrunk.receiveShadow = true;
	this.mesh.add(spottyTreeTrunk);

	let spottyTreeTop = new defineSpottyTreeTop();
	spottyTreeTop.mesh.position.set(-8, 6, -5);
	this.mesh.add(spottyTreeTop.mesh);
}


////// DEFINE ROCK //////////////
const defineRock = function () {
	this.mesh = new THREE.Object3D();
	let rockGeo = new THREE.BoxGeometry(3, 3, 3);
	let rockMat = new THREE.MeshStandardMaterial({
		color:colours.grey02,
		 flatShading:true,
		 metalness: 0.0,
		 reflectivity: 0.0,
		 shininess: 0.0});
	let numOfBlocs = Math.floor(Math.random()*3);
	// Loop to create duplicates, 0-3 duplicates.
	for (let i = 1; i < numOfBlocs; i++){
	let blocs = new THREE.Mesh(rockGeo, rockMat);
	//Set the position and rotation of each cube randomly
	blocs.position.x = i*3;
	blocs.position.y = Math.random()*2;
	blocs.position.z = Math.random()*10;
	blocs.rotation.z = Math.random()*Math.PI*2;
	blocs.rotation.y = Math.random()*Math.PI*2;
	//Set the size of the cube randomly
	let size = 1 + Math.random()*2;
	blocs.scale.set(size,size,size);
	blocs.castShadow = true;
	blocs.receiveShadow = true;
	this.mesh.add(blocs);
	}
}


///// Random Lat Long Function /////

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
}


//////// DEFINE WORLD //////////
const defineWorld = function(){
	this.mesh = new THREE.Object3D();

////////// CREATING AN INSTANCE OF GROUND /////////////
	ground = new defineGround();
	ground.mesh.position.y= 0; // -150
	ground.mesh.position.z= 0; //150
	// Add the mesh of the sea to the scene
	this.mesh.add(ground.mesh);

////// CREATE CAMERA TREE ////////

	camtree = new definePineTree();
	camtree.mesh.position.y = 305;
	camera.lookAt(camtree.mesh.position);

/////////////////// CREATE RANDOM FUCKING TREES ///////////////////

for (let i = 0; i < 100; i++) {
        let pineTree = new definePineTree();
        let roundTree = new defineRoundTree();
        let appleTree = new defineAppleTree();
        let spottyTree = new defineSpottyTree();
        let treesArray = [pineTree, roundTree, appleTree, spottyTree];
        trees = treesArray[i % treesArray.length];

        // generate random lat long coordinates
        let lat = getRandomInRange(-180, 180, 3)
        let long = getRandomInRange(-180, 180, 3)

        let latRad = lat * (Math.PI / 180);
        let longRad = -long * (Math.PI / 180);

        trees.mesh.position.x = 304 * Math.cos(latRad) * Math.cos(longRad);
        trees.mesh.position.y = 304 * Math.sin(latRad);
        trees.mesh.position.z = 304 * Math.cos(latRad) * Math.sin(longRad);

        trees.mesh.rotation.set(0.0, -longRad, latRad - Math.PI * 0.5);

        this.mesh.add(trees.mesh)
    }


///// CREATE RANDOM ROCKS //////
	let numOfRocks = 500;
	for (let i = 0; i < numOfRocks; i++) {
		rocks = new defineRock();
		let theta = (Math.random() - 0.5)*4*Math.PI;
		let phi = (Math.random() - 0.5)*2*Math.PI;
		rocks.mesh.position.x = 295 * Math.sin(theta)* Math.cos(phi);
		rocks.mesh.position.y =  295 * Math.sin(theta)* Math.sin(phi);
		rocks.mesh.position.z =  295 * Math.cos(theta) - 5;
		this.mesh.add(rocks.mesh);
	}
}

//// DEFINE SKY //////
const defineSky = function() {
	this.mesh = new THREE.Object3D();
	///////////// CREATE A SKYBOX //////////////

	    // prepare ShaderMaterial
	    let uniforms = {
	        texture: { type: 't', value: THREE.ImageUtils.loadTexture(skydomeTexture) }
	    };
	    let skyMaterial = new THREE.ShaderMaterial( {
	        uniforms: uniforms,
	        vertexShader: document.getElementById('sky-vertex').textContent, fragmentShader: document.getElementById('sky-fragment').textContent,
					side: THREE.BackSide
	    });
	    // create Mesh with sphere geometry and add to the scene
	    let skyBox = new THREE.Mesh(new THREE.SphereGeometry(5000, 60, 40), skyMaterial);
	    skyBox.scale.set(-1, 1, 1);
	    skyBox.rotation.order = 'XZY';
	    skyBox.renderDepth = 500.0;
	    this.mesh.add(skyBox);
}

//////// CREATE MULTIPLE INSTANCES OF CLOUDS ///////////
const defineCloudGrp = function(){
	this.mesh = new THREE.Object3D();
	let numOfClouds = 200;
	for (let i = 0; i < numOfClouds; i++) {
		clouds = new defineCloud();
		let theta = (Math.random() - 0.5)*4*Math.PI;
		let phi = (Math.random() - 0.5)*2*Math.PI;
		clouds.mesh.position.x = 700 * Math.sin(theta)* Math.cos(phi);
		clouds.mesh.position.y =  700 * Math.sin(theta)* Math.sin(phi);
		clouds.mesh.position.z =  700 * Math.cos(theta) - 5;
		this.mesh.add(clouds.mesh);
	}
}

//////// DEFINE MOUNTAINS /////
const defineMountain = function(){
	let geo = new THREE.CylinderGeometry(300,50,200,40,10);
	geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

	// important: by merging vertices we ensure the continuity of the waves
	geo.mergeVertices();

	// get the vertices
	var l = geo.vertices.length;

	// create an array to store new data associated to each vertex
	this.slopes = [];

	for (var i=0; i<l; i++){
		// get each vertex
		var v = geo.vertices[i];

		// store some data associated to it
		this.slopes.push({y:v.y,
										 x:v.x,
										 z:v.z,
										 // a random angle
										 ang:Math.random()*Math.PI*2,
										 // a random distance
										 amp:10 + Math.random()*15,
										});
	};
	var mat = new THREE.MeshPhongMaterial({
		color:colours.grey01,
		flatShading: true
	});

	this.mesh = new THREE.Mesh(geo, mat);
	this.mesh.receiveShadow = true;
	this.mesh.position.y = 50;
	this.mesh.position.z = - 400;
}
////// DEFINE THE SLOPES ON THE MOUNTAIN ///////
defineMountain.prototype.createSlopes = function (){

	// get the vertices
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;

	for (var i=0; i<l; i++){
		var v = verts[i];

		// get the data associated to it
		var vprops = this.slopes[i];

		// update the position of the vertex
		v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
	}
}





// ___________________________________________________





/////// CREATING THE ENTIRE WORLD //////////////

function createWorld () {
	world = new defineWorld();
	scene.add(world.mesh);
}

////////// CREATING THE SLOPPY MOUNTAIN ////////////


function createMountain() {
	mountain = new defineMountain();
	scene.add(mountain.mesh);
}


///// CREATE THE SKY /////////

function createSky() {
	sky = new defineSky();
	scene.add(sky.mesh);
}

///// CREATE THE CLOUDS //////
function createClouds() {
	clouds = new defineCloudGrp();
	scene.add(clouds.mesh);
}


//TODO: animate lights day + night, grass? alpha?












////////// INIT FUNCTION !!!!!!! ////////
function init() {  //add (event) afterwards
  //Set up the scene, camera and renderer
  createScene();


  //Add Lights
  createLights();
	drawPath();
	// move();

	//Add World: skybox, ground, clouds, trees, rocks
	createWorld();
	createSky();
	createClouds();
	createMountain();
	mountain.createSlopes();


  /// FUCK ORBIT CONTROLS
  // addHelpers();


  // //Add MouseMove Event Listener
  // document.addEventListener('mousemove', handleMouseMove, false);

  //Start a loop that will update the objects' positions
  //And render the scene on each frame
  loop();

}

///////// LOOP ANIMATION ////////////

function loop() {
  //Rotate the ground and the sky
	world.mesh.rotation.x += 0.004;
	clouds.mesh.rotation.x += 0.002;
	sky.mesh.rotation.x += 0.001;



  //Render the scene (+ its contents) and the camera. Need to rerender every time the animation changes.
  renderer.render(scene, camera);


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
function addHelpers() {
		// 1.Orbit Controls
   controls = new OrbitControls(camera, renderer.domElement); //we want our camera that you want to change the position of, and the second argument is what you want to see.
	 controls.update();

	 // 2. ArrowHelper
	 let directionV3 = new THREE.Vector3(1, 0, 1);
	 let originV3 = new THREE.Vector3(0, 200, 0);
	 let arrowHelper = new THREE.ArrowHelper(directionV3, 	originV3, 100, 0xff0000, 20, 10); // 100 is length, 20 	and 10 are head length and width
	 scene.add(arrowHelper);

	 //3. Axis Helper
	 let axes = new THREE.AxesHelper(200);
	 scene.add(axes);

	 //4. Bounding Box Helper
	 let bboxHelper = new THREE.BoxHelper(scene, 0x999999); //first argument is what you want bounding box to be around
	 scene.add(bboxHelper);
	 bboxHelper.update();

	 //5. Camera Helper
	 let cameraParObj = new THREE.Object3D();
	 cameraParObj.position.y = 200;
	 cameraParObj.position.z = 700;
	 scene.add(cameraParObj);
	 cameraParObj.add(camera); //passing in my camera
	 let cameraHelper = new THREE.CameraHelper(camera); //passing in my camera
	 scene.add(cameraHelper);
	 cameraHelper.update();

	 //6. DirectionalLight Helper
	 let dlightHelper = new THREE.DirectionalLightHelper(backLight, 50); // 50 is helper size, shadowLight is my directional light
	 scene.add(dlightHelper);
	 dlightHelper.update();

	 //7. HemisphereLight Helper
	 let hlightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 50, 300); // 50 is sphere size, 300 is arrow length, hemisphereLight is my light I've passed in.
	 // scene.add(hlightHelper);

	 //8. Grid Helper
	 let gridHelper = new THREE.GridHelper(1000, 40, colours.red01); // 500 is grid size, 20 is grid step
	 scene.add(gridHelper);

	 //9. sunLight Helper
	 let shadowCameraHelper = new THREE.CameraHelper( sunLight.shadow.camera );
		shadowCameraHelper.visible;	shadowConfig.shadowCameraVisible;
		scene.add( shadowCameraHelper );

	//10. PointLight Helper
	let pointLightHelper = new THREE.PointLightHelper( pointLight, 10 );
	scene.add( pointLightHelper );



}


///// DOM BULLSHIT //////

  ////// INIT CALLBACK FUNCTION ON LOAD /////////
  window.addEventListener('load', init, false);
  ////// SCREEN RESIZE CALLBACK ///////
  window.addEventListener('resize', handleWindowResize, false);

	///// TRYING TO LOAD SOME OBJ SHIT ////
	// let loader = new THREE.OBJLoader();
	// loader.load(
	// 	treeGeo,
	// 	function(object){
	// 		scene.add(object)
	// 	})
