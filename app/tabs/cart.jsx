import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { db } from '../../configs/FirebaseConfig';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Defines } from './../../constants/Defines'; // Adjust the import path as needed


export default function CartPage({ navigation }) {
  const [orders, setOrders] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      alert("Please log in to view your cart.");
      return;
    }

    // Subscribe to the user's orders subcollection
    const ordersRef = collection(db, 'Orders', user.uid, 'cart');
    
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [user]);

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 'Arriving Soon':
        return styles.arrivingSoon; // Define the style in styles
      case 'Delivered':
        return styles.delivered; // Define the style in styles
      case 'Cancelled':
        return styles.cancelled; // Define the style in styles
      default:
        return styles.defaultStatus; // Optional default style
    }
  };

  const cancelOrder = async (orderId) => {
    const orderRef = doc(db, 'Orders', user.uid, 'cart', orderId); // Reference to the specific order

    try {
      await deleteDoc(orderRef); // Delete the order document
      Alert.alert("Success", "Order has been cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling order: ", error);
      Alert.alert("Error", "There was a problem cancelling your order. Please try again.");
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderDetails}>
        <Text style={styles.orderTitle}>{item.itemName}</Text>
        <Text style={{ fontFamily: Defines.Fonts.Regular }}>Quantity: {item.quantity}</Text>
        <Text style={{ fontFamily: Defines.Fonts.Regular }}>Total Price: ₹{item.totalPrice}</Text>
        <Text style={{ fontFamily: Defines.Fonts.Regular }}>Customer Name: {item.customerName}</Text>
        <Text style={{ fontFamily: Defines.Fonts.Regular }}>Address: {item.address}</Text>
        <Text style={{ fontFamily: Defines.Fonts.Regular }}>Phone: {item.phone}</Text>
      </View>
      <View style={[styles.orderStatusContainer, getOrderStatusStyle(item.orderProgress)]}>
        <Text style={styles.orderStatus}>{item.orderProgress}</Text>
      </View>
      <TouchableOpacity
        onPress={() => cancelOrder(item.id)} // Call the cancelOrder function on press
        style={styles.cancelButton}
      >
        <Text style={styles.cancelButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.startOrderingButton}
            onPress={() => navigation.navigate('Menu')} // Adjust navigation as necessary
          >
            <Text style={styles.buttonText}>Start Ordering</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.PrimaryYellow,
  },
  flatList: {
    backgroundColor: Defines.Colors.PrimaryYellow,
    padding: 20,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Defines.Colors.TextColorWhite,
    borderRadius: 10,
    marginBottom: 10,
  },
  orderDetails: {
    flex: 1, // Allows the order details to take up available space
  },
  orderTitle: {
    fontSize: 20,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
  },
  orderStatusContainer: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderStatus: {
    fontSize: 16,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    marginBottom: 20,
    color: Defines.Colors.TextColorBlack,
    fontFamily: Defines.Fonts.Regular,
  },
  startOrderingButton: {
    backgroundColor: Defines.Colors.ButtonColor,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
  arrivingSoon: {
    borderColor: Defines.Colors.ButtonColor,
    borderWidth: 2,
    backgroundColor: Defines.Colors.ArrivingSoon, 
  },
  delivered: {
    borderColor: Defines.Colors.ButtonColor,
    borderWidth: 2,
    backgroundColor: Defines.Colors.Delivered,
  },
  cancelled: {
    borderColor: Defines.Colors.ButtonColor,
    borderWidth: 2,
    backgroundColor: Defines.Colors.Cancelled
  },
  cancelButton: {
    position: 'absolute', // Absolute positioning for the cancel button
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15, // To make it circular
    borderWidth:2,
    borderColor:Defines.Colors.ButtonColor,
    backgroundColor: Defines.Colors.Cancelled, // Background color for the cancel button
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Defines.Colors.TextColorBlack,
    fontWeight: Defines.Fonts.Bold,
    fontSize: 16, // Adjust font size as necessary
  },
});
