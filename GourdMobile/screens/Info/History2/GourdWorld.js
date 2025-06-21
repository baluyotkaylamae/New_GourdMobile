import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, ImageBackground } from 'react-native';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');
const lalagyanImg = require('../../../assets/Content/history1.jpg');
const ritualImg = require('../../../assets/Content/history2.jpg');

function GourdWorld() {
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
          Gourds are among the oldest cultivated plants in human history, with evidence of domestication stretching back over 10,000 years. Civilizations across Africa, Asia, and the Americas grew gourds not just as a food source but for their versatility. Once dried, the hard shells of gourds made them ideal natural containers, commonly used for storing water, grains, and seeds. The durability of dried gourds also led to their adaptation into tools and even musical instruments. In regions with limited access to manufactured goods, gourds became essential to daily life, especially in arid areas where other materials were scarce.
        </Text>
        <View style={styles.imageRow}>
          <View style={styles.imageContainer}>
            <Image source={lalagyanImg} style={styles.image} />
            <Text style={styles.imageCaption}>Dried gourd used as a container (Lalagyan)</Text>
          </View>
        </View>
        <Text style={styles.content}>
          The unique shapes and smooth surface of gourds have also made them a popular medium for artistic and cultural expression worldwide. Many cultures would carve, paint, or decorate gourds, often for ritualistic or ceremonial purposes. In some traditions, they are still used as offerings or as part of cultural ceremonies. Gourds have also had a significant role in traditional music, especially as percussion instruments. For example, in West Africa, the shekere is a gourd-based instrument covered with beads that produce rhythmic sounds, while maracas in Latin America are crafted using small gourds. In India, dried gourds are used in stringed instruments like the tanpura and sitar, serving as resonators and adding depth to the sound.
        </Text>
        <View style={styles.imageRow}>
          <View style={styles.imageContainer}>
            <Image source={ritualImg} style={styles.image} />
            <Text style={styles.imageCaption}>Decorated gourd for ritual or ceremonial use</Text>
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
    justifyContent: "center",
    marginVertical: 10,
    width: "100%",
  },
  imageContainer: {
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 180,
    height: 120,
    borderRadius: 12,
    marginBottom: 6,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  imageCaption: {
    color: "#bbb",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 2,
  },
});

export default GourdWorld;