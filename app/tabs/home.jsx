import React, { useState, useEffect, useRef } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,FlatList,ScrollView,Image,TextInput,ActivityIndicator,} from 'react-native';
import Swiper from 'react-native-swiper'; // For swiping between offers
import { useNavigation } from '@react-navigation/native';

import { db,auth } from './../../configs/FirebaseConfig'; // Firebase config
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';

import { Defines } from '../../constants/Defines';

import { AntDesign } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';
import PlaceholderProfile from './../../assets/graphics/placeholder-profile.jpg';

const HomePage = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null); // Reference for scrolling

  const [category, setCategory] = useState([]);
  
  const categoryPositions = useRef({}); // To store the position of each category
  const [categories, setCategories] = useState([]); // Store categories with icons

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userDetails, setUserDetails] = useState({});
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [address, setAddress] = useState('');
  
  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribe = onSnapshot(
        doc(db, 'UserDetails', auth.currentUser.uid),
        (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserDetails(data);
            setName(data.name);
            setAddress(data.address || 'Address not available');
  
            // Correctly handle profile picture
            if (data.profilePicture) {
              setPhoto({ uri: data.profilePicture }); // Remote URI
            } else {
              setPhoto(PlaceholderProfile); // Local image
            }
          } else {
            console.error('User document does not exist');
          }
        },
        (error) => {
          console.error('Error fetching user details:', error);
        }
      );
  
      return () => unsubscribe();
    } else {
      console.error('User not authenticated.');
    }
  }, []);
  

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
          description: foodData.description || 'Delicious and flavorful food made just for you!',
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
    const unsubscribe = onSnapshot(collection(db, 'Categories'), (snapshot) => {
      const categoryData = snapshot.docs.map((doc) => ({
        id: doc.id, // Document ID, e.g., 'Biriyani', 'Burger'
        icon: doc.data().iconRef, // Use the 'iconRef' field from Firestore
      }));
      setCategory(categoryData); // Save the category data to state
    });
  
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

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

  const scrollToCategory = (category) => {
    const position = categoryPositions.current[category];
    if (position && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: position,
        animated: true,
      });
    }
  };

  const handleCategoryLayout = (category, event) => {
    const { y } = event.nativeEvent.layout;
    categoryPositions.current[category] = y;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View>
      {/* HEADER CONTAINER */}
      <View style={styles.detailsContainer}>
        <View style={styles.header}>

          {/* LOCATION WITH ICON */}
          <EvilIcons name="location" size={30} color="white" />
          <Text style={styles.locationText}>{address}</Text>

          {/* PROFILE PICTURE */}
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={photo} // `photo` will be either a local image or a URI object
            style={styles.profileImage}/>
          </TouchableOpacity>
        </View>

        {/* NAME */}
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{name}</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <AntDesign
            name="search1"
            size={24}
            color="black"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search Bubble tea"
            style={styles.searchInput}
            placeholderTextColor="gray"
          />
        </View>
      </View>

    {/* MAIN CONTENT */}
    <ScrollView 
  ref={scrollViewRef} 
  contentContainerStyle={styles.scrollContent} 
  showsVerticalScrollIndicator={false}
>
  {/* Swiper Component */}
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
            source={{ uri: offer.imageRef }}
            style={styles.offerImage}
          />
        </View>
      ))}
    </Swiper>
  </View>

  {/* Categories Section */}
  <View style={styles.categoriesSection}>
  <Text style={styles.sectionTitle}>What would you like to eat now?</Text>
  <FlatList
    data={category}
    renderItem={({ item }) => (
      <TouchableOpacity 
      style={styles.categoryButton} 
      onPress={() => scrollToCategory(item.id)} // Pass document ID as the category
      >
        <View style={styles.categoryBox}>
        <Image source={{ uri: item.icon }} style={styles.categoryIcon} />
        </View>

        <Text style={styles.categoryText}>{item.id}</Text> {/* Display document ID */}
      </TouchableOpacity>
    )}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item) => item.id} // Use document ID as the key
    style={styles.categoriesList}
  />
</View>

  {/* Category Items */}
  {categories.map((category) => (
    <View 
      key={category.category} 
      onLayout={(event) => handleCategoryLayout(category.category, event)} 
      style={styles.categoryContainer}
    >
      <Text style={styles.categoryTitle}>{category.category}</Text>
      {category.items.map((item) => (
        <View key={item.id} style={styles.foodItemContainer}>
          <Image source={{ uri: item.image }} style={styles.foodImageLeft} />
          <View style={styles.foodDetails}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodDescription}>{item.description}</Text>
            <Text style={styles.foodPrice}>{'₹' + item.price}</Text>
            <TouchableOpacity 
              style={styles.orderButton} 
              onPress={() => navigation.navigate('PlaceOrder', { 
                item: { 
                  ...item, 
                  imageRef: item.image 
                } 
              })}
            >
              <Text style={styles.orderButtonText}>Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  ))}
</ScrollView>

  </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    backgroundColor: Defines.Colors.Black,
    marginBottom: 20,
    padding: 30,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Defines.Colors.PrimaryWhite,
    marginLeft: 20,
  },
  locationText: {
    fontSize: 15,
    color: Defines.Colors.TextColorWhite,
    fontFamily: Defines.Fonts.Light,
    textAlign: 'left',
    marginLeft: 10, // Spacing between icon and text
    flex: 1,
  },
  nameContainer: {
    marginTop: 10, // Adds spacing between header and name
    marginLeft: 10, // Aligns the name with the location text
  },
  nameText: {
    fontSize: 20,
    color: Defines.Colors.TextColorWhite,
    fontFamily: Defines.Fonts.Bold,
    textAlign: 'left',
  },
  searchBar: {
    marginTop: 20, // Adds spacing between the name and the search bar
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Defines.Colors.White,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Defines.Colors.Black,
    fontSize: 16,
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
  categoryIcon: {
    width: 50, // Adjust as needed
    height: 50, // Adjust as needed
    resizeMode: 'contain', // Ensures the image fits within the container
  },  
  categoryBox: {
    backgroundColor: Defines.Colors.White,
    borderRadius: 20,
    padding: 20,
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
    fontWeight: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorGreen
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
