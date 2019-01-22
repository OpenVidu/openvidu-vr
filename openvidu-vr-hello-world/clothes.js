/* testing cloth simulation */

var container;
var camera, scene, renderer;
var clothGeometry;

var object;
var video;

function init() {
    video = document.getElementById('video');
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcce0ff);
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);
    // camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(1000, 50, 1500);
    // lights
    scene.add(new THREE.AmbientLight(0x666666));
    var light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    var d = 300;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;
    scene.add(light);
    // cloth material Video texture
    var videoTexture = new THREE.VideoTexture(video);    
    var loader = new THREE.TextureLoader();
    var clothMaterial = new THREE.MeshLambertMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
    });
    // cloth geometry
    clothGeometry = new THREE.ParametricBufferGeometry(clothFunction, cloth.w, cloth.h);
    // cloth mesh
    object = new THREE.Mesh(clothGeometry, clothMaterial);
    object.position.set(0, 0, 0);
    object.castShadow = true;
    scene.add(object);
    object.customDepthMaterial = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: videoTexture,
        alphaTest: 0.5,
    });

    // ground
    var groundTexture = loader.load('resources/textures/grasslight-big.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(25, 25);
    groundTexture.anisotropy = 16;
    var groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture });
    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
    mesh.position.y = -250;
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);
    // poles
    var poleGeo = new THREE.BoxBufferGeometry(5, 375, 5);
    var poleMat = new THREE.MeshLambertMaterial();
    var mesh = new THREE.Mesh(poleGeo, poleMat);
    mesh.position.x = -125;
    mesh.position.y = -62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    var mesh = new THREE.Mesh(poleGeo, poleMat);
    mesh.position.x = 125;
    mesh.position.y = -62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    var mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(255, 5, 5), poleMat);
    mesh.position.y = -250 + 750 / 2;
    mesh.position.x = 0;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    var gg = new THREE.BoxBufferGeometry(10, 10, 10);
    var mesh = new THREE.Mesh(gg, poleMat);
    mesh.position.y = -250;
    mesh.position.x = 125;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    var mesh = new THREE.Mesh(gg, poleMat);
    mesh.position.y = -250;
    mesh.position.x = -125;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    // controls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1000;
    controls.maxDistance = 5000;
    //
    window.addEventListener('resize', onWindowResize, false);

}
//
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
//
function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    var p = cloth.particles;
    for (var i = 0, il = p.length; i < il; i++) {
        var v = p[i].position;
        clothGeometry.attributes.position.setXYZ(i, v.x, v.y, v.z);
    }
    clothGeometry.attributes.position.needsUpdate = true;
    clothGeometry.computeVertexNormals();
    //sphere.position.copy(ballPosition);
    renderer.render(scene, camera);
}
