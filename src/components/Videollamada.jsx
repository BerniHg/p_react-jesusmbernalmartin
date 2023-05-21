import React, { useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000/");

const Videollamada = ({ currentUser, contactoUsuario, offeringCall, answeringCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const startVideollamada = async () => {
      try {
        const constraints = { audio: true, video: true };
        localStreamRef.current = await navigator.mediaDevices.getUserMedia(constraints);

        if (localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;

          peerConnectionRef.current = createPeerConnection();
          addLocalStreamToPeerConnection();

          peerConnectionRef.current.addEventListener("track", handleRemoteStreamAdded);

          socket.on("offer", handleOffer);
          socket.on("answer", handleAnswer);
          socket.on("candidate", handleCandidate);

          if (offeringCall) {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            socket.emit("offer", { offer });
          }
        } else {
          console.error("No se pudo obtener el stream local.");
        }
      } catch (error) {
        console.error("Error al iniciar la videollamada:", error);
      }
    };

    startVideollamada();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringCall]);

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.addEventListener("icecandidate", handleIceCandidate);
    peerConnection.addEventListener("connectionstatechange", handleConnectionStateChange);

    return peerConnection;
  };

  const addLocalStreamToPeerConnection = () => {
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });
  };

  const handleIceCandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", { candidate: event.candidate });
    }
  };

  const handleConnectionStateChange = () => {
    const connectionState = peerConnectionRef.current.connectionState;

    if (connectionState === "connected") {
      console.log("La videollamada está establecida");
    } else if (connectionState === "disconnected" || connectionState === "failed" || connectionState === "closed") {
      console.log("La videollamada ha finalizado");
    }
  };

  const handleRemoteStreamAdded = (event) => {
    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo) {
      remoteVideo.srcObject = event.streams[0];
    }
  };

  const handleOffer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit("answer", { answer });
    } catch (error) {
      console.error("Error al manejar la oferta:", error);
    }
  };

  const handleAnswer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (error) {
      console.error("Error al manejar la respuesta:", error);
    }
  };

  const handleCandidate = async (data) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error("Error al manejar el candidato:", error);
    }
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline />
      <video ref={remoteVideoRef} autoPlay playsInline />
    </div>
  );
};

export default Videollamada;