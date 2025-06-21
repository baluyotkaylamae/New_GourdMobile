import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import WeeklyPollination from './WeeklyPollination';
import TypiePie from './TypiePie';
import CompletePolination from './CompletedPolination';
import FailedPollination from './FailedPollination';

const DashboardScreen = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('weekly');
  const [items, setItems] = useState([
    { label: 'Weekly Pollination', value: 'weekly' },
    { label: 'Completed Pollination', value: 'completed' },
    { label: 'Failed Pollination', value: 'failed' },
    { label: 'Pollination by Type', value: 'typiepie' },
  ]);
  
  // Create refs for scrollable components
  const scrollViewRef = useRef(null);

  const handleValueChange = (newValue) => {
    setValue(newValue);
    // Scroll to top when changing views
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={handleValueChange}
          setItems={setItems}
          containerStyle={styles.dropdown}
          style={styles.dropdownStyle}
          dropDownContainerStyle={styles.dropDownContainerStyle}
          listMode="SCROLLVIEW"
          zIndex={1000}
          zIndexInverse={3000}
          placeholder="Select Dashboard View"
          searchable={false}
        />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {value === 'weekly' && <WeeklyPollination />}
        {value === 'completed' && <CompletePolination />}
        {value === 'failed' && <FailedPollination />}
        {value === 'typiepie' && <TypiePie />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  dropdownContainer: {
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000, // Ensures dropdown stays on top
  },
  contentContainer: {
    flex: 1,
    zIndex: 1, // Lower than dropdown
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  dropdown: {
    height: 50,
  },
  dropdownStyle: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  dropDownContainerStyle: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 5,
    zIndex: 1000, // Ensures dropdown stays on top
  },
});

export default DashboardScreen;