import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import { Defines } from './../../../constants/Defines';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../../../configs/FirebaseConfig';

const SignInPage = ({navigation}) => {
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
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Sign In</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Defines.Colors.TextColorBlack}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Defines.Colors.TextColorBlack}
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />

        <TouchableOpacity 
          onPress={handleSignIn} // Call handleSignIn function
          style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.switchText}>Don't have an account? 
          <Text style={styles.link} onPress={() =>  navigation.navigate('SignUp')}> Sign Up</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Defines.Colors.PrimaryYellow,
  },
  textContainer: {
    backgroundColor: Defines.Colors.TextColorWhite,
    padding: 30,
    borderRadius: 50,
    shadowColor: Defines.Colors.TextColorBlack,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    width: '80%',
  },
  title: {
    fontSize: 30,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: Defines.Colors.TextColorBlack,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontFamily: Defines.Fonts.Regular,
    fontSize: 16,
    color: Defines.Colors.TextColorBlack,
  },
  button: {
    backgroundColor: Defines.Colors.ButtonColor,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
  switchText: {
    textAlign: 'center',
    marginTop: 15,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorBlack,
  },
  link: {
    color: Defines.Colors.ButtonColor,
    fontFamily: Defines.Fonts.Bold,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SignInPage;
