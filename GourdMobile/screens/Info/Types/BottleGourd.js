import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');
const bottleGourdImg = require('../../../assets/Content/upo111.jpg');

const BottleGourd = () => {
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
        <Text style={styles.heroText}>Upo</Text>
      </ImageBackground>
      <View style={styles.card}>
        {/* Bottle Gourd image at the top */}
        <Image source={bottleGourdImg} style={styles.gourdImage} />
        <TouchableOpacity onPress={() => Linking.openURL('https://www.britannica.com/plant/bottle-gourd')}>
          <Text style={styles.imageCaption}>
            Source: Britannica
          </Text>
        </TouchableOpacity>
        <Text style={styles.content}>
          The bottle gourd is another important gourd variety in the Philippines, valued for its culinary versatility and practical uses. Here are some key facts about bottle gourd:
        </Text>
        <View style={styles.bulletRow}>
          <Icon name="leaf" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Bottle Gourd (Upo)</Text>
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="test-tube" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Scientific Name: </Text>Lagenaria siceraria
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="text-box-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Description: </Text>
            Bottle gourd, or upo, is a vine plant with light green, smooth-skinned fruits that are bottle-shaped or long and cylindrical. The flesh is white and mild in flavor.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="silverware-fork-knife" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Uses: </Text>
            Used in Filipino dishes like tinola (chicken soup with vegetables) and ginisang upo (sautéed bottle gourd). When dried, the hard shell is also used for making containers, utensils, and musical instruments.
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

export default BottleGourd;