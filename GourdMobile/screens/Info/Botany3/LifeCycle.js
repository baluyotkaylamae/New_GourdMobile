import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');
const lifecycleImg = require('../../../assets/Content/lifecycle.jpg');

const LifeCycle = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Section (scrolls with content) */}
      <ImageBackground
        source={heroBg}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <Text style={styles.heroText}>Life Cycle</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Image source={lifecycleImg} style={styles.lifecycleImage} />
        <Text style={styles.imageCaption}>Source: Your Image Source Here</Text>
        <Text style={styles.content}>
          Gourd plants have a well-defined life cycle that includes four primary stages, each crucial for the plant’s growth and fruit production:
        </Text>

        <View style={styles.bulletRow}>
          <Icon name="seed" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Germination: </Text>
            Seeds sprout under warm, moist conditions. Small roots and shoots emerge as the plant begins to establish itself.
          </Text>
        </View>

        <View style={styles.bulletRow}>
          <Icon name="sprout" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Vegetative Growth: </Text>
            The young plant quickly develops stems, leaves, and tendrils, forming a dense vine that spreads over time. This stage focuses on building a robust structure for supporting future flowers and fruits.
          </Text>
        </View>

        <View style={styles.bulletRow}>
          <Icon name="flower-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Flowering: </Text>
            The plant begins to produce flowers, which appear in abundance. The first to bloom are male flowers, followed by female flowers after a short period. This stage is essential for setting up the conditions needed for pollination.
          </Text>
        </View>

        <View style={styles.bulletRow}>
          <Icon name="fruit-cherries" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Pollination and Fruiting: </Text>
            During pollination, pollen from male flowers is transferred to female flowers by insects or through hand-pollination. Once pollination is successful, the female flowers develop into fruits, which continue to grow and mature over several weeks. The fruits are ready for harvest when they reach full size or when they dry, depending on the gourd type.
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
  lifecycleImage: {
    width: width - 48, // add some margin to fit inside the card
    height: 220,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: "contain", // ensures the whole image is visible
    backgroundColor: "#222",
    alignSelf: "center",
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

export default LifeCycle;