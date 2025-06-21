import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');

const PollinationChallenges = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      {/* Hero Section */}
      <ImageBackground
        source={heroBg}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <Text style={styles.heroText}>Challenges</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Text style={styles.content}>
          Pollination can be challenging, particularly if there are not enough pollinators in the area. Factors like habitat loss, pesticide use, and climate change have led to declining pollinator populations, which can affect gourd production. Additionally, poor weather conditions such as excessive rain or extreme heat can hinder pollination, as bees and other insects may be less active in such conditions.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FFF8",
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 34,
    alignItems: "center",
  },
  hero: {
    width: width,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroText: {
    color: '#fff',
    fontSize: 44,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginVertical: 10,
    borderRadius: 18,
    padding: 22,
    shadowColor: "#aee4bb",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 3,
    width: width - 16,
    alignItems: "center",
    overflow: 'visible',
  },
  content: {
    fontSize: 16,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "justify",
    marginBottom: 4,
    fontWeight: "400",
    width: "100%",
  },
  bold: {
    fontWeight: "bold",
    color: "#b68400",
  },
});

export default PollinationChallenges;