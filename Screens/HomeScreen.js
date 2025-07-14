import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet, Dimensions, Animated, Image, Platform, Pressable } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import { useNavigation } from '@react-navigation/native';
import { UserContext } from "../context/UserContext";
import React, { useContext, useState, useRef, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';


const { width } = Dimensions.get("window");

// --- DUMMY DATA ---
const recommendedOutfits = [
  { id: '1', title: 'Urban Explorer', subtitle: 'Stay stylish on the go', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  { id: '2', title: 'Classic Tailored', subtitle: 'A sharp and sophisticated look', image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  { id: '3', title: 'Chic & Modern', subtitle: 'Effortless elegance for any occasion', image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  { id: '4', title: 'Summer Breeze', subtitle: 'Light and airy for sunny days', image: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

const getWeekData = () => {
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  let week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    week.push({
      id: i.toString(),
      day: days[date.getDay()],
      date: date.getDate(),
    });
  }
  return week;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);


export default function Home({ route }) {
  const navigation = useNavigation();
  const { user, logout } = useContext(UserContext);

  // Capsule wardrobe icon handler (optional: open wardrobe overview)
  const handleCapsuleIconPress = () => {
    navigation.navigate('CapsuleWardrobeScreen');
  }

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [notificationCount, setNotificationCount] = useState(0);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animation values for the new design
  const scrollY = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const weatherAnim = useRef(new Animated.Value(0)).current;
  const weekAnim = useRef(new Animated.Value(0)).current;
  const outfitsAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(welcomeAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(weatherAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(weekAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(outfitsAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, []);

  // Listen for notifications
  useEffect(() => {
    const database = getDatabase();
    const notificationsRef = ref(database, 'notifications');
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notifications = snapshot.val();
        const count = Object.keys(notifications).length;
        setNotificationCount(count);
      } else {
        setNotificationCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const openDrawer = () => {
    setDrawerVisible(true);
    const animations = itemAnims.map(anim => (
        Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay: 100,
            useNativeDriver: true,
        })
    ));
    Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 400, useNativeDriver: true }),
        Animated.stagger(80, animations)
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
        Animated.timing(slideAnim, { toValue: -width, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
        setDrawerVisible(false);
        itemAnims.forEach(anim => anim.setValue(0));
    });
  };

  const renderOutfitCard = ({ item, index }) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, 250 * index, 250 * (index + 2)],
      outputRange: [1, 1, 1, 0.8]
    });
    return (
      <AnimatedTouchable style={[styles.outfitCard, { transform: [{ scale }] }]}>
        <Image source={{ uri: item.image }} style={styles.outfitImage} />
        <View style={styles.outfitTextContainer}>
          <Text style={styles.outfitTitle}>{item.title}</Text>
          <Text style={styles.outfitSubtitle}>{item.subtitle}</Text>
        </View>
      </AnimatedTouchable>
    );  
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        {/* --- HEADER (Preserved) --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={32} color="#EFEBE9" />
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('IntroScreen')}>
              <MaterialCommunityIcons name="robot-outline" size={26} color="#EFEBE9" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('CapsuleEntryScreen')}>
              <MaterialCommunityIcons name="wardrobe-outline" size={26} color="#EFEBE9" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('FavoritesScreen')}>
              <Ionicons name="heart-outline" size={26} color="#EFEBE9" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('NotificationsScreen')}>
              <View style={styles.notificationContainer}>
                <Ionicons name="notifications-outline" size={26} color="#EFEBE9" />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- SCROLLABLE & ANIMATED BODY --- */}
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContainer}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        >
          {/* Welcome Section */}
          <Animated.View style={[styles.sectionContainer, { opacity: welcomeAnim, transform: [{ scale: welcomeAnim }] }]}>
                        <Text style={styles.welcomeTitle}>Hi, {user?.name || "Style Savvy"}!</Text>
            <Text style={styles.welcomeSubtitle}>Let's pick your outfit for today.</Text>
          </Animated.View>

          {/* Weather Section */}
          <Animated.View style={[styles.weatherContainer, { opacity: weatherAnim, transform: [{ scale: weatherAnim }] }]}>
            <Ionicons name="partly-sunny-outline" size={32} color="#2c1d1a" />
            <Text style={styles.weatherText}>24°C - Partly Cloudy</Text>
          </Animated.View>

          {/* Date Selector */}
          <Animated.View style={[styles.sectionContainer, { opacity: weekAnim, transform: [{ scale: weekAnim }] }]}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <FlatList
              data={getWeekData()}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingLeft: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dateBox, selectedDate === item.date && styles.selectedDateBox]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <Text style={[styles.dateDay, selectedDate === item.date && styles.selectedDateText]}>{item.day}</Text>
                  <Text style={[styles.dateNumber, selectedDate === item.date && styles.selectedDateText]}>{item.date}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>

          {/* Recommended Outfits */}
          <Animated.View style={[styles.sectionContainer, { opacity: outfitsAnim, transform: [{ scale: outfitsAnim }] }]}>
            <Text style={styles.sectionTitle}>Recommended Outfits</Text>
            <FlatList
              data={recommendedOutfits}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingLeft: 20 }}
              renderItem={renderOutfitCard}
            />
          </Animated.View>
        </Animated.ScrollView>

        {/* --- BOTTOM NAV (Preserved) --- */}
        <BottomNav />
      </Animated.View>

      {/* --- DRAWER --- */}
      {drawerVisible && (
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      )}
      <Animated.View style={[styles.drawerShadow, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient colors={['#FDF6EC', '#F5EBE0']} style={styles.drawerContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.drawerHeader}>
              <Image source={{ uri: user?.profileImage || "https://picsum.photos/id/64/200/200" }} style={styles.drawerAvatar} />
              <Text style={styles.drawerTitle}>{user?.name || "Guest"}</Text>
              <Text style={styles.drawerSubtitle}>{user?.email || "no-email@provider.com"}</Text>
            </View>

            <Animated.View style={{opacity: itemAnims[0], transform: [{translateX: itemAnims[0].interpolate({inputRange: [0,1], outputRange: [-50, 0]})}]}}>
              <Pressable style={({pressed}) => [styles.drawerItem, pressed && styles.drawerItemPressed]} onPress={() => { closeDrawer(); navigation.navigate('ProfileScreen'); }}>
                <Ionicons name="person-outline" size={24} color="#8D6E63" /><Text style={styles.drawerText}>Profile</Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={{opacity: itemAnims[1], transform: [{translateX: itemAnims[1].interpolate({inputRange: [0,1], outputRange: [-50, 0]})}]}}>
              <Pressable style={({pressed}) => [styles.drawerItem, pressed && styles.drawerItemPressed]} onPress={() => { closeDrawer(); navigation.navigate('FavoritesScreen'); }}>
                <Ionicons name="heart-outline" size={24} color="#B5838D" /><Text style={styles.drawerText}>Favorites</Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={{opacity: itemAnims[2], transform: [{translateX: itemAnims[2].interpolate({inputRange: [0,1], outputRange: [-50, 0]})}]}}>
              <Pressable style={({pressed}) => [styles.drawerItem, pressed && styles.drawerItemPressed]} onPress={() => { closeDrawer(); navigation.navigate('CalendarScreen'); }}>
                <MaterialIcons name="calendar-today" size={24} color="#5C8D89" /><Text style={styles.drawerText}>Calendar</Text>
              </Pressable>
            </Animated.View>

            {/* AI Recommendation */}
            <Animated.View style={{opacity: itemAnims[2], transform: [{translateX: itemAnims[2].interpolate({inputRange: [0,1], outputRange: [-50, 0]})}]}}>
              <Pressable style={({pressed}) => [styles.drawerItem, pressed && styles.drawerItemPressed]} onPress={() => { closeDrawer(); navigation.navigate('IntroScreen'); }}>
                <MaterialCommunityIcons name="robot-outline" size={24} color="#5C8D89" /><Text style={styles.drawerText}>AI Recommendation</Text>
              </Pressable>
            </Animated.View>

            {/* Notifications */}
            <Animated.View style={{opacity: itemAnims[2], transform: [{translateX: itemAnims[2].interpolate({inputRange: [0,1], outputRange: [-50, 0]})}]}}>
              <Pressable style={({pressed}) => [styles.drawerItem, pressed && styles.drawerItemPressed]} onPress={() => { closeDrawer(); navigation.navigate('NotificationsScreen'); }}>
                <Ionicons name="notifications-outline" size={24} color="#B5838D" /><Text style={styles.drawerText}>Notifications</Text>
              </Pressable>
            </Animated.View>

            {/* Capsule Wardrobe */}
            <Animated.View style={{opacity: itemAnims[2], transform: [{translateX: itemAnims[2].interpolate({inputRange: [0,1], outputRange: [-50, 0]})}]}}>
              <Pressable style={({pressed}) => [styles.drawerItem, pressed && styles.drawerItemPressed]} onPress={() => { closeDrawer(); navigation.navigate('CapsuleEntryScreen'); }}>
                <MaterialCommunityIcons name="wardrobe-outline" size={24} color="#5C8D89" /><Text style={styles.drawerText}>Capsule Wardrobe</Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={{opacity: itemAnims[3], transform: [{translateX: itemAnims[3].interpolate({inputRange: [0,1], outputRange: [-50, 0]})}]}}>
              <Pressable style={({pressed}) => [styles.drawerItem, pressed && styles.drawerItemPressed]} onPress={() => { closeDrawer(); navigation.navigate('GetStart'); }}>
                <FontAwesome5 name="tshirt" size={20} color="#6D4C41" /><Text style={styles.drawerText}>Wardrobe</Text>
              </Pressable>
            </Animated.View>

            <View style={{flex: 1}} />

            <Animated.View style={{opacity: itemAnims[4], transform: [{translateX: itemAnims[4].interpolate({inputRange: [0,1], outputRange: [-50, 0]})}]}}>
              <Pressable style={({pressed}) => [styles.drawerItem, pressed && {backgroundColor: 'transparent'}]} onPress={() => { logout(); navigation.replace("LoginScreen"); }}>
                <LinearGradient colors={['#c75e5e', '#a84d4d']} style={styles.logoutButton}>
                  <Ionicons name="log-out-outline" size={26} color="#FDF6EC" />
                  <Text style={[styles.drawerText, styles.logoutButtonText]}>Logout</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c1d1a' },
  mainContent: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 10 }, // keep style

  menuButton: { padding: 5 },
  headerIcons: { flexDirection: "row", gap: 15 },
  headerIcon: { padding: 5 },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2c1d1a',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContainer: { paddingBottom: 120 },
  sectionContainer: { marginBottom: 25 },
  welcomeTitle: { fontSize: 32, fontWeight: 'bold', color: '#EFEBE9', paddingHorizontal: 20 },
  welcomeSubtitle: { fontSize: 18, color: '#A1887F', paddingHorizontal: 20, marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: '#EFEBE9', paddingHorizontal: 20, marginBottom: 15 },
  weatherContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFEBE9', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start', marginHorizontal: 20, marginVertical: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  weatherText: { marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#3E2723' },
  dateBox: { backgroundColor: '#4E342E', borderRadius: 15, paddingVertical: 12, paddingHorizontal: 16, marginRight: 12, alignItems: 'center', minWidth: 65 },
  selectedDateBox: { backgroundColor: '#D7CCC8' },
  dateDay: { fontSize: 14, color: '#BCAAA4', fontWeight: '500' },
  dateNumber: { fontSize: 22, color: '#FFFFFF', fontWeight: 'bold', marginTop: 4 },
  selectedDateText: { color: '#3E2723' },
  outfitCard: { width: width * 0.55, height: width * 0.7, borderRadius: 25, marginRight: 20, backgroundColor: '#5D4037', overflow: 'hidden', justifyContent: 'flex-end' },
  outfitImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.7 },
  outfitTextContainer: { padding: 20, zIndex: 1 },
  outfitTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  outfitSubtitle: { fontSize: 14, color: '#E0E0E0', marginTop: 4 },
  drawerShadow: { position: "absolute", top: 0, left: 0, width: width * 0.8, height: "100%", zIndex: 1000, shadowColor: "#000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  drawerContainer: { flex: 1, paddingBottom: 40, paddingTop: Platform.OS === 'ios' ? 60 : 40, borderTopRightRadius: 25, borderBottomRightRadius: 25, overflow: 'hidden' },
  drawerHeader: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 35, },
  drawerAvatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: 'rgba(255,255,255,0.8)', marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  drawerTitle: { fontSize: 24, fontWeight: '800', color: '#4E342E' },
  drawerSubtitle: { fontSize: 15, color: '#795548', marginTop: 4 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 15, marginBottom: 10, marginHorizontal: 15 },
  drawerItemPressed: { backgroundColor: 'rgba(141, 110, 99, 0.1)' },
  drawerText: { marginLeft: 20, fontSize: 18, fontWeight: '600', color: '#5D4037' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 15, width: '100%' },
  logoutButtonText: { color: '#FDF6EC', fontWeight: '700' },
});
