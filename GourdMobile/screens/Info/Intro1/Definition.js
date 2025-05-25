import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function Definition() {
  return (
    <ScrollView style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FFF8", // lighter, fresh green-tinted
    padding: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 12,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f9ed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#b5f2c9",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3
  },
  header: {
    fontSize: 30,
    fontWeight: "700",
    color: "#209150",
    textAlign: "left",
    fontFamily: "serif",
    letterSpacing: 0.3,
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
    fontSize: 19,
    color: "#38734e",
    lineHeight: 29,
    textAlign: "left",
    fontFamily: "serif",
    letterSpacing: 0.02,
    fontWeight: "400",
  },
});

export default Definition;