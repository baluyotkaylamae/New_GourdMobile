import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function Definition() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Icon name="sprout-outline" size={38} color="#58b368" />
          </View>
          <Text style={styles.header}>Introduction</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.content}>
            Gourds belong to the Cucurbitaceae family, which is a large group of plants commonly known as cucurbits. This family includes various species such as pumpkins, squash, melons, and cucumbers. Gourds are vining plants that grow quickly, often spreading with the help of large leaves and tendrils. Their fruits, typically known as "gourds," can have a wide range of shapes and colors. Many gourds are known for their hard, durable rinds, which make them useful beyond culinary applications.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
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
    fontSize: 17,
    color: "#38734e",
    lineHeight: 26,
    textAlign: "left",
    fontWeight: "400",
  },
});

export default Definition;