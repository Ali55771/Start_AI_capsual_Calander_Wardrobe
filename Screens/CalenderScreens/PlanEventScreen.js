import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlanEventScreen({ navigation, route }) {
  const { event } = route.params;

  const ActionButton = ({ onPress, text, icon, style, textStyle }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, style, pressed && styles.actionButtonPressed]}>
      {icon}
      <Text style={[styles.actionButtonText, textStyle]}>{text}</Text>
    </Pressable>
  );

  return (
    <LinearGradient colors={['#2c1d1a', '#4a302d']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Plan Your Event</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventName}>{event.eventName}</Text>
            <Pressable 
              onPress={() => navigation.navigate('ReminderScreen', { event })}
              style={({ pressed }) => [styles.alarmIcon, pressed && styles.alarmIconPressed]}
            >
              <AntDesign name="clockcircleo" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={styles.separator} />
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#C4704F" style={styles.detailIcon} />
              <Text style={styles.eventText}>{event.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#C4704F" style={styles.detailIcon} />
              <Text style={styles.eventText}>{event.startTime}</Text>
            </View>
            {event.description && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={20} color="#C4704F" style={styles.detailIcon} />
                <Text style={styles.eventText}>{event.description}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Plan Your Outfit</Text>
          <ActionButton
            onPress={() => navigation.navigate('CalendarWardrobeScreen', { eventId: event.id, eventDate: event.date })}
            text="Plan Manually"
            icon={<Ionicons name="shirt-outline" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />}
          />
          <ActionButton
            onPress={() => navigation.navigate('IntroScreen')}
            text="Get Recommendation"
            icon={<Ionicons name="sparkles-outline" size={22} color="#C4704F" style={{ marginRight: 10 }} />}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  alarmIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  alarmIconPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 15,
  },
  eventDetails: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 15,
  },
  eventText: {
    fontSize: 16,
    color: '#E0E0E0',
    flex: 1,
  },
  actionsContainer: {
    marginTop: 10,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#C4704F',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#C4704F',
  },
  secondaryButtonText: {
    color: '#C4704F',
  },
});