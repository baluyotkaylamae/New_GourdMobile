import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  Image
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');

const maleFlowerImages = [
  require('../../../assets/Content/MaleFlower.jpg'),
  require('../../../assets/Content/Male_Ampalaya.jpg'),
  require('../../../assets/Content/UpoMale.jpg'),
];
const femaleFlowerImages = [
  require('../../../assets/Content/FemaleFlower.jpg'),
  require('../../../assets/Content/Ampalaya_female.jpg'),
  require('../../../assets/Content/UpoFemale.jpg'),
];

const maleLabels = ['Sponge Gourd Flower', 'Bitter Gourd Flower', 'Bottle Gourd Flower'];
const femaleLabels = ['Sponge Gourd Flower', 'Bitter Gourd Flower', 'Bottle Gourd Flower'];

const MaleFemaleFlowers = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <ImageBackground source={heroBg} style={styles.hero} resizeMode="cover">
        <View style={styles.overlay} />
        <Text style={styles.heroText}>Male vs Female Flowers</Text>
      </ImageBackground>

      {/* Male Card */}
      <View style={[styles.genderCard, styles.maleCard]}>
        <Text style={styles.genderTitle}>Male Gourd Flowers</Text>
        <View style={{ height: 200, width: width - 64 }}>
          <Swiper
            showsPagination={true}
            activeDotColor="#1E3A8A"
            dotColor="#bcd1f7"
            loop={false}
            horizontal={true}
            scrollEnabled={true}
          >
            {maleFlowerImages.map((img, idx) => (
              <View key={idx} style={styles.carouselImageBlock}>
                <ImageBackground
                  source={img}
                  style={styles.genderImage}
                  imageStyle={{ borderRadius: 10 }}
                >
                  <View style={styles.imageOverlay} />
                  <Text style={styles.carouselImageLabel}>{maleLabels[idx]}</Text>
                </ImageBackground>
              </View>
            ))}
          </Swiper>
        </View>
        <Text style={styles.genderDesc}>
          These flowers are typically smaller and grow on long, slender stems. They produce pollen but do not bear fruit. Male flowers tend to bloom first and in greater numbers than female flowers, ensuring ample pollen is available for pollination.
        </Text>
      </View>

      {/* Female Card */}
      <View style={[styles.genderCard, styles.femaleCard]}>
        <Text style={styles.genderTitle}>Female Gourd Flowers</Text>
        <View style={{ height: 200, width: width - 64 }}>
          <Swiper
            showsPagination={true}
            activeDotColor="#8B004B"
            dotColor="#f7bcd1"
            loop={false}
            horizontal={true}
            scrollEnabled={true}
          >
            {femaleFlowerImages.map((img, idx) => (
              <View key={idx} style={styles.carouselImageBlock}>
                <ImageBackground
                  source={img}
                  style={styles.genderImage}
                  imageStyle={{ borderRadius: 10 }}
                >
                  <View style={styles.imageOverlay} />
                  <Text style={styles.carouselImageLabel}>{femaleLabels[idx]}</Text>
                </ImageBackground>
              </View>
            ))}
          </Swiper>
        </View>
        <Text style={styles.genderDesc}>
          Female flowers are distinguishable by the small, immature fruit (ovary) visible at the base of the bloom. This ovary will develop into a full-sized gourd if the flower is successfully pollinated. Female flowers are often slightly larger and bloom after the initial appearance of male flowers.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.bulletRow}>
          <Icon name="eye-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            The visual differences between male and female flowers make it easy to identify each type, which can be beneficial for both natural and hand-pollination efforts.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FFF8',
  },
  scrollContent: {
    paddingBottom: 34,
    alignItems: 'center',
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
  },
  genderCard: {
    width: width - 32,
    borderRadius: 14,
    padding: 16,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  maleCard: {
    borderColor: '#1E3A8A',
    borderWidth: 2,
    backgroundColor: '#eaf1fb',
  },
  femaleCard: {
    borderColor: '#8B004B',
    borderWidth: 2,
    backgroundColor: '#fbeaf1',
  },
  genderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#38734e',
    marginBottom: 8,
    textAlign: 'center',
  },
  carousel: {
    width: width - 64,
    height: 200,
    marginBottom: 8,
    alignSelf: 'center',
  },
  carouselImageBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 64,
    height: 180,
  },
  genderImage: {
    width: width - 80,
    height: 230,
    borderRadius: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
    borderRadius: 30,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 10,
  },
  carouselImageLabel: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
  },
  genderDesc: {
    color: '#38734e',
    fontSize: 15,
    marginTop: 6,
    textAlign: 'justify',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    marginVertical: 10,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#aee4bb',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 3,
    width: width - 16,
    alignItems: 'center',
    overflow: 'visible',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    color: '#38734e',
    lineHeight: 24,
    textAlign: 'left',
  },
  bold: {
    fontWeight: 'bold',
    color: '#209150',
  },
});

export default MaleFemaleFlowers;
