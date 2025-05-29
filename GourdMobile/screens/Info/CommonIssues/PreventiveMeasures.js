import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const PreventiveMeasures = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="shield-check" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Common Issues and Pests Affecting Gourds</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Growing gourds can come with a variety of challenges, particularly from pests and diseases that can affect plant health and fruit yield. Understanding these common issues and how to manage them is essential for successful gourd cultivation.
          </Text>
          <View style={styles.bulletRow}>
            <Icon name="alert-circle-outline" size={22} color="#209150" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Preventive Measures</Text>
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="sync" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Crop Rotation: </Text>
              Changing planting locations each season can help disrupt pest life cycles and reduce disease incidence.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="sprout" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Companion Planting: </Text>
              Growing pest-repelling plants alongside gourds can help deter common pests. For example, marigolds are known to repel nematodes and certain beetles.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="eye-outline" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Regular Monitoring: </Text>
              Regularly inspect plants for early signs of pest infestations or disease symptoms. Early detection can lead to more effective control measures.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="broom" size={22} color="#3c8c3d" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Sanitation Practices: </Text>
              Keeping the garden free of debris and removing infected plants promptly can help prevent the spread of diseases.
            </Text>
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
    backgroundColor: "#e6f9ed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#b5f2c9",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#209150",
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
    marginBottom: 12,
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
    color: "#2C482D",
    lineHeight: 24,
    textAlign: "left",
  },
  bold: {
    fontWeight: "bold",
    color: "#209150",
  },
});

export default PreventiveMeasures;