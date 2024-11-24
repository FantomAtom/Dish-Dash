import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { db } from '../../configs/FirebaseConfig';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PlaceOrderPage({ route, navigation }) {
  const { item } = route.params;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState('Delivery'); // Default to Delivery
  const totalPrice = item.price * quantity;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'UserDetails', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setAddress(data.address || '');
          setPhone(data.phoneNumber || '');
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handlePlaceOrder = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    // Validation checks
    if (quantity <= 0) {
      Alert.alert("Error", "Quantity must be at least 1.");
      return;
    }

    if (quantity >= 50) {
      Alert.alert("Error", "Quantity must be below 50.");
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
      const orderData = {
        itemName: item.name,
        itemPrice: item.price,
        quantity,
        totalPrice,
        customerName: name,
        address,
        phone,
        userId: user.uid,
        orderType,
        orderProgress: "Arriving Soon",
        timestamp: new Date(),
      };

      // Create a reference to the user's orders subcollection
      const orderRef = collection(db, 'Orders', user.uid, 'cart');

      // Add order to the user's subcollection
      await setDoc(doc(orderRef), orderData);
      alert('Order placed successfully!');
      navigation.navigate('Cart');
    } catch (error) {
      console.error("Error placing order: ", error);
      Alert.alert("Error", "There was a problem placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemPrice}>Price per item: ₹{item.price}</Text>

      <Text style={styles.label}>Your Name:</Text>
      <Text style={styles.infoText}>{name}</Text>

      <Text style={styles.label}>Address:</Text>
      <Text style={styles.infoText}>{address}</Text>

      <Text style={styles.label}>Phone Number:</Text>
      <Text style={styles.infoText}>{phone}</Text>

      <Text style={styles.label}>Quantity:</Text>
      <TextInput
        style={styles.quantityInput}
        keyboardType="numeric"
        value={String(quantity)}
        onChangeText={(val) => setQuantity(Number(val))}
      />

      <Text style={styles.label}>Order Type:</Text>
      <View style={styles.orderTypeContainer}>
        <TouchableOpacity
          style={[styles.orderTypeButton, orderType === 'Delivery' && styles.selectedOrderType]}
          onPress={() => setOrderType('Delivery')}
        >
          <Text style={styles.orderTypeText}>Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.orderTypeButton, orderType === 'Pickup' && styles.selectedOrderType]}
          onPress={() => setOrderType('Pickup')}
        >
          <Text style={styles.orderTypeText}>Pickup</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalPrice}>Total Price: ₹{totalPrice}</Text>

      <Button title="Place Order" onPress={handlePlaceOrder} disabled={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  orderTypeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  selectedOrderType: {
    backgroundColor: '#f0f0f0',
    borderColor: '#000',
  },
  orderTypeText: {
    fontSize: 16,
  },
});
