# OpenVidu Virtual Reality

OpenVidu team has started to inlcude **openvidu** in the world of virtual reality.


The technologies used to develop these applications will be **WebGL**, **Three.js** and **JavaScript**.

### WebGL

WebGL is a cross-platform, royalty-free API used to create 3D graphics in a Web browser. Based on OpenGL ES 2.0, WebGL uses the OpenGL shading language, GLSL, and offers the familiarity of the standard OpenGL API. Because it runs in the HTML5 Canvas element, WebGL has full integration with all Document Object Model (DOM) interfaces.

### [Three.js](https://threejs.org/)

Three.js is a cross-browser JavaScript library and Application Programming Interface (API) used to create and display animated 3D computer graphics in a web browser. Three.js uses WebGL. The source code is hosted in a repository on [GitHub](https://github.com/mrdoob/three.js/).

Our applications examples are based on [Three.js examples](https://threejs.org/examples/) and we have inlcuded **openvidu**.

First of all, to get an 3D object, we have to take account a few steps:

1) **Create a scene**: To actually be able to display anything with three.js, we need three things: scene, camera and renderer, so that we can render the scene with camera.

```javascript
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(1000, 50, 1500);

    renderer = new THREE.WebGLRenderer({ antialias: true });

    var light = new THREE.DirectionalLight(0xdfebff, 1);
    scene.add(light);

 ```

 Besides, we can add some extra things to create a complete example: These things could be  light and object texture.

 ```javascript
    // light
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

    // object texture
    var video = document.getElementById('video');
    var videoTexture = new THREE.VideoTexture(video);    
    var clothMaterial = new THREE.MeshLambertMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
    });
    // object geometry
    clothGeometry = new THREE.ParametricBufferGeometry(clothFunction, cloth.w, cloth.h);
    object = new THREE.Mesh(clothGeometry, clothMaterial);
    object.position.set(0, 0, 0);
    object.castShadow = true;
    scene.add(object);
 ```


2) **Rendering the scene**: This will create a loop that causes the renderer to draw the scene every time the screen is refreshed (on a typical screen this means 60 times per second). 

```javascript
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

```

3) **Animate the object**: This will be run every frame (normally 60 times per second). Basically, anything you want to move or change while the app is running has to go through the animate loop. You can of course call other functions from there, so that you don't end up with a animate function that's hundreds of lines.


Finally, OpenVidu comes on stage. We start from [openvidu-hello-world tutorial](https://github.com/OpenVidu/openvidu-tutorials/tree/master/openvidu-hello-world), we initialize a publisher and we use the *ov-video* generated to assign that video like our object texture (*step 1.2*). This is how we integrate openvidu with a virtual reality environment.
