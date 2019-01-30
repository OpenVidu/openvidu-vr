# openvidu-vr-room
OpenVidu vr room is a basic app that allows you to live a virtual reality experience simulating a class room with teacher a students.
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
$ cd openvidu-vr/openvidu-first-person
```
* Run the app (we use http-server):
```bash
$ http-server
```

### Tested in 

* macOS High Sierra 10.13.6
* Mozilla Firefox 64.0.2 (64 bits)
* Google Chrome 71.0(64 bits)

This app is currently using [THREE.js r83](https://github.com/mrdoob/three.js/releases/tag/r83)
