import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');
const spongeGourdImg = require('../../../assets/Content/patola111.jpg');

const SpongeGourd = () => {
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
        <Text style={styles.heroText}>Patola</Text>
      </ImageBackground>
      <View style={styles.card}>
        {/* Sponge Gourd image at the top */}
        <Image source={spongeGourdImg} style={styles.gourdImage} />
        <TouchableOpacity onPress={() => Linking.openURL('https://www.specialtyproduce.com/produce/Sponge_Gourd_1041.php')}>
          <Text style={styles.imageCaption}>
            Source: Specialty Produce
          </Text>
        </TouchableOpacity>
        <Text style={styles.content}>
          The Philippines is home to several gourd varieties, each with unique characteristics, culinary uses, and cultural importance. Here are the most common types of gourds grown and used in Filipino cuisine and traditional practices:
        </Text>
        <View style={styles.bulletRow}>
          <Icon name="leaf" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Sponge Gourd (Patola)</Text>
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="test-tube" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Scientific Name: </Text>Luffa aegyptiaca or Luffa cylindrica
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="text-box-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Description: </Text>
            Known as patola in Filipino, sponge gourd is a long, green gourd with a smooth or slightly ridged skin. When young, it is tender and edible; when mature, it develops fibrous interiors that can be dried and used as natural sponges.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="silverware-fork-knife" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Uses: </Text>
            Commonly used in Filipino soups like misua with patola, where it adds a mild, slightly sweet flavor. Mature sponge gourds are dried and turned into bath or cleaning sponges, making them useful beyond the kitchen.
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
    fontSize: 38,
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
  gourdImage: {
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
    textDecorationLine: "underline",
  },
  content: {
    fontSize: 16,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "justify",
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

export default SpongeGourd;