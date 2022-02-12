
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const Button = (props) => {
    return (
        <View>
            <TouchableOpacity onPress={props.onPress} style={[{ backgroundColor: props.backgroundColor }, props.style, styles.button]}>
                <Icon name={props.Icon} color="white" size={20} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 60,
        height: 60,
        padding: 10,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
    },
});   
export default Button;
