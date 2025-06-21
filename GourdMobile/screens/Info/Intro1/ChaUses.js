import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ImageBackground } from 'react-native';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg'); // Use your hero background image

const images = {
  luto: require('../../../assets/Content/luto.jpg'),
  gamot: require('../../../assets/Content/gamot.jpg'),
  decoration: require('../../../assets/Content/decoration.jpg'),
};

function ChaUses() {
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
        <Text style={styles.content}>
          Gourds have been valued across cultures for both their nutritional and practical qualities. Not only are they edible and nutritious, but once dried, many gourds develop a hard outer shell, making them suitable for a variety of non-food uses. Here’s a look at the most common uses of gourds:
        </Text>
        <View style={styles.useSection}>
          <Image source={images.luto} style={styles.useImage} />
          <View style={styles.useTextContainer}>
            <Text style={styles.useTitle}>Cooking</Text>
            <Text style={styles.useDesc}>
              Gourds are often used as ingredients in various dishes, especially in Asian cuisine.
            </Text>
          </View>
        </View>
        <View style={styles.useSection}>
          <Image source={images.gamot} style={styles.useImage} />
          <View style={styles.useTextContainer}>
            <Text style={styles.useTitle}>Medicine</Text>
            <Text style={styles.useDesc}>
              Some gourds are used in traditional medicine for their health benefits.
            </Text>
          </View>
        </View>
        <View style={styles.useSection}>
          <Image source={images.decoration} style={styles.useImage} />
          <View style={styles.useTextContainer}>
            <Text style={styles.useTitle}>Decoration</Text>
            <Text style={styles.useDesc}>
              Dried gourds are commonly used as decorative items or containers.
            </Text>
          </View>
        </View>
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
  content: {
    fontSize: 17,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "left",
    fontWeight: "400",
    width: "100%",
    marginBottom: 18,
  },
  useSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
  useImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 14,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  useTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  useTitle: {
    fontWeight: "bold",
    color: "#58b368",
    fontSize: 16,
    marginBottom: 2,
  },
  useDesc: {
    color: "#38734e",
    fontSize: 14,
    marginBottom: 2,
    textAlign: "left",
  },
  source: {
    color: "#bbb",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
});

export default ChaUses;