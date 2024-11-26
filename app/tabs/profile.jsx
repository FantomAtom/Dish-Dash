import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput, Button } from 'react-native';
import { Defines } from '../../constants/Defines';
import { auth, db, imageDb } from './../../configs/FirebaseConfig';
import { doc, getDoc, getDocs, updateDoc, deleteDoc, deleteField, collection } from 'firebase/firestore';
import{ ref, uploadBytes, getDownloadURL, deleteObject, getStorage, getMetadata} from 'firebase/storage'
import PlaceholderProfile from './../../assets/graphics/placeholder-profile.jpg';
import * as ImagePicker from 'expo-image-picker'

const ProfilePage = ({navigation}) => {

  const [photo, setPhoto] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    fetchUserDetails();
    requestPermission();
  }, []);

  const fetchUserDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'UserDetails', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserDetails(data);
        setName(data.name);
        setAddress(data.address);
        setPhoneNumber(data.phoneNumber);
        setPhoto(data.profilePicture || PlaceholderProfile); // Set the profile picture
      }
    }
  };  

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to change the profile picture.');
    }
  };

  const handlePhotoSelection = () => {
    if (photo) {
      // If there's a photo, show options to change or remove it
      Alert.alert(
        'Profile Photo',
        'Choose an option',
        [
          { text: 'Change Photo', onPress: () => selectNewPhoto() },
          { text: 'Remove Photo', onPress: () => removePhoto(), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      // If there's no photo, only allow selecting a new one
      Alert.alert(
        'Profile Photo',
        'Choose an option',
        [
          { text: 'Set New Photo', onPress: () => selectNewPhoto() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const selectNewPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri; 
      setPhoto(selectedImageUri); // Set the photo locally
  
      // Upload the selected image to Firebase Storage and save the URL in Firestore
      try {
        const downloadURL = await uploadImageToFirebase(selectedImageUri);
        console.log('Image uploaded successfully. Download URL:', downloadURL);
        
        // Save the download URL in Firestore
        await saveProfilePictureUrl(downloadURL);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Could not upload the image.');
      }
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const user = auth.currentUser; // Get the current user
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated'); // Throw an error if no user is found
    }
  
    try {
      const response = await fetch(uri); // Fetch the file
      const blob = await response.blob(); // Convert file to blob
  
      const storageRef = ref(imageDb, `profilePictures/${user.uid}.jpg`); // Create storage reference
  
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, blob);
  
      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);
  
      return downloadURL; // Return the download URL for later use
    } catch (error) {
      console.error('Error uploading image to Firebase:', error);
      throw error; // Propagate the error
    }
  };
  

  const saveProfilePictureUrl = async (downloadURL) => {
    const user = auth.currentUser;
    if (!downloadURL) {
      console.error('Invalid download URL');
      Alert.alert('Error', 'Failed to retrieve the download URL. Please try again.');
      return;
    }
  
    if (user) {
      try {
        // Save the download URL to Firestore under 'UserDetails'
        await updateDoc(doc(db, 'UserDetails', user.uid), {
          profilePicture: downloadURL, // Update the profile picture field
        });
  
        // Optionally: Fetch updated user details after saving the image
        fetchUserDetails();
  
        Alert.alert('Success', 'Profile picture updated successfully!');
      } catch (error) {
        console.error('Error saving profile picture URL to Firestore:', error);
        Alert.alert('Error', 'Could not save profile picture.');
      }
    }
  };

  const removePhoto = async () => {
    const user = auth.currentUser;
    if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
    }

    try {
        // Delete the profile picture field in Firestore
        await updateDoc(doc(db, 'UserDetails', user.uid), {
            profilePicture: deleteField() // Use deleteField to remove the field
        });

        // Delete the photo from Firebase Storage
        await deleteProfilePictureFromStorage(user.uid); // Call the new function to delete from storage

        // Update the local state to reflect the removed photo
        setPhoto(null); // Set to null or keep it as a default if desired

        Alert.alert('Success', 'Profile picture removed successfully!');
    } catch (error) {
        console.error('Error removing profile picture:', error);
        Alert.alert('Error', 'Could not remove the profile picture.');
    }
};

    // New function to delete the image from Firebase Storage
  const deleteProfilePictureFromStorage = async (filePath) => {
    const storage = getStorage();
  const fileRef = ref(storage, filePath);

  try {
    // Check if file exists
    await getMetadata(fileRef);
    // If metadata is returned, file exists, proceed to delete
    await deleteObject(fileRef);
    console.log("Profile picture deleted successfully.");
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.warn("Profile picture does not exist, skipping deletion.");
    } else {
      console.error("Error deleting profile picture from storage:", error);
    }
  }
  };

  const handleEditDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'UserDetails', user.uid), {
          name,
          address,
          phoneNumber,
        });
        Alert.alert('Success', 'Your details have been updated!');
        fetchUserDetails();
        setModalVisible(false);
      } catch (error) {
        Alert.alert('Error', 'Could not update your details.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
        // Show confirmation alert before deleting the account
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Check if a profile picture exists before trying to delete it
                            if (photo && photo !== PlaceholderProfile) {
                                await deleteProfilePictureFromStorage(user.uid); // Delete the profile picture from storage
                            }
                            
                            // Delete user orders from Firestore
                            const ordersRef = collection(db, 'Orders', user.uid, 'cart');
                            const ordersSnapshot = await getDocs(ordersRef);
                            
                            // Delete each order
                            const deletePromises = ordersSnapshot.docs.map((orderDoc) => deleteDoc(doc(ordersRef, orderDoc.id)));
                            await Promise.all(deletePromises);
                            
                            // Delete user details from Firestore
                            await deleteDoc(doc(db, 'UserDetails', user.uid));
                            
                            // Delete the user account
                            await user.delete();
                            
                            Alert.alert('Success', 'Your account has been deleted.');
                            navigation.navigate('Login');
                        } catch (error) {
                            Alert.alert('Error', 'Could not delete your account.');
                            console.error('Error deleting account:', error);
                        }
                    },
                },
            ]
        );
    }
};
  

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign the user out
      navigation.navigate('Login'); // Navigate to the login screen
      Alert.alert('Success', 'You have logged out successfully.'); // Optional success alert
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileDetailsContainer}>
          <TouchableOpacity onPress={handlePhotoSelection} style={styles.photoContainer}>
          <Image source={typeof photo === 'string' ? { uri: photo } : PlaceholderProfile}  style={styles.photo} 
