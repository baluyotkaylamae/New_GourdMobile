import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');
const bitterGourdImg = require('../../../assets/Content/ampalaya111.jpg');

const BitterGourd = () => {
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
        <Text style={styles.heroText}>Ampalaya</Text>
      </ImageBackground>
      <View style={styles.card}>
        {/* Bitter Gourd image at the top */}
        <Image source={bitterGourdImg} style={styles.gourdImage} />
        <TouchableOpacity onPress={() => Linking.openURL('https://www.scmp.com/lifestyle/food-drink/article/3039121/chinese-bitter-melon-why-polarising-gentlemans-vegetable-just')}>
          <Text style={styles.imageCaption}>
            Source: SCMP
          </Text>
        </TouchableOpacity>
        <Text style={styles.content}>
          The Philippines is home to several gourd varieties, each with unique characteristics, culinary uses, and cultural importance. Here are the most common types of gourds grown and used in Filipino cuisine and traditional practices:
        </Text>
        <View style={styles.bulletRow}>
          <Icon name="leaf" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Bitter Gourd (Ampalaya)</Text>
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="test-tube" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Scientific Name: </Text>Momordica charantia
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="text-box-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Description: </Text>
            Bitter gourd, known locally as ampalaya, has a distinct wrinkled skin and is famous for its bitter taste. It is a vine plant with dark green fruits that are either short and thick or long and thin, depending on the variety.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="silverware-fork-knife" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Uses: </Text>
            Often used in Filipino dishes like ginisang ampalaya (sautéed bitter gourd) with eggs and sometimes paired with meats or seafood. It is also valued for its medicinal properties, as it is believed to help regulate blood sugar levels.
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

export default BitterGourd;