import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AdminWeeklyPollination from './AdminWeeklyPollination';
// import TypiePie from './TypiePie';
import AdminCompletePolination from './AdminCompletedPollination';
import AdminFailedPollination from './AdminFailedPollination';
import AdminMonitoringDashboard from './AdminMonitoringDashboard';

const DashboardScreen = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('monitoring');
  const [items, setItems] = useState([
    { label: 'Monitoring', value: 'monitoring' },
    { label: 'Weekly Pollination', value: 'weekly' },
    { label: 'Completed Pollination', value: 'completed' },
    { label: 'Failed Pollination', value: 'Failed' },
    // { label: 'Typie Pie', value: 'typiepie' },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          containerStyle={styles.dropdown}
          style={styles.dropdownStyle}
          dropDownContainerStyle={styles.dropDownContainerStyle}
        />
      </View>
      {value === 'monitoring' && <AdminMonitoringDashboard/>}
      {value === 'weekly' && <AdminWeeklyPollination />}
      {value === 'completed' && <AdminCompletePolination />}
      {value === 'Failed' && <AdminFailedPollination />}
      {/* {value === 'typiepie' && <TypiePie />} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdown: {
    height: 40,
  },
  dropdownStyle: {
    backgroundColor: '#fafafa',
  },
  dropDownContainerStyle: {
    backgroundColor: '#fafafa',
  },
});

export default DashboardScreen;
