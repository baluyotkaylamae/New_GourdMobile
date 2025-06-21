import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg'); // Use your hero background image
const pinakbetImg = require('../../../assets/Content/pinakbet.jpg');
const ginisaImg = require('../../../assets/Content/ginisang ampalaya.jpg');

function GourdPhi() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Section (scrolls with content) */}
      <ImageBackground
        source={heroBg}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <Text style={styles.heroText}>History</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Text style={styles.content}>
          In the Philippines, gourds have long held a place of importance, especially in traditional cuisine and folk medicine. Bitter gourd, or ampalaya, is a prominent ingredient in Filipino dishes like Pinakbet, a mixed vegetable stew with a unique flavor profile, and Ginisang Ampalaya, a sautéed dish combining bitter gourd with eggs, garlic, and onions. Bottle gourd, or upo, is also popular in soups and stews, often cooked with garlic, tomatoes, and fish to create flavorful and nutritious meals. In addition to its culinary uses, bitter gourd is deeply embedded in Filipino medicinal practices. Known for its potential to help manage blood sugar levels, ampalaya has been a traditional remedy for diabetes and is still used in herbal medicine across the country.
        </Text>
        {/* Images Section */}
        <View style={styles.imageRow}>
          <View style={styles.imageContainer}>
            <Image source={pinakbetImg} style={styles.image} />
            <Text style={styles.imageSource}>
              Source: Marina's Kitchen
            </Text>
          </View>
          <View style={styles.imageContainer}>
            <Image source={ginisaImg} style={styles.image} />
            <Text style={styles.imageSource}>
              Source: Ajinomoto PH
            </Text>
          </View>
        </View>
        <Text style={styles.content}>
          The cultural significance of gourds in the Philippines extends beyond cuisine and health. While gourds are less commonly depicted in Philippine folklore, they symbolize abundance and resilience due to their ability to grow in challenging conditions. In contemporary Filipino culture, ampalaya is widely available as a dietary supplement and herbal tea, reflecting an ongoing appreciation for its health benefits. Gourds continue to bridge the past with the present, maintaining a strong presence in Filipino culture as both a practical resource and a symbol of natural health.
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
  content: {
    fontSize: 17,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "left",
    marginBottom: 8,
    fontWeight: "400",
    width: "100%",
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 14,
    width: "100%",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: 10,
    marginBottom: 4,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  imageSource: {
    color: "#bbb",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
});
export default GourdPhi;