/>

          </TouchableOpacity>

          <View style={styles.nameAndEmailContainer}>
            <Text style={styles.nameText}>{userDetails.name || 'null'}</Text>
            <Text style={styles.addressAndPhoneText}>{userDetails.address || 'null'}</Text>
            <Text style={styles.addressAndPhoneText}>{userDetails.phoneNumber || 'null'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
          <Text style={styles.actionText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.actionText}>Edit Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => { navigation.navigate('Cart');}}>
          <Text style={styles.actionText}>Order History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
        <Text style={styles.actionText}>Log Out</Text>
        </TouchableOpacity>

      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Details</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            <Button title="Update" onPress={handleEditDetails} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.PrimaryWhite,
    padding: 20,
  },
  profileSection: {
    backgroundColor: Defines.Colors.TextColorWhite,
    padding: 20,
    borderRadius: 15,
    marginBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileDetailsContainer: {
    alignItems: 'center',
  },
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: Defines.Colors.ButtonColor,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  nameAndEmailContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 10,
  },
  addressAndPhoneText: {
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorGray,
    marginBottom: 10,
  },
  actionsSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: Defines.Colors.ButtonColor,
    padding: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  actionText: {
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: Defines.Colors.TextColorWhite,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: Defines.Fonts.Bold,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: Defines.Colors.ButtonColor,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '100%',
  },
});

export default ProfilePage;
