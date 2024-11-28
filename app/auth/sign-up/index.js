import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import { Defines } from './../../../constants/Defines';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../../../configs/FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './../../../configs/FirebaseConfig';

const SignUpPage = ({navigation}) => {

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
      navigation.navigate("MainHome")
    } catch (err) {
      setError(err.message);
      console.log(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Sign Up</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={Defines.Colors.TextColorBlack}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Defines.Colors.TextColorBlack}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor={Defines.Colors.TextColorBlack}
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor={Defines.Colors.TextColorBlack}
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
          placeholderTextColor={Defines.Colors.TextColorBlack}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Re-enter Password"
          placeholderTextColor={Defines.Colors.TextColorBlack}
          secureTextEntry
          value={rePassword}
          onChangeText={setRePassword}
        />

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.switchText}>
          Already have an account? 
          <Text style={styles.link} onPress={() => navigation.navigate('SignIn')}> Sign In</Text>
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
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default SignUpPage;
