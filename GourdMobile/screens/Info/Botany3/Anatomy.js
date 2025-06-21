import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg'); // Use your hero background image
const anatomyImg = require('../../../assets/Content/anatomy.jpg');

const Anatomy = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Section (scrolls with content) */}
      <ImageBackground
        source={heroBg}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <Text style={styles.heroText}>Anatomy</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Image source={anatomyImg} style={styles.anatomyImage} />
        <Text style={styles.imageCaption}>Source: Your Image Source Here</Text>
        <Text style={styles.content}>
          Gourds are robust, vining plants characterized by several key structures, each with a specific function that supports growth and fruit production:
        </Text>
        <View style={styles.bulletRow}>
          <Icon name="source-branch" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Roots: </Text>
            Gourd plants have extensive root systems that help them absorb water and nutrients from the soil, supporting their rapid growth. These roots anchor the plant and enable it to thrive in nutrient-poor soils.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="sprout" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Stems and Tendrils: </Text>
            The stems of gourds are long, flexible, and often vine-like, allowing them to spread horizontally across the ground or climb vertical structures. Tendrils, small coiling structures along the stem, help the plant attach to supports like fences or trellises, promoting stability as the plant grows.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="leaf-maple" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Leaves: </Text>
            Gourd leaves are typically large, lobed, and broad, helping to maximize sunlight absorption. Their shape also provides shade to the developing fruits below, protecting them from excessive sunlight.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="flower-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Flowers: </Text>
            Gourd plants produce both male and female flowers. These flowers are essential for reproduction and are generally large and yellow, attracting pollinators. Male flowers emerge first, followed by female flowers with a small, immature fruit at the base.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="fruit-cherries" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Fruits: </Text>
            Once pollination occurs, the female flower's ovary develops into a mature gourd. Gourds vary in shape, size, and color, depending on the type (e.g., bitter gourd, sponge gourd, bottle gourd).
          </Text>
        </View>
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
  anatomyImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  imageCaption: {
    color: "#bbb",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "left",
    marginBottom: 16,
    fontWeight: "400",
    width: "100%",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    marginLeft: 2,
    paddingRight: 4,
    width: "100%",
  },
  bulletIcon: {
    marginRight: 13,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "#38734e",
    lineHeight: 24,
    textAlign: "left",
  },
  bold: {
    fontWeight: "bold",
    color: "#58b368",
  },
});

export default Anatomy;