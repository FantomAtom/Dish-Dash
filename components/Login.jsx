import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Defines } from './../constants/Defines';
import DeliveryGif from './../assets/graphics/delivery.gif';

const LoginPage = ({navigation}) => {
  
  return (
    <View style={styles.container}>
      <Image 
        source={DeliveryGif}
        style={styles.image}
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>Delicious Meals Delivered to You!</Text>
        <Text style={styles.subtitle}>Order your favorite food with just a few taps.</Text>

        <TouchableOpacity 
          onPress={() => navigation.navigate('SignIn')}
          style={styles.button}>
          <Text style={styles.buttonText}>Start Ordering</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: Defines.Colors.PrimaryYellow,
  },
  image: {
    width: '100%',
    height: '55%',
    marginBottom: 10,
    marginLeft: 100, //Pushes the image to the right
  },
  textContainer: {
    alignItems: 'center',
    backgroundColor: Defines.Colors.TextColorWhite,
    padding: 30,
    borderRadius: 50,
    shadowColor: Defines.Colors.TextColorBlack, // Shadow color
    shadowOffset: { width: 0, height: 5 }, // X and Y offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 10, // Shadow radius
    elevation: 5, // Elevation for Android
  },
  title: {
    fontSize: 30,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    textAlign: 'center',
    marginBottom: 10,
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorBlack,
    textAlign: 'center',
    marginBottom: 50,
  },
  button: {
    backgroundColor: Defines.Colors.ButtonColor,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
});

export default LoginPage;
