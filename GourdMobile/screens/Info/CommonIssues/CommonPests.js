import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const Pests = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="ladybug" size={38} color="#e7b347" />
          </View>
          <Text style={styles.header}>Common Issues and Pests Affecting Gourds</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Growing gourds can come with a variety of challenges, particularly from pests and diseases that can affect plant health and fruit yield. Understanding these common issues and how to manage them is essential for successful gourd cultivation.
          </Text>
          <View style={styles.bulletRow}>
            <Icon name="alert-circle-outline" size={22} color="#b68400" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Common Pests</Text>
            </Text>
          </View>
          {/* Aphids */}
          <View style={styles.bulletRow}>
            <Icon name="bug-outline" size={22} color="#b68400" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Aphids:</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="information-outline" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Description: Small, soft-bodied insects that cluster on new growth and under leaves.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="close-octagon-outline" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Impacts: They feed on plant sap, weakening the plant and potentially spreading viral diseases.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="spray" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Management: Introduce natural predators like ladybugs or use insecticidal soap to control infestations.</Text>
          </View>
          {/* Cucumber Beetles */}
          <View style={styles.bulletRow}>
            <Icon name="bug-outline" size={22} color="#b68400" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Cucumber Beetles:</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="information-outline" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Description: Yellow or green beetles with black stripes or spots.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="close-octagon-outline" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Impacts: They damage leaves and flowers and can spread bacterial wilt disease.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="spray" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Management: Crop rotation, introducing beneficial insects, and using traps can help control their populations.</Text>
          </View>
          {/* Fruit Flies */}
          <View style={styles.bulletRow}>
            <Icon name="bug-outline" size={22} color="#b68400" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Fruit Flies:</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="information-outline" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Description: Small flies that lay eggs in ripe fruit.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="close-octagon-outline" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Impacts: Larvae cause decay and can lead to significant crop loss.</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="spray" size={18} color="#e7b347" style={styles.infoIcon} />
            <Text style={styles.infoText}>Management: Use bait traps and remove overripe fruits to prevent infestations.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: "#fff7e6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#ffe3b5",
    shadowOpacity: 0.19,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#b68400",
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
    color: "#b68400",
    lineHeight: 24,
    textAlign: "left",
  },
  bold: {
    fontWeight: "bold",
    color: "#b68400",
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
});

export default Pests;