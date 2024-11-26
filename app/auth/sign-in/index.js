import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, ImageBackground } from 'react-native';
import { Defines } from './../../../constants/Defines';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../../../configs/FirebaseConfig';

const SignInPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      ToastAndroid.show('Please fill in all fields.', ToastAndroid.SHORT);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Signed in:', user);
      navigation.navigate('MainHome'); // Navigate to the home page after successful sign in
    } catch (error) {
      const errorMessage = error.message;
      console.log(errorMessage);
      setError(errorMessage); // Set the error message to display
    }
  };

  return (
    <ImageBackground
      source={require('./../../../assets/graphics/BACKGROUND.jpg')} // Replace with your image path
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sign In</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />

        <TouchableOpacity onPress={handleSignIn} style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
            Sign Up
          </Text>
        </Text>

        <Text style={styles.terms}>
          By signing in, you agree to our{' '}
          <Text style={styles.link}>Terms & Conditions</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Defines.Colors.Black,
  },
  container: {
    width: '85%',
    padding: 20,
    backgroundColor: Defines.Colors.White,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorBlack,
  },
  button: {
    backgroundColor: Defines.Colors.ButtonColor,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Defines.Colors.TextColorWhite,
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
  },
  errorText: {
    color: Defines.Colors.Red,
    marginTop: 10,
    textAlign: 'center',
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: Defines.Colors.TextColorBlack,
    fontFamily: Defines.Fonts.Regular,
    textAlign: 'center',
  },
  terms: {
    marginTop: 10,
    fontSize: 12,
    color: Defines.Colors.PlaceHolderTextColor,
    textAlign: 'center',
    fontFamily: Defines.Fonts.Regular,
  },
  link: {
    color: Defines.Colors.ButtonColor,
    fontFamily: Defines.Fonts.Regular,
  },
});

export default SignInPage;
