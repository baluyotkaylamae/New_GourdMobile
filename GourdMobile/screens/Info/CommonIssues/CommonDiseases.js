import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Images for each disease
const powderyMildewImg = require('../../../assets/Content/powmildew.jpg');
const downyMildewImg = require('../../../assets/Content/dowmildew.jpg');
const bacterialWiltImg = require('../../../assets/Content/bacteriawilt.jpg');
const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');

const Diseases = () => {
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
        <Text style={styles.heroText}>Common Issues & Diseases</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Text style={styles.content}>
          Growing gourds can come with a variety of challenges, particularly from pests and diseases that can affect plant health and fruit yield. Understanding these common issues and how to manage them is essential for successful gourd cultivation.
        </Text>
        <View style={styles.bulletRow}>
          <Icon name="alert-circle-outline" size={22} color="#c13f44" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Common Diseases</Text>
          </Text>
        </View>
        {/* Powdery Mildew */}
        <View style={styles.diseaseSection}>
          <Image source={powderyMildewImg} style={styles.diseaseImage} />
          <TouchableOpacity onPress={() => Linking.openURL('https://www.flickr.com/photos/scotnelson/24997141044')}>
            <Text style={styles.imageCaption}>Source: Flickr</Text>
          </TouchableOpacity>
          <View style={styles.bulletRow}>
            <Icon name="blur" size={22} color="#c13f44" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Powdery Mildew:</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="information-outline" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Description: A fungal disease that appears as white, powdery spots on leaves.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="close-octagon-outline" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Impacts: Affects photosynthesis and can lead to premature leaf drop.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="spray" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Management: Improve air circulation, avoid overhead watering, and apply fungicides if necessary.</Text>
          </View>
        </View>
        {/* Downy Mildew */}
        <View style={styles.diseaseSection}>
          <Image source={downyMildewImg} style={styles.diseaseImage} />
          <TouchableOpacity onPress={() => Linking.openURL('https://wiki.bugwood.org/Pseudoperonospora_cubensis_%28downy_mildew_of_cucurbits%29')}>
            <Text style={styles.imageCaption}>Source: Bugwood Wiki</Text>
          </TouchableOpacity>
          <View style={styles.bulletRow}>
            <Icon name="blur" size={22} color="#c13f44" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Downy Mildew:</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="information-outline" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Description: A fungal disease characterized by yellow patches on the upper leaf surface and gray mold underneath.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="close-octagon-outline" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Impacts: Reduces photosynthesis and weakens the plant.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="spray" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Management: Rotate crops, choose resistant varieties, and apply fungicides as a preventive measure.</Text>
          </View>
        </View>
        {/* Bacterial Wilt */}
        <View style={styles.diseaseSection}>
          <Image source={bacterialWiltImg} style={styles.diseaseImage} />
          <TouchableOpacity onPress={() => Linking.openURL('https://www.vegetables.cornell.edu/pest-management/keys-for-identifying-vegetable-diseases/cucurbit-key/pumpkin-gourd-disease-key/pumpkin-gourd-wilt-crown-and-general-plant-decline/')}>
            <Text style={styles.imageCaption}>Source: Cornell CALS</Text>
          </TouchableOpacity>
          <View style={styles.bulletRow}>
            <Icon name="blur" size={22} color="#c13f44" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Bacterial Wilt:</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="information-outline" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Description: Caused by bacteria spread by cucumber beetles.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="close-octagon-outline" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Impacts: Causes sudden wilting of leaves and eventual plant death.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="bug-outline" size={18} color="#e77c7c" style={styles.infoIcon} />
            <Text style={styles.infoText}>Management: Control cucumber beetle populations and remove infected plants to prevent spread.</Text>
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
    maxWidth: Math.min(500, width - 8),
    alignSelf: "center",
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffeaea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#f4b9b9",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#b53a3a",
    textAlign: "left",
    letterSpacing: 0.3,
    flexShrink: 1,
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
  },
  content: {
    fontSize: 16,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "justify",
    marginBottom: 16,
    fontWeight: "400",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    marginLeft: 2,
    paddingRight: 4,
  },
  bulletIcon: {
    marginRight: 13,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "#b53a3a",
    lineHeight: 24,
    textAlign: "left",
  },
  bold: {
    fontWeight: "bold",
    color: "#b53a3a",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 30,
    marginBottom: 4,
    paddingRight: 4,
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
  diseaseSection: {
    marginTop: 18,
    marginBottom: 10,
  },
  diseaseImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 4,
    resizeMode: "cover",
    backgroundColor: "#f4eaea",
  },
  imageCaption: {
    color: "#b53a3a",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 4,
    textDecorationLine: "underline",
  },
});

export default Diseases;