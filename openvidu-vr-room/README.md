# openvidu-vr-room
OpenVidu vr room is a basic app that allows you to live a virtual reality experience simulating a class room with teacher and students.
This app is based on [Instrument company repository](https://github.com/Instrument/oculus-bridge) and it have been developed in JS.

### Requeriments

* An Oculus Rift (We are using DK1)
* The OculusBrige host application: [Windows](https://github.com/Instrument/oculus-bridge/blob/master/app/build/oculus-bridge-windows.zip?raw=true) | [macOS](https://github.com/Instrument/oculus-bridge/blob/master/app/build/oculus-bridge-osx.zip?raw=true)
* A browser that supports websockets

### Basic Usage
* Plug in your Oculus Rift
* Download and launch the OculusBrige host application
* Download **openvidu-vr** repository:
```bash
$ git clone https://github.com/OpenVidu/openvidu-vr.git
$ cd openvidu-vr/openvidu-vr-room
```
* Run the app (we use http-server):
```bash
$ http-server
```

### Instructions

After run ```http-server```, the app shows the previous page and allows you to choose between **teacher** or **student** loggin. Choosing teacher, you will start to emit your webcam and your screen chosen.

![Page 1](https://raw.githubusercontent.com/OpenVidu/openvidu-vr/master/openvidu-vr-room/resources/img/vr-1.png "Page 1")

After that, you will be able to see a virtual reallity environment. Pressing *toggle render mode* button (corner top left), and bearing in mind *OculusBridge host application* we will can use our Oculus Rift.

For each student connected, a 3D character will be introduce inside of our virtual environment. This Animate 3D Character have been created with [Mixamo](https://www.mixamo.com/#/).

![Page 2 and OculusBridge application](https://raw.githubusercontent.com/OpenVidu/openvidu-vr/master/openvidu-vr-room/resources/img/vr-2.png "Page 2 and OculusBridge application")

![Animate 3D Character with Oculus Rift](https://raw.githubusercontent.com/OpenVidu/openvidu-vr/master/openvidu-vr-room/resources/img/3Dcharacter.png "Animate 3D Character with Oculus Rift")

![Using Oculus Rift](https://raw.githubusercontent.com/OpenVidu/openvidu-vr/master/openvidu-vr-room/resources/img/vr-3.JPG "Using Oculus Rift")

### Tested in 

* macOS High Sierra 10.13.6
* Mozilla Firefox 64.0.2 (64 bits)
* Google Chrome 71.0(64 bits)

This app is currently using [THREE.js r100](https://github.com/mrdoob/three.js/releases/tag/r100)
