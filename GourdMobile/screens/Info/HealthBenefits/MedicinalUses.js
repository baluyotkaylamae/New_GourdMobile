import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const heroBg = require('../../../assets/images/pngtree-a-green-colour-bottle-gourd-tip-on-the-sunny-day-in-image_15673491.jpg');

const MedicinalUses = () => {
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
        <Text style={styles.heroText}>Medicinal Uses</Text>
      </ImageBackground>
      <View style={styles.card}>
        <Text style={styles.content}>
          Gourds have been traditionally used in various cultures for their health benefits. Here are some notable medicinal uses:
        </Text>
        <View style={styles.bulletRow}>
          <Icon name="needle" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Blood Sugar Management: </Text>
            Bitter gourd is known for its potential to lower blood sugar levels, making it beneficial for individuals with diabetes. It contains compounds that mimic insulin and may improve glucose uptake.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="food-apple-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Digestive Health: </Text>
            The high fiber content in sponge and bottle gourd aids digestion, prevents constipation, and promotes a healthy gut. Fiber-rich foods can help maintain bowel regularity and reduce the risk of digestive disorders.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="face-woman-outline" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Skin Health: </Text>
            Bitter gourd is often used in traditional medicine for its anti-inflammatory and antibacterial properties. It may help treat skin conditions like acne and psoriasis when consumed or applied topically.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="water" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Hydration and Detoxification: </Text>
            Bottle gourd’s high-water content helps keep the body hydrated, while its diuretic properties may support detoxification processes by promoting urination and flushing out toxins.
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Icon name="scale-bathroom" size={22} color="#58b368" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Weight Management: </Text>
            Due to their low calorie and high fiber content, gourds like sponge and bottle gourd can aid in weight loss by providing satiety without excessive caloric intake.
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

export default MedicinalUses;