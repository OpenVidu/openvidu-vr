/* eslint-disable no-param-reassign */
/* eslint-disable no-multi-assign */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */
let renderer; let
	camera;

let floorTexture;

let scene; let
	element;
let ambient;
let aspectRatio;
let mouse;

let video; let
	videoScreenShare;
let mixer;
let controls;
let clock;

let useRift = false;
let riftCam;

let modelLoader;

const studentBoxes = [];
let teacherBoxes = [];
const heightBoxVideo = 300;
const widthBoxVideo = 380;
const studentBoxLimite = 500;
const core = [];
const dataPackets = [];

let bodyAngle;
let bodyAxis;
let bodyPosition;
let viewAngle;

let velocity;
let oculusBridge;

const keys = [];

class OVVR {
	constructor() {
		for (let i = 0; i < 130; i++) {
			keys.push(false);
		}
	}

	initScene() {
		clock = new THREE.Clock();
		mouse = new THREE.Vector2(0, 0);

		// windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
		aspectRatio = window.innerWidth / window.innerHeight;

		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xcce0ff);


		camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 1000000000);
		// camera.useQuaternion = true;

		camera.position.set(800, 800, 0);
		camera.lookAt(scene.position);

		// Initialize the renderer
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setClearColor(0x1c1f2d);
		renderer.setSize(window.innerWidth, window.innerHeight);

		element = document.getElementById('viewport');
		element.appendChild(renderer.domElement);

		controls = new THREE.OrbitControls(camera);
	}

	initLights() {
		ambient = new THREE.AmbientLight(0xffffff);
		scene.add(ambient);
	}

	initGeometry() {
		let speedVector;

		const floorLoader = new THREE.TextureLoader();
		floorTexture = floorLoader.load('assets/textures/wood.jpg');
		floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
		floorTexture.repeat.set(20, 20);
		floorTexture.anisotropy = 32;

		const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
		const floorGeometry = new THREE.PlaneGeometry(1500, 1500, 10, 10);
		const floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -Math.PI / 2;

		scene.add(floor);

		for (let i = 0; i < 500; i++) {
			const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

			const size = Math.random() * 15 + 3;

			// eslint-disable-next-line max-len
			const box = new THREE.Mesh(new THREE.CubeGeometry(size, size * 0.1, size * 0.1), material);

			// eslint-disable-next-line max-len
			box.position.set(Math.random() * 1000 - 500, Math.random() * 1000 + 500, Math.random() * 1000 - 500);
			if (Math.random() > 0.5) {
				speedVector = new THREE.Vector3(0, 0, Math.random() * 1.5 + 0.5);
				box.rotation.y = Math.PI / 2;
			} else {
				speedVector = new THREE.Vector3(Math.random() * 1.5 + 0.5, 0, 0);
			}

			dataPackets.push({
				obj: box,
				speed: speedVector,
			});
			scene.add(box);
		}
	}

	generatePositionNumber(max, min, range) {
		const number = Math.random() * (max - min) + min;
		/* if (number > -range && number < range) {
			number = generatePositionNumber(max, min, range);
		} */
		return number;
	}

	createStudentBox() {
		// add some boxes.
		// var loader = new THREE.TextureLoader();
		// var boxTexture = loader.load('resources/textures/blue_blue.jpg');

		// var material = new THREE.MeshLambertMaterial({ emissive: 0x505050, map: boxTexture, color: 0x9b9b9b });

		const height = Math.random() * 150 + 10;
		const width = 20;

		const x = this.generatePositionNumber(-studentBoxLimite, studentBoxLimite, widthBoxVideo); // Math.random() * (studentBoxLimite - widthBoxVideo) + widthBoxVideo;
		const y = height / 2;
		const z = Math.random() * (-studentBoxLimite - studentBoxLimite) + studentBoxLimite;

		/* var box = new THREE.Mesh(new THREE.CubeGeometry(width, height, width), material);
		box.position.set(x, y, z);
		box.rotation.set(0, Math.random() * Math.PI * 2, 0);

		studentBoxes.push(box);
		scene.add(box); */

		modelLoader.load('assets/models/Sitting.fbx', (object) => {
			mixer = new THREE.AnimationMixer(object);
			const action = mixer.clipAction(object.animations[0]);
			action.play();
			object.position.set(x, 0, z);
			const random = 0.7079608503944332;
			object.rotation.set(0, random * Math.PI * 2, 0);
			object.height = 2000;
			object.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
			studentBoxes.push(object);
			scene.add(object);
		});
	}

	removeStudentBox() {
		if (studentBoxes.length > 0) {
			scene.remove(studentBoxes[studentBoxes.length - 1]);
			studentBoxes.pop();
		}
	}

	createTeacherBox() {
		console.log('CREATING TEACHER OBJECT');
		const videoTexture = new THREE.VideoTexture(video);
		const material = new THREE.MeshLambertMaterial({
			map: videoTexture,
			side: THREE.DoubleSide,
			alphaTest: 0.5,
		});
		const box = new THREE.Mesh(new THREE.CubeGeometry(0, heightBoxVideo, widthBoxVideo), material);

		box.position.set(-600, heightBoxVideo / 1.8, widthBoxVideo / 1.9);

		teacherBoxes.push(box);
		scene.add(box);
	}

	createScreenBox() {
		const videoScreenShareTexture = new THREE.VideoTexture(videoScreenShare);
		const material2 = new THREE.MeshLambertMaterial({
			map: videoScreenShareTexture,
			side: THREE.DoubleSide,
			alphaTest: 0.5,
		});
		const box2 = new THREE.Mesh(new THREE.CubeGeometry(0, heightBoxVideo, widthBoxVideo), material2);
		box2.position.set(-600, heightBoxVideo / 1.8, -widthBoxVideo / 1.9);

		teacherBoxes.push(box2);
		scene.add(box2);
	}

	removeTeacherBox() {
		teacherBoxes.forEach((box) => {
			teacherBoxes.pop();
			scene.remove(box);
		});
		teacherBoxes = [];
	}

	init(role) {
		//  global.document = document;
		global.document.addEventListener('keydown', this.onKeyDown, false);
		global.document.addEventListener('keyup', this.onKeyUp, false);
		global.document.addEventListener('mousedown', this.onMouseDown, false);
		global.document.addEventListener('mousemove', this.onMouseMove, false);

		global.document.getElementById('toggle-render').addEventListener('click', () => {
			useRift = !useRift;
			this.onResize();
		});

		window.document.getElementById('help').addEventListener('click', () => {
			const el = document.getElementById('help-text');
			el.style.display = el.style.display === 'none' ? '' : 'none';
		});

		modelLoader = new THREE.FBXLoader();

		window.addEventListener('resize', this.onResize, false);
		video = document.getElementById('video');
		videoScreenShare = document.getElementById('videoScreenShare');

		bodyAngle = 3.75;
		bodyAxis = new THREE.Vector3(0, 1, 0);
		bodyPosition = new THREE.Vector3(100, 50, 0);
		velocity = new THREE.Vector3();

		this.initScene();
		this.initGeometry();
		this.initLights();

		if (role === 'PUBLISHER') {
			this.createTeacherBox();
			this.createScreenBox();
		}

		oculusBridge = new OculusBridge({
			debug: true,
			onOrientationUpdate: this.bridgeOrientationUpdated,
			onConfigUpdate: this.bridgeConfigUpdated,
			onConnect: this.bridgeConnected,
			onDisconnect: this.bridgeDisconnected,
		});
		oculusBridge.connect();

		riftCam = new THREE.StereoEffect(renderer);
		riftCam.setEyeSeparation(-1.8);
	}

	onResize() {
		if (!useRift) {
			aspectRatio = window.innerWidth / window.innerHeight;

			camera.aspect = aspectRatio;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		} else {
			riftCam.setSize(window.innerWidth, window.innerHeight);
		}
	}

	bridgeConnected() {
		document.getElementById('logo').className = '';
	}

	bridgeDisconnected() {
		document.getElementById('logo').className = 'offline';
	}

	bridgeConfigUpdated(config) {
		console.log('Oculus config updated.');
		// riftCam.setHMD(config);
	}

	bridgeOrientationUpdated(quatValues) {
		// Do first-person style controls (like the Tuscany demo) using the rift and keyboard.

		// TODO: Don't instantiate new objects in here, these should be re-used to avoid garbage collection.

		// make a quaternion for the the body angle rotated about the Y axis.
		const quat = new THREE.Quaternion();
		quat.setFromAxisAngle(bodyAxis, bodyAngle);

		// make a quaternion for the current orientation of the Rift
		const quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w);

		// multiply the body rotation by the Rift rotation.
		quat.multiply(quatCam);

		// Make a vector pointing along the Z axis and rotate it accoring to the combined look/body angle.
		const xzVector = new THREE.Vector3(0, 0, 1);
		xzVector.applyQuaternion(quat);

		// Compute the X/Z angle based on the combined look/body angle.  This will be used for FPS style movement controls
		// so you can steer with a combination of the keyboard and by moving your head.
		viewAngle = Math.atan2(xzVector.z, xzVector.x) + Math.PI;

		// Apply the combined look/body angle to the camera.
		camera.quaternion.copy(quat);
	}

	onMouseMove(event) {
		mouse.set((event.clientX / window.innerWidth - 0.5) * 2, (event.clientY / window.innerHeight - 0.5) * 2);
	}

	onMouseDown(event) {
		// Stub
		floorTexture.needsUpdate = true;
	}

	onKeyDown(event) {
		if (event.keyCode === 48) {
			// zero key.
			useRift = !useRift;
			onResize();
		}

		// prevent repeat keystrokes.
		if (!keys[32] && event.keyCode === 32) {
			// Spacebar to jump
			velocity.y += 1.9;
		}

		keys[event.keyCode] = true;
	}

	onKeyUp(event) {
		keys[event.keyCode] = false;
	}

	updateInput(delta) {
		const step = 50 * delta;
		const turn_speed = (55 * delta * Math.PI) / 180;

		// Forward/backward

		if (keys[87] || keys[38]) {
			// W or UP
			bodyPosition.x += Math.cos(viewAngle) * step;
			bodyPosition.z += Math.sin(viewAngle) * step;
		}

		if (keys[83] || keys[40]) {
			// S or DOWN
			bodyPosition.x -= Math.cos(viewAngle) * step;
			bodyPosition.z -= Math.sin(viewAngle) * step;
		}

		// Turn

		if (keys[81]) {
			// E
			bodyAngle += turn_speed;
		}

		if (keys[69]) {
			// Q
			bodyAngle -= turn_speed;
		}

		// Straif

		if (keys[65] || keys[37]) {
			// A or LEFT
			bodyPosition.x -= Math.cos(viewAngle + Math.PI / 2) * step;
			bodyPosition.z -= Math.sin(viewAngle + Math.PI / 2) * step;
		}

		if (keys[68] || keys[39]) {
			// D or RIGHT
			bodyPosition.x += Math.cos(viewAngle + Math.PI / 2) * step;
			bodyPosition.z += Math.sin(viewAngle + Math.PI / 2) * step;
		}

		// VERY simple gravity/ground plane physics for jumping.

		velocity.y -= 0.15;

		bodyPosition.y += velocity.y;

		if (bodyPosition.y < 15) {
			velocity.y *= -0.12;
			bodyPosition.y = 15;
		}

		// update the camera position when rendering to the oculus rift.
		if (useRift) {
			camera.position.set(bodyPosition.x, 150, bodyPosition.z);
		}
	}

	animate() {
		const delta = clock.getDelta();

		if (mixer) mixer.update(delta);

		this.updateInput(delta);

		for (let i = 0; i < core.length; i++) {
			core[i].rotation.x += delta * 0.25;
			core[i].rotation.y -= delta * 0.33;
			core[i].rotation.z += delta * 0.1278;
		}

		const bounds = 600;
		for (let j = 0; j < dataPackets.length; j++) {
			dataPackets[j].obj.position.add(dataPackets[j].speed);
			if (dataPackets[j].obj.position.x < -bounds) {
				dataPackets[j].obj.position.x = bounds;
			} else if (dataPackets[j].obj.position.x > bounds) {
				dataPackets[j].obj.position.x = -bounds;
			}
			if (dataPackets[j].obj.position.z < -bounds) {
				dataPackets[j].obj.position.z = bounds;
			} else if (dataPackets[j].obj.position.z > bounds) {
				dataPackets[j].obj.position.z = -bounds;
			}
		}

		if (this.render()) {
			requestAnimationFrame(this.animate.bind(this));
		}
	}

	crashSecurity(e) {
		oculusBridge.disconnect();
		document.getElementById('viewport').style.display = 'none';
		document.getElementById('security_error').style.display = 'block';
	}

	crashOther(e) {
		oculusBridge.disconnect();
		document.getElementById('viewport').style.display = 'none';
		document.getElementById('generic_error').style.display = 'block';
		document.getElementById('exception_message').innerHTML = e.message;
	}

	render() {
		try {
			if (useRift) {
				riftCam.render(scene, camera);
			} else {
				controls.update();
				renderer.render(scene, camera);
			}
		} catch (e) {
			console.log(e);
			if (e.name === 'SecurityError') {
				this.crashSecurity(e);
			} else {
				this.crashOther(e);
			}
			return false;
		}
		return true;
	}
}

module.exports = {
	OVVR,
};
