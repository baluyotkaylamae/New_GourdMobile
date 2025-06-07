import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons, FontAwesome5, Ionicons, Entypo } from "@expo/vector-icons";

// Styles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#9EBC8A",
    paddingTop: 38,
    paddingHorizontal: 0,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 22,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f6f78",
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 25,
    color: "#FAF6E9",
    marginBottom: 8,
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  menuContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 38,
    paddingHorizontal: 14,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 26,
    marginVertical: 10,
    width: "94%",
    shadowColor: "#207868",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e9f7f3",
  },
  icon: {
    marginRight: 15,
    backgroundColor: "#eafaf2",
    padding: 8,
    borderRadius: 14,
  },
  buttonText: {
    color: "#207868",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "capitalize",
  },
});

// Button definitions (with icons)
const BUTTONS = [
  {
    label: "View Categories",
    iconComponent: <MaterialIcons name="category" size={24} color="#207868" style={styles.icon} />,
    nav: "Categories",
  },
  // {
  //   label: "View Gourd Types",
  //   iconComponent: <FontAwesome5 name="leaf" size={22} color="#207868" style={styles.icon} />,
  //   nav: "GourdType",
  // },
  // {
  //   label: "View Gourd Varieties",
  //   iconComponent: <FontAwesome5 name="seedling" size={22} color="#207868" style={styles.icon} />,
  //   nav: "GourdVarieties",
  // },
  {
    label: "Manage Users",
    iconComponent: <Ionicons name="people" size={24} color="#207868" style={styles.icon} />,
    nav: "Users",
  },
  {
    label: "Archived User",
    iconComponent: <Ionicons name="archive" size={24} color="#207868" style={styles.icon} />,
    nav: "ArchiveUser",
  },
  {
    label: "Dashboard",
    iconComponent: <MaterialIcons name="dashboard" size={24} color="#207868" style={styles.icon} />,
    nav: "Dashboard",
  },
  {
    label: "Post Management",
    iconComponent: <Entypo name="clipboard" size={24} color="#207868" style={styles.icon} />,
    nav: "PostManagement",
  },
  {
    label: "Archived Posts",
    iconComponent: <Entypo name="archive" size={24} color="#207868" style={styles.icon} />,
    nav: "ArchivePost",
  },
];

const AdminMenu = ({ navigation }) => {
  return (
    <View style={styles.screen}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, Admin! Select an area to manage.</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {BUTTONS.map((btn, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(btn.nav)}
          >
            {btn.iconComponent}
            <Text style={styles.buttonText}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default AdminMenu;