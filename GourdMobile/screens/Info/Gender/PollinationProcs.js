import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, Linking, TouchableOpacity, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');
const beePollinationImg = require('../../../assets/Content/bee.jpg');
const handPollinationImg = require('../../../assets/Content/hand.jpg');

const PollinationProcess = () => {
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
        <Text style={styles.heroText}>Pollination Process</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Text style={styles.content}>
          Pollination in gourds usually depends on natural pollinators, such as bees and other insects, which transfer pollen from the male flowers to the female flowers. However, some factors can affect the pollination process, including a lack of pollinators due to environmental factors or local pesticide use. In these cases, hand-pollination is often used to ensure that female flowers receive the pollen they need for fruit production.
        </Text>

        {/* Natural Pollinators Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Natural Pollinators</Text>
          <Image source={beePollinationImg} style={styles.sectionImage} />
          <TouchableOpacity onPress={() => Linking.openURL('https://www.istockphoto.com/photos/squash-bee')}>
            <Text style={styles.imageCaption}>Source: iStock</Text>
          </TouchableOpacity>
          <Text style={styles.sectionText}>
            Bees and insects are the primary pollinators for gourds. They are attracted by the flowers' bright colors and gather pollen from male flowers, carrying it to female flowers.
          </Text>
        </View>

        {/* Hand-Pollination Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Hand-Pollination</Text>
          <Image source={handPollinationImg} style={styles.sectionImage} />
          <TouchableOpacity onPress={() => Linking.openURL('https://www.greenfusephotos.com/image/I0000H3DXjmvaC4Q')}>
            <Text style={styles.imageCaption}>Source: Green Fuse Photography</Text>
          </TouchableOpacity>
          <Text style={styles.sectionText}>
            When natural pollination is insufficient, hand-pollination can be done by using a small brush or even by gently rubbing a male flower against a female flower. This method helps guarantee that female flowers are fertilized, allowing for a successful harvest.
          </Text>
        </View>

        {/* Visual Differences */}
        <View style={styles.bulletRow}>
          <Icon name="eye-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            The visual differences between male and female flowers make it easy to identify each type, which can be beneficial for both natural and hand-pollination efforts.
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
  content: {
    fontSize: 16,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "justify",
    marginBottom: 16,
    fontWeight: "400",
    width: "100%",
  },
  sectionBlock: {
    width: "100%",
    alignItems: "center",
    marginBottom: 22,
    backgroundColor: "#f7faf7",
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#58b368",
    marginBottom: 6,
    textAlign: "center",
  },
  sectionImage: {
    width: width - 80,
    height: 180,
    borderRadius: 12,
    marginBottom: 6,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  imageCaption: {
    color: "#bbb",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    textDecorationLine: "underline",
    marginBottom: 6,
  },
  sectionText: {
    color: "#38734e",
    fontSize: 15,
    marginBottom: 2,
    textAlign: "left",
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
});

export default PollinationProcess;