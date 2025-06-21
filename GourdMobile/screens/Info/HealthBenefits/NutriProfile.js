import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Images for each gourd
const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');
const bitterGourdImg = require('../../../assets/Content/ampalaya111.jpg');
const spongeGourdImg = require('../../../assets/Content/patola111.jpg');
const bottleGourdImg = require('../../../assets/Content/upo111.jpg');

const NutritionalProfile = () => {
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
        <Text style={styles.heroText}>Nutritional Value</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Text style={styles.content}>
          Gourds are not only versatile in the kitchen but also packed with essential nutrients and health benefits. Understanding their nutritional profiles and medicinal uses can encourage healthier dietary choices.
        </Text>

        <View style={styles.bulletRow}>
          <Icon name="clipboard-list-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Nutritional Profile of Each Gourd</Text>
          </Text>
        </View>

        {/* Bitter Gourd */}
        <View style={styles.gourdSection}>
          <Image source={bitterGourdImg} style={styles.gourdImage} />
          <TouchableOpacity onPress={() => Linking.openURL('https://www.scmp.com/lifestyle/food-drink/article/3039121/chinese-bitter-melon-why-polarising-gentlemans-vegetable-just')}>
            <Text style={styles.imageCaption}>Source: SCMP</Text>
          </TouchableOpacity>
          <View style={styles.bulletRow}>
            <Icon name="leaf" size={22} color="#58b368" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Bitter Gourd (Ampalaya):</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-v-box-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Vitamins: Rich in Vitamin C, which boosts the immune system and promotes healthy skin.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-m-box-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Minerals: Contains potassium, which helps regulate blood pressure, and iron, essential for blood health.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="star-circle-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Antioxidants: High levels of flavonoids and phenolic compounds that may help reduce oxidative stress.</Text>
          </View>
        </View>

        {/* Sponge Gourd */}
        <View style={styles.gourdSection}>
          <Image source={spongeGourdImg} style={styles.gourdImage} />
          <TouchableOpacity onPress={() => Linking.openURL('https://www.specialtyproduce.com/produce/Sponge_Gourd_1041.php')}>
            <Text style={styles.imageCaption}>Source: Specialty Produce</Text>
          </TouchableOpacity>
          <View style={styles.bulletRow}>
            <Icon name="leaf" size={22} color="#58b368" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Sponge Gourd (Patola):</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-v-box-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Vitamins: A good source of Vitamins A and C, promoting vision health and immune function.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-m-box-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Minerals: Contains calcium and magnesium, vital for bone health.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="star-circle-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Antioxidants: Offers dietary fiber, which aids in digestion and can help maintain healthy cholesterol levels.</Text>
          </View>
        </View>

        {/* Bottle Gourd */}
        <View style={styles.gourdSection}>
          <Image source={bottleGourdImg} style={styles.gourdImage} />
          <TouchableOpacity onPress={() => Linking.openURL('https://www.thespruceeats.com/what-is-bottle-gourd-3376805')}>
            <Text style={styles.imageCaption}>Source: The Spruce Eats</Text>
          </TouchableOpacity>
          <View style={styles.bulletRow}>
            <Icon name="leaf" size={22} color="#58b368" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Bottle Gourd (Upo):</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-v-box-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Vitamins: High in Vitamin B, particularly B1 (thiamine) and B2 (riboflavin), which support energy metabolism.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="alpha-m-box-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Minerals: Rich in potassium, which helps maintain fluid balance and supports heart health.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="star-circle-outline" size={18} color="#58b368" style={styles.infoIcon} />
            <Text style={styles.infoText}>Antioxidants: Contains a significant amount of water, making it hydrating and low in calories, which is beneficial for weight management.</Text>
          </View>
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
    marginBottom: 8,
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
  gourdSection: {
    marginTop: 18,
    marginBottom: 10,
    width: "100%",
  },
  gourdImage: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    marginBottom: 4,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  imageCaption: {
    color: "#bbb",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 4,
    textDecorationLine: "underline",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 30,
    marginBottom: 4,
    paddingRight: 4,
    width: "90%",
  },
  infoIcon: {
    marginRight: 7,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#38734e",
    lineHeight: 22,
    textAlign: "left",
  },
});

export default NutritionalProfile;