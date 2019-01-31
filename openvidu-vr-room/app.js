var OV;
var sessions = [];
var session;

var connections = [];
var userRole;
var mySessionId = 'openvidu-vr';
var SUBSCRIBER = 'SUBSCRIBER';
var PUBLISHER = 'PUBLISHER';

function initApp(role) {
    userRole = role;
    document.getElementById('info').style.display = 'block';
    document.getElementById('join').style.display = 'none';
    joinSession('video').then(() => {
        if (userRole === PUBLISHER) { //TEACHER
            joinSession('videoScreenShare').then(() => {
                init(userRole);
                animate();
                sendConnection({role: PUBLISHER, connectionId: session.connection.connectionId});
            });
        }
    });
}

function joinSession(videoId) {
    OV = new OpenVidu();
    session = OV.initSession();
    
    if((userRole === PUBLISHER && videoId !== 'videoScreenShare') || userRole === SUBSCRIBER){ //TEACHER
        subscribeToConnection();
        subscribeToConnectionDestroyed();
        if(userRole === SUBSCRIBER){
            subscribeToStreamCreated();
        }
    }

    return new Promise((resolve, reject) => {
        getToken().then((token) => {
            session.connect(token).then(() => {
                connections.push({role: userRole, connectionId: session.connection.connectionId});
                if(!session.capabilities.publish) { // STUDENT
                    sendConnection({role: SUBSCRIBER, connectionId: session.connection.connectionId});
                }
                initPublisher(videoId).then(() => resolve()).catch(() => reject());
            })
            .catch((error) => {
                console.log('There was an error connecting to the session:', error.code, error.message);
            });
        });
    });
}

function initPublisher(videoId) {
    return new Promise((resolve, reject) => {
        var data = videoId === 'videoScreenShare' ? { publishAudio: false, videoSource: 'screen' } : { publishAudio: false };
        if (userRole === PUBLISHER) {
            OV.initPublisherAsync(videoId, data).then((publisher) => {
                var video = document.getElementById(videoId);
                video.srcObject = publisher.stream.mediaStream;
                session.publish(publisher);
                sessions.push(session);
                resolve();
            }).catch((error) => {
                console.log(error);
                reject();
            });
        } else {
            init(userRole);
            animate();
            resolve();
        }
    });
}

function sendConnection(data, connectionId) {
    var toArray = connectionId ? [connectionId] : null;
    var signalOptions = {
      data: JSON.stringify(data),
      to: toArray,
      type: 'connected',
    };
    session.signal(signalOptions);
}

function subscribeToConnection(){
    session.on('signal:connected', function(event) {
        var exist = connections.filter((c) => c.connectionId === event.from.connectionId)[0];
        if(!exist){
            var connection = JSON.parse(event.data);
            if(connection.role === SUBSCRIBER){
                createStudentBox();
            }
            connections.push(connection);
            sendConnection({role: userRole, connectionId: session.connection.connectionId});
        }
        console.log("CONNECTIONS ARRAY", connections);
    });
}

function subscribeToStreamCreated(){
    session.on('streamCreated', function(event) {
        session.subscribe(event.stream, 'subscriber');
        setTimeout(() => {
            var videoId = event.stream.typeOfVideo === 'SCREEN' ? 'videoScreenShare' : 'video'
            connections.push({role: PUBLISHER, connectionId: event.stream.connection.connectionId});
            var video = document.getElementById(videoId);
            video.srcObject = event.stream.mediaStream;
            console.log(videoId);
            if(videoId === 'video'){
                createTeacherBox();
            }else {
                createScreenBox();
            }
        }, 2000);
    });
}

function subscribeToConnectionDestroyed() {
    this.session.on('connectionDestroyed', (event) => {
      var connection =  connections.filter((c) => c.connectionId === event.connection.connectionId)[0];
      if(connection){
        for(var i = 0; i < connections.length; i++){
            if(connections[i].connectionId === event.connection.connectionId){
                if(connections[i].role === PUBLISHER){
                    removeTeacherBox();
                }else{
                    removeStudentBox();
                }
                connections.splice(i,1);
            }
        }
      }
      console.log("CONNECTIONS ARRAY", connections);
    });
  }

function leaveSession() {
    sessions.forEach((session) => session.disconnect());
    var viewport = document.getElementById('viewport');
    viewport.removeChild(viewport.firstChild);
    document.getElementById('join').style.display = 'block';
    document.getElementById('info').style.display = 'none';
}

window.onbeforeunload = function() {
    if (session) session.disconnect();
};

/**
 * --------------------------
 * SERVER-SIDE RESPONSIBILITY
 * --------------------------
 * These methods retrieve the mandatory user token from OpenVidu Server.
 * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
 * the API REST, openvidu-java-client or openvidu-node-client):
 *   1) Initialize a session in OpenVidu Server	(POST /api/sessions)
 *   2) Generate a token in OpenVidu Server		(POST /api/tokens)
 *   3) The token must be consumed in Session.connect() method
 */

var OPENVIDU_SERVER_URL = 'https://demos.openvidu.io:4443';
var OPENVIDU_SERVER_SECRET = 'MY_SECRET';

function getToken() {
    return createSession(mySessionId, userRole).then((sessionId) => createToken(sessionId));
}

function createSession(sessionId) {
    // See https://openvidu.io/docs/reference-docs/REST-API/#post-apisessions
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: OPENVIDU_SERVER_URL + '/api/sessions',
            data: JSON.stringify({ customSessionId: sessionId, role: userRole }),
            headers: {
                Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                'Content-Type': 'application/json',
            },
            success: (response) => resolve(response.id),
            error: (error) => {
                if (error.status === 409) {
                    resolve(sessionId);
                } else {
                    console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + OPENVIDU_SERVER_URL);
                    if (
                        window.confirm(
                            'No connection to OpenVidu Server. This may be a certificate error at "' +
                                OPENVIDU_SERVER_URL +
                                '"\n\nClick OK to navigate and accept it. ' +
                                'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
                                OPENVIDU_SERVER_URL +
                                '"',
                        )
                    ) {
                        location.assign(OPENVIDU_SERVER_URL + '/accept-certificate');
                    }
                }
            },
        });
    });
}

function createToken(sessionId) {
    // See https://openvidu.io/docs/reference-docs/REST-API/#post-apitokens
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: OPENVIDU_SERVER_URL + '/api/tokens',
            data: JSON.stringify({ session: sessionId, role: userRole }),
            headers: {
                Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                'Content-Type': 'application/json',
            },
            success: (response) => resolve(response.token),
            error: (error) => reject(error),
        });
    });
}

/*window.onload = function() {
    joinSession('PUBLISHER');
};*/
