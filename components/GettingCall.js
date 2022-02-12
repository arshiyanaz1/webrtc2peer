
import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import Button from './Button';

const GettingCall = (props) => {

  return (
    <View style={styles.container}>
      <Image source={require('../src/img/original.jpeg')} style={styles.image}/>
      <View style={styles.bContainer}>
        <Button Icon="phone" backgroundColor="green" onPress={props.join} style={{marginRight:30}}/>
        <Button Icon="phone" backgroundColor="red" onPress={props.hangup} style={{marginLeft:30}}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height:'100%',
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bContainer:{
      flexDirection:'row',
      bottom:30,
  }
});
export default GettingCall;
