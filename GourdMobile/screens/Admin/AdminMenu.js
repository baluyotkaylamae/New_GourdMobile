import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons, Ionicons, Entypo } from "@expo/vector-icons";

// Styles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 20,
  },
  headerSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  iconContainer: {
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 10,
    marginRight: 16,
  },
  buttonText: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  chevron: {
    color: "#94a3b8",
  },
});

// Button definitions (with icons)
const BUTTONS = [
  {
    label: "View Categories",
    iconName: "category",
    iconLib: MaterialIcons,
    nav: "Categories",
  },
  {
    label: "Manage Users",
    iconName: "people",
    iconLib: Ionicons,
    nav: "Users",
  },
  {
    label: "Archived Users",
    iconName: "archive",
    iconLib: Ionicons,
    nav: "ArchiveUser",
  },
  {
    label: "Dashboard",
    iconName: "dashboard",
    iconLib: MaterialIcons,
    nav: "Dashboard",
  },
  {
    label: "Post Management",
    iconName: "clipboard",
    iconLib: Entypo,
    nav: "PostManagement",
  },
  {
    label: "Archived Posts",
    iconName: "archive",
    iconLib: Entypo,
    nav: "ArchivePost",
  },
];

const AdminMenu = ({ navigation }) => {
  return (
    <View style={styles.screen}>
      <View style={styles.headerSection}>
        <Text style={styles.subtitle}>
          Welcome back! Select an area to manage the application.
        </Text>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {BUTTONS.map((btn, idx) => {
          const IconComponent = btn.iconLib;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.button}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(btn.nav)}
            >
              <View style={styles.iconContainer}>
                <IconComponent name={btn.iconName} size={20} color="#16a34a" />
              </View>
              <Text style={styles.buttonText}>{btn.label}</Text>
              <MaterialIcons name="chevron-right" size={20} style={styles.chevron} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default AdminMenu;