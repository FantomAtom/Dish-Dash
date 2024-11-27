import React, { useState, useEffect, useRef } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,FlatList,ScrollView,Image,TextInput,ActivityIndicator,} from 'react-native';
import Swiper from 'react-native-swiper'; // For swiping between offers
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './../../configs/FirebaseConfig'; // Firebase config
import { Defines } from '../../constants/Defines';

import { AntDesign } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';
import PlaceholderProfile from './../../assets/graphics/placeholder-profile.jpg';

const HomePage = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null); // Reference for scrolling
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'FoodItems'), (snapshot) => {
      const foodItems = snapshot.docs.map((doc) => {
        const foodData = doc.data();
        return {
          id: doc.id,
          name: foodData.name,
          image: foodData.imageRef || 'https://via.placeholder.com/150',
          price: foodData.price,
          category: foodData.category,
        };
      });

      const groupedCategories = foodItems.reduce((acc, currentItem) => {
        const { category } = currentItem;
        if (!acc[category]) acc[category] = [];
        acc[category].push(currentItem);
        return acc;
      }, {});

      const categoryArray = Object.keys(groupedCategories)
        .map((category) => ({
          category,
          items: groupedCategories[category],
        }))
        .sort((a, b) => a.category.localeCompare(b.category));

      setCategories(categoryArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'OnGoingOffers'), (snapshot) => {
      const offersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        imageRef: doc.data().imageRef
      }));
      setOffers(offersData);
    });

    return () => unsubscribe();
  }, []);

  const scrollToCategory = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * 250, // Adjust scrolling distance based on content height
        animated: true,
      });
    }
  };

  const renderCategory = ({ item, index }) => (
    <TouchableOpacity
      style={styles.categoryButton}
      onPress={() => scrollToCategory(index)}
    >
      <View style={styles.categoryBox}>
        {/*ADD FOOD ICON/IMAGE*/}
      </View>
      <Text style={styles.categoryText}>{item.category}</Text>
    </TouchableOpacity>
  );

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItemContainer}>
      {/* Left: Food Image */}
      <Image source={{ uri: item.image }} style={styles.foodImageLeft} />
  
      {/* Right: Details */}
      <View style={styles.foodDetails}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDescription}>
          {/* Example Description */}
          {item.description || 'Delicious and flavorful food made just for you!'}
        </Text>
        <Text style={styles.foodPrice}>{'₹' + item.price}</Text>
  
        {/* Order Button */}
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => navigation.navigate('PlaceOrder', { item })}
        >
          <Text style={styles.orderButtonText}>Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  
  const renderFoodCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.category}</Text>
      <FlatList
        data={item.items}
        renderItem={renderFoodItem}
        keyExtractor={(food) => food.id}
        showsVerticalScrollIndicator={false}
        style={styles.foodList}
      />
    </View>
  );  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Defines.Colors.TextColorBlack} />
      </View>
    );
  }

  return (
    <View>
        {/*HEADER CONTAINER*/}
        <View style={styles.detailsContainer}>

          <View style={styles.header}>
          <EvilIcons name="location" size={30} color="white" />
            <Text style={styles.locationText}>Ambagarathur, Karaikal-609601</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image source={PlaceholderProfile} style={styles.profileImage} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
          <AntDesign name="search1" size={24} color={Defines.Colors.Black} style={styles.searchIcon} />
            <TextInput
              placeholder="Search Bubble tea"
              style={styles.searchInput}
              placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
            />
          </View>
        </View>

      {/*MAIN CONTENT*/}
      <ScrollView contentContainerStyle={styles.scrollContent} ref={scrollViewRef}>

        <View style={styles.container}>

        <View style={styles.swiperContainer}>
          <Swiper
            style={styles.swiper}
            autoplay
            showsButtons={false}
            dotColor="#FFF"
            activeDotColor="#000"
          >
            {offers.map((offer) => (
              <View key={offer.id} style={styles.swiperSlideContainer}>
              <Image
                key={offer.id}
                source={{ uri: offer.imageRef }}
                style={styles.offerImage}
              />
            </View>
            ))}
          </Swiper>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>What do you like to eat now?</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.category}
            style={styles.categoriesList}
          />
        </View>

        <View style={styles.categoriesSection}>
          {categories.map((category, index) => (
            <View key={category.category}>{renderFoodCategory({ item: category })}</View>
          ))}
        </View>
    </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer:{
    backgroundColor: Defines.Colors.Black,
    marginBottom:20,
    padding:30,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 25,
  },
  locationText: {
    fontSize: 15,
    color: Defines.Colors.TextColorWhite,
    fontFamily: Defines.Fonts.Light,
    textAlign: 'left',
    flex: 1,
    marginTop:8,
  },
  searchBar: {
    flexDirection: 'row', // Aligns items horizontally
    alignItems: 'center', // Vertically centers items
    backgroundColor: '#EEE', 
    borderRadius: 10,
    paddingHorizontal: 10, 
    paddingVertical: 5,
    marginVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1, // Makes the input take the remaining space
    fontSize: 16, // Adjust text size
    color: Defines.Colors.PlaceHolderTextColor,
    paddingTop:20
  },

  /*BELOW CONTENT*/
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.PrimaryWhite,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 250
  },
  swiperContainer: {
    borderRadius: 15, // Apply rounded corners to the container
    overflow: 'hidden', // Ensures the content is clipped to the border radius
    marginBottom: 20, // Optional: Adds spacing around the swiper
    elevation:10,
  },
  swiper: {
    height: 200, // Adjust the height of the swiper if needed
  },
  swiperSlideContainer: {
    flex: 1,
    borderRadius: 15, // Apply the same border radius to each swiper slide
    overflow: 'hidden', // Ensure the slide content is clipped
  },
  offerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Defines.Fonts.Bold,
    marginBottom: 10,
    marginTop: 20,
  },
  categoriesSection: {
    marginBottom:20,
  },
  categoriesList: {
    flexDirection: 'row',
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 15,
  },
  categoryBox: {
    backgroundColor: Defines.Colors.White,
    borderRadius: 20,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation:5,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorBlack,
  },

  /*FOOD SECTION*/
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 25,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 10,
  },

  foodItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  
  foodImageLeft: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  
  foodDetails: {
    flex: 1,
    justifyContent: 'space-between', // Space between elements
    paddingVertical: 5,
  },
  
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  
  foodDescription: {
    fontSize: 14,
    color: '#666', // Subtle text color for description
    marginBottom: 10,
  },
  
  foodPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  orderButton: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#000', // Button color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  
  orderButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  

loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#FFF',
},
});

export default HomePage;
