import { useRef, useState } from "react";
import { collection, doc, addDoc, serverTimestamp, updateDoc, getDocs, getDoc } from "firebase/firestore";
import { baseDatos } from "../firebase";
import { ReactComponent as HangUp } from "../img/hangup.svg";
import { ReactComponent as Copy } from "../img/copy.svg";
import { ReactComponent as MoreVertical } from "../img/more-vertical.svg";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com.19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);

const Videollamada = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="app">
      {currentPage === "home" ? (
        <Menu
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          setPage={setCurrentPage}
        />
      ) : (
        <Videos mode={currentPage} callId={joinCode} setPage={setCurrentPage} />
      )}
    </div>
  );
};

function Menu({ joinCode, setJoinCode, setPage }) {
  console.log(baseDatos);
  return (
    <div className="home">
      <div className="create box">
        <button onClick={() => setPage("create")}>Create Call</button>
      </div>

      <div className="answer box">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Join with code"
        />
        <button onClick={() => setPage("join")}>Answer</button>
      </div>
    </div>
  );
}

function Videos({ mode, callId, setPage }) {
  const [webcamActive, setWebCamActive] = useState(false);
  const [roomId, setRoomId] = useState(callId);

  const localRef = useRef();
  const remoteRef = useRef();

  const setupSources = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const remoteStream = new MediaStream();

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.onTrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      localRef.current.srcObject = localStream;
      remoteRef.current.srcObject = remoteStream;

      setWebCamActive(true);

      if (mode === "create") {
        const callDocRef = await addDoc(collection(baseDatos, "calls"), {
          offer: null,
        });

        const callDoc = doc(collection(baseDatos, "calls"), callId);
        const answerCandidates = collection(callDoc, "answerCandidates");
        const offerCandidates = collection(callDoc, "offerCandidates");

        setRoomId(callDocRef.id);

        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            await addDoc(offerCandidates, event.candidate.toJSON());
          }
        };

        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
          timestamp: serverTimestamp(),
        };

        await updateDoc(callDoc, { offer });

        const callDocSnapshot = await getDoc(callDoc);
        const data = callDocSnapshot.data();

        if (data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          await pc.setRemoteDescription(answerDescription);
        }

        const answerCandidatesSnapshot = await getDocs(answerCandidates);
        answerCandidatesSnapshot.forEach((doc) => {
          const data = doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        });
      } else if (mode === "join") {
        const callDoc = doc(baseDatos, "calls", callId);
        const answerCandidates = collection(callDoc, "answerCandidates");
        const offerCandidates = collection(callDoc, "offerCandidates");

        pc.onicecandidate = (event) => {
          event.candidate && answerCandidates.add(event.candidate.toJSON());
        };

        const callData = (await callDoc.get()).data();

        const offerDescription = callData.offer;
        await pc.setRemoteDescription(
          new RTCSessionDescription(offerDescription)
        );

        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };

        await callDoc.update({ answer });

        offerCandidates.onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              let data = change.doc.data();
              pc.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
      }
      pc.onconnectionstatechange = (event) => {
        if (pc.connectionState === "disconnected") {
          hangUp();
        } else if (pc.connectionState === "failed") {
          // Manejar estado de conexión "failed"
        } else if (pc.connectionState === "closed") {
          // Manejar estado de conexión "failed"
        }
      };
    } catch (error) {
      console.error(error);
    }
  };

  const hangUp = async () => {
    try {
      pc.close();

      if (roomId) {
        let roomDef = baseDatos.collection("calls").doc(roomId);
        await roomDef
          .collection("answerCandidates")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              doc.ref.delete();
            });
          });
        await roomDef
          .collection("offerCandidates")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              doc.ref.delete();
            });
          });

        await roomDef.delete();
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="videos">
      <video ref={localRef} autoPlay playsInline className="local" muted />
      <video ref={remoteRef} autoPlay playsInline className="remote" />

      <div className="buttonsContainer">
        <button
          className="hangup button"
          onClick={hangUp}
          disabled={!webcamActive}
        >
          <HangUp />
        </button>
        <div tabIndex={0} role="button" className="more button">
          <MoreVertical />
          <div className="popover">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomId);
              }}
            >
              <Copy /> Copy joining code
            </button>
          </div>
        </div>
      </div>

      {!webcamActive && (
        <div className="modalContainer">
          <div className="modal">
            <h3>Turn on your camera and microphone and start the call</h3>
            <div className="container">
              <button onClick={() => setPage("home")} className="secondary">
                Cancel
              </button>
              <button onClick={setupSources}>Start</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Videollamada;
