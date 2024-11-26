import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, ImageBackground } from 'react-native';
import { Defines } from './../../../constants/Defines';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../../../configs/FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './../../../configs/FirebaseConfig';

const SignUpPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !name || !rePassword || !address) {
      ToastAndroid.show('Please fill in all fields.', ToastAndroid.SHORT);
      return;
    }

    // Check if passwords match
    if (password !== rePassword) {
      ToastAndroid.show('Passwords do not match.', ToastAndroid.SHORT);
      return;
    }

    // Validate phone number format (example: only digits, and length between 10-15)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      ToastAndroid.show('Please enter a valid phone number.', ToastAndroid.SHORT);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'UserDetails', user.uid), {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
      });
      console.log('Signed up:', user);
      navigation.navigate('MainHome');
    } catch (err) {
      setError(err.message);
      console.log(err.message);
    }
  };

  return (
    <ImageBackground
      source={require('./../../../assets/graphics/BACKGROUND.jpg')} // Replace with your image path
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={phoneNumber}
          onChangeText={(text) => {
            // Only allow digits in phone number input
            const formattedText = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            setPhoneNumber(formattedText);
          }}
          keyboardType="phone-pad" // Show numeric keyboard
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Re-enter Password"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          secureTextEntry
          value={rePassword}
          onChangeText={setRePassword}
        />

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('SignIn')}>
            Sign In
          </Text>
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
  link: {
    color: Defines.Colors.ButtonColor,
    fontFamily: Defines.Fonts.Regular,
  },
});

export default SignUpPage;
