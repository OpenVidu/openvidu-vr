var renderer, camera;
var scene, element;
var ambient, point;
var aspectRatio;
var mouse;

var video, videoScreenShare;
var mixer;
var controls;
var clock;

var useRift = false;
var riftCam;

var modelLoader;

var studentBoxes = [];
var teacherBoxes = [];
var heightBoxVideo = 300;
var widthBoxVideo = 380;
var studentBoxLimite = 500;
var core = [];
var dataPackets = [];

var bodyAngle;
var bodyAxis;
var bodyPosition;
var viewAngle;

var velocity;
var oculusBridge;

// Map for key states
var keys = [];
for (var i = 0; i < 130; i++) {
    keys.push(false);
}

function initScene() {
    clock = new THREE.Clock();
    mouse = new THREE.Vector2(0, 0);

    //windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    aspectRatio = window.innerWidth / window.innerHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 1000000000);
    //camera.useQuaternion = true;

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

function initLights() {
    ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);
}

var floorTexture;
function initGeometry() {
    var floorLoader = new THREE.TextureLoader();
    floorTexture = floorLoader.load('resources/textures/wood.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(20, 20);
    floorTexture.anisotropy = 32;

    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
    var floorGeometry = new THREE.PlaneGeometry(1500, 1500, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;

    scene.add(floor);

    for (var i = 0; i < 500; i++) {
        var material = new THREE.MeshLambertMaterial({ color: 0xffffff });

        var size = Math.random() * 15 + 3;

        var box = new THREE.Mesh(new THREE.CubeGeometry(size, size * 0.1, size * 0.1), material);

        box.position.set(Math.random() * 1000 - 500, Math.random() * 1000 + 500 ,Math.random() * 1000 - 500);
        var speedVector;
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

function generatePositionNumber(max, min, range) {
    var number = Math.random() * (max - min) + min;
    /*if (number > -range && number < range) {
        number = generatePositionNumber(max, min, range);
    }*/
    return number;
}

function createStudentBox() {
    // add some boxes.
    //var loader = new THREE.TextureLoader();
    //var boxTexture = loader.load('resources/textures/blue_blue.jpg');

    //var material = new THREE.MeshLambertMaterial({ emissive: 0x505050, map: boxTexture, color: 0x9b9b9b });

    var height = Math.random() * 150 + 10;
    var width = 20;

    var x = generatePositionNumber(-studentBoxLimite, studentBoxLimite, widthBoxVideo); //Math.random() * (studentBoxLimite - widthBoxVideo) + widthBoxVideo;
    var y = height / 2;
    var z = Math.random() * (-studentBoxLimite - studentBoxLimite) + studentBoxLimite;

    /*var box = new THREE.Mesh(new THREE.CubeGeometry(width, height, width), material);
    box.position.set(x, y, z);
    box.rotation.set(0, Math.random() * Math.PI * 2, 0);

    studentBoxes.push(box);
    scene.add(box);*/

    modelLoader.load('resources/models/Sitting.fbx', function(object) {
        mixer = new THREE.AnimationMixer(object);
        var action = mixer.clipAction(object.animations[0]);
        action.play();
        object.position.set(x, 0, z);
        var random = 0.7079608503944332;
        object.rotation.set(0, random * Math.PI * 2, 0);
        object.height = 2000;
        object.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        studentBoxes.push(object);
        scene.add(object);
    });
}

function removeStudentBox() {
    if (studentBoxes.length > 0) {
        scene.remove(studentBoxes[studentBoxes.length - 1]);
        studentBoxes.pop();
    }
}

function createTeacherBox() {
    console.log('CREATING TEACHER OBJECT');
    var videoTexture = new THREE.VideoTexture(video);
    var material = new THREE.MeshLambertMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
    });
    var box = new THREE.Mesh(new THREE.CubeGeometry(0, heightBoxVideo, widthBoxVideo), material);

    box.position.set(-600, heightBoxVideo / 1.8, widthBoxVideo / 1.9);

    teacherBoxes.push(box);
    scene.add(box);
}

function createScreenBox() {
    var videoScreenShareTexture = new THREE.VideoTexture(videoScreenShare);
    var material2 = new THREE.MeshLambertMaterial({
        map: videoScreenShareTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
    });
    var box2 = new THREE.Mesh(new THREE.CubeGeometry(0, heightBoxVideo, widthBoxVideo), material2);
    box2.position.set(-600, heightBoxVideo / 1.8, -widthBoxVideo / 1.9);

    teacherBoxes.push(box2);
    scene.add(box2);
}

function removeTeacherBox() {
    teacherBoxes.forEach((box) => {
        teacherBoxes.pop();
        scene.remove(box);
    });
    teacherBoxes = [];
}

function init(role) {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);

    document.getElementById('toggle-render').addEventListener('click', function() {
        useRift = !useRift;
        onResize();
    });

    document.getElementById('help').addEventListener('click', function() {
        var el = document.getElementById('help-text');
        el.style.display = el.style.display == 'none' ? '' : 'none';
    });

    modelLoader = new THREE.FBXLoader();

    window.addEventListener('resize', onResize, false);
    video = document.getElementById('video');
    videoScreenShare = document.getElementById('videoScreenShare');

    bodyAngle = 3.75;
    bodyAxis = new THREE.Vector3(0, 1, 0);
    bodyPosition = new THREE.Vector3(100, 50, 0);
    velocity = new THREE.Vector3();

    initScene();
    initGeometry();
    initLights();

    if (role === 'PUBLISHER') {
        createTeacherBox();
        createScreenBox();
    }

    oculusBridge = new OculusBridge({
        debug: true,
        onOrientationUpdate: bridgeOrientationUpdated,
        onConfigUpdate: bridgeConfigUpdated,
        onConnect: bridgeConnected,
        onDisconnect: bridgeDisconnected,
    });
    oculusBridge.connect();

    riftCam = new THREE.StereoEffect(renderer);
    riftCam.setEyeSeparation(-1.8);
}

function onResize() {
    if (!useRift) {
        aspectRatio = window.innerWidth / window.innerHeight;

        camera.aspect = aspectRatio;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    } else {
        riftCam.setSize(window.innerWidth, window.innerHeight);
    }
}

function bridgeConnected() {
    document.getElementById('logo').className = '';
}

function bridgeDisconnected() {
    document.getElementById('logo').className = 'offline';
}

function bridgeConfigUpdated(config) {
    console.log('Oculus config updated.');
    //riftCam.setHMD(config);
}

function bridgeOrientationUpdated(quatValues) {
    // Do first-person style controls (like the Tuscany demo) using the rift and keyboard.

    // TODO: Don't instantiate new objects in here, these should be re-used to avoid garbage collection.

    // make a quaternion for the the body angle rotated about the Y axis.
    var quat = new THREE.Quaternion();
    quat.setFromAxisAngle(bodyAxis, bodyAngle);

    // make a quaternion for the current orientation of the Rift
    var quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w);

    // multiply the body rotation by the Rift rotation.
    quat.multiply(quatCam);

    // Make a vector pointing along the Z axis and rotate it accoring to the combined look/body angle.
    var xzVector = new THREE.Vector3(0, 0, 1);
    xzVector.applyQuaternion(quat);

    // Compute the X/Z angle based on the combined look/body angle.  This will be used for FPS style movement controls
    // so you can steer with a combination of the keyboard and by moving your head.
    viewAngle = Math.atan2(xzVector.z, xzVector.x) + Math.PI;

    // Apply the combined look/body angle to the camera.
    camera.quaternion.copy(quat);
}

