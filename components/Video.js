import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {MediaStream,RTCView} from 'react-native-webrtc';
import Button from './Button';


function ButtonContainer(props) {
  return (
    <View style={styles.bContainer}>
      <Button Icon="phone" backgroundColor="red" onPress={props.hangup} />
    </View>
  );
}
const Video = (props) => {
  //on call we will just display the local stream
  if (props.localStream && !props.remoteStream) {
    return (
      <View style={styles.Container}>
        <RTCView
          streamURL={props.localStream.toURL()}
          objectFit={'cover'}
          style={styles.video}
        />
        <ButtonContainer hangup={props.hangup} />
      </View>
    );
  }

  //once the call is connected we will display
  //local stream on top of remote stream
  if (props.localStream && props.remoteStream) {
    return (
      <View style={styles.Container}>
        <RTCView
          streamURL={props.remoteStream.toURL()}
          objectFit={'cover'}
          style={styles.video}
        />
        <RTCView
          streamURL={props.localStream.toURL()}
          objectFit={'cover'}
          style={styles.videoLocal}
        />
        <ButtonContainer hangup={props.hangup}  />
      </View>
    );
  }

  return <ButtonContainer hangup={props.hangup} />
};

const styles = StyleSheet.create({
  bContainer: {
    flexDirection: 'row',
    bottom: 30,
    marginTop:'auto'
  },
  Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoLocal:{
      position:'absolute',
      width:100,
      height:150,
      top:0,
      left:20,
      elevation:20
  }
});
export default Video;
