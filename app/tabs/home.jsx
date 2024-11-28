  import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Image, Button } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  import { Defines } from '../../constants/Defines';
  import React, { useState, useEffect } from 'react';
  import { db } from './../../configs/FirebaseConfig';
  import { collection, onSnapshot } from 'firebase/firestore';

  const HomePage = () => {
    const navigation = useNavigation();
    
    // State for categories and offers
    const [categories, setCategories] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Categories
    useEffect(() => {
      const unsubscribe = onSnapshot(collection(db, 'FoodItems'), (snapshot) => {
        const foodItems = snapshot.docs.map((doc) => {
          const foodData = doc.data();
          return {
            id: doc.id,
            category: foodData.category //gets the category field from the documents
          };
        });

        // Group items by category
        const groupedCategories = foodItems.reduce((acc, currentItem) => {
          const { category } = currentItem;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(currentItem);
          return acc;
        }, {});

        // Convert to an array and sort categories alphabetically
      const categoryArray = Object.keys(groupedCategories).map((category) => ({
        category,
        items: groupedCategories[category],
      })).sort((a, b) => a.category.localeCompare(b.category)); // Sort alphabetically

        setCategories(categoryArray);
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);

    // Fetch Ongoing Offers
    useEffect(() => {
      const unsubscribe = onSnapshot(collection(db, 'OnGoingOffers'), (snapshot) => {
        const offersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          imageRef: doc.data().imageRef,
        }));
        
        setOffers(offersData);
      });

      return () => unsubscribe();
    }, []);

    const renderCategory = ({ item, index }) => (
      <TouchableOpacity
        key={item.id} // Ensure each category has a unique key
        style={styles.categoryButton}
        onPress={() => {
          navigation.navigate('Menu', {
            id: item.id,
            index: index, // Pass the index of the category
          });
        }}
      >
        <Text style={styles.categoryText}>{item.category}</Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={require('../../assets/graphics/ai-generated-food.jpg')} 
              style={styles.image} 
            />
          </View>

          {/* Order Type Section */}
          <View style={styles.orderTypeSection}>
            <Text style={styles.title}>Delicious Meals Delivered to You!</Text>
            <Text style={styles.subtitle}>Order your favorite food with just a few taps.</Text>
          </View>

          {/* Categories Section */}
          <View style={styles.categoriesSection}>
            <Text style={styles.categoryTitle}>Browse Categories</Text>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id || item.category}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
            />
          </View>

          {/* Ongoing Offers Section */}
          <View style={styles.offersSection}>
            <Text style={styles.offerTitle}>Ongoing Offers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {offers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <Image source={{ uri: offer.imageRef }} style={styles.offerImage} />
            </View>))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Defines.Colors.PrimaryYellow,
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    imageContainer: {
      backgroundColor: Defines.Colors.TextColorWhite,
      padding: 10,
      borderRadius: 20,
      alignSelf: 'center',
      marginBottom: 40,
      marginTop: 40,
      shadowColor: Defines.Colors.TextColorBlack,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    },
    image: {
      width: 400,
      height: 400,
      borderRadius: 20,
    },
    orderTypeSection: {
      backgroundColor: Defines.Colors.TextColorWhite,
      padding: 30,
    },
    categoriesSection: {
      backgroundColor: Defines.Colors.PrimaryYellow,
      padding: 30,
    },
    offersSection: {
      backgroundColor: Defines.Colors.TextColorWhite,
      padding: 30,
    },
    title: {
      fontSize: 30,
      fontFamily: Defines.Fonts.Bold,
      color: Defines.Colors.TextColorBlack,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 20,
      fontFamily: Defines.Fonts.Regular,
      color: Defines.Colors.TextColorBlack,
      textAlign: 'center',
      marginBottom: 15,
    },
    categoryTitle: {
      fontSize: 24,
      fontFamily: Defines.Fonts.Bold,
      color: Defines.Colors.TextColorBlack,
      textAlign: 'center',
      marginVertical: 15,
    },
    categoryList: {
      marginBottom: 20,
    },
    categoryButton: {
      backgroundColor: Defines.Colors.ButtonColor,
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 5,
    },
    categoryText: {
      fontSize: 18,
      fontFamily: Defines.Fonts.Bold,
      color: Defines.Colors.TextColorWhite,
    },
    offerTitle: {
      fontSize: 24,
      fontFamily: Defines.Fonts.Bold,
      color: Defines.Colors.TextColorBlack,
      textAlign: 'center',
      marginVertical: 15,
    },
    offerCard: {
      backgroundColor: Defines.Colors.ButtonColor,
      padding: 10,
      borderRadius: 20,
      marginHorizontal: 10,
      alignItems: 'center',
    },
    offerImage: {
      width: 300,
      height: 300,
      borderRadius: 15,
      resizeMode: 'cover',
    },
  });

  export default HomePage;