function onMouseMove(event) {
    mouse.set((event.clientX / window.innerWidth - 0.5) * 2, (event.clientY / window.innerHeight - 0.5) * 2);
}

function onMouseDown(event) {
    // Stub
    floorTexture.needsUpdate = true;
}

function onKeyDown(event) {
    if (event.keyCode == 48) {
        // zero key.
        useRift = !useRift;
        onResize();
    }

    // prevent repeat keystrokes.
    if (!keys[32] && event.keyCode == 32) {
        // Spacebar to jump
        velocity.y += 1.9;
    }

    keys[event.keyCode] = true;
}

function onKeyUp(event) {
    keys[event.keyCode] = false;
}

function updateInput(delta) {
    var step = 50 * delta;
    var turn_speed = (55 * delta * Math.PI) / 180;

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

function animate() {
    var delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    updateInput(delta);
    for (var i = 0; i < core.length; i++) {
        core[i].rotation.x += delta * 0.25;
        core[i].rotation.y -= delta * 0.33;
        core[i].rotation.z += delta * 0.1278;
    }

    var bounds = 600;
    for (var i = 0; i < dataPackets.length; i++) {
        dataPackets[i].obj.position.add(dataPackets[i].speed);
        if (dataPackets[i].obj.position.x < -bounds) {
            dataPackets[i].obj.position.x = bounds;
        } else if (dataPackets[i].obj.position.x > bounds) {
            dataPackets[i].obj.position.x = -bounds;
        }
        if (dataPackets[i].obj.position.z < -bounds) {
            dataPackets[i].obj.position.z = bounds;
        } else if (dataPackets[i].obj.position.z > bounds) {
            dataPackets[i].obj.position.z = -bounds;
        }
    }

    if (render()) {
        requestAnimationFrame(animate);
    }
}

function crashSecurity(e) {
    oculusBridge.disconnect();
    document.getElementById('viewport').style.display = 'none';
    document.getElementById('security_error').style.display = 'block';
}

function crashOther(e) {
    oculusBridge.disconnect();
    document.getElementById('viewport').style.display = 'none';
    document.getElementById('generic_error').style.display = 'block';
    document.getElementById('exception_message').innerHTML = e.message;
}

function render() {
    try {
        if (useRift) {
            riftCam.render(scene, camera);
        } else {
            controls.update();
            renderer.render(scene, camera);
        }
    } catch (e) {
        console.log(e);
        if (e.name == 'SecurityError') {
            crashSecurity(e);
        } else {
            crashOther(e);
        }
        return false;
    }
    return true;
}
