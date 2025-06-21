import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ImageBackground } from 'react-native';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg'); // Replace with your hero background image
const introImage = require('../../../assets/Content/Intro.jpg');

function Definition() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Section (scrolls with content) */}
      <ImageBackground
        source={heroBg}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <Text style={styles.heroText}>Explore The World of Gourds</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Image source={introImage} style={styles.introImage} />
        <Text style={styles.content}>
          Gourds belong to the Cucurbitaceae family, which is a large group of plants commonly known as cucurbits. This family includes various species such as pumpkins, squash, melons, and cucumbers. Gourds are vining plants that grow quickly, often spreading with the help of large leaves and tendrils. Their fruits, typically known as "gourds," can have a wide range of shapes and colors. Many gourds are known for their hard, durable rinds, which make them useful beyond culinary applications.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FFF8",
  },
  scrollContent: {
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
    marginHorizontal: 8,
    marginVertical: 10,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#aee4bb",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 3,
    alignItems: "center",
    width: width - 16,
    overflow: 'visible',
  },
  introImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  content: {
    fontSize: 17,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "left",
    fontWeight: "400",
    width: "100%",
    overflow: 'visible',
  },
});

export default Definition;