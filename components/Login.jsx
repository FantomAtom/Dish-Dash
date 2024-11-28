import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { Defines } from './../constants/Defines';

import FoodImage from './../assets/graphics/login-food-image.png';
import BackgroundImage from './../assets/graphics/BACKGROUND.jpg';

const LoginPage = ({ navigation }) => {
  return (
    <ImageBackground 
      source={BackgroundImage} 
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image 
            source={FoodImage} 
            style={styles.image} 
          />
        </View>

        <Text style={styles.subtitle}>
          Food and grocery delivery from restaurants and stores!
        </Text>

        <TouchableOpacity 
          onPress={() => navigation.navigate('SignIn')} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>START USING</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'center', // Ensures the image covers the whole screen
    padding:10,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 20,
  },
  imageWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 200,
    padding: 20,
    elevation: 5, // Shadow for Android
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 100, // Circular image
  },
  subtitle: {
    color: Defines.Colors.TextColorWhite,
    fontSize: 30,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: Defines.Fonts.Regular,
  },
  button: {
    backgroundColor: Defines.Colors.ButtonColor,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: Defines.Fonts.Bold,
  },
});

export default LoginPage;
