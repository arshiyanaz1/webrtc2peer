
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RTCPeerConnection, MediaStream, RTCIceCandidate, EventOnAddStream } from 'react-native-webrtc';
import utils from './Utils';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import Button from './components/Button';
import GettingCall from './components/GettingCall';
import Video from './components/Video';


const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
const App = () => {
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [gettingCall, setGettingCall] = useState(false);
  const pc = useRef();
  const connecting = useRef(false);

  useEffect(() => {
      const cRef = firestore().collection('meet').doc('chatId');
      const subscribe = cRef.onSnapshot(snapshot => {
        const data = snapshot.data();
  
        //on answer start the call
  
        if (pc.current && !pc.current.remoteDescription && data && data.answer) {
          pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
  
        //if there is offer for chatID set the getting call flag
        if (data && data.offer && !connecting.current) {
          setGettingCall(true)
        }
      });
  
      //on DELETE of collection call hangup
      //the other side has clicked on hangup
      const subscribeDelete = cRef.collection('callee').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type == 'removed') {
            hangup();
          }
        });
      });
      return () => {
        subscribe();
        subscribeDelete();
      }
  }, [])

  const setupWebrtc = async () => {
    pc.current = new RTCPeerConnection(configuration);
    //Get the video and audio stream for the call
    const stream = await utils.getStream();
    if (stream) {
      setLocalStream(stream);
      pc.current.addStream(stream);
    }

    //Get the remote stream once it is available
    pc.current.onaddstream = (event) => {
      setRemoteStream(event.stream)
    };
  }
  const create = async () => {
    connecting.current = true;
    await setupWebrtc();

    const cRef = firestore().collection('meet').doc('chatId');
    collectIceCandidates(cRef, "caller", "callee");
    if (pc.current) {
      const offer = await pc.current.createOffer();
      pc.current.setLocalDescription(offer);

      const cWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      };

      cRef.set(cWithOffer);
    }

  }

  const join = async () => {
    connecting.current = true;
    setGettingCall(false);

    const cRef = firestore().collection('meet').doc('chatId');
    const offer = (await cRef.get()).data()?.offer;
    if (offer) {       

      //setup webrtc
      await setupWebrtc();

      collectIceCandidates(cRef, "callee", "caller");
      if (pc.current) {
        pc.current.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.current.createAnswer();
        pc.current.setLocalDescription(answer);
        console.log('answer',answer)
        const cWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp
          },
        };
        cRef.update(cWithAnswer);
      }
    }
  }
  const hangup = async () => {
    console.log('hang up');
    setGettingCall(false);
    connecting.current = false;
    streamCleanUp();
    fireStoreCleanUp();
    if (pc.current) {
      pc.current.close();
    }
  }


  //Helper function
  const streamCleanUp = async () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      localStream.release();
    }
    setLocalStream(null);
    setRemoteStream(null);
  }
  const fireStoreCleanUp = async () => {
    const cRef = firestore().collection('meet').doc('chatId');
    if (cRef) {
      const calleeCandidate = await cRef.collection('callee').get();
      calleeCandidate.forEach(async (candidate) => {
        await candidate.ref.delete();
      })
      const callerCandidate = await cRef.collection('caller').get();
      callerCandidate.forEach(async (candidate) => {
        await candidate.ref.delete();
      })
      cRef.delete();
    }
  }
  const collectIceCandidates = async (cRef, localName, remoteName) => {
    const candidateCollection = cRef.collection(localName);
    if (pc.current) {
      //on new ICE candidates add it to firestore
      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          candidateCollection.add(event.candidate);
        }
      };

    }

    //get the ICE candidate added to firestore and update the local PC
    cRef.collection(remoteName).onSnapshot(snapshot => {
      snapshot.docChanges().forEach((change) => {
        if (change.type == 'added') {
          const candidate = new RTCIceCandidate(change.doc.data())
           pc.current?.addIceCandidate(candidate);
        }
      })
    })      
  }

  //displays the getting call component
  if (gettingCall) {
    return <GettingCall hangup={hangup} join={join} />
  }

  //Displays local stream on calling
  //Displays both local and remote stream once call is connected
  if (localStream) {
    return <Video hangup={hangup} localStream={localStream} remoteStream={remoteStream} />
  }

  return (
    <View style={styles.container}><Button Icon="video" backgroundColor="gray" onPress={create} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
