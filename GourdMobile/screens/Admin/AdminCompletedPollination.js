import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const AdminCompletedPollination = () => {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [successRate, setSuccessRate] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    fetchWeeklyStats();
    fetchSuccessRate();
  }, []);

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const fetchWeeklyStats = async () => {
    setLoadingStats(true);
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        setError('No authentication token found');
        return;
      }
      const response = await axios.get(`${baseURL}Monitoring`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const weeklyDataMap = {};

        response.data.forEach((record) => {
          if (record.status !== 'Completed') return;

          const date = new Date(record.dateOfFinalization);
          const weekYear = `${getWeekNumber(date)}-${date.getFullYear()}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';
          const variety = record.variety?.name || 'Unknown Variety';

          if (!weeklyDataMap[plotNo]) {
            weeklyDataMap[plotNo] = {};
          }
          if (!weeklyDataMap[plotNo][gourdType]) {
            weeklyDataMap[plotNo][gourdType] = {};
          }
          if (!weeklyDataMap[plotNo][gourdType][variety]) {
            weeklyDataMap[plotNo][gourdType][variety] = {};
          }

          if (weeklyDataMap[plotNo][gourdType][variety][weekYear]) {
            weeklyDataMap[plotNo][gourdType][variety][weekYear] += record.pollinatedFlowers || 0;
          } else {
            weeklyDataMap[plotNo][gourdType][variety][weekYear] = record.pollinatedFlowers || 0;
          }
        });

        const formattedData = Object.keys(weeklyDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(weeklyDataMap[plotNo]).map((gourdType) => {
            const varietiesData = Object.keys(weeklyDataMap[plotNo][gourdType]).map((variety) => {
              const plotData = Object.keys(weeklyDataMap[plotNo][gourdType][variety]).map((key) => ({
                value: weeklyDataMap[plotNo][gourdType][variety][key],
                dataPointText: weeklyDataMap[plotNo][gourdType][variety][key].toString(),
                label: key
              }));

              plotData.sort((a, b) => {
                const [weekA, yearA] = a.label.split('-');
                const [weekB, yearB] = b.label.split('-');

                return yearA === yearB
                  ? weekA - weekB
                  : yearA - yearB;
              });

              return { variety, data: [{ value: 0, label: '' }, ...plotData] };
            });

            return { gourdType, varietiesData };
          });

          return { plotNo, gourdTypesData };
        });

        setWeeklyStats(formattedData);
        setError(null);
      } else {
        setError('Data is not in expected array format');
      }
    } catch (error) {
      setError('Failed to fetch statistics');
    }
    setLoadingStats(false);
  };

  const fetchSuccessRate = async () => {
    setLoadingRate(true);
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        setError('No authentication token found');
        return;
      }
      const response = await axios.get(`${baseURL}Monitoring`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const completedRecords = response.data.filter(record => record.status === 'Completed');
        const totalPollinatedFlowers = completedRecords.reduce((sum, record) => sum + (record.pollinatedFlowers || 0), 0);
        const totalFruitsHarvested = completedRecords.reduce((sum, record) => sum + (record.fruitsHarvested || 0), 0);

        const rate = totalPollinatedFlowers > 0 ? (totalFruitsHarvested / totalPollinatedFlowers) * 100 : 0;
        setSuccessRate(rate.toFixed(2));
        setError(null);
      } else {
        setError('Data is not in expected array format');
      }
    } catch (error) {
      setError('Failed to fetch success rate');
    }
    setLoadingRate(false);
  };

  return (
    <ScrollView style={styles.bg}>
      <Text style={styles.screenTitle}>
        <Icon name="flower-outline" size={22} color="#0BA5A4" /> Manual Pollination Statistics
      </Text>
      {loadingStats ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0BA5A4" /></View>
      ) : weeklyStats.length === 0 ? (
        <Text style={styles.noDataText}>No completed pollination records found.</Text>
      ) : weeklyStats.map((plotData, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <Icon name="format-list-bulleted-type" size={20} color="#4B5563" />
              <Text style={styles.header}>Plot #{plotData.plotNo}</Text>
            </View>
            {plotData.gourdTypesData.map((gourdData, gourdIndex) => (
              <View key={gourdIndex}>
                <Text style={styles.subHeader}>
                  <Icon name="leaf" size={14} color="#0BA5A4" /> {gourdData.gourdType}
                </Text>
                {gourdData.varietiesData.map((varietyData, varietyIndex) => (
                  <View key={varietyIndex} style={{ marginBottom: 14 }}>
                    <Text style={styles.varietyHeader}>
                      <Icon name="tag-outline" size={13} color="#888" /> {varietyData.variety}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.chartContainer}>
                        <LineChart
                          initialSpacing={0}
                          data={varietyData.data}
                          spacing={44}
                          textColor1="#0BA5A4"
                          textShiftY={-8}
                          textShiftX={-10}
                          textFontSize={12}
                          thickness={4}
                          hideRules
                          yAxisColor="#0BA5A4"
                          showVerticalLines
                          verticalLinesColor="rgba(14,164,164,0.18)"
                          xAxisColor="#0BA5A4"
                          color="#0BA5A4"
                          xAxisLabelTextStyle={{ color: '#3d3d3d', fontSize: 9 }}
                          yAxisTextStyle={{ color: '#3d3d3d', fontSize: 9 }}
                          noOfSections={4}
                          startAtZero
                          adjustForEmptyLabel={true}
                          width={Math.max(screenWidth, 80 + varietyData.data.length * 34)}
                        />
                      </View>
                    </ScrollView>
                  </View>
                ))}
              </View>
            ))}
            {error && <Text style={styles.error}>{error}</Text>}
          </Card.Content>
        </Card>
      ))}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.successRow}>
            <Icon name="star-circle" size={20} color="#ffc107" style={{ marginRight: 8 }} />
            <Text style={styles.header}>Success Rate of Manual Pollination</Text>
          </View>
          {loadingRate ? (
            <ActivityIndicator size="small" color="#28A745" style={{ marginVertical: 16 }} />
          ) : (
            <Text style={styles.successRate}>
              {successRate !== null ? `${successRate}%` : 'Loading...'}
            </Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
        </Card.Content>
      </Card>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: { backgroundColor: "#f6fafd" },
  screenTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#0BA5A4",
    textAlign: "center",
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  card: {
    margin: 9,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0BA5A4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e6eced',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginLeft: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 7,
    color: '#2A4747',
    marginLeft: 5,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#0BA5A4',
    marginTop: 2,
    marginLeft: 9,
  },
  varietyHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginBottom: 3,
    marginLeft: 16
  },
  chartContainer: {
    paddingVertical: 6,
    paddingRight: 8,
    paddingLeft: 2,
    marginBottom: 2,
    marginTop: 2,
    minHeight: 155,
    backgroundColor: "#fafdff",
    borderRadius: 10,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    marginLeft: 2,
    justifyContent: 'center'
  },
  successRate: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#28A745',
    marginTop: 7,
    marginBottom: 13,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 34,
    marginBottom: 12,
    fontStyle: "italic"
  },
  error: {
    color: '#F44336',
    textAlign: 'center',
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600"
  },
  loadingContainer: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default AdminCompletedPollination;