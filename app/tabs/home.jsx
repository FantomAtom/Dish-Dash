import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './../../configs/FirebaseConfig'; // Firebase config
import { Defines } from '../../constants/Defines';
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
        imageRef: doc.data().imageRef,
        title: doc.data().title || 'Limited Offer',
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
        <Text style={styles.categoryEmoji}>🍔</Text> {/* Use emoji as placeholder for the image */}
      </View>
      <Text style={styles.categoryText}>{item.category}</Text>
    </TouchableOpacity>
  );

  const renderOffer = ({ item }) => (
    <View style={styles.offerCard}>
      <Image source={{ uri: item.imageRef }} style={styles.offerImage} />
      <Text style={styles.offerText}>{item.title}</Text>
    </View>
  );

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PlaceOrder', { item })}>
      <View style={styles.foodCard}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>{'₹' + item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFoodCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.category}</Text>
      <FlatList
        data={item.items}
        renderItem={renderFoodItem}
        keyExtractor={(food) => food.id}
        horizontal
        showsHorizontalScrollIndicator={false}
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} ref={scrollViewRef}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={PlaceholderProfile} style={styles.profileImage} />
          </TouchableOpacity>
          <Text style={styles.locationText}>Ambagarathur, Karaikal-609601</Text>
        </View>

        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search Bubble tea"
            style={styles.searchInput}
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <FlatList
          data={offers}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderOffer}
          keyExtractor={(item) => item.id}
          style={styles.offerList}
        />

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

        <View style={styles.dealsSection}>
          <Text style={styles.sectionTitle}>Top Deals</Text>
          {offers.map((offer) => (
            <View key={offer.id} style={styles.dealCard}>
              <Image source={{ uri: offer.imageRef }} style={styles.dealImage} />
              <Text style={styles.dealText}>{offer.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.categoriesSection}>
          {categories.map((category, index) => (
            <View key={category.category}>{renderFoodCategory({ item: category })}</View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.PrimaryWhite,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  searchBar: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    fontSize: 16,
  },
  offerList: {
    marginBottom: 20,
  },
  offerCard: {
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  offerImage: {
    width: 200,
    height: 120,
    resizeMode: 'cover',
  },
  offerText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoriesList: {
    flexDirection: 'row',
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 15,
  },
  categoryBox: {
    backgroundColor: Defines.Colors.PrimaryYellow,
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryEmoji: {
    fontSize: 50,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    color: Defines.Colors.TextColorBlack,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 25,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 10,
  },
  foodList: {
    marginBottom: 10,
  },
  foodCard: {
    backgroundColor: Defines.Colors.PrimaryYellow,
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodPrice: {
    fontSize: 14,
    color: '#888',
  },
  dealCard: {
    backgroundColor: '#EEE',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dealImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  dealText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});

export default HomePage;
